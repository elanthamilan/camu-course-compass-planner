
export interface Course {
  id: string;
  code: string;
  name: string;
  credits: number;
  prerequisites?: string[];
  corequisites?: string[];
  description?: string;
  sections: CourseSection[];
  department: string;
  color?: string;
  attributes?: string[]; // Added for course attributes
  keywords?: string[]; // For courseMatcher type "keyword"
  // New fields for enhanced filtering
  campus?: string;
  college?: string;
  courseCareer?: 'Undergraduate' | 'Graduate' | 'Professional';
}

export interface CourseSection {
  id: string;
  courseId: string; // Added to ensure every section knows its parent course
  crn: string;
  instructor: string;
  schedule: SectionSchedule[];
  location: string;
  maxSeats: number;
  availableSeats: number;
  waitlistCount?: number;
  sectionNumber: string;
  locked?: boolean; // Added for lock status
  sectionType?: 'Honors' | 'Lab' | 'Standard'; // Added for special section types
  // New fields for enhanced filtering
  term?: string;
  campus?: string;
  courseCareer?: 'Undergraduate' | 'Graduate' | 'Professional';
  classStatus?: 'Open' | 'Closed' | 'Waitlist' | 'Cancelled';
  instructionMode?: 'In-Person' | 'Online' | 'Hybrid' | 'Synchronous Online' | 'Asynchronous Online';
  academicSession?: 'Full Term' | 'First Half' | 'Second Half' | 'Summer Session I' | 'Summer Session II' | 'Regular Academic Session';
  classStartDate?: string;
  classEndDate?: string;
  component?: 'LEC' | 'LAB' | 'SEM' | 'REC' | 'STU' | 'IND';
  courseControls?: string;
  enrollmentRequirements?: string;
  additionalInformation?: string;
  notes?: string;
}

export interface SectionSchedule {
  days: string;
  startTime: string;
  endTime: string;
  location: string;
}

export interface BusyTime {
  id: string;
  title: string;
  days: string[];
  startTime: string;
  endTime: string;
  type: BusyTimeType;
  color?: string;
}

export type BusyTimeType =
  | 'work'
  | 'study'
  | 'personal'
  | 'event'
  | 'meeting'
  | 'class'
  | 'reminder'
  | 'other';

export interface StudentInfo {
  id: string;
  name: string;
  major: string; // This might become majorId to link to AcademicProgram
  majorId?: string; // Links to AcademicProgram id
  minor?: string; // This might become minorId
  minorId?: string; // Links to AcademicProgram id, optional
  gpa?: number;
  expectedGraduationDate?: string; // e.g., "May 2025"
  interests?: string[];
  academicLevel: 'Freshman' | 'Sophomore' | 'Junior' | 'Senior' | 'Graduate';
  totalCredits: number;
  requiredCredits: number; // This might be derived from the primary AcademicProgram
  completedCourses: string[];
  currentCourses?: string[];
  advisorName?: string;
}

export interface AcademicProgram {
  id: string; // e.g., "bs-cs", "minor-arthistory"
  name: string; // e.g., "Bachelor of Science in Computer Science"
  type: 'Major' | 'Minor';
  requirements: DegreeRequirement[];
  totalCreditsRequired?: number;
  description?: string; // Optional: for a brief overview of the program
}

export interface Term {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  registrationStartDate: Date;
  registrationEndDate: Date;
  courses: Course[];
}

export interface Schedule {
  id: string;
  name: string;
  termId: string;
  sections: CourseSection[];
  busyTimes: BusyTime[];
  totalCredits: number;
  conflicts?: ScheduleConflict[];
}

export interface ScheduleConflict {
  type: 'time' | 'prerequisite' | 'corequisite';
  description: string;
  courses?: string[];
  severity: 'warning' | 'error';
}

