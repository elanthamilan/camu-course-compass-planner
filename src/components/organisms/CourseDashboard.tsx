import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/atoms/card";
import { Button } from "@/components/atoms/button";
import { Progress } from "@/components/atoms/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/atoms/select";
import { Badge } from "@/components/atoms/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/atoms/accordion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/atoms/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/atoms/tabs";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/atoms/tooltip";
import { toast } from "sonner";
import { mockPrograms, mockCourses, mockMandatoryCourses } from "@/lib/mock-data";
import { PlusCircle, Trash2, ArrowRight, ChevronDown, Eye, CheckCircle2, CircleDot, Circle, PlusSquare, Lightbulb, CheckCircle, Clock, Target, Search, Info, Home, RotateCcw, TrendingUp, AlertCircle, GraduationCap, BookOpen, Zap } from "lucide-react";
import { useSchedule } from '@/contexts/ScheduleContext';
import { Label } from "@/components/atoms/label";
import { calculateWhatIfAudit } from '../../lib/degree-audit-utils';
import WhatIfDegreeAuditView from './WhatIfDegreeAuditView';
import { Course, AcademicProgram, DegreeRequirement } from "../../lib/types";
import CourseSearchModal from './CourseSearchModal';
import ViewScheduleDialog from './ViewScheduleDialog';
import AddSemesterDialog from './AddSemesterDialog';
import CourseCatalogView from './CourseCatalogView';

interface FilterPreset {
  searchTerm?: string;
  department?: string;
  level?: string;
  credits?: string;
  classStatus?: string;
  attributes?: string[];
}

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
        id: "Summer2024", name: "Summer 2024", creditsSelected: 24, courses: [
          { id: "cs101", code: "CS101", name: "Introduction to Computer Science", credits: 3, days: "MWF", time: "09:00", prerequisites: [] },
          { id: "math105", code: "MATH105", name: "Pre-Calculus", credits: 3, days: "MWF", time: "08:00", prerequisites: [] },
          { id: "eng234", code: "ENG234", name: "Composition II", credits: 3, days: "MW", time: "10:00", prerequisites: ["ENG100"] },
          { id: "hist101", code: "HIST101", name: "World History I", credits: 3, days: "TTh", time: "09:00", prerequisites: [] },
          { id: "psyc101", code: "PSYC101", name: "Introduction to Psychology", credits: 3, days: "MWF", time: "11:00", prerequisites: [] },
          { id: "soc101", code: "SOC101", name: "Introduction to Sociology", credits: 3, days: "TTh", time: "14:00", prerequisites: [] },
          { id: "span101", code: "SPAN101", name: "Elementary Spanish I", credits: 4, days: "MWF", time: "08:00", prerequisites: [] },
          { id: "pe101", code: "PE101", name: "Physical Education - Fitness", credits: 1, days: "TTh", time: "07:00", prerequisites: [] }
        ]
      },
      {
        id: "Fall2024", name: "Fall 2024", creditsSelected: 25, courses: [
          { id: "phys210", code: "PHYS210", name: "Physics I: Mechanics", credits: 4, days: "MWF", time: "13:00", prerequisites: [] },
          { id: "phil101", code: "PHIL101", name: "Introduction to Logic", credits: 3, days: "MWF", time: "11:00", prerequisites: [] },
          { id: "univ100", code: "UNIV100", name: "University Seminar", credits: 1, days: "W", time: "14:00", prerequisites: [] },
          { id: "cs350", code: "CS350", name: "Database Systems", credits: 3, days: "MWF", time: "14:00", prerequisites: [] },
          { id: "art200", code: "ART200", name: "Digital Art Studio", credits: 3, days: "MW", time: "10:00", prerequisites: [] },
          { id: "eng101", code: "ENG101", name: "Composition I", credits: 3, days: "MWF", time: "09:00", prerequisites: [] },
          { id: "math201", code: "MATH201", name: "Calculus I", credits: 4, days: "MWF", time: "08:00", prerequisites: [] },
          { id: "bio101", code: "BIO101", name: "Introduction to Biology", credits: 4, days: "MWF", time: "09:00", prerequisites: [] }
        ]
      },
      {
        id: "Spring2025", name: "Spring 2025", creditsSelected: 26, courses: [
          { id: "econ101", code: "ECON101", name: "Principles of Microeconomics", credits: 3, days: "MWF", time: "10:00", prerequisites: [] },
          { id: "chem101", code: "CHEM101", name: "General Chemistry", credits: 4, days: "MWF", time: "13:00", prerequisites: [] },
          { id: "ds442", code: "DS442", name: "Artificial Intelligence", credits: 3, days: "TR", time: "13:35", prerequisites: ["CMPSC221"] },
          { id: "grad500", code: "GRAD500", name: "Advanced Research Methods", credits: 4, days: "W", time: "18:00", prerequisites: [] },
          { id: "test100", code: "TEST100", name: "Test Base Course", credits: 3, days: "MWF", time: "10:00", prerequisites: [] },
          { id: "test200", code: "TEST200", name: "Test Mid Course", credits: 3, days: "TTh", time: "11:00", prerequisites: ["TEST100"] },
          { id: "test300", code: "TEST300", name: "Test Top Course", credits: 3, days: "MWF", time: "15:00", prerequisites: ["TEST200"] },
          { id: "circ1", code: "CIRC1", name: "Circular 1", credits: 3, days: "TTh", time: "16:00", prerequisites: ["CIRC2"] }
        ]
      }
    ]
  },
];

