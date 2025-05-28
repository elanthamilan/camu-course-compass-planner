import React from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button'; // Shadcn Button
import { ArrowLeft, Sparkles, Menu } from 'lucide-react'; // Icons
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"; // For mobile menu

const Header: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isRoot = location.pathname === '/';

  // Navigation items - can be expanded later
  const navItems = [
    { to: "/advisor", label: "Ask AI Advisor", icon: <Sparkles className="h-4 w-4 mr-2" /> }
  ];

  return (
    <header className="bg-background border-b shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Left section: Back button or Brand */}
        <div className="flex items-center">
          {!isRoot ? (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="mr-2"
              aria-label="Go back"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          ) : (
            <div className="w-8 h-8 mr-2"></div> // Placeholder for spacing if no back button
          )}
          <Link to="/" className="text-xl font-bold text-foreground hover:text-primary transition-colors">
            Course Planner
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-2">
          {navItems.map((item) => (
            <Button 
              key={item.to} 
              variant="outline" // Or "default" if it's the primary header action
              asChild
            >
              <Link to={item.to}>
                {item.icon}
                {item.label}
              </Link>
            </Button>
          ))}
        </nav>

        {/* Mobile Navigation Trigger */}
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] sm:w-[320px]">
              <nav className="flex flex-col space-y-4 mt-8">
                {navItems.map((item) => (
                  <Button 
                    key={`mobile-${item.to}`}
                    variant="ghost" // Or "default" for emphasis in drawer
                    className="justify-start text-base"
                    asChild
                  >
                    <Link to={item.to}>
                      {item.icon}
                      {item.label}
                    </Link>
                  </Button>
                ))}
                {/* Add other links like Home, Schedule, Cart if needed in mobile */}
                <Button variant="ghost" className="justify-start text-base" asChild>
                  <Link to="/">Home</Link>
                </Button>
                <Button variant="ghost" className="justify-start text-base" asChild>
                  <Link to="/schedule">Schedule</Link>
                </Button>
                 <Button variant="ghost" className="justify-start text-base" asChild>
                  <Link to="/cart">Cart</Link>
                </Button>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Header;
