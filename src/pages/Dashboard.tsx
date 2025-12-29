import { useState, useEffect } from "react";
import { SidebarProvider, SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Clock, CheckCircle2, AlertCircle, Star } from "lucide-react";
import { useDashboardSSE } from "@/hooks/useDashboardSSE";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SettingsDialog } from "@/components/SettingsDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Settings } from "lucide-react";
import LiveChatPanel from "@/components/LiveChatPanel";
import { GlowingCard } from "@/components/ui/glowing-card";
import { BackgroundGlow } from "@/components/ui/background-glow";
import { UnifiedHeader } from "@/components/UnifiedHeader";

const formatDepartment = (dept: string) => {
  return dept.split("-").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
};

// Simulation Data - University Context
const SIMULATED_USERS = [
  { name: "Rahul Verma", avatar: "RV" },
  { name: "Sneha Gupta", avatar: "SG" },
  { name: "Amit Patel", avatar: "AP" },
  { name: "Pooja Naik", avatar: "PN" },
  { name: "Vikram Singh", avatar: "VS" },
  { name: "Anjali Desai", avatar: "AD" },
];

const SIMULATED_QA = [
  {
    q: "How do I apply for the merit scholarship?",
    a: "You can apply for the merit scholarship via the 'Scholarships' tab. Ensure you upload your last semester's grade card and income certificate."
  },
  {
    q: "When will the exam timetable be released?",
    a: "The tentative timetable for the upcoming semester exams will be published on the notice board by next Monday."
  },
  {
    q: "Wi-Fi is not working in the Girls Hostel Block A.",
    a: "We apologize for the inconvenience. I've raised a ticket (TKT-8821) with the IT department. It should be resolved within 4 hours."
  },
  {
    q: "How can I pay my semester fees online?",
    a: "Semester fees can be paid via the 'Payments' section. We accept credit cards, net banking, and UPI. Please use your USN as reference."
  },
  {
    q: "Is the library open 24/7 during exams?",
    a: "Yes, the Central Library reading room will be open 24/7 starting two weeks prior to the commencement of exams."
  },
  {
    q: "Projector in Lecture Hall 3 is flickering.",
    a: "Thank you for reporting. I've logged a maintenance request (CMP-9920). Tech support will check it during the lunch break."
  },
  {
    q: "Where can I download my bonafide certificate?",
    a: "Bonafide certificates can be requested and downloaded from the 'Documents' section. It usually takes 24 hours for approval."
  },
  {
    q: "Can I change my elective subject now?",
    a: "The deadline for elective changes was last Friday. You will need to submit a special request to the Dean's office."
  },
  {
    q: "When is the deadline for hostel fee payment?",
    a: "The last date to pay hostel fees without a fine is the 15th of this month."
  },
  {
    q: "How do I book the seminar hall for a club event?",
    a: "Club event bookings can be made through the 'Facilities' portal. You need approval from the Faculty Advisor first."
  },
  {
    q: "Bus No. 4 was late today.",
    a: "We have noted your complaint. We will check with the transport manager regarding the delay."
  },
  {
    q: "What is the procedure for re-evaluation?",
    a: "You can apply for re-evaluation through the 'Exam Section' portal within 3 days of result announcement."
  },
  {
    q: "Is there a fine for late book return?",
    a: "Yes, a fine of Rs. 5 per day is applicable for late return of library books."
  },
  {
    q: "How do I register for the hackathon?",
    a: "Registration for the annual hackathon is open on the 'Events' page. Teams of up to 4 members are allowed."
  },
  {
    q: "Mess food quality was poor today.",
    a: "Please submit formal feedback under 'Mess Committee'. We conduct weekly quality checks."
  }
];

interface Message {
  id: string;
  user: {
    name: string;
    avatar: string;
  };
  text: string;
  aiResponse: string;
  timestamp: Date;
  isExpanded?: boolean;
}