const CourseDashboard: React.FC = () => {
  const { studentInfo, addCourse } = useSchedule();

  const [selectedWhatIfMajorId, setSelectedWhatIfMajorId] = useState<string | null>(null);
  const [selectedWhatIfMinorId, setSelectedWhatIfMinorId] = useState<string | null>(null);
  const [whatIfAuditResults, setWhatIfAuditResults] = useState<DegreeRequirement[] | null>(null);
  const [currentWhatIfProgram, setCurrentWhatIfProgram] = useState<AcademicProgram | null>(null);

  const [actualProgram, setActualProgram] = useState<AcademicProgram | null>(null);
  const [actualProgramAudit, setActualProgramAudit] = useState<DegreeRequirement[] | null>(null);



  const [isCourseSearchOpen, setIsCourseSearchOpen] = useState(false);
  const [selectedSemesterId, setSelectedSemesterId] = useState("");
  const [isViewScheduleOpen, setIsViewScheduleOpen] = useState(false);
  const [viewingSemester] = useState<SemesterData | null>(null);
  const [yearsData, setYearsData] = useState<YearData[]>(initialYearsData);
  const [isAddSemesterDialogOpen, setIsAddSemesterDialogOpen] = useState(false);
  const [isMandatoryCoursesDialogOpen, setIsMandatoryCoursesDialogOpen] = useState(false);
  const [isProgramCreditsDialogOpen, setIsProgramCreditsDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("academic-plan");
  const [catalogSearchTerm, setCatalogSearchTerm] = useState<string | null>(null);
  const [catalogFilterPreset, setCatalogFilterPreset] = useState<FilterPreset | null>(null);

  const navigate = useNavigate();

  const handleOpenCourseSearch = (semesterId: string) => {
    setSelectedSemesterId(semesterId);
    setIsCourseSearchOpen(true);
  };

  const handleNavigateToBrowseAllClasses = (searchTerm?: string, filterPreset?: FilterPreset) => {
    setActiveTab("course-catalog");
    if (searchTerm) {
      setCatalogSearchTerm(searchTerm);
    }
    if (filterPreset) {
      setCatalogFilterPreset(filterPreset);
    }
    // Scroll to top to show the tab content
    setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100);
  };

  // Navigate to Browse All Classes with filters for degree requirements
  const handleNavigateToRequirementCourses = () => {
    const remainingMandatoryCourses = mockMandatoryCourses.filter(course => course.status === "Not Started");
    const requiredDepartments = [...new Set(remainingMandatoryCourses.map(course => {
      // Extract department from course code (e.g., "CS101" -> "Computer Science")
      const courseData = mockCourses.find(c => c.code === course.code);
      return courseData?.department;
    }).filter(Boolean))];

    const filterPreset = {
      // Only filter by department if there's exactly one department needed
      ...(requiredDepartments.length === 1 && { department: requiredDepartments[0] }),
      classStatus: "Open", // Show only available courses
    };

    setActiveTab("course-catalog");
    setCatalogFilterPreset(filterPreset);
    setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100);
  };

  // Navigate to Browse All Classes with filters for graduation progress
  const handleNavigateToGraduationCourses = () => {
    // Filter for courses that help with graduation requirements
    const filterPreset = {
      department: "Computer Science", // Focus on major courses
      classStatus: "Open",
      attributes: ["Technical"] // Focus on technical courses
    };

    setActiveTab("course-catalog");
    setCatalogFilterPreset(filterPreset);
    setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100);
  };

  const handleOpenSchedulePage = (semesterId: string) => {
    // Find the semester and its courses
    const semester = yearsData
      .flatMap(year => year.semesters)
      .find(sem => sem.id === semesterId);

    if (semester && semester.courses.length > 0) {
      // Sync courses to ScheduleContext before navigating
      // IMPORTANT: Get full course data with sections from mockCourses
      semester.courses.forEach(semesterCourse => {
        // Find the full course data from mockCourses using the course ID
        const fullCourse = mockCourses.find(c => c.id === semesterCourse.id);
        if (fullCourse) {
          addCourse(fullCourse); // Add the full course with sections
        } else {
          console.warn(`Course ${semesterCourse.id} not found in mockCourses`);
          // Fallback: add the semester course as-is (but it won't have sections)
          addCourse(semesterCourse);
        }
      });

      // Navigate to schedule page with immediate generation flag
      navigate(`/schedule?semester=${semesterId}&autoGenerate=true`);
    } else {
      toast.error("Please add courses to this semester before building a schedule.");
    }
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
      const updatedYearsData = prevYearsData.map(year => year.year === yearOfSemester!.year ? { ...year, semesters: year.semesters.filter(s => s.id !== semesterIdToRemove) } : year).filter(year => year.semesters.length > 0 || prevYearsData.length === 1);
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
          // Sort semesters chronologically: Fall (start of academic year), Spring, Summer
          const order = ["Fall", "Spring", "Summer"];
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
              toast.info(`${courseToAdd.code} is already in ${semester.name}.`);
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
    <div className="mx-auto px-4 max-w-7xl space-y-6 pb-24 md:pb-6">
      {/* Minimal Header - Full Width */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 items-center justify-between py-4 md:py-6 animate-fade-in w-full">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Academic Planning</h1>
          <p className="text-sm sm:text-base text-gray-600">Plan your courses and track your progress</p>
        </div>
      </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-4 mb-4 md:mb-6">
          {/* Progress Toward Graduation Card */}
          <Card>
          <CardHeader className="pb-3 md:pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 md:space-x-3 flex-1 min-w-0 w-full">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-base md:text-lg">🎯</span>
                </div>
                <div className="min-w-0 flex-1">
                  <CardTitle className="text-base md:text-lg font-semibold truncate">Graduation Progress</CardTitle>
                  <CardDescription className="text-xs md:text-sm truncate">
                    {creditsLeft >= 0 ? creditsLeft : 0} credits remaining
                  </CardDescription>
                </div>
              </div>
              <Badge variant="outline" className="text-xs md:text-sm flex-shrink-0">{Math.round(programProgressValue)}%</Badge>
            </div>
            <div className="mt-4">
              <Progress value={programProgressValue} className="h-2" />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>{studentTotalCredits} completed</span>
                <span>{programRequiredCredits} total</span>
              </div>
            </div>
          </CardHeader>

          {actualProgram && actualProgramAudit && actualProgramAudit.length > 0 && (
            <CardContent className="pt-0">
              <Accordion type="single" collapsible>
                <AccordionItem value="credits-details" className="border-none">
                  <AccordionTrigger className="py-2 hover:no-underline">
                    <span className="text-sm font-medium">📋 Show me what I still need to do</span>
                  </AccordionTrigger>
                  <AccordionContent className="pt-2">

                    <div className="space-y-3">
                      {actualProgramAudit.map(req => {
                        const isCompleted = req.progress === 1;
                        const isInProgress = req.progress > 0 && req.progress < 1;

                        return (
                          <div key={req.id} className={`p-3 rounded border ${
                            isCompleted ? 'bg-green-50 border-green-200' :
                            isInProgress ? 'bg-yellow-50 border-yellow-200' :
                            'bg-gray-50 border-gray-200'
                          }`}>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                {isCompleted && <span className="text-lg">✅</span>}
                                {isInProgress && <span className="text-lg">🔄</span>}
                                {!isCompleted && !isInProgress && <span className="text-lg">📝</span>}
                                <div>
                                  <span className="text-sm font-medium">{req.name}</span>
                                  {req.description && (
                                    <p className="text-xs sm:text-sm text-gray-600 mt-1">{req.description}</p>
                                  )}
                                </div>
                              </div>
                              <Badge variant={isCompleted ? "default" : isInProgress ? "secondary" : "outline"} className="text-xs">
                                {req.choiceRequired ? `${req.progressCourses ?? 0}/${req.choiceRequired} classes` : `${Math.round((req.progress ?? 0) * req.requiredCredits)}/${req.requiredCredits} credits`}
                              </Badge>
                            </div>

                          </div>
                        );
                      })}
                      {/* Smart Alerts */}
                      {creditsLeft > 0 && creditsLeft <= 30 && (
                        <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <p className="text-sm text-blue-800">
                            <span className="font-semibold">🎯 Almost there!</span> You're only {creditsLeft} credits away from graduation.
                          </p>
                        </div>
                      )}

                      <div className="flex flex-col gap-2 mt-2">
                        <Button variant="outline" size="sm" onClick={() => setIsProgramCreditsDialogOpen(true)} className="w-full">
                          <Target className="h-4 w-4 mr-2" />
                          Course Suggestions
                        </Button>
                        <Button variant="default" size="sm" onClick={() => handleNavigateToGraduationCourses()} className="w-full">
                          <Search className="h-4 w-4 mr-2" />
                          Browse All Classes
                        </Button>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          )}
        </Card>

        {/* Required Classes Card */}
        <Card>
          <CardHeader className="pb-3 md:pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 md:space-x-3 flex-1 min-w-0 w-full">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-base md:text-lg">📚</span>
                </div>
                <div className="min-w-0 flex-1">
                  <CardTitle className="text-base md:text-lg font-semibold truncate">Required Courses</CardTitle>
                  <CardDescription className="text-xs md:text-sm truncate">
                    {mandatoryCoursesLeft} courses remaining
                  </CardDescription>
                </div>
              </div>
              <Badge variant="outline" className="text-xs md:text-sm flex-shrink-0">{Math.round(mandatoryProgressValue)}%</Badge>
            </div>
            <div className="mt-4">
              <Progress value={mandatoryProgressValue} className="h-2" />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>{completedMandatoryCourses} completed</span>
                <span>{totalMandatoryCourses} total</span>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-0">
            <Accordion type="single" collapsible>
              <AccordionItem value="courses-details" className="border-none">
                <AccordionTrigger className="py-2 hover:no-underline">
                  <span className="text-sm font-medium">📖 Show me my required classes</span>
                </AccordionTrigger>
                <AccordionContent className="pt-2">

                  <div className="space-y-2">
                    {mockMandatoryCourses.map(course => {
                      const isCompleted = course.status === "Completed";
                      const isInProgress = course.status === "In Progress";

                      return (
                        <div key={course.code} className={`p-3 rounded border ${
                          isCompleted ? 'bg-green-50 border-green-200' :
                          isInProgress ? 'bg-yellow-50 border-yellow-200' :
                          'bg-gray-50 border-gray-200'
                        }`}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              {isCompleted && <span className="text-lg">✅</span>}
                              {isInProgress && <span className="text-lg">🔄</span>}
                              {!isCompleted && !isInProgress && <span className="text-lg">📝</span>}
                              <div>
                                <span className="font-medium text-sm">{course.code}</span>
                                 <p className="text-xs sm:text-sm text-muted-foreground">{course.name}</p>
                                {course.prerequisites && course.prerequisites.length > 0 && (
                                  <p className="text-xs sm:text-sm text-amber-600 mt-1">
                                    📋 Need to take first: {course.prerequisites.join(', ')}
                                  </p>
                                )}
                              </div>
                            </div>
                            <Badge variant={getStatusBadgeVariant(course.status)} className="text-xs">
                              {course.status === "Completed" ? "✅ Done" :
                               course.status === "In Progress" ? "🔄 Taking Now" :
                               "📝 Need to Take"}
                            </Badge>
                          </div>
                        </div>
                      );
                    })}
                    {/* Prerequisite Alerts */}
                    {remainingMandatoryCourses.some(c => c.prerequisites && c.prerequisites.length > 0) && (
                      <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                        <p className="text-sm text-amber-800">
                          <span className="font-semibold">⚠️ Prerequisites needed:</span> Some courses require completing other classes first.
                        </p>
                      </div>
                    )}

                    <div className="flex flex-col gap-2 mt-2">
                      <Button variant="outline" size="sm" onClick={() => setIsMandatoryCoursesDialogOpen(true)} className="w-full">
                        <BookOpen className="h-4 w-4 mr-2" />
                        View All Required
                      </Button>
                      <Button variant="default" size="sm" onClick={() => handleNavigateToRequirementCourses()} className="w-full">
                        <Search className="h-4 w-4 mr-2" />
                        Browse All Classes
                      </Button>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mt-4 md:mt-6">
        <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3 mb-4 md:mb-6 h-auto">
          <TabsTrigger value="academic-plan" className="flex items-center justify-center py-2 md:py-3 text-sm md:text-base">
            <span className="mr-1 md:mr-2">📅</span>
            <span className="truncate">Plan My Classes</span>
          </TabsTrigger>
          <TabsTrigger value="explore-programs" className="flex items-center justify-center py-2 md:py-3 text-sm md:text-base">
            <span className="mr-1 md:mr-2">🔍</span>
            <span className="truncate">Explore Other Majors</span>
          </TabsTrigger>
          <TabsTrigger value="course-catalog" className="flex items-center justify-center py-2 md:py-3 text-sm md:text-base">
            <span className="mr-1 md:mr-2">📚</span>
            <span className="truncate">Browse All Classes</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="academic-plan">
          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-3 sm:left-6 lg:left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-200 via-purple-200 to-green-200"></div>

            <div className="space-y-6 md:space-y-8">
              {yearsData.map((year, yearIndex) => (
                <div key={year.year} className="relative">
                  {/* Timeline Node */}
                  <div className={`absolute left-1 sm:left-4 lg:left-6 w-4 h-4 rounded-full border-4 border-white shadow-lg z-10 ${
                    year.semesters.some(s => s.courses.length > 0)
                      ? 'bg-blue-500'
                      : 'bg-gray-300'
                  }`}></div>

                  {/* Year Content */}
                  <div className="ml-6 sm:ml-12 lg:ml-16">
                    <div className="mb-4 md:mb-6">
                      <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:items-center sm:space-x-3 mb-2 w-full">
                        <h3 className="text-xl md:text-2xl font-bold text-gray-900">{year.year}</h3>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="outline" className="text-xs md:text-sm">
                            {year.semesters.reduce((acc, sem) => acc + sem.creditsSelected, 0)} credits planned
                          </Badge>
                          {year.semesters.some(s => s.courses.length > 0) && (
                            <Badge variant="default" className="text-xs bg-green-100 text-green-800">
                              ✓ In Progress
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <p className="text-gray-600">Academic Year {yearIndex + 1}</p>
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                          <span>📚 {year.semesters.reduce((acc, sem) => acc + sem.courses.length, 0)} courses</span>
                          <span>•</span>
                          <span>📅 {year.semesters.length} semesters</span>
                        </div>
                      </div>
                    </div>

                    {/* Semesters Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 mb-4 md:mb-6">
                      {year.semesters.map((semester) => (
                        <Card key={semester.id} className={`flex flex-col hover:shadow-md transition-all duration-200 ${
                          semester.courses.length > 0
                            ? 'border-blue-200 bg-blue-50/30'
                            : 'border-gray-200'
                        }`}>
                          <CardHeader className="pb-2 md:pb-3">
                            <div className="flex justify-between items-start md:items-center">
                              <div className="flex items-center space-x-2 flex-1 min-w-0">
                                <div className={`w-3 h-3 rounded-full flex-shrink-0 ${
                                  semester.courses.length > 0 ? 'bg-blue-500' : 'bg-gray-300'
                                }`}></div>
                                <CardTitle className="text-base md:text-lg font-semibold text-gray-800 truncate">
                                  {semester.name.replace(/\s\d{4}$/, "")}
                                </CardTitle>
                              </div>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-gray-400 hover:text-red-500"
                                    onClick={() => handleRemoveSemester(semester.id)}
                                  >
                                    <Trash2 size={16} />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Remove semester</TooltipContent>
                              </Tooltip>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge variant={semester.courses.length > 0 ? "default" : "secondary"} className="text-xs">
                                {semester.creditsSelected} credits
                              </Badge>
                              <span className="text-xs text-gray-500">
                                {semester.courses.length} courses
                              </span>
                              {semester.creditsSelected >= 12 && (
                                <Badge variant="outline" className="text-xs text-green-600 border-green-300">
                                  Full-time
                                </Badge>
                              )}
                            </div>
                          </CardHeader>

                          <CardContent className="flex-grow p-3 md:p-6">
                            {semester.courses.length > 0 ? (
                              <div className="space-y-2">
                                {semester.courses.map(course => (
                                  <div key={course.id} className="p-2 md:p-3 bg-gray-50 rounded-lg border">
                                    <div className="flex justify-between items-start">
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center space-x-2 mb-1">
                                          <span className="font-semibold text-xs sm:text-sm truncate">{course.code}</span>
                                          <Badge variant="outline" className="text-xs px-1 py-0 flex-shrink-0">
                                            {course.credits}cr
                                          </Badge>
                                        </div>
                                        <p className="text-xs sm:text-sm text-gray-700 leading-tight">{course.name}</p>
                                        {course.prerequisites && course.prerequisites.length > 0 && (
                                          <p className="text-xs text-amber-600 mt-1">
                                            Prereqs: {course.prerequisites.join(', ')}
                                          </p>
                                        )}
                                      </div>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-gray-400 hover:text-red-500"
                                        onClick={() => handleDeleteCourse(semester.id, course.id)}
                                      >
                                        <Trash2 size={14} />
                                      </Button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="text-center py-6">
                                <div className="text-gray-400 mb-2">📚</div>
                                <p className="text-sm text-gray-500">No courses planned</p>
                              </div>
                            )}
                          </CardContent>

                          <CardFooter className="pt-3">
                            <div className="w-full space-y-3">
                              <Button
                                onClick={() => handleOpenCourseSearch(semester.id)}
                                variant="outline"
                                size="sm"
                                className="w-full"
                              >
                                <PlusCircle size={14} className="mr-2" />
                                Add Courses
                              </Button>

                              {/* Course Planning Hints */}
                              {semester.courses.length === 0 && (
                                <div className="text-xs text-gray-500 p-2 bg-blue-50 rounded border-dashed border border-blue-200">
                                  💡 <strong>Tip:</strong> Use the 'Add Courses' button above, or find courses in the 'Course Catalog' or your 'Degree Audit' sections to plan your semester.
                                </div>
                              )}

                              <Button
                                onClick={() => handleOpenSchedulePage(semester.id)}
                                variant="default"
                                size="sm"
                                className="w-full"
                                disabled={semester.courses.length === 0}
                              >
                                <Zap size={14} className="mr-2" />
                                {semester.courses.length > 0 ? "Build Conflict-Free Schedule" : "Add Courses First"}
                              </Button>

                              {/* Schedule Planning Info */}
                              {semester.courses.length > 0 && (
                                <div className="text-xs text-green-600 text-center">
                                  ✅ Ready to create schedule with {semester.courses.length} courses
                                </div>
                              )}
                            </div>
                          </CardFooter>
                        </Card>
                      ))}

                      {/* Add Semester Card */}
                      <Card className="flex flex-col justify-center items-center border-dashed border-2 hover:border-solid hover:bg-gray-50 transition-all cursor-pointer" onClick={handleOpenAddSemesterDialog}>
                        <CardContent className="text-center py-8">
                          <PlusCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-600 font-medium">Add Semester</p>
                          <p className="text-xs text-gray-500 mt-1">Summer, Fall, Spring</p>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </div>
              ))}

              {/* Add Year Section */}
              <div className="relative">
                <div className="absolute left-2 sm:left-4 lg:left-6 w-4 h-4 bg-gray-300 rounded-full border-4 border-white shadow-lg z-10"></div>
                <div className="ml-8 sm:ml-12 lg:ml-16">
                  <Card className="border-dashed border-2 hover:border-solid hover:bg-gray-50 transition-all cursor-pointer" onClick={handleOpenAddSemesterDialog}>
                    <CardContent className="text-center py-6">
                      <PlusCircle className="h-6 w-6 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600 font-medium">Add New Academic Year</p>
                      <p className="text-xs text-gray-500 mt-1">Plan ahead for future years</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="explore-programs">
          {/* Hero Section */}
          <div className="mb-6 p-6 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg">
            <div className="flex items-start space-x-4">
              <div className="p-3 bg-purple-100 rounded-full">
                <span className="text-3xl">🤔</span>
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-purple-900 mb-2">Thinking About Changing Your Major?</h2>
                <p className="text-purple-700 mb-4 text-lg">
                  <strong>It's totally normal to wonder "what if"!</strong> Maybe you're curious about other careers,
                  thinking about switching majors, or want to add a minor. This tool lets you safely explore
                  without changing anything in your actual records.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm bg-white rounded-lg p-4 border border-purple-200">
                  <div className="flex items-center space-x-2">
                    <span className="text-xl">✅</span>
                    <span className="text-purple-800"><strong>See what you've already done</strong> - classes that would count toward the new major</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xl">📝</span>
                    <span className="text-purple-800"><strong>Find out what's left</strong> - additional classes you'd need to take</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xl">🎯</span>
                    <span className="text-purple-800"><strong>Make an informed decision</strong> - see if it's realistic for you</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Program Explorer */}
          <Card className="w-full mb-6">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span className="text-2xl">🎓</span>
                <span>Try Out a Different Major</span>
              </CardTitle>
              <CardDescription className="text-base">
                <strong>Don't worry - this is just pretend!</strong> Pick any major below and we'll show you exactly what it would take.
                This won't change your actual enrollment or records - think of it like a "what if" calculator for your college career.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Major Selection with Enhanced UI */}
              <div className="space-y-3">
                <Label htmlFor="whatif-major-select" className="text-base font-medium">
                  What major interests you?
                </Label>
                <Select value={selectedWhatIfMajorId || ""} onValueChange={(value) => setSelectedWhatIfMajorId(value === "none" ? null : value)}>
                  <SelectTrigger id="whatif-major-select" className="h-12 text-base">
                    <SelectValue placeholder="🎓 Choose a major to explore..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">
                      <div className="flex items-center space-x-2">
                        <Home className="h-4 w-4" />
                        <span>Back to my current major ({studentInfo?.major})</span>
                      </div>
                    </SelectItem>
                    {mockPrograms.filter(p => p.type === 'Major').map(program => (
                      <SelectItem key={program.id} value={program.id}>
                        <div className="flex flex-col items-start">
                          <span className="font-medium">{program.name}</span>
                          {program.description && (
                            <span className="text-xs text-gray-500 mt-1">{program.description.substring(0, 80)}...</span>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedWhatIfMajorId && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                    <p className="text-sm text-green-800">
                      <Info className="inline h-4 w-4 mr-1" />
                      Great choice! Click "Analyze This Path" below to see your progress toward this major.
                    </p>
                  </div>
                )}
              </div>

              {/* Minor Selection */}
              <div className="space-y-3">
                <Label htmlFor="whatif-minor-select" className="text-base font-medium">
                  Want to add a minor? (Optional)
                </Label>
                <Select
                  value={selectedWhatIfMinorId || ""}
                  onValueChange={(value) => setSelectedWhatIfMinorId(value === "none" ? null : value)}
                  disabled={!selectedWhatIfMajorId}
                >
                  <SelectTrigger id="whatif-minor-select" className="h-12 text-base">
                    <SelectValue placeholder="📚 Choose a minor to add..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No minor</SelectItem>
                    {mockPrograms.filter(p => p.type === 'Minor').map(program => (
                      <SelectItem key={program.id} value={program.id}>
                        <div className="flex flex-col items-start">
                          <span className="font-medium">{program.name}</span>
                          {program.description && (
                            <span className="text-xs text-gray-500 mt-1">{program.description.substring(0, 80)}...</span>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {!selectedWhatIfMajorId && (
                  <p className="text-sm text-gray-500">
                    <AlertCircle className="inline h-4 w-4 mr-1" />
                    Choose a major first to explore minor options
                  </p>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row sm:justify-between space-y-2 sm:space-y-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedWhatIfMajorId(null);
                  setSelectedWhatIfMinorId(null);
                  setWhatIfAuditResults(null);
                  setCurrentWhatIfProgram(null);
                  toast.info("Cleared exploration. Back to your current major.");
                }}
                className="flex items-center space-x-2"
              >
                <RotateCcw className="h-4 w-4" />
                <span>Clear & Start Over</span>
              </Button>
              <Button
                onClick={() => {
                  if (!selectedWhatIfMajorId) {
                    toast.info("Please choose a major to explore first!");
                    return;
                  }
                  const targetMajorProgram = mockPrograms.find(p => p.id === selectedWhatIfMajorId);
                  if (targetMajorProgram) {
                    const currentCompletedCourseCodes = studentInfo?.completedCourses || [];
                    const auditResults = calculateWhatIfAudit(currentCompletedCourseCodes, targetMajorProgram, mockCourses);
                    setWhatIfAuditResults(auditResults);
                    setCurrentWhatIfProgram(targetMajorProgram);
                    toast.success(`Analysis complete! See your progress toward ${targetMajorProgram.name} below.`);
                  } else {
                    toast.error("Oops! Couldn't find that program. Please try again.");
                    setWhatIfAuditResults(null);
                    setCurrentWhatIfProgram(null);
                  }
                }}
                disabled={!selectedWhatIfMajorId}
                variant="default" // Added
                size="sm"         // Changed
                className="flex items-center space-x-2" // Removed explicit bg colors
              >
                <TrendingUp className="h-4 w-4" />
                <span>Analyze This Path</span>
              </Button>
            </CardFooter>
          </Card>

          {currentWhatIfProgram && whatIfAuditResults && (
            <WhatIfDegreeAuditView whatIfProgram={currentWhatIfProgram} whatIfRequirements={whatIfAuditResults} />
          )}
        </TabsContent>

        <TabsContent value="course-catalog">
          <CourseCatalogView
            targetCourseCode={catalogSearchTerm}
            onTargetCourseViewed={() => setCatalogSearchTerm(null)}
            filterPreset={catalogFilterPreset}
            onFilterPresetApplied={() => setCatalogFilterPreset(null)}
          />
        </TabsContent>
      </Tabs>

      <CourseSearchModal
        open={isCourseSearchOpen}
        onOpenChange={setIsCourseSearchOpen}
        termId={selectedSemesterId}
        onCourseSelected={(course) => {
          if (selectedSemesterId) {
            handleAddCourseToPlan(course, selectedSemesterId);
          } else {
            // When browsing courses without a specific semester, add to ScheduleContext
            addCourse(course);
            toast.success(`${course.code} added to your course list! You can assign it to a semester later.`);
          }
        }}
      />

      {viewingSemester && (<ViewScheduleDialog open={isViewScheduleOpen} onOpenChange={setIsViewScheduleOpen} semesterName={viewingSemester.name} courses={viewingSemester.courses} />)}
      <AddSemesterDialog open={isAddSemesterDialogOpen} onOpenChange={setIsAddSemesterDialogOpen} onAddSemester={handleAddSemesterSubmit} />
      <Dialog open={isMandatoryCoursesDialogOpen} onOpenChange={setIsMandatoryCoursesDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <BookOpen className="h-5 w-5 mr-2" />
              Required Courses Overview
            </DialogTitle>
            <DialogDescription>
              Complete view of your required courses with actions to help you plan your path to graduation.
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto py-4 space-y-4">
            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{completedMandatoryCourses}</div>
                <div className="text-xs text-gray-600">Completed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{mockMandatoryCourses.filter(c => c.status === "In Progress").length}</div>
                <div className="text-xs text-gray-600">In Progress</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{remainingMandatoryCourses.length}</div>
                <div className="text-xs text-gray-600">Remaining</div>
              </div>
            </div>

            {/* Courses by Status */}
            <div className="space-y-4">
              {/* Remaining Courses */}
              {remainingMandatoryCourses.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                    <span className="text-lg mr-2">📝</span>
                    Courses You Still Need ({remainingMandatoryCourses.length})
                  </h4>
                  <div className="space-y-2">
                    {remainingMandatoryCourses.map(course => {
                      const canTakeNow = !course.prerequisites || course.prerequisites.length === 0 ||
                        course.prerequisites.every(prereq => studentInfo?.completedCourses?.includes(prereq));

                      return (
                        <div key={course.code} className={`p-3 border rounded-lg ${canTakeNow ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}`}>
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <span className="font-medium">{course.code}</span>
                                <Badge variant="outline" className="text-xs">{course.credits || 'N/A'} cr</Badge>
                                {canTakeNow && <Badge variant="default" className="text-xs bg-green-100 text-green-800">Can take now</Badge>}
                              </div>
                              <p className="text-sm text-gray-700">{course.name}</p>
                              {course.prerequisites && course.prerequisites.length > 0 && (
                                <p className="text-xs text-amber-600 mt-1">
                                  Prerequisites: {course.prerequisites.join(', ')}
                                </p>
                              )}
                            </div>
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setIsMandatoryCoursesDialogOpen(false);
                                  handleNavigateToBrowseAllClasses(course.code);
                                }}
                                className="text-xs"
                              >
                                <Search className="h-3 w-3 mr-1" />
                                Find
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* In Progress Courses */}
              {mockMandatoryCourses.filter(c => c.status === "In Progress").length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                    <span className="text-lg mr-2">🔄</span>
                    Currently Taking ({mockMandatoryCourses.filter(c => c.status === "In Progress").length})
                  </h4>
                  <div className="space-y-2">
                    {mockMandatoryCourses.filter(c => c.status === "In Progress").map(course => (
                      <div key={course.code} className="p-3 border rounded-lg bg-yellow-50 border-yellow-200">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-medium">{course.code}</span>
                          <Badge variant="secondary" className="text-xs">In Progress</Badge>
                        </div>
                        <p className="text-sm text-gray-700">{course.name}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Completed Courses */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                  <span className="text-lg mr-2">✅</span>
                  Completed ({completedMandatoryCourses})
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {mockMandatoryCourses.filter(c => c.status === "Completed").map(course => (
                    <div key={course.code} className="p-2 border rounded bg-green-50 border-green-200">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium">{course.code}</span>
                        <Badge variant="default" className="text-xs bg-green-100 text-green-800">Done</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <DialogFooter className="flex-shrink-0 space-x-2">
            <Button variant="outline" onClick={() => setIsMandatoryCoursesDialogOpen(false)}>
              Close
            </Button>
            <Button onClick={() => {
              setIsMandatoryCoursesDialogOpen(false);
              handleNavigateToBrowseAllClasses();
            }}>
              <Search className="h-4 w-4 mr-2" />
              Browse All Classes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={isProgramCreditsDialogOpen} onOpenChange={setIsProgramCreditsDialogOpen}><DialogContent className="sm:max-w-2xl"><DialogHeader><DialogTitle>Course Options for Degree Requirements</DialogTitle><DialogDescription>Here are some course suggestions for your unmet degree requirements.</DialogDescription></DialogHeader><div className="py-4 space-y-4 max-h-[70vh] overflow-y-auto">{unmetDegreeRequirements.length > 0 ? (unmetDegreeRequirements.map(req => { const suggestedCourses = getSuggestedCourses(req); const creditsToComplete = req.requiredCredits * (1 - req.progress); return (<div key={req.id} className="p-3 border rounded-md bg-background/50"><h4 className="font-semibold text-md mb-1">{req.name}</h4><p className="text-xs text-muted-foreground mb-2">{creditsToComplete} credits remaining.{req.choiceRequired && ` Choose ${req.choiceRequired - (req.progressCourses || 0)} more.`}</p>{suggestedCourses.length > 0 ? (<ul className="space-y-1.5">{suggestedCourses.map(course => (<li key={course.id} className="text-xs p-2 border rounded-md bg-background hover:bg-muted/50"><div className="flex justify-between items-center"><div><span className="font-medium">{course.code}</span> - {course.name}<span className="text-muted-foreground ml-1">({course.credits} cr)</span></div></div>{course.prerequisites && course.prerequisites.length > 0 && (<p className="text-xs text-amber-600 mt-0.5">Prereqs: {course.prerequisites.join(', ')}</p>)}</li>))}</ul>) : (<p className="text-xs text-muted-foreground italic">Specific course suggestions not available based on current matcher, or all suggestions already completed. Check course catalog or academic advisor.</p>)}</div>);})) : (<p className="text-sm text-muted-foreground text-center">All degree requirements appear to be met or in progress. Congratulations!</p>)}</div><DialogFooter><Button variant="outline" onClick={() => setIsProgramCreditsDialogOpen(false)}>Close</Button></DialogFooter></DialogContent></Dialog>
    </div>
  );
};

export default CourseDashboard;
