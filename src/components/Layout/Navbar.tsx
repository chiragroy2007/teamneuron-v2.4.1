import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
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

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <nav className="border-b border-border/50 bg-card/30 backdrop-blur-md sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
            <img src="/logo-black.png" alt="TeamNeuron" className="h-8 w-8" />
            <span className="text-xl font-bold text-black">TeamNeuron</span>
          </Link>

          {/* Search Bar */}
          <div className="hidden md:flex items-center flex-1 max-w-2xl mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search research, discussions..."
                className="pl-9 w-full border-gray-200 focus:border-blue-500"
              />
            </div>
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="flex items-center space-x-2 hover:bg-neutral-100 transition-colors">
                    <div className="w-8 h-8 bg-neutral-900 text-white rounded-full flex items-center justify-center shadow-sm">
                      <span className="text-xs font-medium">
                        {user.email?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className="hidden md:block text-sm font-medium text-neutral-700">
                      {user.user_metadata?.full_name?.split(' ')[0] || user.email?.split('@')[0]}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64 p-2">
                  <div className="px-2 py-1.5 mb-1">
                    <p className="text-sm font-semibold text-neutral-900">
                      {user.user_metadata?.full_name || 'User'}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {user.email}
                    </p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/clubs')} className="cursor-pointer">
                    <Users className="mr-2 h-4 w-4 text-neutral-700" />
                    <span>Clubs & Communities</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/synapse')} className="cursor-pointer">
                    <Brain className="mr-2 h-4 w-4 text-neutral-700" />
                    <span>Synapse AI</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/profile')} className="cursor-pointer">
                    <User className="mr-2 h-4 w-4 text-neutral-700" />
                    <span>Your Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4 text-neutral-700" />
                    <span>Sign Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm" onClick={() => navigate('/auth')} className="text-black hover:bg-gray-100">
                  Sign In
                </Button>
                <Button size="sm" onClick={() => navigate('/auth?tab=signup')} className="bg-black hover:bg-gray-800 text-white">
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