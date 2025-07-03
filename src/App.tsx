import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./hooks/useAuth";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import MonsterCreator from "./pages/MonsterCreator";
import Connections from "./pages/Connections";
import WhatWorks from "./pages/WhatWorks";
import Profile from "./pages/Profile";
import ProfileRegistration from "./pages/ProfileRegistration";
import Analytics from "./pages/Analytics";
import PhotoChallenge from "./pages/PhotoChallenge";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/create-monster" element={<MonsterCreator />} />
            <Route path="/connections" element={<Connections />} />
            <Route path="/what-works" element={<WhatWorks />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/profile-registration" element={<ProfileRegistration />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/photo-challenges" element={<PhotoChallenge />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
