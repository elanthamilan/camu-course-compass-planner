
import { useSchedule } from "@/contexts/ScheduleContext";
import { Button } from "@/components/ui/button";
import { CalendarIcon, ListIcon, ShoppingCartIcon, ArrowLeftRight, Sparkles } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";

interface TermHeaderProps {
  view: string;
  setView: (view: string) => void;
  onCompareClick?: () => void;
}

const TermHeader = ({ view, setView, onCompareClick }: TermHeaderProps) => {
  const { currentTerm } = useSchedule();
  const navigate = useNavigate();

  if (!currentTerm) return null;

  return (
    // Responsive flex layout: stacks on small screens, row on sm and up
    <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 items-center justify-between py-3 sm:py-4 md:py-6 animate-fade-in w-full"> {/* Added w-full for better flex behavior if parent is also flex */}
      <div>
        <h2 className="text-xl sm:text-2xl font-semibold text-center sm:text-left">{currentTerm.name}</h2> {/* Centered on small, left on sm+ */}
      </div>

      {/* Group Tabs and Buttons for better responsive layout */}
      <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:items-center sm:space-x-4 w-full sm:w-auto">
        <div className="flex items-center space-x-3">
          <Tabs value={view} onValueChange={setView} className="animate-scale-in">
            <TabsList className="grid grid-cols-2">
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




        </div>


      </div>
    </div>
  );
};

export default TermHeader;
