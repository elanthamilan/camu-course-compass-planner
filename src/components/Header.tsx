import React, { useState } from 'react'; // Added useState
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button'; // Shadcn Button
import { ArrowLeft, Sparkles, Menu } from 'lucide-react'; // Icons
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"; // For mobile menu
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"; // Added Tooltip
import AIAdvisor from '@/components/AIAdvisor'; // Import AIAdvisor

const Header: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isRoot = location.pathname === '/';
  const [isAiAdvisorOpen, setIsAiAdvisorOpen] = useState(false); // State for AI Advisor

  // Navigation items - Ask AI Advisor will be handled separately
  const navItems = [
    // { to: "/advisor", label: "Ask AI Advisor", icon: <Sparkles className="h-4 w-4 mr-2" /> }
  ];

  return (
    <> {/* Added Fragment to wrap header and AIAdvisor */}
    <header className="bg-background border-b shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Left section: Back button or Brand */}
        <div className="flex items-center">
          {!isRoot ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigate(-1)}
                  className="mr-2"
                  aria-label="Go back"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Go to the previous page.</p>
              </TooltipContent>
            </Tooltip>
          ) : null}
          <Tooltip>
            <TooltipTrigger asChild>
              <Link 
                to="/" 
                className={`text-xl font-bold text-foreground hover:text-primary transition-colors ${isRoot ? 'ml-10' : ''}`} // ml-10 roughly equivalent to icon button width + margin
              >
                Course Planner
              </Link>
            </TooltipTrigger>
            <TooltipContent>
              <p>Navigate to the main dashboard / home page.</p>
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-2">
          {/* Render other nav items if any */}
          {navItems.map((item) => (
            <Button 
              key={item.to} 
              variant="outline"
              asChild
            >
              <Link to={item.to}>
                {item.icon}
                {item.label}
              </Link>
            </Button>
          ))}
          {/* AI Advisor Button for Desktop */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="outline" 
                onClick={() => setIsAiAdvisorOpen(true)}
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Ask AI Advisor
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Open the AI Course Advisor for help and recommendations.</p>
            </TooltipContent>
          </Tooltip>
        </nav>

        {/* Mobile Navigation Trigger */}
        <div className="md:hidden">
          <Sheet>
            <Tooltip>
              <TooltipTrigger asChild>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-6 w-6" />
                    <span className="sr-only">Open menu</span>
                  </Button>
                </SheetTrigger>
              </TooltipTrigger>
              <TooltipContent>
                <p>Open navigation menu.</p>
              </TooltipContent>
            </Tooltip>
            <SheetContent side="right" className="w-[280px] sm:w-[320px]">
              <nav className="flex flex-col space-y-4 mt-8">
                {/* Render other nav items if any */}
                {navItems.map((item) => (
                  <Button 
                    key={`mobile-${item.to}`}
                    variant="ghost"
                    className="justify-start text-base"
                    asChild
                  >
                    <Link to={item.to}>
                      {item.icon}
                      {item.label}
                    </Link>
                  </Button>
                ))}
                {/* AI Advisor Button for Mobile */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      className="justify-start text-base"
                      onClick={() => {
                        // This should ideally close the sheet first if onOpenChange for Sheet is managed
                        setIsAiAdvisorOpen(true); 
                      }}
                    >
                      <Sparkles className="h-4 w-4 mr-2" />
                      Ask AI Advisor
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right" align="center">
                    <p>Open the AI Course Advisor.</p>
                  </TooltipContent>
                </Tooltip>
                {/* Add other links like Home, Schedule, Cart if needed in mobile */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" className="justify-start text-base" asChild>
                      <Link to="/">Home</Link>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right" align="center"><p>Go to the main dashboard / home page.</p></TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" className="justify-start text-base" asChild>
                      <Link to="/schedule">Schedule</Link>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right" align="center"><p>Go to the detailed schedule planning page.</p></TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" className="justify-start text-base" asChild>
                      <Link to="/cart">Cart</Link>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right" align="center"><p>View your course registration cart.</p></TooltipContent>
                </Tooltip>
                 {/* Assuming Degree Audit link might be added later */}
                 {/* <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" className="justify-start text-base" asChild>
                        <Link to="/degree-audit">Degree Audit</Link>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="right" align="center"><p>View your degree audit progress.</p></TooltipContent>
                  </Tooltip> */}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
    <AIAdvisor open={isAiAdvisorOpen} onOpenChange={setIsAiAdvisorOpen} />
    </>
  );
};

export default Header;
