
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Course, BusyTime, Schedule, CourseSection, Term, PreferenceSettings, StudentInfo } from "@/lib/types";
import { mockCourses, mockBusyTimes, mockSchedules, mockTerms, mockStudent } from "@/lib/mock-data";
import { toast } from "sonner";

interface ScheduleContextType {
  courses: Course[];
  busyTimes: BusyTime[];
  schedules: Schedule[];
  selectedSchedule: Schedule | null;
  currentTerm: Term | null;
  allTerms: Term[];
  studentInfo: StudentInfo;
  preferences: PreferenceSettings;
  setCourses: (courses: Course[]) => void;
  addCourse: (course: Course) => void;
  removeCourse: (courseId: string) => void;
  setBusyTimes: (busyTimes: BusyTime[]) => void;
  addBusyTime: (busyTime: BusyTime) => void;
  updateBusyTime: (busyTime: BusyTime) => void;
  removeBusyTime: (busyTimeId: string) => void;
  setSchedules: (schedules: Schedule[]) => void;
  addSchedule: (schedule: Schedule) => void;
  removeSchedule: (scheduleId: string) => void;
  selectSchedule: (scheduleId: string | null) => void;
  generateSchedules: () => void;
  selectTerm: (termId: string) => void;
  updatePreferences: (newPreferences: Partial<PreferenceSettings>) => void;
  addSectionToSchedule: (section: CourseSection) => void;
  removeSectionFromSchedule: (sectionId: string) => void;
  moveToCart: () => void;
  compareSchedules: (scheduleIds: string[]) => void;
}

const defaultPreferences: PreferenceSettings = {
  preferredTimes: "anytime",
  preferredDays: ["M", "T", "W", "Th", "F"],
  preferredCampus: "main",
  preferredInstructionMode: "any",
  preferredDensity: "balanced"
};

const ScheduleContext = createContext<ScheduleContextType | undefined>(undefined);

