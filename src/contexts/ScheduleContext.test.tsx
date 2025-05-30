import React, { useContext, useEffect } from 'react';
import { render, act, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ScheduleProvider, useSchedule, ScheduleContextType, SchedulePreferences } from './ScheduleContext';
import { Course, BusyTime, CourseSection, Term, Schedule } from '@/lib/types';
import { toast } from 'sonner';

// Mock sonner
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
  },
}));

// Define mock data directly inside the factory function for jest.mock
jest.mock('@/lib/mock-data', () => {
  const localMockedTestCourses: Course[] = [
    {
      id: 'C1', code: 'CS101', name: 'Intro to CS', credits: 3, department: 'CS',
      sections: [
        { id: 'C1-S1', sectionNumber: '001', days: ['M', 'W'], startTime: '09:00', endTime: '10:15', instructor: 'Dr. A', termId: 'T1', location: 'Room 101', sectionType: 'Lecture' },
        { id: 'C1-S2', sectionNumber: '002', days: ['T', 'Th'], startTime: '14:00', endTime: '15:15', instructor: 'Dr. A', termId: 'T1', location: 'Room 102', sectionType: 'Lecture' },
        { id: 'C1-S3', sectionNumber: '003', days: ['F'], startTime: '10:00', endTime: '12:50', instructor: 'Dr. A', termId: 'T1', location: 'Room 103', sectionType: 'Lecture' },
      ],
      prerequisites: [],
    },
    {
      id: 'C2', code: 'MA201', name: 'Calculus I', credits: 4, department: 'MATH',
      sections: [
        { id: 'C2-S1', sectionNumber: '001', days: ['M', 'W'], startTime: '10:30', endTime: '11:45', instructor: 'Dr. B', termId: 'T1', location: 'Room 201', sectionType: 'Lecture' },
        { id: 'C2-S2', sectionNumber: '002', days: ['T', 'Th'], startTime: '13:00', endTime: '14:15', instructor: 'Dr. B', termId: 'T1', location: 'Room 202', sectionType: 'Lecture' },
      ],
      prerequisites: [],
    },
    {
      id: 'C3', code: 'ENG101', name: 'English Comp', credits: 3, department: 'ENG',
      sections: [
        { id: 'C3-S1', sectionNumber: '001', days: ['M', 'W'], startTime: '13:00', endTime: '14:15', instructor: 'Dr. C', termId: 'T1', location: 'Room 301', sectionType: 'Lecture' },
        { id: 'C3-S2', sectionNumber: '002', days: ['T', 'Th'], startTime: '09:00', endTime: '10:15', instructor: 'Dr. C', termId: 'T1', location: 'Room 302', sectionType: 'Lecture' },
      ],
      prerequisites: [],
    },
    {
      id: 'C4', code: 'HIST105', name: 'World History', credits: 3, department: 'HIST',
      sections: [
        { id: 'C4-S1', sectionNumber: '001', days: ['M'], startTime: '15:00', endTime: '17:50', instructor: 'Dr. D', termId: 'T1', location: 'Room 401', sectionType: 'Lecture'},
        { id: 'C4-S2', sectionNumber: '002', days: ['W'], startTime: '15:00', endTime: '17:50', instructor: 'Dr. D', termId: 'T1', location: 'Room 401', sectionType: 'Lecture'},
      ],
      prerequisites: [],
    }
  ];
  const localMockedTestBusyTimes: BusyTime[] = [
    { id: 'B1', title: 'Work', days: ['M', 'W'], startTime: '12:00', endTime: '17:00', termId: 'T1' },
  ];
  const localMockedTestTerms: Term[] = [
    {id: 'T1', name: 'Test Term 1', startDate: new Date('2024-01-01'), endDate: new Date('2024-05-15')}
  ];
  const localMockSchedules: Schedule[] = [
    {
      id: 'S1', name: 'Test Schedule 1', termId: 'T1',
      sections: [localMockedTestCourses[0].sections[0]],
      totalCredits: 3, conflicts: [], busyTimes: []
    }
  ];
  return {
    ...jest.requireActual('@/lib/mock-data'),
    mockCourses: localMockedTestCourses,
    mockBusyTimes: localMockedTestBusyTimes,
    mockSchedules: localMockSchedules,
    mockTerms: localMockedTestTerms,
    mockStudent: { studentId: "testStudent", name: "Test Student", majorId: "cs", completedCourses:[]}
  };
});

const mockedTestCourses: Course[] = jest.requireMock('@/lib/mock-data').mockCourses;

let lastGeneratedSchedules: any[] = [];
let lastBusyTimes: BusyTime[] = [];


