import React, { useEffect, useState } from 'react';
import { Course } from '../../lib/types';
import { mockCourses } from '../../lib/mock-data'; // Assuming allCourses might be passed or used as fallback
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/atoms/dialog';
import { DialogFooter } from '@/components/atoms/dialog';
import { Badge } from '@/components/atoms/badge';
import { Button } from '@/components/atoms/button';
import { Network } from 'lucide-react'; // For potential use later

// Define the structure for a node in the prerequisite tree
export interface CourseNode {
  course: Partial<Course> & { id: string; code?: string }; // Course can be partial if missing
  prerequisites: CourseNode[];
  isCircular?: boolean;
  isMissing?: boolean; // Flag if the course details couldn't be found
}

interface PrerequisiteGraphProps {
  courseId: string | null;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  allCourses: Course[]; // Pass all courses to avoid relying on global mockCourses directly in helper
  embedded?: boolean; // New prop for embedded mode
}

// Helper function to find a course by its ID or code
const getCourseByIdOrCode = (identifier: string, courses: Course[]): Course | undefined => {
  return courses.find(course => course.id === identifier || course.code === identifier);
};

// Recursive function to build the prerequisite tree
const buildPrerequisiteTree = (
  courseId: string,
  allCourses: Course[],
  visited: Set<string> = new Set()
): CourseNode | null => {
  if (visited.has(courseId)) {
    const course = getCourseByIdOrCode(courseId, allCourses);
    // If course is found but already visited, mark as circular.
    // If not found, it will be handled by the block below.
    return course
      ? { course: { ...course, id: courseId, code: course.code || courseId }, prerequisites: [], isCircular: true }
      : { course: { id: courseId, code: courseId }, prerequisites: [], isMissing: true, isCircular: true }; // Circular and missing
  }

  const course = getCourseByIdOrCode(courseId, allCourses);
  if (!course) {
    // Course not found, mark as missing
    return { course: { id: courseId, code: courseId }, prerequisites: [], isMissing: true };
  }

  visited.add(courseId); // Add current course to visited set for this path

  const prerequisites: CourseNode[] = (course.prerequisites || [])
    .map(prereqId => buildPrerequisiteTree(prereqId, allCourses, new Set(visited))) // Pass a new Set for each branch
    .filter(node => node !== null) as CourseNode[];

  // visited.delete(courseId); // Remove from visited when backtracking (not strictly necessary with new Set per branch)

  return { course, prerequisites };
};

const PrerequisiteGraph: React.FC<PrerequisiteGraphProps> = ({
  courseId,
  isOpen,
  onOpenChange,
  allCourses,
  embedded = false,
}) => {
  const [prerequisiteTreeData, setPrerequisiteTreeData] = useState<CourseNode | null>(null);
  const [targetCourse, setTargetCourse] = useState<Course | null>(null);

  useEffect(() => {
    if (isOpen && courseId) {
      const tree = buildPrerequisiteTree(courseId, allCourses, new Set());
      setPrerequisiteTreeData(tree);
      setTargetCourse(getCourseByIdOrCode(courseId, allCourses) || null);
    } else {
      setPrerequisiteTreeData(null); // Reset when closed or no courseId
      setTargetCourse(null);
    }
  }, [isOpen, courseId, allCourses]);

  const renderTreeNode = (node: CourseNode, level = 0): JSX.Element => (
    <li key={node.course.id + (node.isCircular ? '-circ' : '') + (node.isMissing ? '-miss' : '')} style={{ marginLeft: `${level * 20}px` }} className="mt-1">
      <div className="flex items-center">
        <Badge
          variant={node.isCircular ? "destructive" : (node.isMissing ? "outline" : "secondary")}
          className="whitespace-nowrap"
        >
          {node.course.code || node.course.id}
        </Badge>
        <span className="ml-2 text-sm">{node.course.name || (node.isMissing ? 'Course data unavailable' : '')}</span>
        {node.isCircular && <span className="ml-2 text-xs text-red-500">(Circular)</span>}
        {node.isMissing && !node.isCircular && <span className="ml-2 text-xs text-yellow-600">(Missing Data)</span>}
      </div>
      {node.prerequisites.length > 0 && (
        <ul className="pl-4 border-l border-gray-300 mt-1">
          {node.prerequisites.map(prereqNode => renderTreeNode(prereqNode, level + 1))}
        </ul>
      )}
    </li>
  );

  if (!isOpen && !embedded) { // Only render dialog if isOpen is true, unless embedded
    return null;
  }

  const content = (
    <div className="overflow-y-auto pr-2 py-4">
      {prerequisiteTreeData ? (
        <ul className="space-y-1">
          {renderTreeNode(prerequisiteTreeData, 0)}
        </ul>
      ) : (
        <p className="text-sm text-gray-500 text-center py-4">
          {targetCourse ? `No prerequisite information found for ${targetCourse.code}, or it has no prerequisites.` : (courseId ? `Loading or course data not found for ${courseId}.` : 'No course selected.')}
        </p>
      )}
    </div>
  );

  if (embedded) {
    return content;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Network className="h-5 w-5 mr-2" />
            Prerequisite Tree for: {targetCourse?.name || courseId} ({targetCourse?.code || ''})
          </DialogTitle>
          <DialogDescription>
            This tree shows the prerequisites for the selected course. Circular dependencies and missing course data are highlighted.
          </DialogDescription>
        </DialogHeader>
        {content}
        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PrerequisiteGraph;
