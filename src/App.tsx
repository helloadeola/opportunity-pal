import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LeadsProvider } from "@/context/LeadsContext";
import { NotificationScheduler } from "@/components/NotificationScheduler";
import BottomNav from "@/components/BottomNav";
import InstallBanner from "@/components/InstallBanner";
import Onboarding from "@/components/Onboarding";
import HomePage from "./pages/HomePage";
import QuickNote from "./pages/QuickNote";
import AllLeads from "./pages/AllLeads";
import LeadDetail from "./pages/LeadDetail";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  const [onboarded, setOnboarded] = useState(
    () => localStorage.getItem("hasCompletedOnboarding") === "true"
  );

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <LeadsProvider>
            {!onboarded ? (
              <Onboarding onComplete={() => setOnboarded(true)} />
            ) : (
              <>
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/add" element={<QuickNote />} />
                  <Route path="/leads" element={<AllLeads />} />
                  <Route path="/leads/:id" element={<LeadDetail />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
                <NotificationScheduler />
                <InstallBanner />
                <BottomNav />
              </>
            )}
          </LeadsProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
