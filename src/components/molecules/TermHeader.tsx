import { useSchedule } from "../../contexts/ScheduleContext";
import { Button } from "@/components/atoms/button";
import { CalendarIcon, ListIcon, ShoppingCartIcon, ArrowLeftRight, Sparkles } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/atoms/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/atoms/select";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "../../hooks/use-mobile";

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
            <SelectTrigger className="w-full sm:w-[500px] md:w-[550px] text-base bg-gray-50 border-gray-300 h-16">
              <SelectValue placeholder="Select a Schedule" />
            </SelectTrigger>
            <SelectContent>
              {schedules.map((schedule, index) => {
                const days = [...new Set(schedule.sections.flatMap(s => s.schedule.map(sl => sl.days)))].join(', ');
                const times = schedule.sections.flatMap(s => s.schedule.map(sl => ({ start: sl.startTime, end: sl.endTime })));
                const earliest = times.length > 0 ? times.reduce((min, t) => t.start < min ? t.start : min, '23:59') : 'N/A';
                const latest = times.length > 0 ? times.reduce((max, t) => t.end > max ? t.end : max, '00:00') : 'N/A';

                const scheduleNames = ["Morning Focus", "Balanced Day", "Afternoon Power"];
                const scheduleName = scheduleNames[index % scheduleNames.length];

                return (
                  <SelectItem key={schedule.id} value={schedule.id} className="text-base py-3 px-4">
                    <div className="flex justify-between items-center w-full gap-4">
                      <div>
                        <p className="font-semibold text-lg">{scheduleName}</p>
                        <p className="text-sm text-gray-500">{days}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">{schedule.sections.length} courses</p>
                        <p className="text-sm text-gray-500">{schedule.totalCredits} credits</p>
                        <p className="text-sm text-gray-500">{earliest} - {latest}</p>
                      </div>
                    </div>
                  </SelectItem>
                );
              })}
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
            variant="default"
            size="sm"
            onClick={moveToCart}
            className="w-full sm:w-auto"
            aria-label="Add schedule to cart"
          >
            <ShoppingCartIcon className="mr-2 h-4 w-4" />
            Add schedule to cart
          </Button>
        )}
      </div>
    </div>
  );
};

export default TermHeader;
