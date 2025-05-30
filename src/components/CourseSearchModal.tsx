import React, { useState } from "react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Plus, X } from "lucide-react";
import { mockCourses } from "@/lib/mock-data";
import { Course } from "@/lib/types";
import { toast } from "sonner";

interface CourseSearchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCourseSelected: (course: Course) => void;
  termId?: string | null;
}

const CourseSearchModal: React.FC<CourseSearchModalProps> = ({
  open,
  onOpenChange,
  onCourseSelected,
  termId
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("all");

  // Get unique departments
  const departments = Array.from(new Set(mockCourses.map(course => course.department).filter(Boolean)));

  // Filter courses
  const filteredCourses = mockCourses.filter(course => {
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
        <DrawerHeader>
          <DrawerTitle className="flex items-center">
            <Search className="h-5 w-5 mr-2" />
            Add Course {termId && `to ${termId}`}
          </DrawerTitle>
        </DrawerHeader>

        <div className="flex-1 flex flex-col space-y-4 px-4">
          {/* Search Controls */}
          <div className="flex gap-4">
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
          <div className="p-2 bg-gray-50 rounded-lg border">
            <p className="text-sm font-medium text-gray-700">
              {filteredCourses.length} courses found
            </p>
          </div>

          {/* Course List */}
          <div className="flex-1 overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredCourses.map((course) => (
                <div
                  key={course.id}
                  className="p-3 border rounded-lg shadow-sm bg-white hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-blue-600 mb-1">
                        {course.code}
                      </h3>
                      <h4 className="text-sm font-medium text-gray-700 leading-tight">
                        {course.name}
                      </h4>
                    </div>
                    <div className="text-right">
                      <Badge variant="secondary" className="text-xs mb-2">
                        {course.credits} credits
                      </Badge>
                      <div>
                        <Button
                          size="sm"
                          onClick={() => handleCourseSelect(course)}
                          className="w-full"
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Add
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center text-xs text-gray-600">
                      <span className="mr-3">📖 {course.department || 'General'}</span>
                      {course.sections && course.sections.length > 0 && (
                        <span>👥 {course.sections.length} section{course.sections.length !== 1 ? 's' : ''}</span>
                      )}
                    </div>

                    {course.description && (
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {course.description.substring(0, 120)}{course.description.length > 120 ? "..." : ""}
                      </p>
                    )}

                    {course.prerequisites && course.prerequisites.length > 0 && (
                      <div className="flex items-center text-xs text-amber-700 bg-amber-50 px-2 py-1 rounded">
                        <span className="mr-1">📋</span>
                        <span>Prerequisites: {course.prerequisites.join(', ')}</span>
                      </div>
                    )}
                  </div>
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

        <DrawerFooter>
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
