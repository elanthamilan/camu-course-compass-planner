import {
  StudentInfo,
  Degree, // Still used by old calculateDegreeAudit
  DegreeRequirement,
  DegreeRequirementAudit,
  DegreeAuditResults,
  DegreeAuditRuleStatus,
  Course,
  AcademicProgram // Added for new function
} from "./types";
// import { mockCourses } from "./mock-data"; // Commenting out: allCourses should be passed as param

/**
 * Helper function to find a course by its ID or code from a list of courses.
 * @param courseIdentifier - The ID or code of the course to find.
 * @param allCourses - An array of Course objects to search within.
 * @returns The Course object if found, otherwise undefined.
 */
export const getCourseByIdOrCode = (courseIdentifier: string, allCourses: Course[]): Course | undefined => {
  return allCourses.find(course => course.id === courseIdentifier || course.code === courseIdentifier);
};

export const calculateDegreeAudit = (
  studentInfo: StudentInfo,
  degree: Degree, // Old function uses Degree type
  allCourses: Course[]
): DegreeAuditResults => {
  const requirementAudits: DegreeRequirementAudit[] = [];
  let totalCreditsEarned = 0;

  const uniqueCompletedCourseIds = Array.from(new Set(studentInfo.completedCourses));
  uniqueCompletedCourseIds.forEach(courseIdOrCode => {
    const course = getCourseByIdOrCode(courseIdOrCode, allCourses);
    if (course) {
      totalCreditsEarned += course.credits;
    }
  });

  // This part might be problematic if DegreeRequirement structure changed too much.
  // The old DegreeRequirement had `courses: string[]` and `completed: boolean`.
  // The new one (used by AcademicProgram) might not have these in the same way.
  // For now, leaving the logic as is, assuming types.ts still supports this for Degree.
  degree.requirements.forEach(requirement => {
    const fulfilledCourses: string[] = [];
    let progressCredits = 0;
    let progressCourses = 0;
    let status: DegreeAuditRuleStatus = 'not_fulfilled';
    
    // This assumes requirement.courses is a list of specific course codes
    const requirementCourseList = (requirement as any).courses || []; // Temp fix if .courses was removed

    requirementCourseList.forEach((reqCourseIdOrCode: string) => {
      if (studentInfo.completedCourses.includes(reqCourseIdOrCode)) {
        const course = getCourseByIdOrCode(reqCourseIdOrCode, allCourses);
        if (course) {
          fulfilledCourses.push(course.code);
          progressCredits += course.credits;
          progressCourses++;
        }
      }
    });
    
    if (requirement.choiceRequired && requirement.choiceRequired > 0 && fulfilledCourses.length > 0) {
        let tempCreditsForChoice = 0;
        const sortedFulfilledCoursesForChoice = [...fulfilledCourses]; 
        for(let i = 0; i < Math.min(requirement.choiceRequired, sortedFulfilledCoursesForChoice.length); i++) {
            const course = getCourseByIdOrCode(sortedFulfilledCoursesForChoice[i], allCourses);
            if(course) tempCreditsForChoice += course.credits;
        }
    }

    const creditsMet = progressCredits >= requirement.requiredCredits;
    const coursesMet = requirement.choiceRequired ? progressCourses >= requirement.choiceRequired : true;

    if (creditsMet && coursesMet) {
      status = 'fulfilled';
    } else if (progressCredits > 0 || progressCourses > 0) {
      status = 'partially_fulfilled';
    } else {
      status = 'not_fulfilled';
    }
    
    if (status !== 'fulfilled' && studentInfo.currentCourses) {
        const currentlyTakingRequired = requirementCourseList.some((reqCourseId: string) => 
            studentInfo.currentCourses?.includes(reqCourseId) && !fulfilledCourses.includes(reqCourseId)
        );
        if (currentlyTakingRequired) {
            status = 'in_progress';
        }
    }

    requirementAudits.push({
      ...requirement,
      status,
      fulfilledCourses,
      progressCredits,
      progressCourses: requirement.choiceRequired ? progressCourses : undefined, 
    });
  });

  const overallProgress = degree.totalCredits > 0 ? totalCreditsEarned / degree.totalCredits : 0;

  const summaryNotes: string[] = [];
  const fulfilledCount = requirementAudits.filter(r => r.status === 'fulfilled').length;
  const inProgressCount = requirementAudits.filter(r => r.status === 'in_progress').length;
  const notFulfilledCount = requirementAudits.filter(r => r.status === 'not_fulfilled' || r.status === 'partially_fulfilled').length;

  summaryNotes.push(`Overall degree progress: ${Math.round(overallProgress * 100)}%.`);
  summaryNotes.push(`${fulfilledCount} requirement(s) fully met.`);
  if (inProgressCount > 0) summaryNotes.push(`${inProgressCount} requirement(s) in progress.`);
  if (notFulfilledCount > 0) summaryNotes.push(`${notFulfilledCount} requirement(s) pending or partially met.`);


  return {
    studentId: studentInfo.id,
    degreeId: degree.id,
    overallProgress,
    totalCreditsEarned,
    totalCreditsRequired: degree.totalCredits,
    requirementAudits,
    summaryNotes,
  };
};


