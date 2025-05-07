
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { mockDegreeRequirements, mockMandatoryCourses } from "@/lib/mock-data";
import { ChevronDown, ChevronUp, Plus, Trash, Calendar, ArrowRight } from "lucide-react";
import CourseSearch from "./CourseSearch";
import ViewScheduleDialog from "./ViewScheduleDialog";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

interface CourseDashboardProps {
  onAddSemester: () => void;
}

const CourseDashboard: React.FC<CourseDashboardProps> = ({ onAddSemester }) => {
  const [showProgramDetails, setShowProgramDetails] = useState(false);
  const [showMandatoryCourses, setShowMandatoryCourses] = useState(false);
  const [isCourseSearchOpen, setIsCourseSearchOpen] = useState(false);
  const [selectedSemester, setSelectedSemester] = useState("");
  const [isViewScheduleOpen, setIsViewScheduleOpen] = useState(false);
  const [viewingSemester, setViewingSemester] = useState<any>(null);
  
  const navigate = useNavigate();

  // Organize courses by academic year and semester
  const years = [
    {
      year: "2024 - 2025",
      credits: 30,
      schedules: 13,
      semesters: [
        {
          id: "Summer2024",
          name: "Summer 2024",
          creditsSelected: 9,
          courses: [
            { id: "cs101", code: "CS101", name: "Introduction to Computer Science", credits: 3, days: "MWF", time: "09:00", hasPrereqs: false },
            { id: "math105", code: "MATH105", name: "Pre-Calculus", credits: 3, days: "MWF", time: "08:00", hasPrereqs: false },
            { id: "eng234", code: "ENG234", name: "Composition II", credits: 3, days: "MW", time: "10:00", hasPrereqs: true }
          ]
        },
        {
          id: "Fall2024",
          name: "Fall 2024",
          creditsSelected: 11,
          courses: [
            { id: "phys210", code: "PHYS210", name: "Physics I: Mechanics", credits: 4, days: "MWF", time: "13:00", hasPrereqs: false },
            { id: "phil101", code: "PHIL101", name: "Introduction to Logic", credits: 3, days: "MWF", time: "11:00", hasPrereqs: false },
            { id: "univ100", code: "UNIV100", name: "University Seminar", credits: 1, days: "W", time: "14:00", hasPrereqs: false }
          ]
        },
        {
          id: "Spring2025",
          name: "Spring 2025",
          creditsSelected: 10,
          courses: [
            { id: "econ101", code: "ECON101", name: "Principles of Microeconomics", credits: 3, days: "MWF", time: "10:00", hasPrereqs: false },
            { id: "bio101", code: "BIO101", name: "Introduction to Biology", credits: 4, days: "MWF", time: "09:00", hasPrereqs: false },
            { id: "chem101", code: "CHEM101", name: "General Chemistry", credits: 4, days: "MWF", time: "13:00", hasPrereqs: false }
          ]
        }
      ]
    },
    {
      year: "2025 - 2026",
      credits: 32,
      schedules: 8,
      semesters: [
        {
          id: "Summer2025",
          name: "Summer 2025",
          creditsSelected: 7,
          courses: [
            { id: "cs101-2", code: "CS101", name: "Introduction to Computer Science", credits: 3, days: "MWF", time: "09:00", hasPrereqs: false },
            { id: "phys210-2", code: "PHYS210", name: "Physics I: Mechanics", credits: 4, days: "MWF", time: "13:00", hasPrereqs: true }
          ]
        },
        {
          id: "Fall2025",
          name: "Fall 2025",
          creditsSelected: 10,
          courses: [
            { id: "math105-2", code: "MATH105", name: "Pre-Calculus", credits: 3, days: "MWF", time: "08:00", hasPrereqs: false },
            { id: "phil101-2", code: "PHIL101", name: "Introduction to Logic", credits: 3, days: "MWF", time: "11:00", hasPrereqs: false },
            { id: "bio101-2", code: "BIO101", name: "Introduction to Biology", credits: 4, days: "MWF", time: "09:00", hasPrereqs: true }
          ]
        },
        {
          id: "Spring2026",
          name: "Spring 2026",
          creditsSelected: 15,
          courses: [
            { id: "eng234-2", code: "ENG234", name: "Composition II", credits: 3, days: "MW", time: "10:00", hasPrereqs: true },
            { id: "univ100-2", code: "UNIV100", name: "University Seminar", credits: 1, days: "W", time: "14:00", hasPrereqs: false },
            { id: "chem101-2", code: "CHEM101", name: "General Chemistry", credits: 4, days: "MWF", time: "13:00", hasPrereqs: false }
          ]
        }
      ]
    }
  ];

  const handleOpenCourseSearch = (semesterId: string) => {
    setSelectedSemester(semesterId);
    setIsCourseSearchOpen(true);
  };
  
  const handleViewSchedule = (semester: any) => {
    setViewingSemester(semester);
    setIsViewScheduleOpen(true);
  };
  
  const handleOpenSchedulePage = (semesterId: string) => {
    // Navigate to the schedule page with the semester ID as a parameter
    navigate(`/schedule?semester=${semesterId}`);
  };

  const handleDeleteCourse = (semesterId: string, courseId: string) => {
    // In a real application, this would update your course data
    console.log(`Deleting course ${courseId} from semester ${semesterId}`);
  };

  const handleViewDetails = (section: string) => {
    if (section === "program") {
      setShowProgramDetails(!showProgramDetails);
    } else if (section === "mandatory") {
      setShowMandatoryCourses(!showMandatoryCourses);
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Program Credits Card */}
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <div className="flex items-baseline space-x-2">
                <CardTitle className="text-3xl font-bold">58</CardTitle>
                <span className="text-gray-500 text-sm">62/120</span>
              </div>
              <Button 
                variant="outline"
                size="sm"
                className="text-blue-500 border-blue-200 hover:text-blue-700 hover:bg-blue-50 hover:border-blue-300 transition-colors"
                onClick={() => handleViewDetails("program")}
              >
                {showProgramDetails ? "Hide details" : "View details"}
              </Button>
            </div>
            <div className="text-gray-700 font-medium mt-1">Program credits left</div>
            <Progress value={62} max={120} className="h-2 mt-2" />
          </CardHeader>
          
          {showProgramDetails && (
            <CardContent>
              <h3 className="font-semibold mb-3">Program Credits Breakdown</h3>
              <div className="space-y-3">
                {mockDegreeRequirements.map(req => (
                  <div key={req.id} className="flex justify-between items-center">
                    <span>{req.name}</span>
                    <span className="text-gray-600">
                      {Math.round(req.requiredCredits * req.progress)}/{req.requiredCredits} credits
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          )}
        </Card>
        
        {/* Mandatory Courses Card */}
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <div className="flex items-baseline space-x-2">
                <CardTitle className="text-3xl font-bold">7</CardTitle>
                <span className="text-gray-500 text-sm">8/15</span>
              </div>
              <Button 
                variant="outline"
                size="sm"
                className="text-blue-500 border-blue-200 hover:text-blue-700 hover:bg-blue-50 hover:border-blue-300 transition-colors"
                onClick={() => handleViewDetails("mandatory")}
              >
                {showMandatoryCourses ? "Hide details" : "View details"}
              </Button>
            </div>
            <div className="text-gray-700 font-medium mt-1">Mandatory courses left</div>
            <Progress value={8} max={15} className="h-2 mt-2" />
          </CardHeader>
          
          {showMandatoryCourses && (
            <CardContent>
              <h3 className="font-semibold mb-3">Mandatory Courses</h3>
              <div className="space-y-2">
                {mockMandatoryCourses.map(course => (
                  <div key={course.code} className="flex justify-between items-center">
                    <div>
                      <span className="font-medium">{course.code}: </span>
                      <span>{course.name}</span>
                    </div>
                    <span className={cn(
                      "text-xs px-2 py-0.5 rounded",
                      course.status === "Completed" ? "bg-green-100 text-green-800" : 
                      course.status === "In Progress" ? "bg-blue-100 text-blue-800" : 
                      "bg-gray-100 text-gray-800"
                    )}>
                      {course.status}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          )}
        </Card>
      </div>
      
      {/* Academic Years and Semesters */}
      <div className="space-y-6">
        {years.map((year) => (
          <div key={year.year} className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">{year.year}</h2>
              <div className="text-sm text-gray-600">
                {year.credits} credits · {year.schedules} Schedules ✓
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {year.semesters.map((semester) => (
                <Card key={semester.id} className="shadow-sm hover:shadow-md transition-shadow animate-fade-in">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-lg font-semibold">
                        {semester.name.replace(/\s\d{4}$/, "")} {/* Remove year suffix */}
                      </CardTitle>
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-8 w-8 p-0 rounded-full"
                          onClick={() => handleOpenCourseSearch(semester.id)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-8 w-8 p-0 rounded-full"
                          onClick={() => handleViewSchedule(semester)}
                        >
                          <Calendar className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600">
                      {semester.creditsSelected}/18 credits selected ✓
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center mb-3">
                        <select className="w-full rounded-md border border-gray-300 p-1 text-sm">
                          <option>Case Western Reserve University</option>
                          <option>Cleveland State University</option>
                        </select>
                      </div>
                      
                      {semester.courses.map(course => (
                        <div key={course.id} className="flex items-start space-x-2 border-b pb-2 last:border-0 group">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <span className="font-medium">{course.code}</span>
                              <span className="text-xs bg-gray-100 px-1 rounded">{course.credits} cr</span>
                            </div>
                            <div className="text-sm">{course.name}</div>
                            <div className="text-xs text-gray-600">
                              {course.days} {course.time}
                            </div>
                            {course.hasPrereqs && (
                              <div className="mt-1">
                                <div className="text-xs px-2 py-1 bg-yellow-50 text-yellow-800 rounded-md border border-yellow-200 flex items-center cursor-pointer hover:bg-yellow-100 transition-colors">
                                  <span className="font-medium mr-1">Prerequisites required</span>
                                  <ChevronDown className="h-3 w-3" />
                                </div>
                              </div>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-600 hover:bg-red-50"
                            onClick={() => handleDeleteCourse(semester.id, course.id)}
                          >
                            <Trash className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                      
                      <div className="pt-2 flex">
                        <Button
                          onClick={() => handleOpenCourseSearch(semester.id)}
                          variant="outline"
                          size="sm"
                          className="flex-1 flex justify-center items-center text-sm h-9"
                        >
                          <Plus className="h-3.5 w-3.5 mr-1" /> Add courses
                        </Button>
                        
                        <Button
                          onClick={() => handleOpenSchedulePage(semester.id)}
                          variant="outline"
                          size="sm"
                          className="ml-2 flex items-center text-sm h-9 text-blue-500 hover:text-blue-700 border-blue-200 hover:border-blue-400"
                        >
                          View Schedule <ArrowRight className="h-3.5 w-3.5 ml-1" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            <div className="flex justify-center">
              <Button 
                variant="outline" 
                onClick={onAddSemester}
                className="w-full max-w-md flex items-center justify-center text-gray-600 hover:text-gray-800 border-dashed"
              >
                <Plus className="h-4 w-4 mr-2" /> Add Semester
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Course Search Dialog */}
      <CourseSearch 
        open={isCourseSearchOpen} 
        onOpenChange={setIsCourseSearchOpen}
        termId={selectedSemester}
      />
      
      {/* View Schedule Dialog */}
      {viewingSemester && (
        <ViewScheduleDialog 
          open={isViewScheduleOpen}
          onOpenChange={setIsViewScheduleOpen}
          semesterName={viewingSemester.name}
          courses={viewingSemester.courses}
        />
      )}
    </div>
  );
};

export default CourseDashboard;
