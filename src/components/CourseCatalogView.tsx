import React, { useState, useEffect } from 'react';
import { mockCourses } from '../lib/mock-data';
import { Course, CourseSection, ScheduleTime } from '../lib/types';
import { Input } from "@/components/atoms/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/atoms/select";
import { Badge } from "@/components/atoms/badge";
import { Label } from "@/components/atoms/label";
import { Button } from "@/components/atoms/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/atoms/dialog"; // DialogClose not used here
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle } from "@/components/atoms/drawer"; // Added for Bottom Sheet
import { XIcon, CalendarDays, Users, MapPin, Info, ThumbsUp, ThumbsDown, AlertTriangle, CheckSquare, Square, Rows, Columns, Check, Plus, Minus, Filter, Eye, Edit } from 'lucide-react'; // Added more icons, Added Filter, Eye, Edit
import EmbeddedCourseSequenceView from './EmbeddedCourseSequenceView'; // Import the new component
import { Sheet, SheetContent, SheetTrigger } from "@/components/atoms/sheet"; // Added for mobile filters
import { useIsMobile } from '@/hooks/use-mobile'; // Added for mobile detection
import CourseDetailBottomSheet from './CourseDetailBottomSheet'; // Added for mobile course details

interface FilterPreset {
  searchTerm?: string;
  department?: string;
  level?: string;
  credits?: string;
  classStatus?: string;
  attributes?: string[];
}

interface CourseCatalogViewProps {
  targetCourseCode?: string | null;
  onTargetCourseViewed?: () => void;
  filterPreset?: FilterPreset | null;
  onFilterPresetApplied?: () => void;
}

