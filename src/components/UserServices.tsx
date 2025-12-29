import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Zap, HardHat, MessageSquarePlus, Laptop, Radio, Wrench, Bot, Brain, Ruler } from "lucide-react";
import { useState } from "react";
import { FeedbackDialog } from "./FeedbackDialog";
import { GlowingCard } from "@/components/ui/glowing-card";

const services = [
    {
        id: "dept-cse",
        title: "CSE",
        description: "Computer Science & Engineering - Programming, Algorithms, and Software Development.",
        icon: Laptop,
        color: "text-blue-500",
        bgColor: "bg-blue-500/10",
    },
    {
        id: "dept-ece",
        title: "ECE",
        description: "Electronics & Communication Engineering - Circuits, Signals, and Communication Systems.",
        icon: Radio,
        color: "text-green-500",
        bgColor: "bg-green-500/10",
    },
    {
        id: "dept-eee",
        title: "EEE",
        description: "Electrical & Electronics Engineering - Power Systems, Machines, and Control.",
        icon: Zap,
        color: "text-yellow-500",
        bgColor: "bg-yellow-500/10",
    },
    {
        id: "dept-mech",
        title: "Mechanical",
        description: "Mechanical Engineering - Thermodynamics, Fluid Mechanics, and Manufacturing.",
        icon: Wrench,
        color: "text-red-500",
        bgColor: "bg-red-500/10",
    },
    {
        id: "dept-civil",
        title: "Civil",
        description: "Civil Engineering - Structural, Geotechnical, and Transportation Engineering.",
        icon: HardHat,
        color: "text-orange-500",
        bgColor: "bg-orange-500/10",
    },
    {
        id: "dept-automation",
        title: "Automation & Robotics",
        description: "Robotics, Control Systems, and Industrial Automation.",
        icon: Bot,
        color: "text-purple-500",
        bgColor: "bg-purple-500/10",
    },
    {
        id: "dept-csai",
        title: "CSAI",
        description: "Computer Science & AI - Artificial Intelligence, Machine Learning, and Data Science.",
        icon: Brain,
        color: "text-pink-500",
        bgColor: "bg-pink-500/10",
    },
    {
        id: "dept-arch",
        title: "Architecture",
        description: "Architecture & Planning - Sustainable Design, Urban Planning, and Construction.",
        icon: Ruler,
        color: "text-teal-500",
        bgColor: "bg-teal-500/10",
    },
];

const UserServices = () => {
    const [selectedService, setSelectedService] = useState<{ id: string; title: string } | null>(null);

    return (
        <div className="w-full max-w-7xl mx-auto p-6 h-full overflow-y-auto">


            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {services.map((service) => (
                    <GlowingCard key={service.id} className="group p-6 h-full flex flex-col justify-between min-h-[220px]">
                        <div className="space-y-4">
                            <CardHeader className="p-0 relative z-10">
                                <div className="flex items-center gap-4 mb-2">
                                    <div className={`p-3 rounded-xl ${service.bgColor} transition-transform group-hover:scale-110`}>
                                        <service.icon className={`h-6 w-6 ${service.color}`} />
                                    </div>
                                    <CardTitle className="text-xl font-bold leading-tight">{service.title}</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0 relative z-10">
                                <CardDescription className="text-base leading-relaxed line-clamp-3">
                                    {service.description}
                                </CardDescription>
                            </CardContent>
                        </div>

                        <div className="pt-6 mt-auto relative z-10">
                            <Button
                                className="w-full gap-2 font-semibold shadow-lg hover:shadow-xl transition-all h-10 text-sm"
                                variant="secondary"
                                onClick={() => setSelectedService({ id: service.id, title: service.title })}
                            >
                                <MessageSquarePlus className="h-4 w-4" />
                                Give Feedback
                            </Button>
                        </div>
                    </GlowingCard>
                ))}
            </div>

            <FeedbackDialog
                open={!!selectedService}
                onOpenChange={(open) => !open && setSelectedService(null)}
                service={selectedService}
            />
        </div>
    );
};

export default UserServices;
