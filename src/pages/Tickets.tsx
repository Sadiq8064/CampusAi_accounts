import { useState, useEffect } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Card, CardContent } from "@/components/ui/card";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { User, Sparkles, TrendingDown, BarChart3, CheckCircle2, Clock } from "lucide-react";
import { GlowingCard } from "@/components/ui/glowing-card";
import { BackgroundGlow } from "@/components/ui/background-glow";
import { authApi } from "@/lib/api";
import { toast } from "sonner";

interface Ticket {
  id: string;
  studentName: string;
  email: string;
  problem: string;
  location: string;
  time: string;
  status: "pending" | "completed";
  solution?: string;
}

const smartSolveTickets = [
  {
    id: 1,
    problem: "Projector Display Issue - The projector in Lecture Hall 3 has a persistent purple tint and flickers intermittently. It is making it difficult for students to read the slides during lectures. Please check the VGA/HDMI cable connections or replace the bulb.",
    location: "Lecture Hall 3"
  },
  { id: 2, problem: "Water Cooler Leaking on 2nd Floor Corridor", location: "Main Building, 2nd Floor" },
  { id: 3, problem: "Broken Student Bench in Class 405", location: "ECE Dept, 4th Floor" },
  { id: 4, problem: "Lab PC 24 Not Booting (Blue Screen)", location: "Computer Lab 2" },
  { id: 5, problem: "Mess Food Hygiene Complaint - Insects found", location: "Boys Hostel Mess" },
  { id: 6, problem: "AC Not Cooling in Seminar Hall A", location: "Seminar Hall A" },
];

interface SmartSolveData {
  accountEmail: string;
  status: string;
  summary: {
    totalOriginalTickets: number;
    totalClusters: number;
    reductionPercentage: number;
    ticketsToSolve: number;
  };
  clusteredQuestions: Array<{
    uniqueId: number;
    question: string;
    category: string;
    affectedTickets: number;
    ticketIds: string[];
  }>;
  createdAt: string;
  updatedAt: string;
}