const CourseCatalogView: React.FC<CourseCatalogViewProps> = ({
  targetCourseCode,
  onTargetCourseViewed,
  filterPreset,
  onFilterPresetApplied
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [selectedCredits, setSelectedCredits] = useState("all");
  const [selectedLevel, setSelectedLevel] = useState("all");
  const [selectedAttributes, setSelectedAttributes] = useState<string[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false); // State for mobile filter sheet
  const isMobile = useIsMobile(); // Hook for mobile detection
  const [isCourseActionSheetOpen, setIsCourseActionSheetOpen] = useState(false); // State for course action bottom sheet
  const [actionSheetCourse, setActionSheetCourse] = useState<Course | null>(null); // State for course in action sheet
  const [isCourseDetailBottomSheetOpen, setIsCourseDetailBottomSheetOpen] = useState(false); // State for mobile course detail bottom sheet
  const [selectedCourseForDetail, setSelectedCourseForDetail] = useState<Course | null>(null); // Course selected for detail bottom sheet


  // New filter states
  const [selectedTerm, setSelectedTerm] = useState("all");
  const [selectedCampus, setSelectedCampus] = useState("all");
  const [selectedCourseCareer, setSelectedCourseCareer] = useState("all");
  const [selectedClassStatus, setSelectedClassStatus] = useState("all");
  const [selectedInstructionMode, setSelectedInstructionMode] = useState("all");
  const [selectedAcademicSession, setSelectedAcademicSession] = useState("all");
  const [selectedMeetingDays, setSelectedMeetingDays] = useState("all");
  const [selectedStartTime, setSelectedStartTime] = useState("all");

  const [coursesToCompare, setCoursesToCompare] = useState<Course[]>([]);
  const [showCompareModal, setShowCompareModal] = useState<boolean>(false);
  const [showFilterBanner, setShowFilterBanner] = useState(false);

  const [departments, setDepartments] = useState<string[]>([]);
  const [creditsOptions, setCreditsOptions] = useState<number[]>([]);
  const [attributesOptions, setAttributesOptions] = useState<string[]>([]);

  // New filter options
  const [termOptions, setTermOptions] = useState<string[]>([]);
  const [campusOptions, setCampusOptions] = useState<string[]>([]);
  const [courseCareerOptions, setCourseCareerOptions] = useState<string[]>([]);
  const [classStatusOptions, setClassStatusOptions] = useState<string[]>([]);
  const [instructionModeOptions, setInstructionModeOptions] = useState<string[]>([]);
  const [academicSessionOptions, setAcademicSessionOptions] = useState<string[]>([]);

  useEffect(() => {
    const uniqueDepartments = [...new Set(mockCourses.map(c => c.department).filter(Boolean) as string[])].sort();
    setDepartments(uniqueDepartments);
    const uniqueCredits = [...new Set(mockCourses.map(c => c.credits))].sort((a, b) => a - b);
    setCreditsOptions(uniqueCredits);
    const uniqueAttributes = [...new Set(mockCourses.flatMap(c => c.attributes || []))].sort();
    setAttributesOptions(uniqueAttributes);

    // Populate new filter options from sections
    const allSections = mockCourses.flatMap(c => c.sections);
    const uniqueTerms = [...new Set(allSections.map(s => s.term).filter(Boolean) as string[])].sort();
    setTermOptions(uniqueTerms);
    const uniqueCampuses = [...new Set([...mockCourses.map(c => c.campus), ...allSections.map(s => s.campus)].filter(Boolean) as string[])].sort();
    setCampusOptions(uniqueCampuses);
    const uniqueCareers = [...new Set([...mockCourses.map(c => c.courseCareer), ...allSections.map(s => s.courseCareer)].filter(Boolean) as string[])].sort();
    setCourseCareerOptions(uniqueCareers);
    const uniqueStatuses = [...new Set(allSections.map(s => s.classStatus).filter(Boolean) as string[])].sort();
    setClassStatusOptions(uniqueStatuses);
    const uniqueModes = [...new Set(allSections.map(s => s.instructionMode).filter(Boolean) as string[])].sort();
    setInstructionModeOptions(uniqueModes);
    const uniqueSessions = [...new Set(allSections.map(s => s.academicSession).filter(Boolean) as string[])].sort();
    setAcademicSessionOptions(uniqueSessions);
  }, []);

  useEffect(() => {
    if (selectedCourse) {
      const detailView = document.getElementById('course-detail-view');
      if (detailView) detailView.scrollTop = 0;
    }
  }, [selectedCourse]);

  useEffect(() => {
    if (targetCourseCode) {
      // Set search term to the target course code for filtering
      setSearchTerm(targetCourseCode);

      const courseToSelect = mockCourses.find(c => c.code === targetCourseCode || c.id === targetCourseCode);
      if (courseToSelect) {
        setSelectedCourse(courseToSelect);
        // Scroll course list to selected course if possible (more complex, skip for now)
        // Ensure detail panel is visible if it's on a different part of the page
         const detailPanel = document.getElementById('course-detail-view');
         // Ensure the panel is rendered before trying to scroll. Delay might be needed if panel appears after state update.
         setTimeout(() => {
            if (detailPanel) detailPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
         }, 0);
      }
      if (onTargetCourseViewed) {
        onTargetCourseViewed();
      }
    }
  // setSelectedCourse is stable, mockCourses is stable.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetCourseCode, onTargetCourseViewed]);

  // Handle filter presets
  useEffect(() => {
    if (filterPreset) {
      if (filterPreset.searchTerm) setSearchTerm(filterPreset.searchTerm);
      if (filterPreset.department) setSelectedDepartment(filterPreset.department);
      if (filterPreset.level) setSelectedLevel(filterPreset.level);
      if (filterPreset.credits) setSelectedCredits(filterPreset.credits);
      if (filterPreset.classStatus) setSelectedClassStatus(filterPreset.classStatus);
      if (filterPreset.attributes) setSelectedAttributes(filterPreset.attributes);

      // Show banner to indicate filters were applied
      setShowFilterBanner(true);

      if (onFilterPresetApplied) {
        onFilterPresetApplied();
      }
    }
  }, [filterPreset, onFilterPresetApplied]);

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

  // Removed handleAddCourse - Browse All Classes is a pure catalog view

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

    // New filter logic
    const matchesCampus = selectedCampus === "all" || course.campus === selectedCampus;
    const matchesCourseCareer = selectedCourseCareer === "all" || course.courseCareer === selectedCourseCareer;

    // Section-based filters - course matches if ANY section matches
    const matchesTerm = selectedTerm === "all" || course.sections.some(s => s.term === selectedTerm);
    const matchesClassStatus = selectedClassStatus === "all" || course.sections.some(s => (s.classStatus || "Open") === selectedClassStatus);
    const matchesInstructionMode = selectedInstructionMode === "all" || course.sections.some(s => s.instructionMode === selectedInstructionMode);
    const matchesAcademicSession = selectedAcademicSession === "all" || course.sections.some(s => s.academicSession === selectedAcademicSession);

    // Meeting days filter
    const matchesMeetingDays = selectedMeetingDays === "all" || course.sections.some(s =>
      s.schedule.some(sch => sch.days.includes(selectedMeetingDays))
    );

    // Start time filter
    const matchesStartTime = selectedStartTime === "all" || course.sections.some(s =>
      s.schedule.some(sch => sch.startTime.startsWith(selectedStartTime))
    );

    return matchesSearchTerm && matchesDepartment && matchesCredits && matchesLevel &&
           matchesAttributes && matchesCampus && matchesCourseCareer && matchesTerm &&
           matchesClassStatus && matchesInstructionMode && matchesAcademicSession &&
           matchesMeetingDays && matchesStartTime;
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
    if (isMobile) return 'grid-cols-1';
    if (coursesToCompare.length === 1) return 'grid-cols-1';
    if (coursesToCompare.length === 2) return 'grid-cols-1 sm:grid-cols-2';
    if (coursesToCompare.length === 3) return 'grid-cols-1 md:grid-cols-3';
    return 'grid-cols-1';
  };


  return (
    <div>
      {/* Simplified Header */}
      <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
        <div className="flex items-center space-x-3 w-full">
          <span className="text-2xl">📚</span>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-blue-900">Browse All Classes</h2>
            <p className="text-blue-700 text-sm">Search and filter through all available courses</p>
          </div>
        </div>
      </div>

      {/* Smart Filter Banner */}
      {showFilterBanner && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm font-medium text-green-800">Smart filters applied</p>
                <p className="text-xs text-green-600">
                  Showing {selectedDepartment !== "all" ? `${selectedDepartment} ` : ""}
                  {selectedClassStatus !== "all" ? `${selectedClassStatus.toLowerCase()} ` : ""}
                  courses{selectedAttributes.length > 0 ? ` with ${selectedAttributes.join(", ").toLowerCase()} attributes` : ""}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                // Clear all filters
                setSearchTerm("");
                setSelectedDepartment("all");
                setSelectedLevel("all");
                setSelectedCredits("all");
                setSelectedClassStatus("all");
                setSelectedAttributes([]);
                setShowFilterBanner(false);
              }}
              className="text-green-600 hover:text-green-800"
            >
              <XIcon className="h-4 w-4 mr-1" />
              Clear filters
            </Button>
          </div>
        </div>
      )}

      <div className="flex gap-6">
        {/* Left Sidebar - Filters (Desktop) */}
        <div className="hidden lg:flex w-80 flex-shrink-0 flex-col">
          <div className="sticky top-4 space-y-6">
            {/* Search */}
            <div className="bg-white border rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                <span className="text-lg mr-2">🔍</span>
                Search
              </h3>
              <Input
                type="text"
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            {/* Basic Filters */}
            <div className="bg-white border rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                <span className="text-lg mr-2">📖</span>
                Subject & Level
              </h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="department-select" className="text-sm font-medium text-gray-700">
                    Subject Area
                  </Label>
                  <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                    <SelectTrigger id="department-select" className="mt-1">
                      <SelectValue placeholder="All Subjects" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Subjects</SelectItem>
                      {departments.map(dept => <SelectItem key={dept} value={dept}>{dept}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="level-select" className="text-sm font-medium text-gray-700">
                    Course Level
                  </Label>
                  <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                    <SelectTrigger id="level-select" className="mt-1">
                      <SelectValue placeholder="All Levels" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Levels</SelectItem>
                      <SelectItem value="100">100-level (Intro)</SelectItem>
                      <SelectItem value="200">200-level (Sophomore)</SelectItem>
                      <SelectItem value="300">300-level (Advanced)</SelectItem>
                      <SelectItem value="400">400-level (Senior)</SelectItem>
                      <SelectItem value="500">500-level (Graduate)</SelectItem>
                      <SelectItem value="600">600-level (Advanced Graduate)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="credits-select" className="text-sm font-medium text-gray-700">
                    Credit Hours
                  </Label>
                  <Select value={selectedCredits} onValueChange={setSelectedCredits}>
                    <SelectTrigger id="credits-select" className="mt-1">
                      <SelectValue placeholder="Any Credits" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Any Credits</SelectItem>
                      {creditsOptions.map(cred => <SelectItem key={cred} value={cred.toString()}>{cred} Credits</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Schedule Filters */}
            <div className="bg-white border rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                <span className="text-lg mr-2">⏰</span>
                Schedule
              </h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="days-select" className="text-sm font-medium text-gray-700">Days of Week</Label>
                  <Select value={selectedMeetingDays} onValueChange={setSelectedMeetingDays}>
                    <SelectTrigger id="days-select" className="mt-1">
                      <SelectValue placeholder="Any Day" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Any Day</SelectItem>
                      <SelectItem value="M">Monday</SelectItem>
                      <SelectItem value="T">Tuesday</SelectItem>
                      <SelectItem value="W">Wednesday</SelectItem>
                      <SelectItem value="Th">Thursday</SelectItem>
                      <SelectItem value="F">Friday</SelectItem>
                      <SelectItem value="S">Saturday</SelectItem>
                      <SelectItem value="Su">Sunday</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="time-select" className="text-sm font-medium text-gray-700">Start Time</Label>
                  <Select value={selectedStartTime} onValueChange={setSelectedStartTime}>
                    <SelectTrigger id="time-select" className="mt-1">
                      <SelectValue placeholder="Any Time" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Any Time</SelectItem>
                      <SelectItem value="08">8:00 AM</SelectItem>
                      <SelectItem value="09">9:00 AM</SelectItem>
                      <SelectItem value="10">10:00 AM</SelectItem>
                      <SelectItem value="11">11:00 AM</SelectItem>
                      <SelectItem value="12">12:00 PM</SelectItem>
                      <SelectItem value="13">1:00 PM</SelectItem>
                      <SelectItem value="14">2:00 PM</SelectItem>
                      <SelectItem value="15">3:00 PM</SelectItem>
                      <SelectItem value="16">4:00 PM</SelectItem>
                      <SelectItem value="17">5:00 PM</SelectItem>
                      <SelectItem value="18">6:00 PM</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="term-select" className="text-sm font-medium text-gray-700">Term</Label>
                  <Select value={selectedTerm} onValueChange={setSelectedTerm}>
                    <SelectTrigger id="term-select" className="mt-1">
                      <SelectValue placeholder="Any Term" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Any Term</SelectItem>
                      {termOptions.map(term => <SelectItem key={term} value={term}>{term}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="mode-select" className="text-sm font-medium text-gray-700">Format</Label>
                  <Select value={selectedInstructionMode} onValueChange={setSelectedInstructionMode}>
                    <SelectTrigger id="mode-select" className="mt-1">
                      <SelectValue placeholder="Any Format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Any Format</SelectItem>
                      {instructionModeOptions.map(mode => <SelectItem key={mode} value={mode}>{mode}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Additional Filters */}
            <div className="bg-white border rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                <span className="text-lg mr-2">🎯</span>
                More Options
              </h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="status-select" className="text-sm font-medium text-gray-700">Availability</Label>
                  <Select value={selectedClassStatus} onValueChange={setSelectedClassStatus}>
                    <SelectTrigger id="status-select" className="mt-1">
                      <SelectValue placeholder="Any Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Any Status</SelectItem>
                      {classStatusOptions.map(status => <SelectItem key={status} value={status}>{status}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="campus-select" className="text-sm font-medium text-gray-700">Campus</Label>
                  <Select value={selectedCampus} onValueChange={setSelectedCampus}>
                    <SelectTrigger id="campus-select" className="mt-1">
                      <SelectValue placeholder="Any Campus" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Any Campus</SelectItem>
                      {campusOptions.map(campus => <SelectItem key={campus} value={campus}>{campus}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="session-select" className="text-sm font-medium text-gray-700">Session</Label>
                  <Select value={selectedAcademicSession} onValueChange={setSelectedAcademicSession}>
                    <SelectTrigger id="session-select" className="mt-1">
                      <SelectValue placeholder="Any Session" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Any Session</SelectItem>
                      {academicSessionOptions.map(session => <SelectItem key={session} value={session}>{session}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Special Attributes */}
            {attributesOptions.length > 0 && (
              <div className="bg-white border rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <span className="text-lg mr-2">🏷️</span>
                  Attributes
                </h3>
                <div className="flex flex-wrap gap-2">
                  {attributesOptions.map(attr => (
                    <Badge
                      key={attr}
                      onClick={() => handleAttributeToggle(attr)}
                      variant={selectedAttributes.includes(attr) ? "default" : "outline"}
                      className="cursor-pointer py-1 px-3 text-sm hover:bg-primary/80 transition-colors"
                    >
                      {selectedAttributes.includes(attr) ? "✓" : "+"} {attr}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 min-w-0">
          {/* Mobile Filter Trigger */}
          <div className="lg:hidden mb-4">
            <Sheet open={isFilterSheetOpen} onOpenChange={setIsFilterSheetOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" className="w-full">
                  <Filter className="h-4 w-4 mr-2" />
                  Show Filters
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] sm:w-[340px] p-0">
                <div className="overflow-y-auto h-full p-4 space-y-6"> {/* Added padding here and scroll */}
                  {/* Search */}
                  <div className="bg-white border rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                      <span className="text-lg mr-2">🔍</span>
                      Search
                    </h3>
                    <Input
                      type="text"
                      placeholder="Search courses..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  {/* Basic Filters */}
                  <div className="bg-white border rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                      <span className="text-lg mr-2">📖</span>
                      Subject & Level
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="mobile-department-select" className="text-sm font-medium text-gray-700">
                          Subject Area
                        </Label>
                        <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                          <SelectTrigger id="mobile-department-select" className="mt-1">
                            <SelectValue placeholder="All Subjects" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Subjects</SelectItem>
                            {departments.map(dept => <SelectItem key={dept} value={dept}>{dept}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="mobile-level-select" className="text-sm font-medium text-gray-700">Course Level</Label>
                        <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                          <SelectTrigger id="mobile-level-select" className="mt-1"><SelectValue placeholder="All Levels" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Levels</SelectItem>
                            {levels.map(level => <SelectItem key={`mobile-level-${level}`} value={level}>{level}-level</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="mobile-credits-select" className="text-sm font-medium text-gray-700">Credit Hours</Label>
                        <Select value={selectedCredits} onValueChange={setSelectedCredits}>
                          <SelectTrigger id="mobile-credits-select" className="mt-1"><SelectValue placeholder="Any Credits" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Any Credits</SelectItem>
                            {creditsOptions.map(cred => <SelectItem key={`mobile-cred-${cred}`} value={cred.toString()}>{cred} Credits</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                  {/* Schedule Filters */}
                  <div className="bg-white border rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center"><span className="text-lg mr-2">⏰</span>Schedule</h3>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="mobile-days-select" className="text-sm font-medium text-gray-700">Days of Week</Label>
                        <Select value={selectedMeetingDays} onValueChange={setSelectedMeetingDays}>
                          <SelectTrigger id="mobile-days-select" className="mt-1"><SelectValue placeholder="Any Day" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Any Day</SelectItem>
                            <SelectItem value="M">Monday</SelectItem><SelectItem value="T">Tuesday</SelectItem><SelectItem value="W">Wednesday</SelectItem><SelectItem value="Th">Thursday</SelectItem><SelectItem value="F">Friday</SelectItem><SelectItem value="S">Saturday</SelectItem><SelectItem value="Su">Sunday</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="mobile-time-select" className="text-sm font-medium text-gray-700">Start Time</Label>
                        <Select value={selectedStartTime} onValueChange={setSelectedStartTime}>
                          <SelectTrigger id="mobile-time-select" className="mt-1"><SelectValue placeholder="Any Time" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Any Time</SelectItem>
                            <SelectItem value="08">8:00 AM</SelectItem><SelectItem value="09">9:00 AM</SelectItem><SelectItem value="10">10:00 AM</SelectItem><SelectItem value="11">11:00 AM</SelectItem><SelectItem value="12">12:00 PM</SelectItem><SelectItem value="13">1:00 PM</SelectItem><SelectItem value="14">2:00 PM</SelectItem><SelectItem value="15">3:00 PM</SelectItem><SelectItem value="16">4:00 PM</SelectItem><SelectItem value="17">5:00 PM</SelectItem><SelectItem value="18">6:00 PM</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="mobile-term-select" className="text-sm font-medium text-gray-700">Term</Label>
                        <Select value={selectedTerm} onValueChange={setSelectedTerm}>
                          <SelectTrigger id="mobile-term-select" className="mt-1"><SelectValue placeholder="Any Term" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Any Term</SelectItem>
                            {termOptions.map(term => <SelectItem key={`mobile-term-${term}`} value={term}>{term}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="mobile-mode-select" className="text-sm font-medium text-gray-700">Format</Label>
                        <Select value={selectedInstructionMode} onValueChange={setSelectedInstructionMode}>
                          <SelectTrigger id="mobile-mode-select" className="mt-1"><SelectValue placeholder="Any Format" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Any Format</SelectItem>
                            {instructionModeOptions.map(mode => <SelectItem key={`mobile-mode-${mode}`} value={mode}>{mode}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                  {/* Additional Filters */}
                  <div className="bg-white border rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center"><span className="text-lg mr-2">🎯</span>More Options</h3>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="mobile-status-select" className="text-sm font-medium text-gray-700">Availability</Label>
                        <Select value={selectedClassStatus} onValueChange={setSelectedClassStatus}>
                          <SelectTrigger id="mobile-status-select" className="mt-1"><SelectValue placeholder="Any Status" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Any Status</SelectItem>
                            {classStatusOptions.map(status => <SelectItem key={`mobile-status-${status}`} value={status}>{status}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="mobile-campus-select" className="text-sm font-medium text-gray-700">Campus</Label>
                        <Select value={selectedCampus} onValueChange={setSelectedCampus}>
                          <SelectTrigger id="mobile-campus-select" className="mt-1"><SelectValue placeholder="Any Campus" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Any Campus</SelectItem>
                            {campusOptions.map(campus => <SelectItem key={`mobile-campus-${campus}`} value={campus}>{campus}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="mobile-session-select" className="text-sm font-medium text-gray-700">Session</Label>
                        <Select value={selectedAcademicSession} onValueChange={setSelectedAcademicSession}>
                          <SelectTrigger id="mobile-session-select" className="mt-1"><SelectValue placeholder="Any Session" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Any Session</SelectItem>
                            {academicSessionOptions.map(session => <SelectItem key={`mobile-session-${session}`} value={session}>{session}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                  {/* Special Attributes */}
                  {attributesOptions.length > 0 && (
                    <div className="bg-white border rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 mb-3 flex items-center"><span className="text-lg mr-2">🏷️</span>Attributes</h3>
                      <div className="flex flex-wrap gap-2">
                        {attributesOptions.map(attr => (
                          <Badge key={attr} onClick={() => handleAttributeToggle(attr)} variant={selectedAttributes.includes(attr) ? "default" : "outline"} className="cursor-pointer py-1 px-3 text-sm hover:bg-primary/80 transition-colors">
                            {selectedAttributes.includes(attr) ? "✓" : "+"} {attr}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                   {/* Button to close sheet */}
                  <Button onClick={() => setIsFilterSheetOpen(false)} className="w-full mt-4">Done</Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {coursesToCompare.length > 0 && (
            <div className="mb-4 flex items-center justify-between p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <div>
                <span className="text-sm text-purple-700 font-medium flex items-center">
                  <span className="text-lg mr-2">⚖️</span>
                  Comparing Classes ({coursesToCompare.length}/3):
                </span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {coursesToCompare.map(c => <Badge key={c.id} variant="secondary" className="text-xs">{c.code}</Badge>)}
                </div>
              </div>
              <Button onClick={() => setShowCompareModal(true)} disabled={coursesToCompare.length < 2} variant="default" size="sm" className="bg-purple-600 hover:bg-purple-700">
                <Rows className="h-4 w-4 mr-1.5"/>Compare
              </Button>
            </div>
          )}

          {/* Results Summary */}
          <div className="mb-4 p-3 bg-gray-50 rounded-lg border">
            <p className="text-base font-medium text-gray-700 flex items-center">
              <span className="text-xl mr-2">📋</span>
              {filteredCourses.length} courses found
            </p>
          </div>

          <div className={`grid grid-cols-1 gap-4 ${isMobile ? 'sm:grid-cols-2' : (selectedCourse ? 'md:grid-cols-1' : 'md:grid-cols-2')}`}>
            {filteredCourses.map((course: Course) => {
              const isComparing = !!coursesToCompare.find(c => c.id === course.id);
              return (
                <div
                  key={course.id}
                  className={`p-3 border rounded-lg shadow-sm bg-white group relative
                              ${selectedCourse && selectedCourse.id === course.id ? 'border-primary ring-2 ring-primary' : 'border-gray-200 hover:shadow-lg'}
                              ${isComparing ? 'ring-2 ring-blue-500 border-blue-400' : ''} transition-all duration-150 ease-in-out`}
                >
                  <div
                    onClick={() => {
                      if (isMobile) {
                        setSelectedCourseForDetail(course);
                        setIsCourseDetailBottomSheetOpen(true);
                      } else {
                        setSelectedCourse(course);
                      }
                    }}
                    className="cursor-pointer"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="text-base sm:text-lg font-bold text-primary mb-1 group-hover:text-blue-700">
                          {course.code}
                        </h3>
                        <h4 className="text-sm font-medium text-gray-700 leading-tight">
                          {course.name}
                        </h4>
                      </div>
                      <div className="text-right">
                        <Badge variant="secondary" className="text-xs">
                          {course.credits} credits
                        </Badge>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center text-xs text-gray-600">
                        <span className="mr-3">📖 {course.department || 'General'}</span>
                        {course.sections && course.sections.length > 0 && (
                          <span>👥 {course.sections.length} section{course.sections.length !== 1 ? 's' : ''} available</span>
                        )}
                      </div>

                      {course.description && (
                        <p className="text-sm text-gray-600 leading-relaxed group-hover:text-gray-800 transition-colors">
                          {course.description.substring(0, 120)}{course.description.length > 120 ? "..." : ""}
                        </p>
                      )}

                      {course.prerequisites && course.prerequisites.length > 0 && (
                        <div className="flex items-center text-xs text-amber-700 bg-amber-50 px-2 py-1 rounded">
                          <span className="mr-1">📋</span>
                          <span>Prerequisites required</span>
                        </div>
                      )}

                      {course.attributes && course.attributes.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {course.attributes.slice(0, 2).map(attr => (
                            <Badge key={attr} variant="outline" className="text-xs px-2 py-0">
                              🏷️ {attr}
                            </Badge>
                          ))}
                          {course.attributes.length > 2 && (
                            <Badge variant="outline" className="text-xs px-2 py-0">
                              +{course.attributes.length - 2} more
                            </Badge>
                          )}
                        </div>
                      )}

                      {(!course.sections || course.sections.length === 0) && (
                        <div className="flex items-center text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded">
                          <span className="mr-1">ℹ️</span>
                          <span>Not currently offered</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="absolute top-2 right-2 flex flex-col gap-1">
                    <Button
                      size="sm"
                      variant={isComparing ? "destructive" : "outline"}
                      className="text-xs h-7 px-2.5" /* Increased padding slightly */
                      onClick={(e) => { e.stopPropagation(); handleToggleCompare(course); }}
                    >
                      {isComparing ? <Minus className="h-3 w-3 mr-1"/> : <Plus className="h-3 w-3 mr-1"/>}
                      <span className="hidden sm:inline">{isComparing ? 'Remove' : 'Compare'}</span>
                    </Button>
                  </div>
                </div>
              );
            })}
            {filteredCourses.length === 0 && (
              <div className="md:col-span-2 lg:col-span-3 text-center py-12">
                <div className="max-w-md mx-auto">
                  <span className="text-6xl mb-4 block">🔍</span>
                  <h3 className="text-lg font-medium text-gray-700 mb-2">No classes found</h3>
                  <p className="text-gray-500 mb-4">
                    We couldn't find any classes that match your search. Here are some things to try:
                  </p>
                  <div className="text-left space-y-2 text-sm text-gray-600">
                    <div>• Try a broader search term (like "math" instead of "calculus")</div>
                    <div>• Remove some filters to see more options</div>
                    <div>• Check if you spelled everything correctly</div>
                    <div>• Try searching for the subject area instead of specific class names</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Desktop Selected Course Detail Panel */}
        {!isMobile && selectedCourse && (
          <div id="course-detail-view" className="hidden md:block w-full lg:w-1/3 p-4 border rounded-lg bg-white shadow-xl sticky top-24 max-h-[calc(100vh-120px)] overflow-y-auto transition-all duration-300 ease-in-out animate-slide-in-right">
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <h3 className="text-xl font-bold text-primary mb-1">{selectedCourse.code}</h3>
                <h4 className="text-lg font-semibold text-gray-700">{selectedCourse.name}</h4>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => setSelectedCourse(null)} variant="ghost" size="icon" className="h-7 w-7">
                  <XIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="space-y-1 text-sm mb-3">
              <p><strong>Credits:</strong> {selectedCourse.credits}</p>
              <p><strong>Subject:</strong> {selectedCourse.department || 'N/A'}</p>
              {selectedCourse.college && <p><strong>College:</strong> {selectedCourse.college}</p>}
              {selectedCourse.campus && <p><strong>Campus:</strong> {selectedCourse.campus}</p>}
              {selectedCourse.courseCareer && <p><strong>Course Career:</strong> {selectedCourse.courseCareer}</p>}
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
                <div className="space-y-1"> {/* Changed from flex flex-wrap to space-y for block layout */}
                  {selectedCourse.prerequisites.map(prereqCode => {
                    const prereqCourseDetails = mockCourses.find(c => c.code === prereqCode || c.id === prereqCode);
                    return (
                      <div key={prereqCode} className="mb-1"> {/* Wrapper for each prerequisite and its sub-prereqs */}
                        <Badge
                          variant="secondary"
                          className="text-xs cursor-pointer hover:bg-blue-100 hover:text-blue-700 py-0.5 px-1.5"
                          onClick={() => { if (prereqCourseDetails) setSelectedCourse(prereqCourseDetails); }}
                        >
                          {prereqCode}{prereqCourseDetails ? ` - ${prereqCourseDetails.name.substring(0,25)}${prereqCourseDetails.name.length > 25 ? '...' : ''}` : ''}
                        </Badge>
                        {prereqCourseDetails && prereqCourseDetails.prerequisites && prereqCourseDetails.prerequisites.length > 0 && (
                          <div className="text-xs text-gray-500 ml-4 pl-2 border-l border-gray-300 mt-0.5">
                            Requires: {prereqCourseDetails.prerequisites.join(', ')}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            {(selectedCourse.corequisites && selectedCourse.corequisites.length > 0) && (
              <div className="mb-3">
                <h5 className="font-semibold text-sm mb-1 text-gray-600">Corequisites</h5>
                 <div className="space-y-1"> {/* Changed from flex flex-wrap to space-y for block layout */}
                  {selectedCourse.corequisites.map(coreqCode => {
                    const coreqCourseDetails = mockCourses.find(c => c.code === coreqCode || c.id === coreqCode);
                    return (
                      <div key={coreqCode} className="mb-1"> {/* Wrapper for each corequisite and its sub-prereqs */}
                        <Badge
                          variant="secondary"
                          className="text-xs cursor-pointer hover:bg-blue-100 hover:text-blue-700 py-0.5 px-1.5"
                          onClick={() => { if (coreqCourseDetails) setSelectedCourse(coreqCourseDetails); }}
                        >
                          {coreqCode}{coreqCourseDetails ? ` - ${coreqCourseDetails.name.substring(0,25)}${coreqCourseDetails.name.length > 25 ? '...' : ''}` : ''}
                        </Badge>
                        {coreqCourseDetails && coreqCourseDetails.prerequisites && coreqCourseDetails.prerequisites.length > 0 && (
                          <div className="text-xs text-gray-500 ml-4 pl-2 border-l border-gray-300 mt-0.5">
                            (Prerequisites for this corequisite: {coreqCourseDetails.prerequisites.join(', ')})
                          </div>
                        )}
                      </div>
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
                        <div className="flex gap-1">
                          {section.sectionType && section.sectionType !== 'Standard' && <Badge variant="secondary" className="text-[10px] py-0 px-1">{section.sectionType}</Badge>}
                          {section.classStatus && <Badge variant={section.classStatus === 'Open' ? 'default' : section.classStatus === 'Closed' ? 'destructive' : 'secondary'} className="text-[10px] py-0 px-1">{section.classStatus}</Badge>}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-1 mb-2">
                        <p className="text-gray-600"><Users className="inline h-3 w-3 mr-1 text-gray-400"/> {section.instructor || 'Staff'}</p>
                        {section.term && <p className="text-gray-600"><CalendarDays className="inline h-3 w-3 mr-1 text-gray-400"/> Term: {section.term}</p>}
                        {section.campus && <p className="text-gray-600"><MapPin className="inline h-3 w-3 mr-1 text-gray-400"/> Campus: {section.campus}</p>}
                        {section.instructionMode && <p className="text-gray-600"><Info className="inline h-3 w-3 mr-1 text-gray-400"/> Mode: {section.instructionMode}</p>}
                        {section.academicSession && <p className="text-gray-600"><CalendarDays className="inline h-3 w-3 mr-1 text-gray-400"/> Session: {section.academicSession}</p>}
                        {section.component && <p className="text-gray-600"><Info className="inline h-3 w-3 mr-1 text-gray-400"/> Component: {section.component}</p>}
                        {section.classStartDate && <p className="text-gray-600"><CalendarDays className="inline h-3 w-3 mr-1 text-gray-400"/> Dates: {section.classStartDate}{section.classEndDate ? ` - ${section.classEndDate}` : ''}</p>}
                      </div>

                      <div className="border-t pt-1 mt-1">
                        <p className="font-medium text-gray-700 mb-1">Schedule:</p>
                        {section.schedule.map((s, idx) => (
                          <div key={`${section.id}-schedule-${idx}`} className="ml-2">
                             <p className="text-gray-600">• {s.days}: {s.startTime}-{s.endTime}</p>
                             <p className="text-gray-600 ml-2"><MapPin className="inline h-3 w-3 mr-1 text-gray-400"/> {s.location || section.location || 'TBD'}</p>
                          </div>
                        ))}
                      </div>

                      <div className="flex justify-between items-center mt-2 pt-1 border-t text-gray-500">
                        <span>Seats: {section.availableSeats}/{section.maxSeats}</span>
                        {section.waitlistCount !== undefined && <span>Waitlist: {section.waitlistCount}</span>}
                      </div>

                      {/* Additional Information Sections */}
                      {section.courseControls && (
                        <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded">
                          <p className="text-[11px] font-medium text-blue-800">Course Controls:</p>
                          <p className="text-[11px] text-blue-700">{section.courseControls}</p>
                        </div>
                      )}

                      {section.enrollmentRequirements && (
                        <div className="mt-2 p-2 bg-orange-50 border border-orange-200 rounded">
                          <p className="text-[11px] font-medium text-orange-800">Enrollment Requirements:</p>
                          <p className="text-[11px] text-orange-700">{section.enrollmentRequirements}</p>
                        </div>
                      )}

                      {section.additionalInformation && (
                        <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded">
                          <p className="text-[11px] font-medium text-green-800">Additional Information:</p>
                          <p className="text-[11px] text-green-700">{section.additionalInformation}</p>
                        </div>
                      )}

                      {section.notes && <p className="text-[11px] text-amber-700 mt-2 italic"><Info className="inline h-3 w-3 mr-0.5"/> {section.notes}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}
            {(!selectedCourse.sections || selectedCourse.sections.length === 0) && (
                <p className="text-xs text-gray-400 italic mt-3 pt-3 border-t">No sections listed for this course.</p>
            )}

            {/* Embedded Course Sequence View */}
            {/* <EmbeddedCourseSequenceView
              targetCourse={selectedCourse}
              allCourses={mockCourses}
              onCourseSelect={setSelectedCourse}
            /> */}
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
                  <Button variant="destructive" size="sm" className="mt-1 w-full text-xs" onClick={() => handleToggleCompare(course)}>
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

      {/* Course Details Bottom Sheet (Mobile) */}
      {actionSheetCourse && (
        <Drawer open={isCourseActionSheetOpen} onOpenChange={setIsCourseActionSheetOpen}>
          <DrawerContent className="max-h-[90vh] flex flex-col">
            <DrawerHeader className="text-left flex-shrink-0">
              <DrawerTitle>{actionSheetCourse.code} - {actionSheetCourse.name}</DrawerTitle>
              <DrawerDescription>{actionSheetCourse.credits} credits • {actionSheetCourse.department}</DrawerDescription>
            </DrawerHeader>

            {/* Scrollable Course Details */}
            <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-3">
              <div className="space-y-1 text-sm">
                <p><strong>Credits:</strong> {actionSheetCourse.credits}</p>
                <p><strong>Subject:</strong> {actionSheetCourse.department || 'N/A'}</p>
                {actionSheetCourse.college && <p><strong>College:</strong> {actionSheetCourse.college}</p>}
                {actionSheetCourse.campus && <p><strong>Campus:</strong> {actionSheetCourse.campus}</p>}
                {actionSheetCourse.courseCareer && <p><strong>Course Career:</strong> {actionSheetCourse.courseCareer}</p>}
              </div>

              {actionSheetCourse.description && (
                <div>
                  <h5 className="font-semibold text-sm mb-0.5 text-gray-600">Description</h5>
                  <p className="text-xs text-gray-500 whitespace-pre-wrap">{actionSheetCourse.description}</p>
                </div>
              )}

              {(actionSheetCourse.prerequisites && actionSheetCourse.prerequisites.length > 0) && (
                <div>
                  <h5 className="font-semibold text-sm mb-1 text-gray-600">Prerequisites</h5>
                  <div className="space-y-1">
                    {actionSheetCourse.prerequisites.map(prereqCode => {
                      const prereqCourseDetails = mockCourses.find(c => c.code === prereqCode || c.id === prereqCode);
                      return (
                        <div key={`mobile-drawer-prereq-${prereqCode}`}>
                          <Badge variant="secondary" className="text-xs py-0.5 px-1.5">
                            {prereqCode}{prereqCourseDetails ? ` - ${prereqCourseDetails.name.substring(0,25)}${prereqCourseDetails.name.length > 25 ? '...' : ''}` : ''}
                          </Badge>
                          {prereqCourseDetails && prereqCourseDetails.prerequisites && prereqCourseDetails.prerequisites.length > 0 && (
                            <div className="text-xs text-gray-500 ml-4 pl-2 border-l border-gray-300 mt-0.5">
                              Requires: {prereqCourseDetails.prerequisites.join(', ')}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {(actionSheetCourse.corequisites && actionSheetCourse.corequisites.length > 0) && (
                <div>
                  <h5 className="font-semibold text-sm mb-1 text-gray-600">Corequisites</h5>
                  <div className="space-y-1">
                    {actionSheetCourse.corequisites.map(coreqCode => {
                      const coreqCourseDetails = mockCourses.find(c => c.code === coreqCode || c.id === coreqCode);
                      return (
                        <div key={`mobile-drawer-coreq-${coreqCode}`}>
                          <Badge variant="secondary" className="text-xs py-0.5 px-1.5">
                            {coreqCode}{coreqCourseDetails ? ` - ${coreqCourseDetails.name.substring(0,25)}${coreqCourseDetails.name.length > 25 ? '...' : ''}` : ''}
                          </Badge>
                          {coreqCourseDetails && coreqCourseDetails.prerequisites && coreqCourseDetails.prerequisites.length > 0 && (
                            <div className="text-xs text-gray-500 ml-4 pl-2 border-l border-gray-300 mt-0.5">
                              (Prerequisites for this corequisite: {coreqCourseDetails.prerequisites.join(', ')})
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {actionSheetCourse.attributes && actionSheetCourse.attributes.length > 0 && (
                <div>
                  <h5 className="font-semibold text-sm mb-1 text-gray-600">Attributes</h5>
                  <div className="flex flex-wrap gap-1">
                    {actionSheetCourse.attributes.map(attr => <Badge key={attr} variant="outline" className="text-xs">{attr}</Badge>)}
                  </div>
                </div>
              )}

              {actionSheetCourse.keywords && actionSheetCourse.keywords.length > 0 && (
                <div>
                  <h5 className="font-semibold text-sm mb-1 text-gray-600">Keywords</h5>
                  <div className="flex flex-wrap gap-1">
                    {actionSheetCourse.keywords.map(kw => <Badge key={kw} variant="outline" className="text-xs">{kw}</Badge>)}
                  </div>
                </div>
              )}

              {actionSheetCourse.sections && actionSheetCourse.sections.length > 0 && (
                <div>
                  <h5 className="font-semibold text-sm mb-2 text-gray-600 pt-2 border-t">Available Sections</h5>
                  <div className="space-y-3">
                    {actionSheetCourse.sections.map((section: CourseSection) => (
                      <div key={`mobile-drawer-section-${section.id}`} className="p-2.5 border rounded-md bg-gray-50/70 text-xs leading-snug">
                        <div className="flex justify-between items-center mb-1">
                          <p className="font-medium text-gray-800">Section {section.sectionNumber} <span className="text-gray-500">(CRN: {section.crn})</span></p>
                          <div className="flex gap-1">
                            {section.sectionType && section.sectionType !== 'Standard' && <Badge variant="secondary" className="text-[10px] py-0 px-1">{section.sectionType}</Badge>}
                            {section.classStatus && <Badge variant={section.classStatus === 'Open' ? 'default' : section.classStatus === 'Closed' ? 'destructive' : 'secondary'} className="text-[10px] py-0 px-1">{section.classStatus}</Badge>}
                          </div>
                        </div>
                        <div className="grid grid-cols-1 gap-1 mb-2">
                          <p className="text-gray-600"><Users className="inline h-3 w-3 mr-1 text-gray-400"/> {section.instructor || 'Staff'}</p>
                          {section.term && <p className="text-gray-600"><CalendarDays className="inline h-3 w-3 mr-1 text-gray-400"/> Term: {section.term}</p>}
                          {section.campus && <p className="text-gray-600"><MapPin className="inline h-3 w-3 mr-1 text-gray-400"/> Campus: {section.campus}</p>}
                          {section.instructionMode && <p className="text-gray-600"><Info className="inline h-3 w-3 mr-1 text-gray-400"/> Mode: {section.instructionMode}</p>}
                          {section.academicSession && <p className="text-gray-600"><CalendarDays className="inline h-3 w-3 mr-1 text-gray-400"/> Session: {section.academicSession}</p>}
                          {section.component && <p className="text-gray-600"><Info className="inline h-3 w-3 mr-1 text-gray-400"/> Component: {section.component}</p>}
                          {section.classStartDate && <p className="text-gray-600"><CalendarDays className="inline h-3 w-3 mr-1 text-gray-400"/> Dates: {section.classStartDate}{section.classEndDate ? ` - ${section.classEndDate}` : ''}</p>}
                        </div>
                        <div className="border-t pt-1 mt-1">
                          <p className="font-medium text-gray-700 mb-1">Schedule:</p>
                          {section.schedule.map((s, idx) => (
                            <div key={`mobile-drawer-${section.id}-schedule-${idx}`} className="ml-2">
                               <p className="text-gray-600">• {s.days}: {s.startTime}-{s.endTime}</p>
                               <p className="text-gray-600 ml-2"><MapPin className="inline h-3 w-3 mr-1 text-gray-400"/> {s.location || section.location || 'TBD'}</p>
                            </div>
                          ))}
                        </div>
                        <div className="flex justify-between items-center mt-2 pt-1 border-t text-gray-500">
                          <span>Seats: {section.availableSeats}/{section.maxSeats}</span>
                          {section.waitlistCount !== undefined && <span>Waitlist: {section.waitlistCount}</span>}
                        </div>
                        {section.courseControls && (<div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded"><p className="text-[11px] font-medium text-blue-800">Course Controls:</p><p className="text-[11px] text-blue-700">{section.courseControls}</p></div>)}
                        {section.enrollmentRequirements && (<div className="mt-2 p-2 bg-orange-50 border border-orange-200 rounded"><p className="text-[11px] font-medium text-orange-800">Enrollment Requirements:</p><p className="text-[11px] text-orange-700">{section.enrollmentRequirements}</p></div>)}
                        {section.additionalInformation && (<div className="mt-2 p-2 bg-green-50 border border-green-200 rounded"><p className="text-[11px] font-medium text-green-800">Additional Information:</p><p className="text-[11px] text-green-700">{section.additionalInformation}</p></div>)}
                        {section.notes && <p className="text-[11px] text-amber-700 mt-2 italic"><Info className="inline h-3 w-3 mr-0.5"/> {section.notes}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {(!actionSheetCourse.sections || actionSheetCourse.sections.length === 0) && (
                  <p className="text-xs text-gray-400 italic mt-3 pt-3 border-t">No sections listed for this course.</p>
              )}
            </div>

            {/* Action Buttons at Bottom */}
            <DrawerFooter className="flex-shrink-0 pt-2 space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => {
                  handleToggleCompare(actionSheetCourse);
                  setIsCourseActionSheetOpen(false);
                }}
              >
                {coursesToCompare.find(c => c.id === actionSheetCourse.id) ? <Minus className="h-4 w-4 mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                {coursesToCompare.find(c => c.id === actionSheetCourse.id) ? 'Remove from Compare' : 'Add to Compare'}
              </Button>
              <DrawerClose asChild>
                <Button variant="outline">Close</Button>
              </DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      )}

      {/* Course Details Bottom Sheet (Mobile) */}
      <CourseDetailBottomSheet
        open={isCourseDetailBottomSheetOpen}
        onOpenChange={setIsCourseDetailBottomSheetOpen}
        course={selectedCourseForDetail}
      />
    </div>
  );
};

export default CourseCatalogView;
