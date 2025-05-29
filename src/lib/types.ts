
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
}

export interface CourseSection {
  id: string;
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
  major: string;
  minor?: string;
  academicLevel: 'Freshman' | 'Sophomore' | 'Junior' | 'Senior' | 'Graduate';
  totalCredits: number;
  requiredCredits: number;
  completedCourses: string[];
  currentCourses?: string[];
  advisorName?: string;
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
  description: string;
  requiredCredits: number;
  courses: string[];
  completed: boolean;
  progress: number;
  category?: 'core' | 'major' | 'elective' | 'concentration' | 'general_education' | 'other';
  choiceRequired?: number;
}

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
  timePreference: TimePreference;
  avoidFridayClasses: boolean;
  // Future preferences can be added here
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
