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
  console.log("[Debug] filterEligibleCourses: All Courses", allCourses);
  console.log("[Debug] filterEligibleCourses: Selected IDs", selectedCourseIds);
  console.log("[Debug] filterEligibleCourses: Fixed Sections", fixedSections);
  console.log("[Debug] filterEligibleCourses: Exclude Honors Map", excludeHonorsMap);
  console.log("[Debug] filterEligibleCourses: Selected Section Map", selectedSectionMap);

  const fixedCourseIds = fixedSections.map(section => section.id.split('-')[0]);
  console.log("[Debug] filterEligibleCourses: Fixed Course IDs", fixedCourseIds);

  // Filter out courses that are already covered by fixedSections from the initial selection
  const eligibleCoursesForScheduling = allCourses.filter(course =>
    selectedCourseIds.includes(course.id) && !fixedCourseIds.includes(course.id)
  );

  // Further process the eligible courses to apply section-specific preferences
  const schedulableCourses = eligibleCoursesForScheduling.map(course => {
    console.log(`[Debug] filterEligibleCourses: Processing eligible course ${course.id}`, course);
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
  }).filter(course => {
    const hasSections = course.sections.length > 0;
    if (!hasSections) {
      console.log(`[Debug] filterEligibleCourses: Course ${course.id} filtered out, no available sections after preferences.`);
    }
    return hasSections;
  }); // Only include courses that still have sections after filtering

  console.log("[Debug] filterEligibleCourses: Result - Eligible for Scheduling", eligibleCoursesForScheduling);
  console.log("[Debug] filterEligibleCourses: Result - Schedulable (after section prefs)", schedulableCourses);
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
  console.log(`[Debug] recursivelyBuildSchedules: Index=${courseIndex}, CurrentSections#=${currentScheduleSections.length}, GenCount=${generatedSchedulesCount}, Schedulable#=${schedulableCourses.length}, FixedCount=${initialFixedSectionsCount}`);
  // console.log("[Debug] recursivelyBuildSchedules: Current Sections", JSON.stringify(currentScheduleSections.map(s=>s.id)));
  // console.log("[Debug] recursivelyBuildSchedules: Schedulable Courses", JSON.stringify(schedulableCourses.map(c=>c.id)));


  // Stop if the maximum number of schedules to generate has been reached
  if (generatedSchedulesCount >= MAX_SCHEDULES_TO_GENERATE) {
    console.log("[Debug] recursivelyBuildSchedules: Max schedules generated, returning.");
    return generatedSchedulesCount;
  }

  // Base case: all schedulable courses have been considered
  if (courseIndex === schedulableCourses.length) {
    console.log("[Debug] recursivelyBuildSchedules: Base case reached (all courses processed).");
    const finalSections = [...currentScheduleSections];
    console.log("[Debug] recursivelyBuildSchedules: Final sections for potential schedule", finalSections.map(s=>s.id));

    // Base Case Condition:
    // If there were courses intended to be scheduled (schedulableCourses.length > 0),
    // then a valid generated schedule must contain more sections than the initial fixed sections.
    // This ensures that at least one course from `schedulableCourses` was actually added.
    if (schedulableCourses.length > 0 && finalSections.length <= initialFixedSectionsCount) {
        console.log("[Debug] recursivelyBuildSchedules: Base Case - Not a valid new combination (no new schedulable courses added to fixed ones).");
        return generatedSchedulesCount; // Not a valid new schedule combination
    }
    // Also, if there were no schedulable courses and no fixed sections, don't save an empty schedule.
    if (schedulableCourses.length === 0 && initialFixedSectionsCount === 0 && finalSections.length === 0) {
        console.log("[Debug] recursivelyBuildSchedules: Base Case - Empty schedule (no schedulable, no fixed), not saving.");
        return generatedSchedulesCount;
    }

    console.log("[Debug] recursivelyBuildSchedules: Base Case - Valid schedule found, adding.");
    const newSchedule: Schedule = {
      id: `gen-sched-${Date.now()}-${foundSchedules.length + 1}`, // Date.now() will be mocked in tests
      name: `Generated Schedule ${foundSchedules.length + 1} (${finalSections.length} courses)`,
      termId: currentTermId || "",
      sections: finalSections,
      busyTimes,
      totalCredits: finalSections.reduce((acc, section) => {
        // Use section.courseId for robustness instead of splitting section.id
        const parentCourse = allCourses.find(c => c.id === section.courseId);
        return acc + (parentCourse?.credits || 0);
      }, 0),
      conflicts: []
    };
    foundSchedules.push(newSchedule);

    finalSections.forEach(s => {
      // Use section.courseId for robustness
      const parentCourse = allCourses.find(c => c.id === s.courseId);
      if (parentCourse?.code) coursesNotScheduled.delete(parentCourse.code);
    });
    return generatedSchedulesCount + 1;
  }

  const currentCourse = schedulableCourses[courseIndex];
  let newGeneratedSchedulesCount = generatedSchedulesCount;

  if (!currentCourse) {
    console.log("[Debug] recursivelyBuildSchedules: Current course is undefined, returning."); // Should ideally not happen if courseIndex < schedulableCourses.length
    return newGeneratedSchedulesCount;
  }
  console.log(`[Debug] recursivelyBuildSchedules: Processing course ${currentCourse.id} (${currentCourse.code})`);

  // let courseWasScheduledInThisPath = false; // Old variable, replaced for clarity
  let currentCourseSuccessfullyContributed = false; // True if any section of this course leads to a new schedule

  for (const section of currentCourse.sections) {
    console.log(`[Debug] recursivelyBuildSchedules: Trying section ${section.id} for course ${currentCourse.id}`);
    const conflictWithBusy = isSectionConflictWithBusyTimes(section, busyTimes);
    const conflictWithOther = isSectionConflictWithOtherSections(section, currentScheduleSections);

    if (conflictWithBusy || conflictWithOther) {
      if (conflictWithBusy) console.log(`[Debug] recursivelyBuildSchedules: Section ${section.id} conflicts with BUSY TIMES.`);
      if (conflictWithOther) console.log(`[Debug] recursivelyBuildSchedules: Section ${section.id} conflicts with OTHER SECTIONS in current path: ${currentScheduleSections.map(s=>s.id).join(', ')}`);
      continue;
    }

    console.log(`[Debug] recursivelyBuildSchedules: Section ${section.id} is VALID for now. Adding to current path.`);
    currentScheduleSections.push(section);
    // courseWasScheduledInThisPath = true; // Old logic

    const countBeforeRecursiveCall = newGeneratedSchedulesCount;
    newGeneratedSchedulesCount = recursivelyBuildSchedules( // Recursive call
      courseIndex + 1, // Process the next course
      currentScheduleSections, // Pass the current path including the new section
      countBeforeRecursiveCall, // Pass the count *before* this path explored further
                                // If this path finds schedules, it will increment its return from this base.
                                // This ensures newGeneratedSchedulesCount correctly reflects total unique schedules found.
      schedulableCourses,
      foundSchedules,
      allCourses,
      currentTermId,
      busyTimes,
      MAX_SCHEDULES_TO_GENERATE,
      coursesNotScheduled,
      initialFixedSectionsCount
    );

    if (newGeneratedSchedulesCount > countBeforeRecursiveCall) {
      currentCourseSuccessfullyContributed = true; // This section (and thus this course) was part of at least one new schedule found
    }

    currentScheduleSections.pop(); // Backtrack
    console.log(`[Debug] recursivelyBuildSchedules: Backtracked. Removed section ${section.id}. Current path: ${currentScheduleSections.map(s=>s.id).join(', ')}`);

    if (newGeneratedSchedulesCount >= MAX_SCHEDULES_TO_GENERATE) {
      console.log(`[Debug] recursivelyBuildSchedules: Max schedules reached after trying section ${section.id}. Breaking from section loop for course ${currentCourse.id}`);
      break;
    }
  }

  // If NO section of the current course led to any new schedule (i.e., currentCourseSuccessfullyContributed is false),
  // then try to build schedules by SKIPPING the current course entirely.
  if (!currentCourseSuccessfullyContributed) {
    console.log(`[Debug] recursivelyBuildSchedules: No section for course ${currentCourse.id} contributed to a new schedule. Trying to schedule subsequent courses without it.`);
    // Pass newGeneratedSchedulesCount, which reflects schedules found through prior paths NOT involving this currentCourse's sections that failed.
    // If currentCourse was the first one, newGeneratedSchedulesCount would be the initial 0.
    // If prior courses in the recursion already found schedules, newGeneratedSchedulesCount reflects that.
    // This call explores paths that entirely exclude currentCourse.
    newGeneratedSchedulesCount = recursivelyBuildSchedules(
      courseIndex + 1, // Move to the next course, effectively skipping currentCourse
      currentScheduleSections, // Pass the schedule sections *as they were before trying currentCourse's sections*
      newGeneratedSchedulesCount, // Continue with the count of schedules found so far
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
      totalCredits: 9, // Corrected from 15, based on mockSchedules[0]
      conflicts: []
    },
    {
      id: "cart-schedule-2",
      name: "Balanced Day Schedule",
      termId: "fall2024",
      sections: mockSchedules[1]?.sections || [],
      busyTimes: [],
      totalCredits: 9, // Corrected from 16, based on mockSchedules[1]
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
    if (schedules.find(s => s.id === schedule.id)) {
      toast.error(`Schedule with ID "${schedule.id}" already exists and cannot be added again.`);
      return;
    }
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
    } else if (scheduleId) { // scheduleId was provided but schedule not found
      toast.warn(`Could not find schedule with ID "${scheduleId}".`);
      setSelectedSchedule(null); // Or keep previous selectedSchedule, debatable. Clearing seems safer.
    } else { // scheduleId is null (deselecting)
      setSelectedSchedule(null);
    }
  };

  /**
   * Generates potential schedules based on selected courses, fixed sections,
   * busy times, and user preferences.
   */
  const generateSchedules = (selectedCourseIds: string[], fixedSections: CourseSection[] = []) => {
    console.log("[Debug] generateSchedules: Called with selectedCourseIds:", selectedCourseIds, "fixedSections:", fixedSections);
    toast.info("Generating schedules based on preferences...");

    if (!selectedCourseIds || selectedCourseIds.length === 0) {
      console.log("[Debug] generateSchedules: No courses selected.");
      toast.error("No courses selected for schedule generation.");
      setSchedules([]);
      setSelectedSchedule(null);
      return;
    }

    const { eligibleCoursesForScheduling, schedulableCourses, fixedCourseIds } = filterEligibleCourses(
      courses, // All courses from context
      selectedCourseIds, // IDs of courses user wants to schedule
      fixedSections, // Sections user has locked
      excludeHonorsMap, // Preferences for excluding honors
      selectedSectionMap // Preferences for specific sections
    );
    console.log("[Debug] generateSchedules: Eligible courses for dynamic scheduling:", eligibleCoursesForScheduling.map(c=>c.id));
    console.log("[Debug] generateSchedules: Schedulable courses (after section prefs):", schedulableCourses.map(c=>c.id));
    console.log("[Debug] generateSchedules: Fixed course IDs derived:", fixedCourseIds);


    // Handle cases where no courses are available for scheduling
    if (eligibleCoursesForScheduling.length === 0 && fixedSections.length > 0) {
      console.log("[Debug] generateSchedules: All selected courses are covered by fixed sections.");
      // All selected courses are covered by fixed sections, create a schedule with only these fixed sections.
      const newSchedule: Schedule = {
        id: `gen-sched-${Date.now()}-locked`, // Date.now() will be mocked in tests
        name: `Schedule with Locked Courses (${fixedSections.length} courses)`,
        termId: currentTerm?.id || "",
        sections: [...fixedSections], // Directly use the provided fixed sections
        busyTimes,
        totalCredits: fixedSections.reduce((acc, section) => {
          // Find the parent course to get credit information
          // Use section.courseId for robustness
          const parentCourse = courses.find(c => c.id === section.courseId);
          return acc + (parentCourse?.credits || 0);
        }, 0),
        conflicts: [] // Conflict checking for fixed sections can be added if necessary
      };
      setSchedules(prev => [...prev.filter(s => !s.id.startsWith("gen-sched-")), newSchedule]); // Filter by ID prefix
      setSelectedSchedule(newSchedule);
      toast.success(`Successfully created a schedule with ${fixedSections.length} locked course(s).`);
      return;
    }

    if (eligibleCoursesForScheduling.length === 0 && fixedSections.length === 0) {
      console.log("[Debug] generateSchedules: No courses available to schedule (neither selected nor locked).");
      toast.error("No courses were selected for scheduling, or all selected courses were empty.");
      setSchedules([]); // Clear previous generated schedules
      setSelectedSchedule(null);
      return;
    }

    if (schedulableCourses.length === 0 && eligibleCoursesForScheduling.length > 0) {
      // This case means courses were selected, not all were fixed, but after applying section-specific
      // preferences (like specific sections chosen by user, or honors exclusion), none remained.
      console.log("[Debug] generateSchedules: No courses have available sections after applying user's section preferences.");
      toast.error("No courses have available sections after applying your section preferences (e.g., specific sections, excluding honors). Please adjust your preferences or course selections.");
      setSchedules([]);
      setSelectedSchedule(null);
      return;
    }
     if (schedulableCourses.length === 0 && fixedSections.length > 0 && eligibleCoursesForScheduling.length === 0) {
      // This specific case is when all selected courses were fixed, so schedulableCourses would be empty.
      // This is handled by the (eligibleCoursesForScheduling.length === 0 && fixedSections.length > 0) block above.
      // Adding a log here for completeness, though it might be redundant if the above block always catches it.
      console.log("[Debug] generateSchedules: All selected courses were fixed, and no other courses were available/selected for dynamic scheduling.");
      // The schedule with only fixed sections is created above. No further error needed here.
      // Fall through if already handled. If not, it implies an edge case not caught.
    }


    // Notify if some courses were filtered out due to section preferences
    if (schedulableCourses.length < eligibleCoursesForScheduling.length) {
        console.log("[Debug] generateSchedules: Some courses were filtered out due to section preferences.");
        toast.info("Some selected courses had no available sections after applying section-specific preferences (like specific sections or excluding honors) and were not included in the generation process.");
    }

    // Schedule generation algorithm starts here
    console.log("[Debug] generateSchedules: Starting recursive build process...");
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
          // Use section.courseId
          allScheduledCourseIdsInFoundSchedules.add(section.courseId);
        });
      });

      const coursesThatCouldNotBePlaced = selectedCourseIds
        .filter(courseId => {
          // A course is "not placed" if it's not fixed AND not in any generated schedule's sections.
          const isFixed = fixedCourseIds.includes(courseId);
          const isInGenerated = allScheduledCourseIdsInFoundSchedules.has(courseId);
          return !isFixed && !isInGenerated;
        })
        .map(courseId => courses.find(c => c.id === courseId)?.code || courseId);


      if (coursesThatCouldNotBePlaced.length > 0) {
        toast.info(`Could not include the following selected courses in the generated schedules: ${coursesThatCouldNotBePlaced.join(', ')}. This might be due to conflicts or lack of suitable sections based on your preferences.`);
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
      // Use section.courseId for robustness
      const courseId = section.courseId;
      const parentCourse = courses.find(c => c.id === courseId);

      if (!parentCourse) {
        toast.error(`Could not find course details for ${section.courseId} to update credits.`);
        // Still add the section visually, but credits might be off.
        // Or, decide to prevent adding if parent course details for credits are missing.
        // For now, proceeding with section add but credits will not include this one.
         return {
          ...prev,
          sections: [...prev.sections.filter(s => s.courseId !== courseId), section],
          // totalCredits remains unchanged as parentCourse is not found
        };
      }

      const hasSectionForCourse = prev.sections.some(s => s.courseId === courseId);
      let updatedSections = prev.sections;
      if (hasSectionForCourse) {
        // Remove existing section(s) for this course before adding the new one
        updatedSections = prev.sections.filter(s => s.courseId !== courseId);
      }

      const oldCreditsForThisCourse = hasSectionForCourse ? (parentCourse.credits || 0) : 0;
      const newTotalCredits = prev.totalCredits - oldCreditsForThisCourse + (parentCourse.credits || 0);

      const newScheduleData = {
        ...prev,
        sections: [...updatedSections, section],
        totalCredits: newTotalCredits
      };
      toast.success(`Section ${section.sectionNumber} for ${parentCourse.code} added to ${prev.name}. Credits: ${newTotalCredits}`);
      return newScheduleData;
    });
  };

  /** Removes a course section from the currently selected schedule. */
  const removeSectionFromSchedule = (sectionId: string) => {
    if (!selectedSchedule) {
      toast.error("No schedule selected to remove section from.");
      return;
    }
    setSelectedSchedule(prev => {
      if (!prev) return null;

      const sectionToRemove = prev.sections.find(s => s.id === sectionId);
      if (!sectionToRemove) {
        toast.warn(`Section ${sectionId} not found in the selected schedule.`);
        return prev;
      }
      // Use sectionToRemove.courseId for robustness
      const courseId = sectionToRemove.courseId;
      const parentCourse = courses.find(c => c.id === courseId);

      if (!parentCourse) {
          toast.error(`Could not find course details for ${courseId} to update credits accurately.`);
          // Proceed with removal, but credits might become inaccurate if not found.
          // A more robust approach might prevent removal or log an internal error.
          return {
            ...prev,
            sections: prev.sections.filter(s => s.id !== sectionId),
            // totalCredits remains unchanged or could be recalculated from scratch if critical
          };
      }

      const newTotalCredits = Math.max(0, prev.totalCredits - (parentCourse.credits || 0));
      const newScheduleData = {
        ...prev,
        sections: prev.sections.filter(s => s.id !== sectionId),
        totalCredits: newTotalCredits
      };
      toast.success(`Section ${sectionToRemove.sectionNumber} for ${parentCourse.code} removed from ${prev.name}. Credits: ${newTotalCredits}`);
      return newScheduleData;
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
