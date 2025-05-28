
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
