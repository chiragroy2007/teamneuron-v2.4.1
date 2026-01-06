import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Articles from "./pages/Articles";
import Discussions from "./pages/Discussions";
import Profile from "./pages/Profile";
import Admin from "./pages/Admin";
import RattusPage from "./pages/RattusPage";
import Featured from './pages/Featured';
import NotFound from "./pages/NotFound";
import CreateArticle from "./pages/CreateArticle";
import CreateDiscussion from "./pages/CreateDiscussion";
import ArticlePage from "./pages/ArticlePage";
import DiscussionPage from "./pages/DiscussionPage";
import Synapse from "./pages/Synapse";
import Collaborate from "./pages/Collaborate";
import Projects from "@/pages/Projects";
import CreateProject from "@/pages/CreateProject";
import ProjectPage from "@/pages/ProjectPage";
import InboxPage from "@/pages/Inbox";
import ClubsPage from "@/pages/clubs";
import IiserTirupatiClub from "@/pages/clubs/clubpages/iisertirupati";
import Tools from "./pages/Tools";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import WhatsApp from "./pages/WhatsApp";

const queryClient = new QueryClient();

import { HelmetProvider } from 'react-helmet-async';

import { ChatProvider } from "./contexts/ChatContext";

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <ChatProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/articles" element={<Articles />} />
                <Route path="/articles/new" element={<CreateArticle />} />
                <Route path="/articles/:id" element={<ArticlePage />} />
                <Route path="/discussions" element={<Discussions />} />
                <Route path="/discussions/new" element={<CreateDiscussion />} />
                <Route path="/discussions/:id" element={<DiscussionPage />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/ai/rattus" element={<RattusPage />} />
                <Route path="/collaborate" element={<Collaborate />} />
                <Route path="/projects" element={<Projects />} />
                <Route path="/projects/new" element={<CreateProject />} />
                <Route path="/projects/:id" element={<ProjectPage />} />
                <Route path="/inbox" element={<InboxPage />} />
                <Route path="/clubs" element={<ClubsPage />} />
                {/* Friendly aliases for older/typo routes */}
                <Route path="/club" element={<ClubsPage />} />
                <Route path="/synapse" element={<Synapse />} />

                <Route path="/featured" element={<Featured />} />
                <Route path="/tools" element={<Tools />} />
                <Route
                  path="/clubs/iiser-tirupati"
                  element={<IiserTirupatiClub />}
                />
                <Route
                  path="/clun/iiser-tirupati"
                  element={<IiserTirupatiClub />}
                />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/whatsapp" element={<WhatsApp />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </ChatProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
