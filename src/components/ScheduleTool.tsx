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

interface ScheduleToolProps {
  semesterId?: string | null;
}

const ScheduleTool: React.FC<ScheduleToolProps> = ({ semesterId: _semesterId }) => {
  const navigate = useNavigate();
  const {
    courses,
    busyTimes,
    selectedSchedule,
    generateSchedules,
    removeCourse,
    schedules,
    selectSchedule,
    addSchedule,
    currentTerm,
    allCourses = mockCourses,
    selectedSectionMap,
    updateSelectedSectionMap,
    excludeHonorsMap,
    updateExcludeHonorsMap,
    removeSchedule,
    setSchedules,
    studentInfo,
    addCourse, // addCourse is from useSchedule context
    moveToCart,
  } = useSchedule();

  const completedCourseCodes = studentInfo?.completedCourses || [];
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [isCourseSearchDrawerOpen, setIsCourseSearchDrawerOpen] = useState(false);
  const [view, setView] = useState("calendar");
  const [isAddBusyTimeOpen, setIsAddBusyTimeOpen] = useState(false);
  const [isEditBusyTimeOpen, setIsEditBusyTimeOpen] = useState(false);
  const [selectedBusyTime, setSelectedBusyTime] = useState(null);
  const [isAIAdvisorOpen, setIsAIAdvisorOpen] = useState(false); // Re-added AIAdvisor state
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [isPreferencesOpen, setIsPreferencesOpen] = useState(false);
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [expandedCourses, setExpandedCourses] = useState<Record<string, boolean>>({});
  const [lockedCourses, setLockedCourses] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    setSelectedCourses(courses.map(course => course.id));
  }, [courses]);

  // Generate initial schedules when courses are first loaded and some are selected
  useEffect(() => {
    if (courses.length > 0 && schedules.length === 0 && selectedCourses.length > 0) {
      // Only auto-generate once when courses are first loaded and some are selected
      const timeoutId = setTimeout(() => {
        handleGenerateSchedule();
      }, 500); // Increased timeout to ensure state is stable

      return () => clearTimeout(timeoutId);
    }
  }, [courses.length, schedules.length]); // Removed selectedCourses.length to prevent circular dependency

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
    if (selectedCourses.length === 0) {
      toast.error("Please select at least one course to generate schedules.");
      return;
    }

    setIsGenerating(true);

    try {
      const fixedSectionsForGeneration: CourseSection[] = [];
      if (selectedSchedule && lockedCourses.length > 0) {
        const selectedLockedCourseIds = lockedCourses.filter(lcId => selectedCourses.includes(lcId));
        selectedSchedule.sections.forEach(section => {
          const courseIdOfSection = section.id.split('-')[0];
          if (selectedLockedCourseIds.includes(courseIdOfSection)) {
            fixedSectionsForGeneration.push(section);
          }
        });
        if (fixedSectionsForGeneration.length !== selectedLockedCourseIds.length) {
          toast.info("Some locked courses were part of the selection for generation but not found in the current base schedule. They will be scheduled dynamically if possible.");
        }
      }

      generateSchedules(selectedCourses, fixedSectionsForGeneration);

      // Reset generating state immediately since generateSchedules is synchronous
      setIsGenerating(false);
    } catch (error) {
      console.error("Error generating schedules:", error);
      toast.error("Failed to generate schedules. Please try again.");
      setIsGenerating(false);
    }
  };

  const toggleCourseExpanded = (courseId: string) => {
    setExpandedCourses(prev => ({ ...prev, [courseId]: !prev[courseId] }));
  };

  const handleDeleteCourse = (courseId: string) => {
    removeCourse(courseId);
  };

  const handleExportSchedule = () => {
    if (!selectedSchedule) { toast.error("No schedule selected to export."); return; }
    if (!currentTerm) { toast.error("Current term context is not available. Cannot export."); return; }
    const exportedScheduleData: ExportedSchedule = {
      version: "1.0", name: selectedSchedule.name, termId: selectedSchedule.termId || currentTerm.id,
      exportedSections: selectedSchedule.sections.map(section => ({ courseId: section.id.split("-")[0], sectionId: section.id, })),
      totalCredits: selectedSchedule.totalCredits,
    };
    downloadJson(exportedScheduleData, `${selectedSchedule.name.replace(/\s+/g, '_')}_${exportedScheduleData.termId}.json`);
    toast.success("Schedule exported successfully!");
  };

  const handleImportButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleAddToCart = () => {
    if (!selectedSchedule) {
      toast.error("No schedule selected to add to cart.");
      return;
    }
    moveToCart();
    // Navigate to cart page after adding to cart
    navigate("/cart");
  };

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
      const recalculatedTotalCredits = newSections.reduce((acc, section) => {
          const parentCourse = courseCatalog.find(c => c.id === section.id.split('-')[0] || c.code === section.id.split('-')[0]);
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
    if (!selectedSchedule) { toast.error("No schedule option selected to copy."); return; }
    const newSchedule: ScheduleType = { ...JSON.parse(JSON.stringify(selectedSchedule)), id: uuidv4(), name: `${selectedSchedule.name} (Copy)`, };
    addSchedule(newSchedule);
    selectSchedule(newSchedule.id);
    toast.success(`Schedule option saved as "${newSchedule.name}" for your reference!`);
  };

  const handleRenameSchedule = () => {
    if (!selectedSchedule) { toast.error("No schedule option selected to rename."); return; }
    const newName = prompt("Enter new name for this schedule option:", selectedSchedule.name);
    if (newName && newName.trim() !== "") {
      const updatedSchedules = schedules.map(s => s.id === selectedSchedule.id ? { ...s, name: newName.trim() } : s );
      setSchedules(updatedSchedules);
      toast.success(`Schedule option renamed to "${newName.trim()}"!`);
    } else if (newName !== null) { toast.error("Schedule name cannot be empty."); }
  };

  const handleDeleteSelectedSchedule = () => {
    if (!selectedSchedule) { toast.error("No schedule option selected to remove."); return; }
    if (schedules.length <= 1) { toast.error("Cannot remove the last remaining schedule option."); return; }
    const scheduleNameToDelete = selectedSchedule.name;
    removeSchedule(selectedSchedule.id);
    toast.success(`Schedule option "${scheduleNameToDelete}" removed from view.`);
  };

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
                                  {/* Show selected section info */}
                                  {selectedSchedule && (() => {
                                    const selectedSection = selectedSchedule.sections.find(section =>
                                      section.id.split('-')[0] === course.id
                                    );
                                    if (selectedSection) {
                                      return (
                                        <div className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded mb-1">
                                          Section {selectedSection.sectionNumber} • {selectedSection.instructor} • {selectedSection.schedule?.[0] ? `${selectedSection.schedule[0].days} ${selectedSection.schedule[0].startTime}-${selectedSection.schedule[0].endTime}` : 'TBA'}
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
                                              <div className="flex justify-between items-center mb-0.5"><span className="font-medium">Sect {section.sectionNumber}{section.sectionType && section.sectionType !== 'Standard' && (<Badge variant="outline" className="ml-1.5 text-[10px] px-1 py-0">{section.sectionType}</Badge>)}</span><span className="text-gray-500">CRN: {section.crn}</span></div>
                                              <div className="text-gray-600 text-[11px]">Prof: {section.instructor}</div><div className="text-gray-600 text-[11px]">Loc: {section.location}</div>
                                              <div className="flex justify-between text-[11px]"><span>Seats: {section.availableSeats}/{section.maxSeats}</span>{section.waitlistCount !== undefined && (<span className={`${section.waitlistCount > 0 ? "text-orange-600" : "text-green-600"}`}>Waitlist: {section.waitlistCount}</span>)}</div>
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
          {/* Schedule Options Above Calendar */}
          {schedules && schedules.length > 0 ? (
            <div className="flex-shrink-0 p-4 border-b bg-white">
              <div className="flex gap-3 items-center">
                <div className="flex-1">
                  <Select value={selectedSchedule?.id || ""} onValueChange={(value) => selectSchedule(value === "null" ? null : value)}>
                    <SelectTrigger id="schedule-select-dropdown" className="w-full h-auto min-h-[60px]">
                      <SelectValue placeholder="Select a schedule option to view">
                        {selectedSchedule && (
                          <div className="text-left py-1">
                            <div className="font-medium text-base">{selectedSchedule.name}</div>
                            <div className="text-sm text-gray-600 mt-1">
                              {selectedSchedule.sections.length} scheduled • {selectedSchedule.totalCredits} credits
                              {selectedSchedule.conflicts && selectedSchedule.conflicts.length > 0 && (
                                <span className="text-amber-600 ml-2">⚠️ {selectedSchedule.conflicts.length} conflict{selectedSchedule.conflicts.length > 1 ? 's' : ''}</span>
                              )}
                            </div>
                          </div>
                        )}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {schedules.map((schedule) => {
                        // Get course details for each section
                        const courseDetails = schedule.sections.map(section => {
                          const courseId = section.id.split('-')[0];
                          const course = allCourses.find(c => c.id === courseId);
                          return {
                            code: course?.code || courseId.toUpperCase(),
                            name: course?.name || 'Unknown Course',
                            instructor: section.instructor || 'TBA',
                            time: section.schedule?.[0] ? `${section.schedule[0].days} ${section.schedule[0].startTime}-${section.schedule[0].endTime}` : 'TBA',
                            location: section.schedule?.[0]?.location || section.location || 'TBA'
                          };
                        });

                        return (
                          <SelectItem key={schedule.id} value={schedule.id} className="py-4">
                            <div className="w-full">
                              <div className="font-medium text-base mb-2">{schedule.name}</div>
                              <div className="text-sm text-gray-600 mb-2">
                                {schedule.sections.length} scheduled • {schedule.totalCredits} credits
                                {schedule.conflicts && schedule.conflicts.length > 0 && (
                                  <span className="text-amber-600 ml-2">⚠️ {schedule.conflicts.length} conflict{schedule.conflicts.length > 1 ? 's' : ''}</span>
                                )}
                              </div>
                              <div className="space-y-1">
                                {courseDetails.slice(0, 3).map((course, idx) => (
                                  <div key={idx} className="text-xs text-gray-500 flex justify-between">
                                    <span className="font-medium">{course.code}</span>
                                    <span>{course.time}</span>
                                  </div>
                                ))}
                                {courseDetails.length > 3 && (
                                  <div className="text-xs text-gray-400">
                                    +{courseDetails.length - 3} more courses
                                  </div>
                                )}
                              </div>
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

