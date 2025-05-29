
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ScheduleProvider } from "@/contexts/ScheduleContext";
import Index from "./pages/Index";
import SchedulePage from "./pages/SchedulePage";
import CartPage from "./pages/CartPage";
import AdvisorPage from "./pages/AdvisorPage";
import NotFound from "./pages/NotFound";
import DegreeAuditPage from "./pages/DegreeAuditPage"; // Import the new page

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <ScheduleProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/schedule" element={<SchedulePage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/advisor" element={<AdvisorPage />} />
            <Route path="/degree-audit" element={<DegreeAuditPage />} /> {/* Add new route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </ScheduleProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
