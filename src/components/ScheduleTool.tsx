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
import { PlusCircle, Sliders, ArrowLeftRight, BookOpen, ChevronDown, ChevronUp, CalendarPlus, Sparkles, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"; // Added Accordion imports

interface ScheduleToolProps {
  semesterId?: string | null;
}

const ScheduleTool: React.FC<ScheduleToolProps> = ({ semesterId }) => {
  const { 
    courses, 
    busyTimes, 
    selectedSchedule, 
    generateSchedules,
    removeCourse,
    schedules,
    selectSchedule,
    // Context state for section preferences
    selectedSectionMap,
    updateSelectedSectionMap,
    excludeHonorsMap,
    updateExcludeHonorsMap
  } = useSchedule();

  const [view, setView] = useState("calendar");
  const [isAddBusyTimeOpen, setIsAddBusyTimeOpen] = useState(false);
  const [isEditBusyTimeOpen, setIsEditBusyTimeOpen] = useState(false);
  const [selectedBusyTime, setSelectedBusyTime] = useState(null);
  const [isAIAdvisorOpen, setIsAIAdvisorOpen] = useState(false);
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [isPreferencesOpen, setIsPreferencesOpen] = useState(false);
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]); // This manages which courses are considered for generation
  const [isGenerating, setIsGenerating] = useState(false);
  const [expandedCourses, setExpandedCourses] = useState<Record<string, boolean>>({});

  // Initialize selectedCourses (which courses are chosen to be in the schedule plan)
  useEffect(() => {
    setSelectedCourses(courses.map(course => course.id));
    // Section preferences (selectedSectionMap, excludeHonorsMap) are now initialized in ScheduleContext
  }, [courses]);
  
  // Handle course selection toggle (main checkbox for the course - for generating schedules)
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
    // Pass the selectedCourse IDs from the ScheduleTool's state to the context function
    generateSchedules(selectedCourses); 
    setTimeout(() => {
      setIsGenerating(false);
    }, 800); // Keep timeout for simulating generation delay
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
          <Accordion type="multiple" defaultValue={["busy-times", "courses"]} className="w-full space-y-4">
            {/* Busy Times Section */}
            <AccordionItem value="busy-times" className="border-b-0">
              <AccordionTrigger className="flex justify-between items-center p-3 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors [&[data-state=open]>svg]:rotate-180">
                <h3 className="font-medium flex items-center text-sm">
                  <Badge variant="outline" className="mr-2">
                    Busy time ({busyTimes.length})
                  </Badge>
                </h3>
                {/* Chevron will be added by AccordionTrigger, customize if needed */}
              </AccordionTrigger>
              <AccordionContent className="pt-3 space-y-2">
                 <Button 
                  variant="outline" 
                  size="sm"
                  className="w-full h-9 mb-2" 
                  onClick={() => setIsAddBusyTimeOpen(true)}
                >
                  <PlusCircle className="h-4 w-4 mr-1.5" />
                  Add busy time
                </Button>
                <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1"> {/* Adjusted max-h */}
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
                    <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-md text-center">
                      No busy times added.
                    </div>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
            
            {/* Courses Section */}
            <AccordionItem value="courses" className="border-b-0">
               <AccordionTrigger className="flex justify-between items-center p-3 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors [&[data-state=open]>svg]:rotate-180">
                <h3 className="font-medium flex items-center text-sm">
                  <Badge variant="outline" className="mr-2">
                    Courses ({courses.length})
                  </Badge>
                </h3>
                {/* Chevron will be added by AccordionTrigger */}
              </AccordionTrigger>
              <AccordionContent className="pt-3 space-y-3">
                <div className="flex space-x-1 mb-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="h-8 flex-1 text-xs" // Adjusted for smaller screens
                    onClick={() => setIsCompareOpen(true)}
                  >
                    <ArrowLeftRight className="h-3 w-3 mr-1" /> {/* Adjusted icon size */}
                    Compare
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="h-8 flex-1 text-xs" // Adjusted for smaller screens
                    onClick={() => setIsPreferencesOpen(true)}
                  >
                    <Sliders className="h-3 w-3 mr-1" /> {/* Adjusted icon size */}
                    Preferences
                  </Button>
                </div>
                
                <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1"> {/* Adjusted max-h */}
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
                                    <span className="font-medium text-sm mr-2">{course.code}</span>
                                    <Badge variant="secondary" className="text-xs mr-2">{course.credits}cr</Badge>
                                  </div>
                                  <div className="text-xs text-gray-700 mb-1">{course.name}</div>
                                  {course.prerequisites && course.prerequisites.length > 0 && (
                                    <div 
                                      className="text-xs py-0.5 px-1.5 bg-amber-100 text-amber-800 rounded inline-flex items-center cursor-pointer hover:bg-amber-200"
                                      onClick={() => toggleCourseExpanded(course.id)}
                                    >
                                      Prerequisites
                                      {expandedCourses[course.id] ? 
                                        <ChevronUp className="h-3 w-3 ml-1" /> : 
                                        <ChevronDown className="h-3 w-3 ml-1" />
                                      }
                                    </div>
                                  )}
                                </label>
                              </div>
                              <div className="flex space-x-0.5"> {/* Reduced space for closer icons */}
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
                                  className="h-6 w-6 text-destructive hover:text-destructive/90"
                                  onClick={() => handleDeleteCourse(course.id)}
                                  aria-label="Delete course"
                                >
                                  <Trash2 className="h-4 w-4" />
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
                                  className="mt-2 pt-2 border-t w-full"
                                >
                                  {course.prerequisites && course.prerequisites.length > 0 && (
                                    <div className="mb-2">
                                      <div className="text-xs font-semibold text-gray-600 mb-0.5">Prerequisites:</div>
                                      <div className="bg-amber-50 p-1.5 rounded text-xs text-amber-900">
                                        {course.prerequisites.join(", ")}
                                      </div>
                                    </div>
                                  )}
                                  
                                  {/* Section Selection UI */}
                                  <div className="mt-3">
                                    <div className="flex items-center justify-between mb-1.5">
                                      <Label className="text-xs font-semibold text-gray-600">Available Sections:</Label>
                                      {/* Add Honors Filter if applicable */}
                                      {course.sections.some(s => s.sectionType === 'Honors') && (
                                        <div className="flex items-center space-x-1.5">
                                          <Checkbox 
                                            id={`honor-filter-${course.id}`}
                                            checked={excludeHonorsMap[course.id] || false}
                                            onCheckedChange={(checked) => {
                                              updateExcludeHonorsMap(course.id, !!checked);
                                              // If excluding honors, and 'all' sections were selected,
                                              // update to select all non-honors sections.
                                              if (checked && selectedSectionMap[course.id] === 'all') {
                                                const nonHonorsSectionIds = course.sections
                                                  .filter(s => s.sectionType !== 'Honors')
                                                  .map(s => s.id);
                                                updateSelectedSectionMap(course.id, nonHonorsSectionIds);
                                              } else if (!checked && selectedSectionMap[course.id] !== 'all') {
                                                // If unchecking "exclude honors", and not all sections are selected,
                                                // re-evaluate if 'all' should be set (e.g., if all non-honors + honors now makes all sections)
                                                // This part can be complex, for now, manual re-selection of honors sections might be needed by user
                                                // or re-set to 'all' if no specific sections were individually deselected.
                                                const currentSelectedIds = Array.isArray(selectedSectionMap[course.id]) ? selectedSectionMap[course.id] : [];
                                                const allNonHonorsIds = course.sections.filter(s => s.sectionType !== 'Honors').map(s => s.id);
                                                // A simple approach: if all non-honors were selected, and now we include honors, select all.
                                                if (currentSelectedIds.length === allNonHonorsIds.length && allNonHonorsIds.every(id => currentSelectedIds.includes(id))) {
                                                   updateSelectedSectionMap(course.id, 'all');
                                                }
                                              }
                                            }}
                                          />
                                          <Label htmlFor={`honor-filter-${course.id}`} className="text-xs text-gray-600">Exclude Honors</Label>
                                        </div>
                                      )}
                                    </div>
                                    
                                    <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                                      {course.sections
                                        .filter(section => !(excludeHonorsMap[course.id] && section.sectionType === 'Honors'))
                                        .map((section: CourseSection) => (
                                        <div key={section.id} className="text-xs bg-gray-50 p-2 rounded border border-gray-200 hover:border-gray-300">
                                          <div className="flex items-start space-x-2">
                                            <Checkbox
                                              id={`section-select-${section.id}`}
                                              checked={
                                                selectedSectionMap[course.id] === 'all' || 
                                                (Array.isArray(selectedSectionMap[course.id]) && (selectedSectionMap[course.id] as string[]).includes(section.id))
                                              }
                                              onCheckedChange={(checkedState) => {
                                                const isChecked = checkedState === true;
                                                const currentCourseSelection = selectedSectionMap[course.id];
                                                let newCourseSelection: string[] | 'all';

                                                // Filter out honors sections if excludeHonorsMap[course.id] is true
                                                const allPotentiallyVisibleSectionIds = course.sections
                                                  .filter(s => !(excludeHonorsMap[course.id] && s.sectionType === 'Honors'))
                                                  .map(s => s.id);

                                                if (isChecked) {
                                                  if (currentCourseSelection === 'all') { // Should ideally not happen if 'all' implies all are checked
                                                    newCourseSelection = [section.id];
                                                  } else {
                                                    newCourseSelection = [...(currentCourseSelection || []), section.id];
                                                  }
                                                  // If all potentially visible sections are now checked, set to 'all'
                                                  if (allPotentiallyVisibleSectionIds.every(id => newCourseSelection.includes(id))) {
                                                    newCourseSelection = 'all';
                                                  }
                                                } else { // Unchecking a section
                                                  if (currentCourseSelection === 'all') {
                                                    // If 'all' was selected, unchecking one means selecting all *except* this one
                                                    newCourseSelection = allPotentiallyVisibleSectionIds.filter(id => id !== section.id);
                                                  } else {
                                                    newCourseSelection = (currentCourseSelection || []).filter(id => id !== section.id);
                                                  }
                                                }
                                                updateSelectedSectionMap(course.id, newCourseSelection);
                                              }}
                                              className="mt-0.5"
                                              disabled={excludeHonorsMap[course.id] && section.sectionType === 'Honors'} // Disable checkbox if honors excluded
                                            />
                                            <label htmlFor={`section-select-${section.id}`} className={`flex-1 cursor-pointer ${excludeHonorsMap[course.id] && section.sectionType === 'Honors' ? 'opacity-50' : ''}`}>
                                              <div className="flex justify-between items-center mb-0.5">
                                                <span className="font-medium">
                                                  Sect {section.sectionNumber}
                                                  {section.sectionType && section.sectionType !== 'Standard' && (
                                                    <Badge variant="outline" className="ml-1.5 text-[10px] px-1 py-0">
                                                      {section.sectionType}
                                                    </Badge>
                                                  )}
                                                </span>
                                                <span className="text-gray-500">CRN: {section.crn}</span>
                                              </div>
                                              <div className="text-gray-600 text-[11px]">Prof: {section.instructor}</div>
                                              <div className="text-gray-600 text-[11px]">Loc: {section.location}</div>
                                              <div className="flex justify-between text-[11px]">
                                                <span className="text-gray-600">
                                                  Seats: {section.availableSeats}/{section.maxSeats}
                                                </span>
                                                {section.waitlistCount !== undefined && (
                                                  <span className={`${section.waitlistCount > 0 ? "text-orange-600" : "text-green-600"}`}>
                                                    Waitlist: {section.waitlistCount}
                                                  </span>
                                                )}
                                              </div>
                                              {section.schedule && section.schedule.map((sch, idx) => (
                                                <div key={idx} className="flex justify-between text-gray-600 text-[11px] border-t mt-1 pt-0.5">
                                                  <span>{sch.days}</span>
                                                  <span>{sch.startTime} - {sch.endTime}</span>
                                                </div>
                                              ))}
                                            </label>
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
                    <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-md text-center">
                      No courses added.
                    </div>
                  )}
                </div>
                <Button 
                  onClick={handleGenerateSchedule} 
                  variant="default"
                  className="w-full transition-colors mt-2"
                  disabled={selectedCourses.length === 0 || isGenerating}
                >
                  {isGenerating ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Generating...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center">
                      <CalendarPlus className="h-4 w-4 mr-2" />
                      Generate schedule
                    </span>
                  )}
                </Button>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </motion.div>
        
        {/* Main Schedule View */}
        <motion.div 
          className="lg:col-span-3"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          {/* === INSERTED SCHEDULE DROPDOWN === */}
          {schedules && schedules.length > 0 && (
            <div className="mb-4 p-1">
              <Label htmlFor="schedule-select-dropdown" className="text-sm font-medium text-gray-700 block mb-1">
                View Generated Schedules:
              </Label>
              <Select
                value={selectedSchedule?.id || ""}
                onValueChange={(value) => selectSchedule(value === "null" ? null : value)} 
              >
                <SelectTrigger id="schedule-select-dropdown" className="w-full sm:w-[320px] border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                  <SelectValue placeholder="Select a schedule to view details" />
                </SelectTrigger>
                <SelectContent>
                  {schedules.map((schedule) => (
                    <SelectItem key={schedule.id} value={schedule.id}>
                      {schedule.name} ({schedule.totalCredits} cr)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          {/* === END INSERTED SCHEDULE DROPDOWN === */}

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
                  <Sparkles className="h-4 w-4 mr-1.5" /> {/* Replaced SVG with Sparkles icon */}
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
