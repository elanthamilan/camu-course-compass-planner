import React, { useState, useEffect } from "react";
import TermHeader from "./TermHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Course, CourseSection, ExportedSchedule, Schedule } from "@/lib/types";
import type { BusyTime } from "@/lib/types";
import { useSchedule } from "@/contexts/ScheduleContext";
import ScheduleCalendarView from "./ScheduleCalendarView";
import ScheduleListView from "./ScheduleListView";
import BusyTimeItem from "./BusyTimeItem";
import AddBusyTimeDialog from "./AddBusyTimeDialog";
import EditBusyTimeDialog from "./EditBusyTimeDialog";
import AIAdvisor from "./AIAdvisor";
import TunePreferencesDialog from "./TunePreferencesDialog";
import CompareSchedulesDialog from "./CompareSchedulesDialog";
import { PlusCircle, Sliders, ArrowLeftRight, ChevronDown, ChevronUp, CalendarPlus, Sparkles, Trash2, Download, Upload, Settings, ListChecks, CalendarDays, Edit3, Copy as CopyIcon, Share2, Lock, Unlock, AlertTriangle, ShoppingCart, X, Edit2, Clock, BookOpen, SlidersHorizontal, List as ListIcon, Calendar as CalendarIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import CourseSearchModal from "./CourseSearchModal";
import CourseDetailBottomSheet from "./CourseDetailBottomSheet";
import AddBusyTimeBottomSheet from "./AddBusyTimeBottomSheet";
import EditBusyTimeBottomSheet from "./EditBusyTimeBottomSheet";
import TunePreferencesBottomSheet from "./TunePreferencesBottomSheet";
import AIAdvisorBottomSheet from "./AIAdvisorBottomSheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { mockCourses } from "@/lib/mock-data";
import { v4 as uuidv4 } from 'uuid';

/**
 * Props for the ScheduleTool component.
 */
interface ScheduleToolProps {
  /**
   * The ID of the semester for which schedules are being managed.
   * Currently not directly used in the component's logic but could be for future enhancements
   * like fetching term-specific data.
   */
  semesterId?: string | null;
}

/**
 * Main component for the scheduling tool, providing UI for course selection,
 * busy time management, schedule generation, and viewing.
 */
const ScheduleTool: React.FC<ScheduleToolProps> = ({ semesterId: _semesterId }) => {
  const {
    courses, // Courses selected by the user for planning
    busyTimes, // User-defined busy times
    selectedSchedule, // The currently active schedule being viewed
    generateSchedules, // Function from context to generate schedules
    removeCourse, // Function from context to remove a course
    schedules, // List of all generated/saved schedules
    selectSchedule, // Function from context to select a schedule
    addSchedule, // Function from context to add a new (e.g., imported) schedule
    addCourse, // Function from context to add a course to the planning list
    allCourses,
  } = useSchedule();

  const fileInputRef = React.useRef<HTMLInputElement>(null); // Ref for file input used in schedule import

  // UI State
  const isMobile = useIsMobile(); // Hook for mobile detection
  const [isCourseSearchDrawerOpen, setIsCourseSearchDrawerOpen] = useState(false);
  const [isAddBusyTimeBottomSheetOpen, setIsAddBusyTimeBottomSheetOpen] = useState(false);
  const [isEditBusyTimeBottomSheetOpen, setIsEditBusyTimeBottomSheetOpen] = useState(false);
  const [isTunePreferencesBottomSheetOpen, setIsTunePreferencesBottomSheetOpen] = useState(false);
  const [isAIAdvisorBottomSheetOpen, setIsAIAdvisorBottomSheetOpen] = useState(false);
  const [isAIAdvisorOpen, setIsAIAdvisorOpen] = useState(false);
  const [view, setView] = useState<"calendar" | "list">("calendar"); // Current view mode: 'calendar' or 'list'
  const [mobileView, setMobileView] = useState<"calendar" | "manage">("calendar"); // Mobile view state

  // Sync mobile view when switching to list view on mobile
  useEffect(() => {
    if (isMobile && view === "list") {
      setMobileView("calendar"); // Ensure mobile view is in calendar mode when showing list
    }
  }, [isMobile, view]);

  const [isAddBusyTimeOpen, setIsAddBusyTimeOpen] = useState(false);
  const [isEditBusyTimeOpen, setIsEditBusyTimeOpen] = useState(false);
  const [selectedBusyTime, setSelectedBusyTime] = useState<BusyTime | null>(null); // Busy time selected for editing
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [isPreferencesOpen, setIsPreferencesOpen] = useState(false);
  const [isCourseDetailBottomSheetOpen, setIsCourseDetailBottomSheetOpen] = useState(false);
  const [selectedCourseForDetail, setSelectedCourseForDetail] = useState<Course | null>(null);

  // Course Selection and Configuration State
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]); // IDs of courses checked by the user for generation
  const [lockedCourses, setLockedCourses] = useState<string[]>([]); // IDs of courses whose sections are locked in the current schedule

  const [isGenerating, setIsGenerating] = useState(false); // Whether schedule generation is in progress

  // Effect to initialize `selectedCourses` based on `courses` from context.
  // This ensures that if courses are added/removed externally, the checkboxes reflect that.
  useEffect(() => {
    setSelectedCourses(courses.map(course => course.id));
  }, [courses]);

  // Effect for initial automatic schedule generation.
  // This attempts to generate schedules when the component mounts if courses are present
  // and no schedules have been generated yet.
  // UPDATED: Now also triggers immediate generation when autoGenerate=true in URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const shouldAutoGenerate = urlParams.get('autoGenerate') === 'true';

    if (shouldAutoGenerate && courses.length > 0 && selectedCourses.length > 0 && !isGenerating) {
      // IMMEDIATE generation when coming from "Build Conflict-Free Schedule" button
      console.log("Triggering IMMEDIATE schedule generation from homepage button");
      handleGenerateSchedule();

      // Remove the autoGenerate flag from URL to prevent repeated generation
      urlParams.delete('autoGenerate');
      const newUrl = window.location.pathname + (urlParams.toString() ? '?' + urlParams.toString() : '');
      window.history.replaceState({}, '', newUrl);

      // Exit early to prevent the delayed auto-generation from also running
      return;
    }

    // Only run delayed auto-generation if NOT coming from homepage
    if (courses.length > 0 && schedules.length === 0 && selectedCourses.length > 0 && !isGenerating && !shouldAutoGenerate) {
      // Original auto-generation logic with delay (only if not immediate generation)
      const timeoutId = setTimeout(() => {
        console.log("Attempting delayed automatic schedule generation");
        handleGenerateSchedule();
      }, 500); // Timeout to allow other initial state updates to settle.

      return () => clearTimeout(timeoutId);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courses.length, schedules.length, selectedCourses.length]); // Dependencies: re-run if course count or schedule count changes.

  /** Toggles the selection state of a course for schedule generation. */
  const handleCourseToggle = (courseId: string) => {
    setSelectedCourses(prev => {
      if (prev.includes(courseId)) {
        return prev.filter(id => id !== courseId);
      } else {
        return [...prev, courseId];
      }
    });
  };

  /** Opens the dialog to edit a specific busy time. */
  const handleEditBusyTime = (busyTime: BusyTime) => {
    setSelectedBusyTime(busyTime);
    setIsEditBusyTimeOpen(true);
  };

  /**
   * Initiates the schedule generation process.
   * It gathers selected courses and any locked sections from the currently viewed schedule
   * to pass to the `generateSchedules` context function.
   */
  const handleGenerateSchedule = () => {
    if (selectedCourses.length === 0) {
      toast.error("Please select at least one course to generate schedules.");
      return;
    }

    setIsGenerating(true); // Set loading state

    // Switch to calendar view on mobile when generating schedules
    if (isMobile && mobileView === "manage") {
      setMobileView("calendar");
    }

    try {
      let fixedSectionsForGeneration: CourseSection[] = [];
      // If a schedule is selected and there are locked courses,
      // try to use the sections of those locked courses from the *selectedSchedule* as fixed.
      // This means locking a course effectively locks its specific section *from the current view*.
      if (selectedSchedule && lockedCourses.length > 0) {
        const selectedAndLockedCourseIds = lockedCourses.filter(lcId => selectedCourses.includes(lcId));

        selectedSchedule.sections.forEach(section => {
          const courseIdOfSection = section.id.split('-')[0];
          if (selectedAndLockedCourseIds.includes(courseIdOfSection)) {
            fixedSectionsForGeneration.push(section);
          }
        });

        // Notify if some locked courses (that were also selected for generation)
        // couldn't find their sections in the current `selectedSchedule`.
        // This might happen if the `selectedSchedule` changed after locking.
        if (fixedSectionsForGeneration.length < selectedAndLockedCourseIds.length) {
          const missingFixedCourses = selectedAndLockedCourseIds.filter(
            lcId => !fixedSectionsForGeneration.some(fs => fs.id.startsWith(lcId))
          );
          if (missingFixedCourses.length > 0) {
            toast.error(`Sections for locked courses (${missingFixedCourses.join(', ')}) were not found in the current base schedule and will be scheduled dynamically if possible.`);
          }
        }
      }

      // Call the context function to generate schedules
      generateSchedules(selectedCourses, fixedSectionsForGeneration);

    } catch (error) {
      console.error("Error generating schedules:", error);
      toast.error("An unexpected error occurred while generating schedules.");
    } finally {
      setIsGenerating(false); // Reset loading state
    }
  };

  /** Removes a course from the planning list using the context function. */
  const handleDeleteCourse = (courseId: string) => {
    removeCourse(courseId); // Context function handles toast
  };

  /** Toggles the lock state of a course for schedule generation. */
  const handleToggleCourseLock = (courseId: string) => {
    const course = courses.find(c => c.id === courseId);
    if (!course) return;
    setLockedCourses(prevLocked => {
      if (prevLocked.includes(courseId)) {
        toast.success(`${course.code} unlocked! It can now be changed by regeneration.`);
        return prevLocked.filter(id => id !== courseId);
      } else {
        toast.success(`${course.code} locked! It will be preserved during regeneration.`);
        return [...prevLocked, courseId];
      }
    });
  };

  // Pass the correct value and setter to TermHeader
  const termHeaderView = isMobile ? mobileView : view;
  const handleTermHeaderViewChange = (val: string) => {
    if (isMobile) {
      setMobileView(val as "calendar" | "manage");
      // Always keep view as 'calendar' on mobile to avoid list view logic
      setView("calendar");
    } else {
      setView(val as "calendar" | "list");
    }
  };

  return (
    <>
      <input type="file" accept=".json" ref={fileInputRef} style={{ display: 'none' }} />

      {/* Header */}
      <div className="flex-shrink-0 border-b bg-white">
        <div className="container mx-auto px-4 max-w-7xl">
          <TermHeader
            view={termHeaderView}
            setView={handleTermHeaderViewChange}
            onCompareClick={() => setIsCompareOpen(true)}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Desktop: Left Sidebar */}
        {!isMobile && (
          <div className="w-80 flex-shrink-0 border-r bg-white overflow-y-auto">
            <div className="p-4 space-y-4">
              {/* Busy Times Accordion */}
              <Accordion type="single" collapsible defaultValue="busy-times">
                <AccordionItem value="busy-times" className="border-b-0">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                    <AccordionTrigger className="flex items-center hover:bg-gray-100 transition-colors [&[data-state=open]>svg]:rotate-180 flex-1 p-0">
                      <h3 className="font-medium text-sm">Busy Times ({busyTimes.length})</h3>
                    </AccordionTrigger>
                    <Button variant="outline" size="sm" onClick={() => {
                      if (isMobile) {
                        setIsAddBusyTimeBottomSheetOpen(true);
                      } else {
                        setIsAddBusyTimeOpen(true);
                      }
                    }} className="h-8 px-3 ml-2">
                      <PlusCircle className="h-4 w-4 mr-1" />
                      Add
                    </Button>
                  </div>
                  <AccordionContent className="pt-3 space-y-3">
                    <AnimatePresence>
                      {busyTimes.map((busyTime) => (
                        <motion.div
                          key={busyTime.id}
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ duration: 0.2 }}
                        >
                          <BusyTimeItem busyTime={busyTime} onEdit={handleEditBusyTime} />
                        </motion.div>
                      ))}
                    </AnimatePresence>
                    {busyTimes.length === 0 && (
                      <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-md text-center">No busy times added.</div>
                    )}
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              {/* Courses Accordion */}
              <Accordion type="single" collapsible defaultValue="courses">
                <AccordionItem value="courses" className="border-b-0">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                    <AccordionTrigger className="flex items-center hover:bg-gray-100 transition-colors [&[data-state=open]>svg]:rotate-180 flex-1 p-0">
                      <h3 className="font-medium text-sm">Courses ({selectedCourses.length}/{courses.length})</h3>
                    </AccordionTrigger>
                    <Button variant="outline" size="sm" onClick={() => setIsCourseSearchDrawerOpen(true)} className="h-8 px-3 ml-2">
                      <PlusCircle className="h-4 w-4 mr-1" />
                      Add
                    </Button>
                  </div>
                  <AccordionContent className="pt-3 space-y-3">
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      <AnimatePresence>
                        {courses.map((course) => (
                          <motion.div
                            key={course.id}
                            className={`bg-white border rounded-lg p-3 flex flex-col justify-between items-start group hover:shadow-sm transition-all w-full ${selectedCourses.includes(course.id) ? 'border-blue-300 bg-blue-50' : 'border-gray-200'}`}
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                          >
                            <div className="flex items-start w-full space-x-2">
                              <Checkbox
                                id={`desktop-course-${course.id}`}
                                checked={selectedCourses.includes(course.id)}
                                onCheckedChange={() => handleCourseToggle(course.id)}
                                className="mt-1"
                              />
                              <div className="flex-1">
                                <div className="flex justify-between items-start w-full">
                                  <div>
                                    <label htmlFor={`desktop-course-${course.id}`} className="cursor-pointer">
                                      <span className="font-medium text-sm mr-2">{course.code}</span>
                                      <Badge variant="secondary" className="text-xs mr-2">{course.credits}cr</Badge>
                                    </label>
                                    <div className="text-xs text-gray-700 mb-1">{course.name}</div>
                                    {/* Show selected section info from the currently active schedule */}
                                    {selectedSchedule && (() => {
                                      const currentSectionInSchedule = selectedSchedule.sections.find(section => section.courseId === course.id);
                                      if (currentSectionInSchedule) {
                                        return (
                                          <div className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded mb-1">
                                            Section {currentSectionInSchedule.sectionNumber} • {currentSectionInSchedule.instructor} • {currentSectionInSchedule.schedule?.[0] ? `${currentSectionInSchedule.schedule[0].days} ${currentSectionInSchedule.schedule[0].startTime}-${currentSectionInSchedule.schedule[0].endTime}` : 'TBA'}
                                          </div>
                                        );
                                      }
                                      return null;
                                    })()}
                                  </div>
                                  <div className="flex space-x-1">
                                    <Button variant="ghost" size="icon" className={`h-6 w-6 ${lockedCourses.includes(course.id) ? 'bg-blue-100 hover:bg-blue-200' : ''}`} onClick={() => handleToggleCourseLock(course.id)}>
                                      {lockedCourses.includes(course.id) ? <Lock className="h-3 w-3 text-blue-600 fill-current" /> : <Unlock className="h-3 w-3 text-gray-500" />}
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive hover:text-destructive/90" onClick={() => handleDeleteCourse(course.id)} aria-label="Delete course">
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                      {courses.length === 0 && (
                        <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-md text-center">No courses added.</div>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>
        )}

        {/* Mobile: Show full-page manage/config view when in 'manage' mode */}
        {isMobile && mobileView === "manage" ? (
          <div className="w-full h-full overflow-y-auto bg-white flex flex-col">
            <div className="p-4 space-y-4">
              {/* Busy Times Section */}
              <Accordion type="single" collapsible defaultValue="busy-times">
                <AccordionItem value="busy-times" className="border-b-0">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                    <AccordionTrigger className="flex items-center hover:bg-gray-100 transition-colors [&[data-state=open]>svg]:rotate-180 flex-1 p-0">
                      <h3 className="font-medium text-base">Busy Times ({busyTimes.length})</h3>
                    </AccordionTrigger>
                    <Button variant="outline" size="sm" onClick={() => setIsAddBusyTimeBottomSheetOpen(true)} className="h-8 px-3 ml-2">
                      <PlusCircle className="h-4 w-4 mr-1" />
                      Add
                    </Button>
                  </div>
                  <AccordionContent className="pt-3 space-y-3">
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      <AnimatePresence>
                        {busyTimes.map((busyTime) => (
                          <motion.div
                            key={busyTime.id}
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                          >
                            <BusyTimeItem busyTime={busyTime} onEdit={handleEditBusyTime} />
                          </motion.div>
                        ))}
                      </AnimatePresence>
                      {busyTimes.length === 0 && (
                        <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-md text-center">No busy times added.</div>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              {/* Courses Section */}
              <Accordion type="single" collapsible defaultValue="courses">
                <AccordionItem value="courses" className="border-b-0">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                    <AccordionTrigger className="flex items-center hover:bg-gray-100 transition-colors [&[data-state=open]>svg]:rotate-180 flex-1 p-0">
                      <h3 className="font-medium text-base">Courses ({selectedCourses.length}/{courses.length})</h3>
                    </AccordionTrigger>
                    <Button variant="outline" size="sm" onClick={() => {
                      setIsCourseSearchDrawerOpen(true);
                      // FIX: Don't change mobile view when opening course search - stay in manage
                    }} className="h-8 px-3 ml-2">
                      <PlusCircle className="h-4 w-4 mr-1" />
                      Add
                    </Button>
                  </div>
                  <AccordionContent className="pt-3 space-y-3">
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      <AnimatePresence>
                        {courses.map((course) => (
                          <motion.div
                            key={course.id}
                            className={`bg-white border rounded-lg p-4 flex flex-col justify-between items-start group hover:shadow-sm transition-all w-full ${selectedCourses.includes(course.id) ? 'border-blue-300 bg-blue-50' : 'border-gray-200'}`}
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
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
                                    <label htmlFor={`course-${course.id}`} className="cursor-pointer">
                                      <span className="font-medium text-base mr-2">{course.code}</span>
                                      <Badge variant="secondary" className="text-xs mr-2">{course.credits}cr</Badge>
                                    </label>
                                    <div className="text-sm text-gray-700 mb-1">{course.name}</div>
                                    {/* Show selected section info from the currently active schedule */}
                                    {selectedSchedule && (() => {
                                      const currentSectionInSchedule = selectedSchedule.sections.find(section => section.courseId === course.id);
                                      if (currentSectionInSchedule) {
                                        return (
                                          <div className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded mb-1">
                                            Section {currentSectionInSchedule.sectionNumber} • {currentSectionInSchedule.instructor} • {currentSectionInSchedule.schedule?.[0] ? `${currentSectionInSchedule.schedule[0].days} ${currentSectionInSchedule.schedule[0].startTime}-${currentSectionInSchedule.schedule[0].endTime}` : 'TBA'}
                                          </div>
                                        );
                                      }
                                      return null;
                                    })()}
                                  </div>
                                  <div className="flex space-x-1">
                                    <Button variant="ghost" size="icon" className={`h-8 w-8 ${lockedCourses.includes(course.id) ? 'bg-blue-100 hover:bg-blue-200' : ''}`} onClick={() => handleToggleCourseLock(course.id)}>
                                      {lockedCourses.includes(course.id) ? <Lock className="h-4 w-4 text-blue-600 fill-current" /> : <Unlock className="h-4 w-4 text-gray-500" />}
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive/90" onClick={() => handleDeleteCourse(course.id)} aria-label="Delete course">
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                      {courses.length === 0 && (
                        <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-md text-center">No courses added.</div>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              {/* Preferences and Generate Schedule Button */}
              <div className="fixed bottom-0 left-0 w-full bg-white border-t p-4 flex flex-col gap-2 z-40">
                <Button variant="outline" onClick={() => setIsTunePreferencesBottomSheetOpen(true)} className="w-full h-10">
                  <SlidersHorizontal className="h-4 w-4 mr-2" /> Preferences
                </Button>
                <Button onClick={handleGenerateSchedule} variant="default" className="w-full h-10 transition-colors" disabled={selectedCourses.length === 0 || isGenerating}>
                  <span className="flex items-center justify-center">
                    <Sparkles className={`h-4 w-4 mr-2 ${isGenerating ? 'animate-spin' : ''}`} />
                    {isGenerating ? 'Generating...' : selectedCourses.length === 0 ? 'Generate Schedule' : `Generate Schedule (${selectedCourses.length} selected)`}
                  </span>
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Show calendar or list view as appropriate */}
            <AnimatePresence mode="wait">
              {(view === "calendar" && !isMobile) || (isMobile && mobileView === "calendar" && view === "calendar") ? (
                <motion.div
                  key="calendar"
                  className={`flex-1 overflow-hidden ${isMobile ? '-mx-4 -mb-4' : ''}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <ScheduleCalendarView lockedCourses={lockedCourses} />
                </motion.div>
              ) : (view === "list" && !isMobile) || (isMobile && mobileView === "calendar" && view === "list") ? (
                <motion.div
                  key="list"
                  className={`flex-1 overflow-auto ${isMobile ? 'p-2' : 'p-4'}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <ScheduleListView />
                </motion.div>
              ) : null}
            </AnimatePresence>
          </>
        )}
      </div>

      {/* Dialogs */}
      <AddBusyTimeDialog open={isAddBusyTimeOpen} onOpenChange={setIsAddBusyTimeOpen} />
      <EditBusyTimeDialog open={isEditBusyTimeOpen} onOpenChange={setIsEditBusyTimeOpen} busyTime={selectedBusyTime} />
      <TunePreferencesDialog open={isPreferencesOpen} onOpenChange={setIsPreferencesOpen} />
      <CompareSchedulesDialog open={isCompareOpen} onOpenChange={setIsCompareOpen} />

      {/* AI Advisor - Desktop uses AIAdvisor, Mobile uses AIAdvisorBottomSheet */}
      {!isMobile && (
        <AIAdvisor open={isAIAdvisorOpen} onOpenChange={setIsAIAdvisorOpen} />
      )}

      {/* Course Search - Desktop uses Modal, Mobile uses Bottom Sheet */}
      <CourseSearchModal
        open={isCourseSearchDrawerOpen}
        onOpenChange={(open) => {
          setIsCourseSearchDrawerOpen(open);
          // FIX: Don't change mobile view when closing modal - stay in manage view
          // if (isMobile && !open && mobileView === "manage") {
          //   // Keep in manage view
          // }
        }}
        onCourseSelected={(course) => {
          addCourse(course);
          // FIX: Don't auto-close or change view when adding course on mobile
        }}
      />

      {/* Mobile Bottom Sheets */}
      <CourseDetailBottomSheet
        open={isCourseDetailBottomSheetOpen}
        onOpenChange={setIsCourseDetailBottomSheetOpen}
        course={selectedCourseForDetail}
        onAddCourse={(course) => {
          addCourse(course);
          setIsCourseDetailBottomSheetOpen(false);
        }}
        isAdded={selectedCourseForDetail ? courses.some(c => c.id === selectedCourseForDetail.id) : false}
      />

      <AddBusyTimeBottomSheet
        open={isAddBusyTimeBottomSheetOpen}
        onOpenChange={setIsAddBusyTimeBottomSheetOpen}
      />

      <EditBusyTimeBottomSheet
        open={isEditBusyTimeBottomSheetOpen}
        onOpenChange={setIsEditBusyTimeBottomSheetOpen}
        busyTime={selectedBusyTime}
      />

      <TunePreferencesBottomSheet
        open={isTunePreferencesBottomSheetOpen}
        onOpenChange={setIsTunePreferencesBottomSheetOpen}
      />

      {/* Mobile AI Advisor Bottom Sheet */}
      {isMobile && (
        <AIAdvisorBottomSheet
          open={isAIAdvisorBottomSheetOpen}
          onOpenChange={setIsAIAdvisorBottomSheetOpen}
        />
      )}

      {/* Mobile Floating Icons - Stacked vertically */}
      {isMobile && (
        <div className="fixed bottom-4 right-4 z-50 flex flex-col space-y-3">
          {/* AI Advisor Floating Button */}
          <Button
            size="lg"
            className="rounded-full shadow-lg bg-gradient-to-r from-purple-600 to-violet-500 hover:from-purple-700 hover:to-violet-600 h-12 w-12 p-0 flex items-center justify-center"
            onClick={() => setIsAIAdvisorBottomSheetOpen(true)}
            aria-label="Ask AI Advisor"
          >
            <Sparkles className="h-5 w-5 text-white" />
          </Button>

          {/* Schedule Management Floating Tab */}
          <Button
            className="rounded-full shadow-lg bg-primary hover:bg-primary/90 text-primary-foreground h-12 w-12 p-0 flex items-center justify-center"
            onClick={() => {
              if (mobileView === "manage") {
                setMobileView("calendar");
              } else {
                setMobileView("manage");
                // When going to manage mode, ensure we're in calendar view (not list)
                if (view === "list") {
                  setView("calendar");
                }
              }
            }}
            aria-label={mobileView === "calendar" ? "Show Manage View" : "Show Calendar View"}
          >
            {mobileView === "calendar" ? (
              <SlidersHorizontal className="h-5 w-5" />
            ) : (
              <CalendarIcon className="h-5 w-5" />
            )}
          </Button>
        </div>
      )}

      {/* Desktop Sticky Action Buttons */}
      {!isMobile && (
        <div className="fixed bottom-4 left-4 w-72 z-50 hidden md:block">
          <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-4 space-y-2">
            <Button variant="outline" onClick={() => {
              if (isMobile) {
                setIsTunePreferencesBottomSheetOpen(true);
              } else {
                setIsPreferencesOpen(true);
              }
            }} className="w-full h-10">
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              Preferences
            </Button>
            <Button onClick={handleGenerateSchedule} variant="default" className="w-full h-10 transition-colors" disabled={selectedCourses.length === 0 || isGenerating}>
              <span className="flex items-center justify-center">
                <Sparkles className={`h-4 w-4 mr-2 ${isGenerating ? 'animate-spin' : ''}`} />
                {isGenerating ? 'Generating...' : selectedCourses.length === 0 ? 'Generate Schedule' : `Generate Schedule (${selectedCourses.length} selected)`}
              </span>
            </Button>
            <Button variant="outline" onClick={() => setIsAIAdvisorOpen(true)} className="w-full h-10">
              <Sparkles className="h-4 w-4 mr-2" />
              Ask AI Advisor
            </Button>
          </div>
        </div>
      )}
    </>
  );
};

export default ScheduleTool;