import { useState, useEffect, useRef } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Plus, Calendar, Upload, Trash2, MoreVertical, Loader2, FileText, X, CheckCircle2, AlertCircle, FolderInput } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { GlowingCard } from "@/components/ui/glowing-card";
import { BackgroundGlow } from "@/components/ui/background-glow";
import { authApi } from "@/lib/api";
import { extractTextFromFile } from "@/lib/file-extractor";

type ContentType = "notice" | "faq" | "impData";

interface ContentItem {
  id: string;
  title: string;
  uploadDate: string;
  type: ContentType;
  fileName: string;
  imagekitUrl?: string;
}

interface FileQueueItem {
  id: string;
  file: File;
  status: "pending" | "extracting" | "uploading" | "completed" | "error";
  error?: string;
}

const formatDepartment = (dept: string) => {
  return dept.split("-").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
};

const Notifications = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<ContentType>("notice");
  const [items, setItems] = useState<ContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [userDepartment, setUserDepartment] = useState<string>("Department");

  // Multi-file upload states
  const [fileQueue, setFileQueue] = useState<FileQueueItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const folderInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const accountStr = localStorage.getItem("account");
    if (accountStr) {
      try {
        const account = JSON.parse(accountStr);
        if (account.accountName) {
          setUserDepartment(account.accountName);
        }
      } catch (e) {
        console.error("Failed to parse account", e);
      }
    } else {
      const dept = localStorage.getItem("userDepartment");
      if (dept) {
        setUserDepartment(formatDepartment(dept));
      }
    }
    fetchUploads();
  }, [activeTab]);

  const fetchUploads = async () => {
    setIsLoading(true);
    const email = localStorage.getItem("accountEmail");
    if (!email) {
      setIsLoading(false);
      return;
    }

    try {
      const data = await authApi.getUploads(email);
      const newItems: ContentItem[] = [];

      const mapToItem = (file: any, type: ContentType): ContentItem => ({
        id: file.imagekitFileId || file.filename,
        title: file.filename,
        uploadDate: file.uploadedAt,
        type: type,
        fileName: file.filename,
        imagekitUrl: file.imagekitUrl
      });

      if (data.notice) data.notice.forEach((f: any) => newItems.push(mapToItem(f, "notice")));
      if (data.faq) data.faq.forEach((f: any) => newItems.push(mapToItem(f, "faq")));
      if (data.impData) data.impData.forEach((f: any) => newItems.push(mapToItem(f, "impData")));

      setItems(newItems);
    } catch (error) {
      console.error("Fetch uploads error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const allowedExtensions = ['.pdf', '.txt', '.docx', '.ppt', '.pptx', '.json', '.png', '.jpg', '.jpeg'];

  const validateFile = (file: File): boolean => {
    const name = file.name.toLowerCase();
    // Block code files
    if (name.endsWith('.js') || name.endsWith('.ts') || name.endsWith('.py') || name.endsWith('.c') || name.endsWith('.cpp') || name.endsWith('.java') || name.endsWith('.html') || name.endsWith('.css')) return false;
    // Block media
    if (name.endsWith('.mp3') || name.endsWith('.wav') || name.endsWith('.mp4') || name.endsWith('.mov') || name.endsWith('.avi')) return false;

    return allowedExtensions.some(ext => name.endsWith(ext));
  };

  const handleFilesSelected = (files: FileList | null) => {
    if (!files) return;

    const newItems: FileQueueItem[] = [];
    Array.from(files).forEach(file => {
      if (validateFile(file)) {
        // Check for duplicates
        if (!fileQueue.some(item => item.file.name === file.name && item.file.size === file.size)) {
          newItems.push({
            id: Math.random().toString(36).substring(7),
            file: file,
            status: "pending"
          });
        }
      } else {
        // Optionally toast for invalid files, but might be too noisy for folders
        // console.warn("Skipped invalid file:", file.name);
      }
    });

    setFileQueue(prev => [...prev, ...newItems]);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFilesSelected(e.target.files);
    e.target.value = ''; // Reset input
  };

  const handleRemoveFile = (id: string) => {
    if (isProcessing) return;
    setFileQueue(prev => prev.filter(item => item.id !== id));
  };

  const clearCompleted = () => {
    setFileQueue(prev => prev.filter(item => item.status !== "completed"));
  };

  const processQueue = async () => {
    const email = localStorage.getItem("accountEmail");
    if (!email) return;

    setIsProcessing(true);

    // Process files one by one
    // We iterate through the queue, finding the next pending item
    // We need to use a loop controlled by the current state, but state updates are async.
    // So we'll iterate a snapshot of IDs.

    const pendingIds = fileQueue.filter(item => item.status === "pending").map(item => item.id);

    for (const id of pendingIds) {
      // Find current file in queue (it might have been removed via UI, though we disabled remove while processing)
      // Actually we just use the ID to lookup
      const item = fileQueue.find(i => i.id === id);
      if (!item) continue;

      try {
        setFileQueue(prev => prev.map(i => i.id === id ? { ...i, status: "extracting" } : i));

        // 1. Extract Text
        const extractedText = await extractTextFromFile(item.file);

        // 2. Prepare Blob
        const textBlob = new Blob([extractedText], { type: "text/plain" });
        const reader = new FileReader();

        const base64Promise = new Promise<string>((resolve, reject) => {
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
        });
        reader.readAsDataURL(textBlob);
        const base64String = await base64Promise;
        const rawBase64 = base64String.split(',')[1];

        // 3. Prepare Filename
        const originalName = item.file.name;
        const nameWithoutExt = originalName.substring(0, originalName.lastIndexOf('.')) || originalName;
        const newFileName = `${nameWithoutExt}.txt`;

        setFileQueue(prev => prev.map(i => i.id === id ? { ...i, status: "uploading" } : i));

        // 4. Upload
        await authApi.uploadFile(email, activeTab, newFileName, rawBase64);

        setFileQueue(prev => prev.map(i => i.id === id ? { ...i, status: "completed" } : i));

      } catch (error) {
        console.error(`Error processing ${item.file.name}:`, error);
        setFileQueue(prev => prev.map(i => i.id === id ? { ...i, status: "error", error: error instanceof Error ? error.message : "Failed" } : i));
      }
    }

    setIsProcessing(false);
    toast({ title: "Queue Finished", description: "All files have been processed." });
    fetchUploads();
  };

  const handleDelete = async (filename: string) => {
    const email = localStorage.getItem("accountEmail");
    if (!email) return;

    try {
      await authApi.deleteFile(email, activeTab, filename);
      setItems(items.filter(item => item.fileName !== filename));
      toast({ title: "Deleted", description: "File has been removed." });
    } catch (error) {
      console.error("Delete error:", error);
      toast({ title: "Error", description: "Failed to delete file", variant: "destructive" });
    }
  };

  const filteredItems = items.filter(item => item.type === activeTab);

  const getButtonLabel = () => {
    switch (activeTab) {
      case "notice": return "Add New Notice";
      case "faq": return "Add New FAQ";
      case "impData": return "Add Important Data";
      default: return "Add New";
    }
  };

  const getDialogTitle = () => {
    switch (activeTab) {
      case "notice": return "Upload Notices";
      case "faq": return "Upload FAQs";
      case "impData": return "Upload Important Data";
      default: return "Upload Files";
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-subtle">
        <AppSidebar />
        <main className="flex-1 relative">
          <div className="opacity-10">
            <BackgroundGlow />
          </div>
          <div className="relative z-10 min-h-full flex flex-col">
            <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/60 px-6 glass">
              <SidebarTrigger />
              <h1 className="text-2xl font-bold tracking-tight">Knowledge Base</h1>
              <div className="flex-1" />
              <ThemeToggle />
            </header>
            <div className="p-6 space-y-6">
              <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as ContentType)}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="notice">Notice</TabsTrigger>
                  <TabsTrigger value="faq">FAQ</TabsTrigger>
                  <TabsTrigger value="impData">Important Data</TabsTrigger>
                </TabsList>

                <TabsContent value={activeTab} className="space-y-4 mt-6">
                  {isLoading ? (
                    <div className="flex justify-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : filteredItems.length === 0 ? (
                    <GlowingCard>
                      <CardContent className="flex flex-col items-center justify-center py-12">
                        <p className="text-muted-foreground">No {activeTab}s uploaded yet</p>
                      </CardContent>
                    </GlowingCard>
                  ) : (
                    <div className="grid gap-4">
                      {filteredItems.map((item) => (
                        <GlowingCard key={item.id} className="p-0">
                          <CardContent className="p-6">
                            <div className="flex items-start justify-between">
                              <div className="flex-1 space-y-2">
                                <div className="flex items-center gap-3">
                                  <h3 className="font-semibold text-lg">{item.fileName}</h3>
                                  {item.type === 'impData' && <Badge variant="secondary">Important</Badge>}
                                </div>
                                <p className="text-muted-foreground text-sm">Document uploaded ({item.type})</p>
                                <div className="flex gap-4 text-xs text-muted-foreground mt-3">
                                  <div className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    <span>Uploaded: {new Date(item.uploadDate).toLocaleDateString()}</span>
                                  </div>
                                  {item.imagekitUrl && (
                                    <a href={item.imagekitUrl} target="_blank" rel="noreferrer" className="text-primary hover:underline">
                                      View File
                                    </a>
                                  )}
                                </div>
                              </div>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem
                                    className="text-destructive"
                                    onClick={() => handleDelete(item.fileName)}
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </CardContent>
                        </GlowingCard>
                      ))}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>

            {/* Floating Action Button */}
            <Button
              onClick={() => setIsDialogOpen(true)}
              className="fixed bottom-8 right-8 h-14 px-6 rounded-full shadow-lg"
              size="lg"
            >
              <Plus className="h-5 w-5 mr-2" />
              {getButtonLabel()}
            </Button>

            {/* Upload Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={isProcessing ? undefined : setIsDialogOpen}>
              <DialogContent className="max-w-2xl bg-background/95 backdrop-blur-xl border-border shadow-2xl">
                <DialogHeader>
                  <DialogTitle>{getDialogTitle()}</DialogTitle>
                </DialogHeader>

                <div className="grid grid-cols-2 gap-4">
                  <div className="relative border-2 border-dashed rounded-lg p-6 text-center hover:bg-muted/50 transition-colors cursor-pointer">
                    <input
                      type="file"
                      id="multi-file-upload"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      onChange={handleFileUpload}
                      multiple
                      disabled={isProcessing}
                    />
                    <Upload className="h-8 w-8 mx-auto mb-2 text-primary" />
                    <p className="text-sm font-medium">Select Files</p>
                    <p className="text-xs text-muted-foreground">Multiple allowed</p>
                  </div>

                  <div className="relative border-2 border-dashed rounded-lg p-6 text-center hover:bg-muted/50 transition-colors cursor-pointer">
                    <input
                      type="file"
                      id="folder-upload"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      onChange={handleFileUpload}
                      // @ts-ignore
                      webkitdirectory=""
                      directory=""
                      disabled={isProcessing}
                    />
                    <FolderInput className="h-8 w-8 mx-auto mb-2 text-primary" />
                    <p className="text-sm font-medium">Upload Folder</p>
                    <p className="text-xs text-muted-foreground">Crawl subfolders</p>
                  </div>
                </div>

                <div className="mt-4 space-y-3 max-h-[300px] overflow-y-auto pr-2">
                  {fileQueue.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      No files selected
                    </div>
                  )}
                  {fileQueue.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 rounded-lg border bg-card/50">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <FileText className="h-5 w-5 shrink-0 text-muted-foreground" />
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{item.file.name}</p>
                          <p className="text-xs text-muted-foreground">{(item.file.size / 1024).toFixed(1)} KB</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {item.status === "pending" && <Badge variant="outline">Pending</Badge>}
                        {item.status === "extracting" && <Badge variant="secondary" className="animate-pulse">Extracting...</Badge>}
                        {item.status === "uploading" && <Badge variant="secondary" className="animate-pulse">Uploading...</Badge>}
                        {item.status === "completed" && <Badge className="bg-green-500 hover:bg-green-600"><CheckCircle2 className="h-3 w-3 mr-1" /> Done</Badge>}
                        {item.status === "error" && <Badge variant="destructive"><AlertCircle className="h-3 w-3 mr-1" /> Error</Badge>}

                        {!isProcessing && (
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => handleRemoveFile(item.id)}>
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-3 justify-end pt-4">
                  <Button variant="outline" onClick={clearCompleted} disabled={isProcessing || !fileQueue.some(i => i.status === "completed")}>
                    Clear Completed
                  </Button>
                  <Button onClick={processQueue} disabled={isProcessing || fileQueue.filter(i => i.status === "pending").length === 0}>
                    {isProcessing ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Processing Queue...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Start Upload ({fileQueue.filter(i => i.status === "pending").length})
                      </>
                    )}
                  </Button>
                </div>

              </DialogContent>
            </Dialog>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Notifications;
