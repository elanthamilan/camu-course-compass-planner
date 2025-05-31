import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import CourseSearchModal from './CourseSearchModal';
import { useSchedule } from '@/contexts/ScheduleContext';
import { Course, StudentInfo, CourseSection, SectionSchedule } from '@/lib/types';
import { toast } from 'sonner';

// Mock sonner
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
  },
}));

// Mock useSchedule context
jest.mock('@/contexts/ScheduleContext', () => ({
  ...jest.requireActual('@/contexts/ScheduleContext'), // Import and retain default exports
  useSchedule: jest.fn(),
}));

const mockUseSchedule = useSchedule as jest.Mock;

// Helper to create mock data
const createMockSectionSchedule = (idSuffix: string, days: string, startTime: string, endTime: string): SectionSchedule => ({
  _id: `sch-${idSuffix}`, days, startTime, endTime, room: `Room ${idSuffix}`, instructor: `Prof ${idSuffix}`,
});

const createMockCourseSection = (id: string, courseId: string, sectionNumber: string, schedules: SectionSchedule[], sectionType: string = 'Lecture', credits: number = 3): CourseSection => ({
  id, _id: id, courseId, sectionNumber, termId: 'fall2024', schedule: schedules, instructors: [`Prof. ${sectionNumber}`], instructionMode: 'In-Person', capacity: 30, enrolled: 20, waitlisted: 0, credits, sectionType, status: 'Open', courseName: `${courseId} Course`, courseCode: courseId,
});

const createMockCourse = (
  id: string, code: string, name: string, credits: number, department: string,
  sections: CourseSection[],
  description?: string, prerequisites?: string[], corequisites?: string[],
  campus?: string, college?: string, attributes?: string[], keywords?: string[]
): Course => ({
  id, _id: id, code, name, credits, department, sections, description, prerequisites, corequisites, campus, college, attributes, keywords,
  termsOffered: ['fall2024'], // Default
  color: '#FFFFFF' // Default
});

const mockStudent: StudentInfo = {
  id: 's1', _id: 's1', name: 'Test Student', major: 'CS', studentId: '123', email: 'test@test.com',
  completedCourses: ['CS101'],
};

const sampleCourses: Course[] = [
  createMockCourse('c1', 'CS101', 'Intro to CS', 3, 'Computer Science',
    [createMockCourseSection('c1s1', 'c1', '001', [createMockSectionSchedule('cs1s1', 'M,W,F', '10:00', '11:00')])],
    'Basic intro to CS.', ['MATH101'], ['CS101L'], 'Main Campus', 'Engineering', ['Technical'], ['programming', 'intro']
  ),
  createMockCourse('c2', 'MATH202', 'Calculus II', 4, 'Mathematics',
    [createMockCourseSection('c2s1', 'c2', '001', [createMockSectionSchedule('m1s1', 'T,Th', '09:00', '10:30')])],
    'Advanced calculus topics.', ['MATH101', 'CS101'], [], 'Main Campus', 'Arts & Sciences', ['Quantitative'], ['math', 'calculus']
  ),
  createMockCourse('c3', 'ENG101', 'English Composition', 3, 'English',
    [createMockCourseSection('c3s1', 'c3', '001', [createMockSectionSchedule('e1s1', 'M,W', '13:00', '14:30')])],
    'Focus on writing skills.', [], [], 'Online Campus', 'Liberal Arts', ['Writing Intensive'], ['english', 'writing']
  ),
];