export interface DegreeRequirement {
  id: string;
  name: string;
  description?: string; // Optional: for more details about the requirement
  requiredCredits: number;
  // courses: string[]; // Removed in favor of choiceCourses or specific courseMatcher
  // completed: boolean; // To be calculated dynamically
  progress: number; // This will be dynamically calculated for "what-if"
  // category?: 'core' | 'major' | 'elective' | 'concentration' | 'general_education' | 'other'; // Removed for now, can be added if needed for display logic
  choiceRequired?: number;
  choiceCourses?: string[]; // Specific list of course codes if it's a "choose X from list Y" type
  courseMatcher?: { // Used for broader category requirements, e.g. "3 credits from ARTS"
    type: "department" | "courseCodePrefix" | "keyword" | "specificCourses";
    values: string[];
  };
  progressCourses?: number; // How many courses have been completed towards choiceRequired
}

// The Degree interface might be deprecated or merged into AcademicProgram if AcademicProgram covers all needs.
// For now, keeping it separate if it's used elsewhere, but AcademicProgram is the focus for "What-If".
export interface Degree {
  id: string;
  name: string;
  totalCredits: number;
  requirements: DegreeRequirement[];
}

export interface PreferenceSettings {
  preferredTimes: 'morning' | 'afternoon' | 'evening' | 'anytime';
  preferredDays: string[];
  preferredCampus?: string;
  preferredInstructionMode?: 'in-person' | 'online' | 'hybrid' | 'any';
  preferredDensity: 'compact' | 'balanced' | 'spread';
}

export interface AIRecommendation {
  type: 'course' | 'schedule' | 'timing' | 'balance';
  title: string;
  description: string;
  courses?: Course[];
  schedule?: Schedule;
}

// Types for User Scheduling Preferences
export type TimePreference = "none" | "morning" | "afternoon" | "evening";

export interface SchedulePreferences {
  timePreference: TimePreference; // "none", "morning", "afternoon", "evening"
  avoidFridayClasses: boolean;
  avoidBackToBack?: boolean;         // New
  dayDistribution?: "spread" | "compact" | "none"; // New
}

// Degree Audit Enhancements
export type DegreeAuditRuleStatus = 'fulfilled' | 'partially_fulfilled' | 'not_fulfilled' | 'in_progress';

export interface DegreeRequirementAudit extends DegreeRequirement {
  status: DegreeAuditRuleStatus;
  fulfilledCourses?: string[]; // Course codes that fulfilled this
  progressCredits?: number; // Credits achieved for this specific requirement
  progressCourses?: number; // Number of courses achieved for a 'choiceRequired'
}

export interface DegreeAuditResults {
  studentId: string;
  degreeId: string;
  overallProgress: number; // Percentage, 0-1
  totalCreditsEarned: number;
  totalCreditsRequired: number;
  requirementAudits: DegreeRequirementAudit[];
  summaryNotes?: string[]; // e.g., "All core requirements met.", "3 electives still needed."
}

// Multi-Year Planning Enhancements
export interface PlannedCourse {
  courseId: string; // Course code
  termId: string;   // ID of the term it's planned for
}

// Specific type for items in mockMandatoryCourses
export interface MandatoryCourseEntry {
  code: string;
  name: string;
  status: "Completed" | "In Progress" | "Not Started";
  credits?: number; // Optional for now, but good to have
  prerequisites?: string[]; // Optional
}

export interface MultiYearPlan {
  id: string;
  studentId: string;
  degreeId: string;
  planName: string;
  plannedCourses: PlannedCourse[];
}

// Sharing Schedules Enhancements
export interface ExportedScheduleSection {
  id: string; // section id
  courseId: string; // parent course id/code
  crn?: string;
  // Essential schedule details like days, times, location can be added later if needed
}

export interface ExportedSchedule {
  version: string; // To handle format changes later
  name: string;
  termId: string;
  exportedSections: { courseId: string, sectionId: string }[]; // Simplified for now
  totalCredits: number;
}
