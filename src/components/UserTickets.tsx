import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User } from "lucide-react";
import { GlowingCard } from "@/components/ui/glowing-card";

interface Ticket {
    id: string;
    citizenName: string;
    email: string;
    problem: string;
    location: string;
    time: string;
    status: "pending" | "completed";
    solution?: string;
}

const mockTickets: Ticket[] = [
    {
        id: "T001",
        citizenName: "Rajesh Kumar",
        email: "rajesh.kumar@email.com",
        problem: "Grade discrepancy in Calculus II mid-term results. Submitted re-evaluation request.",
        location: "Examination Cell",
        time: "2024-01-15 10:30 AM",
        status: "pending",
    },
    {
        id: "T002",
        citizenName: "Priya Sharma",
        email: "priya.sharma@email.com",
        problem: "Wi-Fi connectivity issue in Girls Hostel Block A, Room 304.",
        location: "Hostel Block A",
        time: "2024-01-15 09:15 AM",
        status: "pending",
    },
    {
        id: "T003",
        citizenName: "Amit Patel",
        email: "amit.patel@email.com",
        problem: "Library fine waiver request approved.",
        location: "Central Library",
        time: "2024-01-14 02:20 PM",
        status: "completed",
        solution: "Fine waived due to medical emergency. Book returned.",
    },
    {
        id: "T006",
        citizenName: "Owais Aminbhavi",
        email: "owais.aminbhavi@email.com",
        problem: "Makeup lab session request for Physics Lab.",
        location: "Physics Department",
        time: "2024-01-20 08:00 AM",
        status: "pending",
    },
    {
        id: "T007",
        citizenName: "Owais Aminbhavi",
        email: "owais.aminbhavi@email.com",
        problem: "College Bus Pass renewal payment issue.",
        location: "Transport Dept",
        time: "2024-01-18 06:30 PM",
        status: "completed",
        solution: "Payment processed manually. Pass renewed.",
    },
    {
        id: "T008",
        citizenName: "Owais Aminbhavi",
        email: "owais.aminbhavi@email.com",
        problem: "Request for Bonafide Certificate for internship.",
        location: "Administrative Office",
        time: "2024-01-22 10:15 AM",
        status: "pending",
    },
    {
        id: "T009",
        citizenName: "Owais Aminbhavi",
        email: "owais.aminbhavi@email.com",
        problem: "Classroom projector in Room 402 not working.",
        location: "Academic Block B",
        time: "2024-01-21 09:45 AM",
        status: "pending",
    },
    {
        id: "T010",
        citizenName: "Owais Aminbhavi",
        email: "owais.aminbhavi@email.com",
        problem: "Lost ID card reporting and duplicate request.",
        location: "Security Office",
        time: "2024-01-15 05:00 PM",
        status: "completed",
        solution: "New ID card issued. Fee paid.",
    },
    {
        id: "T011",
        citizenName: "Owais Aminbhavi",
        email: "owais.aminbhavi@email.com",
        problem: "Request to change elective subject.",
        location: "Dean's Office",
        time: "2024-01-23 02:30 PM",
        status: "pending",
    }
];

const UserTickets = () => {
    // Filter tickets for the current user (simulated)
    const currentUserEmail = "owais.aminbhavi@email.com";
    const userTickets = mockTickets.filter(ticket => ticket.email === currentUserEmail);

    const pendingTickets = userTickets.filter((t) => t.status === "pending");
    const completedTickets = userTickets.filter((t) => t.status === "completed");

    const TicketCard = ({ ticket }: { ticket: Ticket }) => (
        <GlowingCard className="h-full flex flex-col p-0">
            <CardContent className="p-4 flex flex-col flex-1">
                <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <p className="font-semibold text-sm">{ticket.citizenName}</p>
                            <p className="text-xs text-muted-foreground">{ticket.email}</p>
                        </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                        {ticket.id}
                    </Badge>
                </div>

                <div className="mb-4 flex-1">
                    <p className="text-sm text-foreground line-clamp-3">
                        {ticket.problem}
                    </p>
                    {ticket.solution && (
                        <div className="mt-3 p-3 bg-muted/30 rounded-md border border-border/50">
                            <p className="text-xs font-semibold text-primary mb-1">Solution:</p>
                            <p className="text-xs text-muted-foreground">{ticket.solution}</p>
                        </div>
                    )}
                </div>

                <div className="flex items-end justify-between mt-auto pt-2">
                    <p className="text-xs text-muted-foreground">{ticket.location}</p>
                    <p className="text-xs text-muted-foreground">{ticket.time}</p>
                </div>
            </CardContent>
        </GlowingCard>
    );

    return (
        <div className="w-full max-w-7xl mx-auto p-6 h-full overflow-y-auto">


            <Tabs defaultValue="pending" className="w-full">
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
    );
};

export default UserTickets;
