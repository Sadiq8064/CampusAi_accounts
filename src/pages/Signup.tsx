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

type SignupStep = "credentials" | "otp" | "department" | "success";

const Signup = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState<SignupStep>("credentials");
  const [isLoading, setIsLoading] = useState(false);

  // Form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [department, setDepartment] = useState("");
  const [subCategory, setSubCategory] = useState("");
  const [state, setState] = useState("");
  const [city, setCity] = useState("");
  const [pincode, setPincode] = useState("");
  const [description, setDescription] = useState("");

  const handleCredentialsSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setCurrentStep("otp");
      toast({
        title: "OTP Sent",
        description: "Please check your government email",
      });
    }, 1000);
  };

  const handleOTPSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (otp.length !== 6) {
      toast({
        title: "Error",
        description: "Please enter a valid 6-digit OTP",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setCurrentStep("department");
    }, 1000);
  };

  // Auto-fill pincode when city changes
  useEffect(() => {
    if (state && city) {
      const autoFilledPincode = getPincodeByCity(state, city);
      if (autoFilledPincode) {
        setPincode(autoFilledPincode);
      }
    }
  }, [state, city]);

  // Reset city and pincode when state changes
  const handleStateChange = (newState: string) => {
    setState(newState);
    setCity("");
    setPincode("");
  };

  const handleDepartmentSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!department || !state || !city || !pincode || !description) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    // Store registration data in localStorage
    localStorage.setItem("userDepartment", department);
    localStorage.setItem("userState", state);
    localStorage.setItem("userCity", city);

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setCurrentStep("success");
    }, 1000);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case "credentials":
        return (
          <form onSubmit={handleCredentialsSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Government Official Email ID</Label>
              <Input
                id="email"
                type="email"
                placeholder="official@gov.in"
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

      case "department":
        return (
          <form onSubmit={handleDepartmentSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Select value={department} onValueChange={setDepartment} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="municipal-road">Municipal-Road</SelectItem>
                  <SelectItem value="municipal-water">Municipal-Water</SelectItem>
                  <SelectItem value="municipal-sanitation">Municipal-Sanitation</SelectItem>
                  <SelectItem value="fire">Fire</SelectItem>
                  <SelectItem value="electricity">Electricity</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <Select value={state} onValueChange={handleStateChange} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select state" />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  {getStates().map((stateName) => (
                    <SelectItem key={stateName} value={stateName}>
                      {stateName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Select
                value={city}
                onValueChange={setCity}
                required
                disabled={!state}
              >
                <SelectTrigger>
                  <SelectValue placeholder={state ? "Select city" : "Select state first"} />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  {state && getCitiesByState(state).map((cityName) => (
                    <SelectItem key={cityName} value={cityName}>
                      {cityName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="pincode">Pincode</Label>
              <Input
                id="pincode"
                type="text"
                placeholder="Auto-filled based on city"
                value={pincode}
                onChange={(e) => setPincode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                required
                disabled={!city}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Briefly describe your role and responsibilities"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={!department || !state || !city || !pincode || !description}>
              Continue
            </Button>
          </form>
        );

      case "success":
        return (
          <div className="text-center py-8 space-y-6">
            <div className="flex justify-center">
              <div className="rounded-full bg-success/10 p-4">
                <Check className="h-12 w-12 text-success" />
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-success">Successfully Registered!</h3>
              <p className="text-muted-foreground">
                Your account has been created successfully
              </p>
            </div>
            <Button onClick={() => navigate("/login")} className="w-full">
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
      case "department":
        return "Complete Registration";
      case "success":
        return "Registration Complete";
      default:
        return "";
    }
  };

  const getStepDescription = () => {
    switch (currentStep) {
      case "credentials":
        return "Enter your official credentials";
      case "otp":
        return "Enter the OTP sent to your email";
      case "department":
        return "Select your department and provide location details";
      case "success":
        return "";
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
          <h1 className="text-3xl font-bold tracking-tight">Government Registration</h1>
          <p className="text-muted-foreground">
            Register as an official to manage local complaints
          </p>
        </div>

        {/* Progress Indicator */}
        {currentStep !== "success" && (
          <div className="flex justify-center gap-2">
            {["credentials", "otp", "department", "location"].map((step, index) => (
              <div
                key={step}
                className={`h-2 w-12 rounded-full transition-colors ${["credentials", "otp", "department", "location"].indexOf(currentStep) >= index
                  ? "bg-primary"
                  : "bg-muted"
                  }`}
              />
            ))}
          </div>
        )}

        {/* Signup Card */}
        <GlowingCard className="p-0">
          <CardHeader>
            <CardTitle>{getStepTitle()}</CardTitle>
            <CardDescription>{getStepDescription()}</CardDescription>
          </CardHeader>
          <CardContent>{renderStepContent()}</CardContent>
        </GlowingCard>

        {/* Back Navigation */}
        {currentStep !== "success" && (
          <div className="text-center space-y-4">
            {currentStep === "credentials" && (
              <p className="text-sm text-muted-foreground">
                Already have an account?{" "}
                <Button
                  variant="link"
                  className="p-0 h-auto font-medium"
                  onClick={() => navigate("/login")}
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

export default Signup;
