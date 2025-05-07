
import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isRoot = location.pathname === "/";

  return (
    <header className="bg-white shadow-sm py-4 mb-6">
      <div className="container max-w-7xl mx-auto px-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {!isRoot && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate(-1)}
              className="mr-2 animate-fade-in"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          <h1 className="text-2xl font-bold tracking-tight">Course Planner</h1>
        </div>

        <div className="flex items-center space-x-3">
          <Button 
            variant="default"
            className="bg-gradient-to-r from-purple-600 to-violet-500 hover:from-purple-700 hover:to-violet-600 transition-all duration-300"
            onClick={() => navigate("/advisor")}
          >
            <span className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19.7 14a2 2 0 0 0-1.7-1h-1.2a3 3 0 0 0-3 3v.7c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5V16" />
                <path d="M15.5 14h-.17c-.47.68-1.14 1.25-1.92 1.5" />
                <path d="M13.41 14.5c.87-1.98.87-4.02 0-6" />
                <path d="M18.24 9.5c2.13 2.13 2.13 5.57 0 7.7" />
                <path d="M18.24 6c3.53 3.53 3.53 9.24 0 12.77" />
                <path d="M11.5 9.5c-2.13 2.13-2.13 5.57 0 7.7" />
                <path d="M11.5 6c-3.53 3.53-3.53 9.24 0 12.77" />
                <path d="M8.35 8.35a4.8 4.8 0 0 0 0 7.3" />
                <path d="M4.9 4.9a8.5 8.5 0 0 0 0 14.2" />
              </svg>
              Ask AI Advisor
            </span>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
