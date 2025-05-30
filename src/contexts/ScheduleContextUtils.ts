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
  // CourseSection has a schedule array of SectionSchedule objects
  if (!section || !section.schedule || section.schedule.length === 0 || !busyTimes) return false;

  for (const sectionSchedule of section.schedule) {
    if (!sectionSchedule.days || !sectionSchedule.startTime || !sectionSchedule.endTime) continue;

    // Convert comma-separated days string to array
    const sectionDays = sectionSchedule.days.split(',').map(d => d.trim());

    for (const busyTime of busyTimes) {
      if (!busyTime.days || !busyTime.startTime || !busyTime.endTime) continue; // Skip invalid busy time entry

      if (doDaysOverlap(sectionDays, busyTime.days) &&
          doTimesOverlap(sectionSchedule.startTime, sectionSchedule.endTime, busyTime.startTime, busyTime.endTime)) {
        return true;
      }
    }
  }
  return false;
};

export const isSectionConflictWithOtherSections = (sectionA: CourseSection, otherSections: CourseSection[]): boolean => {
  // CourseSection has a schedule array of SectionSchedule objects
  if (!sectionA || !sectionA.schedule || sectionA.schedule.length === 0 || !otherSections) return false;

  for (const sectionB of otherSections) {
    if (!sectionB || !sectionB.schedule || sectionB.schedule.length === 0 || sectionA.id === sectionB.id) continue;

    // Check all schedule combinations between sectionA and sectionB
    for (const scheduleA of sectionA.schedule) {
      if (!scheduleA.days || !scheduleA.startTime || !scheduleA.endTime) continue;

      const daysA = scheduleA.days.split(',').map(d => d.trim());

      for (const scheduleB of sectionB.schedule) {
        if (!scheduleB.days || !scheduleB.startTime || !scheduleB.endTime) continue;

        const daysB = scheduleB.days.split(',').map(d => d.trim());

        if (doDaysOverlap(daysA, daysB) &&
            doTimesOverlap(scheduleA.startTime, scheduleA.endTime, scheduleB.startTime, scheduleB.endTime)) {
          return true;
        }
      }
    }
  }
  return false;
};
// --- End Time Conflict Helper Functions ---
// Note: isSectionMeetingConflict might be redundant if CourseSection only has one meeting time.
// If CourseSection were to have a `schedule: SectionSchedule[]` property,
// then isSectionMeetingConflict would be used by the higher-level conflict functions.
// For now, isSectionConflictWithOtherSections is simplified to assume single meeting per section.
