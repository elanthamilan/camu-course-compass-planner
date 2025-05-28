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
  if (!section || !section.schedule || !busyTimes) return false;
  for (const busyTime of busyTimes) {
    if (!busyTime.days || !busyTime.startTime || !busyTime.endTime) continue; // Skip invalid busy time entry
    for (const sectionMeeting of section.schedule) {
      if (!sectionMeeting.days || !sectionMeeting.startTime || !sectionMeeting.endTime) continue; // Skip invalid section meeting
      const sectionDays = sectionMeeting.days.split(',').map(d => d.trim());
      if (doDaysOverlap(sectionDays, busyTime.days) && 
          doTimesOverlap(sectionMeeting.startTime, sectionMeeting.endTime, busyTime.startTime, busyTime.endTime)) {
        return true; 
      }
    }
  }
  return false; 
};

export const isSectionConflictWithOtherSections = (section: CourseSection, otherSections: CourseSection[]): boolean => {
  if (!section || !section.schedule || !otherSections) return false;
  for (const otherSection of otherSections) {
    if (!otherSection || !otherSection.schedule || section.id === otherSection.id) continue; 
    for (const meetingA of section.schedule) {
      if (!meetingA.days || !meetingA.startTime || !meetingA.endTime) continue;
      for (const meetingB of otherSection.schedule) {
        if (!meetingB.days || !meetingB.startTime || !meetingB.endTime) continue;
        if (isSectionMeetingConflict(meetingA, meetingB)) {
          return true;
        }
      }
    }
  }
  return false;
};
// --- End Time Conflict Helper Functions ---
