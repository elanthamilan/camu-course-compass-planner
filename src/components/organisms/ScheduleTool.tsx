import React, { useState, useEffect } from "react";
import TermHeader from "../molecules/TermHeader";
import { Button } from "@/components/atoms/button";
import { Badge } from "@/components/atoms/badge";
import { Checkbox } from "@/components/atoms/checkbox";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/atoms/accordion";
import { Course, CourseSection, ExportedSchedule, Schedule } from "../../lib/types";
import type { BusyTime } from "../../lib/types";
import { useSchedule } from "../../contexts/ScheduleContext";
import ScheduleCalendarView from "./ScheduleCalendarView";
import ScheduleListView from "./ScheduleListView";
import BusyTimeItem from "../molecules/BusyTimeItem";
import AddBusyTimeDialog from "./AddBusyTimeDialog";
import EditBusyTimeDialog from "./EditBusyTimeDialog";
import AIAdvisor from "./AIAdvisor";
import TunePreferencesDialog from "./TunePreferencesDialog";
import CompareSchedulesDialog from "./CompareSchedulesDialog";
import { PlusCircle, SlidersHorizontal, Sparkles, Trash2, Lock, Unlock, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import CourseSearchModal from "./CourseSearchModal";
import CourseDetailBottomSheet from "./CourseDetailBottomSheet";
import AddBusyTimeBottomSheet from "./AddBusyTimeBottomSheet";
import EditBusyTimeBottomSheet from "./EditBusyTimeBottomSheet";
import TunePreferencesBottomSheet from "./TunePreferencesBottomSheet";
import AIAdvisorBottomSheet from "./AIAdvisorBottomSheet";
import { BottomSheet } from "@/components/atoms/bottom-sheet";
import { useIsMobile } from "../../hooks/use-mobile";
import { mockCourses } from "../../lib/mock-data";
import { IconButton } from '../molecules/IconButton';
import { v4 as uuidv4 } from 'uuid';

// Helper function to format time from "HH:mm" to "h:mm A"
const formatTime = (timeStr: string): string => {
  if (!timeStr) return "N/A";
  const [hours, minutes] = timeStr.split(':');
  const h = parseInt(hours, 10);
  const m = parseInt(minutes, 10);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const formattedHours = h % 12 || 12; // Convert 0 to 12 for 12 AM, and 12 to 12 for 12 PM
  return `${formattedHours}:${m < 10 ? '0' + m : m} ${ampm}`;
};

// Helper function to format section schedule
const formatSectionSchedule = (scheduleArray: CourseSection['schedule']): string => {
  if (!scheduleArray || scheduleArray.length === 0) return "TBA";
  return scheduleArray.map(slot => {
    const days = slot.days || "N/A"; // slot.days is already a string like "MWF" or "TuTh" based on types.ts (it's string, not string[])
                                     // If it were string[], it would be slot.days.join('')
    const startTime = formatTime(slot.startTime);
    const endTime = formatTime(slot.endTime);
    return `${days} ${startTime} - ${endTime}`;
  }).join(', ');
};


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
    selectedSectionMap, // Added for desktop section selection
    updateSelectedSectionMap, // Added for desktop section selection
    lockedCourses,
    toggleCourseLock,
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
  const [mobileView, setMobileView] = useState<"calendar" | "list">("calendar"); // Mobile view state
  const [manageViewActive, setManageViewActive] = useState(false);

  const [isAddBusyTimeOpen, setIsAddBusyTimeOpen] = useState(false);
  const [isEditBusyTimeOpen, setIsEditBusyTimeOpen] = useState(false);
  const [selectedBusyTime, setSelectedBusyTime] = useState<BusyTime | null>(null); // Busy time selected for editing
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [isPreferencesOpen, setIsPreferencesOpen] = useState(false);
  const [isCourseDetailBottomSheetOpen, setIsCourseDetailBottomSheetOpen] = useState(false);
  const [selectedCourseForDetail, setSelectedCourseForDetail] = useState<Course | null>(null);

  // Course Selection and Configuration State
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]); // IDs of courses checked by the user for generation

  const [isGenerating, setIsGenerating] = useState(false); // Whether schedule generation is in progress
  const [justGeneratedSchedules, setJustGeneratedSchedules] = useState(false);

  // Effect to initialize `selectedCourses` based on `courses` from context.
  // This ensures that if courses are added/removed externally, the checkboxes reflect that.
  useEffect(() => {
    setSelectedCourses(courses.map(course => course.id));
  }, [courses]);

  // Effect for handling navigation after schedule generation on mobile
  useEffect(() => {
    // This effect runs when `justGeneratedSchedules` changes.
    // It checks if schedules were indeed generated and if the conditions for mobile navigation are met.
    if (justGeneratedSchedules) {
      if (isMobile && manageViewActive && schedules && schedules.length > 0) {
        setManageViewActive(false);
        // Optional: toast.success("Displaying generated schedules.");
        // The generateSchedules function in context already toasts success/failure.
      }
      // Always reset the trigger flag after checking.
      setJustGeneratedSchedules(false);
    }
  }, [justGeneratedSchedules, schedules, isMobile, manageViewActive, setManageViewActive]); // Added setManageViewActive to dependencies

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
    if (isMobile) {
      setIsEditBusyTimeBottomSheetOpen(true);
    } else {
      setIsEditBusyTimeOpen(true);
    }
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
            toast.error(`Some locked courses (${missingFixedCourses.join(', ')}) couldn't use their original sections and will be rescheduled if possible.`);
          }
        }
      }

      // Call the context function to generate schedules
      generateSchedules(selectedCourses, fixedSectionsForGeneration);
      setJustGeneratedSchedules(true);

    } catch (error) {
      console.error("Error generating schedules:", error);
      toast.error("Sorry, something went wrong while generating schedules. Please try again.");
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
    toggleCourseLock(courseId);
  };

  // Pass the correct value and setter to TermHeader
  const termHeaderView = isMobile ? mobileView : view;
  const handleTermHeaderViewChange = (val: string) => {
    if (isMobile) {
      setMobileView(val as "calendar" | "list");
      // setView("calendar"); // This line is removed
    } else {
      setView(val as "calendar" | "list");
    }
  };

  return (
    <>
      <input type="file" accept=".json" ref={fileInputRef} style={{ display: 'none' }} />

      {/* Header */}
      {!(isMobile && manageViewActive) && (
        <div className="flex-shrink-0 border-b bg-white">
          <div className="container mx-auto px-4 max-w-7xl">
            <TermHeader
              view={termHeaderView}
              setView={handleTermHeaderViewChange}
              onCompareClick={() => setIsCompareOpen(true)}
            />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Desktop: Left Sidebar */}
        {!isMobile && (
          <div className="w-80 flex-shrink-0 border-r bg-white overflow-y-auto">
            <div className="p-4 space-y-4">
              {/* Busy Times Accordion */}
              <Accordion type="single" defaultValue="busy-times">
                <AccordionItem value="busy-times" className="border-b-0">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                    <AccordionTrigger className="flex items-center hover:bg-gray-100 transition-colors [&[data-state=open]>svg]:rotate-180 flex-1 p-0">
                      <h3 className="font-medium text-sm">Busy Times ({busyTimes.length})</h3>
                    </AccordionTrigger>
                    <Button variant="outline" size="sm" onClick={() => setIsAddBusyTimeOpen(true)} className="h-8 px-3 ml-2">
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
              <Accordion type="single" defaultValue="courses">
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
                    <div className="space-y-2 max-h-[30rem] overflow-y-auto"> {/* Adjusted max-h for desktop */}
                      {courses.length === 0 && (
                        <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-md text-center">No courses added.</div>
                      )}
                      <Accordion type="multiple" className="w-full">
                        <AnimatePresence>
                          {courses.map((course) => (
                            <AccordionItem key={course.id} value={course.id} className="border-b last:border-b-0">
                              <motion.div
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.2 }}
                                className={`bg-white border rounded-lg group hover:shadow-sm transition-all w-full mb-1 ${selectedCourses.includes(course.id) ? 'border-blue-300 bg-blue-50' : 'border-gray-200'}`}
                              >
                                <div className="flex items-start w-full space-x-2 p-2.5"> {/* p-2.5 for trigger area */}
                                  <Checkbox
                                    id={`desktop-course-${course.id}`}
                                    checked={selectedCourses.includes(course.id)}
                                    onCheckedChange={() => handleCourseToggle(course.id)}
                                    className="mt-1"
                                    aria-label={`Select course ${course.code}`}
                                  />
                                  <AccordionTrigger className="flex-1 p-0 text-left">
                                    <div className="flex flex-col w-full">
                                      <div className="flex justify-between items-start w-full">
                                        <div>
                                          <label htmlFor={`desktop-course-${course.id}`} className="cursor-pointer">
                                            <span className="font-medium text-sm mr-1.5">{course.code}</span>
                                            <Badge variant="secondary" className="text-xs mr-1.5">{course.credits}cr</Badge>
                                          </label>
                                          <div className="text-xs text-gray-700 mb-1">{course.name}</div>
                                          {selectedSchedule && (() => {
                                            const currentSectionInSchedule = selectedSchedule.sections.find(section => section.courseId === course.id);
                                            if (currentSectionInSchedule) {
                                              return (
                                                <div className="text-xs text-blue-600 bg-blue-100 px-1.5 py-0.5 rounded my-1">
                                                  Sec {currentSectionInSchedule.sectionNumber} • {currentSectionInSchedule.instructor} • {formatSectionSchedule(currentSectionInSchedule.schedule) || 'TBA'}
                                                </div>
                                              );
                                            }
                                            return null;
                                          })()}
                                        </div>
                                      </div>
                                    </div>
                                  </AccordionTrigger>
                                  <div className="flex flex-col space-y-1 ml-1.5 items-center justify-center">
                                    <Button variant="ghost" size="icon" className={`h-7 w-7 ${lockedCourses.includes(course.id) ? 'bg-blue-100 hover:bg-blue-200' : ''}`} onClick={() => handleToggleCourseLock(course.id)}>
                                      {lockedCourses.includes(course.id) ? <Lock className="h-3.5 w-3.5 text-blue-600 fill-current" /> : <Unlock className="h-3.5 w-3.5 text-gray-500" />}
                                    </Button>
                                    <IconButton
                                      icon={Trash2}
                                      label="Delete course"
                                      variant="ghost"
                                      onClick={() => handleDeleteCourse(course.id)}
                                      className="h-7 w-7 text-destructive hover:text-destructive/90"
                                      iconClassName="h-3.5 w-3.5"
                                    />
                                  </div>
                                </div>
                                <AccordionContent className="p-3 border-t border-gray-200 bg-white rounded-b-lg">
                                  <div className="space-y-3">
                                    <div>
                                      <h4 className="text-xs font-semibold mb-1 text-gray-600">Prerequisites</h4>
                                      <p className="text-xs text-gray-700">
                                        {course.prerequisites && course.prerequisites.length > 0
                                          ? course.prerequisites.join(', ')
                                          : "None"}
                                      </p>
                                    </div>
                                    <div>
                                      <h4 className="text-xs font-semibold mb-2 text-gray-600">Available Sections</h4>
                                      {course.sections && course.sections.length > 0 ? (
                                        <>
                                          <div className="flex items-center space-x-2 mb-2">
                                            <Checkbox
                                              id={`desktop-course-${course.id}-select-all`}
                                              checked={selectedSectionMap[course.id] === 'all'}
                                              onCheckedChange={(checked) => {
                                                updateSelectedSectionMap(course.id, checked ? 'all' : (course.sections && course.sections.length > 0 ? [course.sections[0].id] : []));
                                              }}
                                            />
                                            <label htmlFor={`desktop-course-${course.id}-select-all`} className="text-xs text-gray-700 cursor-pointer">
                                              Use any available section (auto-select)
                                            </label>
                                          </div>
                                          <ul className="space-y-2 max-h-48 overflow-y-auto border rounded-md p-2 bg-gray-50/50">
                                            {course.sections.map(section => {
                                              const currentCourseSelections = selectedSectionMap[course.id];
                                              const isSectionSelected = Array.isArray(currentCourseSelections) && currentCourseSelections.includes(section.id);
                                              return (
                                                <li key={section.id} className="text-xs text-gray-700 p-1.5 rounded-md hover:bg-gray-100 transition-colors">
                                                  <div className="flex items-center space-x-2">
                                                    <Checkbox
                                                      id={`desktop-section-${section.id}`}
                                                      checked={isSectionSelected}
                                                      disabled={selectedSectionMap[course.id] === 'all'}
                                                      onCheckedChange={(checked) => {
                                                        let newSelectionArray: string[];
                                                        const currentSelection = selectedSectionMap[course.id];
                                                        if (checked) {
                                                          newSelectionArray = Array.isArray(currentSelection) ? [...currentSelection, section.id] : [section.id];
                                                        } else {
                                                          newSelectionArray = Array.isArray(currentSelection) ? currentSelection.filter(id => id !== section.id) : [];
                                                        }
                                                        updateSelectedSectionMap(course.id, newSelectionArray);
                                                      }}
                                                      aria-label={`Select section ${section.sectionNumber}`}
                                                    />
                                                    <label htmlFor={`desktop-section-${section.id}`} className={`flex-1 cursor-pointer ${selectedSectionMap[course.id] === 'all' ? 'opacity-50' : ''}`}>
                                                      <div className="font-medium">Sec {section.sectionNumber} - {section.instructor}</div>
                                                      <div>{formatSectionSchedule(section.schedule)}</div>
                                                      <div>Loc: {section.location || "N/A"} ({section.instructionMode || 'In-Person'})</div>
                                                    </label>
                                                  </div>
                                                </li>
                                              );
                                            })}
                                          </ul>
                                        </>
                                      ) : (
                                        <p className="text-xs text-gray-500">No sections available for this course.</p>
                                      )}
                                    </div>
                                  </div>
                                </AccordionContent>
                              </motion.div>
                            </AccordionItem>
                          ))}
                        </AnimatePresence>
                      </Accordion>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>
        )}

    {/* Main content area that switches */}
    {isMobile && manageViewActive ? (
      // Content for Manage Schedule View on Mobile (New)
      <div className="w-full h-full overflow-y-auto bg-white flex flex-col"> {/* Removed p-4, space-y-4 from here, will add to inner container */}
        {/* Header for Manage View */}
        <div className="flex items-center justify-center p-3 border-b sticky top-0 bg-white z-10"> {/* Made header sticky */}
          <h2 className="text-lg font-semibold">Manage Schedule</h2>
        </div>

        <div className="p-4 space-y-4 flex-1"> {/* Inner container for padding and scrolling content */}
          {/* Accordions and Buttons (copied from the old BottomSheet content) */}
          {/* Busy Times Accordion */}
          <Accordion type="single" defaultValue="busy-times" className="w-full">
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
                <div className="space-y-2 max-h-48 overflow-y-auto"> {/* Preserved max-h and overflow */}
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

          {/* Courses Accordion */}
          <Accordion type="single" defaultValue="courses" className="w-full">
            <AccordionItem value="courses" className="border-b-0">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                <AccordionTrigger className="flex items-center hover:bg-gray-100 transition-colors [&[data-state=open]>svg]:rotate-180 flex-1 p-0">
                  <h3 className="font-medium text-base">Courses ({selectedCourses.length}/{courses.length})</h3>
                </AccordionTrigger>
                <Button variant="outline" size="sm" onClick={() => setIsCourseSearchDrawerOpen(true)} className="h-8 px-3 ml-2">
                  <PlusCircle className="h-4 w-4 mr-1" />
                  Add
                </Button>
              </div>
              <AccordionContent className="pt-3 space-y-3">
                <div className="space-y-2 max-h-96 overflow-y-auto"> {/* Increased max-h for accordion content */}
                  {courses.length === 0 && (
                    <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-md text-center">No courses added.</div>
                  )}
                  <Accordion type="multiple" className="w-full">
                    <AnimatePresence>
                      {courses.map((course) => (
                        <AccordionItem key={course.id} value={course.id} className="border-b last:border-b-0">
                          {/* motion.div will be part of AccordionItem, or AccordionTrigger/Content might have their own motion if needed */}
                          {/* For now, let's use the existing motion.div as the container for the AccordionItem content */}
                           <motion.div
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                            className={`bg-white border rounded-lg group hover:shadow-sm transition-all w-full mb-2 ${selectedCourses.includes(course.id) ? 'border-blue-300 bg-blue-50' : 'border-gray-200'}`}
                          >
                            <div className="flex items-start w-full space-x-2 p-3"> {/* p-3 here for trigger area */}
                              <Checkbox
                                id={`course-manage-${course.id}`}
                                checked={selectedCourses.includes(course.id)}
                                onCheckedChange={() => handleCourseToggle(course.id)}
                                className="mt-1"
                                aria-label={`Select course ${course.code}`}
                              />
                              <AccordionTrigger className="flex-1 p-0 text-left">
                                <div className="flex flex-col w-full">
                                  <div className="flex justify-between items-start w-full">
                                    <div>
                                      <label htmlFor={`course-manage-${course.id}`} className="cursor-pointer">
                                        <span className="font-medium text-base mr-2">{course.code}</span>
                                        <Badge variant="secondary" className="text-xs mr-2">{course.credits}cr</Badge>
                                      </label>
                                      <div className="text-sm text-gray-700 mb-1">{course.name}</div>
                                      {/* Show selected section info from the currently active schedule */}
                                      {selectedSchedule && (() => {
                                        const currentSectionInSchedule = selectedSchedule.sections.find(section => section.courseId === course.id);
                                        if (currentSectionInSchedule) {
                                          return (
                                            <div className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded my-1">
                                              Sec {currentSectionInSchedule.sectionNumber} • {currentSectionInSchedule.instructor} • {formatSectionSchedule(currentSectionInSchedule.schedule) || 'TBA'}
                                            </div>
                                          );
                                        }
                                        return null;
                                      })()}
                                    </div>
                                  </div>
                                </div>
                              </AccordionTrigger>
                              {/* Buttons next to trigger */}
                              {/* Ensure these buttons are vertically centered with the trigger text if possible, or adjust layout as needed */}
                              <div className="flex flex-col space-y-1 ml-2 items-center justify-center">
                                <Button variant="ghost" size="icon" className={`h-8 w-8 ${lockedCourses.includes(course.id) ? 'bg-blue-100 hover:bg-blue-200' : ''}`} onClick={() => handleToggleCourseLock(course.id)}>
                                  {lockedCourses.includes(course.id) ? <Lock className="h-4 w-4 text-blue-600 fill-current" /> : <Unlock className="h-4 w-4 text-gray-500" />}
                                </Button>
                                <IconButton
                                  icon={Trash2}
                                  label="Delete course"
                                  variant="ghost"
                                  onClick={() => handleDeleteCourse(course.id)}
                                  className="h-8 w-8 text-destructive hover:text-destructive/90"
                                  iconClassName="h-4 w-4"
                                />
                              </div>
                            </div>
                            <AccordionContent className="p-3 border-t border-gray-200 bg-white rounded-b-lg">
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.3 }}
                                className="space-y-3 overflow-hidden" // Added overflow-hidden for smoother animation
                              >
                                <div>
                                  <h4 className="text-sm font-semibold mb-1">Description</h4>
                                  <p className="text-xs text-gray-700">{course.description || "No description available."}</p>
                                </div>
                                <div>
                                  <h4 className="text-sm font-semibold mb-1">Prerequisites</h4>
                                  <p className="text-xs text-gray-700">
                                    {course.prerequisites && course.prerequisites.length > 0
                                      ? course.prerequisites.join(', ')
                                      : "None"}
                                  </p>
                                </div>
                                <div>
                                  <h4 className="text-sm font-semibold mb-2">Available Sections</h4>
                                  {course.sections && course.sections.length > 0 ? (
                                    <>
                                      <div className="flex items-center space-x-2 mb-2">
                                        <Checkbox
                                          id={`mobile-course-${course.id}-select-all`}
                                          checked={selectedSectionMap[course.id] === 'all'}
                                          onCheckedChange={(checked) => {
                                            updateSelectedSectionMap(course.id, checked ? 'all' : (course.sections && course.sections.length > 0 ? [course.sections[0].id] : []));
                                          }}
                                          aria-label="Select all sections for this course"
                                        />
                                        <label htmlFor={`mobile-course-${course.id}-select-all`} className="text-xs text-gray-700 cursor-pointer">
                                          Use any available section (auto-select)
                                        </label>
                                      </div>
                                      <ul className="space-y-2 max-h-48 overflow-y-auto border rounded-md p-2 bg-gray-50/50">
                                        {course.sections.map(section => {
                                          const currentCourseSelections = selectedSectionMap[course.id];
                                          const isSectionSelected = Array.isArray(currentCourseSelections) && currentCourseSelections.includes(section.id);
                                          return (
                                            <li key={section.id} className="text-xs text-gray-700 p-1.5 rounded-md hover:bg-gray-100 transition-colors">
                                              <div className="flex items-center space-x-2">
                                                <Checkbox
                                                  id={`mobile-section-${section.id}`}
                                                  checked={isSectionSelected}
                                                  disabled={selectedSectionMap[course.id] === 'all'}
                                                  onCheckedChange={(checked) => {
                                                    let newSelectionArray: string[];
                                                    const currentSelection = selectedSectionMap[course.id];
                                                    if (checked) {
                                                      newSelectionArray = Array.isArray(currentSelection) ? [...currentSelection, section.id] : [section.id];
                                                    } else {
                                                      newSelectionArray = Array.isArray(currentSelection) ? currentSelection.filter(id => id !== section.id) : [];
                                                    }
                                                    updateSelectedSectionMap(course.id, newSelectionArray);
                                                  }}
                                                  aria-label={`Select section ${section.sectionNumber}`}
                                                />
                                                <label htmlFor={`mobile-section-${section.id}`} className={`flex-1 cursor-pointer ${selectedSectionMap[course.id] === 'all' ? 'opacity-50' : ''}`}>
                                                  <div className="font-medium">Sec {section.sectionNumber} - {section.instructor}</div>
                                                  <div>{formatSectionSchedule(section.schedule)}</div>
                                                  <div>Loc: {section.location || "N/A"} ({section.instructionMode || 'In-Person'})</div>
                                                </label>
                                              </div>
                                            </li>
                                          );
                                        })}
                                      </ul>
                                    </>
                                  ) : (
                                    <p className="text-xs text-gray-500 bg-gray-50 p-3 rounded-md text-center">No sections available for this course.</p>
                                  )}
                                </div>
                              </motion.div>
                            </AccordionContent>
                          </motion.div>
                        </AccordionItem>
                      ))}
                    </AnimatePresence>
                  </Accordion>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          {/* Action Buttons */}
          <div className="space-y-2 pt-2"> {/* Removed pb-4, bottom padding handled by parent if needed or sticky footer */}
            <Button variant="outline" onClick={() => setIsTunePreferencesBottomSheetOpen(true)} className="w-full h-10">
              <SlidersHorizontal className="h-4 w-4 mr-2" /> Preferences
            </Button>
            <Button onClick={handleGenerateSchedule} variant="default" className="w-full h-10 transition-colors" disabled={selectedCourses.length === 0 || isGenerating}>
              <span className="flex items-center justify-center">
                <Sparkles className={`h-4 w-4 mr-2 ${isGenerating ? 'animate-spin' : ''}`} />
                {isGenerating ? 'Generating...' : selectedCourses.length === 0 ? 'Generate Schedule' : `Generate Schedule (${selectedCourses.length} selected)`}
              </span>
            </Button>
            <Button variant="ghost" onClick={() => setManageViewActive(false)} className="w-full h-10">
              Cancel
            </Button>
          </div>
        </div>
      </div>
    ) : (
      // Existing Calendar/List View Logic (wrapped in AnimatePresence)
      // This is the content for the div with class "flex-1 flex overflow-hidden" when not in mobile manage view
      <div className="flex-1 overflow-y-auto"> {/* Added overflow-y-auto here for the calendar/list content */}
        <AnimatePresence mode="wait">
          {isMobile ? (
            mobileView === "calendar" ? (
              <motion.div
                key="calendar-mobile"
                className="flex-1 overflow-hidden -mx-4 -mb-4" /* Original classes */
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <ScheduleCalendarView lockedCourses={lockedCourses} />
              </motion.div>
            ) : mobileView === "list" ? (
              <motion.div
                key="list-mobile"
                className="flex-1 overflow-auto p-2" /* Original classes */
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <ScheduleListView />
              </motion.div>
            ) : null
          ) : (
            // Desktop view
            view === "calendar" ? (
              <motion.div
                key="calendar-desktop"
                className="flex-1 overflow-hidden" /* Original classes */
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <ScheduleCalendarView lockedCourses={lockedCourses} />
              </motion.div>
            ) : view === "list" ? (
              <motion.div
                key="list-desktop"
                className="flex-1 overflow-auto p-4" /* Original classes */
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <ScheduleListView />
              </motion.div>
            ) : null
          )}
        </AnimatePresence>
      </div>
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
        onOpenChange={setIsCourseSearchDrawerOpen}
        onCourseSelected={(course) => {
          addCourse(course);
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
          {!manageViewActive && ( // Only show Config FAB if not in manage view
            <motion.div whileTap={{ scale: 0.97, transition: { duration: 0.1 } }}>
              <Button
                size="lg"
                className="rounded-full shadow-lg bg-primary hover:bg-primary/90 text-primary-foreground h-12 w-12 p-0 flex items-center justify-center"
                onClick={() => setManageViewActive(true)}
                aria-label="Manage Schedule"
              >
                <SlidersHorizontal className="h-5 w-5" />
              </Button>
            </motion.div>
          )}
          {/* AI Advisor Floating Button (remains unchanged and always visible if mobile) */}
          <motion.div whileTap={{ scale: 0.97, transition: { duration: 0.1 } }}>
            <Button
              size="lg"
              className="rounded-full shadow-lg bg-gradient-to-r from-purple-600 to-violet-500 hover:from-purple-700 hover:to-violet-600 h-12 w-12 p-0 flex items-center justify-center"
              onClick={() => setIsAIAdvisorBottomSheetOpen(true)}
              aria-label="Ask AI Advisor"
            >
              <Sparkles className="h-5 w-5 text-white" />
            </Button>
          </motion.div>
        </div>
      )}

      {/* Desktop Sticky Action Buttons */}
      {!isMobile && (
        <div className="fixed bottom-4 left-4 w-72 z-50 hidden md:block">
          <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-4 space-y-2">
            <Button variant="outline" onClick={() => setIsPreferencesOpen(true)} className="w-full h-10">
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              Preferences
            </Button>
            <Button onClick={handleGenerateSchedule} variant="default" className="w-full h-10 transition-colors" disabled={selectedCourses.length === 0 || isGenerating}>
              <span className="flex items-center justify-center">
                <Sparkles className={`h-4 w-4 mr-2 ${isGenerating ? 'animate-spin' : ''}`} />
                {isGenerating ? 'Generating...' : selectedCourses.length === 0 ? 'Generate Schedule' : `Generate Schedule (${selectedCourses.length} selected)`}
              </span>
            </Button>
          </div>
        </div>
      )}
    </>
  );
};

export default ScheduleTool;