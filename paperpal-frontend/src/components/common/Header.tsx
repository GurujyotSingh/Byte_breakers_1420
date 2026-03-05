import React from "react";
import { Link } from "react-router-dom";

export const Header: React.FC = () => {
  return (
    <header className="bg-white shadow-sm">
      <nav className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold text-blue-600">
            Agent Paperpal
          </Link>
          <div className="space-x-6">
            <Link to="/format" className="hover:text-blue-600">Format</Link>
            <Link to="/dashboard" className="hover:text-blue-600">Dashboard</Link>
            <Link to="/help" className="hover:text-blue-600">Help</Link>
          </div>
        </div>
      </nav>
    </header>
  );
};
