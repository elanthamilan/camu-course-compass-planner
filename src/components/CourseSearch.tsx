
import React, { useState } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSchedule } from "@/contexts/ScheduleContext";
import { Course } from "@/lib/types";
import { mockCourses } from "@/lib/mock-data";
import { Search, Check, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface CourseSearchProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  termId: string;
}

const CourseSearch: React.FC<CourseSearchProps> = ({ open, onOpenChange, termId }) => {
  const { addCourse } = useSchedule();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTab, setSelectedTab] = useState("required");
  
  // Filter courses based on search term
  const filteredCourses = mockCourses.filter(course => 
    course.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Required courses for the student's degree (example)
  const requiredCourses = [
    {
      id: "cs202",
      code: "CS202",
      name: "Database Systems",
      credits: 3,
      department: "Core",
      prerequisites: ["cs101"],
      sections: []
    },
    {
      id: "math202",
      code: "MATH202",
      name: "Calculus II",
      credits: 4,
      department: "Math",
      prerequisites: ["math101"],
      sections: []
    },
    {
      id: "eng205",
      code: "ENG205",
      name: "Technical Writing",
      credits: 3,
      department: "General",
      prerequisites: ["eng101"],
      sections: []
    }
  ];

  const handleAddCourse = (course: Course) => {
    addCourse(course);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl animate-scale-in">
        <DialogHeader>
          <DialogTitle className="text-xl">Search for courses to add in {termId.replace(/([A-Z])/g, ' $1').trim()}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <Input
                placeholder="Search with Course ID, Name, Instructor"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 focus-ring"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Days</label>
              <select className="w-full rounded-md border border-gray-300 p-2">
                <option>Mon - Sun, Any Day</option>
                <option>Mon/Wed/Fri</option>
                <option>Tue/Thu</option>
                <option>Weekends Only</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Colleges</label>
              <select className="w-full rounded-md border border-gray-300 p-2">
                <option>All</option>
                <option>College of Engineering</option>
                <option>College of Liberal Arts</option>
                <option>Business School</option>
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Campuses</label>
              <select className="w-full rounded-md border border-gray-300 p-2">
                <option>All</option>
                <option>Main Campus</option>
                <option>North Campus</option>
                <option>Downtown Campus</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Locations</label>
              <select className="w-full rounded-md border border-gray-300 p-2">
                <option>All</option>
                <option>Science Building</option>
                <option>Liberal Arts Building</option>
                <option>Business Building</option>
              </select>
            </div>
          </div>

          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList className="w-full">
              <TabsTrigger value="required" className="flex-1 relative">
                <span className="flex items-center">
                  <Check size={16} className="mr-2" />
                  Remaining Requirements (3)
                </span>
              </TabsTrigger>
              <TabsTrigger value="all" className="flex-1">All Courses</TabsTrigger>
            </TabsList>
            
            <TabsContent value="required" className="mt-4">
              <div className="p-4 bg-green-50 rounded-md mb-4 border border-green-200">
                <h3 className="text-green-800 font-medium text-sm">Recommended courses to fulfill your degree requirements</h3>
                <p className="text-green-700 text-xs mt-1">These courses help you complete your degree requirements faster</p>
              </div>
              
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {requiredCourses.map(course => (
                  <div 
                    key={course.id} 
                    className="border rounded-md p-3 flex justify-between items-center bg-white hover:bg-gray-50 transition-colors animate-fade-in"
                  >
                    <div>
                      <div className="flex items-center mb-1">
                        <span className={cn(
                          "rounded px-2 py-0.5 text-xs font-medium mr-2",
                          course.department === "Core" ? "bg-purple-100 text-purple-800" :
                          course.department === "Math" ? "bg-red-100 text-red-800" :
                          "bg-blue-100 text-blue-800"
                        )}>
                          {course.department}
                        </span>
                        <span className="text-sm font-medium">{course.code}</span>
                        <span className="ml-1 text-xs bg-gray-100 px-1 rounded text-gray-700">{course.credits}cr</span>
                      </div>
                      <h3 className="font-medium">{course.name}</h3>
                      {course.prerequisites && (
                        <div className="text-xs text-amber-600 flex items-center mt-1">
                          <span className="inline-block w-3 h-3 rounded-full bg-amber-400 mr-1"></span>
                          Has prerequisites
                        </div>
                      )}
                    </div>
                    
                    <div className="flex space-x-2">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="outline" size="sm" className="h-8 w-8 rounded-full p-0">
                            <Info size={16} />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>View course details</TooltipContent>
                      </Tooltip>
                      
                      <Button 
                        className="bg-blue-500 hover:bg-blue-600"
                        size="sm"
                        onClick={() => handleAddCourse(course as unknown as Course)}
                      >
                        Add
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="all" className="mt-4">
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {filteredCourses.map(course => (
                  <div 
                    key={course.id} 
                    className="border rounded-md p-3 flex justify-between items-center bg-white hover:bg-gray-50 transition-colors animate-fade-in"
                  >
                    <div>
                      <div className="flex items-center mb-1">
                        <span className="text-sm font-medium">{course.code}</span>
                        <span className="ml-1 text-xs bg-gray-100 px-1 rounded text-gray-700">{course.credits}cr</span>
                      </div>
                      <h3 className="font-medium">{course.name}</h3>
                      {course.prerequisites && (
                        <div className="text-xs text-amber-600 flex items-center mt-1">
                          <span className="inline-block w-3 h-3 rounded-full bg-amber-400 mr-1"></span>
                          Has prerequisites
                        </div>
                      )}
                    </div>
                    
                    <div className="flex space-x-2">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="outline" size="sm" className="h-8 w-8 rounded-full p-0">
                            <Info size={16} />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>View course details</TooltipContent>
                      </Tooltip>
                      
                      <Button 
                        className="bg-blue-500 hover:bg-blue-600"
                        size="sm"
                        onClick={() => handleAddCourse(course)}
                      >
                        Add
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
        
        <DialogFooter className="sm:justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CourseSearch;
