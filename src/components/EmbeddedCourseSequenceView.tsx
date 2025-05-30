import React, { useEffect, useState } from 'react';
import { Course } from '../lib/types';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, ChevronDown, ChevronRight } from 'lucide-react'; // Chevron icons for potential future expansion

// Updated structure for a node in the sequence tree
export interface CourseNode {
  course: Partial<Course> & { id: string; code?: string };
  prerequisites: CourseNode[];
  corequisites: CourseNode[]; // Added corequisites
  nodeType: 'root' | 'prerequisite' | 'corequisite'; // Type of the node
  isCircular?: boolean;
  isMissing?: boolean;
}

interface EmbeddedCourseSequenceViewProps {
  targetCourse: Course;
  allCourses: Course[];
  onCourseSelect: (course: Course) => void;
}

const getCourseByIdOrCode = (identifier: string, courses: Course[]): Course | undefined => {
  return courses.find(course => course.id === identifier || course.code === identifier);
};

// Renamed and updated function to build the full course sequence tree
const buildCourseSequenceTree = (
  courseId: string,
  allCourses: Course[],
  visited: Set<string> = new Set(),
  currentNodeType: 'root' | 'prerequisite' | 'corequisite'
): CourseNode | null => {
  if (visited.has(courseId + '-' + currentNodeType)) { // Include nodeType in visited key to allow same course as prereq and coreq
    const course = getCourseByIdOrCode(courseId, allCourses);
    return course
      ? { course: { ...course, id: courseId, code: course.code || courseId }, prerequisites: [], corequisites: [], nodeType: currentNodeType, isCircular: true }
      : { course: { id: courseId, code: courseId }, prerequisites: [], corequisites: [], nodeType: currentNodeType, isMissing: true, isCircular: true };
  }

  const course = getCourseByIdOrCode(courseId, allCourses);
  if (!course) {
    return { course: { id: courseId, code: courseId }, prerequisites: [], corequisites: [], nodeType: currentNodeType, isMissing: true };
  }

  visited.add(courseId + '-' + currentNodeType);

  const prerequisites: CourseNode[] = (course.prerequisites || [])
    .map(prereqId => buildCourseSequenceTree(prereqId, allCourses, new Set(visited), 'prerequisite'))
    .filter(node => node !== null) as CourseNode[];

  const corequisites: CourseNode[] = (course.corequisites || [])
    .map(coreqId => buildCourseSequenceTree(coreqId, allCourses, new Set(visited), 'corequisite'))
    .filter(node => node !== null) as CourseNode[];
  
  return { course, prerequisites, corequisites, nodeType: currentNodeType };
};

const EmbeddedCourseSequenceView: React.FC<EmbeddedCourseSequenceViewProps> = ({
  targetCourse,
  allCourses,
  onCourseSelect,
}) => {
  const [sequenceTreeData, setSequenceTreeData] = useState<CourseNode | null>(null);

  useEffect(() => {
    if (targetCourse) {
      // Initial call for the target course is 'root'
      const tree = buildCourseSequenceTree(targetCourse.id, allCourses, new Set(), 'root');
      setSequenceTreeData(tree);
    } else {
      setSequenceTreeData(null);
    }
  }, [targetCourse, allCourses]);

  // Renamed render function
  const renderSequenceNode = (node: CourseNode, level = 0): JSX.Element => (
    <li key={`${node.course.id}-${node.nodeType}-${level}`} className={`ml-${level * 2} mt-1 list-none`}> {/* Base margin, ensure list-none if default styles interfere */}
      <div className="flex items-center group mb-0.5">
        <Badge
          variant={node.isCircular ? "destructive" : (node.isMissing ? "destructive_outline" : 
                    node.nodeType === 'corequisite' ? 'info_outline' : 'secondary')}
          className="text-xs cursor-pointer hover:opacity-80 py-0.5 px-1.5 whitespace-nowrap"
          onClick={(e) => {
            e.stopPropagation();
            const fullCourse = getCourseByIdOrCode(node.course.id, allCourses);
            if (fullCourse && !node.isMissing) onCourseSelect(fullCourse);
          }}
        >
          {node.course.code || node.course.id}
           {node.nodeType === 'corequisite' && <span className="ml-1 font-normal">(Coreq)</span>}
        </Badge>
        <span 
            className={`ml-1.5 text-xs ${node.isMissing ? 'text-gray-400 italic' : 'text-gray-700'} ${!node.isMissing ? 'cursor-pointer hover:underline' : ''}`}
            onClick={(e) => {
                e.stopPropagation();
                const fullCourse = getCourseByIdOrCode(node.course.id, allCourses);
                if (fullCourse && !node.isMissing) onCourseSelect(fullCourse);
            }}
        >
            {node.course.name || (node.isMissing ? 'Course data unavailable' : '')}
        </span>
        {node.isCircular && <AlertTriangle className="h-3.5 w-3.5 ml-1.5 text-red-500 flex-shrink-0" titleAccess="Circular dependency"/>}
        {node.isMissing && !node.isCircular && <AlertTriangle className="h-3.5 w-3.5 ml-1.5 text-yellow-600 flex-shrink-0" titleAccess="Missing course data"/>}
      </div>

      {node.prerequisites && node.prerequisites.length > 0 && (
        <div className="mt-0.5">
          {/* <p className="text-[10px] font-semibold text-gray-500 ml-2">Requires:</p> */}
          <ul className="pl-3 border-l border-gray-300 ml-2"> {/* Indent sub-list */}
            {node.prerequisites.map(prereqNode => renderSequenceNode(prereqNode, level + 1))}
          </ul>
        </div>
      )}

      {node.corequisites && node.corequisites.length > 0 && (
        <div className="mt-0.5">
          <p className="text-[11px] font-medium text-blue-600 ml-2 mt-1">Must be taken with:</p>
          <ul className="pl-3 border-l border-blue-300 ml-2"> {/* Indent sub-list, different border color */}
            {node.corequisites.map(coreqNode => renderSequenceNode(coreqNode, level + 1))}
          </ul>
        </div>
      )}
    </li>
  );
  
  if (!targetCourse) {
    return <p className="text-xs text-gray-500">No course selected for sequence view.</p>;
  }
  
  const hasPrerequisites = sequenceTreeData && sequenceTreeData.prerequisites && sequenceTreeData.prerequisites.length > 0;
  const hasCorequisites = sequenceTreeData && sequenceTreeData.corequisites && sequenceTreeData.corequisites.length > 0;

  return (
    <div className="mt-4 pt-3 border-t">
      <h4 className="text-md font-semibold mb-2 text-gray-700">Course Sequence for {targetCourse.code}:</h4>
      {sequenceTreeData && (hasPrerequisites || hasCorequisites) ? (
        <ul className="space-y-0.5">
          {/* Render prerequisites of the root/target course */}
          {hasPrerequisites && sequenceTreeData.prerequisites.map(prereqNode => renderSequenceNode(prereqNode, 0))}
          {/* Render corequisites of the root/target course */}
          {hasCorequisites && (
            <>
              {hasPrerequisites && <li className="list-none pt-1"></li>} {/* Spacer if both exist */}
              <p className="text-[11px] font-medium text-blue-600 mt-1">Must be taken with (corequisites):</p>
              {sequenceTreeData.corequisites.map(coreqNode => renderSequenceNode(coreqNode, 0))}
            </>
          )}
        </ul>
      ) : (
        <p className="text-xs text-gray-500">
          {targetCourse.code} has no listed prerequisites or corequisites.
        </p>
      )}
    </div>
  );
};

export default EmbeddedCourseSequenceView;
