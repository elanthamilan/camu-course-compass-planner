import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"; // Added Dialog components
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"; // Added Tooltip
import { toast } from "sonner"; // For notifications
import { mockDegreeRequirements, mockMandatoryCourses } from "@/lib/mock-data"; // Assuming these are still relevant
import { PlusCircle, Trash2, ArrowRight, ChevronDown, Eye } from "lucide-react"; // Lucide icons

import CourseSearch from "./CourseSearch"; // Already Shadcn
import ViewScheduleDialog from "./ViewScheduleDialog"; // Needs check, might be Bootstrap
import AddSemesterDialog from "./AddSemesterDialog"; // Already Shadcn
import { Course } from "../lib/types"; // Import global Course type

// Define types (assuming these are correct from previous steps)
// interface CourseData { // Will be replaced by global Course type
//   id: string;
//   code: string;
//   name: string;
//   credits: number;
//   days: string;
//   time: string;
//   prerequisites?: string[];
// }

interface SemesterData {
  id: string;
  name: string;
  creditsSelected: number;
  courses: Course[]; // Use global Course type
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

// Prop onAddSemester is not used in the provided React Bootstrap version, so it's removed for now.
// If it's needed, it should be passed from Index.tsx and handled appropriately.
const CourseDashboard: React.FC = () => {
  const [isCourseSearchOpen, setIsCourseSearchOpen] = useState(false);
  const [selectedSemesterId, setSelectedSemesterId] = useState(""); // Changed to selectedSemesterId for clarity
  const [isViewScheduleOpen, setIsViewScheduleOpen] = useState(false);
  const [viewingSemester] = useState<SemesterData | null>(null);
  const [yearsData, setYearsData] = useState<YearData[]>(initialYearsData);
  const [isAddSemesterDialogOpen, setIsAddSemesterDialogOpen] = useState(false);
  const [isMandatoryCoursesDialogOpen, setIsMandatoryCoursesDialogOpen] = useState(false); // State for new dialog
  const [isProgramCreditsDialogOpen, setIsProgramCreditsDialogOpen] = useState(false); // State for Program Credits Dialog
  
  const navigate = useNavigate();

  const handleOpenCourseSearch = (semesterId: string) => {
    setSelectedSemesterId(semesterId);
    setIsCourseSearchOpen(true);
  };
  
  const handleOpenSchedulePage = (semesterId: string) => {
    // Assuming semesterId is in the format "Summer2024", "Fall2024" etc.
    // The SchedulePage might expect a termId that matches this format.
    navigate(`/schedule?termId=${semesterId}`);
  };

  const handleDeleteCourse = (semesterId: string, courseId: string) => {
    setYearsData(prevYearsData => prevYearsData.map(year => ({
      ...year,
      semesters: year.semesters.map(semester => {
        if (semester.id === semesterId) {
          const updatedCourses = semester.courses.filter(course => course.id !== courseId);
          return {
            ...semester,
            courses: updatedCourses,
            creditsSelected: updatedCourses.reduce((acc, curr) => acc + curr.credits, 0)
          };
        }
        return semester;
      })
    })));
  };

  const handleRemoveSemester = (semesterIdToRemove: string) => {
    setYearsData(prevYearsData => {
      // First, check if the semester is empty
      let semesterIsEmpty = false;
      for (const year of prevYearsData) {
        const semesterToRemove = year.semesters.find(s => s.id === semesterIdToRemove);
        if (semesterToRemove) {
          if (semesterToRemove.courses.length === 0) {
            semesterIsEmpty = true;
          }
          break;
        }
      }

      if (!semesterIsEmpty) {
        toast.error("Cannot remove semester with courses. Please remove all courses first.");
        return prevYearsData; // Return original data if semester is not empty
      }

      // If empty, proceed with removal
      const updatedYearsData = prevYearsData.map(year => ({
        ...year,
        semesters: year.semesters.filter(semester => semester.id !== semesterIdToRemove)
      })).filter(year => year.semesters.length > 0); // Optionally remove year if it becomes empty

      toast.success("Semester removed successfully.");
      return updatedYearsData;
    });
  };

  const handleOpenAddSemesterDialog = () => {
    setIsAddSemesterDialogOpen(true);
  };

  const handleAddSemesterSubmit = (data: { year: string; semesterType: string }) => {
    const { year: dialogYearStr, semesterType } = data;
    const academicYearStr = `${dialogYearStr} - ${parseInt(dialogYearStr) + 1}`;
    // Ensure semesterId is unique and consistent, e.g., "Summer2024"
    const semesterId = `${semesterType.replace(/\s+/g, '')}${dialogYearStr}`; 
    const semesterName = `${semesterType} ${dialogYearStr}`;


    const newSemester: SemesterData = {
      id: semesterId, name: semesterName, creditsSelected: 0, courses: [],
    };

    setYearsData(prevYearsData => {
      const updatedYearsData = [...prevYearsData];
      let yearIndex = updatedYearsData.findIndex(y => y.year === academicYearStr);

      if (yearIndex > -1) {
        const yearToUpdate = updatedYearsData[yearIndex];
        // Check if semester already exists by ID (more reliable than name prefix)
        const semesterExists = yearToUpdate.semesters.some(s => s.id === semesterId);
        if (!semesterExists) {
          yearToUpdate.semesters.push(newSemester);
          // Sort semesters: Spring, Summer, Fall
          const semesterOrder = ["Spring", "Summer", "Fall"];
          yearToUpdate.semesters.sort((a, b) => {
            const typeA = a.name.split(" ")[0];
            const typeB = b.name.split(" ")[0];
            return semesterOrder.indexOf(typeA) - semesterOrder.indexOf(typeB);
          });
        } else {
          console.warn(`Semester ${semesterId} already exists for year ${academicYearStr}`);
        }
      } else {
        // If year doesn't exist, create it
        updatedYearsData.push({
          year: academicYearStr, credits: 0, schedules: 0, semesters: [newSemester],
        });
        // Sort years after adding a new one
        updatedYearsData.sort((a,b) => a.year.localeCompare(b.year));
      }
      return updatedYearsData;
    });
    setIsAddSemesterDialogOpen(false);
  };

  const handleAddCourseToPlan = (courseToAdd: import("../lib/types").Course, semesterId: string) => {
    setYearsData(prevYearsData => 
      prevYearsData.map(year => ({
        ...year,
        semesters: year.semesters.map(semester => {
          if (semester.id === semesterId) {
            // Check if course already exists in this semester
            if (semester.courses.some(c => c.id === courseToAdd.id)) {
              // Potentially show a toast message here: course already in semester
              console.warn(`Course ${courseToAdd.code} already exists in ${semester.name}`);
              return semester; 
            }
            // Directly use courseToAdd as it's already of type Course (or compatible)
            const updatedCourses = [...semester.courses, courseToAdd];
            return {
              ...semester,
              courses: updatedCourses,
              creditsSelected: updatedCourses.reduce((acc, curr) => acc + curr.credits, 0),
            };
          }
          return semester;
        })
        // The year.credits field in YearData seems static in the initial data.
        // The UI correctly sums semester.creditsSelected for the year total.
        // So, no need to recalculate year.credits here, it might be a target or not used directly.
      }))
    );
    // Potentially show a success toast here
    console.log(`Added ${courseToAdd.code} to semester ${semesterId}`);
  };

  const getStatusBadgeVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    if (status === "Completed") return "default"; // Use default for success (often green or primary)
    if (status === "In Progress") return "secondary"; // Use secondary for in-progress
    return "outline"; // Use outline for not started or other states
  };
  
