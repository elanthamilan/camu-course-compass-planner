
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSchedule } from "@/contexts/ScheduleContext";
import { Schedule } from "@/lib/types";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import ScheduleCompareView from "./ScheduleCompareView";
import CompareCalendarView from "./CompareCalendarView";
import { cn } from "@/lib/utils";

interface CompareSchedulesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CompareSchedulesDialog: React.FC<CompareSchedulesDialogProps> = ({ open, onOpenChange }) => {
  const { schedules, selectSchedule } = useSchedule();
  const [selectedSchedules, setSelectedSchedules] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [viewMode, setViewMode] = useState("list");
  
  // Filter to only show schedules with at least one section
  const schedulesWithSections = schedules.filter(s => s.sections.length > 0);
  
  const handleScheduleToggle = (scheduleId: string) => {
    setSelectedSchedules(prev => {
      if (prev.includes(scheduleId)) {
        return prev.filter(id => id !== scheduleId);
      } else {
        // Limit to max 3 schedules
        const newSelected = [...prev, scheduleId].slice(-3);
        return newSelected;
      }
    });
  };
  
  const handleApplySchedule = (scheduleId: string) => {
    selectSchedule(scheduleId);
    onOpenChange(false);
  };
  
  const handleNextStep = () => {
    setCurrentStep(2);
  };
  
  const handleBack = () => {
    setCurrentStep(1);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-5xl max-h-[80vh] flex flex-col animate-scale-in">
        <DialogHeader>
          <DialogTitle>Compare Schedules</DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-auto min-h-[400px]">
          {currentStep === 1 ? (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Select up to 3 schedules to compare. You can see conflicts, credit hours, and other details side by side.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {schedulesWithSections.map((schedule: Schedule) => (
                  <div
                    key={schedule.id}
                    className={cn(
                      "border rounded-lg p-4 cursor-pointer transition-all animate-fade-in",
                      selectedSchedules.includes(schedule.id) 
                        ? "border-blue-500 border-2 bg-blue-50/50" 
                        : "hover:border-gray-300"
                    )}
                    onClick={() => handleScheduleToggle(schedule.id)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium truncate mr-2">{schedule.name}</h3>
                      <div className="flex items-center">
                        {schedule.conflicts && schedule.conflicts.length > 0 ? (
                          <span className="text-amber-500 flex items-center text-xs">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            {schedule.conflicts.length}
                          </span>
                        ) : (
                          <span className="text-green-500 flex items-center text-xs">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            No conflicts
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-sm text-gray-600">
                      {schedule.totalCredits} credits • {schedule.sections.length} courses
                    </div>
                    
                    <div className="mt-3 text-xs space-y-1">
                      {schedule.sections.slice(0, 3).map(section => (
                        <div key={section.id} className="truncate">
                          • {section.id.split("-")[0]}: {section.schedule[0].days} {section.schedule[0].startTime}-{section.schedule[0].endTime}
                        </div>
                      ))}
                      {schedule.sections.length > 3 && (
                        <div className="text-gray-500">
                          • +{schedule.sections.length - 3} more courses
                        </div>
                      )}
                    </div>
                    
                    {selectedSchedules.includes(schedule.id) && (
                      <div className="mt-3">
                        <Button 
                          size="sm" 
                          className="w-full bg-blue-500 hover:bg-blue-600"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleApplySchedule(schedule.id);
                          }}
                        >
                          Apply this schedule
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              <div className="flex justify-end mt-4">
                <Button
                  onClick={handleNextStep}
                  disabled={selectedSchedules.length < 2}
                >
                  Compare {selectedSchedules.length} schedules
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Button variant="outline" size="sm" onClick={handleBack}>
                  Back to selection
                </Button>
                
                <Tabs value={viewMode} onValueChange={setViewMode} className="animate-scale-in">
                  <TabsList>
                    <TabsTrigger value="list">List View</TabsTrigger>
                    <TabsTrigger value="calendar">Calendar View</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
              
              {viewMode === "list" ? (
                <ScheduleCompareView scheduleIds={selectedSchedules} />
              ) : (
                <CompareCalendarView scheduleIds={selectedSchedules} />
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CompareSchedulesDialog;
