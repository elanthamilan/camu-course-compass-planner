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

/**
 * Filters courses based on selected IDs, fixed sections, and user preferences.
 * @param allCourses All available courses.
 * @param selectedCourseIds IDs of courses selected by the user.
 * @param fixedSections Sections that are already locked in the schedule.
 * @param excludeHonorsMap Map indicating if honors sections should be excluded for a course.
 * @param selectedSectionMap Map indicating specific sections selected for a course.
 * @returns An object containing lists of eligible courses for scheduling,
 *          courses that are schedulable after applying all filters, and IDs of fixed courses.
 */
const filterEligibleCourses = (
  allCourses: Course[],
  selectedCourseIds: string[],
  fixedSections: CourseSection[],
  excludeHonorsMap: Record<string, boolean>,
  selectedSectionMap: Record<string, string[] | 'all'>
): { eligibleCoursesForScheduling: Course[], schedulableCourses: Course[], fixedCourseIds: string[] } => {
  const fixedCourseIds = fixedSections.map(section => section.id.split('-')[0]);

  // Filter out courses that are already covered by fixedSections from the initial selection
  const eligibleCoursesForScheduling = allCourses.filter(course =>
    selectedCourseIds.includes(course.id) && !fixedCourseIds.includes(course.id)
  );

  // Further process the eligible courses to apply section-specific preferences
  const schedulableCourses = eligibleCoursesForScheduling.map(course => {
    let availableSections = course.sections;
    // Filter out honors sections if excluded
    if (excludeHonorsMap[course.id]) {
      availableSections = availableSections.filter(section => section.sectionType !== 'Honors');
    }
    // Filter based on specific section selections
    const selection = selectedSectionMap[course.id];
    if (Array.isArray(selection)) {
      availableSections = availableSections.filter(section => selection.includes(section.id));
    }
    return { ...course, sections: availableSections };
  }).filter(course => course.sections.length > 0); // Only include courses that still have sections after filtering

  return { eligibleCoursesForScheduling, schedulableCourses, fixedCourseIds };
};

// Interface and defaultPreferences remain the same as before the shopping cart additions

/**
 * Recursively builds schedules by trying to fit sections of schedulable courses
 * without conflicts.
 * @param courseIndex Current index in the `schedulableCourses` array.
 * @param currentScheduleSections Accumulator for sections in the currently forming schedule.
 * @param generatedSchedulesCount Counter for how many schedules have been generated.
 * @param schedulableCourses Array of courses to try scheduling.
 * @param fixedSections Array of pre-selected, fixed sections.
 * @param foundSchedules Array to store successfully generated schedules.
 * @param courses The global list of all courses (used for credit/code lookup).
 * @param busyTimes User's defined busy times.
 * @param MAX_SCHEDULES_TO_GENERATE Maximum number of schedules to create.
 * @param coursesNotScheduled Set of course codes that are yet to be scheduled.
 * @param initialFixedSectionsCount The number of sections that were fixed from the start.
 * @returns The updated count of generated schedules.
 */
