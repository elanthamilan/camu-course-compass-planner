
import React from "react";
import { useSchedule } from "@/contexts/ScheduleContext";
import { Button } from "@/components/ui/button";
import { CalendarIcon, ListIcon, ShoppingCartIcon } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";

interface TermHeaderProps {
  view: string;
  setView: (view: string) => void;
}

const TermHeader = ({ view, setView }: TermHeaderProps) => {
  const { currentTerm, moveToCart } = useSchedule();
  const navigate = useNavigate();

  if (!currentTerm) return null;

  return (
    // Responsive flex layout: stacks on small screens, row on sm and up
    <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 items-center justify-between mb-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-semibold text-center sm:text-left">{currentTerm.name}</h2> {/* Centered on small, left on sm+ */}
      </div>

      {/* Group Tabs and Button for better responsive layout if needed */}
      <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:items-center sm:space-x-4 w-full sm:w-auto">
        <Tabs value={view} onValueChange={setView} className="animate-scale-in w-full sm:w-auto">
          <TabsList className="grid grid-cols-2 w-full sm:w-auto"> {/* Ensure tabs fill width on small screens */}
            <TabsTrigger value="calendar" className="flex items-center">
              <CalendarIcon className="mr-1 h-4 w-4" />
              Calendar
            </TabsTrigger>
            <TabsTrigger value="list" className="flex items-center">
              <ListIcon className="mr-1 h-4 w-4" />
              List
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <Button 
          variant="default" // Changed to default variant
          className="transition-all duration-200 animate-scale-in w-full sm:w-auto" // Full width on small, auto on sm+
          onClick={() => navigate("/cart")}
        >
          <ShoppingCartIcon className="mr-2 h-4 w-4" />
          Move to cart
        </Button>
      </div>
    </div>
  );
};

export default TermHeader;
