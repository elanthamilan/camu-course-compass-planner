import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "sonner";
import { mockPrograms, mockCourses, mockMandatoryCourses } from "@/lib/mock-data"; // mockDegreeRequirements removed as it's part of mockPrograms
import { PlusCircle, Trash2, ArrowRight, ChevronDown, Eye, CheckCircle2, CircleDot, Circle, PlusSquare } from "lucide-react"; // Added PlusSquare
import { useSchedule } from '@/contexts/ScheduleContext';
import { Label } from "@/components/ui/label";
import { calculateWhatIfAudit } from '../lib/degree-audit-utils';
import WhatIfDegreeAuditView from './WhatIfDegreeAuditView';
import { Course, AcademicProgram, DegreeRequirement } from "../lib/types";

interface SemesterData {
  id: string;
  name: string;
  creditsSelected: number;
  courses: Course[]; 
}

interface YearData {
  year: string;
  credits: number; 
  schedules: number; 
  semesters: SemesterData[];
}

const initialYearsData: YearData[] = [
  {
    year: "2024 - 2025",
    credits: 30,
    schedules: 13,
    semesters: [
      {
        id: "Summer2024", name: "Summer 2024", creditsSelected: 9, courses: [
          { id: "cs101", code: "CS101", name: "Introduction to Computer Science", credits: 3, days: "MWF", time: "09:00", prerequisites: [] },
          { id: "math105", code: "MATH105", name: "Pre-Calculus", credits: 3, days: "MWF", time: "08:00", prerequisites: [] },
          { id: "eng234", code: "ENG234", name: "Composition II", credits: 3, days: "MW", time: "10:00", prerequisites: ["ENG100"] }
        ]
      },
      {
        id: "Fall2024", name: "Fall 2024", creditsSelected: 11, courses: [
          { id: "phys210", code: "PHYS210", name: "Physics I: Mechanics", credits: 4, days: "MWF", time: "13:00", prerequisites: [] },
          { id: "phil101", code: "PHIL101", name: "Introduction to Logic", credits: 3, days: "MWF", time: "11:00", prerequisites: [] },
          { id: "univ100", code: "UNIV100", name: "University Seminar", credits: 1, days: "W", time: "14:00", prerequisites: [] }
        ]
      },
      {
        id: "Spring2025", name: "Spring 2025", creditsSelected: 10, courses: [
          { id: "econ101", code: "ECON101", name: "Principles of Microeconomics", credits: 3, days: "MWF", time: "10:00", prerequisites: [] },
          { id: "bio101", code: "BIO101", name: "Introduction to Biology", credits: 4, days: "MWF", time: "09:00", prerequisites: [] },
          { id: "chem101", code: "CHEM101", name: "General Chemistry", credits: 4, days: "MWF", time: "13:00", prerequisites: [] }
        ]
      }
    ]
  },
];