  // Calculate total credits left for the program.
  // Assuming studentInfo would come from a context or prop in a real app.
  const studentTotalCredits = 62; // Mock data for now
  const programRequiredCredits = 120; // Mock data for now
  const creditsLeft = programRequiredCredits - studentTotalCredits;
  const programProgressValue = (studentTotalCredits / programRequiredCredits) * 100;

  // Calculate mandatory courses left.
  const completedMandatoryCourses = mockMandatoryCourses.filter(c => c.status === "Completed").length;
  const totalMandatoryCourses = mockMandatoryCourses.length;
  const mandatoryCoursesLeft = totalMandatoryCourses - completedMandatoryCourses;
  const mandatoryProgressValue = (completedMandatoryCourses / totalMandatoryCourses) * 100;

  const remainingMandatoryCourses = mockMandatoryCourses.filter(c => c.status !== "Completed");
  const unmetDegreeRequirements = mockDegreeRequirements.filter(req => req.progress < 1);

  // This would ideally come from context or student data
  const studentCompletedCourses = ["CS101", "MATH105", "ENG234"]; 


  // Helper function to find suggested courses for a requirement
  const getSuggestedCourses = (requirement: import("../lib/types").DegreeRequirement) => {
    if (!requirement.courseMatcher) return [];
    
    const { type, values } = requirement.courseMatcher;
    let suggested = [];

    switch (type) {
      case "department":
        suggested = mockCourses.filter(course => values.includes(course.department));
        break;
      case "courseCodePrefix":
        suggested = mockCourses.filter(course => values.some(prefix => course.code.startsWith(prefix)));
        break;
      case "keyword":
        suggested = mockCourses.filter(course => 
          course.keywords && values.some(keyword => course.keywords!.includes(keyword))
        );
        break;
      case "specificCourses":
        suggested = mockCourses.filter(course => values.includes(course.code));
        break;
      default:
        return [];
    }
    // Filter out already completed courses and take a sample
    return suggested.filter(course => !studentCompletedCourses.includes(course.code)).slice(0, 3);
  };


