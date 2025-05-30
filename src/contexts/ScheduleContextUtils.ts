import { CourseSection, BusyTime, SectionSchedule } from "@/lib/types";

/**
 * Parses a time string in "HH:MM" (24-hour) format to total minutes since midnight.
 * @param timeStr The time string to parse (e.g., "10:30", "23:15").
 * @returns The total minutes from midnight, or -1 if the format is invalid.
 */
export const parseTime = (timeStr: string): number => {
  if (!timeStr || !timeStr.includes(':')) {
    // console.error("Invalid time string for parsing:", timeStr);
    return -1; // Indicates invalid format or missing time
  }
  const [hours, minutes] = timeStr.split(':').map(Number);
  if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
    // console.error("Invalid time values after parsing:", timeStr);
    return -1; // Indicates invalid time values
  }
  return hours * 60 + minutes;
};

/**
 * Checks if two time intervals overlap.
 * Assumes time strings are in "HH:MM" (24-hour) format.
 * @param startA Start time of interval A.
 * @param endA End time of interval A.
 * @param startB Start time of interval B.
 * @param endB End time of interval B.
 * @returns True if the time intervals overlap, false otherwise.
 *          Returns false if any time string is invalid.
 */
export const doTimesOverlap = (startA: string, endA: string, startB: string, endB: string): boolean => {
  const startMinA = parseTime(startA);
  const endMinA = parseTime(endA);
  const startMinB = parseTime(startB);
  const endMinB = parseTime(endB);

  // If any time is invalid, they cannot overlap.
  if (startMinA === -1 || endMinA === -1 || startMinB === -1 || endMinB === -1) {
    return false;
  }
  // Standard overlap condition: max(start) < min(end)
  return Math.max(startMinA, startMinB) < Math.min(endMinA, endMinB);
};

/**
 * Checks if there is any common day between two arrays of day strings.
 * @param daysA Array of day strings for the first schedule (e.g., ["M", "W"]).
 * @param daysB Array of day strings for the second schedule (e.g., ["W", "F"]).
 * @returns True if there is at least one common day, false otherwise.
 *          Returns false if either daysA or daysB is null or undefined.
 */
export const doDaysOverlap = (daysA: string[], daysB: string[]): boolean => {
  if (!daysA || !daysB) return false;
  return daysA.some(day => daysB.includes(day));
};

/**
 * Checks if two individual section meetings (SectionSchedule) conflict.
 * A conflict occurs if they are on the same day and their times overlap.
 * @param meetingA The first section meeting schedule.
 * @param meetingB The second section meeting schedule.
 * @returns True if the meetings conflict, false otherwise.
 *          Returns false if essential schedule information (days, times) is missing.
 */
export const isSectionMeetingConflict = (meetingA: SectionSchedule, meetingB: SectionSchedule): boolean => {
  if (!meetingA || !meetingB || !meetingA.days || !meetingB.days || !meetingA.startTime || !meetingA.endTime || !meetingB.startTime || !meetingB.endTime) {
    return false;
  }
  // SectionSchedule.days is a comma-separated string, e.g., "M,W,F"
  const daysA = meetingA.days.split(',').map(d => d.trim());
  const daysB = meetingB.days.split(',').map(d => d.trim());
  return doDaysOverlap(daysA, daysB) && doTimesOverlap(meetingA.startTime, meetingA.endTime, meetingB.startTime, meetingB.endTime);
};

/**
 * Checks if a course section conflicts with any of the user's busy times.
 * A section can have multiple meeting schedules (e.g., lecture MWF, lab T).
 * A conflict occurs if any of the section's meetings overlap with any busy time on a common day.
 * @param section The course section to check.
 * @param busyTimes An array of user's busy times.
 * @returns True if there is a conflict, false otherwise.
 */
export const isSectionConflictWithBusyTimes = (section: CourseSection, busyTimes: BusyTime[]): boolean => {
  if (!section || !section.schedule || section.schedule.length === 0 || !busyTimes || busyTimes.length === 0) {
    return false;
  }

  for (const sectionSchedule of section.schedule) {
    // Skip if essential section schedule details are missing
    if (!sectionSchedule.days || !sectionSchedule.startTime || !sectionSchedule.endTime) {
      continue;
    }
    // SectionSchedule.days is a comma-separated string, e.g., "M,W,F"
    const sectionDays = sectionSchedule.days.split(',').map(d => d.trim());

    for (const busyTime of busyTimes) {
      // Skip if essential busy time details are missing
      // BusyTime.days is already an array of strings, e.g., ["M", "W"]
      if (!busyTime.days || busyTime.days.length === 0 || !busyTime.startTime || !busyTime.endTime) {
        continue;
      }

      if (doDaysOverlap(sectionDays, busyTime.days) &&
          doTimesOverlap(sectionSchedule.startTime, sectionSchedule.endTime, busyTime.startTime, busyTime.endTime)) {
        return true; // Conflict found
      }
    }
  }
  return false; // No conflicts found
};

/**
 * Checks if a given course section (sectionA) conflicts with any section in a list of other sections.
 * A section can have multiple meeting schedules. A conflict occurs if any meeting of sectionA
 * overlaps with any meeting of another section (sectionB) on a common day.
 * @param sectionA The primary course section to check.
 * @param otherSections An array of other course sections to check against.
 * @returns True if sectionA conflicts with any section in otherSections, false otherwise.
 */
export const isSectionConflictWithOtherSections = (sectionA: CourseSection, otherSections: CourseSection[]): boolean => {
  if (!sectionA || !sectionA.schedule || sectionA.schedule.length === 0 || !otherSections || otherSections.length === 0) {
    return false;
  }

  for (const sectionB of otherSections) {
    // Skip if essential sectionB details are missing or if it's the same section
    if (!sectionB || !sectionB.schedule || sectionB.schedule.length === 0 || sectionA.id === sectionB.id) {
      continue;
    }

    // Check all schedule meeting combinations between sectionA and sectionB
    for (const scheduleA of sectionA.schedule) {
      if (!scheduleA.days || !scheduleA.startTime || !scheduleA.endTime) {
        continue;
      }
      // SectionSchedule.days is a comma-separated string, e.g., "M,W,F"
      const daysA = scheduleA.days.split(',').map(d => d.trim());

      for (const scheduleB of sectionB.schedule) {
        if (!scheduleB.days || !scheduleB.startTime || !scheduleB.endTime) {
          continue;
        }
        // SectionSchedule.days is a comma-separated string, e.g., "M,W,F"
        const daysB = scheduleB.days.split(',').map(d => d.trim());

        if (doDaysOverlap(daysA, daysB) &&
            doTimesOverlap(scheduleA.startTime, scheduleA.endTime, scheduleB.startTime, scheduleB.endTime)) {
          return true; // Conflict found
        }
      }
    }
  }
  return false; // No conflicts found
};
// Note: The comment about isSectionMeetingConflict being redundant was based on an earlier assumption
// that sections might only have one meeting time. Given that CourseSection.schedule is an array,
// iterating through these as done in isSectionConflictWithBusyTimes and isSectionConflictWithOtherSections
// is the correct approach. isSectionMeetingConflict correctly compares two individual meeting times.
