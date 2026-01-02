import React from 'react';
import { Link } from 'react-router-dom';
import { Brain } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-black text-white py-8">
      <div className="container mx-auto px-4 flex flex-col items-center justify-center gap-4 text-center">
        {/* Brand & Motto */}
        <div className="flex flex-col md:flex-row items-center gap-3 text-center md:text-left">
          <div className="flex items-center gap-3 justify-center md:justify-start">
            <img src="/logo-white.png" alt="TeamNeuron Logo" className="h-6 w-auto" />
            <span className="text-lg font-semibold">TeamNeuron</span>
          </div>
          <p className="text-sm text-gray-300 md:ml-4">
            Your Central Nervous System for Science, powered by{' '}
            <Link to="/synapse">
              <img
                src="/synapse.png"
                alt="Synapse Logo"
                className="inline h-5 align-middle ml-1 hover:scale-105 transition-transform"
                style={{ verticalAlign: 'middle', display: 'inline-block' }}
              />
            </Link>
          </p>
        </div>

        {/* Copyright */}
        <p className="text-xs text-gray-400 text-center md:text-right w-full md:w-auto">
          &copy; {new Date().getFullYear()} TeamNeuron. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
