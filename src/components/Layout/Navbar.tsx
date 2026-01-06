import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { useChat } from '@/contexts/ChatContext';
import { Brain, User, LogOut, Search, MessageSquare, Bot, Network, Users } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';


const Navbar = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { unreadCount, setIsOpen } = useChat();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const openInbox = () => {
    // We can either navigate to /inbox if we create it, OR just open the drawer
    // Since user asked for "inbox page", let's assume we map Navigate('/inbox') to a page that uses the same logic
    // But for now, let's open the drawer as "Inbox"
    setIsOpen(true);
    // Or if we implemented /inbox:
    navigate('/inbox');
  };

  return (
    <nav className="border-b border-neutral-800 bg-neutral-900 sticky top-0 z-50 relative overflow-hidden">
      {/* Metallic Shine Gradient - Top Highlight */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/50 to-transparent opacity-70"></div>

      {/* Subtle top gradient for metallic feel */}
      <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-white/5 to-transparent pointer-events-none"></div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
            <img src="/logo-white.png" alt="TeamNeuron" className="h-8 w-8" />
            <div className="flex flex-col leading-none">
              <span className="text-lg font-bold tracking-tight text-white">TeamNeuron</span>
              <span className="text-[10px] text-neutral-400 font-serif italic">Contribute to science!</span>
            </div>
          </Link>

          {/* Search Bar */}
          <div className="hidden md:flex items-center flex-1 max-w-2xl mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-500" />
              <Input
                placeholder="Search research, discussions..."
                className="pl-9 w-full bg-neutral-800 border-neutral-700 text-white placeholder:text-neutral-500 focus:border-neutral-500 focus:ring-0"
              />
            </div>
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => navigate('/tools')} className="hidden md:flex items-center space-x-2 text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors relative">
                  <span className="text-sm font-medium">Tools</span>
                  <span className="absolute top-1.5 right-1 h-1.5 w-1.5 rounded-full bg-red-500"></span>
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="flex items-center space-x-2 hover:bg-neutral-800 transition-colors relative">
                      <div className="w-8 h-8 bg-white/10 text-white rounded-full flex items-center justify-center border border-white/10">
                        <span className="text-xs font-medium">
                          {user.full_name?.charAt(0).toUpperCase() || user.username?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <span className="hidden md:block text-sm font-medium text-neutral-300">
                        {user.full_name || user.username || user.email?.split('@')[0]}
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-64 p-2 bg-neutral-900 border-neutral-800 text-white">
                    <div className="px-2 py-1.5 mb-1">
                      <p className="text-sm font-semibold text-white">
                        {user.full_name || user.username || 'User'}
                      </p>
                      <p className="text-xs text-neutral-400 truncate">
                        {user.email}
                      </p>
                    </div>
                    <DropdownMenuSeparator className="bg-neutral-800" />
                    {/* Inbox removed */}
                    <DropdownMenuItem onClick={() => navigate('/clubs')} className="cursor-pointer focus:bg-neutral-800 focus:text-white">
                      <Users className="mr-2 h-4 w-4 text-neutral-400" />
                      <span>Research Clubs</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/profile')} className="cursor-pointer focus:bg-neutral-800 focus:text-white">
                      <User className="mr-2 h-4 w-4 text-neutral-400" />
                      <span>Your Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-neutral-800" />
                    <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer focus:bg-neutral-800 focus:text-white">
                      <LogOut className="mr-2 h-4 w-4 text-neutral-400" />
                      <span>Sign Out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm" onClick={() => navigate('/tools')} className="text-neutral-300 hover:text-white hover:bg-neutral-800 hidden md:flex relative">
                  Tools
                  <span className="absolute top-1.5 right-1 h-1.5 w-1.5 rounded-full bg-red-500"></span>
                </Button>
                <Button variant="ghost" size="sm" onClick={() => navigate('/auth')} className="text-neutral-300 hover:text-white hover:bg-neutral-800">
                  Sign In
                </Button>
                <Button size="sm" onClick={() => navigate('/auth?tab=signup')} className="bg-white text-black hover:bg-neutral-200">
                  Join Now
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;