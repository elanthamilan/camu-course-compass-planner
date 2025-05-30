import { CourseSection, BusyTime, SectionSchedule } from "@/lib/types";

// --- Time Conflict Helper Functions ---
export const parseTime = (timeStr: string): number => {
  if (!timeStr || !timeStr.includes(':')) { // Basic validation
    // console.error("Invalid time string for parsing:", timeStr);
    return -1; // Or throw an error, or handle as per application's error strategy
  }
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
};

export const doTimesOverlap = (startA: string, endA: string, startB: string, endB: string): boolean => {
  const startMinA = parseTime(startA);
  const endMinA = parseTime(endA);
  const startMinB = parseTime(startB);
  const endMinB = parseTime(endB);

  // Handle potential invalid times from parseTime
  if (startMinA === -1 || endMinA === -1 || startMinB === -1 || endMinB === -1) {
    return false; // Or handle error appropriately
  }
  return Math.max(startMinA, startMinB) < Math.min(endMinA, endMinB);
};

export const doDaysOverlap = (daysA: string[], daysB: string[]): boolean => {
  if (!daysA || !daysB) return false;
  return daysA.some(day => daysB.includes(day));
};

export const isSectionMeetingConflict = (meetingA: SectionSchedule, meetingB: SectionSchedule): boolean => {
  if (!meetingA || !meetingB || !meetingA.days || !meetingB.days) return false;
  const daysA = meetingA.days.split(',').map(d => d.trim());
  const daysB = meetingB.days.split(',').map(d => d.trim());
  return doDaysOverlap(daysA, daysB) && doTimesOverlap(meetingA.startTime, meetingA.endTime, meetingB.startTime, meetingB.endTime);
};

export const isSectionConflictWithBusyTimes = (section: CourseSection, busyTimes: BusyTime[]): boolean => {
  // A single CourseSection is assumed to have one meeting time/days directly on it.
  // If a CourseSection could have multiple schedules (e.g. MWF and TTh lab),
  // then section.schedule would need to be an array, and the logic would iterate it.
  // Based on current CourseSection type, schedule details are direct properties.
  if (!section || !section.days || !section.startTime || !section.endTime || !busyTimes) return false;

  for (const busyTime of busyTimes) {
    if (!busyTime.days || !busyTime.startTime || !busyTime.endTime) continue; // Skip invalid busy time entry

    // section.days is already string[] based on CourseSection type from lib/types.ts
    // and mock data. No need for split(',').
    if (doDaysOverlap(section.days, busyTime.days) &&
        doTimesOverlap(section.startTime, section.endTime, busyTime.startTime, busyTime.endTime)) {
      return true;
    }
  }
  return false; 
};

export const isSectionConflictWithOtherSections = (sectionA: CourseSection, otherSections: CourseSection[]): boolean => {
  // Assuming sectionA and sections in otherSections have schedule details directly on them.
  if (!sectionA || !sectionA.days || !sectionA.startTime || !sectionA.endTime || !otherSections) return false;

  for (const sectionB of otherSections) {
    if (!sectionB || !sectionB.days || !sectionB.startTime || !sectionB.endTime || sectionA.id === sectionB.id) continue;

    // section.days is already string[]
    if (doDaysOverlap(sectionA.days, sectionB.days) &&
        doTimesOverlap(sectionA.startTime, sectionA.endTime, sectionB.startTime, sectionB.endTime)) {
      return true;
    }
  }
  return false;
};
// --- End Time Conflict Helper Functions ---
// Note: isSectionMeetingConflict might be redundant if CourseSection only has one meeting time.
// If CourseSection were to have a `schedule: SectionSchedule[]` property,
// then isSectionMeetingConflict would be used by the higher-level conflict functions.
// For now, isSectionConflictWithOtherSections is simplified to assume single meeting per section.
