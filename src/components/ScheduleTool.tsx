import React, { useState, useEffect, useRef } from "react"; 
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
import CourseSearch from "./CourseSearch"; 

interface ScheduleToolProps {
  semesterId?: string | null; 
}

const ScheduleTool: React.FC<ScheduleToolProps> = ({ semesterId: _semesterId }) => {
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
  const [isGenerating, setIsGenerating] = useState(false);
  const [expandedCourses, setExpandedCourses] = useState<Record<string, boolean>>({});
  const [lockedCourses, setLockedCourses] = useState<string[]>([]); 

  useEffect(() => {
    setSelectedCourses(courses.map(course => course.id));
  }, [courses]);
  
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
        toast.warn("Some locked courses were part of the selection for generation but not found in the current base schedule. They will be scheduled dynamically if possible.");
      }
    }
    generateSchedules(selectedCourses, fixedSectionsForGeneration); 
    setTimeout(() => {
      setIsGenerating(false);
    }, 800); 
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
    if (!selectedSchedule) { toast.error("No schedule selected to duplicate."); return; }
    const newSchedule: ScheduleType = { ...JSON.parse(JSON.stringify(selectedSchedule)), id: uuidv4(), name: `${selectedSchedule.name} (Copy)`, };
    addSchedule(newSchedule);
    selectSchedule(newSchedule.id); 
    toast.success(`Schedule "${newSchedule.name}" duplicated successfully!`);
  };

  const handleRenameSchedule = () => {
    if (!selectedSchedule) { toast.error("No schedule selected to rename."); return; }
    const newName = prompt("Enter new name for the schedule:", selectedSchedule.name);
    if (newName && newName.trim() !== "") {
      const updatedSchedules = schedules.map(s => s.id === selectedSchedule.id ? { ...s, name: newName.trim() } : s );
      setSchedules(updatedSchedules); 
      toast.success(`Schedule renamed to "${newName.trim()}"!`);
    } else if (newName !== null) { toast.error("Schedule name cannot be empty."); }
  };

  const handleDeleteSelectedSchedule = () => {
    if (!selectedSchedule) { toast.error("No schedule selected to delete."); return; }
    if (schedules.length <= 1) { toast.error("Cannot delete the last remaining schedule."); return; }
    const scheduleNameToDelete = selectedSchedule.name;
    removeSchedule(selectedSchedule.id);
    toast.success(`Schedule "${scheduleNameToDelete}" deleted.`);
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
    <div className="animate-fade-in">
      <input type="file" accept=".json" ref={fileInputRef} onChange={handleFileChange} style={{ display: 'none' }} />
      <TermHeader view={view} setView={setView} />
      {/* This div is now empty or can be removed as "Compare Schedules" is moved */}
      {/* <div className="mt-4 flex flex-wrap gap-2"></div> */}
      <div className="grid grid-cols-1 lg:grid-cols-6 gap-8 mt-4">
        <motion.div className="lg:col-span-2 space-y-4 md:overflow-visible overflow-x-hidden" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: 0.2 }}>
          <Accordion type="multiple" defaultValue={["busy-times", "courses"]} className="w-full space-y-4">
            <AccordionItem value="busy-times" className="border-b-0">
              <AccordionTrigger className="flex items-center p-4 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors [&[data-state=open]>svg]:rotate-180">
                <div className="flex justify-between items-center w-full">
                  <h3 className="font-semibold flex items-center text-base"><Badge variant="outline" className="mr-2 text-xs">Busy time ({busyTimes.length})</Badge></h3>
                  <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); setIsAddBusyTimeOpen(true); }} className="h-8 py-1 px-2"> {/* Adjusted padding/height */}
                      <PlusCircle className="h-3.5 w-3.5 sm:mr-1" /> {/* Slightly smaller icon, conditional margin */}
                      <span className="hidden sm:inline text-xs">Add</span>
                  </Button>
                </div>
              </AccordionTrigger>
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
               <AccordionTrigger className="flex items-center p-4 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors [&[data-state=open]>svg]:rotate-180">
                <div className="flex justify-between items-center w-full">
                  <h3 className="font-semibold flex items-center text-base"><Badge variant="outline" className="mr-2 text-xs">Courses ({courses.length})</Badge></h3>
                  <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); setIsCourseSearchDrawerOpen(true); }} className="h-8 py-1 px-2"> {/* Adjusted padding/height */}
                      <PlusCircle className="h-3.5 w-3.5 sm:mr-1" /> {/* Slightly smaller icon, conditional margin */}
                      <span className="hidden sm:inline text-xs">Add New</span> 
                      <span className="sm:hidden text-xs">Add</span>
                  </Button>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-3 space-y-3">
                <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
                  <AnimatePresence>
                    {courses.map((course: Course, index: number) => (
                      <motion.div key={course.id} className="bg-white border rounded-lg p-4 flex flex-col justify-between items-start group hover:shadow-sm transition-all w-full" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.2, delay: index * 0.05 }}>
                        <div className="flex items-start w-full space-x-2">
                          <Checkbox id={`course-${course.id}`} checked={selectedCourses.includes(course.id)} onCheckedChange={() => handleCourseToggle(course.id)} className="mt-1" />
                          <div className="flex-1">
                            <div className="flex justify-between items-start w-full">
                              <div>
                                <label htmlFor={`course-${course.id}`} className="cursor-pointer">
                                  <div className="flex items-center mb-1">
                                    {lockedCourses.includes(course.id) && <Lock className="h-4 w-4 mr-2 text-blue-600 flex-shrink-0" />}
                                    <span className="font-medium text-base mr-2">{course.code}</span> <Badge variant="secondary" className="text-xs mr-2">{course.credits}cr</Badge>
                                  </div>
                                  <div className="text-sm text-gray-700 mb-1">{course.name}</div>
                                  {course.prerequisites && course.prerequisites.length > 0 && (
                                    <div className="text-xs py-0.5 px-1.5 bg-amber-100 text-amber-800 rounded inline-flex items-center cursor-pointer hover:bg-amber-200" onClick={() => toggleCourseExpanded(course.id)}>
                                      Prerequisites {expandedCourses[course.id] ? <ChevronUp className="h-3 w-3 ml-1" /> : <ChevronDown className="h-3 w-3 ml-1" />}
                                    </div>
                                  )}
                                </label>
                              </div>
                              <div className="flex space-x-1">
                                <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleToggleCourseLock(course.id)}>{lockedCourses.includes(course.id) ? <Lock className="h-4 w-4 text-blue-600" /> : <Unlock className="h-4 w-4" />}</Button></TooltipTrigger><TooltipContent><p>{lockedCourses.includes(course.id) ? "Unlock course" : "Lock course"}</p></TooltipContent></Tooltip>
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
                                      {course.sections.some(s => s.sectionType === 'Honors') && (
                                        <div className="flex items-center space-x-1.5">
                                          <Checkbox id={`honor-filter-${course.id}`} checked={excludeHonorsMap[course.id] || false} onCheckedChange={(checked) => { updateExcludeHonorsMap(course.id, !!checked); if (checked && selectedSectionMap[course.id] === 'all') { const nonHonorsSectionIds = course.sections.filter(s => s.sectionType !== 'Honors').map(s => s.id); updateSelectedSectionMap(course.id, nonHonorsSectionIds); } else if (!checked && selectedSectionMap[course.id] !== 'all') { const currentSelectedIds = Array.isArray(selectedSectionMap[course.id]) ? selectedSectionMap[course.id] : []; const allNonHonorsIds = course.sections.filter(s => s.sectionType !== 'Honors').map(s => s.id); if (currentSelectedIds.length === allNonHonorsIds.length && allNonHonorsIds.every(id => currentSelectedIds.includes(id))) { updateSelectedSectionMap(course.id, 'all'); } } }} />
                                          <Label htmlFor={`honor-filter-${course.id}`} className="text-xs text-gray-600">Exclude Honors</Label>
                                        </div> )}
                                    </div>
                                    <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                                      {course.sections.filter(section => !(excludeHonorsMap[course.id] && section.sectionType === 'Honors')).map((section: CourseSection) => (
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
                <div className="mt-3 flex flex-col sm:flex-row gap-2">
                  <Button onClick={handleGenerateSchedule} variant="default" className="flex-1 transition-colors" disabled={selectedCourses.length === 0 || isGenerating}>
                    {isGenerating ? (<span className="flex items-center justify-center"><svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>Generating...</span>) : (<span className="flex items-center justify-center"><CalendarPlus className="h-4 w-4 mr-2" />Generate Schedule</span>)}
                  </Button>
                  <Button variant="outline" onClick={() => setIsPreferencesOpen(true)} className="flex-1"><SlidersHorizontal className="h-4 w-4 mr-2" /> Tune Preferences</Button>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </motion.div>
        <motion.div className="lg:col-span-4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: 0.3 }}>
          {schedules && schedules.length > 0 && (
            <div className="mb-4 p-1">
              <Label htmlFor="schedule-select-dropdown" className="text-sm font-medium text-gray-700 block mb-1">View Generated Schedules:</Label>
              <Select value={selectedSchedule?.id || ""} onValueChange={(value) => selectSchedule(value === "null" ? null : value)}>
                <SelectTrigger id="schedule-select-dropdown" className="w-full sm:w-[320px] border-gray-300 focus:border-blue-500 focus:ring-blue-500"><SelectValue placeholder="Select a schedule to view details" /></SelectTrigger>
                <SelectContent>{schedules.map((schedule) => (<SelectItem key={schedule.id} value={schedule.id}>{schedule.name} ({schedule.totalCredits} cr)</SelectItem>))}</SelectContent>
              </Select>
            </div> )}
          <div className="space-y-2 mb-4">
            <div className="flex items-center justify-between">
                <h3 className="font-medium text-lg truncate max-w-[calc(100%-350px)] sm:max-w-[calc(100%-400px)]" title={selectedSchedule?.name || "No Schedule Selected"}>{selectedSchedule?.name || "No Schedule Selected"}</h3> {/* Adjusted max-width for new button */}
                <div className="flex items-center space-x-1">
                  <Button variant="outline" onClick={() => setIsAIAdvisorOpen(true)} size="sm" className="whitespace-nowrap">
                    <Sparkles className="h-4 w-4 mr-1.5 sm:mr-2" />
                    <span className="hidden sm:inline">AI Advisor</span>
                    <span className="sm:hidden">AI</span>
                  </Button>
                  <Button variant="outline" onClick={() => setIsCompareOpen(true)} size="sm" className="whitespace-nowrap">
                    <ArrowLeftRight className="h-4 w-4 mr-1.5 sm:mr-2" />
                    <span className="hidden sm:inline">Compare</span>
                    <span className="sm:hidden">Compare</span> 
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild><Button variant="outline" size="sm" disabled={!selectedSchedule}>Actions <ChevronDown className="h-4 w-4 ml-1.5" /></Button></DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuItem onClick={handleExportSchedule} disabled={!selectedSchedule}><Download className="mr-2 h-4 w-4" /> Export Schedule</DropdownMenuItem>
                      <DropdownMenuItem onClick={handleImportButtonClick}><Upload className="mr-2 h-4 w-4" /> Import Schedule</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => {
                          if (selectedSchedule) {
                            moveToCart();
                            // Optional: navigate("/cart"); // If immediate navigation is desired
                          }
                        }} 
                        disabled={!selectedSchedule}
                      >
                        <ShoppingCart className="mr-2 h-4 w-4" />
                        Move to Cart
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleDuplicateSchedule} disabled={!selectedSchedule}><CopyIcon className="mr-2 h-4 w-4" /> Duplicate Schedule</DropdownMenuItem>
                      <DropdownMenuItem onClick={handleRenameSchedule} disabled={!selectedSchedule}><Edit3 className="mr-2 h-4 w-4" /> Rename Schedule</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleDeleteSelectedSchedule} disabled={!selectedSchedule} className="text-destructive hover:!bg-destructive hover:!text-destructive-foreground focus:!bg-destructive focus:!text-destructive-foreground"><Trash2 className="mr-2 h-4 w-4" /> Delete Schedule</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  {/* REMOVED Ask AI Advisor Button from here */}
              </div>
            </div>
            {selectedSchedule && (<div className="text-sm text-gray-500">{selectedSchedule.totalCredits} credits {selectedSchedule.conflicts && selectedSchedule.conflicts.length > 0 && (<span className="text-amber-500">• {selectedSchedule.conflicts.length} conflict{selectedSchedule.conflicts.length > 1 ? 's' : ''}</span>)}</div>)}
          </div>
          <AnimatePresence mode="wait">
            {view === "calendar" ? (<motion.div key="calendar" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}><ScheduleCalendarView lockedCourses={lockedCourses} /></motion.div>) 
                               : (<motion.div key="list" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}><ScheduleListView /></motion.div>)}
          </AnimatePresence>
        </motion.div>
      </div>
      <AddBusyTimeDialog open={isAddBusyTimeOpen} onOpenChange={setIsAddBusyTimeOpen} />
      <EditBusyTimeDialog open={isEditBusyTimeOpen} onOpenChange={setIsEditBusyTimeOpen} busyTime={selectedBusyTime} />
      <AIAdvisor open={isAIAdvisorOpen} onOpenChange={setIsAIAdvisorOpen} /> {/* Re-added AIAdvisor instance */}
      <TunePreferencesDialog open={isPreferencesOpen} onOpenChange={setIsPreferencesOpen} />
      <CompareSchedulesDialog open={isCompareOpen} onOpenChange={setIsCompareOpen} />
      <CourseSearch open={isCourseSearchDrawerOpen} onOpenChange={setIsCourseSearchDrawerOpen} onCourseSelected={(course) => { addCourse(course); }} />
    </div>
  );
};

export default ScheduleTool;

