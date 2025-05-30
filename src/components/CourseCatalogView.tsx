import React, { useState, useEffect } from 'react';
import { mockCourses } from '../lib/mock-data';
import { Course, CourseSection, ScheduleTime } from '../lib/types';
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"; // DialogClose not used here
import { XIcon, CalendarDays, Users, MapPin, Info, ThumbsUp, ThumbsDown, AlertTriangle, CheckSquare, Square, Rows, Columns, Check, Plus, Minus } from 'lucide-react'; // Added more icons

const CourseCatalogView: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [selectedCredits, setSelectedCredits] = useState("all");
  const [selectedLevel, setSelectedLevel] = useState("all");
  const [selectedAttributes, setSelectedAttributes] = useState<string[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  const [coursesToCompare, setCoursesToCompare] = useState<Course[]>([]);
  const [showCompareModal, setShowCompareModal] = useState<boolean>(false);

  const [departments, setDepartments] = useState<string[]>([]);
  const [creditsOptions, setCreditsOptions] = useState<number[]>([]);
  const [attributesOptions, setAttributesOptions] = useState<string[]>([]);

  useEffect(() => {
    const uniqueDepartments = [...new Set(mockCourses.map(c => c.department).filter(Boolean) as string[])].sort();
    setDepartments(uniqueDepartments);
    const uniqueCredits = [...new Set(mockCourses.map(c => c.credits))].sort((a, b) => a - b);
    setCreditsOptions(uniqueCredits);
    const uniqueAttributes = [...new Set(mockCourses.flatMap(c => c.attributes || []))].sort();
    setAttributesOptions(uniqueAttributes);
  }, []);

  useEffect(() => {
    if (selectedCourse) {
      const detailView = document.getElementById('course-detail-view');
      if (detailView) detailView.scrollTop = 0;
    }
  }, [selectedCourse]);

  const handleAttributeToggle = (attribute: string) => {
    setSelectedAttributes(prev =>
      prev.includes(attribute)
        ? prev.filter(attr => attr !== attribute)
        : [...prev, attribute]
    );
  };

  const handleToggleCompare = (course: Course) => {
    setCoursesToCompare(prev => {
      const isAlreadyComparing = prev.find(c => c.id === course.id);
      if (isAlreadyComparing) {
        return prev.filter(c => c.id !== course.id);
      } else {
        if (prev.length < 3) {
          return [...prev, course];
        } else {
          alert("You can compare a maximum of 3 courses."); // Using alert as per instruction
          return prev;
        }
      }
    });
  };
  
  const filteredCourses = mockCourses.filter(course => {
    const term = searchTerm.toLowerCase();
    const matchesSearchTerm = term === "" ||
      course.name.toLowerCase().includes(term) ||
      course.code.toLowerCase().includes(term) ||
      (course.description && course.description.toLowerCase().includes(term)) ||
      (course.keywords && course.keywords.some(kw => kw.toLowerCase().includes(term)));
    const matchesDepartment = selectedDepartment === "all" || course.department === selectedDepartment;
    const matchesCredits = selectedCredits === "all" || course.credits === parseInt(selectedCredits);
    const matchesLevel = selectedLevel === "all" || course.code.startsWith(selectedLevel);
    const matchesAttributes = selectedAttributes.length === 0 ||
      selectedAttributes.every(attr => (course.attributes || []).includes(attr));
    return matchesSearchTerm && matchesDepartment && matchesCredits && matchesLevel && matchesAttributes;
  });

  const levels = ["100", "200", "300", "400", "500", "600"];

  const compareAttributes = [
    { label: "Code", getValue: (c: Course) => c.code },
    { label: "Name", getValue: (c: Course) => c.name },
    { label: "Credits", getValue: (c: Course) => c.credits.toString() },
    { label: "Department", getValue: (c: Course) => c.department || 'N/A' },
    { label: "Description", getValue: (c: Course) => (c.description?.substring(0, 100) + (c.description && c.description.length > 100 ? '...' : '')) || 'N/A' },
    { label: "Prerequisites", getValue: (c: Course) => c.prerequisites?.join(', ') || 'None' },
    { label: "Corequisites", getValue: (c: Course) => c.corequisites?.join(', ') || 'None' },
    { label: "Attributes", getValue: (c: Course) => c.attributes?.join(', ') || 'None' },
    { label: "Keywords", getValue: (c: Course) => c.keywords?.join(', ') || 'None' },
    { label: "Campus", getValue: (c: Course) => c.campus || 'N/A' },
    { label: "College", getValue: (c: Course) => c.college || 'N/A' },
    { label: "Sections Available", getValue: (c: Course) => (c.sections?.length || 0).toString() },
  ];

  const getGridColsClass = () => {
    if (coursesToCompare.length === 1) return 'grid-cols-1';
    if (coursesToCompare.length === 2) return 'grid-cols-2';
    if (coursesToCompare.length === 3) return 'grid-cols-3';
    return 'grid-cols-1'; // Default or for 0
  };


  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6 text-gray-700 border-b pb-3">Course Catalog</h2>
      <div className="flex flex-col md:flex-row gap-6">
        <div className={selectedCourse ? "w-full md:w-2/3 transition-all duration-300 ease-in-out" : "w-full transition-all duration-300 ease-in-out"}>
          <div className="mb-6 p-4 border rounded-lg bg-gray-50/50 shadow">
            <Input
              type="text"
              placeholder="Search courses (code, name, keyword, description...)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="mb-4 bg-white"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
              <div>
                <Label htmlFor="department-select" className="text-xs text-gray-600">Department</Label>
                <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                  <SelectTrigger id="department-select" className="bg-white mt-1"><SelectValue placeholder="Department" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    {departments.map(dept => <SelectItem key={dept} value={dept}>{dept}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="credits-select" className="text-xs text-gray-600">Credits</Label>
                <Select value={selectedCredits} onValueChange={setSelectedCredits}>
                  <SelectTrigger id="credits-select" className="bg-white mt-1"><SelectValue placeholder="Credits" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Credits</SelectItem>
                    {creditsOptions.map(cred => <SelectItem key={cred} value={cred.toString()}>{cred} Credits</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="level-select" className="text-xs text-gray-600">Level</Label>
                <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                  <SelectTrigger id="level-select" className="bg-white mt-1"><SelectValue placeholder="Level" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    {levels.map(lvl => <SelectItem key={lvl} value={lvl}>{lvl}-level</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            {attributesOptions.length > 0 && (
              <div className="mb-2">
                <Label className="block mb-1 text-xs font-medium text-gray-600">Filter by Attributes:</Label>
                <div className="flex flex-wrap gap-2">
                  {attributesOptions.map(attr => (
                    <Badge key={attr} onClick={() => handleAttributeToggle(attr)} variant={selectedAttributes.includes(attr) ? "default" : "secondary"}
                      className="cursor-pointer py-1 px-2 text-xs hover:bg-primary/80 transition-colors">
                      {attr}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {coursesToCompare.length > 0 && (
            <div className="my-4 flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div>
                    <span className="text-sm text-blue-700 font-medium">Comparing ({coursesToCompare.length}/3 courses): </span>
                    {coursesToCompare.map(c => <Badge key={c.id} variant="info" className="mr-1 text-xs">{c.code}</Badge>)}
                </div>
                <Button onClick={() => setShowCompareModal(true)} disabled={coursesToCompare.length < 2} variant="default" size="sm" className="bg-blue-600 hover:bg-blue-700">
                    <Rows className="h-4 w-4 mr-1.5"/>Compare Now
                </Button>
            </div>
          )}

          <p className="text-sm text-gray-600 mb-4">Found {filteredCourses.length} courses.</p>

          <div className={`grid grid-cols-1 ${selectedCourse ? 'lg:grid-cols-2' : 'lg:grid-cols-3'} md:grid-cols-2 gap-4`}>
            {filteredCourses.map((course: Course) => {
              const isComparing = !!coursesToCompare.find(c => c.id === course.id);
              return (
                <div
                  key={course.id}
                  className={`p-3 border rounded-lg shadow-sm bg-white group relative
                              ${selectedCourse && selectedCourse.id === course.id ? 'border-primary ring-2 ring-primary' : 'border-gray-200 hover:shadow-lg'}
                              ${isComparing ? 'ring-2 ring-blue-500 border-blue-400' : ''} transition-all duration-150 ease-in-out`}
                >
                  <div onClick={() => setSelectedCourse(course)} className="cursor-pointer">
                    <h3 className="text-md font-semibold text-primary mb-1 truncate group-hover:text-wrap">
                      {course.code} - {course.name}
                    </h3>
                    <p className="text-xs text-gray-600 mb-1">
                      <strong>Credits:</strong> {course.credits} | <strong>Dept:</strong> {course.department || 'N/A'}
                    </p>
                    {course.description && (
                      <p className="text-xs text-gray-500 mb-2 italic h-10 overflow-hidden text-ellipsis group-hover:h-auto group-hover:text-wrap transition-all duration-200">
                        {course.description.substring(0, 80)}{course.description.length > 80 ? "..." : ""}
                      </p>
                    )}
                    {course.attributes && course.attributes.length > 0 && (
                        <div className="mt-1 mb-1 flex flex-wrap gap-1 h-5 overflow-hidden group-hover:h-auto transition-all duration-200">
                            {course.attributes.slice(0,selectedCourse && selectedCourse.id === course.id ? course.attributes.length : 3).map(attr => ( 
                                <Badge key={attr} variant="outline" className="text-[10px] px-1 py-0">{attr}</Badge>
                            ))}
                            {course.attributes.length > 3 && !(selectedCourse && selectedCourse.id === course.id) && <Badge variant="outline" className="text-[10px] px-1 py-0">...</Badge>}
                        </div>
                    )}
                    {(!course.sections || course.sections.length === 0) && (
                        <p className="text-[11px] text-gray-400 italic mt-1">No sections typically offered.</p>
                    )}
                    {course.sections && course.sections.length > 0 && (
                        <p className="text-[11px] text-gray-500 mt-1">{course.sections.length} section(s).</p>
                    )}
                  </div>
                  <Button
                     size="xs" 
                     variant={isComparing ? "destructive_outline" : "outline"} // Custom variant or use existing like "secondary"
                     className="mt-2 text-[10px] py-0.5 px-1.5 h-auto absolute top-1 right-1"
                     onClick={(e) => { e.stopPropagation(); handleToggleCompare(course); }}
                   >
                    {isComparing ? <Minus className="h-3 w-3 sm:mr-0.5"/> : <Plus className="h-3 w-3 sm:mr-0.5"/>}
                    <span className="hidden sm:inline">{isComparing ? 'Remove' : 'Compare'}</span>
                  </Button>
                </div>
              );
            })}
            {filteredCourses.length === 0 && (
              <p className="md:col-span-2 lg:col-span-3 text-center text-gray-500 py-8">
                No courses match your current filter criteria. Try adjusting your search.
              </p>
            )}
          </div>
        </div>

        {selectedCourse && (
          <div id="course-detail-view" className="w-full md:w-1/3 p-4 border rounded-lg bg-white shadow-xl sticky top-24 max-h-[calc(100vh-120px)] overflow-y-auto transition-all duration-300 ease-in-out animate-slide-in-right">
            <Button onClick={() => setSelectedCourse(null)} variant="ghost" size="icon" className="mb-2 float-right h-7 w-7">
              <XIcon className="h-4 w-4" />
            </Button>
            <h3 className="text-xl font-bold text-primary mb-1">{selectedCourse.code}</h3>
            <h4 className="text-lg font-semibold text-gray-700 mb-2">{selectedCourse.name}</h4>
            <div className="space-y-1 text-sm mb-3">
              <p><strong>Credits:</strong> {selectedCourse.credits}</p>
              <p><strong>Department:</strong> {selectedCourse.department || 'N/A'}</p>
              {selectedCourse.college && <p><strong>College:</strong> {selectedCourse.college}</p>}
              {selectedCourse.campus && <p><strong>Campus:</strong> {selectedCourse.campus}</p>}
            </div>
            {selectedCourse.description && (
              <div className="mb-3">
                <h5 className="font-semibold text-sm mb-0.5 text-gray-600">Description</h5>
                <p className="text-xs text-gray-500 whitespace-pre-wrap">{selectedCourse.description}</p>
              </div>
            )}
            {(selectedCourse.prerequisites && selectedCourse.prerequisites.length > 0) && (
              <div className="mb-3">
                <h5 className="font-semibold text-sm mb-1 text-gray-600">Prerequisites</h5>
                <div className="flex flex-wrap gap-1">
                  {selectedCourse.prerequisites.map(prereqCode => {
                    const prereqCourseDetails = mockCourses.find(c => c.code === prereqCode || c.id === prereqCode);
                    return (
                      <Badge key={prereqCode} variant="secondary" className="text-xs cursor-pointer hover:bg-blue-100 hover:text-blue-700"
                        onClick={() => { if (prereqCourseDetails) setSelectedCourse(prereqCourseDetails); }}>
                        {prereqCode}{prereqCourseDetails ? ` - ${prereqCourseDetails.name.substring(0,20)}...` : ''}
                      </Badge>
                    );
                  })}
                </div>
              </div>
            )}
            {(selectedCourse.corequisites && selectedCourse.corequisites.length > 0) && (
              <div className="mb-3">
                <h5 className="font-semibold text-sm mb-1 text-gray-600">Corequisites</h5>
                 <div className="flex flex-wrap gap-1">
                  {selectedCourse.corequisites.map(coreqCode => {
                    const coreqCourseDetails = mockCourses.find(c => c.code === coreqCode || c.id === coreqCode);
                    return (
                      <Badge key={coreqCode} variant="secondary" className="text-xs cursor-pointer hover:bg-blue-100 hover:text-blue-700"
                        onClick={() => { if (coreqCourseDetails) setSelectedCourse(coreqCourseDetails); }}>
                        {coreqCode}{coreqCourseDetails ? ` - ${coreqCourseDetails.name.substring(0,20)}...` : ''}
                      </Badge>
                    );
                  })}
                </div>
              </div>
            )}
            {selectedCourse.attributes && selectedCourse.attributes.length > 0 && (
              <div className="mb-3">
                <h5 className="font-semibold text-sm mb-1 text-gray-600">Attributes</h5>
                <div className="flex flex-wrap gap-1">
                  {selectedCourse.attributes.map(attr => <Badge key={attr} variant="outline" className="text-xs">{attr}</Badge>)}
                </div>
              </div>
            )}
            {selectedCourse.keywords && selectedCourse.keywords.length > 0 && (
              <div className="mb-3">
                <h5 className="font-semibold text-sm mb-1 text-gray-600">Keywords</h5>
                <div className="flex flex-wrap gap-1">
                  {selectedCourse.keywords.map(kw => <Badge key={kw} variant="outline" className="text-xs">{kw}</Badge>)}
                </div>
              </div>
            )}
            {selectedCourse.sections && selectedCourse.sections.length > 0 && (
              <div>
                <h5 className="font-semibold text-sm mb-2 text-gray-600 pt-2 border-t">Available Sections</h5>
                <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                  {selectedCourse.sections.map((section: CourseSection) => (
                    <div key={section.id} className="p-2.5 border rounded-md bg-gray-50/70 text-xs">
                      <div className="flex justify-between items-center mb-1">
                        <p className="font-medium text-gray-800">Section {section.sectionNumber} <span className="text-gray-500">(CRN: {section.crn})</span></p>
                        {section.sectionType && section.sectionType !== 'Standard' && <Badge variant="info" className="text-[10px] py-0 px-1">{section.sectionType}</Badge>}
                      </div>
                      <p className="text-gray-600"><Users className="inline h-3 w-3 mr-1 text-gray-400"/> {section.instructor || 'Staff'}</p>
                      {section.schedule.map((s, idx) => (
                        <div key={idx} className="mt-0.5">
                           <p className="text-gray-600"><CalendarDays className="inline h-3 w-3 mr-1 text-gray-400"/> {s.days}: {s.startTime}-{s.endTime}</p>
                           <p className="text-gray-600"><MapPin className="inline h-3 w-3 mr-1 text-gray-400"/> {s.location || section.location || 'TBD'}</p>
                        </div>
                      ))}
                      <div className="flex justify-between items-center mt-1.5 text-gray-500">
                        <span>Seats: {section.availableSeats}/{section.maxSeats}</span>
                        {section.waitlistCount !== undefined && <span>Waitlist: {section.waitlistCount}</span>}
                      </div>
                       {section.notes && <p className="text-[11px] text-amber-700 mt-1 italic"><Info className="inline h-3 w-3 mr-0.5"/> {section.notes}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}
            {(!selectedCourse.sections || selectedCourse.sections.length === 0) && (
                <p className="text-xs text-gray-400 italic mt-3 pt-3 border-t">No sections listed for this course.</p>
            )}
          </div>
        )}
      </div>

      {/* Comparison Modal */}
      <Dialog open={showCompareModal} onOpenChange={setShowCompareModal}>
        <DialogContent className="max-w-3xl lg:max-w-5xl xl:max-w-6xl h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-xl">Compare Courses ({coursesToCompare.length})</DialogTitle>
          </DialogHeader>
          <div className="flex-grow overflow-y-auto py-2 pr-2"> {/* Made this div scrollable */}
            <div className={`grid ${getGridColsClass()} gap-x-3 sticky top-0 bg-background pb-2 z-10 border-b mb-2`}>
              {coursesToCompare.map(course => (
                <div key={course.id + "-header"} className="p-2">
                  <h4 className="font-semibold text-md text-primary truncate">{course.code}</h4>
                  <p className="text-xs text-gray-600 truncate">{course.name}</p>
                  <Button variant="destructive_outline" size="xs" className="mt-1 w-full text-xs" onClick={() => handleToggleCompare(course)}>
                    <Minus className="h-3 w-3 mr-1"/>Remove
                  </Button>
                </div>
              ))}
            </div>
            <div className="space-y-3">
              {compareAttributes.map(attr => (
                <div key={attr.label} className="pt-2">
                  <h5 className="font-semibold text-sm text-gray-500 mb-1 sticky top-[calc(var(--header-height,60px)+var(--course-header-height,60px))] bg-background py-1"> {/* Make attribute labels sticky */}
                    {attr.label}
                  </h5>
                  <div className={`grid ${getGridColsClass()} gap-x-3`}>
                    {coursesToCompare.map(course => (
                      <div key={course.id + "-" + attr.label} className="text-xs p-2 bg-gray-50 rounded-md break-words min-h-[40px]">
                        {attr.getValue(course) || 'N/A'}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <DialogFooter className="mt-auto pt-4 border-t">
            <Button variant="outline" onClick={() => setShowCompareModal(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CourseCatalogView;
