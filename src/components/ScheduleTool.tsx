import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
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
import AIAdvisor from "./AIAdvisor"; // Re-added AIAdvisor import
import TunePreferencesDialog from "./TunePreferencesDialog";
import CompareSchedulesDialog from "./CompareSchedulesDialog";
import { PlusCircle, Sliders, ArrowLeftRight, ChevronDown, ChevronUp, CalendarPlus, Sparkles, Trash2, Download, Upload, Settings, ListChecks, CalendarDays, Edit3, Copy as CopyIcon, Share2, Lock, Unlock, AlertTriangle, ShoppingCart } from "lucide-react"; // Added ShoppingCart
import { motion, AnimatePresence } from "framer-motion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { downloadJson } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ExportedSchedule, Schedule as ScheduleType, CourseSection as CourseSectionType, BusyTime as BusyTimeType, ScheduleConflict as ScheduleConflictType } from "@/lib/types";
import { v4 as uuidv4 } from 'uuid';
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { SlidersHorizontal } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuLabel } from "@/components/ui/dropdown-menu";
import { mockCourses } from "@/lib/mock-data";
import CourseSearchModal from "./CourseSearchModal";

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
  const navigate = useNavigate();
  const {
    courses, // Courses selected by the user for planning
    busyTimes, // User-defined busy times
    selectedSchedule, // The currently active schedule being viewed
    generateSchedules, // Function from context to generate schedules
    removeCourse, // Function from context to remove a course
    schedules, // List of all generated/saved schedules
    selectSchedule, // Function from context to select a schedule
    addSchedule, // Function from context to add a new (e.g., imported) schedule
    currentTerm, // The currently active academic term
    allCourses = mockCourses, // Full catalog of courses; defaults to mock if not provided by context
    selectedSectionMap, // Map of user-selected specific sections for each course
    updateSelectedSectionMap, // Func to update selected sections
    excludeHonorsMap, // Map of user preference to exclude honors sections
    updateExcludeHonorsMap, // Func to update honors exclusion
    removeSchedule, // Function from context to delete a schedule
    setSchedules, // Function from context to manually set all schedules (e.g., for rename)
    studentInfo, // Information about the current student
    addCourse, // Function from context to add a course to the planning list
    moveToCart, // Function from context to move selected schedule to cart
  } = useSchedule();

  const completedCourseCodes = studentInfo?.completedCourses || []; // Student's completed courses for prerequisite checks
  const fileInputRef = React.useRef<HTMLInputElement>(null); // Ref for file input used in schedule import

  // UI State
  const [isCourseSearchDrawerOpen, setIsCourseSearchDrawerOpen] = useState(false);
  const [view, setView] = useState<"calendar" | "list">("calendar"); // Current view mode: 'calendar' or 'list'
  const [isAddBusyTimeOpen, setIsAddBusyTimeOpen] = useState(false);
  const [isEditBusyTimeOpen, setIsEditBusyTimeOpen] = useState(false);
  const [selectedBusyTime, setSelectedBusyTime] = useState<BusyTimeType | null>(null); // Busy time selected for editing
  const [isAIAdvisorOpen, setIsAIAdvisorOpen] = useState(false);
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [isPreferencesOpen, setIsPreferencesOpen] = useState(false);

  // Course Selection and Configuration State
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]); // IDs of courses checked by the user for generation
  const [expandedCourses, setExpandedCourses] = useState<Record<string, boolean>>({}); // Which courses' details are expanded
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
  // TODO: Consider making auto-generation more explicit or configurable by the user.
  useEffect(() => {
    if (courses.length > 0 && schedules.length === 0 && selectedCourses.length > 0 && !isGenerating) {
      // Only auto-generate if there are courses, no existing schedules, selected courses for generation, and not already generating.
      // This aims to provide an initial set of schedules for the user.
      const timeoutId = setTimeout(() => {
        // console.log("Attempting initial automatic schedule generation."); // For debugging
        handleGenerateSchedule();
      }, 500); // Timeout to allow other initial state updates to settle.

      return () => clearTimeout(timeoutId);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courses.length, schedules.length]); // Dependencies: re-run if course count or schedule count changes.
                                          // selectedCourses.length was removed to avoid potential circular updates if it was set by this effect.
                                          // isGenerating is added to avoid re-triggering if already generating.

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
  const handleEditBusyTime = (busyTime: BusyTimeType) => {
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
            toast.warn(`Sections for locked courses (${missingFixedCourses.join(', ')}) were not found in the current base schedule and will be scheduled dynamically if possible.`);
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

  /** Toggles the expanded/collapsed state of a course's detail view. */
  const toggleCourseExpanded = (courseId: string) => {
    setExpandedCourses(prev => ({ ...prev, [courseId]: !prev[courseId] }));
  };

  /** Removes a course from the planning list using the context function. */
  const handleDeleteCourse = (courseId: string) => {
    removeCourse(courseId); // Context function handles toast
  };

  /** Exports the currently selected schedule to a JSON file. */
  const handleExportSchedule = () => {
    if (!selectedSchedule) { toast.error("No schedule selected to export."); return; }
    if (!currentTerm) { toast.error("Current term context is not available. Cannot export."); return; }
    const exportedScheduleData: ExportedSchedule = {
      version: "1.0", name: selectedSchedule.name, termId: selectedSchedule.termId || currentTerm.id,
      // Use section.courseId for robustness in export
      exportedSections: selectedSchedule.sections.map(section => ({ courseId: section.courseId, sectionId: section.id, })),
      totalCredits: selectedSchedule.totalCredits,
    };
    downloadJson(exportedScheduleData, `${selectedSchedule.name.replace(/\s+/g, '_')}_${exportedScheduleData.termId}.json`);
    toast.success(`Schedule "${selectedSchedule.name}" exported successfully!`);
  };

  /** Triggers the hidden file input for schedule import. */
  const handleImportButtonClick = () => {
    fileInputRef.current?.click(); // Open file dialog
  };

  /** Moves the selected schedule to the cart and navigates to the cart page. */
  const handleAddToCart = () => {
    if (!selectedSchedule) {
      toast.error("No schedule selected to add to cart.");
      return;
    }
    moveToCart(); // Context function handles toast
    navigate("/cart"); // Navigate after adding
  };

  /** Handles the file selection for schedule import, parsing and validating the file. */
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) { toast.error("No file selected."); return; }
    try {
      const fileContent = await file.text();
      const importedData = JSON.parse(fileContent) as ExportedSchedule;
      if (importedData.version !== "1.0" || !importedData.name || !importedData.termId || !Array.isArray(importedData.exportedSections) || typeof importedData.totalCredits !== 'number') {
        toast.error("Invalid schedule file format.");
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
      }
      const courseCatalog = allCourses;
      const newSections: CourseSectionType[] = [];
      let sectionsFound = true;
      for (const expSection of importedData.exportedSections) {
        const parentCourse = courseCatalog.find(c => c.id === expSection.courseId || c.code === expSection.courseId);
        if (parentCourse) {
          const sectionDetail = parentCourse.sections.find(s => s.id === expSection.sectionId);
          if (sectionDetail) { newSections.push(sectionDetail); }
          else { sectionsFound = false; toast.error(`Section ${expSection.sectionId} for course ${expSection.courseId} not found in catalog.`); break; }
        } else { sectionsFound = false; toast.error(`Course ${expSection.courseId} not found in catalog.`); break; }
      }
      if (!sectionsFound) { if (fileInputRef.current) fileInputRef.current.value = ""; return; }
      const recalculatedTotalCredits = newSections.reduce((acc, currentSection) => {
          // Ensure currentSection has courseId, which it should as it's from courseCatalog.sections
          const parentCourse = courseCatalog.find(c => c.id === currentSection.courseId);
          return acc + (parentCourse?.credits || 0);
      }, 0);
      if (recalculatedTotalCredits !== importedData.totalCredits) {
          toast.info(`Total credits recalculated to ${recalculatedTotalCredits} based on found sections. Original was ${importedData.totalCredits}.`);
      }
      const newSchedule: ScheduleType = {
        id: uuidv4(), name: `${importedData.name} (Imported)`, termId: importedData.termId, sections: newSections,
        totalCredits: recalculatedTotalCredits, busyTimes: [], conflicts: [],
      };
      addSchedule(newSchedule);
      selectSchedule(newSchedule.id);
      toast.success(`Schedule "${newSchedule.name}" imported successfully!`);
    } catch (error) { console.error("Error importing schedule:", error); toast.error("Failed to import schedule. Ensure the file is a valid JSON."); }
    finally { if (fileInputRef.current) { fileInputRef.current.value = ""; } }
  };

  const handleDuplicateSchedule = () => {
    if (!selectedSchedule) { toast.error("No schedule selected to copy."); return; }
    const newSchedule: ScheduleType = { ...JSON.parse(JSON.stringify(selectedSchedule)), id: uuidv4(), name: `${selectedSchedule.name} (Copy)`, };
    addSchedule(newSchedule); // Context function handles its own toast
    selectSchedule(newSchedule.id); // Select the newly duplicated schedule
    // toast.success(`Schedule duplicated as "${newSchedule.name}"!`); // addSchedule already toasts
  };

  /** Renames the currently selected schedule using a prompt. */
  const handleRenameSchedule = () => {
    if (!selectedSchedule) { toast.error("No schedule selected to rename."); return; }
    // TODO: Replace window.prompt with a custom dialog (e.g., <InputAlert /> or similar) for better UX and control.
    // This current implementation using prompt() is basic and has UX limitations.
    const newName = prompt("Enter new name for this schedule:", selectedSchedule.name);
    if (newName && newName.trim() !== "") {
      const oldName = selectedSchedule.name;
      // Update the schedule name in the main schedules list
      setSchedules(prevSchedules =>
        prevSchedules.map(s =>
          s.id === selectedSchedule.id ? { ...s, name: newName.trim() } : s
        )
      );
      // If the selected schedule is the one being renamed, update its name in the state too
      // This is implicitly handled if selectSchedule re-fetches from the updated schedules list,
      // or if setSelectedSchedule is called directly if the list reference doesn't change.
      // The current selectSchedule(id) will find the updated one from the list.
      toast.success(`Schedule "${oldName}" renamed to "${newName.trim()}"!`);
    } else if (newName !== null) { // Only toast error if prompt was not cancelled
      toast.error("Schedule name cannot be empty.");
    }
  };

  /** Deletes the currently selected schedule from the list of schedules. */
  const handleDeleteSelectedSchedule = () => {
    if (!selectedSchedule) { toast.error("No schedule selected to remove."); return; }
    if (schedules.length <= 1 && selectedSchedule.id.startsWith("gen-sched-")) {
      toast.warn("Cannot remove the last generated schedule option. Generate new ones or add/import another to remove this one.");
      return;
    }
    const scheduleNameToDelete = selectedSchedule.name;
    removeSchedule(selectedSchedule.id); // Context function handles its own toast
    // selectSchedule(null) is implicitly handled by removeSchedule if it clears selectedSchedule,
    // or the next schedule in the list could be selected. The current context removeSchedule doesn't change selection.
    // toast.success(`Schedule "${scheduleNameToDelete}" removed.`); // removeSchedule already toasts
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

  return (
    <div className="h-screen flex flex-col animate-fade-in">
      <input type="file" accept=".json" ref={fileInputRef} onChange={handleFileChange} style={{ display: 'none' }} />

      {/* Header */}
      <div className="flex-shrink-0 border-b bg-white">
        <div className="container mx-auto px-4 max-w-7xl">
          <TermHeader
            view={view}
            setView={setView}
            onCompareClick={() => setIsCompareOpen(true)}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <div className="w-80 flex-shrink-0 border-r bg-white flex flex-col">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">

            <Accordion type="multiple" defaultValue={["busy-times", "courses"]} className="w-full space-y-4">
            <AccordionItem value="busy-times" className="border-b-0">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                <AccordionTrigger className="flex items-center hover:bg-gray-100 transition-colors [&[data-state=open]>svg]:rotate-180 flex-1 p-0">
                  <h3 className="font-medium text-sm">Busy Times ({busyTimes.length})</h3>
                </AccordionTrigger>
                <Button variant="outline" size="sm" onClick={() => setIsAddBusyTimeOpen(true)} className="h-8 px-3 ml-2">
                    <PlusCircle className="h-4 w-4 mr-1" />
                    Add Busy Time
                </Button>
              </div>
              <AccordionContent className="pt-3 space-y-2">
                <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
                  <AnimatePresence>
                    {busyTimes.map((busyTime, index) => (
                      <motion.div key={busyTime.id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} transition={{ duration: 0.2, delay: index * 0.05 }}>
                        <BusyTimeItem busyTime={busyTime} onEdit={handleEditBusyTime} />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  {busyTimes.length === 0 && (<div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-md text-center">No busy times added.</div>)}
                </div>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="courses" className="border-b-0">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                <AccordionTrigger className="flex items-center hover:bg-gray-100 transition-colors [&[data-state=open]>svg]:rotate-180 flex-1 p-0">
                  <h3 className="font-medium text-sm">Courses ({selectedCourses.length}/{courses.length} selected)</h3>
                </AccordionTrigger>
                <Button variant="outline" size="sm" onClick={() => setIsCourseSearchDrawerOpen(true)} className="h-8 px-3 ml-2">
                    <PlusCircle className="h-4 w-4 mr-1" />
                    Add Course
                </Button>
              </div>
              <AccordionContent className="pt-3 space-y-3">
                {/* TODO: Consider extracting CourseItem component for the content below */}
                <div className="space-y-2">
                  <AnimatePresence>
                    {courses.map((course: Course, index: number) => (
                      <motion.div key={course.id} className={`bg-white border rounded-lg p-4 flex flex-col justify-between items-start group hover:shadow-sm transition-all w-full ${selectedCourses.includes(course.id) ? 'border-blue-300 bg-blue-50' : 'border-gray-200'}`} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.2, delay: index * 0.05 }}>
                        <div className="flex items-start w-full space-x-2">
                          <Checkbox id={`course-${course.id}`} checked={selectedCourses.includes(course.id)} onCheckedChange={() => handleCourseToggle(course.id)} className="mt-1" />
                          <div className="flex-1">
                            <div className="flex justify-between items-start w-full">
                              <div>
                                <label htmlFor={`course-${course.id}`} className="cursor-pointer">
                                  <div className="flex items-center mb-1">
                                    <span className="font-medium text-base mr-2">{course.code}</span> <Badge variant="secondary" className="text-xs mr-2">{course.credits}cr</Badge>
                                  </div>
                                  <div className="text-sm text-gray-700 mb-1">{course.name}</div>
                                  {/* Show selected section info from the currently active schedule */}
                                  {selectedSchedule && (() => {
                                    const currentSectionInSchedule = selectedSchedule.sections.find(section =>
                                      section.courseId === course.id // Compare by courseId
                                    );
                                    if (currentSectionInSchedule) {
                                      return (
                                        <div className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded mb-1">
                                          Section {currentSectionInSchedule.sectionNumber} • {currentSectionInSchedule.instructors?.join(', ')} • {currentSectionInSchedule.schedule?.[0] ? `${currentSectionInSchedule.schedule[0].days} ${currentSectionInSchedule.schedule[0].startTime}-${currentSectionInSchedule.schedule[0].endTime}` : 'TBA'}
                                        </div>
                                      );
                                    }
                                    return null;
                                  })()}
                                  {course.prerequisites && course.prerequisites.length > 0 && (
                                    <div className="text-xs py-0.5 px-1.5 bg-amber-100 text-amber-800 rounded inline-flex items-center cursor-pointer hover:bg-amber-200" onClick={() => toggleCourseExpanded(course.id)}>
                                      Prerequisites {expandedCourses[course.id] ? <ChevronUp className="h-3 w-3 ml-1" /> : <ChevronDown className="h-3 w-3 ml-1" />}
                                    </div>
                                  )}
                                </label>
                              </div>
                              <div className="flex space-x-1">
                                <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" className={`h-8 w-8 ${lockedCourses.includes(course.id) ? 'bg-blue-100 hover:bg-blue-200' : ''}`} onClick={() => handleToggleCourseLock(course.id)}>{lockedCourses.includes(course.id) ? <Lock className="h-4 w-4 text-blue-600 fill-current" /> : <Unlock className="h-4 w-4 text-gray-500" />}</Button></TooltipTrigger><TooltipContent><p>{lockedCourses.includes(course.id) ? "Unlock course" : "Lock course"}</p></TooltipContent></Tooltip>
                                <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => toggleCourseExpanded(course.id)}>{expandedCourses[course.id] ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}</Button></TooltipTrigger><TooltipContent><p>Show/hide details</p></TooltipContent></Tooltip>
                                <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive/90" onClick={() => handleDeleteCourse(course.id)} aria-label="Delete course"><Trash2 className="h-4 w-4" /></Button></TooltipTrigger><TooltipContent><p>Remove course</p></TooltipContent></Tooltip>
                              </div>
                            </div>
                            <AnimatePresence>
                              {expandedCourses[course.id] && (
                                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="mt-2 pt-2 border-t w-full">
                                  {/* Prerequisite display logic */}
                                  {course.prerequisites && course.prerequisites.length > 0 && (
                                    <div className="mb-2">
                                      <div className="text-xs font-semibold text-gray-600 mb-0.5">Prerequisites:</div>
                                      <div className="bg-amber-50 p-1.5 rounded text-xs text-amber-900">{course.prerequisites.join(", ")}</div>
                                      {(() => {
                                          const coursePrerequisites = course.prerequisites ?? [];
                                          const metPrerequisites = coursePrerequisites.length > 0 && coursePrerequisites.every(prereqCode => completedCourseCodes.includes(prereqCode));
                                          if (coursePrerequisites.length > 0 && !metPrerequisites) {
                                            return (<div className="mt-1.5 flex items-center text-xs text-amber-700 bg-amber-50 p-1.5 rounded border border-amber-200"><AlertTriangle className="h-4 w-4 mr-1.5 flex-shrink-0" /><span>Some prerequisites may not be met.</span></div>);
                                          } return null;
                                        })()}
                                    </div>
                                  )}
                                  {/* Section selection UI */}
                                  <div className="mt-3">
                                    <div className="flex items-center justify-between mb-1.5"><Label className="text-xs font-semibold text-gray-600">Available Sections:</Label>
                                      {course.sections && course.sections.some(s => s.sectionType === 'Honors') && (
                                        <div className="flex items-center space-x-1.5">
                                          <Checkbox id={`honor-filter-${course.id}`} checked={excludeHonorsMap[course.id] || false} onCheckedChange={(checked) => { updateExcludeHonorsMap(course.id, !!checked); if (checked && selectedSectionMap[course.id] === 'all') { const nonHonorsSectionIds = course.sections.filter(s => s.sectionType !== 'Honors').map(s => s.id); updateSelectedSectionMap(course.id, nonHonorsSectionIds); } else if (!checked && selectedSectionMap[course.id] !== 'all') { const currentSelectedIds = Array.isArray(selectedSectionMap[course.id]) ? selectedSectionMap[course.id] : []; const allNonHonorsIds = course.sections.filter(s => s.sectionType !== 'Honors').map(s => s.id); if (currentSelectedIds.length === allNonHonorsIds.length && allNonHonorsIds.every(id => currentSelectedIds.includes(id))) { updateSelectedSectionMap(course.id, 'all'); } } }} />
                                          <Label htmlFor={`honor-filter-${course.id}`} className="text-xs text-gray-600">Exclude Honors</Label>
                                        </div> )}
                                    </div>
                                    <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                                      {(course.sections || []).filter(section => !(excludeHonorsMap[course.id] && section.sectionType === 'Honors')).map((section: CourseSection) => (
                                        <div key={section.id} className="text-xs bg-gray-50 p-2 rounded border border-gray-200 hover:border-gray-300">
                                          <div className="flex items-start space-x-2">
                                            <Checkbox id={`section-select-${section.id}`} checked={selectedSectionMap[course.id] === 'all' || (Array.isArray(selectedSectionMap[course.id]) && (selectedSectionMap[course.id] as string[]).includes(section.id))} onCheckedChange={(checkedState) => { const isChecked = checkedState === true; const currentCourseSelection = selectedSectionMap[course.id]; let newCourseSelection: string[] | 'all'; const allPotentiallyVisibleSectionIds = course.sections.filter(s => !(excludeHonorsMap[course.id] && s.sectionType === 'Honors')).map(s => s.id); if (isChecked) { if (currentCourseSelection === 'all') { newCourseSelection = [section.id]; } else { newCourseSelection = [...(currentCourseSelection || []), section.id]; } if (allPotentiallyVisibleSectionIds.every(id => newCourseSelection.includes(id))) { newCourseSelection = 'all'; } } else { if (currentCourseSelection === 'all') { newCourseSelection = allPotentiallyVisibleSectionIds.filter(id => id !== section.id); } else { newCourseSelection = (currentCourseSelection || []).filter(id => id !== section.id); } } updateSelectedSectionMap(course.id, newCourseSelection); }} className="mt-0.5" disabled={excludeHonorsMap[course.id] && section.sectionType === 'Honors'} />
                                            <label htmlFor={`section-select-${section.id}`} className={`flex-1 cursor-pointer ${excludeHonorsMap[course.id] && section.sectionType === 'Honors' ? 'opacity-50' : ''}`}>
                                              <div className="flex justify-between items-center mb-0.5"><span className="font-medium">Sect {section.sectionNumber}{section.sectionType && section.sectionType !== 'Standard' && (<Badge variant="outline" className="ml-1.5 text-[10px] px-1 py-0">{section.sectionType}</Badge>)}</span><span className="text-gray-500">CRN: {section.crn || 'N/A'}</span></div>
                                              <div className="text-gray-600 text-[11px]">Prof: {section.instructors?.join(', ') || 'TBA'}</div><div className="text-gray-600 text-[11px]">Loc: {section.schedule?.[0]?.room || section.location || 'TBA'}</div>
                                              <div className="flex justify-between text-[11px]"><span>Seats: {section.enrolled}/{section.capacity}</span>{section.waitlisted !== undefined && (<span className={`${section.waitlisted > 0 ? "text-orange-600" : "text-green-600"}`}>Waitlist: {section.waitlisted}</span>)}</div>
                                              {section.schedule && section.schedule.map((sch, idx) => (<div key={idx} className="flex justify-between text-gray-600 text-[11px] border-t mt-1 pt-0.5"><span>{sch.days}</span><span>{sch.startTime} - {sch.endTime}</span></div>))}
                                            </label>
                                          </div>
                                        </div> ))}
                                    </div>
                                  </div>
                                </motion.div>)}
                            </AnimatePresence>
                          </div>
                        </div>
                      </motion.div>))}
                  </AnimatePresence>
                  {courses.length === 0 && (<div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-md text-center">No courses added.</div>)}
                </div>

              </AccordionContent>
            </AccordionItem>
          </Accordion>
          </div>

          {/* Sticky Bottom Section */}
          <div className="flex-shrink-0 border-t bg-white p-4">
            {/* Action Buttons */}
            <div className="space-y-2">
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
        </div>

        {/* Right Side - Calendar/List View */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Schedule Options Dropdown and Actions */}
          {schedules && schedules.length > 0 ? (
            <div className="flex-shrink-0 p-4 border-b bg-white">
              <div className="flex flex-col sm:flex-row gap-3 items-center">
                <div className="flex-1 w-full sm:w-auto">
                  {/* Schedule Selector Dropdown */}
                  <Select value={selectedSchedule?.id || ""} onValueChange={(value) => selectSchedule(value === "null" ? null : value)}>
                    <SelectTrigger id="schedule-select-dropdown" className="w-full h-auto min-h-[60px] text-left">
                      <SelectValue placeholder="Select a schedule option to view...">
                        {selectedSchedule ? (
                          <div className="py-1">
                            <div className="font-semibold text-base truncate" title={selectedSchedule.name}>{selectedSchedule.name}</div>
                            <div className="text-xs text-gray-500 mt-0.5">
                              {selectedSchedule.sections.length} course{selectedSchedule.sections.length === 1 ? '' : 's'} • {selectedSchedule.totalCredits} credits
                              {selectedSchedule.conflicts && selectedSchedule.conflicts.length > 0 && (
                                <Badge variant="destructive" className="ml-2 text-xs">
                                  <AlertTriangle className="h-3 w-3 mr-1" />
                                  {selectedSchedule.conflicts.length} conflict{selectedSchedule.conflicts.length > 1 ? 's' : ''}
                                </Badge>
                              )}
                            </div>
                          </div>
                        ) : "Select a schedule option..."}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {/* TODO: Consider extracting ScheduleSelectItem component for the content below if it grows more complex */}
                      {schedules.map((schedule) => {
                        // For display in dropdown, get a summary of course codes
                        const courseCodesSummary = schedule.sections.slice(0, 3).map(section => {
                           const course = allCourses.find(c => c.id === section.courseId);
                           return course?.code || section.courseId.toUpperCase();
                        }).join(', ');
                        const moreCoursesCount = schedule.sections.length > 3 ? schedule.sections.length - 3 : 0;

                        return (
                          <SelectItem key={schedule.id} value={schedule.id} className="py-2.5">
                            <div className="w-full">
                              <div className="font-medium text-sm mb-1 truncate" title={schedule.name}>{schedule.name}</div>
                              <div className="text-xs text-gray-500 mb-1.5">
                                {schedule.sections.length} course{schedule.sections.length === 1 ? '' : 's'} • {schedule.totalCredits} credits
                                {schedule.conflicts && schedule.conflicts.length > 0 && (
                                  <Badge variant="destructive" className="ml-1.5 text-xs px-1.5 py-0.5">
                                     <AlertTriangle className="h-3 w-3 mr-1" />
                                    {schedule.conflicts.length} conflict{schedule.conflicts.length > 1 ? 's' : ''}
                                  </Badge>
                                )}
                              </div>
                              {schedule.sections.length > 0 && (
                                <div className="text-xs text-gray-400 italic">
                                  Includes: {courseCodesSummary}{moreCoursesCount > 0 ? ` +${moreCoursesCount} more` : ''}
                                </div>
                              )}
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
                {selectedSchedule && (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setIsCompareOpen(true)}
                      className="h-[60px] px-4 flex-shrink-0"
                    >
                      <ArrowLeftRight className="h-4 w-4 mr-2" />
                      Compare
                    </Button>
                    <Button
                      onClick={handleAddToCart}
                      className="bg-green-600 hover:bg-green-700 text-white h-[60px] px-6 flex-shrink-0"
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Add to Cart
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex-shrink-0 p-4 border-b bg-white">
              <div className="text-center py-8">
                <div className="text-gray-500 mb-2">No schedules generated yet</div>
                <div className="text-sm text-gray-400">
                  Select courses from the left sidebar and click "Generate Schedule" to create schedule options
                </div>
              </div>
            </div>
          )}

          <AnimatePresence mode="wait">
            {view === "calendar" ? (
              <motion.div
                key="calendar"
                className="flex-1 overflow-hidden"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <ScheduleCalendarView lockedCourses={lockedCourses} />
              </motion.div>
            ) : (
              <motion.div
                key="list"
                className="flex-1 overflow-auto p-4"
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
      <AddBusyTimeDialog open={isAddBusyTimeOpen} onOpenChange={setIsAddBusyTimeOpen} />
      <EditBusyTimeDialog open={isEditBusyTimeOpen} onOpenChange={setIsEditBusyTimeOpen} busyTime={selectedBusyTime} />
      <AIAdvisor open={isAIAdvisorOpen} onOpenChange={setIsAIAdvisorOpen} /> {/* Re-added AIAdvisor instance */}
      <TunePreferencesDialog open={isPreferencesOpen} onOpenChange={setIsPreferencesOpen} />
      <CompareSchedulesDialog open={isCompareOpen} onOpenChange={setIsCompareOpen} />
      <CourseSearchModal open={isCourseSearchDrawerOpen} onOpenChange={setIsCourseSearchDrawerOpen} onCourseSelected={(course) => { addCourse(course); }} />
    </div>
  );
};

export default ScheduleTool;

