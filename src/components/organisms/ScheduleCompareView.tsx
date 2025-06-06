
import React from "react";
import { useSchedule } from "@/contexts/ScheduleContext";
import { Button } from "@/components/atoms/button";
import { AlertTriangle, CheckCircle2, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface ScheduleCompareViewProps {
  scheduleIds: string[];
}

const ScheduleCompareView: React.FC<ScheduleCompareViewProps> = ({ scheduleIds }) => {
  const { schedules, selectSchedule } = useSchedule();
  const [currentIndex, setCurrentIndex] = React.useState(0);
  
  // Filter schedules by the provided IDs and ensure they're in the same order
  const selectedSchedules = scheduleIds
    .map(id => schedules.find(s => s.id === id))
    .filter(Boolean) as any[];
  
  // Max number of schedules to show at once
  const maxVisible = Math.min(selectedSchedules.length, 3);
  
  const handleNext = () => {
    if (currentIndex + maxVisible < selectedSchedules.length) {
      setCurrentIndex(prev => prev + 1);
    }
  };
  
  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };
  
  const visibleSchedules = selectedSchedules.slice(currentIndex, currentIndex + maxVisible);
  
  const applySchedule = (scheduleId: string) => {
    selectSchedule(scheduleId);
  };
  
  // Find all unique course codes across all schedules
  const allCourseCodes = new Set<string>();
  selectedSchedules.forEach(schedule => {
    schedule.sections.forEach((section: any) => {
      const courseCode = section.id.split("-")[0];
      allCourseCodes.add(courseCode);
    });
  });
  
  // Sort course codes alphabetically
  const sortedCourseCodes = Array.from(allCourseCodes).sort();
  
  return (
    <div className="animate-fade-in">
      <div className="flex items-center mb-4">
        <Button
          variant="outline"
          size="icon"
          disabled={currentIndex === 0}
          onClick={handlePrev}
          className="h-8 w-8"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <div className="flex-1 text-center text-sm text-gray-600">
          Showing {currentIndex + 1} - {Math.min(currentIndex + maxVisible, selectedSchedules.length)} of {selectedSchedules.length} schedules
        </div>
        
        <Button
          variant="outline"
          size="icon"
          disabled={currentIndex + maxVisible >= selectedSchedules.length}
          onClick={handleNext}
          className="h-8 w-8"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {visibleSchedules.map(schedule => (
          <div key={schedule.id} className="space-y-4 border rounded-lg p-4 animate-scale-in">
            <div className="flex justify-between items-start">
              <h3 className="font-medium">{schedule.name}</h3>
              {schedule.conflicts && schedule.conflicts.length > 0 ? (
                <span className="text-amber-500 flex items-center text-xs">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  {schedule.conflicts.length} conflicts
                </span>
              ) : (
                <span className="text-green-500 flex items-center text-xs">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  No conflicts
                </span>
              )}
            </div>
            
            <div className="text-sm text-gray-600 border-b pb-2">
              {schedule.totalCredits} credits • {schedule.sections.length} courses
            </div>
            
            <div className="space-y-2">
              {schedule.conflicts && schedule.conflicts.length > 0 && (
                <div className="bg-amber-50 p-2 rounded text-xs text-amber-700 border border-amber-200">
                  <div className="font-medium mb-1">Conflicts</div>
                  {schedule.conflicts.map((conflict: any, i: number) => (
                    <div key={i}>{conflict.description}</div>
                  ))}
                </div>
              )}
              
              <div className="text-sm space-y-2">
                {sortedCourseCodes.map(courseCode => {
                  const section = schedule.sections.find((s: any) => s.id.startsWith(`${courseCode}-`));
                  
                  return (
                    <div key={courseCode} className="flex items-start space-x-2">
                      <div className="bg-gray-100 text-gray-700 rounded px-2 py-0.5 text-xs font-medium w-16 text-center flex-shrink-0">
                        {courseCode}
                      </div>
                      
                      <div className={cn(
                        "flex-1",
                        section ? "" : "italic text-gray-400"
                      )}>
                        {section ? (
                          <div>
                            <div className="text-xs font-medium">Section {section.sectionNumber}</div>
                            <div className="text-xs">
                              {section.schedule[0].days} • {section.schedule[0].startTime}-{section.schedule[0].endTime}
                            </div>
                            <div className="text-xs text-gray-500">{section.instructor}</div>
                          </div>
                        ) : (
                          "Not scheduled"
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            <Button
              className="w-full"
              onClick={() => applySchedule(schedule.id)}
            >
              Apply this schedule
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ScheduleCompareView;