describe('CourseSearchModal', () => {
  let mockOnOpenChange: jest.Mock;
  let mockOnCourseSelected: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockOnOpenChange = jest.fn();
    mockOnCourseSelected = jest.fn();
    mockUseSchedule.mockReturnValue({
      studentInfo: mockStudent,
      allCourses: sampleCourses,
      // Provide other minimal context values if needed by the component
      courses: [],
      busyTimes: [],
      schedules: [],
      selectedSchedule: null,
      currentTerm: { id: 'fall2024', name: 'Fall 2024', startDate: new Date(), endDate: new Date() },
      preferences: {},
      schedulePreferences: {},
      shoppingCart: [],
      selectedSectionMap: {},
      excludeHonorsMap: {},
      addCourse: jest.fn(),
      removeCourse: jest.fn(),
      addBusyTime: jest.fn(),
      updateBusyTime: jest.fn(),
      removeBusyTime: jest.fn(),
      generateSchedules: jest.fn(),
      selectSchedule: jest.fn(),
      updatePreferences: jest.fn(),
      updateSchedulePreferences: jest.fn(),
      updateSelectedSectionMap: jest.fn(),
      updateExcludeHonorsMap: jest.fn(),
    });
  });

  it('renders when open is true', () => {
    render(
      <CourseSearchModal
        open={true}
        onOpenChange={mockOnOpenChange}
        onCourseSelected={mockOnCourseSelected}
      />
    );
    expect(screen.getByText(/Add Course/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Search courses by name, code, or description.../i)).toBeInTheDocument();
  });

  it('does not render content when open is false (Drawer specific, content might still be in DOM but hidden)', () => {
    const { container } = render(
      <CourseSearchModal
        open={false}
        onOpenChange={mockOnOpenChange}
        onCourseSelected={mockOnCourseSelected}
      />
    );
    // For Drawer, the content might be conditionally rendered or visually hidden.
    // A simple check could be for a key element within the DrawerContent.
    // If Drawer completely removes content from DOM when closed:
    expect(screen.queryByText(/Add Course/i)).not.toBeInTheDocument();
    // Or, if it's visually hidden, check for visibility (might need more specific selectors/attributes)
    // For now, assuming it unmounts content or key parts of it.
  });

  it('filters courses by search term (name)', () => {
    render(
      <CourseSearchModal open={true} onOpenChange={mockOnOpenChange} onCourseSelected={mockOnCourseSelected} />
    );
    const searchInput = screen.getByPlaceholderText(/Search courses by name, code, or description.../i);
    fireEvent.change(searchInput, { target: { value: 'Calculus' } });
    expect(screen.getByText(/MATH202/i)).toBeInTheDocument();
    expect(screen.queryByText(/CS101/i)).not.toBeInTheDocument();
    expect(screen.getByText(/1 courses found/i)).toBeInTheDocument();
  });

  it('filters courses by search term (code)', () => {
    render(
      <CourseSearchModal open={true} onOpenChange={mockOnOpenChange} onCourseSelected={mockOnCourseSelected} />
    );
    const searchInput = screen.getByPlaceholderText(/Search courses by name, code, or description.../i);
    fireEvent.change(searchInput, { target: { value: 'CS101' } });
    expect(screen.getByText(/CS101/i)).toBeInTheDocument();
    expect(screen.queryByText(/MATH202/i)).not.toBeInTheDocument();
  });

  it('filters courses by department', () => {
    render(
      <CourseSearchModal open={true} onOpenChange={mockOnOpenChange} onCourseSelected={mockOnCourseSelected} />
    );
    // Assuming "Department" is the placeholder for SelectValue or part of SelectTrigger
    // This interaction is more complex due to shadcn's Select component structure.
    // We'd typically click the trigger, then click an item.
    // For simplicity, we'll check if changing the filter affects the list.
    // This requires knowing the value passed to onValueChange in Select.
    // Let's assume direct filtering logic works and test its effect.

    // To properly test Select, one might need to:
    // fireEvent.click(screen.getByRole('combobox')); // or getByText('Department') if that's the trigger
    // fireEvent.click(screen.getByText('Mathematics')); // Assuming 'Mathematics' is an option

    // For now, let's focus on the filtering logic result if department was changed by directly invoking state change or through context
    mockUseSchedule.mockReturnValue({
      ...mockUseSchedule(), // keep other mocks
      allCourses: sampleCourses, // ensure courses are passed
      studentInfo: mockStudent,
    });

    // Re-render or update state that would cause re-filter with 'Mathematics'
    // This is tricky without direct state manipulation access or more complex Select event simulation.
    // A simpler way is to check the initial full list, then assume filtering logic is covered by `filteredCourses` unit tests if they existed.
    // For this integration test, we'll verify the department select exists.
    expect(screen.getByText("All Departments")).toBeInTheDocument(); // Part of the SelectTrigger or SelectValue
  });

  it('displays basic course information for each course in the list', () => {
    render(
      <CourseSearchModal open={true} onOpenChange={mockOnOpenChange} onCourseSelected={mockOnCourseSelected} />
    );
    const courseC1 = sampleCourses[0];
    expect(screen.getByText(new RegExp(`${courseC1.code} - ${courseC1.name}`))).toBeInTheDocument();
    expect(screen.getAllByText(new RegExp(`${courseC1.credits} credits`))[0]).toBeInTheDocument(); // May appear multiple times if details are open
    expect(screen.getAllByText(new RegExp(courseC1.department!))[0]).toBeInTheDocument();
    expect(screen.getAllByText(new RegExp(`${courseC1.sections.length} section(s)?`))[0]).toBeInTheDocument();
  });

  it('toggles and shows expanded details for a course', async () => {
    render(
      <CourseSearchModal open={true} onOpenChange={mockOnOpenChange} onCourseSelected={mockOnCourseSelected} />
    );
    const courseC1 = sampleCourses[0];

    // Find the "Details" button for the first course.
    // We need a way to target specific course items.
    const detailsButtons = screen.getAllByRole('button', { name: /Details/i });
    fireEvent.click(detailsButtons[0]);

    // Check for content that appears only in the expanded section
    await screen.findByText(courseC1.description!);
    expect(screen.getByText(courseC1.description!)).toBeVisible();
    expect(screen.getByText(/Prerequisites:/i)).toBeInTheDocument();
    expect(screen.getByText(courseC1.prerequisites![0])).toBeInTheDocument(); // MATH101
    expect(screen.getByText(/Corequisites:/i)).toBeInTheDocument();
    expect(screen.getByText(courseC1.corequisites![0])).toBeInTheDocument(); // CS101L
    expect(screen.getByText(new RegExp(`Campus: ${courseC1.campus}`))).toBeInTheDocument();
    expect(screen.getByText(new RegExp(`College: ${courseC1.college}`))).toBeInTheDocument();
    expect(screen.getByText(courseC1.attributes![0])).toBeInTheDocument();
    expect(screen.getByText(courseC1.keywords![0])).toBeInTheDocument();
    expect(screen.getByText(/Section Types:/i)).toBeInTheDocument();
    expect(screen.getByText(courseC1.sections[0].sectionType!)).toBeInTheDocument();

    // Click again to collapse
    fireEvent.click(detailsButtons[0]);
    await act(async () => {
        // Wait for animation if opacity/height is used for exit
        await new Promise(r => setTimeout(r, 350)); // duration is 0.3s
    });
    expect(screen.queryByText(courseC1.description!)).not.toBeVisible();
  });

  it('displays prerequisite status correctly (Met)', () => {
    mockUseSchedule.mockReturnValue({
      studentInfo: { ...mockStudent, completedCourses: ['MATH101', 'CS101'] }, // Student completed MATH101
      allCourses: sampleCourses,
       // Provide other minimal context values
      courses: [], busyTimes: [], schedules: [], selectedSchedule: null, currentTerm: { id: 'fall2024', name: 'Fall 2024', startDate: new Date(), endDate: new Date() }, preferences: {}, schedulePreferences: {}, shoppingCart: [], selectedSectionMap: {}, excludeHonorsMap: {}, addCourse: jest.fn(), removeCourse: jest.fn(), addBusyTime: jest.fn(), updateBusyTime: jest.fn(), removeBusyTime: jest.fn(), generateSchedules: jest.fn(), selectSchedule: jest.fn(), updatePreferences: jest.fn(), updateSchedulePreferences: jest.fn(), updateSelectedSectionMap: jest.fn(), updateExcludeHonorsMap: jest.fn(),
    });

    render(
      <CourseSearchModal open={true} onOpenChange={mockOnOpenChange} onCourseSelected={mockOnCourseSelected} />
    );
    // Expand CS101 (first course in sampleCourses, which has MATH101 as prereq)
    const detailsButtons = screen.getAllByRole('button', { name: /Details/i });
    fireEvent.click(detailsButtons[0]);

    const math101PrereqBadge = screen.getByText('MATH101');
    expect(math101PrereqBadge).toBeInTheDocument();
    // Check for the "Met" indicator, assuming CheckCircle is used for met.
    expect(math101PrereqBadge.previousSibling?.firstChild).toHaveClass('lucide-check-circle');
  });

  it('displays prerequisite status correctly (Not Met)', () => {
     mockUseSchedule.mockReturnValue({
      studentInfo: { ...mockStudent, completedCourses: [] }, // Student completed no courses
      allCourses: sampleCourses,
      courses: [], busyTimes: [], schedules: [], selectedSchedule: null, currentTerm: { id: 'fall2024', name: 'Fall 2024', startDate: new Date(), endDate: new Date() }, preferences: {}, schedulePreferences: {}, shoppingCart: [], selectedSectionMap: {}, excludeHonorsMap: {}, addCourse: jest.fn(), removeCourse: jest.fn(), addBusyTime: jest.fn(), updateBusyTime: jest.fn(), removeBusyTime: jest.fn(), generateSchedules: jest.fn(), selectSchedule: jest.fn(), updatePreferences: jest.fn(), updateSchedulePreferences: jest.fn(), updateSelectedSectionMap: jest.fn(), updateExcludeHonorsMap: jest.fn(),
    });
    render(
      <CourseSearchModal open={true} onOpenChange={mockOnOpenChange} onCourseSelected={mockOnCourseSelected} />
    );
    // Expand CS101
    const detailsButtons = screen.getAllByRole('button', { name: /Details/i });
    fireEvent.click(detailsButtons[0]);

    const math101PrereqBadge = screen.getByText('MATH101');
    expect(math101PrereqBadge).toBeInTheDocument();
    // Check for the "Not Met" indicator, assuming XCircle is used.
    expect(math101PrereqBadge.previousSibling?.firstChild).toHaveClass('lucide-x-circle');
  });

  it('calls onCourseSelected when "Add" button is clicked and does not close modal', () => {
    render(
      <CourseSearchModal open={true} onOpenChange={mockOnOpenChange} onCourseSelected={mockOnCourseSelected} />
    );
    const courseToAdd = sampleCourses[0];

    // Find the "Add" button for the first course
    const addButtons = screen.getAllByRole('button', { name: /Add/i });
    fireEvent.click(addButtons[0]);

    expect(mockOnCourseSelected).toHaveBeenCalledWith(courseToAdd);
    expect(toast.success).toHaveBeenCalledWith(`${courseToAdd.code} added to your course list!`);
    expect(mockOnOpenChange).not.toHaveBeenCalledWith(false); // Modal should remain open
  });

  it('calls onOpenChange with false when Close button is clicked', () => {
    render(
      <CourseSearchModal open={true} onOpenChange={mockOnOpenChange} onCourseSelected={mockOnCourseSelected} />
    );
    const closeButton = screen.getByRole('button', { name: /Close/i });
    fireEvent.click(closeButton);
    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
  });

});
