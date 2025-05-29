import React, { useState, useEffect, useMemo } from "react";
import { Drawer, DrawerContent, DrawerFooter, DrawerHeader, DrawerTitle, DrawerDescription } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSchedule } from "@/contexts/ScheduleContext";
import { Course, DegreeRequirement } from "@/lib/types";
import { mockCourses } from "@/lib/mock-data";
import { Search, Check, Info, PlusCircle, LogOut, Filter, Network } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Checkbox } from "@/components/ui/checkbox";
import PrerequisiteGraph from './PrerequisiteGraph';
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle as DialogTitleShad, DialogDescription as DialogDescriptionShad, DialogFooter as DialogFooterShad } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

interface CourseSearchProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  termId?: string; 
  onCourseSelected: (course: Course, termId?: string) => void;
  initialFilterCriteria?: { 
    type: 'matcher', 
    matcher: DegreeRequirement['courseMatcher'] 
  } | { 
    type: 'choice', 
    courses: string[] 
  } | null;
  contextualDrawerTitle?: string | null;
}

const CourseSearch: React.FC<CourseSearchProps> = ({ 
  open, 
  onOpenChange, 
  termId, 
  onCourseSelected,
  initialFilterCriteria,
  contextualDrawerTitle 
}) => {
  const { studentInfo } = useSchedule(); 
  const completedCourseCodes = studentInfo?.completedCourses || [];

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTab, setSelectedTab] = useState("all"); 
  const [selectedAttributes, setSelectedAttributes] = useState<string[]>([]);
  const [filterPrerequisitesCleared, setFilterPrerequisitesCleared] = useState<boolean>(false);
  
  const [baseCourseList, setBaseCourseList] = useState<Course[]>(mockCourses);
  const [initialFiltersApplied, setInitialFiltersApplied] = useState(false);

  const [selectedCourseForPrereqView, setSelectedCourseForPrereqView] = useState<string | null>(null);
  const [isPrereqModalOpen, setIsPrereqModalOpen] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [selectedCourseForInfo, setSelectedCourseForInfo] = useState<Course | null>(null);

  const allAttributes = Array.from(new Set(mockCourses.flatMap(course => course.attributes || []))).sort();

  const handleAttributeChange = (attribute: string) => {
    setSelectedAttributes(prev =>
      prev.includes(attribute)
        ? prev.filter(attr => attr !== attribute)
        : [...prev, attribute]
    );
  };

  useEffect(() => {
    if (!open) {
      setInitialFiltersApplied(false); 
    }
  }, [open]);

  useEffect(() => {
    setInitialFiltersApplied(false); 
  }, [initialFilterCriteria]);

  useEffect(() => {
    if (open && initialFilterCriteria && !initialFiltersApplied) {
      let preFiltered = mockCourses;
      if (initialFilterCriteria.type === 'matcher' && initialFilterCriteria.matcher) {
        const { type, values } = initialFilterCriteria.matcher;
        preFiltered = mockCourses.filter(course => {
          if (type === "department") return values.includes(course.department || "");
          if (type === "specificCourses") return values.includes(course.code);
          if (type === "courseCodePrefix") return values.some(prefix => course.code.startsWith(prefix));
          if (type === "keyword") return course.keywords && values.some(kw => course.keywords!.includes(kw));
          return true; 
        });
      } else if (initialFilterCriteria.type === 'choice') {
        preFiltered = mockCourses.filter(course => initialFilterCriteria.courses.includes(course.code));
      }
      setBaseCourseList(preFiltered);
      setInitialFiltersApplied(true);
      setSelectedTab("all"); 
    } else if (!initialFilterCriteria && open) { 
      if (baseCourseList !== mockCourses) { 
          setBaseCourseList(mockCourses);
      }
    }
  }, [open, initialFilterCriteria, initialFiltersApplied, baseCourseList]);


  const derivedFilteredCourses = useMemo(() => {
    let coursesToFilter = baseCourseList;

    if (filterPrerequisitesCleared) {
      coursesToFilter = coursesToFilter.filter(course => 
        (course.prerequisites ?? []).length === 0 ||
        (course.prerequisites ?? []).every(prereqCode => completedCourseCodes.includes(prereqCode))
      );
    }
  
    if (searchTerm) {
      coursesToFilter = coursesToFilter.filter(course =>
        course.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
  
    if (selectedAttributes.length > 0) {
      coursesToFilter = coursesToFilter.filter(course =>
        selectedAttributes.every(attr => course.attributes?.includes(attr))
      );
    }
    
    return coursesToFilter.map(course => ({ ...course, description: course.description || "No description available." }));
  }, [baseCourseList, searchTerm, selectedAttributes, filterPrerequisitesCleared, completedCourseCodes]);

  const requiredCourses = [ 
    { id: "cs202", code: "CS202", name: "Database Systems", credits: 3, department: "Core", prerequisites: ["cs101"], sections: [], description: "Learn about database design, SQL, and data management." },
    { id: "math202", code: "MATH202", name: "Calculus II", credits: 4, department: "Math", prerequisites: ["math101"], sections: [], description: "Continue your journey in calculus, exploring new concepts." },
    { id: "eng205", code: "ENG205", name: "Technical Writing", credits: 3, department: "General", prerequisites: ["eng101"], sections: [], description: "Develop skills in writing clear and effective technical documents." }
  ];

  const handleAddCourseToPlanInternal = (course: Course) => {
    onCourseSelected(course, termId); 
  };

  const handleOpenPrereqView = (courseId: string) => {
    setSelectedCourseForPrereqView(courseId);
    setIsPrereqModalOpen(true);
  };

  const handleOpenInfoModal = (course: Course) => {
    setSelectedCourseForInfo(course);
    setIsInfoModalOpen(true);
  };

  return (
    <>
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="h-[90vh] sm:max-w-xl animate-slide-in-right flex flex-col">
        <DrawerHeader>
          <DrawerTitle className="text-xl">
            {contextualDrawerTitle ||
              (termId 
                ? `Search for courses to add in ${termId.replace(/([A-Z])/g, ' $1').trim()}`
                : "Search Courses for Planning")}
          </DrawerTitle>
          <DrawerDescription> 
            {contextualDrawerTitle 
              ? `Showing courses related to: ${contextualDrawerTitle.replace("Find Courses for ", "")}`
              : termId
                ? `Find and select courses for ${termId.replace(/([A-Z])/g, ' $1').trim()}. You can view required or all available courses.`
                : "Browse and select courses to add to your overall planning list."}
          </DrawerDescription>
        </DrawerHeader>
        <div className="flex-grow overflow-y-auto space-y-4 p-4"> 
          <div className="flex space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <Tooltip>
                <TooltipTrigger asChild>
                  <Input placeholder="Search with Course ID, Name, Instructor" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 focus-ring" />
                </TooltipTrigger>
                <TooltipContent><p>Enter a course code (e.g., CS101), full name (e.g., Introduction to Programming), or instructor name to find courses.</p></TooltipContent>
              </Tooltip>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t"> {/* Added border-t and consistent mt-4 */}
            <h4 className="text-sm font-semibold text-muted-foreground mb-3">General Course Filters</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="days-select" className="text-sm font-medium">Days</Label>
                <Select defaultValue="any">
                  <Tooltip><TooltipTrigger asChild><SelectTrigger id="days-select" className="w-full mt-1"><SelectValue placeholder="Select days" /></SelectTrigger></TooltipTrigger><TooltipContent><p>Filter courses by preferred Days.</p></TooltipContent></Tooltip>
                  <SelectContent>
                    <SelectItem value="any">Mon - Sun, Any Day</SelectItem><SelectItem value="mwf">Mon/Wed/Fri</SelectItem><SelectItem value="tth">Tue/Thu</SelectItem><SelectItem value="wknd">Weekends Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="colleges-select" className="text-sm font-medium">Colleges</Label>
                <Select defaultValue="all">
                  <Tooltip><TooltipTrigger asChild><SelectTrigger id="colleges-select" className="w-full mt-1"><SelectValue placeholder="Select college" /></SelectTrigger></TooltipTrigger><TooltipContent><p>Filter courses by preferred College.</p></TooltipContent></Tooltip>
                  <SelectContent>
                    <SelectItem value="all">All Colleges</SelectItem><SelectItem value="eng">College of Engineering</SelectItem><SelectItem value="la">College of Liberal Arts</SelectItem><SelectItem value="biz">Business School</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            {/* This div for Days and Colleges closes here */}
            </div>
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4"> {/* New div for Campuses and Locations, with mt-4 for spacing */}
              <div>
                <Label htmlFor="campuses-select" className="text-sm font-medium">Campuses</Label>
                <Select defaultValue="all">
                  <Tooltip><TooltipTrigger asChild><SelectTrigger id="campuses-select" className="w-full mt-1"><SelectValue placeholder="Select campus" /></SelectTrigger></TooltipTrigger><TooltipContent><p>Filter courses by preferred Campus.</p></TooltipContent></Tooltip>
                  <SelectContent>
                    <SelectItem value="all">All Campuses</SelectItem><SelectItem value="main">Main Campus</SelectItem><SelectItem value="north">North Campus</SelectItem><SelectItem value="downtown">Downtown Campus</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="locations-select" className="text-sm font-medium">Locations</Label>
                <Select defaultValue="all">
                  <Tooltip><TooltipTrigger asChild><SelectTrigger id="locations-select" className="w-full mt-1"><SelectValue placeholder="Select location" /></SelectTrigger></TooltipTrigger><TooltipContent><p>Filter courses by preferred Location.</p></TooltipContent></Tooltip>
                  <SelectContent>
                    <SelectItem value="all">All Locations</SelectItem><SelectItem value="sci">Science Building</SelectItem><SelectItem value="la-bldg">Liberal Arts Building</SelectItem><SelectItem value="biz-bldg">Business Building</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          <div className="mt-4 p-4 border rounded-lg bg-muted/30">
            <div className="flex items-center mb-3"><Filter className="h-5 w-5 mr-2 text-muted-foreground" /><h4 className="text-sm font-semibold text-foreground">Filter by Attributes</h4></div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-2">
              {allAttributes.map(attr => (
                <Tooltip key={attr}><TooltipTrigger asChild><div className="flex items-center space-x-2"><Checkbox id={`attr-${attr}`} checked={selectedAttributes.includes(attr)} onCheckedChange={() => handleAttributeChange(attr)} /><Label htmlFor={`attr-${attr}`} className="text-xs font-normal text-gray-600 cursor-pointer">{attr}</Label></div></TooltipTrigger><TooltipContent><p>Show only courses with the '{attr}' attribute.</p></TooltipContent></Tooltip>
              ))}
            </div>
          </div>
          
          <div className="mt-4 p-4 border rounded-lg bg-muted/30 flex items-center space-x-2">
            <Checkbox id="prerequisites-cleared-filter" checked={filterPrerequisitesCleared} onCheckedChange={(checked) => setFilterPrerequisitesCleared(checked as boolean)} />
            <Label htmlFor="prerequisites-cleared-filter" className="text-sm font-normal text-gray-600 cursor-pointer">Show only courses with cleared prerequisites</Label>
            <Tooltip><TooltipTrigger asChild><Info className="h-4 w-4 text-gray-400 cursor-help ml-1" /></TooltipTrigger><TooltipContent><p>Filters courses based on whether you have completed their prerequisites, according to your academic record.</p></TooltipContent></Tooltip>
          </div>

          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList className="w-full mt-6 pt-4 border-t">
              <Tooltip><TooltipTrigger asChild><TabsTrigger value="required" className="flex-1 relative px-4 py-2.5 text-sm"><span className="flex items-center"><Check size={16} className="mr-2" />Remaining Requirements ({requiredCourses.length})</span></TabsTrigger></TooltipTrigger><TooltipContent><p>View courses that fulfill your outstanding degree requirements.</p></TooltipContent></Tooltip>
              <Tooltip><TooltipTrigger asChild><TabsTrigger value="all" className="flex-1 px-4 py-2.5 text-sm">All Courses</TabsTrigger></TooltipTrigger><TooltipContent><p>Browse all available courses based on your search and filter criteria.</p></TooltipContent></Tooltip>
            </TabsList>
            <TabsContent value="required" className="mt-4">
              <div className="p-4 bg-green-50 rounded-md mb-4 border border-green-200"><h3 className="text-green-800 font-medium text-sm">Recommended courses to fulfill your degree requirements</h3><p className="text-green-700 text-xs mt-1">These courses help you complete your degree requirements faster</p></div>
              <div className="space-y-3">
                {requiredCourses.map(course => (
                  <div key={course.id} className="border rounded-md p-3 flex justify-between items-center bg-white hover:bg-gray-50 transition-colors animate-fade-in">
                    <div>
                      <div className="flex items-center mb-1">
                        <span className={cn("rounded px-2 py-0.5 text-xs font-medium mr-2", course.department === "Core" ? "bg-purple-100 text-purple-800" : course.department === "Math" ? "bg-red-100 text-red-800" : "bg-blue-100 text-blue-800")}>{course.department}</span>
                        <span className="text-sm font-medium">{course.code}</span><span className="ml-1 text-xs bg-gray-100 px-1 rounded text-gray-700">{course.credits}cr</span>
                      </div>
                      <h3 className="font-medium">{course.name}</h3>
                      {course.description && <p className="text-xs text-gray-500 mt-1">{course.description}</p>}
                      {course.prerequisites && (<div className="text-xs text-amber-600 flex items-center mt-1"><span className="inline-block w-3 h-3 rounded-full bg-amber-400 mr-1"></span>Has prerequisites</div>)}
                    </div>
                    <div className="flex space-x-2">
                      <Tooltip><TooltipTrigger asChild><Button variant="outline" size="sm" className="h-8 w-8 rounded-full p-0" onClick={() => handleOpenInfoModal(course as unknown as Course)}><Info size={16} /></Button></TooltipTrigger><TooltipContent><p>View detailed information.</p></TooltipContent></Tooltip>
                      <Tooltip><TooltipTrigger asChild><Button variant="outline" size="sm" className="h-8 w-8 rounded-full p-0" onClick={() => handleOpenPrereqView(course.id)}><Network size={16} /></Button></TooltipTrigger><TooltipContent><p>Visualize prerequisites.</p></TooltipContent></Tooltip>
                      <Tooltip><TooltipTrigger asChild><Button variant="default" size="sm" onClick={() => handleAddCourseToPlanInternal(course as unknown as Course)}><PlusCircle className="h-4 w-4 mr-1.5" />Add</Button></TooltipTrigger><TooltipContent><p>Add to plan.</p></TooltipContent></Tooltip>
                    </div>
                  </div>))}
              </div>
            </TabsContent>
            <TabsContent value="all" className="mt-4">
              <div className="space-y-3">
                {derivedFilteredCourses.map(course => (
                  <div key={course.id} className="border rounded-md p-3 flex justify-between items-center bg-white hover:bg-gray-50 transition-colors animate-fade-in">
                    <div>
                      <div className="flex items-center mb-1"><span className="text-sm font-medium">{course.code}</span><span className="ml-1 text-xs bg-gray-100 px-1 rounded text-gray-700">{course.credits}cr</span></div>
                      <h3 className="font-medium">{course.name}</h3>
                      {course.description && <p className="text-xs text-gray-500 mt-1">{course.description}</p>}
                      {course.prerequisites && (<div className="text-xs text-amber-600 flex items-center mt-1"><span className="inline-block w-3 h-3 rounded-full bg-amber-400 mr-1"></span>Has prerequisites</div>)}
                    </div>
                    <div className="flex space-x-2">
                      <Tooltip><TooltipTrigger asChild><Button variant="outline" size="sm" className="h-8 w-8 rounded-full p-0" onClick={() => handleOpenInfoModal(course)}><Info size={16} /></Button></TooltipTrigger><TooltipContent><p>View detailed information.</p></TooltipContent></Tooltip>
                      <Tooltip><TooltipTrigger asChild><Button variant="outline" size="sm" className="h-8 w-8 rounded-full p-0" onClick={() => handleOpenPrereqView(course.id)}><Network size={16} /></Button></TooltipTrigger><TooltipContent><p>Visualize prerequisites.</p></TooltipContent></Tooltip>
                      <Tooltip><TooltipTrigger asChild><Button variant="default" size="sm" onClick={() => handleAddCourseToPlanInternal(course)}><PlusCircle className="h-4 w-4 mr-1.5" />Add</Button></TooltipTrigger><TooltipContent><p>Add to plan.</p></TooltipContent></Tooltip>
                    </div>
                  </div>))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
        <DrawerFooter className="sm:justify-end p-4 border-t">
          <Tooltip><TooltipTrigger asChild><Button variant="outline" onClick={() => onOpenChange(false)}><LogOut className="h-4 w-4 mr-2" />Close</Button></TooltipTrigger><TooltipContent><p>Close the course search panel.</p></TooltipContent></Tooltip>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
    {isPrereqModalOpen && (<PrerequisiteGraph courseId={selectedCourseForPrereqView} isOpen={isPrereqModalOpen} onOpenChange={setIsPrereqModalOpen} allCourses={mockCourses} />)}
    {selectedCourseForInfo && (
      <Dialog open={isInfoModalOpen} onOpenChange={setIsInfoModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitleShad>{selectedCourseForInfo.code} - {selectedCourseForInfo.name}</DialogTitleShad>
            <DialogDescriptionShad>Detailed information for {selectedCourseForInfo.name}.</DialogDescriptionShad>
          </DialogHeader>
          <div className="py-4 space-y-3 text-sm">
            <div><h4 className="font-semibold mb-1">Description:</h4><p className="text-gray-700">{selectedCourseForInfo.description || "No description available."}</p></div>
            <div><h4 className="font-semibold">Credits:</h4><p className="text-gray-700">{selectedCourseForInfo.credits}</p></div>
            <div><h4 className="font-semibold">Department:</h4><p className="text-gray-700">{selectedCourseForInfo.department || "N/A"}</p></div>
            {selectedCourseForInfo.prerequisites && selectedCourseForInfo.prerequisites.length > 0 && (<div><h4 className="font-semibold">Prerequisites:</h4><p className="text-gray-700">{selectedCourseForInfo.prerequisites.join(', ')}</p></div>)}
            {selectedCourseForInfo.corequisites && selectedCourseForInfo.corequisites.length > 0 && (<div><h4 className="font-semibold">Corequisites:</h4><p className="text-gray-700">{selectedCourseForInfo.corequisites.join(', ')}</p></div>)}
            {selectedCourseForInfo.attributes && selectedCourseForInfo.attributes.length > 0 && (<div><h4 className="font-semibold mb-1">Attributes:</h4><div className="flex flex-wrap gap-1">{selectedCourseForInfo.attributes.map(attr => (<Badge key={attr} variant="secondary">{attr}</Badge>))}</div></div>)}
            {selectedCourseForInfo.college && (<div><h4 className="font-semibold">College:</h4><p className="text-gray-700">{selectedCourseForInfo.college}</p></div>)}
            {selectedCourseForInfo.campus && (<div><h4 className="font-semibold">Campus:</h4><p className="text-gray-700">{selectedCourseForInfo.campus}</p></div>)}
            {selectedCourseForInfo.locationKeywords && selectedCourseForInfo.locationKeywords.length > 0 && (<div><h4 className="font-semibold">Typical Locations:</h4><p className="text-gray-700">{selectedCourseForInfo.locationKeywords.join(', ')}</p></div>)}
            {selectedCourseForInfo.sections && selectedCourseForInfo.sections.length > 0 && (<div><h4 className="font-semibold">Sections Available:</h4><p className="text-gray-700">{selectedCourseForInfo.sections.length} section(s) typically offered.</p></div>)}
          </div>
          <DialogFooterShad><Button variant="outline" onClick={() => setIsInfoModalOpen(false)}>Close</Button></DialogFooterShad>
        </DialogContent>
      </Dialog>
    )}
    </>
  );
};

export default CourseSearch;