const GenerateSchedulesTestConsumer: React.FC<{
  coursesToSelect?: string[];
  fixedSectionsToPass?: CourseSection[];
  prefsToSet?: Partial<SchedulePreferences>;
  generateButtonText?: string;
}> = ({ coursesToSelect = [], fixedSectionsToPass, prefsToSet, generateButtonText = "Generate" }) => {
  const context = useSchedule();
  if (!context) throw new Error("useSchedule must be used within ScheduleProvider");

  const {
    generateSchedules, schedules, busyTimes, courses,
    selectTerm, currentTerm, allTerms, updateSchedulePreferences,
  } = context;

  useEffect(() => {
    if (allTerms.length > 0 && !currentTerm) {
        selectTerm(allTerms[0].id);
    }
  }, [currentTerm, selectTerm, allTerms]);

  useEffect(() => {
    if (prefsToSet) {
        updateSchedulePreferences(prefsToSet);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefsToSet]);

  useEffect(() => {
    lastGeneratedSchedules = schedules;
    lastBusyTimes = busyTimes;
  }, [schedules, busyTimes]);

  return (
    <div>
      {coursesToSelect.length > 0 && generateButtonText && (
          <button onClick={() => generateSchedules(coursesToSelect, fixedSectionsToPass)}>
            {generateButtonText}
          </button>
      )}
      <div data-testid="schedules-count">{schedules ? schedules.length : 0}</div>
      <div data-testid="courses-count">{courses ? courses.length : 0}</div>
    </div>
  );
};


const timeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

const doTimesOverlap = (startA: string, endA: string, startB: string, endB: string): boolean => {
  const startAMin = timeToMinutes(startA);
  const endAMin = timeToMinutes(endA);
  const startBMin = timeToMinutes(startB);
  const endBMin = timeToMinutes(endB);
  return startAMin < endBMin && endAMin > startBMin;
};

describe('ScheduleContext - generateSchedules', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    lastGeneratedSchedules = [];
    lastBusyTimes = [];
  });

  test('generates conflict-free schedules with selected courses', async () => {
    render(
      <ScheduleProvider>
        <GenerateSchedulesTestConsumer coursesToSelect={['C1', 'C3']} generateButtonText="Generate Base" />
      </ScheduleProvider>
    );
    expect(screen.getByTestId('courses-count').textContent).toBe('3');

    await act(async () => {
      fireEvent.click(screen.getByText('Generate Base'));
      await new Promise(resolve => setTimeout(resolve, 600));
    });

    expect(toast.info).toHaveBeenCalledWith("Generating schedules based on preferences...");
    expect(toast.success).toHaveBeenCalledWith(expect.stringContaining("new schedule(s) generated!"));
    expect(lastGeneratedSchedules.length).toBeGreaterThan(0);

    const courseIdsToSchedule = ['C1', 'C3'];
    const foundScheduleWithAllSelectedCourses = lastGeneratedSchedules.some(schedule => {
      const scheduledCourseIds = new Set(schedule.sections.map((s: CourseSection) => s.id.split('-')[0]));
      return courseIdsToSchedule.every(id => scheduledCourseIds.has(id));
    });
    expect(foundScheduleWithAllSelectedCourses).toBe(true);

    for (const schedule of lastGeneratedSchedules) {
      for (let i = 0; i < schedule.sections.length; i++) {
        const sectionA = schedule.sections[i];
        for (let j = i + 1; j < schedule.sections.length; j++) {
          const sectionB = schedule.sections[j];
          if (sectionA.days.some((day: string) => sectionB.days.includes(day))) {
            expect(doTimesOverlap(sectionA.startTime, sectionA.endTime, sectionB.startTime, sectionB.endTime)).toBe(false);
          }
        }
        for (const busyTime of lastBusyTimes) {
          if (busyTime.termId === sectionA.termId && sectionA.days.some((day: string) => busyTime.days.includes(day))) {
            expect(doTimesOverlap(sectionA.startTime, sectionA.endTime, busyTime.startTime, busyTime.endTime)).toBe(false);
          }
        }
      }
    }
  });

  test.skip('generates schedules respecting preferences (morning and no Fridays)', async () => {
    render(
        <ScheduleProvider>
          <GenerateSchedulesTestConsumer
            coursesToSelect={['C1', 'C2']}
            prefsToSet={{ timePreference: 'morning', avoidFridayClasses: true }}
            generateButtonText="Generate With Prefs"
          />
        </ScheduleProvider>
    );

    await act(async () => {
      fireEvent.click(screen.getByText('Generate With Prefs'));
      await new Promise(resolve => setTimeout(resolve, 600));
    });

    expect(lastGeneratedSchedules.length).toBeGreaterThan(0);
    for (const schedule of lastGeneratedSchedules) {
      expect(schedule.sections.length).toBeGreaterThan(0);
      for (const section of schedule.sections) {
        expect(timeToMinutes(section.endTime)).toBeLessThanOrEqual(13 * 60);
        expect(section.days.includes('F')).toBe(false);
      }
    }
  });

  test.skip('generates schedules with fixed sections and no conflicts', async () => {
    const fixedSection = mockedTestCourses.find(c => c.id === 'C1')?.sections[0];
    if (!fixedSection) throw new Error("Fixed section C1-S1 not found in mock data");

    render(
      <ScheduleProvider>
        <GenerateSchedulesTestConsumer
            coursesToSelect={['C3']}
            sectionsToFix={[fixedSection]}
            generateButtonText="Generate With Fixed"
        />
      </ScheduleProvider>
    );

    await act(async () => {
      fireEvent.click(screen.getByText('Generate With Fixed'));
      await new Promise(resolve => setTimeout(resolve, 600));
    });

    expect(lastGeneratedSchedules.length).toBeGreaterThan(0);
    for (const schedule of lastGeneratedSchedules) {
      const fixedSectionInSchedule = schedule.sections.find((s: CourseSection) => s.id === fixedSection.id);
      expect(fixedSectionInSchedule).toBeDefined();

      for (const section of schedule.sections) {
        if (section.id === fixedSection.id) continue;
        if (section.days.some((day: string) => fixedSection.days.includes(day))) {
          expect(doTimesOverlap(section.startTime, section.endTime, fixedSection.startTime, fixedSection.endTime)).toBe(false);
        }
        for (const busyTime of lastBusyTimes) {
            if (busyTime.termId === section.termId && section.days.some((day: string) => busyTime.days.includes(day))) {
                expect(doTimesOverlap(section.startTime, section.endTime, busyTime.startTime, busyTime.endTime)).toBe(false);
            }
        }
      }
      const c3s2InSchedule = schedule.sections.find((s: CourseSection) => s.id === 'C3-S2');
      expect(c3s2InSchedule).toBeDefined();
    }
  });
});

