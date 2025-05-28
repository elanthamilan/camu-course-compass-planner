import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import {
  Course,
  BusyTime,
  Schedule,
  CourseSection,
  Term,
  PreferenceSettings,
  StudentInfo,
  SchedulePreferences
} from "@/lib/types";
import { mockCourses, mockBusyTimes, mockSchedules, mockTerms, mockStudent } from "@/lib/mock-data";
import { toast } from "sonner";
import { 
  isSectionConflictWithBusyTimes, 
  isSectionConflictWithOtherSections 
} from "./ScheduleContextUtils"; // Import helpers

// Interface and defaultPreferences remain the same as before the shopping cart additions
interface ScheduleContextType {
  courses: Course[]; 
  busyTimes: BusyTime[];
  schedules: Schedule[]; 
  selectedSchedule: Schedule | null;
  currentTerm: Term | null;
  allTerms: Term[];
  studentInfo: StudentInfo;
  preferences: PreferenceSettings;
  schedulePreferences: SchedulePreferences;
  
  shoppingCart: Schedule | null; // Added shopping cart state
  
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
  
  generateSchedules: (selectedCourseIds: string[]) => void; 
  
  selectTerm: (termId: string) => void;
  updatePreferences: (newPreferences: Partial<PreferenceSettings>) => void;
  updateSchedulePreferences: (newPreferences: Partial<SchedulePreferences>) => void;
  
  addSectionToSchedule: (section: CourseSection) => void; 
  removeSectionFromSchedule: (sectionId: string) => void; 
  
  moveToCart: () => void; 
  clearCart: () => void; 
  compareSchedules: (scheduleIds: string[]) => void;

  selectedSectionMap: Record<string, string[] | 'all'>; 
  updateSelectedSectionMap: (courseId: string, selection: string[] | 'all') => void;
  excludeHonorsMap: Record<string, boolean>; 
  updateExcludeHonorsMap: (courseId: string, exclude: boolean) => void;
}

const defaultPreferences: PreferenceSettings = {
  preferredTimes: "anytime",
  preferredDays: ["M", "T", "W", "Th", "F"],
  preferredCampus: "main",
  preferredInstructionMode: "any",
  preferredDensity: "balanced"
};

const ScheduleContext = createContext<ScheduleContextType | undefined>(undefined);
const MAX_SCHEDULES_TO_GENERATE = 5; 

