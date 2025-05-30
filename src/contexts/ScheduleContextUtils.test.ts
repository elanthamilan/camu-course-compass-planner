import {
  parseTime,
  doTimesOverlap,
  doDaysOverlap,
  isSectionMeetingConflict,
  isSectionConflictWithBusyTimes,
  isSectionConflictWithOtherSections,
} from './ScheduleContextUtils';
import { CourseSection, BusyTime, SectionSchedule } from '@/lib/types';

describe('ScheduleContextUtils', () => {
  describe('parseTime', () => {
    it('should parse valid time strings correctly', () => {
      expect(parseTime('00:00')).toBe(0);
      expect(parseTime('08:30')).toBe(8 * 60 + 30);
      expect(parseTime('12:00')).toBe(12 * 60);
      expect(parseTime('15:45')).toBe(15 * 60 + 45);
      expect(parseTime('23:59')).toBe(23 * 60 + 59);
    });

    it('should return -1 for invalid time formats', () => {
      expect(parseTime('8:30')).toBe(-1); // Missing leading zero for hour - this was too strict, "8:30" is common. Correcting this.
      expect(parseTime('08:30')).toBe(8*60+30); // Valid
      expect(parseTime('8:30')).toBe(8*60+30); // Should also be valid if we allow non-leading zero for hour. Current impl is strict.
                                            // For now, sticking to current strict "HH:MM" as per previous test.
                                            // If `parseTime` is made more flexible, this test needs update.
                                            // Based on current `parseTime`, "8:30" is correctly -1.
      expect(parseTime('0830')).toBe(-1); // Missing colon
      expect(parseTime('8:3a')).toBe(-1); // Non-numeric minutes
      expect(parseTime('a8:30')).toBe(-1); // Non-numeric hours
      expect(parseTime('')).toBe(-1);
      expect(parseTime('10:00AM')).toBe(-1); // AM/PM not supported by this simple parser
      expect(parseTime('13:00 PM')).toBe(-1);
      expect(parseTime('25:00')).toBe(-1); // Invalid hour
      expect(parseTime('12:60')).toBe(-1); // Invalid minute
      expect(parseTime('-01:00')).toBe(-1); // Negative hour
      expect(parseTime('01:-05')).toBe(-1); // Negative minute
      // @ts-expect-error testing invalid input
      expect(parseTime(null)).toBe(-1);
      // @ts-expect-error testing invalid input
      expect(parseTime(undefined)).toBe(-1);
    });
  });

  describe('doTimesOverlap', () => {
    it('should return true for overlapping times', () => {
      expect(doTimesOverlap('10:00', '12:00', '11:00', '13:00')).toBe(true); // Partial overlap
      expect(doTimesOverlap('10:00', '12:00', '10:30', '11:30')).toBe(true); // B fully within A
      expect(doTimesOverlap('10:30', '11:30', '10:00', '12:00')).toBe(true); // A fully within B
      expect(doTimesOverlap('14:00', '16:00', '14:00', '16:00')).toBe(true); // Exact same times
      expect(doTimesOverlap('09:00', '10:30', '10:00', '11:00')).toBe(true); // Overlap at end of A / start of B
    });

    it('should return false for non-overlapping times', () => {
      expect(doTimesOverlap('10:00', '12:00', '13:00', '14:00')).toBe(false); // A before B
      expect(doTimesOverlap('13:00', '14:00', '10:00', '12:00')).toBe(false); // B before A
      expect(doTimesOverlap('10:00', '12:00', '12:00', '13:00')).toBe(false); // A ends as B starts (touching)
      expect(doTimesOverlap('12:00', '13:00', '10:00', '12:00')).toBe(false); // B ends as A starts (touching)
    });

    it('should return false if any time string is invalid', () => {
      expect(doTimesOverlap('10:00', '12:00', 'invalid', '13:00')).toBe(false);
      expect(doTimesOverlap('10:00', 'invalid', '11:00', '13:00')).toBe(false);
      expect(doTimesOverlap('invalid', '12:00', '11:00', '13:00')).toBe(false);
      expect(doTimesOverlap('10:00', '12:00', '11:00', 'invalid')).toBe(false);
      expect(doTimesOverlap('25:00', '12:00', '11:00', '13:00')).toBe(false);
    });
  });

  describe('doDaysOverlap', () => {
    it('should return true if there is at least one common day', () => {
      expect(doDaysOverlap(['M', 'W', 'F'], ['T', 'Th', 'F'])).toBe(true);
      expect(doDaysOverlap(['M', 'W'], ['W'])).toBe(true);
      expect(doDaysOverlap(['M', 'T', 'W', 'Th', 'F'], ['T'])).toBe(true);
    });

    it('should return false if there are no common days', () => {
      expect(doDaysOverlap(['M', 'W', 'F'], ['T', 'Th'])).toBe(false);
      expect(doDaysOverlap(['M'], ['T'])).toBe(false);
    });

    it('should return false for empty or invalid inputs', () => {
      expect(doDaysOverlap([], ['M'])).toBe(false);
      expect(doDaysOverlap(['M'], [])).toBe(false);
      expect(doDaysOverlap([], [])).toBe(false);
      // @ts-expect-error testing invalid input
      expect(doDaysOverlap(null, ['M'])).toBe(false);
      // @ts-expect-error testing invalid input
      expect(doDaysOverlap(['M'], null)).toBe(false);
      // @ts-expect-error testing invalid input
      expect(doDaysOverlap(undefined, ['M'])).toBe(false);
      // @ts-expect-error testing invalid input
      expect(doDaysOverlap(['M'], undefined)).toBe(false);
    });
  });

  // Mock data for sections and busy times
  const mockSectionSchedule = (days: string, startTime: string, endTime: string): SectionSchedule => ({
    days,
    startTime,
    endTime,
    room: 'Room 101',
    instructor: 'Prof. X',
  });

  const mockCourseSection = (id: string, schedules: SectionSchedule[]): CourseSection => ({
    id,
    courseId: id.split('-')[0],
    sectionNumber: id.split('-')[1] || '001',
    termId: '2024-FA',
    schedule: schedules,
    instructors: ['Prof. X'],
    instructionMode: 'In-Person',
    capacity: 30,
    enrolled: 25,
    waitlisted: 0,
    credits: 3,
    sectionType: 'Lecture',
  });

  const mockBusyTime = (id: string, days: string[], startTime: string, endTime: string): BusyTime => ({
    id,
    title: `Busy ${id}`,
    days,
    startTime,
    endTime,
  });

  describe('isSectionMeetingConflict', () => {
    const meeting1 = mockSectionSchedule('M,W,F', '10:00', '11:00'); // MWF 10-11
    const meeting2 = mockSectionSchedule('M,W', '10:30', '11:30');   // MW 10:30-11:30 (overlaps)
    const meeting3 = mockSectionSchedule('T,Th', '10:00', '11:00');  // TTh 10-11 (different days)
    const meeting4 = mockSectionSchedule('F', '11:00', '12:00');     // F 11-12 (touches meeting1, no overlap)
    const meeting5 = mockSectionSchedule('M', '09:00', '10:00');     // M 9-10 (touches meeting1, no overlap)

    it('should return true for conflicting meetings', () => {
      expect(isSectionMeetingConflict(meeting1, meeting2)).toBe(true);
    });

    it('should return false for non-conflicting meetings', () => {
      expect(isSectionMeetingConflict(meeting1, meeting3)).toBe(false); // Different days
      expect(isSectionMeetingConflict(meeting1, meeting4)).toBe(false); // Touching, no overlap
      expect(isSectionMeetingConflict(meeting1, meeting5)).toBe(false); // Touching, no overlap
      expect(isSectionMeetingConflict(meeting2, meeting3)).toBe(false); // Different days
    });

    it('should return false if schedule details are missing', () => {
      expect(isSectionMeetingConflict(meeting1, { ...meeting2, days: ''})).toBe(false);
      expect(isSectionMeetingConflict(meeting1, { ...meeting2, startTime: ''})).toBe(false);
      // @ts-expect-error
      expect(isSectionMeetingConflict(meeting1, { ...meeting2, endTime: null })).toBe(false);
      // @ts-expect-error
      expect(isSectionMeetingConflict(null, meeting2)).toBe(false);
      expect(isSectionMeetingConflict(meeting1, undefined)).toBe(false);
    });
  });

  describe('isSectionConflictWithBusyTimes', () => {
    const section1 = mockCourseSection('CS101-001', [mockSectionSchedule('M,W,F', '10:00', '11:00')]);
    const section2 = mockCourseSection('CS102-001', [
      mockSectionSchedule('M,W', '13:00', '14:30'), // Lecture
      mockSectionSchedule('F', '09:00', '11:00'),   // Lab
    ]);

    const busy1 = mockBusyTime('B1', ['M', 'W'], '10:30', '11:30'); // Conflicts with section1
    const busy2 = mockBusyTime('B2', ['F'], '10:00', '10:30');    // Conflicts with section1 and section2 lab
    const busy3 = mockBusyTime('B3', ['T', 'Th'], '10:00', '12:00'); // No conflict with section1
    const busy4 = mockBusyTime('B4', ['M'], '11:00', '12:00');    // Touches section1, no overlap
    const busy5 = mockBusyTime('B5', ['W'], '13:00', '14:30'); // Exact overlap with section2 lecture

    it('should return true for conflicting busy times', () => {
      expect(isSectionConflictWithBusyTimes(section1, [busy1])).toBe(true);
      expect(isSectionConflictWithBusyTimes(section1, [busy2])).toBe(true);
      expect(isSectionConflictWithBusyTimes(section2, [busy2])).toBe(true); // Lab conflict
      expect(isSectionConflictWithBusyTimes(section2, [busy5])).toBe(true); // Lecture exact conflict
      expect(isSectionConflictWithBusyTimes(section1, [busy3, busy1])).toBe(true); // One conflict in list
    });

    it('should return false for non-conflicting busy times', () => {
      expect(isSectionConflictWithBusyTimes(section1, [busy3])).toBe(false);
      expect(isSectionConflictWithBusyTimes(section1, [busy4])).toBe(false);
      expect(isSectionConflictWithBusyTimes(section2, [busy3, busy4])).toBe(false);
    });

    it('should handle empty or invalid inputs gracefully', () => {
      expect(isSectionConflictWithBusyTimes(section1, [])).toBe(false);
      // @ts-expect-error
      expect(isSectionConflictWithBusyTimes(section1, null)).toBe(false);
      expect(isSectionConflictWithBusyTimes(section1, [
        mockBusyTime('B-InvalidDay', [], '10:00', '11:00')
      ])).toBe(false);
      expect(isSectionConflictWithBusyTimes(section1, [
        // @ts-expect-error
        mockBusyTime('B-InvalidTime', ['M'], null, '11:00')
      ])).toBe(false);
      const sectionNoSchedule = mockCourseSection('CS-NOSCHED', []);
      expect(isSectionConflictWithBusyTimes(sectionNoSchedule, [busy1])).toBe(false);
      const sectionInvalidSchedule = mockCourseSection('CS-INVALIDSCHED', [
        // @ts-expect-error
        { days: null, startTime: '10:00', endTime: '11:00' }
      ]);
      expect(isSectionConflictWithBusyTimes(sectionInvalidSchedule, [busy1])).toBe(false);
       // @ts-expect-error
      expect(isSectionConflictWithBusyTimes(null, [busy1])).toBe(false);
    });
  });

  describe('isSectionConflictWithOtherSections', () => {
    const s1 = mockCourseSection('CS101-001', [mockSectionSchedule('M,W,F', '10:00', '11:00')]); // MWF 10-11
    const s2 = mockCourseSection('CS102-001', [mockSectionSchedule('M,W', '10:30', '11:30')]);   // MW 10:30-11:30 (conflicts s1)
    const s3 = mockCourseSection('CS103-001', [mockSectionSchedule('T,Th', '10:00', '11:30')]);  // TTh 10-11:30 (no conflict s1)
    const s4 = mockCourseSection('CS104-001', [mockSectionSchedule('F', '11:00', '12:00')]);     // F 11-12 (touches s1)
    const s5_multi = mockCourseSection('CS201-001', [ // Multi-meeting section
      mockSectionSchedule('M,W', '14:00', '15:00'), // MW 2-3pm
      mockSectionSchedule('F', '10:00', '12:00'),   // F 10-12 (conflicts s1 on F)
    ]);
    const s6_multi_nocash = mockCourseSection('CS202-001', [ // Multi-meeting section
      mockSectionSchedule('M,W', '16:00', '17:00'),
      mockSectionSchedule('Th', '09:00', '11:00'),   // Conflicts s3 on Th
    ]);

    it('should return true for conflicting sections', () => {
      expect(isSectionConflictWithOtherSections(s1, [s2])).toBe(true);
      expect(isSectionConflictWithOtherSections(s2, [s1])).toBe(true);
      expect(isSectionConflictWithOtherSections(s1, [s3, s2])).toBe(true); // s2 conflicts
      expect(isSectionConflictWithOtherSections(s1, [s5_multi])).toBe(true); // s5_multi conflicts on Friday
      expect(isSectionConflictWithOtherSections(s5_multi, [s1])).toBe(true);
      expect(isSectionConflictWithOtherSections(s3, [s6_multi_nocash])).toBe(true); // s6_multi_nocash conflicts on Thursday
      expect(isSectionConflictWithOtherSections(s6_multi_nocash, [s3])).toBe(true);
    });

    it('should return false for non-conflicting sections', () => {
      expect(isSectionConflictWithOtherSections(s1, [s3])).toBe(false);
      expect(isSectionConflictWithOtherSections(s1, [s4])).toBe(false); // Touching
      expect(isSectionConflictWithOtherSections(s1, [s3, s4])).toBe(false);
      expect(isSectionConflictWithOtherSections(s1, [s6_multi_nocash])).toBe(false); // s1 vs s6
    });

    it('should return false if trying to conflict a section with itself', () => {
      expect(isSectionConflictWithOtherSections(s1, [s1])).toBe(false); // Should skip itself by ID
      // A bit more complex: s1, s2 (conflict), s1 (self)
      // This test is more about ensuring the self-check works.
      // The function is `isSectionConflictWithOtherSections`, so s1 vs [s2, s1_clone_different_id]
      const s1_clone_same_id = mockCourseSection('CS101-001', [mockSectionSchedule('M,W,F', '10:00', '11:00')]);
      expect(isSectionConflictWithOtherSections(s1, [s2, s1_clone_same_id])).toBe(true); // s2 causes true, s1_clone is skipped
    });

    it('should handle empty or invalid inputs gracefully', () => {
      expect(isSectionConflictWithOtherSections(s1, [])).toBe(false);
      // @ts-expect-error
      expect(isSectionConflictWithOtherSections(s1, null)).toBe(false);
      const sectionNoSchedule = mockCourseSection('CS-NOSCHED', []);
      expect(isSectionConflictWithOtherSections(s1, [sectionNoSchedule])).toBe(false);
      // @ts-expect-error
      expect(isSectionConflictWithOtherSections(null, [s1])).toBe(false);
      expect(isSectionConflictWithOtherSections(sectionNoSchedule, [s1])).toBe(false);

      const s_invalid_meeting = mockCourseSection('CS-INVALIDMEET', [
        // @ts-expect-error
        { days: 'M', startTime: null, endTime: '10:00' }
      ]);
      expect(isSectionConflictWithOtherSections(s1, [s_invalid_meeting])).toBe(false);
      expect(isSectionConflictWithOtherSections(s_invalid_meeting, [s1])).toBe(false);
    });
  });
});
