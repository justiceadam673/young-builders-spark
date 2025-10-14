import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Messages from "./pages/Messages";
import Gallery from "./pages/Gallery";
import Testimonies from "./pages/Testimonies";
import QA from "./pages/QA";
import Blog from "./pages/Blog";
import AdminQA from "./pages/AdminQA";
import AdminAnnouncements from "./pages/AdminAnnouncements";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/testimonies" element={<Testimonies />} />
          <Route path="/qa" element={<QA />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/admin-qa" element={<AdminQA />} />
          <Route path="/admin-announcements" element={<AdminAnnouncements />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
