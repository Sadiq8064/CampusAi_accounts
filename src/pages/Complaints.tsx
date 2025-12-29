import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Card, CardContent } from "@/components/ui/card";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useState, useEffect } from "react";
import { GlowingCard } from "@/components/ui/glowing-card";

const formatDepartment = (dept: string) => {
  return dept.split("-").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
};

const Complaints = () => {
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
  }, []);

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />

        <div className="flex-1 flex flex-col">
          <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/60 px-6 glass">
            <SidebarTrigger />
            <h1 className="text-2xl font-bold tracking-tight">Complaints</h1>
            <div className="flex-1" />
            <ThemeToggle />
          </header>

          <main className="flex-1 p-6 flex items-center justify-center">


            {/* ... (inside Complaints component) */}

            <GlowingCard className="w-full max-w-md">
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  <h2 className="text-3xl font-bold">Coming Soon!</h2>
                  <p className="text-muted-foreground text-lg">
                    The Complaints feature is under development.
                  </p>
                </div>
              </CardContent>
            </GlowingCard>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Complaints;
