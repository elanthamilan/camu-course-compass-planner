
import React, { useState, useEffect } from "react";
import TermHeader from "./TermHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Course, CourseSection } from "@/lib/types";
import { useSchedule } from "@/contexts/ScheduleContext";
import ScheduleCalendarView from "./ScheduleCalendarView";
import ScheduleListView from "./ScheduleListView";
import BusyTimeItem from "./BusyTimeItem";
import AddBusyTimeDialog from "./AddBusyTimeDialog";
import EditBusyTimeDialog from "./EditBusyTimeDialog";
import AIAdvisorDialog from "./AIAdvisor";
import TunePreferencesDialog from "./TunePreferencesDialog";
import CompareSchedulesDialog from "./CompareSchedulesDialog";
import { PlusCircle, Sliders, ArrowLeftRight, BookOpen, ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ScheduleToolProps {
  semesterId?: string | null;
}

const ScheduleTool: React.FC<ScheduleToolProps> = ({ semesterId }) => {
  const { 
    courses, 
    busyTimes, 
    selectedSchedule, 
    generateSchedules,
    removeCourse 
  } = useSchedule();

  const [view, setView] = useState("calendar");
  const [isAddBusyTimeOpen, setIsAddBusyTimeOpen] = useState(false);
  const [isEditBusyTimeOpen, setIsEditBusyTimeOpen] = useState(false);
  const [selectedBusyTime, setSelectedBusyTime] = useState(null);
  const [isAIAdvisorOpen, setIsAIAdvisorOpen] = useState(false);
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [isPreferencesOpen, setIsPreferencesOpen] = useState(false);
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [expandedCourses, setExpandedCourses] = useState<Record<string, boolean>>({});

  // Initialize selected courses
  useEffect(() => {
    setSelectedCourses(courses.map(course => course.id));
  }, [courses]);

  // Handle course selection toggle
  const handleCourseToggle = (courseId: string) => {
    setSelectedCourses(prev => {
      if (prev.includes(courseId)) {
        return prev.filter(id => id !== courseId);
      } else {
        return [...prev, courseId];
      }
    });
  };

  const handleEditBusyTime = (busyTime: any) => {
    setSelectedBusyTime(busyTime);
    setIsEditBusyTimeOpen(true);
  };

  const handleGenerateSchedule = () => {
    setIsGenerating(true);
    setTimeout(() => {
      generateSchedules();
      setIsGenerating(false);
    }, 800);
  };

  const toggleCourseExpanded = (courseId: string) => {
    setExpandedCourses(prev => ({
      ...prev,
      [courseId]: !prev[courseId]
    }));
  };

  const handleDeleteCourse = (courseId: string) => {
    removeCourse(courseId);
  };

  return (
    <div className="animate-fade-in">
      {/* Term Header with View Toggles */}
      <TermHeader view={view} setView={setView} />
      
      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mt-4">
        {/* Left Sidebar */}
        <motion.div 
          className="lg:col-span-1 space-y-4 md:overflow-visible overflow-x-hidden"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          {/* Busy Times Section */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-medium flex items-center">
                <Badge variant="outline" className="mr-2">
                  Busy time ({busyTimes.length})
                </Badge>
              </h3>
              <Button 
                variant="outline" 
                className="h-8" 
                onClick={() => setIsAddBusyTimeOpen(true)}
              >
                <PlusCircle className="h-4 w-4 mr-1.5" />
                Add busy time
              </Button>
            </div>
            
            <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1">
              <AnimatePresence>
                {busyTimes.map((busyTime, index) => (
                  <motion.div 
                    key={busyTime.id}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                  >
                    <BusyTimeItem 
                      busyTime={busyTime}
                      onEdit={handleEditBusyTime}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {busyTimes.length === 0 && (
                <div className="text-sm text-gray-500 bg-gray-50 p-3 rounded-md">
                  No busy times added yet. Add your regular commitments to avoid scheduling conflicts.
                </div>
              )}
            </div>
          </div>
          
          {/* Courses Section */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-medium flex items-center">
                <Badge variant="outline" className="mr-2">
                  Courses ({courses.length})
                </Badge>
              </h3>
              <div className="flex space-x-1">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="h-8 flex items-center"
                  onClick={() => setIsCompareOpen(true)}
                >
                  <ArrowLeftRight className="h-4 w-4 mr-1.5" />
                  Compare
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="h-8"
                  onClick={() => setIsPreferencesOpen(true)}
                >
                  <Sliders className="h-4 w-4 mr-1.5" />
                  Preferences
                </Button>
              </div>
            </div>
            
            <div className="space-y-2 mb-4 max-h-[400px] overflow-y-auto pr-1">
              <AnimatePresence>
                {courses.map((course: Course, index: number) => (
                  <motion.div 
                    key={course.id}
                    className="bg-white border rounded-md p-3 flex flex-col justify-between items-start group hover:shadow-sm transition-all w-full"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                  >
                    <div className="flex items-start w-full space-x-2">
                      <Checkbox 
                        id={`course-${course.id}`}
                        checked={selectedCourses.includes(course.id)}
                        onCheckedChange={() => handleCourseToggle(course.id)}
                        className="mt-1"
                      />
                      
                      <div className="flex-1">
                        <div className="flex justify-between items-start w-full">
                          <div>
                            <label 
                              htmlFor={`course-${course.id}`}
                              className="cursor-pointer"
                            >
                              <div className="flex items-center mb-1">
                                <span className="font-medium mr-2">{course.code}</span>
                                <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">{course.credits}cr</span>
                              </div>
                              <div className="text-sm mb-1">{course.name}</div>
                              {course.prerequisites && course.prerequisites.length > 0 && (
                                <div 
                                  className="text-xs py-1 px-2 bg-amber-50 text-amber-800 rounded inline-flex items-center cursor-pointer"
                                  onClick={() => toggleCourseExpanded(course.id)}
                                >
                                  Prerequisites required
                                  {expandedCourses[course.id] ? 
                                    <ChevronUp className="h-3 w-3 ml-1" /> : 
                                    <ChevronDown className="h-3 w-3 ml-1" />
                                  }
                                </div>
                              )}
                            </label>
                          </div>
                          
                          <div className="flex space-x-1">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-6 w-6"
                              onClick={() => toggleCourseExpanded(course.id)}
                            >
                              {expandedCourses[course.id] ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-6 w-6 text-red-500 hover:text-red-700 hover:bg-red-50"
                              onClick={() => handleDeleteCourse(course.id)}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>
                            </Button>
                          </div>
                        </div>
                        
                        <AnimatePresence>
                          {expandedCourses[course.id] && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="mt-2 pt-2 border-t border-gray-100 w-full"
                            >
                              {course.prerequisites && course.prerequisites.length > 0 && (
                                <div className="mb-3">
                                  <div className="text-xs font-medium mb-1">Prerequisites:</div>
                                  <div className="bg-amber-50 p-2 rounded text-xs">
                                    {course.prerequisites.join(", ")}
                                  </div>
                                </div>
                              )}
                              
                              <div>
                                <div className="text-xs font-medium mb-1">Available Sections:</div>
                                <div className="space-y-2">
                                  {course.sections.map((section: CourseSection) => (
                                    <div 
                                      key={section.id} 
                                      className="text-xs bg-gray-50 p-2 rounded flex flex-col"
                                    >
                                      <div className="flex justify-between mb-1">
                                        <span className="font-medium">Section {section.sectionNumber}</span>
                                        <span className="text-gray-500">CRN: {section.crn}</span>
                                      </div>
                                      <div>Instructor: {section.instructor}</div>
                                      <div>Location: {section.location}</div>
                                      <div className="flex justify-between">
                                        <span>
                                          Seats: {section.availableSeats}/{section.maxSeats}
                                        </span>
                                        {section.waitlistCount !== undefined && (
                                          <span className={`${section.waitlistCount > 0 ? "text-orange-600" : "text-green-600"}`}>
                                            Waitlist: {section.waitlistCount}
                                          </span>
                                        )}
                                      </div>
                                      <div className="mt-1 border-t border-gray-200 pt-1">
                                        {section.schedule && section.schedule.map((sch, idx) => (
                                          <div key={idx} className="flex justify-between">
                                            <span>{sch.days}</span>
                                            <span>{sch.startTime} - {sch.endTime}</span>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {courses.length === 0 && (
                <div className="text-sm text-gray-500 bg-gray-50 p-3 rounded-md">
                  No courses added yet. Add courses to generate schedules.
                </div>
              )}
            </div>
            
            <Button 
              onClick={handleGenerateSchedule} 
              className="w-full bg-blue-500 hover:bg-blue-600 transition-colors"
              disabled={selectedCourses.length === 0 || isGenerating}
            >
              {isGenerating ? 
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating...
                </span> : 
                "Generate schedule"
              }
            </Button>
          </div>
        </motion.div>
        
        {/* Main Schedule View */}
        <motion.div 
          className="lg:col-span-3"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <div className="space-y-2 mb-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-lg">
                {selectedSchedule?.name || "No Schedule Selected"}
              </h3>
              <div className="flex items-center space-x-1">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setIsAIAdvisorOpen(true)}
                  className="flex items-center text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19.7 14a2 2 0 0 0-1.7-1h-1.2a3 3 0 0 0-3 3v.7c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5V16" />
                    <path d="M15.5 14h-.17c-.47.68-1.14 1.25-1.92 1.5" />
                    <path d="M13.41 14.5c.87-1.98.87-4.02 0-6" />
                    <path d="M18.24 9.5c2.13 2.13 2.13 5.57 0 7.7" />
                    <path d="M18.24 6c3.53 3.53 3.53 9.24 0 12.77" />
                    <path d="M11.5 9.5c-2.13 2.13-2.13 5.57 0 7.7" />
                    <path d="M11.5 6c-3.53 3.53-3.53 9.24 0 12.77" />
                    <path d="M8.35 8.35a4.8 4.8 0 0 0 0 7.3" />
                    <path d="M4.9 4.9a8.5 8.5 0 0 0 0 14.2" />
                  </svg>
                  Ask AI Advisor
                </Button>
              </div>
            </div>
            
            {selectedSchedule && (
              <div className="text-sm text-gray-500">
                {selectedSchedule.totalCredits} credits {selectedSchedule.conflicts?.length > 0 && (
                  <span className="text-amber-500">
                    • {selectedSchedule.conflicts.length} conflict{selectedSchedule.conflicts.length > 1 ? 's' : ''}
                  </span>
                )}
              </div>
            )}
          </div>
          
          {/* Schedule Views */}
          <AnimatePresence mode="wait">
            {view === "calendar" ? (
              <motion.div
                key="calendar"
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
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <ScheduleListView />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
      
      {/* Dialogs */}
      <AddBusyTimeDialog 
        open={isAddBusyTimeOpen} 
        onOpenChange={setIsAddBusyTimeOpen} 
      />
      
      <EditBusyTimeDialog 
        open={isEditBusyTimeOpen}
        onOpenChange={setIsEditBusyTimeOpen}
        busyTime={selectedBusyTime}
      />
      
      <AIAdvisorDialog
        open={isAIAdvisorOpen}
        onOpenChange={setIsAIAdvisorOpen}
      />
      
      <TunePreferencesDialog
        open={isPreferencesOpen}
        onOpenChange={setIsPreferencesOpen}
      />
      
      <CompareSchedulesDialog
        open={isCompareOpen}
        onOpenChange={setIsCompareOpen}
      />
    </div>
  );
};

export default ScheduleTool;