const Tickets = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [solution, setSolution] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [userDepartment, setUserDepartment] = useState<string>("Department");
  const [smartSolveDialogOpen, setSmartSolveDialogOpen] = useState(false);
  const [smartSolveScreenOpen, setSmartSolveScreenOpen] = useState(false);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [wizardSolutions, setWizardSolutions] = useState<string[]>(new Array(6).fill(""));
  const [activeTab, setActiveTab] = useState("pending");
  const [smartSolveData, setSmartSolveData] = useState<SmartSolveData | null>(null);
  const [smartSolveSolutions, setSmartSolveSolutions] = useState<Record<number, string>>({});
  const [isLoadingSmartSolve, setIsLoadingSmartSolve] = useState(false);

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
        setUserDepartment(dept.split("-").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" "));
      }
    }
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    setIsLoading(true);
    const email = localStorage.getItem("accountEmail");
    if (!email) {
      setIsLoading(false);
      return;
    }

    try {
      const data = await authApi.getTickets(email);

      const mapApiTicket = (t: any): Ticket => ({
        id: t.ticketId,
        studentName: t.studentEmail.split('@')[0], // Derive name from email
        email: t.studentEmail,
        problem: t.problem,
        location: "Campus", // Default as API doesn't provide location
        time: new Date(t.createdAt).toLocaleString(),
        status: t.status,
        solution: t.solution
      });

      const pending = (data.pending || []).map(mapApiTicket);
      const completed = (data.completed || []).map(mapApiTicket);

      setTickets([...pending, ...completed]);
    } catch (error) {
      console.error("Failed to fetch tickets:", error);
      toast.error("Failed to load tickets");
    } finally {
      setIsLoading(false);
    }
  };

  const pendingTickets = tickets.filter((t) => t.status === "pending");
  const completedTickets = tickets.filter((t) => t.status === "completed");

  const handleSolveClick = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setSolution(ticket.solution || "");
    setDialogOpen(true);
  };

  const handleSubmitSolution = async () => {
    if (selectedTicket && solution.trim()) {
      try {
        await authApi.solveTicket(selectedTicket.id, solution.trim());
        toast.success("Ticket solved successfully");

        // Optimistic update or refresh
        fetchTickets();

        setDialogOpen(false);
        setSolution("");
        setSelectedTicket(null);
      } catch (error) {
        console.error("Solve error:", error);
        toast.error("Failed to submit solution");
      }
    }
  };

  const handleSmartSolve = async () => {
    setIsLoadingSmartSolve(true);
    const email = localStorage.getItem("accountEmail");
    
    if (!email) {
      toast.error("Account email not found");
      setIsLoadingSmartSolve(false);
      return;
    }

    try {
      const data = await authApi.getSmartSolveTickets(email);
      setSmartSolveData(data);
      setSmartSolveSolutions({});
      setSmartSolveScreenOpen(true);
    } catch (error) {
      console.error("Failed to fetch SmartSolve data:", error);
      toast.error("Failed to load SmartSolve data");
    } finally {
      setIsLoadingSmartSolve(false);
    }
  };

  const handleSmartSolveSubmit = async () => {
    if (!smartSolveData) return;

    const email = localStorage.getItem("accountEmail");
    if (!email) {
      toast.error("Account email not found");
      return;
    }

    // Check if all solutions are provided
    const allSolutionsProvided = smartSolveData.clusteredQuestions.every(
      (q) => smartSolveSolutions[q.uniqueId]?.trim()
    );

    if (!allSolutionsProvided) {
      toast.error("Please provide solutions for all questions");
      return;
    }

    try {
      const solutions = smartSolveData.clusteredQuestions.map((q) => ({
        uniqueId: q.uniqueId,
        solution: smartSolveSolutions[q.uniqueId],
      }));

      await authApi.solveSmartTickets(email, solutions);
      toast.success(`Successfully solved ${smartSolveData.summary.totalOriginalTickets} tickets!`);
      setSmartSolveScreenOpen(false);
      setSmartSolveData(null);
      setSmartSolveSolutions({});
      fetchTickets();
    } catch (error) {
      console.error("Failed to solve smart tickets:", error);
      toast.error("Failed to submit solutions");
    }
  };

  const handleStartWizard = () => {
    setSmartSolveDialogOpen(false);
    setWizardOpen(true);
    setCurrentStep(0);
    setWizardSolutions(new Array(6).fill(""));
  };

  const handleWizardNext = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleWizardPrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleWizardSubmit = () => {
    // In a real implementation this would batch solve
    // For now we just close wizard as mock
    setWizardOpen(false);
    setSmartSolveDialogOpen(false);
    toast.success("Batch solving processing (feature mocked)");
  };

  const handleSolutionChange = (value: string) => {
    const newSolutions = [...wizardSolutions];
    newSolutions[currentStep] = value;
    setWizardSolutions(newSolutions);
  };

  const TicketCard = ({ ticket }: { ticket: Ticket }) => (
    <GlowingCard className="h-full flex flex-col p-0 transition-all hover:bg-muted/30">
      <CardContent className="p-5 flex flex-col flex-1 gap-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-10 w-10 shrink-0 rounded-full bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center shadow-inner">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-sm truncate">{ticket.studentName}</p>
              <p className="text-xs text-muted-foreground truncate">{ticket.email}</p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <Badge variant="outline" className="shrink-0 text-[10px] font-mono bg-background/50 text-muted-foreground border-border/50">
              #{ticket.id.length > 8 ? ticket.id.slice(-6) : ticket.id}
            </Badge>
            {ticket.status === 'completed' && (
              <span className="text-[10px] text-green-500 font-medium">Completed</span>
            )}
          </div>
        </div>

        {/* Divider */}
        <div className="h-px w-full bg-gradient-to-r from-transparent via-border/60 to-transparent" />

        {/* Body */}
        <div className="flex-1">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">Issue Reported</span>
            <p className="text-sm text-foreground/90 leading-relaxed line-clamp-3 font-medium">
              "{ticket.problem}"
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 mt-auto bg-muted/20 -mx-5 -mb-5 p-4 border-t border-border/30">
          <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
            <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
            <span className="truncate max-w-[140px]">{ticket.location}</span>
          </div>

          <div className="text-xs text-muted-foreground">
            {ticket.time.split(',')[0]}
          </div>

          {ticket.status === "pending" && (
            <Button
              size="sm"
              onClick={() => handleSolveClick(ticket)}
              className="h-7 px-4 ml-3 text-xs shadow-sm hover:shadow-md transition-all active:scale-95"
            >
              Solve
            </Button>
          )}
        </div>
      </CardContent>
    </GlowingCard>
  );



  if (wizardOpen) {
    return (
      <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-xl flex flex-col items-center justify-center p-4 animate-in fade-in duration-300">
        <div className="w-full max-w-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center p-3 rounded-full bg-primary/10 mb-2 shadow-sm ring-1 ring-primary/20">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">Smart Solve Assistant</h2>
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <span className="text-sm font-medium">Ticket {currentStep + 1} of 6</span>
            </div>
            {/* Progress Bar */}
            <div className="w-full max-w-xs mx-auto h-1.5 bg-muted rounded-full overflow-hidden mt-4">
              <div
                className="h-full bg-primary transition-all duration-500 ease-in-out"
                style={{ width: `${((currentStep + 1) / 6) * 100}%` }}
              />
            </div>
          </div>

          <Card className="border-border/50 shadow-2xl bg-card/80 backdrop-blur-md overflow-hidden">
            <CardContent className="p-0">
              <div className="p-6 bg-muted/30 border-b border-border/50">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Problem Statement</span>
                  <Badge variant="outline" className="font-mono text-xs bg-background/50">
                    ID: T10{smartSolveTickets[currentStep].id}
                  </Badge>
                </div>
                <div className="relative pl-4 border-l-4 border-primary/50 py-1">
                  {/* Quote Icon Background */}
                  <span className="absolute -top-2 -left-3 text-6xl text-primary/5 font-serif select-none pointer-events-none">"</span>
                  <p className="text-lg font-medium leading-relaxed text-foreground/90 italic">
                    {smartSolveTickets[currentStep].problem}
                  </p>
                </div>

              </div>

              <div className="p-6 space-y-4 bg-card">
                <div className="space-y-2">
                  <Label htmlFor={`solution-${currentStep}`} className="text-sm font-semibold flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                    Proposed Solution
                  </Label>
                  <Textarea
                    id={`solution-${currentStep}`}
                    placeholder="Type your professional resolution here..."
                    value={wizardSolutions[currentStep]}
                    onChange={(e) => handleSolutionChange(e.target.value)}
                    className="min-h-[150px] text-base p-4 resize-none transition-all focus-visible:ring-2 focus-visible:ring-primary/20 border-muted-foreground/20 hover:border-primary/50 bg-background"
                    autoFocus
                  />
                  <p className="text-xs text-muted-foreground text-right">{wizardSolutions[currentStep].length} characters</p>
                </div>

                <div className="flex justify-between pt-2">
                  <Button
                    variant="ghost"
                    onClick={handleWizardPrevious}
                    disabled={currentStep === 0}
                    className="gap-2"
                  >
                    Previous
                  </Button>

                  {currentStep < 5 ? (
                    <Button
                      onClick={handleWizardNext}
                      disabled={!wizardSolutions[currentStep].trim()}
                      className="px-8 shadow-md hover:shadow-lg transition-all"
                    >
                      Next Ticket
                    </Button>
                  ) : (
                    <Button
                      onClick={handleWizardSubmit}
                      disabled={!wizardSolutions[currentStep].trim()}
                      className="px-8 bg-green-600 hover:bg-green-700 shadow-md hover:shadow-green-900/20 transition-all"
                    >
                      Finish Smart Solve
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="text-center">
            <Button variant="link" className="text-muted-foreground/60 hover:text-destructive transition-colors text-xs" onClick={() => setWizardOpen(false)}>
              Exit Smart Solve Mode
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />

        <div className="flex-1 flex flex-col">
          <header className="sticky top-0 z-50 flex h-16 items-center gap-4 border-b bg-background/60 px-6 glass">
            <SidebarTrigger />
            <h1 className="text-2xl font-bold tracking-tight">Tickets</h1>
            <div className="flex-1" />
            <ThemeToggle />
          </header>

          <main className="flex-1 p-6 relative">
            <BackgroundGlow />
            <div className="space-y-6 mb-20 relative z-10">

              <Tabs defaultValue="pending" className="w-full" onValueChange={setActiveTab}>
                <TabsList className="grid w-full max-w-md grid-cols-2">
                  <TabsTrigger value="pending">
                    Pending ({pendingTickets.length})
                  </TabsTrigger>
                  <TabsTrigger value="completed">
                    Completed ({completedTickets.length})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="pending" className="space-y-4 mt-6">
                  {pendingTickets.length > 0 ? (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {pendingTickets.map((ticket) => (
                        <TicketCard key={ticket.id} ticket={ticket} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      No pending tickets
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="completed" className="space-y-4 mt-6">
                  {completedTickets.length > 0 ? (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {completedTickets.map((ticket) => (
                        <TicketCard key={ticket.id} ticket={ticket} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      No completed tickets
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>

            {/* Smart Solve Button */}
            {activeTab === "pending" && pendingTickets.length >= 4 && (
              <div className="relative z-10">
                <Button
                  onClick={handleSmartSolve}
                  disabled={isLoadingSmartSolve}
                  className="fixed bottom-8 right-8 h-14 px-6 shadow-lg hover:shadow-xl transition-all hover:scale-105"
                  size="lg"
                >
                  <Sparkles className="mr-2 h-5 w-5" />
                  {isLoadingSmartSolve ? "Loading..." : "Smart Solve"}
                </Button>
              </div>
            )}


          </main>
        </div>
      </div>

      {/* Solve Ticket Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl glass-panel">
          <DialogHeader>
            <DialogTitle>Ticket Details - {selectedTicket?.id}</DialogTitle>
          </DialogHeader>

          {selectedTicket && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 pb-4 border-b">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="font-semibold">{selectedTicket.studentName}</p>
                  <p className="text-sm text-muted-foreground">{selectedTicket.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Ticket ID</Label>
                  <p className="font-medium">{selectedTicket.id}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Time</Label>
                  <p className="font-medium">{selectedTicket.time}</p>
                </div>
              </div>

              <div>
                <Label className="text-muted-foreground">Location</Label>
                <p className="font-medium">{selectedTicket.location}</p>
              </div>

              <div>
                <Label className="text-muted-foreground">Problem</Label>
                <p className="text-sm mt-1">{selectedTicket.problem}</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="solution">Solution *</Label>
                <Textarea
                  id="solution"
                  placeholder="Enter the solution details..."
                  value={solution}
                  onChange={(e) => setSolution(e.target.value)}
                  className="min-h-[120px]"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setDialogOpen(false);
                    setSolution("");
                    setSelectedTicket(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmitSolution}
                  disabled={!solution.trim()}
                >
                  Submit
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Smart Solve Full Screen */}
      {smartSolveScreenOpen && smartSolveData && (
        <div className="fixed inset-0 z-50 bg-background">
          <BackgroundGlow />
          <div className="h-full flex flex-col relative z-10">
            {/* Header */}
            <div className="border-b backdrop-blur-xl bg-background/80 sticky top-0 z-20">
              <div className="container mx-auto px-6 py-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary/10 rounded-xl">
                      <Sparkles className="h-7 w-7 text-primary" />
                    </div>
                    <div>
                      <h1 className="text-3xl font-bold">Smart Solve</h1>
                      <p className="text-sm text-muted-foreground mt-1">AI-powered ticket clustering</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSmartSolveScreenOpen(false);
                        setSmartSolveData(null);
                        setSmartSolveSolutions({});
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSmartSolveSubmit}
                      disabled={smartSolveData.clusteredQuestions.some(q => !smartSolveSolutions[q.uniqueId]?.trim())}
                      className="px-8 shadow-lg hover:shadow-xl transition-all"
                      size="lg"
                    >
                      <CheckCircle2 className="mr-2 h-5 w-5" />
                      Submit All Solutions
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              <div className="container mx-auto px-6 py-8 space-y-8">
                {/* Analytics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <GlowingCard className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-2">Total Tickets</p>
                        <p className="text-4xl font-bold">{smartSolveData.summary.totalOriginalTickets}</p>
                      </div>
                      <div className="p-3 bg-primary/10 rounded-xl">
                        <BarChart3 className="h-8 w-8 text-primary" />
                      </div>
                    </div>
                  </GlowingCard>

                  <GlowingCard className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-2">Clusters</p>
                        <p className="text-4xl font-bold">{smartSolveData.summary.totalClusters}</p>
                      </div>
                      <div className="p-3 bg-primary/10 rounded-xl">
                        <CheckCircle2 className="h-8 w-8 text-primary" />
                      </div>
                    </div>
                  </GlowingCard>

                  <GlowingCard className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-2">Reduction</p>
                        <p className="text-4xl font-bold">{smartSolveData.summary.reductionPercentage.toFixed(1)}%</p>
                      </div>
                      <div className="p-3 bg-primary/10 rounded-xl">
                        <TrendingDown className="h-8 w-8 text-primary" />
                      </div>
                    </div>
                  </GlowingCard>

                  <GlowingCard className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-2">To Solve</p>
                        <p className="text-4xl font-bold">{smartSolveData.summary.ticketsToSolve}</p>
                      </div>
                      <div className="p-3 bg-primary/10 rounded-xl">
                        <Clock className="h-8 w-8 text-primary" />
                      </div>
                    </div>
                  </GlowingCard>
                </div>

                {/* Questions Section */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <h2 className="text-2xl font-bold">Clustered Questions</h2>
                    <Badge className="px-3 py-1">
                      {smartSolveData.clusteredQuestions.length} Questions
                    </Badge>
                  </div>

                  <div className="grid gap-6">
                    {smartSolveData.clusteredQuestions.map((cluster) => (
                      <GlowingCard key={cluster.uniqueId} className="p-6 space-y-4">
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center font-bold text-lg text-primary">
                            #{cluster.uniqueId}
                          </div>
                          <div className="flex-1 space-y-3">
                            <div className="flex flex-wrap items-center gap-2">
                              <Badge variant="outline">
                                {cluster.category}
                              </Badge>
                              <Badge variant="secondary">
                                {cluster.affectedTickets} ticket{cluster.affectedTickets > 1 ? 's' : ''}
                              </Badge>
                            </div>
                            
                            <div className="pl-4 border-l-2 border-primary/30 py-1">
                              <p className="text-base font-medium leading-relaxed">
                                {cluster.question}
                              </p>
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor={`solution-${cluster.uniqueId}`} className="text-sm font-semibold">
                                Solution <span className="text-destructive">*</span>
                              </Label>
                              <Textarea
                                id={`solution-${cluster.uniqueId}`}
                                placeholder="Enter your solution here..."
                                value={smartSolveSolutions[cluster.uniqueId] || ""}
                                onChange={(e) => setSmartSolveSolutions(prev => ({
                                  ...prev,
                                  [cluster.uniqueId]: e.target.value
                                }))}
                                className="min-h-[120px] resize-y"
                              />
                            </div>
                          </div>
                        </div>
                      </GlowingCard>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}


    </SidebarProvider >
  );
};

export default Tickets;
