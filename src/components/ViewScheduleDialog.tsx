
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar, Clock, ListFilter } from "lucide-react";
import ScheduleCalendarView from "./ScheduleCalendarView";
import ScheduleListView from "./ScheduleListView";

interface ViewScheduleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  semesterName: string;
  courses: any[];
}

const ViewScheduleDialog = ({ 
  open, 
  onOpenChange,
  semesterName,
  courses
}: ViewScheduleDialogProps) => {
  const [view, setView] = useState("calendar");
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [generatingSchedule, setGeneratingSchedule] = useState(false);

  // Initialize selected courses when dialog opens
  React.useEffect(() => {
    if (open) {
      setSelectedCourses(courses.map(course => course.id));
    }
  }, [open, courses]);

  const handleCourseToggle = (courseId: string) => {
    setSelectedCourses(prev => {
      if (prev.includes(courseId)) {
        return prev.filter(id => id !== courseId);
      } else {
        return [...prev, courseId];
      }
    });
  };

  const handleGenerateSchedule = () => {
    setGeneratingSchedule(true);
    
    // Simulate schedule generation
    setTimeout(() => {
      setGeneratingSchedule(false);
    }, 1000);
  };

  // Filter courses based on selection
  const filteredCourses = courses.filter(course => 
    selectedCourses.includes(course.id)
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] flex flex-col animate-scale-in">
        <DialogHeader>
          <DialogTitle className="text-xl font-medium">{semesterName} Schedule</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4 flex-1 overflow-hidden">
          {/* Course Selection Sidebar */}
          <div className="md:col-span-1 border-r pr-4 space-y-4 overflow-y-auto max-h-[70vh]">
            <h3 className="font-medium flex items-center text-gray-700">
              <ListFilter className="w-4 h-4 mr-2" />
              Select Courses
            </h3>
            
            <div className="space-y-3">
              {courses.map(course => (
                <div key={course.id} className="flex items-start space-x-2">
                  <Checkbox 
                    id={`course-${course.id}`}
                    checked={selectedCourses.includes(course.id)}
                    onCheckedChange={() => handleCourseToggle(course.id)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <label 
                      htmlFor={`course-${course.id}`}
                      className="text-sm font-medium cursor-pointer block"
                    >
                      {course.code}
                    </label>
                    <span className="text-xs text-gray-600">{course.name}</span>
                  </div>
                </div>
              ))}
            </div>
            
            <Button 
              onClick={handleGenerateSchedule}
              disabled={selectedCourses.length === 0 || generatingSchedule}
              className="w-full bg-blue-500 hover:bg-blue-600 transition-colors"
            >
              {generatingSchedule ? "Generating..." : "Generate Schedule"}
            </Button>
          </div>
          
          {/* Schedule View */}
          <div className="md:col-span-3 overflow-hidden flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium">Schedule View</h3>
              
              <Tabs value={view} onValueChange={setView} className="animate-scale-in">
                <TabsList className="bg-slate-100">
                  <TabsTrigger value="calendar" className="flex items-center data-[state=active]:bg-white">
                    <Calendar className="mr-1 h-3.5 w-3.5" />
                    Calendar
                  </TabsTrigger>
                  <TabsTrigger value="list" className="flex items-center data-[state=active]:bg-white">
                    <ListFilter className="mr-1 h-3.5 w-3.5" />
                    List
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            
            <div className="overflow-auto flex-1">
              {view === "calendar" ? (
                <div className="animate-fade-in">
                  <ScheduleCalendarView />
                </div>
              ) : (
                <div className="animate-fade-in">
                  <ScheduleListView />
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ViewScheduleDialog;
