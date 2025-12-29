import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GlowingCard } from "@/components/ui/glowing-card";
import { Shield, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const UserLogin = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email || !password) {
            toast({
                title: "Error",
                description: "Please fill in all fields",
                variant: "destructive",
            });
            return;
        }

        setIsLoading(true);

        try {
            // BYPASS: Mock login for first-time user experience as requested
            // const response = await fetch(
            //     "https://smart-local-help-desk-production.up.railway.app/users/login",
            //     {
            //         method: "POST",
            //         headers: { "Content-Type": "application/json" },
            //         body: JSON.stringify({ email, password })
            //     }
            // );

            // const data = await response.json();

            // Mock success response
            const data = {
                success: true,
                session_id: "mock_session_id_" + Date.now(),
                user_details: {
                    name: "Student User",
                    email: email,
                    role: "student"
                },
                message: "First-time login bypass successful"
            };

            // Simulate network delay
            await new Promise(resolve => setTimeout(resolve, 1000));

            if (data.success) {
                // Login successful
                console.log("Bypassing login validation...");
                localStorage.setItem("session_id", data.session_id);
                localStorage.setItem("user_details", JSON.stringify(data.user_details));

                toast({
                    title: "Login Successful",
                    description: "Welcome to Smart Campus Assistance Platform",
                });
                navigate("/users-end");
            } else {
                // ... legacy error handling ... 
                toast({
                    title: "Login Failed",
                    description: "Invalid credentials",
                    variant: "destructive",
                });
            }
        } catch (error) {
            console.error("Login error:", error);
            toast({
                title: "Error",
                description: "Something went wrong. Please try again later.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
            <div className="w-full max-w-md space-y-6">
                {/* Header */}
                <div className="text-center space-y-2">
                    <div className="flex justify-center mb-4">
                        <div className="rounded-full bg-primary/10 p-4">
                            <Shield className="h-10 w-10 text-primary" />
                        </div>
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight">User Login</h1>
                    <p className="text-muted-foreground">
                        Enter your credentials to continue
                    </p>
                </div>

                {/* Login Card */}
                <GlowingCard className="p-0">
                    <CardHeader>
                        <CardTitle>Sign In</CardTitle>
                        <CardDescription>For students only</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleLogin} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">User Email ID</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="user@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>

                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading ? "Signing in..." : "Sign In"}
                            </Button>
                        </form>

                        <div className="mt-6 text-center">
                            <p className="text-sm text-muted-foreground">
                                Don't have an account?{" "}
                                <Button
                                    variant="link"
                                    className="p-0 h-auto font-medium"
                                    onClick={() => navigate("/user-signup")}
                                >
                                    Register here
                                </Button>
                            </p>
                        </div>
                    </CardContent>
                </GlowingCard>

                {/* Back to Home */}
                <div className="text-center">
                    <Button
                        variant="ghost"
                        onClick={() => navigate("/")}
                        className="text-muted-foreground"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Home
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default UserLogin;
