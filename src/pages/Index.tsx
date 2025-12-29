import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Bot, MessageCircle, Ticket, Zap, Shield, GraduationCap } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { GlowingCard } from "@/components/ui/glowing-card";

const Index = () => {
    const navigate = useNavigate();

    const features = [
        {
            icon: Bot,
            title: "AI-Powered Campus Assistant",
            description: "Custom AI agents trained on your university's complete knowledge base - academics, admissions, policies, and procedures.",
        },
        {
            icon: Ticket,
            title: "Smart Ticket Management",
            description: "Automatic ticket creation and intelligent routing to specific departments when AI cannot resolve queries.",
        },
        {
            icon: Zap,
            title: "Real-Time Analytics",
            description: "Comprehensive dashboard with live insights into student queries, response times, and department performance.",
        },
        {
            icon: Shield,
            title: "Secure & Private",
            description: "Enterprise-grade security with isolated databases. Your data stays yours - no cross-university access.",
        },
        {
            icon: MessageCircle,
            title: "24/7 Student Support",
            description: "AI agents available round-the-clock to answer questions about courses, schedules, scholarships, and campus life.",
        },
        {
            icon: CheckCircle2,
            title: "Multi-Agent Routing",
            description: "Intelligent query routing to specialized department agents ensuring accurate, relevant responses.",
        },
    ];

    return (
        <div className="min-h-screen bg-background text-foreground overflow-x-hidden selection:bg-foreground selection:text-background">
            {/* Navigation */}
            <nav className="fixed top-0 w-full z-50 glass border-b-0">
                <div className="w-full px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="relative group">
                            <div className="absolute inset-0 bg-foreground/10 blur-lg rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                            <div className="relative h-12 w-12 rounded-full border border-border flex items-center justify-center bg-background group-hover:bg-foreground/5 transition-all duration-500">
                                <GraduationCap className="h-8 w-8 text-primary group-hover:scale-110 transition-transform duration-500" />
                            </div>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-2xl tracking-tight text-foreground leading-none font-montserrat font-semibold">
                                CampusAI
                            </span>
                            <span className="text-[10px] font-medium text-muted-foreground tracking-[0.2em] uppercase mt-1">AI Agent Platform for Universities</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <ThemeToggle />
                        <Button
                            variant="outline"
                            onClick={() => navigate("/login")}
                            className="border-foreground/20 hover:bg-foreground hover:text-background transition-all duration-300 font-medium tracking-tight rounded-full px-6"
                        >
                            Dashboard Access
                        </Button>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-48 pb-20 px-4 overflow-hidden min-h-screen flex flex-col justify-center items-center bg-background antialiased bg-dot-black/[0.2] dark:bg-dot-white/[0.2]">
                {/* Radial gradient mask for the dot background */}
                <div className="absolute pointer-events-none inset-0 flex items-center justify-center bg-background [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>

                {/* Gradient Blobs */}
                <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-500/10 rounded-full mix-blend-normal filter blur-[128px] animate-pulse dark:bg-violet-500/20" />
                    <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full mix-blend-normal filter blur-[128px] animate-pulse delay-700 dark:bg-indigo-500/20" />
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-fuchsia-500/10 rounded-full mix-blend-normal filter blur-[96px] animate-pulse delay-1000 dark:bg-fuchsia-500/20" />
                </div>

                <div className="container mx-auto max-w-6xl text-center space-y-8 relative z-10">

                    <div className="relative z-20 flex flex-col items-center">
                        <h1 className="text-7xl md:text-[8rem] tracking-tighter animate-fade-in text-foreground leading-[0.9] font-montserrat select-none drop-shadow-2xl font-bold">
                            CampusAI
                        </h1>

                        <span className="block font-bold tracking-tight text-3xl md:text-5xl mt-6 bg-[linear-gradient(110deg,#0f172a,45%,#94a3b8,55%,#0f172a)] dark:bg-[linear-gradient(110deg,#9ca3af,45%,#ffffff,55%,#9ca3af)] bg-[length:200%_100%] inline-block text-transparent bg-clip-text animate-shine relative z-20 pb-2">
                            Build Custom AI Agents for Your University
                        </span>
                    </div>

                    {/* Subtitle */}
                    <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto animate-fade-in leading-relaxed font-normal tracking-wide pt-4">
                        Empower your students with AI-driven support. Instantly answer questions about academics, admissions, scholarships, and campus procedures - 24/7.
                    </p>

                    {/* CTA Buttons */}
                    <div className="pt-8 animate-fade-in flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Button
                            size="lg"
                            className="h-14 px-8 min-w-[140px] text-base font-semibold bg-foreground text-background hover:bg-foreground/90 transition-all hover:scale-105 shadow-2xl rounded-full tracking-wide"
                            onClick={() => navigate("/login")}
                        >
                            Login
                        </Button>
                        <Button
                            size="lg"
                            variant="outline"
                            className="h-14 px-8 min-w-[140px] text-base font-medium border-foreground/10 bg-background/50 hover:bg-foreground/5 text-foreground transition-all rounded-full tracking-wide backdrop-blur-sm"
                            onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                        >
                            Explore
                        </Button>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-24 max-w-5xl mx-auto animate-fade-in">
                        {[
                            { label: "AVAILABILITY", value: "24/7", sub: "AI Support" },
                            { label: "SECURITY", value: "100%", sub: "Data Privacy" },
                            { label: "ROUTING", value: "SMART", sub: "Auto Department" }
                        ].map((stat, i) => (
                            <GlowingCard key={i} className="flex flex-col items-center justify-center p-8 bg-background/50 backdrop-blur-sm border-foreground/5">
                                <div className="text-5xl font-black text-foreground mb-2 tracking-tighter">{stat.value}</div>
                                <div className="text-sm font-bold text-foreground tracking-widest mb-1">{stat.label}</div>
                                <div className="text-sm text-muted-foreground font-medium">{stat.sub}</div>
                            </GlowingCard>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-32 px-4 bg-foreground/5 relative">
                <div className="container mx-auto max-w-7xl">
                    <div className="text-center space-y-6 mb-24">
                        <h2 className="text-4xl md:text-6xl font-black text-foreground tracking-tighter">
                            EVERYTHING YOUR
                            <span className="block text-muted-foreground">STUDENTS NEED TO KNOW</span>
                        </h2>
                        <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-light tracking-tight">
                            AI agents trained on your university's complete knowledge - from study materials to admission procedures
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {features.map((feature, index) => (
                            <GlowingCard
                                key={index}
                                containerClassName="group"
                                className="p-10"
                            >
                                <div className="relative z-10">
                                    <div className="w-16 h-16 rounded-2xl bg-foreground text-background flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500">
                                        <feature.icon className="h-8 w-8" />
                                    </div>
                                    <h3 className="text-2xl font-bold mb-4 text-foreground tracking-tight">{feature.title}</h3>
                                    <p className="text-muted-foreground leading-relaxed font-medium">{feature.description}</p>
                                </div>
                            </GlowingCard>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-32 px-4">
                <div className="container mx-auto max-w-6xl">
                    <div className="relative overflow-hidden rounded-[3rem] bg-foreground text-background p-16 md:p-32 text-center shadow-2xl">
                        <div className="relative z-10 space-y-10">
                            <h2 className="text-5xl md:text-7xl font-black tracking-tighter">
                                READY TO TRANSFORM?
                            </h2>
                            <p className="text-2xl text-background/80 max-w-3xl mx-auto font-light tracking-tight">
                                Join universities revolutionizing student support with AI. Efficient, intelligent, always available.
                            </p>
                            <Button
                                size="lg"
                                variant="secondary"
                                className="h-20 px-16 text-xl font-bold hover:scale-105 transition-all shadow-xl bg-background text-foreground hover:bg-background/90 rounded-full tracking-tight"
                                onClick={() => navigate("/login")}
                            >
                                Get Started
                            </Button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 px-4 border-t border-border bg-background">
                <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-8 text-sm font-medium text-muted-foreground">
                    <div className="flex items-center gap-3">
                        <GraduationCap className="h-8 w-8 opacity-80" />
                        <span className="tracking-wide">© 2025 CampusAI</span>
                    </div>
                    <div className="flex gap-10 tracking-wide">
                        <a href="#" className="hover:text-foreground transition-colors uppercase text-xs">Privacy Policy</a>
                        <a href="#" className="hover:text-foreground transition-colors uppercase text-xs">Terms of Service</a>
                        <a href="#" className="hover:text-foreground transition-colors uppercase text-xs">Contact Support</a>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Index;
