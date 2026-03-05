import React from "react";
import { Link } from "react-router-dom";

export const Home: React.FC = () => {
  return (
    <div className="text-center">
      <h1 className="text-4xl font-bold mb-4">Agent Paperpal</h1>
      <p className="text-xl mb-8">
        AI-powered manuscript formatting for academic journals
      </p>
      <Link
        to="/format"
        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
      >
        Start Formatting
      </Link>
    </div>
  );
};