export const ScheduleProvider = ({ children }: { children: ReactNode }) => {
  const [courses, setCourses] = useState<Course[]>(mockCourses.slice(0,3)); 
  const [busyTimes, setBusyTimes] = useState<BusyTime[]>(mockBusyTimes);
  const [schedules, setSchedules] = useState<Schedule[]>(mockSchedules);
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(mockSchedules.length > 0 ? mockSchedules[0] : null);
  const [_allTerms, _setAllTerms] = useState<Term[]>(mockTerms);
  const [currentTerm, setCurrentTerm] = useState<Term | null>(mockTerms[0]);
  const [_studentInfo, _setStudentInfo] = useState<StudentInfo>(mockStudent);
  const [preferences, setPreferences] = useState<PreferenceSettings>(defaultPreferences);
  const [schedulePreferences, setSchedulePreferences] = useState<SchedulePreferences>({
    timePreference: "none",
    avoidFridayClasses: false,
  });

  const [selectedSectionMap, setSelectedSectionMapState] = useState<Record<string, string[] | 'all'>>({});
  const [excludeHonorsMap, setExcludeHonorsMapState] = useState<Record<string, boolean>>({});
  const [shoppingCart, setShoppingCart] = useState<Schedule | null>(null);

  useEffect(() => {
    const newSectionMap: Record<string, string[] | 'all'> = {};
    const newExcludeHonorsMap: Record<string, boolean> = {};
    courses.forEach(course => {
      newSectionMap[course.id] = selectedSectionMap[course.id] || 'all'; 
      newExcludeHonorsMap[course.id] = excludeHonorsMap[course.id] || false; 
    });
    setSelectedSectionMapState(newSectionMap);
    setExcludeHonorsMapState(newExcludeHonorsMap);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courses]); 

  const updateSelectedSectionMap = (courseId: string, selection: string[] | 'all') => {
    setSelectedSectionMapState(prev => ({ ...prev, [courseId]: selection }));
  };

  const updateExcludeHonorsMap = (courseId: string, exclude: boolean) => {
    setExcludeHonorsMapState(prev => ({ ...prev, [courseId]: exclude }));
  };
  
  const addCourse = (course: Course) => {
    setCourses(prevCourses => {
      if (prevCourses.find(c => c.id === course.id)) {
        toast.info(`${course.code} is already in your selected courses for planning.`);
        return prevCourses;
      }
      updateSelectedSectionMap(course.id, 'all'); 
      updateExcludeHonorsMap(course.id, false);   
      toast.success(`Added ${course.code}: ${course.name} to your course list for planning.`);
      return [...prevCourses, course];
    });
  };

  const removeCourse = (courseId: string) => {
    setCourses(prevCourses => {
      const courseToRemove = prevCourses.find(c => c.id === courseId);
      if (!courseToRemove) return prevCourses;
      setSelectedSectionMapState(prevMap => {
        const newMap = { ...prevMap };
        delete newMap[courseId];
        return newMap;
      });
      setExcludeHonorsMapState(prevMap => {
        const newMap = { ...prevMap };
        delete newMap[courseId];
        return newMap;
      });
      toast.success(`Removed ${courseToRemove.code}: ${courseToRemove.name} from your course list.`);
      return prevCourses.filter(course => course.id !== courseId);
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
      const updatedBusyTimes = prev.map(bt => bt.id === busyTime.id ? busyTime : bt);
      toast.success(`Updated busy time: ${busyTime.title}`);
      return updatedBusyTimes;
    });
  };

  const removeBusyTime = (busyTimeId: string) => {
    setBusyTimes(prev => {
      const busyTime = prev.find(b => b.id === busyTimeId);
      if (!busyTime) return prev;
      toast.success(`Removed busy time: ${busyTime.title}`);
      return prev.filter(bt => bt.id !== busyTimeId);
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
      return prev.filter(s => s.id !== scheduleId);
    });
  };

  const selectSchedule = (scheduleId: string | null) => {
    if (!scheduleId) {
      setSelectedSchedule(null);
      return;
    }
    const schedule = schedules.find(s => s.id === scheduleId);
    if (schedule) setSelectedSchedule(schedule);
  };

  const generateSchedules = (selectedCourseIds: string[]) => {
    toast.info("Generating schedules based on preferences...");

    if (!selectedCourseIds || selectedCourseIds.length === 0) {
      toast.error("No courses selected for schedule generation.");
      setSchedules([]); 
      setSelectedSchedule(null);
      return;
    }
    
    const coursesToSchedule = courses.filter(course => selectedCourseIds.includes(course.id));

    if (coursesToSchedule.length === 0) {
        toast.error("Selected courses are not in the current planning list.");
        setSchedules([]); 
        setSelectedSchedule(null);
        return;
    }

    const processedCourses = coursesToSchedule.map(course => {
      let availableSections = course.sections;
      if (excludeHonorsMap[course.id]) {
        availableSections = availableSections.filter(section => section.sectionType !== 'Honors');
      }
      const selection = selectedSectionMap[course.id];
      if (Array.isArray(selection)) {
        availableSections = availableSections.filter(section => selection.includes(section.id));
      }
      return { ...course, sections: availableSections };
    }).filter(course => course.sections.length > 0);

    if (processedCourses.length === 0) {
      toast.error("No courses with available sections after applying preferences.");
      setSchedules([]); 
      setSelectedSchedule(null);
      return;
    }
    if (processedCourses.length < coursesToSchedule.length) {
        toast.info("Some selected courses had no available sections after applying preferences and were excluded.");
    }

    const foundSchedules: Schedule[] = [];
    const coursesNotScheduled = new Set<string>(processedCourses.map(c => c.code));

    function buildSchedulesRecursive(courseIndex: number, currentSections: CourseSection[], generatedCount: number): number {
      if (generatedCount >= MAX_SCHEDULES_TO_GENERATE) {
        return generatedCount;
      }

      if (courseIndex === processedCourses.length) {
        const newSchedule: Schedule = {
          id: `gen-sched-${Date.now()}-${foundSchedules.length + 1}`,
          name: `Generated Schedule ${foundSchedules.length + 1} (${currentSections.length} courses)`,
          termId: currentTerm?.id || "",
          sections: [...currentSections], 
          busyTimes,
          totalCredits: currentSections.reduce((acc, section) => {
            const parentCourse = courses.find(c => c.id === section.id.split('-')[0]); 
            return acc + (parentCourse?.credits || 0);
          }, 0),
          conflicts: [] 
        };
        foundSchedules.push(newSchedule);
        currentSections.forEach(s => coursesNotScheduled.delete(s.id.split('-')[0].toUpperCase()));
        return generatedCount + 1;
      }

      const currentCourse = processedCourses[courseIndex];
      let newGeneratedCount = generatedCount;

      for (const section of currentCourse.sections) {
        if (isSectionConflictWithBusyTimes(section, busyTimes) || 
            isSectionConflictWithOtherSections(section, currentSections)) {
          continue; 
        }

        currentSections.push(section);
        newGeneratedCount = buildSchedulesRecursive(courseIndex + 1, currentSections, newGeneratedCount);
        currentSections.pop(); 

        if (newGeneratedCount >= MAX_SCHEDULES_TO_GENERATE) {
          break; 
        }
      }
      return newGeneratedCount;
    }

    setTimeout(() => {
      buildSchedulesRecursive(0, [], 0);
      if (foundSchedules.length > 0) {
        setSchedules(prev => [...prev.filter(s => !s.name.startsWith("Generated Schedule")), ...foundSchedules]);
        setSelectedSchedule(foundSchedules[0]);
        toast.success(`${foundSchedules.length} new schedule(s) generated!`);
        if (coursesNotScheduled.size > 0 && foundSchedules.length < MAX_SCHEDULES_TO_GENERATE) {
            toast.info(`Could not schedule all selected courses. Unable to place: ${Array.from(coursesNotScheduled).join(', ')}.`);
        }
      } else {
        toast.error("Could not generate any valid schedules with the current selections and constraints.");
        setSchedules(prev => prev.filter(s => !s.name.startsWith("Generated Schedule"))); 
        setSelectedSchedule(null);
      }
    }, 500);
  };

  const selectTerm = (termId: string) => {
    const term = _allTerms.find((t: Term) => t.id === termId);
    if (term) setCurrentTerm(term);
  };

  const updatePreferences = (newPreferences: Partial<PreferenceSettings>) => {
    setPreferences(prev => ({ ...prev, ...newPreferences }));
  };

  const updateSchedulePreferences = (newPreferences: Partial<SchedulePreferences>) => {
    setSchedulePreferences(prev => ({ ...prev, ...newPreferences }));
    toast.success("Schedule preferences updated!");
  };

  const addSectionToSchedule = (section: CourseSection) => {
    if (!selectedSchedule) {
        toast.error("No schedule selected to add section to.");
        return;
    }
    setSelectedSchedule(prev => {
      if (!prev) return null;
      const courseId = section.id.split('-')[0];
      const hasSectionForCourse = prev.sections.some(s => s.id.startsWith(`${courseId}-`));
      let updatedSections = prev.sections;
      if (hasSectionForCourse) {
        updatedSections = prev.sections.filter(s => !s.id.startsWith(`${courseId}-`));
      }
      const parentCourse = courses.find(c => c.id === courseId); 
      return {
        ...prev,
        sections: [...updatedSections, section],
        totalCredits: (prev.totalCredits - (parentCourse && hasSectionForCourse ? parentCourse.credits : 0)) + (parentCourse?.credits || 0)
      };
    });
  };

  const removeSectionFromSchedule = (sectionId: string) => {
    if (!selectedSchedule) return;
    setSelectedSchedule(prev => {
      if (!prev) return null;
      const courseId = sectionId.split('-')[0];
      const parentCourse = courses.find(c => c.id === courseId);
      return {
        ...prev,
        sections: prev.sections.filter(s => s.id !== sectionId),
        totalCredits: Math.max(0, prev.totalCredits - (parentCourse?.credits || 0))
      };
    });
  };

  const moveToCart = () => {
    if (!selectedSchedule) {
      toast.error("No schedule selected to move to cart.");
      return;
    }
    const scheduleCopy = JSON.parse(JSON.stringify(selectedSchedule));
    setShoppingCart(scheduleCopy);
    toast.success(`Schedule "${selectedSchedule.name}" moved to registration cart!`);
  };

  const clearCart = () => {
    setShoppingCart(null);
    toast.info("Shopping cart cleared.");
  };

  const compareSchedules = (scheduleIds: string[]) => {
    if (scheduleIds.length < 2) {
      toast.error("Please select at least two schedules to compare.");
      return;
    }
    toast.info(`Comparing ${scheduleIds.length} schedules.`);
  };

  return (
    <ScheduleContext.Provider
      value={{
        courses,
        busyTimes,
        schedules,
        selectedSchedule,
        currentTerm,
        allTerms: _allTerms,
        studentInfo: _studentInfo,
        preferences,
        schedulePreferences,
        shoppingCart, 
        selectedSectionMap,
        updateSelectedSectionMap,
        excludeHonorsMap,
        updateExcludeHonorsMap,
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
        updateSchedulePreferences,
        addSectionToSchedule,
        removeSectionFromSchedule,
        moveToCart, 
        clearCart,  
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
