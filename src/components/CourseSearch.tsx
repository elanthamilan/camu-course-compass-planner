import React, { useState, useEffect, useMemo } from "react";
import { Drawer, DrawerContent, DrawerFooter, DrawerHeader, DrawerTitle, DrawerDescription } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSchedule } from "@/contexts/ScheduleContext";
import { Course, DegreeRequirement } from "@/lib/types";
import { mockCourses } from "@/lib/mock-data";
import { Search, Check, Info, PlusCircle, LogOut, Filter, Network, ChevronDown } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Checkbox } from "@/components/ui/checkbox";
import PrerequisiteGraph from './PrerequisiteGraph';
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle as DialogTitleShad, DialogDescription as DialogDescriptionShad, DialogFooter as DialogFooterShad } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

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
          <DrawerTitle className="text-lg">
            {contextualDrawerTitle ||
              (termId
                ? `Add Courses to Semester`
                : "Browse Courses")}
          </DrawerTitle>
          <DrawerDescription>
            {termId && !contextualDrawerTitle
              ? "Search for courses to add to your selected semester"
              : "Browse available courses and view details"
            }
          </DrawerDescription>
        </DrawerHeader>
        <div className="flex-grow overflow-y-auto space-y-4 p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <Input
              placeholder="Type course code (CS101) or name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 text-base"
            />
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap gap-2 items-center text-xs">
            <span className="text-gray-500">Quick filters:</span>
            <Button
              variant={filterPrerequisitesCleared ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterPrerequisitesCleared(!filterPrerequisitesCleared)}
              className="text-xs h-7 px-2"
            >
              {filterPrerequisitesCleared ? "✅" : "📚"} Prerequisites OK
            </Button>

            {allAttributes.slice(0, 3).map(attr => (
              <Button
                key={attr}
                variant={selectedAttributes.includes(attr) ? "default" : "outline"}
                size="sm"
                onClick={() => handleAttributeChange(attr)}
                className="text-xs h-7 px-2"
              >
                {attr}
              </Button>
            ))}

            {/* Clear filters if any are active */}
            {(selectedAttributes.length > 0 || filterPrerequisitesCleared) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedAttributes([]);
                  setFilterPrerequisitesCleared(false);
                }}
                className="text-xs h-7 px-2 text-gray-500 hover:text-red-600"
              >
                Clear
              </Button>
            )}
          </div>

          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList className="w-full">
              <TabsTrigger value="required" className="flex-1">
                <Check size={16} className="mr-2" />
                Required ({requiredCourses.length})
              </TabsTrigger>
              <TabsTrigger value="all" className="flex-1">
                All Courses
              </TabsTrigger>
            </TabsList>
            <TabsContent value="required" className="mt-4">
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
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm" className="h-8 px-2">
                            <Info size={14} className="mr-1" />
                            Details
                            <ChevronDown size={12} className="ml-1" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleOpenInfoModal(course as unknown as Course)}>
                            <Info size={14} className="mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleOpenPrereqView(course.id)}>
                            <Network size={14} className="mr-2" />
                            Prerequisites
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      <Button variant="default" size="sm" onClick={() => handleAddCourseToPlanInternal(course as unknown as Course)}>
                        <PlusCircle className="h-4 w-4 mr-1" />
                        {termId ? "Add to Semester" : "Add to Plan"}
                      </Button>
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
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm" className="h-8 px-2">
                            <Info size={14} className="mr-1" />
                            Details
                            <ChevronDown size={12} className="ml-1" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleOpenInfoModal(course)}>
                            <Info size={14} className="mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleOpenPrereqView(course.id)}>
                            <Network size={14} className="mr-2" />
                            Prerequisites
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      <Button variant="default" size="sm" onClick={() => handleAddCourseToPlanInternal(course)}>
                        <PlusCircle className="h-4 w-4 mr-1" />
                        {termId ? "Add to Semester" : "Add to Plan"}
                      </Button>
                    </div>
                  </div>))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
        <DrawerFooter className="p-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
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