  return (
    <div className="py-3 space-y-6"> {/* Replaced Container fluid and added space-y */}
      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-4xl font-bold">{creditsLeft}</CardTitle>
              <CardDescription>{studentTotalCredits}/{programRequiredCredits} program credits left</CardDescription>
            </div>
            {/* Using Accordion for details to match Shadcn patterns */}
            <Accordion type="single" collapsible className="w-auto">
              <AccordionItem value="item-1" className="border-none">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <AccordionTrigger className="p-2 hover:no-underline [&[data-state=open]>svg]:rotate-180">
                      <Button variant="outline" size="sm">
                        View details <ChevronDown className="h-4 w-4 ml-1 transition-transform duration-200" />
                      </Button>
                    </AccordionTrigger>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Show/hide a detailed breakdown of your program credit requirements.</p>
                  </TooltipContent>
                </Tooltip>
                <AccordionContent className="pt-2 text-sm">
                  <h4 className="mb-2 font-semibold text-sm">Program Credits Breakdown</h4>
                  <ul className="space-y-1 text-xs">
                    {mockDegreeRequirements.map(req => (
                      <li key={req.id} className="flex justify-between">
                        <span>{req.name}</span>
                        <span className="text-muted-foreground">
                          {Math.round(req.requiredCredits * req.progress)}/{req.requiredCredits} credits
                        </span>
                      </li>
                    ))}
                  </ul>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="link" 
                        size="sm" 
                        onClick={() => setIsProgramCreditsDialogOpen(true)}
                        className="mt-2 text-xs px-0 h-auto" // Adjusted padding and height for link button
                      >
                        View Course Options for Requirements
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>See course suggestions for fulfilling unmet degree requirements.</p>
                    </TooltipContent>
                  </Tooltip>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardHeader>
          <CardContent className="pt-0"> {/* pt-0 because progress bar acts as separator */}
            <Progress value={programProgressValue} className="h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-4xl font-bold">{mandatoryCoursesLeft}</CardTitle>
              <CardDescription>{completedMandatoryCourses}/{totalMandatoryCourses} mandatory courses left</CardDescription>
            </div>
             <Accordion type="single" collapsible className="w-auto">
              <AccordionItem value="item-1" className="border-none">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <AccordionTrigger className="p-2 hover:no-underline [&[data-state=open]>svg]:rotate-180">
                      <Button variant="outline" size="sm">
                        View details <ChevronDown className="h-4 w-4 ml-1 transition-transform duration-200" />
                      </Button>
                    </AccordionTrigger>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Show/hide the list of mandatory courses and their current status.</p>
                  </TooltipContent>
                </Tooltip>
                <AccordionContent className="pt-2 text-sm">
                  <h4 className="mb-2 font-semibold text-sm">Mandatory Courses</h4>
                  <ul className="space-y-1 text-xs">
                    {mockMandatoryCourses.map(course => (
                      <li key={course.code} className="flex justify-between items-center">
                        <div>
                          <span className="font-medium">{course.code}: </span>
                          <span>{course.name}</span>
                        </div>
                        <Badge variant={getStatusBadgeVariant(course.status)}>
                          {course.status}
                        </Badge>
                      </li>
                    ))}
                  </ul>
                   <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="link" 
                        size="sm" 
                        onClick={() => setIsMandatoryCoursesDialogOpen(true)}
                        className="mt-2 text-xs px-0 h-auto" // Adjusted padding and height for link button
                      >
                        View Remaining Mandatory Courses
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>See a filtered list of mandatory courses you still need to complete.</p>
                    </TooltipContent>
                  </Tooltip>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>
      </div>

      {/* Academic Years and Semesters Section */}
      <div className="space-y-6">
        {yearsData.map((year) => (
          <div key={year.year}>
            <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-3">
              <h3 className="text-xl font-semibold">{year.year}</h3>
              <p className="text-sm text-muted-foreground">
                {year.semesters.reduce((acc, sem) => acc + sem.creditsSelected, 0)} credits · {year.schedules} Schedules
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {year.semesters.map((semester) => (
                <Card key={semester.id} className="flex flex-col">
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-lg">{semester.name.replace(/\s\d{4}$/, "")}</CardTitle>
                      <div className="flex space-x-1">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              variant="ghost" size="icon" className="h-7 w-7"
                              onClick={() => handleOpenCourseSearch(semester.id)}
                              aria-label="Add course to semester"
                            >
                              <PlusCircle size={18} />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent><p>Add a course to this semester.</p></TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              variant="ghost" size="icon" className="h-7 w-7"
                              onClick={() => handleOpenSchedulePage(semester.id)}
                              aria-label="View schedule for semester"
                            >
                              <Eye size={18} /> 
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent><p>View or generate schedules for this semester.</p></TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-destructive hover:text-destructive/80"
                              onClick={() => handleRemoveSemester(semester.id)}
                              disabled={semester.courses.length > 0} // Disable if semester has courses
                              aria-label="Remove semester"
                            >
                              <Trash2 size={16} />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent><p>Remove this semester (only if empty).</p></TooltipContent>
                        </Tooltip>
                      </div>
                    </div>
                    <CardDescription>
                      {semester.creditsSelected}/18 credits selected
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="flex-grow">
                    {/* University Select - Placeholder, can be made functional if needed */}
                    <Select defaultValue="case-western">
                      <SelectTrigger className="mb-3 text-xs h-8">
                        <SelectValue placeholder="Select University" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="case-western">Case Western Reserve University</SelectItem>
                        <SelectItem value="cleveland-state">Cleveland State University</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    {semester.courses.length > 0 ? (
                      <ul className="space-y-3">
                        {semester.courses.map(course => (
                          <li key={course.id} className="text-xs border-b pb-2 last:border-0 last:pb-0">
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="flex items-center mb-0.5">
                                  <span className="font-semibold mr-1.5">{course.code}</span>
                                  <Badge variant="secondary" className="mr-1.5">{course.credits} cr</Badge>
                                </div>
                                <p className="text-muted-foreground leading-tight">{course.name}</p>
                                {/* course.days and course.time are not part of the global Course type. 
                                    This will be handled by optional chaining or type adjustment if these fields are truly needed.
                                    For now, let's assume they might not be displayed or are TBD for planned courses.
                                */}
                                {/* <p className="text-muted-foreground text-[11px] leading-tight">{course.days} {course.time}</p> */}
                                {course.prerequisites && course.prerequisites.length > 0 && (
                                  <p className="mt-1 text-amber-600 text-[11px] leading-tight">
                                    Prereqs: {course.prerequisites.join(', ')}
                                  </p>
                                )}
                              </div>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost" size="icon" className="h-6 w-6 text-destructive hover:text-destructive/80"
                                    onClick={() => handleDeleteCourse(semester.id, course.id)}
                                    aria-label="Delete course"
                                  >
                                    <Trash2 size={14} />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent><p>Remove this course from the semester.</p></TooltipContent>
                              </Tooltip>
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs text-muted-foreground text-center mt-4">No courses added yet.</p>
                    )}
                  </CardContent>
                  <CardFooter className="flex gap-2 pt-4"> {/* Added pt-4 for spacing */}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          onClick={() => handleOpenCourseSearch(semester.id)}
                          variant="outline"
                          size="sm"
                          className="w-full"
                        >
                          <PlusCircle size={14} className="mr-1.5" /> Add courses
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent><p>Search and add courses to this semester.</p></TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          onClick={() => handleOpenSchedulePage(semester.id)}
                          variant="default" // Changed to default for primary action
                          size="sm"
                          className="w-full"
                        >
                          View Schedule <ArrowRight size={14} className="ml-1.5" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent><p>Open the detailed scheduling tool for this semester.</p></TooltipContent>
                    </Tooltip>
                  </CardFooter>
                </Card>
              ))}
            </div>
            
            <div className="flex justify-center mt-4">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="outline" 
                    onClick={handleOpenAddSemesterDialog}
                    className="w-full max-w-md border-dashed hover:border-solid"
                  >
                    <PlusCircle size={16} className="mr-2" /> Add Semester
                  </Button>
                </TooltipTrigger>
                <TooltipContent><p>Add a new academic semester to your plan.</p></TooltipContent>
              </Tooltip>
            </div>
          </div>
        ))}
      </div>

      {/* Dialogs */}
      <CourseSearch 
        open={isCourseSearchOpen} 
        onOpenChange={setIsCourseSearchOpen}
        termId={selectedSemesterId} // Pass the selected semester ID
        onCourseSelected={handleAddCourseToPlan} // Updated prop name
      />
      
      {/* ViewScheduleDialog might need refactoring if it's Bootstrap-based. */}
      {/* For now, assuming its props are compatible. */}
      {viewingSemester && (
        <ViewScheduleDialog 
          open={isViewScheduleOpen} 
          onOpenChange={setIsViewScheduleOpen}
          semesterName={viewingSemester.name}
          courses={viewingSemester.courses} // This prop might need adjustment based on ViewScheduleDialog's needs
        />
      )}

      <AddSemesterDialog
        open={isAddSemesterDialogOpen} 
        onOpenChange={setIsAddSemesterDialogOpen}
        onAddSemester={handleAddSemesterSubmit}
      />

      {/* Mandatory Courses Dialog */}
      <Dialog open={isMandatoryCoursesDialogOpen} onOpenChange={setIsMandatoryCoursesDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Remaining Mandatory Courses</DialogTitle>
            <DialogDescription>
              These are the mandatory courses you still need to complete for your degree.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-3 max-h-[60vh] overflow-y-auto">
            {remainingMandatoryCourses.length > 0 ? (
              remainingMandatoryCourses.map(course => (
                <div key={course.code} className="border-b pb-2 last:border-0 last:pb-0">
                  <h4 className="font-semibold">{course.code} - {course.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    Credits: {course.credits !== undefined ? course.credits : "N/A"}
                  </p>
                  {course.prerequisites && course.prerequisites.length > 0 && (
                    <p className="text-sm text-muted-foreground">
                      Prerequisites: {course.prerequisites.join(', ')}
                    </p>
                  )}
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">All mandatory courses have been completed or are in progress.</p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsMandatoryCoursesDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Program Credits/Requirements Dialog */}
      <Dialog open={isProgramCreditsDialogOpen} onOpenChange={setIsProgramCreditsDialogOpen}>
        <DialogContent className="sm:max-w-2xl"> {/* Wider dialog */}
          <DialogHeader>
            <DialogTitle>Course Options for Degree Requirements</DialogTitle>
            <DialogDescription>
              Here are some course suggestions for your unmet degree requirements.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4 max-h-[70vh] overflow-y-auto">
            {unmetDegreeRequirements.length > 0 ? (
              unmetDegreeRequirements.map(req => {
                const suggestedCourses = getSuggestedCourses(req);
                const creditsToComplete = req.requiredCredits * (1 - req.progress);
                return (
                  <div key={req.id} className="p-3 border rounded-md bg-background/50">
                    <h4 className="font-semibold text-md mb-1">{req.name}</h4>
                    <p className="text-xs text-muted-foreground mb-2">
                      {creditsToComplete} credits remaining.
                      {req.choiceRequired && ` Choose ${req.choiceRequired - (req.progressCourses || 0)} more.`}
                    </p>
                    {suggestedCourses.length > 0 ? (
                      <ul className="space-y-1.5">
                        {suggestedCourses.map(course => (
                          <li key={course.id} className="text-xs p-2 border rounded-md bg-background hover:bg-muted/50">
                            <div className="flex justify-between items-center">
                              <div>
                                <span className="font-medium">{course.code}</span> - {course.name}
                                <span className="text-muted-foreground ml-1">({course.credits} cr)</span>
                              </div>
                              {/* Placeholder for an "Add to Plan" button for each suggested course */}
                              {/* <Button size="xs" variant="outline" className="px-1.5 py-0.5 h-auto">Add</Button> */}
                            </div>
                            {course.prerequisites && course.prerequisites.length > 0 && (
                              <p className="text-xs text-amber-600 mt-0.5">Prereqs: {course.prerequisites.join(', ')}</p>
                            )}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs text-muted-foreground italic">
                        Specific course suggestions not available based on current matcher, or all suggestions already completed. Check course catalog or academic advisor.
                      </p>
                    )}
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-muted-foreground text-center">All degree requirements appear to be met or in progress. Congratulations!</p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsProgramCreditsDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CourseDashboard;
