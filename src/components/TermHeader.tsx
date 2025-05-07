
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
    <div className="flex items-center justify-between mb-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-semibold">{currentTerm.name}</h2>
      </div>

      <div className="flex items-center space-x-4">
        <Tabs value={view} onValueChange={setView} className="animate-scale-in">
          <TabsList>
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
          className="bg-blue-500 hover:bg-blue-600 transition-all duration-200 animate-scale-in"
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
