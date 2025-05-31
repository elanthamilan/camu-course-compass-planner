import React, { useState } from "react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Plus, X, ChevronDown, ChevronUp, CheckCircle, XCircle } from "lucide-react";
import { mockCourses as fallbackCourses } from "@/lib/mock-data"; // Renamed to avoid conflict
import { Course, StudentInfo } from "@/lib/types"; // Added StudentInfo
import { toast } from "sonner";
import { useSchedule } from "@/contexts/ScheduleContext"; // Import useSchedule
import { motion, AnimatePresence } from "framer-motion"; // For animations

interface CourseSearchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCourseSelected: (course: Course) => void;
  termId?: string | null;
}

/**
 * Modal component for searching and adding courses to the schedule planner.
 * Displays a list of courses that can be filtered by search term and department.
 * Allows viewing detailed information for each course, including prerequisite checks.
 */
const CourseSearchModal: React.FC<CourseSearchModalProps> = ({
  open,
  onOpenChange,
  onCourseSelected,
  termId
}) => {
  const { studentInfo, allCourses: contextCourses } = useSchedule(); // Get studentInfo and allCourses from context
  const coursesToSearch = contextCourses && contextCourses.length > 0 ? contextCourses : fallbackCourses; // Use context courses if available

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [expandedCourseId, setExpandedCourseId] = useState<string | null>(null); // State for expanded course

  const completedCourseCodes = studentInfo?.completedCourses || [];

  // Get unique departments from the courses being searched
  const departments = Array.from(new Set(coursesToSearch.map(course => course.department).filter(Boolean)));

  // Filter courses
  const filteredCourses = coursesToSearch.filter(course => {
    const matchesSearch = !searchTerm ||
      course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDepartment = selectedDepartment === "all" || course.department === selectedDepartment;

    return matchesSearch && matchesDepartment;
  });

  const handleCourseSelect = (course: Course) => {
    onCourseSelected(course);
    toast.success(`${course.code} added to your course list!`);
    // Don't close the modal - let users add multiple courses
  };

  const handleClose = () => {
    onOpenChange(false);
    // Reset search state when closing
    setSearchTerm("");
    setSelectedDepartment("all");
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="h-[90vh] max-w-6xl mx-auto flex flex-col">
        <DrawerHeader className="flex-shrink-0">
          <DrawerTitle className="flex items-center">
            <Search className="h-5 w-5 mr-2" />
            Add Course {termId && `to ${termId}`}
          </DrawerTitle>
        </DrawerHeader>

        <div className="flex-1 flex flex-col min-h-0 px-4">
          {/* Search Controls */}
          <div className="flex gap-4 mb-4 flex-shrink-0">
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Search courses by name, code, or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="w-48">
              <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                <SelectTrigger>
                  <SelectValue placeholder="Department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {departments.map(dept => (
                    <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Results Count */}
          <div className="p-2 bg-gray-50 rounded-lg border mb-4 flex-shrink-0">
            <p className="text-sm font-medium text-gray-700">
              {filteredCourses.length} courses found
              {filteredCourses.length > 6 && (
                <span className="text-xs text-gray-500 ml-2">• Scroll to see more</span>
              )}
            </p>
          </div>

          {/* Course List - Scrollable Area */}
          <div className="flex-1 overflow-y-auto min-h-0 pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400 scroll-smooth">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pb-4">
              {filteredCourses.map((course) => (
                <div
                  key={course.id}
                  className="p-3 border rounded-lg shadow-sm bg-white hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-1">
                      <h3 className="text-lg font-semibold text-blue-700">
                        {course.code} - <span className="font-normal">{course.name}</span>
                      </h3>
                      <div className="flex items-center text-xs text-gray-500 space-x-3">
                        <span><Badge variant="outline">{course.credits} credits</Badge></span>
                        <span>{course.department || 'N/A Dept.'}</span>
                        {course.sections && <span>{course.sections.length} section{course.sections.length !== 1 ? 's' : ''}</span>}
                      </div>
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                       <Button
                        size="sm"
                        onClick={() => handleCourseSelect(course)}
                        className="w-24"
                      >
                        <Plus className="h-4 w-4 mr-1.5" />
                        Add
                      </Button>
                       <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setExpandedCourseId(expandedCourseId === course.id ? null : course.id)}
                        className="w-24 text-blue-600 hover:text-blue-700"
                      >
                        {expandedCourseId === course.id ? <ChevronUp className="h-4 w-4 mr-1.5" /> : <ChevronDown className="h-4 w-4 mr-1.5" />}
                        Details
                      </Button>
                    </div>
                  </div>

                  <AnimatePresence>
                    {expandedCourseId === course.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="mt-3 pt-3 border-t border-gray-200 space-y-3"
                      >
                        <div>
                          <h5 className="text-xs font-semibold text-gray-700 mb-0.5">Description:</h5>
                          <p className="text-xs text-gray-600 leading-relaxed">
                            {course.description || "No description available."}
                          </p>
                        </div>

                        {course.prerequisites && course.prerequisites.length > 0 && (
                          <div>
                            <h5 className="text-xs font-semibold text-gray-700 mb-1">Prerequisites:</h5>
                            <div className="flex flex-wrap gap-1.5">
                              {course.prerequisites.map(prereq => {
                                const isMet = completedCourseCodes.includes(prereq);
                                return (
                                  <Badge key={prereq} variant={isMet ? "success" : "warning"} className="text-xs">
                                    {isMet ? <CheckCircle className="h-3 w-3 mr-1" /> : <XCircle className="h-3 w-3 mr-1" />}
                                    {prereq}
                                  </Badge>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {course.corequisites && course.corequisites.length > 0 && (
                          <div>
                            <h5 className="text-xs font-semibold text-gray-700 mb-1">Corequisites:</h5>
                            <div className="flex flex-wrap gap-1.5">
                              {course.corequisites.map(coreq => (
                                <Badge key={coreq} variant="outline" className="text-xs">{coreq}</Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                          <div>
                            <span className="font-semibold text-gray-700">Campus: </span>
                            <span className="text-gray-600">{course.campus || 'N/A'}</span>
                          </div>
                          <div>
                            <span className="font-semibold text-gray-700">College: </span>
                            <span className="text-gray-600">{course.college || 'N/A'}</span>
                          </div>
                        </div>

                        {course.attributes && course.attributes.length > 0 && (
                          <div>
                            <h5 className="text-xs font-semibold text-gray-700 mb-1">Attributes:</h5>
                            <div className="flex flex-wrap gap-1.5">
                              {course.attributes.map(attr => <Badge key={attr} variant="secondary" className="text-xs">{attr}</Badge>)}
                            </div>
                          </div>
                        )}

                        {course.keywords && course.keywords.length > 0 && (
                           <div>
                            <h5 className="text-xs font-semibold text-gray-700 mb-1">Keywords:</h5>
                            <div className="flex flex-wrap gap-1.5">
                              {course.keywords.map(keyword => <Badge key={keyword} variant="outline" className="text-xs">{keyword}</Badge>)}
                            </div>
                          </div>
                        )}

                        {course.sections && course.sections.length > 0 && (
                            <div>
                                <h5 className="text-xs font-semibold text-gray-700 mb-1">Section Types:</h5>
                                <p className="text-xs text-gray-600">
                                    {Array.from(new Set(course.sections.map(s => s.sectionType))).join(', ') || 'Standard'}
                                </p>
                            </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>

            {filteredCourses.length === 0 && (
              <div className="text-center py-12">
                <div className="max-w-md mx-auto">
                  <span className="text-6xl mb-4 block">🔍</span>
                  <h3 className="text-lg font-medium text-gray-700 mb-2">No courses found</h3>
                  <p className="text-gray-500 mb-4">
                    Try adjusting your search terms or filters.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <DrawerFooter className="flex-shrink-0 border-t bg-white">
          <Button variant="outline" onClick={handleClose}>
            <X className="h-4 w-4 mr-2" />
            Close
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default CourseSearchModal;
