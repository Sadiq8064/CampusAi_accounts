import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GlowingCard } from "@/components/ui/glowing-card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Shield, ArrowLeft, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getStates, getCitiesByState, getPincodeByCity } from "@/lib/indiaData";

type SignupStep = "credentials" | "otp" | "academic" | "success";

const UserSignup = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [currentStep, setCurrentStep] = useState<SignupStep>("credentials");
    const [isLoading, setIsLoading] = useState(false);

    // Form state
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [otp, setOtp] = useState("");
    const [dept, setDept] = useState("");
    const [semester, setSemester] = useState("");
    const [division, setDivision] = useState("");
    const [usn, setUsn] = useState("");
    const [university, setUniversity] = useState("");

    // Departments and Semesters Data
    const departments = [
        "Computer Science & Engineering",
        "Electronics & Communication Engineering",
        "Mechanical Engineering",
        "Civil Engineering",
        "Electrical & Electronics Engineering",
        "Artificial Intelligence & Data Science",
        "Architecture"
    ];

    const semesters = ["1", "2", "3", "4", "5", "6", "7", "8"];
    const divisions = ["A", "B", "C", "D", "E", "F"];

    // Infer University from Email
    useEffect(() => {
        if (email.includes("@kletech.ac.in")) {
            setUniversity("KLE Technological University");
        } else if (email.includes("@iitb.ac.in")) {
            setUniversity("Indian Institute of Technology Bombay");
        } else if (email) {
            setUniversity("Unknown University (Manual Input Required)");
        } else {
            setUniversity("");
        }
    }, [email]);

    const handleCredentialsSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        if (password !== confirmPassword) {
            toast({
                title: "Passwords do not match",
                variant: "destructive",
            });
            setIsLoading(false);
            return;
        }

        try {
            // BYPASS: Mock OTP sending
            // const response = await fetch('https://smart-local-help-desk-production.up.railway.app/users/send_otp', { ... });
            // const data = await response.json();

            // Mock success
            await new Promise(resolve => setTimeout(resolve, 800)); // Simulate delay

            console.log("Mocking OTP send...");
            setCurrentStep("otp");
            toast({
                title: "OTP Sent",
                description: "Mock OTP sent (check console or just enter 000000)",
            });

        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to send OTP",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleOTPSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            // BYPASS: Mock OTP verification
            // const response = await fetch('https://smart-local-help-desk-production.up.railway.app/users/verify_otp', { ... });

            // Mock success for any 6 digit OTP
            await new Promise(resolve => setTimeout(resolve, 800));

            console.log("Mocking OTP verification...");
            setCurrentStep("academic");
            toast({
                title: "Success",
                description: "OTP verified successfully (Mock)",
            });

        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to verify OTP",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleAcademicSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            // BYPASS: Mock Registration completion
            // const response = await fetch('https://smart-local-help-desk-production.up.railway.app/users/complete_registration', { ... });

            // Mock success
            await new Promise(resolve => setTimeout(resolve, 1000));

            console.log("Mocking Registration completion...");

            // Store registration data in localStorage
            localStorage.setItem("userUniversity", university);
            localStorage.setItem("userDept", dept);
            localStorage.setItem("userSemester", semester);
            localStorage.setItem("userDivision", division);
            localStorage.setItem("userUSN", usn);
            localStorage.setItem("userFullName", fullName);
            localStorage.setItem("userEmail", email);

            setCurrentStep("success");
            toast({
                title: "Success",
                description: "User registration completed successfully (Mock)",
            });

            // Auto-redirect to login after 3 seconds
            console.log("Registration successful, redirecting...");
            setTimeout(() => {
                navigate("/user-login");
            }, 3000);

        } catch (error) {
            toast({
                title: "Error",
                description: "Registration failed",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const renderStepContent = () => {
        switch (currentStep) {
            case "credentials":
                return (
                    <form onSubmit={handleCredentialsSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="fullName">Full Name</Label>
                            <Input
                                id="fullName"
                                type="text"
                                placeholder="John Doe"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                required
                            />
                        </div>

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
                                placeholder="Create a strong password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirm Password</Label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                placeholder="Re-enter your password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                        </div>

                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? "Processing..." : "Continue"}
                        </Button>
                    </form>
                );

            case "otp":
                return (
                    <form onSubmit={handleOTPSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="otp">Enter OTP</Label>
                            <Input
                                id="otp"
                                type="text"
                                placeholder="000000"
                                maxLength={6}
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                                className="text-center text-2xl tracking-widest"
                                required
                            />
                        </div>

                        <div className="flex justify-end">
                            <Button type="button" variant="link" size="sm">
                                Resend OTP
                            </Button>
                        </div>

                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? "Verifying..." : "Verify OTP"}
                        </Button>
                    </form>
                );

            case "academic":
                return (
                    <form onSubmit={handleAcademicSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="university">University (Detected)</Label>
                            <Input
                                id="university"
                                type="text"
                                value={university}
                                readOnly
                                className="bg-muted text-muted-foreground"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="usn">USN (University Seat Number)</Label>
                            <Input
                                id="usn"
                                type="text"
                                placeholder="e.g. 01FE22BCS001"
                                value={usn}
                                onChange={(e) => setUsn(e.target.value.toUpperCase())}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="dept">Department</Label>
                            <Select value={dept} onValueChange={setDept} required>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Department" />
                                </SelectTrigger>
                                <SelectContent>
                                    {departments.map((d) => (
                                        <SelectItem key={d} value={d}>
                                            {d}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="semester">Semester</Label>
                            <Select value={semester} onValueChange={setSemester} required>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Semester" />
                                </SelectTrigger>
                                <SelectContent>
                                    {semesters.map((s) => (
                                        <SelectItem key={s} value={s}>
                                            Semester {s}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="division">Division</Label>
                            <Select value={division} onValueChange={setDivision} required>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Division" />
                                </SelectTrigger>
                                <SelectContent>
                                    {divisions.map((div) => (
                                        <SelectItem key={div} value={div}>
                                            Division {div}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <Button type="submit" className="w-full" disabled={!dept || !semester || !university || !usn || !division}>
                            Complete Registration
                        </Button>
                    </form>
                );

            case "success":
                return (
                    <div className="flex flex-col items-center justify-center p-6 space-y-6 text-center">
                        <div className="p-4 rounded-full bg-green-100 dark:bg-green-900/20">
                            <Check className="w-12 h-12 text-green-600 dark:text-green-400" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-2xl font-bold text-foreground">Registration Successful</h3>
                            <p className="text-muted-foreground">
                                Your account has been created successfully. Redirecting to login...
                            </p>
                        </div>
                        <Button
                            onClick={() => navigate("/user-login")}
                            className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                        >
                            Proceed to Login
                        </Button>
                    </div>
                );

            default:
                return null;
        }
    };

    const getStepTitle = () => {
        switch (currentStep) {
            case "credentials":
                return "Create Account";
            case "otp":
                return "Verify Email";
            case "academic":
                return "Academic Details";
            case "success":
                return "Registration Complete";
            default:
                return "";
        }
    };

    const getStepDescription = () => {
        switch (currentStep) {
            case "credentials":
                return "Enter your credentials";
            case "otp":
                return "Enter the OTP sent to your email";
            case "academic":
                return "Select your department and semester";
            case "success":
                return "Registration Successful";
            default:
                return "";
        }
    };

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-8">
            <div className="w-full max-w-md space-y-6">
                {/* Header */}
                <div className="text-center space-y-2">
                    <div className="flex justify-center mb-4">
                        <div className="rounded-full bg-primary/10 p-4">
                            <Shield className="h-10 w-10 text-primary" />
                        </div>
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight">User Registration</h1>
                    <p className="text-muted-foreground">
                        Register as a student to access services
                    </p>
                </div>

                {/* Progress Indicator */}
                <div className="flex justify-center gap-2">
                    {["credentials", "otp", "academic", "success"].map((step, index) => (
                        <div
                            key={step}
                            className={`h-2 w-12 rounded-full transition-colors ${["credentials", "otp", "academic", "success"].indexOf(currentStep) >= index
                                ? "bg-primary"
                                : "bg-muted"
                                }`}
                        />
                    ))}
                </div>

                {/* Signup Card */}
                <Card className="w-full border-border/40 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                    <CardHeader>
                        <CardTitle>{getStepTitle()}</CardTitle>
                        <CardDescription>{getStepDescription()}</CardDescription>
                    </CardHeader>
                    <CardContent>{renderStepContent()}</CardContent>
                </Card>

                {/* Back Navigation */}
                {currentStep !== "success" && (
                    <div className="text-center space-y-4">
                        {currentStep === "credentials" && (
                            <p className="text-sm text-muted-foreground">
                                Already have an account?{" "}
                                <Button
                                    variant="link"
                                    className="p-0 h-auto font-medium"
                                    onClick={() => navigate("/user-login")}
                                >
                                    Sign in here
                                </Button>
                            </p>
                        )}
                        <Button
                            variant="ghost"
                            onClick={() => navigate("/")}
                            className="text-muted-foreground"
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Home
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserSignup;
