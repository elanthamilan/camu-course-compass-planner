import {
  StudentInfo,
  Degree,
  DegreeRequirement,
  DegreeRequirementAudit,
  DegreeAuditResults,
  DegreeAuditRuleStatus,
  Course,
} from "./types";
import { mockCourses } from "./mock-data"; // Used as a fallback or for direct access if allCourses isn't passed

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
  degree: Degree,
  allCourses: Course[] // It's better to pass allCourses directly for flexibility
): DegreeAuditResults => {
  const requirementAudits: DegreeRequirementAudit[] = [];
  let totalCreditsEarned = 0;

  // Calculate total credits earned from all unique completed courses
  const uniqueCompletedCourseIds = Array.from(new Set(studentInfo.completedCourses));
  uniqueCompletedCourseIds.forEach(courseIdOrCode => {
    const course = getCourseByIdOrCode(courseIdOrCode, allCourses);
    if (course) {
      totalCreditsEarned += course.credits;
    }
  });

  degree.requirements.forEach(requirement => {
    const fulfilledCourses: string[] = [];
    let progressCredits = 0;
    let progressCourses = 0;
    let status: DegreeAuditRuleStatus = 'not_fulfilled';

    // Find fulfilled courses and calculate progress
    requirement.courses.forEach(reqCourseIdOrCode => {
      if (studentInfo.completedCourses.includes(reqCourseIdOrCode)) {
        const course = getCourseByIdOrCode(reqCourseIdOrCode, allCourses);
        if (course) {
          fulfilledCourses.push(course.code); // Store course code
          progressCredits += course.credits;
          progressCourses++;
        }
      }
    });
    
    // If the requirement is a choice (e.g., "choose 2 from list"),
    // progressCredits should only count from the chosen number of courses.
    // However, the current logic for 'fulfilledCourses' and 'progressCourses' already counts distinct completed courses from the list.
    // We need to ensure progressCredits doesn't exceed what's expected from choiceRequired.
    if (requirement.choiceRequired && requirement.choiceRequired > 0 && fulfilledCourses.length > 0) {
        // Recalculate progressCredits based on the *actual* courses fulfilling the choice, up to choiceRequired.
        // This assumes fulfilledCourses are the ones contributing. If more are completed than choiceRequired,
        // we might need a more sophisticated way to pick which ones count (e.g., highest credits),
        // but for now, we'll sum the credits of the first 'choiceRequired' fulfilled courses.
        let tempCreditsForChoice = 0;
        const sortedFulfilledCoursesForChoice = [...fulfilledCourses]; // Potentially sort by credits if needed later
        for(let i = 0; i < Math.min(requirement.choiceRequired, sortedFulfilledCoursesForChoice.length); i++) {
            const course = getCourseByIdOrCode(sortedFulfilledCoursesForChoice[i], allCourses);
            if(course) tempCreditsForChoice += course.credits;
        }
        // If actual credits from chosen courses are less than requiredCredits for the rule, use actual.
        // If requiredCredits for the rule is the target, this logic is tricky.
        // For now, progressCredits will be the sum of credits of courses taken that satisfy the choice.
        // The status check below will handle if enough *courses* were taken.
        // Let's ensure progressCredits reflects the sum of *actually taken and fulfilling* courses from the list.
        // The current `progressCredits` calculation is fine for this.
    }


    // Determine status
    const creditsMet = progressCredits >= requirement.requiredCredits;
    const coursesMet = requirement.choiceRequired ? progressCourses >= requirement.choiceRequired : true;

    if (creditsMet && coursesMet) {
      status = 'fulfilled';
    } else if (progressCredits > 0 || progressCourses > 0) {
      status = 'partially_fulfilled';
    } else {
      status = 'not_fulfilled';
    }
    
    // Handle 'in_progress' - if any of the required/choice courses are in studentInfo.currentCourses
    // This is a simplified check. A more robust check might involve ensuring they aren't also in completedCourses.
    if (status !== 'fulfilled' && studentInfo.currentCourses) {
        const currentlyTakingRequired = requirement.courses.some(reqCourseId => 
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
      progressCourses: requirement.choiceRequired ? progressCourses : undefined, // Only relevant if choiceRequired
    });
  });

  const overallProgress = degree.totalCredits > 0 ? totalCreditsEarned / degree.totalCredits : 0;

  // Basic summary notes
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
