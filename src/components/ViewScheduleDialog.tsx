
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar, List, ListFilter, ChevronDown, ChevronUp, Wand2 } from "lucide-react"; // Added ChevronDown, ChevronUp, Wand2
import ScheduleCalendarView from "./ScheduleCalendarView";
import ScheduleListView from "./ScheduleListView";
import { motion, AnimatePresence } from "framer-motion";

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
  const [expandedCourse, setExpandedCourse] = useState<string | null>(null);

  // Initialize selected courses when dialog opens
  useEffect(() => {
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

  const toggleCourseExpand = (courseId: string) => {
    setExpandedCourse(expandedCourse === courseId ? null : courseId);
  };

  const handleGenerateSchedule = () => {
    setGeneratingSchedule(true);
    
    // Simulate schedule generation
    setTimeout(() => {
      setGeneratingSchedule(false);
    }, 1000);
  };

  // Filter courses based on selection
  // const filteredCourses = courses.filter(course => 
  //   selectedCourses.includes(course.id)
  // );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl font-medium">{semesterName} Schedule</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4 flex-1 overflow-hidden">
          {/* Course Selection Sidebar */}
          <motion.div 
            className="md:col-span-1 border-r pr-4 space-y-4 overflow-y-auto max-h-[70vh]"
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h3 className="font-medium flex items-center text-gray-700">
              <ListFilter className="w-4 h-4 mr-2" />
              Select Courses
            </h3>
            
            <div className="space-y-3">
              <AnimatePresence>
                {courses.map((course, index) => (
                  <motion.div 
                    key={course.id} 
                    className="w-full"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                  >
                    <div className="flex items-start space-x-2 w-full">
                      <Checkbox 
                        id={`course-${course.id}`}
                        checked={selectedCourses.includes(course.id)}
                        onCheckedChange={() => handleCourseToggle(course.id)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div 
                          className="flex items-center justify-between cursor-pointer" 
                          onClick={() => toggleCourseExpand(course.id)}
                        >
                          <div>
                            <label 
                              htmlFor={`course-${course.id}`}
                              className="text-sm font-medium cursor-pointer block"
                            >
                              {course.code}
                            </label>
                            <span className="text-xs text-gray-600">{course.name}</span>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-6 w-6 p-0"
                          >
                            {expandedCourse === course.id ? 
                              <ChevronUp className="h-4 w-4" /> : 
                              <ChevronDown className="h-4 w-4" />
                            }
                          </Button>
                        </div>
                        
                        {/* Course Section Details */}
                        <AnimatePresence>
                          {expandedCourse === course.id && course.sections && (
                            <motion.div 
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="mt-2 pl-2 border-l-2 border-gray-200"
                            >
                              <div className="text-xs font-medium text-gray-700 mb-1">Sections:</div>
                              {course.sections.map((section: any) => (
                                <div key={section.id} className="text-xs mb-2 bg-gray-50 p-2 rounded">
                                  <div className="flex items-center justify-between">
                                    <div className="font-medium">{section.sectionNumber}</div>
                                    <div className="text-gray-500">{section.crn}</div>
                                  </div>
                                  <div className="mt-1">
                                    <div>Instructor: {section.instructor}</div>
                                    <div>Location: {section.location}</div>
                                    <div>Available: {section.availableSeats}/{section.maxSeats} seats</div>
                                    {section.schedule && section.schedule.map((sch: any, idx: number) => (
                                      <div key={idx}>
                                        {sch.days} {sch.startTime}-{sch.endTime}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              ))}
                              
                              {course.prerequisites && course.prerequisites.length > 0 && (
                                <div className="mt-2">
                                  <div className="text-xs font-medium text-gray-700 mb-1">Prerequisites:</div>
                                  <div className="text-xs p-2 bg-amber-50 rounded">
                                    {course.prerequisites.join(", ")}
                                  </div>
                                </div>
                              )}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
            
            <Button 
              onClick={handleGenerateSchedule}
              disabled={selectedCourses.length === 0 || generatingSchedule}
              variant="default" // Changed to default variant
              className="w-full transition-colors" // Removed explicit bg colors
            >
              {generatingSchedule ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating...
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  <Wand2 className="h-4 w-4 mr-2" /> {/* Added Wand2 icon */}
                  Generate Schedule
                </span>
              )}
            </Button>
          </motion.div>
          
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
                    <List className="mr-1 h-3.5 w-3.5" />
                    List
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            
            <div className="overflow-auto flex-1">
              <AnimatePresence mode="wait">
                {view === "calendar" ? (
                  <motion.div 
                    key="calendar"
                    className="animate-fade-in"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ScheduleCalendarView />
                  </motion.div>
                ) : (
                  <motion.div 
                    key="list"
                    className="animate-fade-in"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ScheduleListView />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ViewScheduleDialog;