const recursivelyBuildSchedules = (
  courseIndex: number,
  currentScheduleSections: CourseSection[],
  generatedSchedulesCount: number,
  schedulableCourses: Course[],
  foundSchedules: Schedule[],
  allCourses: Course[],
  currentTermId: string | undefined,
  busyTimes: BusyTime[],
  MAX_SCHEDULES_TO_GENERATE: number,
  coursesNotScheduled: Set<string>,
  initialFixedSectionsCount: number
): number => {
  // Stop if the maximum number of schedules to generate has been reached
  if (generatedSchedulesCount >= MAX_SCHEDULES_TO_GENERATE) {
    return generatedSchedulesCount;
  }

  // Base case: all schedulable courses have been considered
  if (courseIndex === schedulableCourses.length) {
    const finalSections = [...currentScheduleSections];

    // Base Case Condition:
    // If there were courses intended to be scheduled (schedulableCourses.length > 0),
    // then a valid generated schedule must contain more sections than the initial fixed sections.
    // This ensures that at least one course from `schedulableCourses` was actually added.
    if (schedulableCourses.length > 0 && finalSections.length <= initialFixedSectionsCount) {
        return generatedSchedulesCount; // Not a valid new schedule combination
    }
    // Also, if there were no schedulable courses and no fixed sections, don't save an empty schedule.
    if (schedulableCourses.length === 0 && initialFixedSectionsCount === 0 && finalSections.length === 0) {
        return generatedSchedulesCount;
    }
    const newSchedule: Schedule = {
      id: `gen-sched-${Date.now()}-${foundSchedules.length + 1}`,
      name: `Generated Schedule ${foundSchedules.length + 1} (${finalSections.length} courses)`,
      termId: currentTermId || "",
      sections: finalSections,
      busyTimes,
      totalCredits: finalSections.reduce((acc, section) => {
        const parentCourse = allCourses.find(c => c.id === section.id.split('-')[0]);
        return acc + (parentCourse?.credits || 0);
      }, 0),
      conflicts: []
    };
    foundSchedules.push(newSchedule);

    finalSections.forEach(s => {
      const courseCode = allCourses.find(c => c.id === s.id.split('-')[0])?.code;
      if (courseCode) coursesNotScheduled.delete(courseCode);
    });
    return generatedSchedulesCount + 1;
  }

  const currentCourse = schedulableCourses[courseIndex];
  let newGeneratedSchedulesCount = generatedSchedulesCount;

  if (!currentCourse) {
    return newGeneratedSchedulesCount;
  }

  let courseWasScheduledInThisPath = false;
  for (const section of currentCourse.sections) {
    if (isSectionConflictWithBusyTimes(section, busyTimes) ||
        isSectionConflictWithOtherSections(section, currentScheduleSections)) {
      continue;
    }

    currentScheduleSections.push(section);
    courseWasScheduledInThisPath = true;
    newGeneratedSchedulesCount = recursivelyBuildSchedules(
      courseIndex + 1,
      currentScheduleSections,
      newGeneratedSchedulesCount,
      schedulableCourses,
      foundSchedules,
      allCourses,
      currentTermId,
      busyTimes,
      MAX_SCHEDULES_TO_GENERATE,
      coursesNotScheduled,
      initialFixedSectionsCount
    );
    currentScheduleSections.pop(); // Backtrack

    if (newGeneratedSchedulesCount >= MAX_SCHEDULES_TO_GENERATE) {
      break;
    }
  }

  // If no section of the current course could be scheduled,
  // try to build schedules with the remaining courses.
  if (!courseWasScheduledInThisPath) {
     newGeneratedSchedulesCount = recursivelyBuildSchedules(
      courseIndex + 1,
      currentScheduleSections,
      newGeneratedSchedulesCount,
      schedulableCourses,
      foundSchedules,
      allCourses,
      currentTermId,
      busyTimes,
      MAX_SCHEDULES_TO_GENERATE,
      coursesNotScheduled,
      initialFixedSectionsCount
    );
  }
  return newGeneratedSchedulesCount;
};


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

  shoppingCart: Schedule[]; // Changed to array for multiple schedules

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

  generateSchedules: (selectedCourseIds: string[], fixedSections?: CourseSection[]) => void;

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
  const [courses, setCourses] = useState<Course[]>(mockCourses.slice(0,8)); // Load 8 courses as user prefers
  const [busyTimes, setBusyTimes] = useState<BusyTime[]>(mockBusyTimes);
  const [schedules, setSchedules] = useState<Schedule[]>([]); // Start with empty schedules for proper generation
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);
  const [_allTerms, _setAllTerms] = useState<Term[]>(mockTerms);
  const [currentTerm, setCurrentTerm] = useState<Term | null>(mockTerms[0]);
  const [_studentInfo, _setStudentInfo] = useState<StudentInfo>(mockStudent); // User-specific info
  const [preferences, setPreferences] = useState<PreferenceSettings>(defaultPreferences); // General app/UI preferences
  const [schedulePreferences, setSchedulePreferences] = useState<SchedulePreferences>({ // Preferences specific to schedule generation
    timePreference: "none",
    avoidFridayClasses: false,
    avoidBackToBack: false,       // New default
    dayDistribution: "none",    // New default
  });

  const [selectedSectionMap, setSelectedSectionMapState] = useState<Record<string, string[] | 'all'>>({});
  const [excludeHonorsMap, setExcludeHonorsMapState] = useState<Record<string, boolean>>({});
  // Initialize with 2 default schedules in cart
  const [shoppingCart, setShoppingCart] = useState<Schedule[]>([
    {
      id: "cart-schedule-1",
      name: "Morning Focus Schedule",
      termId: "fall2024",
      sections: mockSchedules[0]?.sections || [],
      busyTimes: [],
      totalCredits: 15,
      conflicts: []
    },
    {
      id: "cart-schedule-2",
      name: "Balanced Day Schedule",
      termId: "fall2024",
      sections: mockSchedules[1]?.sections || [],
      busyTimes: [],
      totalCredits: 16,
      conflicts: []
    }
  ]);

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
  }, [courses]); // efecto para inicializar/actualizar los mapas cuando cambian los cursos

  /** Updates the map that stores user's specific section choices for a course. */
  const updateSelectedSectionMap = (courseId: string, selection: string[] | 'all') => {
    setSelectedSectionMapState(prev => ({ ...prev, [courseId]: selection }));
    // toast.info(`Section selection updated for course ${courseId}.`); // Optional: feedback if selection is not immediately visible
  };

  /** Updates the map that stores whether to exclude honors sections for a course. */
  const updateExcludeHonorsMap = (courseId: string, exclude: boolean) => {
    setExcludeHonorsMapState(prev => ({ ...prev, [courseId]: exclude }));
    // toast.info(`Honors section preference updated for course ${courseId}.`); // Optional: feedback
  };

  /** Adds a course to the list of courses to be considered for scheduling. */
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

  /** Removes a course from the list of courses to be considered for scheduling. */
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

  /** Adds a new busy time to the user's schedule. */
  const addBusyTime = (busyTime: BusyTime) => {
    setBusyTimes(prev => {
      toast.success(`Added busy time: ${busyTime.title}`);
      return [...prev, busyTime];
    });
  };

  /** Updates an existing busy time. */
  const updateBusyTime = (busyTime: BusyTime) => {
    setBusyTimes(prev => {
      const updatedBusyTimes = prev.map(bt => bt.id === busyTime.id ? busyTime : bt);
      toast.success(`Updated busy time: ${busyTime.title}`);
      return updatedBusyTimes;
    });
  };

  /** Removes a busy time from the user's schedule. */
  const removeBusyTime = (busyTimeId: string) => {
    setBusyTimes(prev => {
      const busyTime = prev.find(b => b.id === busyTimeId);
      if (!busyTime) return prev;
      toast.success(`Removed busy time: ${busyTime.title}`);
      return prev.filter(bt => bt.id !== busyTimeId);
    });
  };

  /**
   * Adds a manually created or imported schedule to the list of schedules.
   * Note: This is typically not for schedules generated by the algorithm.
   */
  const addSchedule = (schedule: Schedule) => {
    // Consider adding a check for duplicate schedule IDs or names if necessary
    setSchedules(prev => [...prev, schedule]);
    toast.success(`Added schedule: ${schedule.name}`);
  };

  /** Removes a schedule from the list of schedules. */
  const removeSchedule = (scheduleId: string) => {
    setSchedules(prev => {
      const schedule = prev.find(s => s.id === scheduleId);
      if (!schedule) return prev;
      toast.success(`Removed schedule: ${schedule.name}`);
      return prev.filter(s => s.id !== scheduleId);
    });
  };

  /** Sets the currently selected schedule to view its details. */
  const selectSchedule = (scheduleId: string | null) => {
    if (!scheduleId) {
      setSelectedSchedule(null);
      return;
    }
    const schedule = schedules.find(s => s.id === scheduleId);
    if (schedule) {
      setSelectedSchedule(schedule);
      // toast.info(`Selected schedule: ${schedule.name}`); // Optional: can be noisy
    } else if (!scheduleId) {
      setSelectedSchedule(null); // Explicitly null when deselecting
    }
    // If schedule not found for a given ID, selectedSchedule remains unchanged or becomes null.
    // Could add a toast.warn if a scheduleId is provided but not found.
  };

  /**
   * Generates potential schedules based on selected courses, fixed sections,
   * busy times, and user preferences.
   */
  const generateSchedules = (selectedCourseIds: string[], fixedSections: CourseSection[] = []) => {
    toast.info("Generating schedules based on preferences...");

    if (!selectedCourseIds || selectedCourseIds.length === 0) {
      toast.error("No courses selected for schedule generation.");
      setSchedules([]);
      setSelectedSchedule(null);
      return;
    }

    const { eligibleCoursesForScheduling, schedulableCourses, fixedCourseIds } = filterEligibleCourses(
      courses,
      selectedCourseIds,
      fixedSections,
      excludeHonorsMap,
      selectedSectionMap
    );

    // Handle cases where no courses are available for scheduling
    if (eligibleCoursesForScheduling.length === 0 && fixedSections.length > 0) {
      // All selected courses are covered by fixed sections, create a schedule with only these fixed sections.
      const newSchedule: Schedule = {
        id: `gen-sched-${Date.now()}-locked`,
        name: `Schedule with Locked Courses (${fixedSections.length} courses)`,
        termId: currentTerm?.id || "",
        sections: [...fixedSections], // Directly use the provided fixed sections
        busyTimes,
        totalCredits: fixedSections.reduce((acc, section) => {
          // Find the parent course to get credit information
          const parentCourse = courses.find(c => c.id === section.id.split('-')[0]);
          return acc + (parentCourse?.credits || 0);
        }, 0),
        conflicts: [] // Conflict checking for fixed sections can be added if necessary
      };
      setSchedules(prev => [...prev.filter(s => !s.name.startsWith("Generated Schedule")), newSchedule]);
      setSelectedSchedule(newSchedule);
      toast.success(`Successfully created a schedule with ${fixedSections.length} locked course(s).`);
      return;
    }

    if (eligibleCoursesForScheduling.length === 0 && fixedSections.length === 0) {
      toast.error("No courses were selected for scheduling, or all selected courses were empty.");
      setSchedules([]); // Clear previous generated schedules
      setSelectedSchedule(null);
      return;
    }

    if (schedulableCourses.length === 0) {
      toast.error("No courses have available sections after applying your section preferences (e.g., specific sections, excluding honors). Please adjust your preferences or course selections.");
      setSchedules([]);
      setSelectedSchedule(null);
      return;
    }

    // Notify if some courses were filtered out due to section preferences
    if (schedulableCourses.length < eligibleCoursesForScheduling.length) {
        toast.info("Some selected courses had no available sections after applying section-specific preferences (like specific sections or excluding honors) and were not included in the generation process.");
    }

    // Schedule generation algorithm starts here
    const foundSchedules: Schedule[] = [];
    // This set is used to track which of the originally selected courses could not be scheduled.
    const coursesNotScheduled = new Set<string>(
      selectedCourseIds.map(id => courses.find(c => c.id === id)?.code || id)
    );

    // Initial call to the recursive function.
    // It starts with course index 0, a copy of fixedSections as the initial set of sections,
    // and 0 generated schedules.
    const initialFixedCount = fixedSections.length;
    recursivelyBuildSchedules(
      0,                            // courseIndex
      [...fixedSections],           // currentScheduleSections (starts with fixed ones)
      0,                            // generatedSchedulesCount
      schedulableCourses,           // courses to try scheduling
      foundSchedules,               // array to store results
      courses,                      // all courses for lookups (from context)
      currentTerm?.id,              // current term ID
      busyTimes,                    // user's busy times (from context)
      MAX_SCHEDULES_TO_GENERATE,    // constant for max schedules
      coursesNotScheduled,          // set to track unscheduled courses
      initialFixedCount             // count of initially fixed sections
    );

    if (foundSchedules.length > 0) {
      // Filter out previously generated schedules before adding new ones
      setSchedules(prev => {
        const existingUserSchedules = prev.filter(s => !s.id.startsWith("gen-sched-"));
        return [...existingUserSchedules, ...foundSchedules];
      });
      setSelectedSchedule(foundSchedules[0]); // Select the first generated schedule
      toast.success(`${foundSchedules.length} new schedule(s) generated successfully!`);

      // Determine which of the *initially selected* courses were not included in *any* of the generated schedules.
      // This requires checking against the original 'selectedCourseIds' and what ended up in 'foundSchedules'.
      const allScheduledCourseIdsInFoundSchedules = new Set<string>();
      foundSchedules.forEach(schedule => {
        schedule.sections.forEach(section => {
          allScheduledCourseIdsInFoundSchedules.add(section.id.split('-')[0]);
        });
      });

      const coursesThatCouldNotBePlaced = selectedCourseIds.filter(id => {
        // A course is considered "not placed" if it wasn't a fixed section and isn't in any generated schedule.
        const isFixed = fixedCourseIds.includes(id);
        const isInGenerated = allScheduledCourseIdsInFoundSchedules.has(id);
        return !isFixed && !isInGenerated;
      }).map(id => courses.find(c => c.id === id)?.code || id);


      if (coursesThatCouldNotBePlaced.length > 0) {
        toast.info(`Could not include the following courses in the generated schedules: ${coursesThatCouldNotBePlaced.join(', ')}. This might be due to conflicts or no available sections fitting your preferences.`);
      }
    } else {
      // Handle the case where no schedules could be generated
      let errorMessage = "Could not generate any valid schedules. ";
      if (selectedCourseIds.length > 0 && schedulableCourses.length === 0) {
        errorMessage += "This might be because all selected courses were filtered out by your section preferences (e.g., specific sections, excluding honors) or had no available sections.";
      } else if (selectedCourseIds.length > 0 && fixedSections.length > 0 && eligibleCoursesForScheduling.length === 0) {
        errorMessage += "All your selected courses are locked, and no additional courses were available to form new schedules.";
      } else if (selectedCourseIds.length === 0 && fixedSections.length === 0) {
        errorMessage += "No courses were selected or locked to begin with.";
      } else {
        errorMessage += "This could be due to too many conflicts between courses, or with your busy times. Try adjusting your selections or preferences.";
      }
      toast.error(errorMessage);
      setSchedules(prev => prev.filter(s => !s.name.startsWith("Generated Schedule"))); // Clear old generated schedules
      setSelectedSchedule(null); // No schedule to select
    }
  };

  /** Selects the current academic term. */
  const selectTerm = (termId: string) => {
    const term = _allTerms.find((t: Term) => t.id === termId);
    if (term) {
      setCurrentTerm(term);
      toast.info(`Switched to term: ${term.name}.`);
      // Potentially clear schedules or courses if they are term-specific and a new term is selected
      // setSchedules([]);
      // setCourses([]); // Depending on application logic
      // setSelectedSchedule(null);
    } else {
      toast.error(`Term with ID ${termId} not found.`);
    }
  };

  /** Updates general application preferences. */
  const updatePreferences = (newPreferences: Partial<PreferenceSettings>) => {
    setPreferences(prev => ({ ...prev, ...newPreferences }));
    toast.success("Application preferences updated!");
  };

  /** Updates preferences specifically related to schedule generation. */
  const updateSchedulePreferences = (newPreferences: Partial<SchedulePreferences>) => {
    setSchedulePreferences(prev => ({ ...prev, ...newPreferences }));
    toast.success("Schedule generation preferences updated!");
  };

  /** Adds a course section to the currently selected schedule. Replaces if section for same course already exists. */
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
      toast.success(`Section ${section.id.split('-')[1]} for ${parentCourse?.code} added to ${prev.name}.`);
      return newSchedule;
    });
  };

  /** Removes a course section from the currently selected schedule. */
  const removeSectionFromSchedule = (sectionId: string) => {
    if (!selectedSchedule) {
      toast.error("No schedule selected to remove section from.");
      return;
    }
    setSelectedSchedule(prev => {
      if (!prev) return null; // Should not happen if selectedSchedule guard passed

      const sectionToRemove = prev.sections.find(s => s.id === sectionId);
      if (!sectionToRemove) {
        toast.warn(`Section ${sectionId} not found in the selected schedule.`);
        return prev;
      }
      const courseId = sectionToRemove.id.split('-')[0];
      const parentCourse = courses.find(c => c.id === courseId);

      const newSchedule = {
        ...prev,
        sections: prev.sections.filter(s => s.id !== sectionId),
        totalCredits: Math.max(0, prev.totalCredits - (parentCourse?.credits || 0))
      };
      toast.success(`Section ${sectionToRemove.sectionNumber} for ${parentCourse?.code} removed from ${prev.name}.`);
      return newSchedule;
    });
  };

  /** Moves the currently selected schedule to the shopping cart. */
  const moveToCart = () => {
    if (!selectedSchedule) {
      toast.error("No schedule selected to add to cart.");
      return;
    }
    const scheduleCopy = JSON.parse(JSON.stringify(selectedSchedule));
    scheduleCopy.id = `cart-${Date.now()}`; // Ensure unique ID for cart
    setShoppingCart(prev => {
      // Check if schedule already exists in cart
      if (prev.some(s => s.name === scheduleCopy.name)) {
        toast.info(`Schedule "${selectedSchedule.name}" is already in your cart.`);
        return prev;
      }
      toast.success(`Schedule "${selectedSchedule.name}" added to registration cart!`);
      return [...prev, scheduleCopy];
    });
  };

  /** Clears all schedules from the shopping cart. */
  const clearCart = () => {
    if (shoppingCart.length === 0) {
      toast.info("Shopping cart is already empty.");
      return;
    }
    setShoppingCart([]);
    toast.success("Shopping cart cleared.");
  };

  /** Placeholder for comparing selected schedules. Currently only toasts. */
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
        courses, // List of courses available for planning
        busyTimes, // User's defined busy times
        schedules, // List of generated or saved schedules
        selectedSchedule, // The currently active/viewed schedule
        currentTerm, // The currently selected academic term
        allTerms: _allTerms, // All available academic terms
        studentInfo: _studentInfo, // Information about the student
        preferences, // General application preferences
        schedulePreferences, // Preferences for schedule generation
        shoppingCart, // Schedules saved by the user for registration

        selectedSectionMap, // Map of user's specific section choices for courses
        updateSelectedSectionMap, // Function to update section choices
        excludeHonorsMap, // Map of user's preference to exclude honors sections
        updateExcludeHonorsMap, // Function to update honors exclusion preference

        setCourses, // Function to manually set the list of courses
        addCourse, // Function to add a course for planning
        removeCourse, // Function to remove a course from planning

        setBusyTimes, // Function to manually set busy times
        addBusyTime, // Function to add a busy time
        updateBusyTime, // Function to update a busy time
        removeBusyTime, // Function to remove a busy time

        setSchedules, // Function to manually set the list of schedules
        addSchedule, // Function to add a custom schedule
        removeSchedule, // Function to remove a schedule
        selectSchedule, // Function to select a schedule for viewing

        generateSchedules, // Function to generate schedules based on selections and preferences

        selectTerm, // Function to change the current academic term
        updatePreferences, // Function to update general preferences
        updateSchedulePreferences, // Function to update schedule generation preferences

        addSectionToSchedule, // Function to add a section to the selected schedule
        removeSectionFromSchedule, // Function to remove a section from the selected schedule

        moveToCart, // Function to move the selected schedule to the cart
        clearCart, // Function to clear the shopping cart
        compareSchedules // Function to initiate comparison of schedules (placeholder)
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