const DashboardContent = () => {
  const { toggleSidebar, open } = useSidebar();
  const [activeInfoTab, setActiveInfoTab] = useState("notice");
  const [userLocation, setUserLocation] = useState<{ state: string; city: string } | null>(null);
  const [userDepartment, setUserDepartment] = useState<string>("Administration");

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [profile, setProfile] = useState({
    name: "Admin User",
    email: "admin@university.edu",
    phone: "+91 98765 43210",
    department: userDepartment,
    location: "Main Campus, Block A"
  });

  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProfileOpen(false);
    // In a real app, save to backend here
  };

  useEffect(() => {
    // Load from new account object
    const accountStr = localStorage.getItem("account");
    if (accountStr) {
      try {
        const account = JSON.parse(accountStr);
        setUserDepartment(account.accountName);
        setProfile(prev => ({
          ...prev,
          name: account.accountName,
          email: account.accountEmail,
          department: account.accountName
        }));
      } catch (e) {
        console.error("Failed to parse account data", e);
      }
    }

    // Legacy/Fallback
    const userState = localStorage.getItem("userState");
    const userCity = localStorage.getItem("userCity");
    const dept = localStorage.getItem("userDepartment");
    if (userState && userCity) {
      setUserLocation({ state: userState, city: userCity });
    }
    if (dept && !accountStr) { // Only if no account object
      const formattedDept = formatDepartment(dept);
      setUserDepartment(formattedDept);
      setProfile(prev => ({ ...prev, department: formattedDept }));
    }
  }, []);

  // SSE Integration
  const { counts: sseCounts, queries: sseQueries, uploads: sseUploads, feedbacks: sseFeedbacks } = useDashboardSSE(profile.email);

  // Chat Expanded State
  const [expandedChatIds, setExpandedChatIds] = useState<Set<string>>(new Set());

  const handleOpenResponse = (id: string) => {
    setExpandedChatIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Convert SSE queries to Message format for LiveChatPanel
  const chatMessages: Message[] = sseQueries.map((q, idx) => {
    // Parser for "10:15 AM" format to Date object
    const parseTime = (timeStr: string) => {
      const d = new Date();
      const [time, modifier] = timeStr.split(' ');
      if (!time || !modifier) return d;
      let [hours, minutes] = time.split(':');
      let h = parseInt(hours, 10);
      const m = parseInt(minutes, 10);
      if (modifier === 'PM' && h < 12) h += 12;
      if (modifier === 'AM' && h === 12) h = 0;
      d.setHours(h, m);
      return d;
    };

    return {
      id: `sse-msg-${idx}`,
      user: {
        name: q.studentName,
        avatar: q.studentName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
      },
      text: q.question,
      aiResponse: q.answer,
      timestamp: parseTime(q.time),
      isExpanded: expandedChatIds.has(`sse-msg-${idx}`)
    };
  });

  const stats = [
    {
      title: "Bot Queries",
      value: sseCounts?.totalQueries?.toString() || "0",
      icon: FileText,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      title: "Today's Tickets",
      value: sseCounts?.todayTickets?.toString() || "0",
      icon: Clock,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
    {
      title: "Pending Tickets",
      value: sseCounts?.pendingTickets?.toString() || "0",
      icon: AlertCircle,
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
    },
    {
      title: "Resolved Tickets",
      value: sseCounts?.resolvedTickets?.toString() || "0",
      icon: CheckCircle2,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      title: "Complaints",
      value: "7", // Fixed as requested
      icon: FileText,
      color: "text-red-500",
      bgColor: "bg-red-500/10",
    },
  ];

  const feedbacks = sseFeedbacks.length > 0 ? sseFeedbacks.map(f => ({
    name: f.studentName,
    feedback: f.feedbackText,
    rating: f.rating,
    date: f.time,
  })) : [ // Fallback / Empty state
    {
      name: "Waiting for feedback...",
      feedback: "No feedback received yet.",
      rating: 0,
      date: ""
    }
  ];



  return (
    <>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />

        <div className="flex-1 flex flex-col">
          <UnifiedHeader
            title="Dashboard"
            onSidebarToggle={toggleSidebar}
            isSidebarOpen={open}
            showProfile={true}
            onSettingsClick={() => setIsSettingsOpen(true)}
          />

          <main className="flex-1 p-6 animate-fade-in h-[calc(100vh-4rem)] flex flex-col overflow-hidden relative">
            <BackgroundGlow />
            <div className="flex flex-col h-full gap-6 relative z-10">

              {/* Stats Grid */}
              <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
                {stats.map((stat) => (
                  <GlowingCard key={stat.title}>
                    <CardHeader className="flex flex-row items-center justify-between pb-2 p-0">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        {stat.title}
                      </CardTitle>
                      <div className={`p-2 rounded-xl ${stat.bgColor}`}>
                        <stat.icon className={`h-4 w-4 ${stat.color}`} />
                      </div>
                    </CardHeader>
                    <CardContent className="p-0 pt-4">
                      <div className="text-3xl font-bold tracking-tight">{stat.value}</div>
                    </CardContent>
                  </GlowingCard>
                ))}
              </div>

              {/* Information & Feedback Section */}
              <div className="grid gap-6 lg:grid-cols-3 flex-1 min-h-0">
                {/* Live Chat Section */}
                <div className="lg:col-span-1 lg:h-0 lg:min-h-full">
                  {/* Note: LiveChatPanel needs to handle "Student" vs "Citizen" terminology internally if it displays it */}
                  <LiveChatPanel messages={chatMessages} onOpenResponse={handleOpenResponse} />
                </div>

                {/* Right Column - Info & Reviews */}
                <div className="lg:col-span-2 flex flex-col gap-6 h-full">
                  <GlowingCard containerClassName="h-fit flex-1 min-h-0">
                    <CardHeader className="p-0 pb-4">
                      <CardTitle>Information Uploaded</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 h-[calc(100%-3rem)] overflow-y-auto pr-2">
                      <Tabs value={activeInfoTab} onValueChange={setActiveInfoTab}>
                        <TabsList className="grid w-full grid-cols-3">
                          <TabsTrigger value="notice">Notices</TabsTrigger>
                          <TabsTrigger value="faq">FAQ</TabsTrigger>
                          <TabsTrigger value="important">Important</TabsTrigger>
                        </TabsList>
                        <TabsContent value="notice" className="space-y-4 mt-4">
                          <div className="space-y-3">
                            {sseUploads?.notice.map((item, i) => (
                              <div key={i} className="border-b border-border/50 pb-3 last:border-0 last:pb-0">
                                <p className="text-sm font-medium">• {item}</p>
                                <p className="text-xs text-muted-foreground mt-1">Uploaded document</p>
                              </div>
                            )) || <p className="text-sm text-muted-foreground">No notices yet.</p>}
                          </div>
                        </TabsContent>
                        <TabsContent value="faq" className="space-y-4 mt-4">
                          <div className="space-y-3">
                            {sseUploads?.faq.map((item, i) => (
                              <div key={i} className="border-b border-border/50 pb-3 last:border-0 last:pb-0">
                                <p className="text-sm font-medium">{item}</p>
                                <p className="text-xs text-muted-foreground mt-1">FAQ Item</p>
                              </div>
                            )) || <p className="text-sm text-muted-foreground">No FAQs yet.</p>}
                          </div>
                        </TabsContent>
                        <TabsContent value="important" className="space-y-4 mt-4">
                          <div className="space-y-3">
                            {sseUploads?.impData.map((item, i) => (
                              <div key={i} className="border-b border-border/50 pb-3 last:border-0 last:pb-0">
                                <p className="text-sm font-medium">{item}</p>
                                <p className="text-xs text-muted-foreground mt-1">Important Data</p>
                              </div>
                            )) || <p className="text-sm text-muted-foreground">No important data yet.</p>}
                          </div>
                        </TabsContent>
                      </Tabs>
                    </CardContent>
                  </GlowingCard>

                  {/* Latest Reviews / Feedback */}
                  <GlowingCard containerClassName="h-fit flex-1 min-h-0">
                    <CardHeader className="p-0 pb-4">
                      <CardTitle>Student Feedback</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 h-[calc(100%-3rem)] overflow-y-auto pr-2">
                      <div className="space-y-4">
                        {feedbacks.map((feedback, index) => (
                          <div key={index} className="border-b border-border/50 pb-4 last:border-0 last:pb-0">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                  <span className="text-xs font-bold">
                                    {feedback.name.split(" ").map(n => n[0]).join("")}
                                  </span>
                                </div>
                                <div>
                                  <p className="text-sm font-medium">{feedback.name}</p>
                                  <p className="text-xs text-muted-foreground">{feedback.date}</p>
                                </div>
                              </div>
                              <div className="flex gap-0.5">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-4 w-4 ${i < feedback.rating
                                      ? "fill-primary text-primary"
                                      : "text-muted"
                                      }`}
                                  />
                                ))}
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground">{feedback.feedback}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </GlowingCard>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* Profile Edit Dialog */}
      <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleProfileUpdate} className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input
                id="email"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phone" className="text-right">
                Phone
              </Label>
              <Input
                id="phone"
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="location" className="text-right">
                Location
              </Label>
              <Input
                id="location"
                value={profile.location}
                onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="flex justify-end gap-3 mt-4">
              <Button type="button" variant="outline" onClick={() => setIsProfileOpen(false)}>Cancel</Button>
              <Button type="submit">Save Changes</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      <SettingsDialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen} />
    </>
  );
};

const Dashboard = () => {
  return (
    <SidebarProvider>
      <DashboardContent />
    </SidebarProvider>
  );
};

export default Dashboard;