const CourseDashboard: React.FC = () => {
  const { studentInfo } = useSchedule(); 

  const [selectedWhatIfMajorId, setSelectedWhatIfMajorId] = useState<string | null>(null);
  const [selectedWhatIfMinorId, setSelectedWhatIfMinorId] = useState<string | null>(null);
  const [whatIfAuditResults, setWhatIfAuditResults] = useState<DegreeRequirement[] | null>(null);
  const [currentWhatIfProgram, setCurrentWhatIfProgram] = useState<AcademicProgram | null>(null);

  const [actualProgram, setActualProgram] = useState<AcademicProgram | null>(null);
  const [actualProgramAudit, setActualProgramAudit] = useState<DegreeRequirement[] | null>(null);

  const [courseSearchInitialFilters, setCourseSearchInitialFilters] = useState<
    { type: 'matcher', matcher: DegreeRequirement['courseMatcher'] } | 
    { type: 'choice', courses: string[] } | 
    null
  >(null);
  const [courseSearchContextualTitle, setCourseSearchContextualTitle] = useState<string | null>(null);

  const [isCourseSearchOpen, setIsCourseSearchOpen] = useState(false);
  const [selectedSemesterId, setSelectedSemesterId] = useState(""); 
  const [isViewScheduleOpen, setIsViewScheduleOpen] = useState(false);
  const [viewingSemester] = useState<SemesterData | null>(null);
  const [yearsData, setYearsData] = useState<YearData[]>(initialYearsData);
  const [isAddSemesterDialogOpen, setIsAddSemesterDialogOpen] = useState(false);
  const [isMandatoryCoursesDialogOpen, setIsMandatoryCoursesDialogOpen] = useState(false); 
  const [isProgramCreditsDialogOpen, setIsProgramCreditsDialogOpen] = useState(false); 
  
  const navigate = useNavigate();

  const handleOpenCourseSearch = (semesterId: string) => {
    setSelectedSemesterId(semesterId);
    setCourseSearchInitialFilters(null);
    setCourseSearchContextualTitle(null);
    setIsCourseSearchOpen(true);
  };
  
  const handleOpenSchedulePage = (semesterId: string) => {
    navigate(`/schedule?termId=${semesterId}`);
  };

  const handleDeleteCourse = (semesterId: string, courseId: string) => {
    setYearsData(prevYearsData => prevYearsData.map(year => ({
      ...year,
      semesters: year.semesters.map(semester => {
        if (semester.id === semesterId) {
          const updatedCourses = semester.courses.filter(course => course.id !== courseId);
          return { ...semester, courses: updatedCourses, creditsSelected: updatedCourses.reduce((acc, curr) => acc + curr.credits, 0) };
        }
        return semester;
      })
    })));
  };

  const handleRemoveSemester = (semesterIdToRemove: string) => {
    setYearsData(prevYearsData => {
      let semesterFoundAndEmpty = false;
      let yearOfSemester: YearData | null = null;
      let semesterCoursesCount = 0;
      for (const year of prevYearsData) {
        const semester = year.semesters.find(s => s.id === semesterIdToRemove);
        if (semester) {
          yearOfSemester = year;
          semesterCoursesCount = semester.courses.length;
          if (semester.courses.length === 0) semesterFoundAndEmpty = true;
          break;
        }
      }
      if (!yearOfSemester) { toast.error("Semester not found."); return prevYearsData; }
      if (!semesterFoundAndEmpty) { toast.error(`Cannot remove semester with ${semesterCoursesCount} course(s). Please remove all courses first.`); return prevYearsData; }
      const updatedYearsData = prevYearsData.map(year => year.year === yearOfSemester!.year ? { ...year, semesters: year.semesters.filter(s => s.id !== semesterIdToRemove) } : year).filter(year => year.semesters.length > 0);
      toast.success("Semester removed successfully.");
      return updatedYearsData;
    });
  };

  const handleOpenAddSemesterDialog = () => setIsAddSemesterDialogOpen(true);

  const handleAddSemesterSubmit = (data: { year: string; semesterType: string }) => {
    const { year: dialogYearStr, semesterType } = data;
    const academicYearStr = `${dialogYearStr} - ${parseInt(dialogYearStr) + 1}`;
    const semesterId = `${semesterType.replace(/\s+/g, '')}${dialogYearStr}`; 
    const semesterName = `${semesterType} ${dialogYearStr}`;
    const newSemester: SemesterData = { id: semesterId, name: semesterName, creditsSelected: 0, courses: [] };

    setYearsData(prevYearsData => {
      const updatedYearsData = [...prevYearsData];
      let yearIndex = updatedYearsData.findIndex(y => y.year === academicYearStr);
      if (yearIndex > -1) {
        if (!updatedYearsData[yearIndex].semesters.some(s => s.id === semesterId)) {
          updatedYearsData[yearIndex].semesters.push(newSemester);
          const order = ["Spring", "Summer", "Fall"];
          updatedYearsData[yearIndex].semesters.sort((a,b) => order.indexOf(a.name.split(" ")[0]) - order.indexOf(b.name.split(" ")[0]));
        } else console.warn(`Semester ${semesterId} already exists.`);
      } else {
        updatedYearsData.push({ year: academicYearStr, credits: 0, schedules: 0, semesters: [newSemester] });
        updatedYearsData.sort((a,b) => a.year.localeCompare(b.year));
      }
      return updatedYearsData;
    });
    setIsAddSemesterDialogOpen(false);
  };

  const handleAddCourseToPlan = (courseToAdd: Course, semesterId: string) => {
    setYearsData(prevYearsData => 
      prevYearsData.map(year => ({
        ...year,
        semesters: year.semesters.map(semester => {
          if (semester.id === semesterId) {
            if (semester.courses.some(c => c.id === courseToAdd.id)) {
              toast.warn(`${courseToAdd.code} is already in ${semester.name}.`);
              return semester; 
            }
            const updatedCourses = [...semester.courses, courseToAdd];
            toast.success(`${courseToAdd.code} added to ${semester.name}.`);
            return { ...semester, courses: updatedCourses, creditsSelected: updatedCourses.reduce((acc, curr) => acc + curr.credits, 0) };
          }
          return semester;
        })
      }))
    );
  };

  const getStatusBadgeVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    if (status === "Completed") return "default"; 
    if (status === "In Progress") return "secondary"; 
    return "outline"; 
  };
  
  const studentTotalCredits = studentInfo?.totalCredits || 0;
  const programRequiredCredits = actualProgram?.totalCreditsRequired || studentInfo?.requiredCredits || 0;
  const creditsLeft = programRequiredCredits - studentTotalCredits;
  const programProgressValue = programRequiredCredits > 0 ? (studentTotalCredits / programRequiredCredits) * 100 : 0;

  const completedMandatoryCourses = mockMandatoryCourses.filter(c => c.status === "Completed").length;
  const totalMandatoryCourses = mockMandatoryCourses.length;
  const mandatoryCoursesLeft = totalMandatoryCourses - completedMandatoryCourses;
  const mandatoryProgressValue = (completedMandatoryCourses / totalMandatoryCourses) * 100;

  const remainingMandatoryCourses = mockMandatoryCourses.filter(c => c.status !== "Completed");
  const unmetDegreeRequirements = actualProgramAudit?.filter(req => (req.progress ?? 0) < 1) || [];
  const completedCourses = studentInfo?.completedCourses || [];

  const getSuggestedCourses = (requirement: DegreeRequirement) => {
    if (!requirement.courseMatcher) return [];
    const { type, values } = requirement.courseMatcher;
    let suggested = [];
    switch (type) {
      case "department": suggested = mockCourses.filter(course => values.includes(course.department)); break;
      case "courseCodePrefix": suggested = mockCourses.filter(course => values.some(prefix => course.code.startsWith(prefix))); break;
      case "keyword": suggested = mockCourses.filter(course => course.keywords && values.some(keyword => course.keywords!.includes(keyword))); break;
      case "specificCourses": suggested = mockCourses.filter(course => values.includes(course.code)); break;
      default: return [];
    }
    return suggested.filter(course => !completedCourses.includes(course.code)).slice(0, 3);
  };

  const handleFindCoursesForRequirement = (requirement: DegreeRequirement) => {
    let filters: { type: 'matcher', matcher: DegreeRequirement['courseMatcher'] } | { type: 'choice', courses: string[] } | null = null;
    if (requirement.courseMatcher) {
      filters = { type: 'matcher', matcher: requirement.courseMatcher };
    } else if (requirement.choiceCourses && requirement.choiceCourses.length > 0) {
      filters = { type: 'choice', courses: requirement.choiceCourses };
    }

    if (filters) {
      setCourseSearchInitialFilters(filters);
      setCourseSearchContextualTitle(`Courses for: ${requirement.name}`);
      setSelectedSemesterId(""); 
      setIsCourseSearchOpen(true);
    } else {
      toast.warn(`No specific course criteria found to search for requirement: ${requirement.name}`);
    }
  };

  React.useEffect(() => {
    if (studentInfo?.majorId && mockPrograms.length > 0 && mockCourses.length > 0) {
      const currentMajorProgram = mockPrograms.find(p => p.id === studentInfo.majorId && p.type === 'Major');
      if (currentMajorProgram) {
        const currentCompletedCourseCodes = studentInfo.completedCourses || [];
        const auditResults = calculateWhatIfAudit(currentCompletedCourseCodes, currentMajorProgram, mockCourses);
        setActualProgram(currentMajorProgram);
        setActualProgramAudit(auditResults);
      } else {
        setActualProgram(null);
        setActualProgramAudit(null);
        console.warn(`Student's declared major ID (${studentInfo.majorId}) not found in mockPrograms.`);
      }
    } else {
      setActualProgram(null);
      setActualProgramAudit(null);
    }
  }, [studentInfo, mockPrograms, mockCourses]);

  const getCoursesForQuickAdd = (r: DegreeRequirement): string[] => {
    if ((r.progress ?? 0) >= 1) return [];
    const studentCompleted = studentInfo?.completedCourses || [];
    if (r.courseMatcher?.type === "specificCourses") {
      return r.courseMatcher.values.filter(cc => !studentCompleted.includes(cc));
    }
    if (r.choiceCourses && r.choiceRequired === 1) {
      return r.choiceCourses.filter(cc => !studentCompleted.includes(cc));
    }
    return [];
  };

  return (
    <div className="py-3 space-y-6">
      <Card className="w-full mb-4">
        <CardHeader><CardTitle>My Academic Snapshot</CardTitle><CardDescription>Summary of your academic standing and interests.</CardDescription></CardHeader>
        {studentInfo && (
          <CardContent className="space-y-2 text-sm">
            <p className="text-lg font-semibold">{studentInfo.name}</p>
            <p><span className="font-semibold">Major:</span> {studentInfo.major}</p>
            {studentInfo.minor && <p><span className="font-semibold">Minor:</span> {studentInfo.minor}</p>}
            <p><span className="font-semibold">GPA:</span> {studentInfo.gpa ? studentInfo.gpa.toFixed(2) : "N/A"}</p>
            <p><span className="font-semibold">Expected Graduation:</span> {studentInfo.expectedGraduationDate || "N/A"}</p>
            {studentInfo.interests && studentInfo.interests.length > 0 && (<p><span className="font-semibold">Interests:</span> {studentInfo.interests.join(', ')}</p>)}
          </CardContent>
        )}
        {!studentInfo && (<CardContent><p className="text-sm text-muted-foreground">Student information is not available.</p></CardContent>)}
      </Card>

      <Card className="w-full mb-4">
        <CardHeader><CardTitle>Explore Programs (What-If Analysis)</CardTitle><CardDescription>See how your completed courses apply to a different major or minor.</CardDescription></CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="whatif-major-select">Select a "What-If" Major:</Label>
            <Select value={selectedWhatIfMajorId || ""} onValueChange={(value) => setSelectedWhatIfMajorId(value === "none" ? null : value)}>
              <SelectTrigger id="whatif-major-select" className="mt-1"><SelectValue placeholder="Choose a major to explore..." /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None (Show my actual major)</SelectItem>
                {mockPrograms.filter(p => p.type === 'Major').map(program => (<SelectItem key={program.id} value={program.id}>{program.name}</SelectItem>))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="whatif-minor-select">Add a "What-If" Minor (Optional):</Label>
            <Select value={selectedWhatIfMinorId || ""} onValueChange={(value) => setSelectedWhatIfMinorId(value === "none" ? null : value)} disabled={!selectedWhatIfMajorId}>
              <SelectTrigger id="whatif-minor-select" className="mt-1"><SelectValue placeholder="Choose a minor to add..." /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {mockPrograms.filter(p => p.type === 'Minor').map(program => (<SelectItem key={program.id} value={program.id}>{program.name}</SelectItem>))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end space-x-2">
          <Button variant="outline" onClick={() => { setSelectedWhatIfMajorId(null); setSelectedWhatIfMinorId(null); setWhatIfAuditResults(null); setCurrentWhatIfProgram(null); toast.info("What-If analysis cleared. Showing your actual program progress."); }}>Clear What-If</Button>
          <Button onClick={() => {
            if (!selectedWhatIfMajorId) { setWhatIfAuditResults(null); setCurrentWhatIfProgram(null); toast.info("Please select a 'What-If' Major to analyze."); return; }
            const targetMajorProgram = mockPrograms.find(p => p.id === selectedWhatIfMajorId);
            if (targetMajorProgram) {
              const currentCompletedCourseCodes = studentInfo?.completedCourses || [];
              const auditResults = calculateWhatIfAudit(currentCompletedCourseCodes, targetMajorProgram, mockCourses);
              setWhatIfAuditResults(auditResults); setCurrentWhatIfProgram(targetMajorProgram); toast.success(`What-If analysis complete for ${targetMajorProgram.name}.`);
            } else { toast.error("Could not find the selected What-If program details."); setWhatIfAuditResults(null); setCurrentWhatIfProgram(null); }
          }} disabled={!selectedWhatIfMajorId}>Analyze Selected Program(s)</Button>
        </CardFooter>
      </Card>

      {currentWhatIfProgram && whatIfAuditResults && (
        <WhatIfDegreeAuditView whatIfProgram={currentWhatIfProgram} whatIfRequirements={whatIfAuditResults} onFindCoursesForRequirement={handleFindCoursesForRequirement} />
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-4xl font-bold">{actualProgram ? (creditsLeft >= 0 ? creditsLeft : 0) : <span className="text-gray-400">N/A</span>}</CardTitle>
              <CardDescription>{actualProgram ? `${studentTotalCredits}/${programRequiredCredits} program credits left` : "Select a program to see progress"}</CardDescription>
            </div>
            <Accordion type="single" collapsible className="w-auto">
              <AccordionItem value="item-1" className="border-none">
                <Tooltip><TooltipTrigger asChild><AccordionTrigger className="p-2 hover:no-underline [&[data-state=open]>svg]:rotate-180" disabled={!actualProgram}><Button variant="outline" size="sm" disabled={!actualProgram}>View details <ChevronDown className="h-4 w-4 ml-1 transition-transform duration-200" /></Button></AccordionTrigger></TooltipTrigger><TooltipContent><p>Show/hide a detailed breakdown of your program credit requirements.</p></TooltipContent></Tooltip>
                <AccordionContent className="pt-2 text-sm">
                  <h4 className="mb-2 font-semibold text-sm">Program Credits Breakdown</h4>
                  {actualProgramAudit && actualProgramAudit.length > 0 ? (
                    <ul className="space-y-1 text-xs">
                      {actualProgramAudit.map(req => {
                        const quickAddTargetCourses = getCoursesForQuickAdd(req);
                        return (
                          <li key={req.id} className="p-3 border-b last:border-b-0">
                            <div className="flex justify-between items-center">
                              <div className="flex items-center">
                                {req.progress === 1 && <CheckCircle2 className="h-4 w-4 text-green-600 mr-2 flex-shrink-0" />}
                                {req.progress > 0 && req.progress < 1 && <CircleDot className="h-4 w-4 text-yellow-500 mr-2 flex-shrink-0" />}
                                {(req.progress === 0 || req.progress === undefined || isNaN(req.progress)) && <Circle className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />}
                                <span className="text-xs font-medium">{req.name}</span>
                              </div>
                              <span className="text-xs text-muted-foreground ml-2 whitespace-nowrap">
                                {req.choiceRequired ? `${req.progressCourses ?? 0}/${req.choiceRequired} courses` : `${Math.round((req.progress ?? 0) * req.requiredCredits)}/${req.requiredCredits} credits`}
                              </span>
                            </div>
                            {(req.progress ?? 0) < 1 && (
                              <Button variant="link" size="sm" className="mt-1 text-xs px-0 h-auto text-blue-600 hover:text-blue-800" onClick={() => handleFindCoursesForRequirement(req)}>Find Courses for this Requirement</Button>
                            )}
                            {quickAddTargetCourses.length > 0 && (
                              <div className="mt-2 pl-6">
                                <p className="text-xs font-semibold text-muted-foreground mb-1">Quick Add Suggestions:</p>
                                <ul className="space-y-1">
                                  {quickAddTargetCourses.map(courseCode => {
                                    const courseObj = mockCourses.find(c => c.code === courseCode);
                                    if (!courseObj) return null;
                                    const isCompleted = studentInfo?.completedCourses?.includes(courseCode);
                                    if (isCompleted) return null;
                                    return (
                                      <li key={courseCode} className="flex justify-between items-center text-xs">
                                        <span>{courseObj.code} - {courseObj.name} ({courseObj.credits} cr)</span>
                                        <Tooltip>
                                          <TooltipTrigger asChild>
                                            <Button variant="ghost" size="icon_sm" className="h-6 w-6" onClick={() => {
                                              const targetSemester = yearsData[0]?.semesters[0];
                                              if (targetSemester && courseObj) { handleAddCourseToPlan(courseObj, targetSemester.id); } 
                                              else { toast.error("No suitable semester found for Quick Add or course not found."); }
                                            }}>
                                              <PlusSquare size={14} />
                                            </Button>
                                          </TooltipTrigger>
                                          <TooltipContent><p>Quick add to {yearsData[0]?.semesters[0]?.name || "first semester"}</p></TooltipContent>
                                        </Tooltip>
                                      </li>
                                    );
                                  })}
                                </ul>
                              </div>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  ) : (<p className="text-xs text-muted-foreground">No program selected or requirements not available.</p>)}
                  <Tooltip><TooltipTrigger asChild><Button variant="link" size="sm" onClick={() => setIsProgramCreditsDialogOpen(true)} className="mt-2 text-xs px-0 h-auto">View Course Options for Requirements</Button></TooltipTrigger><TooltipContent><p>See course suggestions for fulfilling unmet degree requirements.</p></TooltipContent></Tooltip>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardHeader>
          <CardContent className="pt-0"> <Progress value={programProgressValue} className="h-2" /></CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <div><CardTitle className="text-4xl font-bold">{mandatoryCoursesLeft}</CardTitle><CardDescription>{completedMandatoryCourses}/{totalMandatoryCourses} mandatory courses left</CardDescription></div>
            <Accordion type="single" collapsible className="w-auto">
              <AccordionItem value="item-1" className="border-none">
                <Tooltip><TooltipTrigger asChild><AccordionTrigger className="p-2 hover:no-underline [&[data-state=open]>svg]:rotate-180"><Button variant="outline" size="sm">View details <ChevronDown className="h-4 w-4 ml-1 transition-transform duration-200" /></Button></AccordionTrigger></TooltipTrigger><TooltipContent><p>Show/hide the list of mandatory courses and their current status.</p></TooltipContent></Tooltip>
                <AccordionContent className="pt-2 text-sm">
                  <h4 className="mb-2 font-semibold text-sm">Mandatory Courses</h4>
                  <ul className="space-y-1 text-xs">
                    {mockMandatoryCourses.map(course => (
                      <li key={course.code} className="flex justify-between items-center">
                        <div className="flex items-center">
                          {course.status === "Completed" && <CheckCircle2 className="h-4 w-4 text-green-600 mr-2 flex-shrink-0" />}
                          {course.status === "In Progress" && <CircleDot className="h-4 w-4 text-yellow-500 mr-2 flex-shrink-0" />}
                          {course.status !== "Completed" && course.status !== "In Progress" && <Circle className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />}
                          <div><span className="font-medium">{course.code}: </span><span>{course.name}</span></div>
                        </div>
                        <Badge variant={getStatusBadgeVariant(course.status)}>{course.status}</Badge>
                      </li>))}
                  </ul>
                  <Tooltip><TooltipTrigger asChild><Button variant="link" size="sm" onClick={() => setIsMandatoryCoursesDialogOpen(true)} className="mt-2 text-xs px-0 h-auto">View Remaining Mandatory Courses</Button></TooltipTrigger><TooltipContent><p>See a filtered list of mandatory courses you still need to complete.</p></TooltipContent></Tooltip>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardHeader>
        </Card>
      </div>

      <div className="space-y-6">
        {yearsData.map((year) => (
          <div key={year.year}>
            <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-3"><h3 className="text-xl font-semibold">{year.year}</h3><p className="text-sm text-muted-foreground">{year.semesters.reduce((acc, sem) => acc + sem.creditsSelected, 0)} credits · {year.schedules} Schedules</p></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {year.semesters.map((semester) => (
                <Card key={semester.id} className="flex flex-col">
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-lg">{semester.name.replace(/\s\d{4}$/, "")}</CardTitle>
                      <div className="flex space-x-1">
                        <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive/80" onClick={() => handleRemoveSemester(semester.id)} aria-label="Remove semester"><Trash2 size={16} /></Button></TooltipTrigger><TooltipContent><p>Remove this semester (only if empty).</p></TooltipContent></Tooltip>
                      </div>
                    </div>
                    <CardDescription>{semester.creditsSelected}/18 credits selected</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <Select defaultValue="case-western"><SelectTrigger className="mb-3 text-xs h-8"><SelectValue placeholder="Select University" /></SelectTrigger><SelectContent><SelectItem value="case-western">Case Western Reserve University</SelectItem><SelectItem value="cleveland-state">Cleveland State University</SelectItem></SelectContent></Select>
                    {semester.courses.length > 0 ? (
                      <ul className="space-y-3">
                        {semester.courses.map(course => (
                          <li key={course.id} className="text-xs border-b pb-2 last:border-0 last:pb-0">
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="flex items-center mb-0.5"><span className="font-semibold mr-1.5">{course.code}</span><Badge variant="secondary" className="mr-1.5">{course.credits} cr</Badge></div>
                                <p className="text-muted-foreground leading-tight">{course.name}</p>
                                {course.prerequisites && course.prerequisites.length > 0 && (<p className="mt-1 text-amber-600 text-[11px] leading-tight">Prereqs: {course.prerequisites.join(', ')}</p>)}
                              </div>
                              <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" className="h-6 w-6 text-destructive hover:text-destructive/80" onClick={() => handleDeleteCourse(semester.id, course.id)} aria-label="Delete course"><Trash2 size={14} /></Button></TooltipTrigger><TooltipContent><p>Remove this course from the semester.</p></TooltipContent></Tooltip>
                            </div>
                          </li>))}
                      </ul>) : (<p className="text-xs text-muted-foreground text-center mt-4">No courses added yet.</p>)}
                  </CardContent>
                  <CardFooter className="flex flex-col sm:flex-row gap-2 pt-4"> 
                    <Tooltip><TooltipTrigger asChild><Button onClick={() => handleOpenCourseSearch(semester.id)} variant="outline" size="sm" className="w-full"><PlusCircle size={14} className="mr-1.5" /> Add Courses</Button></TooltipTrigger><TooltipContent><p>Search and add courses to this semester.</p></TooltipContent></Tooltip>
                    <Tooltip><TooltipTrigger asChild><Button onClick={() => handleOpenSchedulePage(semester.id)} variant="default" size="sm" className="w-full">View Schedule <ArrowRight size={14} className="ml-1.5" /></Button></TooltipTrigger><TooltipContent><p>Open the detailed scheduling tool for this semester.</p></TooltipContent></Tooltip>
                  </CardFooter>
                </Card>))}
            </div>
            <div className="flex justify-center mt-4"><Tooltip><TooltipTrigger asChild><Button variant="outline" onClick={handleOpenAddSemesterDialog} className="w-full max-w-md border-dashed hover:border-solid"><PlusCircle size={16} className="mr-2" /> Add Semester</Button></TooltipTrigger><TooltipContent><p>Add a new academic semester to your plan.</p></TooltipContent></Tooltip></div>
          </div>))}
      </div>

      <CourseSearch 
        open={isCourseSearchOpen} 
        onOpenChange={setIsCourseSearchOpen}
        termId={selectedSemesterId} 
        onCourseSelected={(course, termIdFromSearch) => { 
          if (courseSearchInitialFilters) {
            toast.success(`${course.code} selected. Add it to a semester in your plan, or it will be added to your general planning list.`);
            if (selectedSemesterId) { 
              handleAddCourseToPlan(course, selectedSemesterId);
            } else {
               console.log("Course selected for requirement without a pre-selected target semester:", course);
            }
            setCourseSearchInitialFilters(null); 
            setCourseSearchContextualTitle(null);
          } else if (selectedSemesterId) {
            handleAddCourseToPlan(course, selectedSemesterId);
          } else {
            toast.error("Please select a semester to add this course.");
          }
        }}
        initialFilterCriteria={courseSearchInitialFilters}
        contextualDrawerTitle={courseSearchContextualTitle}
      />
      
      {viewingSemester && (<ViewScheduleDialog open={isViewScheduleOpen} onOpenChange={setIsViewScheduleOpen} semesterName={viewingSemester.name} courses={viewingSemester.courses} />)}
      <AddSemesterDialog open={isAddSemesterDialogOpen} onOpenChange={setIsAddSemesterDialogOpen} onAddSemester={handleAddSemesterSubmit} />
      <Dialog open={isMandatoryCoursesDialogOpen} onOpenChange={setIsMandatoryCoursesDialogOpen}><DialogContent className="sm:max-w-lg"><DialogHeader><DialogTitle>Remaining Mandatory Courses</DialogTitle><DialogDescription>These are the mandatory courses you still need to complete for your degree.</DialogDescription></DialogHeader><div className="py-4 space-y-3 max-h-[60vh] overflow-y-auto">{remainingMandatoryCourses.length > 0 ? (remainingMandatoryCourses.map(course => (<div key={course.code} className="border-b pb-2 last:border-0 last:pb-0"><h4 className="font-semibold">{course.code} - {course.name}</h4><p className="text-sm text-muted-foreground">Credits: {course.credits !== undefined ? course.credits : "N/A"}</p>{course.prerequisites && course.prerequisites.length > 0 && (<p className="text-sm text-muted-foreground">Prerequisites: {course.prerequisites.join(', ')}</p>)}</div>))) : (<p className="text-sm text-muted-foreground">All mandatory courses have been completed or are in progress.</p>)}</div><DialogFooter><Button variant="outline" onClick={() => setIsMandatoryCoursesDialogOpen(false)}>Close</Button></DialogFooter></DialogContent></Dialog>
      <Dialog open={isProgramCreditsDialogOpen} onOpenChange={setIsProgramCreditsDialogOpen}><DialogContent className="sm:max-w-2xl"><DialogHeader><DialogTitle>Course Options for Degree Requirements</DialogTitle><DialogDescription>Here are some course suggestions for your unmet degree requirements.</DialogDescription></DialogHeader><div className="py-4 space-y-4 max-h-[70vh] overflow-y-auto">{unmetDegreeRequirements.length > 0 ? (unmetDegreeRequirements.map(req => { const suggestedCourses = getSuggestedCourses(req); const creditsToComplete = req.requiredCredits * (1 - req.progress); return (<div key={req.id} className="p-3 border rounded-md bg-background/50"><h4 className="font-semibold text-md mb-1">{req.name}</h4><p className="text-xs text-muted-foreground mb-2">{creditsToComplete} credits remaining.{req.choiceRequired && ` Choose ${req.choiceRequired - (req.progressCourses || 0)} more.`}</p>{suggestedCourses.length > 0 ? (<ul className="space-y-1.5">{suggestedCourses.map(course => (<li key={course.id} className="text-xs p-2 border rounded-md bg-background hover:bg-muted/50"><div className="flex justify-between items-center"><div><span className="font-medium">{course.code}</span> - {course.name}<span className="text-muted-foreground ml-1">({course.credits} cr)</span></div></div>{course.prerequisites && course.prerequisites.length > 0 && (<p className="text-xs text-amber-600 mt-0.5">Prereqs: {course.prerequisites.join(', ')}</p>)}</li>))}</ul>) : (<p className="text-xs text-muted-foreground italic">Specific course suggestions not available based on current matcher, or all suggestions already completed. Check course catalog or academic advisor.</p>)}</div>);})) : (<p className="text-sm text-muted-foreground text-center">All degree requirements appear to be met or in progress. Congratulations!</p>)}</div><DialogFooter><Button variant="outline" onClick={() => setIsProgramCreditsDialogOpen(false)}>Close</Button></DialogFooter></DialogContent></Dialog>
    </div>
  );
};

export default CourseDashboard;
