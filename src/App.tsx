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
import ClubsPage from "@/pages/clubs";
import IiserTirupatiClub from "@/pages/clubs/clubpages/iisertirupati";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
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
            <Route path="/clubs" element={<ClubsPage />} />
            {/* Friendly aliases for older/typo routes */}
            <Route path="/club" element={<ClubsPage />} />
            <Route path="/synapse" element={<Synapse />} />
            <Route path="/featured" element={<Featured />} />
            <Route
              path="/clubs/iiser-tirupati"
              element={<IiserTirupatiClub />}
            />
            <Route
              path="/clun/iiser-tirupati"
              element={<IiserTirupatiClub />}
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