export const ScheduleProvider = ({ children }: { children: ReactNode }) => {
  const [courses, setCourses] = useState<Course[]>(mockCourses);
  const [busyTimes, setBusyTimes] = useState<BusyTime[]>(mockBusyTimes);
  const [schedules, setSchedules] = useState<Schedule[]>(mockSchedules);
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(mockSchedules[0]);
  const [allTerms, setAllTerms] = useState<Term[]>(mockTerms);
  const [currentTerm, setCurrentTerm] = useState<Term | null>(mockTerms[0]);
  const [studentInfo, setStudentInfo] = useState<StudentInfo>(mockStudent);
  const [preferences, setPreferences] = useState<PreferenceSettings>(defaultPreferences);
  
  const addCourse = (course: Course) => {
    setCourses(prev => {
      const exists = prev.find(c => c.id === course.id);
      if (exists) return prev;
      
      toast.success(`Added ${course.code}: ${course.name}`);
      return [...prev, course];
    });
  };

  const removeCourse = (courseId: string) => {
    setCourses(prev => {
      const course = prev.find(c => c.id === courseId);
      if (!course) return prev;
      
      toast.success(`Removed ${course.code}: ${course.name}`);
      return prev.filter(course => course.id !== courseId);
    });
  };

  const addBusyTime = (busyTime: BusyTime) => {
    setBusyTimes(prev => {
      toast.success(`Added busy time: ${busyTime.title}`);
      return [...prev, busyTime];
    });
  };

  const updateBusyTime = (busyTime: BusyTime) => {
    setBusyTimes(prev => {
      const updatedBusyTimes = prev.map(bt => 
        bt.id === busyTime.id ? busyTime : bt
      );
      
      toast.success(`Updated busy time: ${busyTime.title}`);
      return updatedBusyTimes;
    });
  };

  const removeBusyTime = (busyTimeId: string) => {
    setBusyTimes(prev => {
      const busyTime = prev.find(b => b.id === busyTimeId);
      if (!busyTime) return prev;
      
      toast.success(`Removed busy time: ${busyTime.title}`);
      return prev.filter(busyTime => busyTime.id !== busyTimeId);
    });
  };

  const addSchedule = (schedule: Schedule) => {
    setSchedules(prev => [...prev, schedule]);
    toast.success(`Created schedule: ${schedule.name}`);
  };

  const removeSchedule = (scheduleId: string) => {
    setSchedules(prev => {
      const schedule = prev.find(s => s.id === scheduleId);
      if (!schedule) return prev;
      
      toast.success(`Removed schedule: ${schedule.name}`);
      return prev.filter(schedule => schedule.id !== scheduleId);
    });
  };

  const selectSchedule = (scheduleId: string | null) => {
    if (!scheduleId) {
      setSelectedSchedule(null);
      return;
    }
    
    const schedule = schedules.find(s => s.id === scheduleId);
    if (schedule) {
      setSelectedSchedule(schedule);
    }
  };

  const generateSchedules = () => {
    // In a real app, this would be a complex algorithm
    // For now, we'll just simulate generating two different schedules
    
    toast.info("Generating schedules...");
    
    setTimeout(() => {
      const newSchedules = [
        {
          id: `sched-${Date.now()}-1`,
          name: "Generated Schedule 1",
          termId: currentTerm?.id || "",
          sections: courses.slice(0, 3).map(c => c.sections[0]),
          busyTimes,
          totalCredits: courses.slice(0, 3).reduce((acc, c) => acc + c.credits, 0),
          conflicts: []
        },
        {
          id: `sched-${Date.now()}-2`,
          name: "Generated Schedule 2",
          termId: currentTerm?.id || "",
          sections: courses.slice(0, 3).map(c => c.sections.length > 1 ? c.sections[1] : c.sections[0]),
          busyTimes,
          totalCredits: courses.slice(0, 3).reduce((acc, c) => acc + c.credits, 0),
          conflicts: []
        }
      ];
      
      setSchedules(prev => [...prev, ...newSchedules]);
      setSelectedSchedule(newSchedules[0]);
      toast.success("Generated schedules successfully");
    }, 1500);
  };

  const selectTerm = (termId: string) => {
    const term = allTerms.find(t => t.id === termId);
    if (term) {
      setCurrentTerm(term);
    }
  };

  const updatePreferences = (newPreferences: Partial<PreferenceSettings>) => {
    setPreferences(prev => ({
      ...prev,
      ...newPreferences
    }));
  };

  const addSectionToSchedule = (section: CourseSection) => {
    if (!selectedSchedule) return;
    
    setSelectedSchedule(prev => {
      if (!prev) return null;
      
      // Check if we already have a section for this course
      const courseId = section.id.split('-')[0];
      const hasSectionForCourse = prev.sections.some(s => s.id.startsWith(`${courseId}-`));
      
      if (hasSectionForCourse) {
        // Replace the existing section
        const updatedSections = prev.sections.filter(s => !s.id.startsWith(`${courseId}-`));
        return {
          ...prev,
          sections: [...updatedSections, section],
        };
      }
      
      return {
        ...prev,
        sections: [...prev.sections, section],
        totalCredits: prev.totalCredits + (courses.find(c => c.id === courseId)?.credits || 0)
      };
    });
  };

  const removeSectionFromSchedule = (sectionId: string) => {
    if (!selectedSchedule) return;
    
    setSelectedSchedule(prev => {
      if (!prev) return null;
      
      const courseId = sectionId.split('-')[0];
      const courseCredits = courses.find(c => c.id === courseId)?.credits || 0;
      
      return {
        ...prev,
        sections: prev.sections.filter(s => s.id !== sectionId),
        totalCredits: Math.max(0, prev.totalCredits - courseCredits)
      };
    });
  };

  const moveToCart = () => {
    if (!selectedSchedule) {
      toast.error("No schedule selected");
      return;
    }
    
    // In a real app, this would interact with a registration API
    toast.success("Schedule moved to registration cart successfully!");
  };

  const compareSchedules = (scheduleIds: string[]) => {
    if (scheduleIds.length < 2) {
      toast.error("Please select at least two schedules to compare");
      return;
    }
    
    // In a real app, this would show a comparison UI
    toast.info(`Comparing ${scheduleIds.length} schedules`);
  };

  return (
    <ScheduleContext.Provider
      value={{
        courses,
        busyTimes,
        schedules,
        selectedSchedule,
        currentTerm,
        allTerms,
        studentInfo,
        preferences,
        setCourses,
        addCourse,
        removeCourse,
        setBusyTimes,
        addBusyTime,
        updateBusyTime,
        removeBusyTime,
        setSchedules,
        addSchedule,
        removeSchedule,
        selectSchedule,
        generateSchedules,
        selectTerm,
        updatePreferences,
        addSectionToSchedule,
        removeSectionFromSchedule,
        moveToCart,
        compareSchedules
      }}
    >
      {children}
    </ScheduleContext.Provider>
  );
};

export const useSchedule = () => {
  const context = useContext(ScheduleContext);
  if (context === undefined) {
    throw new Error("useSchedule must be used within a ScheduleProvider");
  }
  return context;
};