// New test suite for Shopping Cart
describe('ScheduleContext - Shopping Cart', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('moveToCart correctly moves selectedSchedule to shoppingCart', async () => {
    let capturedContext: ScheduleContextType | null = null;
    const TestComponent = () => {
      capturedContext = useSchedule();
      // No automatic selection/moveToCart here, will be triggered by test.
      return null;
    };

    render(
      <ScheduleProvider> {/* Provider gives initial mockSchedules, S1 is selected by default by Provider */}
        <TestComponent />
      </ScheduleProvider>
    );

    // Ensure a schedule was selected (S1 is the first in mockSchedules from @/lib/mock-data)
    // The ScheduleProvider itself sets selectedSchedule to mockSchedules[0] if mockSchedules is not empty.
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0)); // Allow context to initialize
    });
    expect(capturedContext?.selectedSchedule?.id).toBe('S1');
    const scheduleToMove = capturedContext!.selectedSchedule;

    await act(async () => {
      capturedContext!.moveToCart();
    });

    expect(capturedContext!.shoppingCart).not.toBeNull();
    expect(capturedContext!.shoppingCart?.id).toBe(scheduleToMove!.id);
    expect(capturedContext!.shoppingCart?.name).toBe(scheduleToMove!.name);
    expect(toast.success).toHaveBeenCalledWith(`Schedule "${scheduleToMove!.name}" moved to registration cart!`);
  });

  test('clearCart correctly clears the shoppingCart', async () => {
     let capturedContext: ScheduleContextType | null = null;
     const TestComponent = () => {
       capturedContext = useSchedule();
       return null;
     };

     render(<ScheduleProvider><TestComponent /></ScheduleProvider>);

     // Ensure schedule S1 is selected and move it to cart for setup
     await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0)); // allow initial state to set
        if(capturedContext && capturedContext.schedules.length > 0 && !capturedContext.selectedSchedule) {
            capturedContext.selectSchedule(capturedContext.schedules[0].id);
        }
        await new Promise(resolve => setTimeout(resolve, 0)); // allow selection to process
        capturedContext!.moveToCart();
        await new Promise(resolve => setTimeout(resolve, 0)); // allow moveToCart to process
     });

    expect(capturedContext!.shoppingCart).not.toBeNull();
    if (!capturedContext!.shoppingCart) throw new Error("Cart was not populated for clearCart test");

    await act(async () => {
      capturedContext!.clearCart();
    });

    expect(capturedContext!.shoppingCart).toBeNull();
    expect(toast.info).toHaveBeenCalledWith('Shopping cart cleared.');
  });
});
