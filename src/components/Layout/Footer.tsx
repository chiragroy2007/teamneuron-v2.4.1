import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="bg-neutral-900 text-white py-12 border-t border-neutral-800 text-sm">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 opacity-90">

          {/* Brand */}
          <div className="flex flex-col md:flex-row items-center gap-3">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="bg-white/10 p-1.5 rounded transition-colors group-hover:bg-white/20">
                <img src="/logo-white.png" alt="TeamNeuron Logo" className="h-4 w-auto" />
              </div>
              <span className="font-medium tracking-wide text-neutral-200 group-hover:text-white transition-colors">TeamNeuron</span>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-wrap justify-center gap-x-8 gap-y-4 text-neutral-400 font-medium">
            <Link to="/" className="hover:text-white transition-colors">Home</Link>
            <Link to="/articles" className="hover:text-white transition-colors">Articles</Link>
            <Link to="/tools" className="hover:text-white transition-colors">Tools</Link>
            <Link to="/collaborate" className="hover:text-white transition-colors">Collaborate</Link>
            <Link to="/discussions" className="hover:text-white transition-colors">Discussions</Link>
            <Link to="/clubs" className="hover:text-white transition-colors">Clubs</Link>
          </nav>

          {/* Copyright */}
          <div className="text-center md:text-right">
            <div className="flex gap-4 justify-center md:justify-end mb-2 text-xs text-neutral-500">
              <Link to="/privacy" className="hover:text-neutral-300 transition-colors">Privacy Policy</Link>
              <Link to="/terms" className="hover:text-neutral-300 transition-colors">Terms of Service</Link>
            </div>
            <p className="text-neutral-500 text-xs text-center md:text-right">&copy; {new Date().getFullYear()} TeamNeuron. <span className="hidden sm:inline">All rights reserved.</span></p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
