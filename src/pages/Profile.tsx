import { useState, useEffect } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useNavigate } from "react-router-dom";
import { User, Mail, MapPin, Building, X, Activity } from "lucide-react";
import { toast } from "sonner";
import { GlowingCard } from "@/components/ui/glowing-card";
// import { api } from "@/lib/api";

const Profile = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false); // Set to false to show UI directly
    const [isSaving, setIsSaving] = useState(false);

    // Profile State
    const [profile, setProfile] = useState({
        name: "Admin User",
        email: "admin@kletech.ac.in",
        isActive: true,
        university: "KLE Technological University",
        location: "Hubli, Karnataka, India"
    });

    /*
    useEffect(() => {
        const fetchProfile = async () => {
            const email = localStorage.getItem("accountEmail");
            if (!email) {
                toast.error("No account email found. Please login.");
                navigate("/login");
                return;
            }

            try {
                const data = await api.getProfile(email);
                const { account, universityInfo } = data;

                setProfile({
                    name: account.accountName,
                    email: account.accountEmail,
                    isActive: account.isActive,
                    university: account.universityName,
                    location: universityInfo ? `${universityInfo.city}, ${universityInfo.state}, ${universityInfo.country}` : ""
                });
            } catch (error) {
                console.error("Profile fetch error:", error);
                toast.error("Failed to load profile");
            } finally {
                setIsLoading(false);
            }
        };

        fetchProfile();
    }, [navigate]);
    */

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        // Simulating save for now as API is removed
        setTimeout(() => {
            toast.success("Profile updated (Simulation)");
            setIsSaving(false);
        }, 1000);

        /*
        try {
            await api.updateProfile(profile.email, {
                accountName: profile.name,
                isActive: profile.isActive
            });
            toast.success("Profile updated successfully");
        } catch (error) {
            console.error("Profile update error:", error);
            toast.error("Failed to update profile");
        } finally {
            setIsSaving(false);
        }
        */
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-background">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <SidebarProvider>
            <div className="flex min-h-screen w-full bg-background">
                <AppSidebar />

                <div className="flex-1 flex flex-col">
                    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/60 px-6 glass">
                        <SidebarTrigger />
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-primary">{profile.name}</span>
                            <span className="text-muted-foreground">•</span>
                            <h1 className="text-2xl font-bold tracking-tight">Profile</h1>
                        </div>
                        <div className="flex-1" />
                        <ThemeToggle />
                    </header>

                    <main className="flex-1 p-6 animate-fade-in">
                        <div className="max-w-2xl mx-auto">
                            <GlowingCard className="shadow-lg p-0">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-2xl font-bold">Account Settings</CardTitle>
                                    <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
                                        <X className="h-5 w-5" />
                                    </Button>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={handleSave} className="space-y-6">

                                        <div className="grid gap-6">
                                            {/* Account Name */}
                                            <div className="space-y-2">
                                                <Label htmlFor="name" className="flex items-center gap-2">
                                                    <User className="h-4 w-4 text-muted-foreground" />
                                                    Account Name (Department)
                                                </Label>
                                                <Input
                                                    id="name"
                                                    value={profile.name}
                                                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                                                    placeholder="e.g. Computer Science Department"
                                                />
                                            </div>

                                            {/* Email Address */}
                                            <div className="space-y-2">
                                                <Label htmlFor="email" className="flex items-center gap-2">
                                                    <Mail className="h-4 w-4 text-muted-foreground" />
                                                    Account Email
                                                </Label>
                                                <Input
                                                    id="email"
                                                    type="email"
                                                    value={profile.email}
                                                    disabled
                                                    className="bg-muted"
                                                />
                                            </div>

                                            {/* Active Status */}
                                            <div className="flex items-center justify-between rounded-lg border p-4">
                                                <div className="space-y-0.5">
                                                    <Label className="text-base flex items-center gap-2">
                                                        <Activity className="h-4 w-4 text-primary" />
                                                        Active Status
                                                    </Label>
                                                    <div className="text-sm text-muted-foreground">
                                                        Enable or disable this account
                                                    </div>
                                                </div>
                                                <Switch
                                                    checked={profile.isActive}
                                                    onCheckedChange={(checked) => setProfile({ ...profile, isActive: checked })}
                                                />
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                {/* University */}
                                                <div className="space-y-2">
                                                    <Label htmlFor="university" className="flex items-center gap-2">
                                                        <Building className="h-4 w-4 text-muted-foreground" />
                                                        University
                                                    </Label>
                                                    <Input
                                                        id="university"
                                                        value={profile.university}
                                                        disabled
                                                        className="bg-muted"
                                                    />
                                                </div>

                                                {/* Location */}
                                                <div className="space-y-2">
                                                    <Label htmlFor="location" className="flex items-center gap-2">
                                                        <MapPin className="h-4 w-4 text-muted-foreground" />
                                                        Location
                                                    </Label>
                                                    <Input
                                                        id="location"
                                                        value={profile.location}
                                                        disabled
                                                        className="bg-muted"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex justify-end pt-4">
                                            <Button type="submit" size="lg" className="w-full md:w-auto" disabled={isSaving}>
                                                {isSaving ? "Saving..." : "Save Changes"}
                                            </Button>
                                        </div>
                                    </form>
                                </CardContent>
                            </GlowingCard>
                        </div>
                    </main>
                </div>
            </div>
        </SidebarProvider>
    );
};

export default Profile;