// New function for "What-If" analysis
export function calculateWhatIfAudit(
  completedCourseCodes: string[], // Student's completed course codes, e.g., ["CS101", "MA201"]
  targetProgram: AcademicProgram,
  allMockCourses: Course[] // Full catalog to look up course details like credits, department etc.
): DegreeRequirement[] { // Returns an array of DegreeRequirement with calculated progress
  if (!targetProgram || !targetProgram.requirements) {
    return [];
  }

  const whatIfRequirements = targetProgram.requirements.map(req => {
    // Create a deep copy to avoid mutating original mock data's progress fields
    const newReq: DegreeRequirement = JSON.parse(JSON.stringify(req));
    newReq.progress = 0; // Reset progress for calculation
    newReq.progressCourses = 0; // Reset for choice requirements

    let accumulatedCredits = 0;
    // let coursesMatchedCount = 0; // Not directly used for progress calculation in the provided logic, but could be useful for display

    if (newReq.choiceCourses && newReq.choiceRequired && newReq.choiceRequired > 0) {
      // Handle "Choose X from Y" type requirements
      let count = 0;
      for (const choiceCode of newReq.choiceCourses) {
        if (completedCourseCodes.includes(choiceCode)) {
          count++;
          // Optionally, accumulate credits if these courses also contribute to a credit total for this specific requirement
          // const courseDetails = allMockCourses.find(c => c.code === choiceCode);
          // if (courseDetails) accumulatedCredits += courseDetails.credits;
        }
      }
      newReq.progressCourses = count;
      newReq.progress = Math.min(1, count / newReq.choiceRequired);
      // If progress for choice-based requirements should also consider credits, 
      // this logic would need adjustment. For now, it's purely count-based.

    } else if (newReq.courseMatcher) {
      // Handle requirements matched by course properties
      const { type, values } = newReq.courseMatcher;
      const matchingCatalogCourses = allMockCourses.filter(course => {
        if (completedCourseCodes.includes(course.code)) { // Only consider completed courses
          switch (type) {
            case "department":
              return values.includes(course.department || "");
            case "courseCodePrefix":
              return values.some(prefix => course.code.startsWith(prefix));
            case "keyword":
              return course.keywords && values.some(keyword => course.keywords!.includes(keyword));
            case "specificCourses":
              return values.includes(course.code);
            default:
              return false;
          }
        }
        return false;
      });

      accumulatedCredits = matchingCatalogCourses.reduce((sum, course) => sum + course.credits, 0);
      // coursesMatchedCount = matchingCatalogCourses.length;

      if (newReq.requiredCredits > 0) {
        newReq.progress = Math.min(1, accumulatedCredits / newReq.requiredCredits);
      } else {
        // If requiredCredits is 0, progress might be based on count (e.g. complete 1 specific course)
        if (type === "specificCourses" && values.length > 0) {
            const allSpecificMet = values.every(sc => completedCourseCodes.includes(sc));
            newReq.progress = allSpecificMet ? 1 : 0;
            if(allSpecificMet && newReq.choiceRequired && newReq.choiceRequired > 0) { // If it's also a choice (e.g. "complete ALL of these specific 2 courses")
                 newReq.progressCourses = values.filter(sc => completedCourseCodes.includes(sc)).length;
            } else if (allSpecificMet) {
                 newReq.progressCourses = values.length;
            }
        } else {
            newReq.progress = 0; // Default for zero-credit requirements without specific course list logic
        }
      }
      // Update progressCourses for courseMatcher type if choiceRequired is present
      if (newReq.choiceRequired && newReq.choiceRequired > 0) {
        // This counts how many of the *completed and matching* courses contribute to the choice count.
        // For example, if choice is "2 courses from department X", and student took 3, this counts 3.
        // The progress calculation then handles the Math.min(1, count / newReq.choiceRequired).
         newReq.progressCourses = matchingCatalogCourses.length;
         newReq.progress = Math.min(1, newReq.progressCourses / newReq.choiceRequired);
      }

    }
    return newReq;
  });

  return whatIfRequirements;
}
