import { useSchedule } from "@/contexts/ScheduleContext";
import { Button } from "@/components/ui/button";
import { CalendarIcon, ListIcon, ShoppingCartIcon, ArrowLeftRight, Sparkles } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";

interface TermHeaderProps {
  view: string;
  setView: (view: string) => void;
  onCompareClick?: () => void;
}

const TermHeader = ({ view, setView, onCompareClick }: TermHeaderProps) => {
  const { currentTerm, schedules, selectedSchedule, selectSchedule, moveToCart } = useSchedule();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  if (!currentTerm) return null;

  return (
    // Responsive flex layout: stacks on small screens, row on sm and up
    <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 items-center justify-between py-3 sm:py-4 md:py-6 animate-fade-in w-full"> {/* Added w-full for better flex behavior if parent is also flex */}
      <div>
        <h2 className="text-xl sm:text-2xl font-semibold text-center sm:text-left">{currentTerm.name}</h2> {/* Centered on small, left on sm+ */}
      </div>

      {/* Group Tabs and Buttons for better responsive layout */}
      <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:items-center sm:space-x-2 md:space-x-4 w-full sm:w-auto"> {/* Adjusted space-x for more items */}
        {schedules && schedules.length > 0 && (
          <Select value={selectedSchedule?.id || ""} onValueChange={(value) => selectSchedule(value)}>
            <SelectTrigger className="w-full sm:w-[180px] md:w-[200px] text-xs sm:text-sm h-9 sm:h-auto"> {/* Adjusted height for sm screens */}
              <SelectValue placeholder="Select Schedule" />
            </SelectTrigger>
            <SelectContent>
              {schedules.map((schedule) => (
                <SelectItem key={schedule.id} value={schedule.id} className="text-xs sm:text-sm">
                  {schedule.name} ({schedule.sections.length} courses, {schedule.totalCredits}cr)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <Tabs value={view} onValueChange={setView} className="animate-scale-in w-full sm:w-auto">
            <TabsList className="grid grid-cols-2 w-full sm:w-auto">
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
        {onCompareClick && (
          <Button
            variant="outline"
            size="sm" // Standard size for header buttons
            onClick={onCompareClick}
            className="w-full sm:w-auto" // Full width on small screens, auto on larger
          >
            <ArrowLeftRight className="mr-2 h-4 w-4" />
            Compare
          </Button>
        )}
        {selectedSchedule && moveToCart && (
          <Button
            variant="outline"
            size="sm"
            onClick={moveToCart}
            className="w-full sm:w-auto"
            aria-label="Add to Cart"
          >
            <ShoppingCartIcon className="mr-2 h-4 w-4" />
            Add to Cart
          </Button>
        )}
      </div>
    </div>
  );
};

export default TermHeader;
