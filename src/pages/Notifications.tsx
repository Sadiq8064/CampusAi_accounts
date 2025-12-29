import { useState, useEffect } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Plus, Calendar, Clock, Upload, Edit2, Trash2, MoreVertical, Loader2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { GlowingCard } from "@/components/ui/glowing-card";
import { DateTimePicker } from "@/components/ui/date-time-picker";
import { BackgroundGlow } from "@/components/ui/background-glow";
import { authApi } from "@/lib/api";

type ContentType = "notice" | "faq" | "impData";

interface ContentItem {
  id: string; // Using filename or imagekitFileId as id
  title: string; // Filename will be title for now as per API structure
  content: string; // Not really in API, but keeping for UI consistency if needed or just showing filename
  uploadDate: string;
  deleteDate?: string;
  autoDelete?: boolean;
  type: ContentType;
  fileName: string;
  imagekitUrl?: string; // Add URL for rendering/downloading
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
  // const [title, setTitle] = useState(""); // API only takes filename, so we might map title -> filename
  // const [content, setContent] = useState(""); // API doesn't seem to store text content, only files? Re-reading specs.
  // Spec says: upload file. It returns filename, imagekitUrl. It doesn't seem to support text body.
  // We will assume "Information Broadcast" is primarily file-based (PDFs, etc) as per API response "filename": "exam_schedule.pdf".

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [userDepartment, setUserDepartment] = useState<string>("Department");

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
      // Map API response to UI items
      // data = { notice: [], faq: [], impData: [] }
      const newItems: ContentItem[] = [];

      const mapToItem = (file: any, type: ContentType): ContentItem => ({
        id: file.imagekitFileId || file.filename,
        title: file.filename,
        content: "File uploaded via portal", // Placeholder
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
      // toast({ title: "Error", description: "Failed to fetch uploads", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const [isExtracting, setIsExtracting] = useState(false);

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      toast({ title: "Error", description: "Please select a file to upload", variant: "destructive" });
      return;
    }

    const email = localStorage.getItem("accountEmail");
    if (!email) return;

    setIsExtracting(true);

    try {
      // 1. Extract text from the selected file
      // Dynamic import to avoid SSR/build issues if any, though standard import is fine usually.
      // We'll use the imported function.
      const { extractTextFromFile } = await import("@/lib/file-extractor");
      const extractedText = await extractTextFromFile(selectedFile);

      // 2. Convert extracted text to a .txt file blob
      const textBlob = new Blob([extractedText], { type: "text/plain" });

      // 3. Convert Blob to Base64 for API
      const reader = new FileReader();
      reader.readAsDataURL(textBlob);

      reader.onload = async () => {
        const base64String = reader.result as string;
        const rawBase64 = base64String.split(',')[1];

        // 4. Create new filename with .txt extension
        const originalName = selectedFile.name;
        const nameWithoutExt = originalName.substring(0, originalName.lastIndexOf('.')) || originalName;
        const newFileName = `${nameWithoutExt}.txt`;

        try {
          // 5. Upload the converted .txt file
          await authApi.uploadFile(email, activeTab, newFileName, rawBase64);

          toast({
            title: "Success",
            description: `File converted and uploaded as ${newFileName}`,
          });

          setIsDialogOpen(false);
          setSelectedFile(null);
          // fetchUploads(); // Not needed if we trust the refresh in useEffect or manual call
          fetchUploads();
        } catch (error) {
          console.error("Upload error:", error);
          toast({ title: "Error", description: "Failed to upload file", variant: "destructive" });
        } finally {
          setIsExtracting(false);
        }
      };

      reader.onerror = () => {
        throw new Error("Failed to read converted text blob");
      };

    } catch (error) {
      console.error("Extraction/Process error:", error);
      toast({
        title: "Extraction Failed",
        description: error instanceof Error ? error.message : "Could not extract text from file",
        variant: "destructive"
      });
      setIsExtracting(false);
    }
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
      case "notice": return "Upload Notice";
      case "faq": return "Upload FAQ Document";
      case "impData": return "Upload Important Data";
      default: return "Upload File";
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
                                    onClick={() => handleDelete(item.fileName)} // Use filename for delete
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
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogContent className="max-w-2xl bg-background/95 backdrop-blur-xl border-border shadow-2xl">
                <DialogHeader>
                  <DialogTitle>{getDialogTitle()}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAddItem} className="space-y-6">
                  <div className="space-y-2">
                    <Label>Upload File *</Label>
                    <div className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${selectedFile ? 'border-green-500 bg-green-50/10' : 'border-border hover:border-primary'}`}>
                      <input
                        type="file"
                        id="file-upload"
                        className="hidden"
                        onChange={handleFileUpload}
                        required
                      />
                      <label htmlFor="file-upload" className="cursor-pointer w-full h-full block">
                        <Upload className={`h-8 w-8 mx-auto mb-2 ${selectedFile ? 'text-green-500' : 'text-muted-foreground'}`} />
                        <p className={`text-sm ${selectedFile ? 'text-green-600 font-medium' : 'text-muted-foreground'}`}>
                          {selectedFile ? selectedFile.name : "Drag and drop or click to select"}
                        </p>
                      </label>
                    </div>
                  </div>

                  <Button type="submit" className="w-full" disabled={isExtracting}>
                    {isExtracting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Converting & Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Upload File
                      </>
                    )}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Notifications;
