import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import { TooltipProvider } from '@radix-ui/react-tooltip';
import CourseDashboard from './CourseDashboard';
import { ScheduleProvider } from '@/contexts/ScheduleContext';

// Mock dependencies
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
}));

jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
  },
}));

// Mock child components
jest.mock('./WhatIfDegreeAuditView', () => () => <div data-testid="mock-whatif-audit-view">WhatIfDegreeAuditView</div>);
jest.mock('./CourseSearch', () => ({ open, onOpenChange, termId, onCourseSelected }: any) =>
  open ? (
    <div data-testid="mock-course-search">
      Mock Course Search for {termId}
      <button onClick={() => onCourseSelected({ id: 'testCS101', code: 'CS101', name: 'Test Course 101', credits: 3, days: 'MWF', time: '10:00', prerequisites: [] }, termId)}>
        Add CS101
      </button>
      <button onClick={() => onOpenChange(false)}>Close Search</button>
    </div>
  ) : null
);
jest.mock('./ViewScheduleDialog', () => () => <div data-testid="mock-view-schedule-dialog">ViewScheduleDialog</div>);
jest.mock('./AddSemesterDialog', () => ({ open, onOpenChange, onAddSemester }: any) =>
  open ? (
    <div data-testid="mock-add-semester-dialog">
      Mock Add Semester Dialog
      <button onClick={() => onAddSemester({ year: '2025', semesterType: 'Fall' })}>
        Add Fall 2025
      </button>
      <button onClick={() => onAddSemester({ year: '2025', semesterType: 'Spring' })}>
        Add Spring 2025
      </button>
      <button onClick={() => onAddSemester({ year: '2026', semesterType: 'Spring' })}>
        Add Spring 2026
      </button>
      <button onClick={() => onOpenChange(false)}>Close Add Semester</button>
    </div>
  ) : null
);
jest.mock('./CourseCatalogView', () => () => <div data-testid="mock-course-catalog-view">CourseCatalogView</div>);

// Mock degree-audit-utils
jest.mock('../lib/degree-audit-utils', () => ({
  ...jest.requireActual('../lib/degree-audit-utils'),
  calculateDegreeAudit: jest.fn(() => ([
    { id: 'actual-core', name: 'Actual Core Req', progress: 0.75, requiredCredits: 40, courses: ['CS101', 'MA101'], category: 'Core', fulfilledCourses: ["CS101", "MA101"], remainingCourses: ["CS201"], status: 'partially_fulfilled', subRequirements:[], feedback:'' },
  ])),
  calculateWhatIfAudit: jest.fn(() => ([
    { id: 'whatif-core', name: 'What-If Core Req', progress: 0.5, requiredCredits: 20, courses: ['WHATIF101'], category: 'Core', fulfilledCourses: [], remainingCourses: ['WHATIF101'], status: 'partially_fulfilled', subRequirements: [], feedback: '' },
    { id: 'whatif-elec', name: 'What-If Elec Req', progress: 0, requiredCredits: 10, courses: ['WHATIF201'], category: 'Elective', fulfilledCourses: [], remainingCourses: ['WHATIF201'], status: 'not_fulfilled', subRequirements: [], feedback: '' },
  ])),
}));

const mockStudentInfoForProvider = {
  studentId: "provider123",
  name: "Provider Student",
  major: "Philosophy",
  majorId: "phil_major",
  minor: null,
  minorId: null,
  email: "provider@example.com",
  totalCredits: 60,
  requiredCredits: 120,
  completedCourses: ["CS101", "MA101"],
};

const AllTheProviders: React.FC<{children: React.ReactNode}> = ({ children }) => {
  return (
    <TooltipProvider>
      <ScheduleProvider initialStudentInfo={mockStudentInfoForProvider} initialSchedule={{ courses: [] }}>
        {children}
      </ScheduleProvider>
    </TooltipProvider>
  );
};

const renderWithProviders = (ui: React.ReactElement) => {
  return render(ui, { wrapper: AllTheProviders });
};

jest.mock('@/lib/mock-data', () => ({
  mockPrograms: [
    { id: 'cs', name: 'Computer Science', type: 'Major', totalCreditsRequired: 120, requirements: [], description: 'CS Major desc' },
    { id: 'math_major', name: 'Mathematics Major', type: 'Major', totalCreditsRequired: 110, requirements: [], description: 'Math Major desc' },
    { id: 'phil_major', name: 'Philosophy', type: 'Major', totalCreditsRequired: 100, requirements:[], description: 'Phil Major desc'},
    { id: 'math_minor', name: 'Mathematics Minor', type: 'Minor', totalCreditsRequired: 18, requirements: [], description: 'Math Minor desc' },
  ],
  mockCourses: [
    { id: 'cs101', code: 'CS101', name: 'Introduction to Computer Science', credits: 3, department: 'CS', keywords: ['intro', 'programming'], sections:[], prerequisites:[] },
    { id: 'math101', code: 'MA101', name: 'Calculus I', credits: 4, department: 'MATH', sections: [], prerequisites: [] },
    { id: 'eng101', code: 'ENG101', name: 'English Composition I', credits: 3, department: 'ENG', sections: [], prerequisites: [] },
    { id: 'math105', code: 'MATH105', name: 'Pre-Calculus', credits: 3, department: 'MATH', keywords: ['algebra'], sections:[], prerequisites:[] },
    { id: 'eng234', code: 'ENG234', name: 'Composition II', credits: 3, department: 'ENG', keywords: ['writing'], sections:[], prerequisites:["ENG100"] },
    { id: 'phys210', code: 'PHYS210', name: 'Physics I: Mechanics', credits: 4, department: 'PHYS', keywords: ['mechanics'], sections:[], prerequisites:[] },
    { id: 'phil101', code: 'PHIL101', name: 'Introduction to Logic', credits: 3, department: 'PHIL', keywords: ['logic'], sections:[], prerequisites:[] },
    { id: 'univ100', code: 'UNIV100', name: 'University Seminar', credits: 1, department: 'UNIV', keywords: ['seminar'], sections:[], prerequisites:[] },
    { id: 'testCS101', code: 'CS101', name: 'Test Course 101', credits: 3, days: 'MWF', time: '10:00', prerequisites: [], sections:[] },
    { id: 'WHATIF101', code: 'WHATIF101', name: 'What If Intro', credits: 3, department: 'WHATIF', sections:[], prerequisites:[] },
    { id: 'WHATIF201', code: 'WHATIF201', name: 'What If Advanced', credits: 3, department: 'WHATIF', sections:[], prerequisites:[] },
  ],
  mockMandatoryCourses: [
    { code: "CS101", name: "Intro to CS", status: "Completed", credits: 3, prerequisites: [] },
    { code: "MATH203", name: "Calculus I", status: "Need to Take", credits: 4, prerequisites: ["MATH105"] },
  ],
  mockSchedules: [],
  mockBusyTimes: [],
  mockTerms: [{ id: "term1", name: "Fall 2024", startDate: new Date(), endDate: new Date() }],
  mockStudent: {
    studentId: "context123",
    name: "Context Student",
    major: "Computer Science",
    majorId: "cs",
    minor: null, minorId: null, email: "context@example.com",
    totalCredits: 7,
    requiredCredits: 120,
    completedCourses: ["CS101", "MA101"],
  },
}));


describe('CourseDashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders the academic planning dashboard', () => {
    renderWithProviders(<CourseDashboard />);
    expect(screen.getByText('Academic Planning')).toBeInTheDocument();
    expect(screen.getByText('Plan My Classes')).toBeInTheDocument();
  });

  describe('Semester Management', () => {
    test('allows adding a new semester', () => {
      renderWithProviders(<CourseDashboard />);
      const addSemesterButtons = screen.getAllByText('Add Semester', { exact: false });
      fireEvent.click(addSemesterButtons[0]);
      expect(screen.getByTestId('mock-add-semester-dialog')).toBeVisible();
      const addFall2025Button = screen.getByText('Add Fall 2025');
      fireEvent.click(addFall2025Button);
      expect(screen.queryByTestId('mock-add-semester-dialog')).not.toBeInTheDocument();
      const year2025Card = screen.getByText('2025 - 2026').closest('div[class*="relative"]');
      expect(year2025Card).toBeInTheDocument();
      if (!year2025Card) throw new Error("Year 2025 - 2026 card not found");
      const fallHeadings = within(year2025Card).getAllByRole('heading', { name: "Fall", level: 3 });
      let fall2025SemesterCard = null;
      for (const heading of fallHeadings) {
        const card = heading.closest('div[class*="rounded-lg"][class*="border"]');
        if (card && within(card).queryByText('0 credits')) {
          fall2025SemesterCard = card;
          break;
        }
      }
      expect(fall2025SemesterCard).toBeInTheDocument();
      if (!fall2025SemesterCard) throw new Error("Fall 2025 semester card with 0 credits not found");
      expect(within(fall2025SemesterCard).getByText('0 credits')).toBeInTheDocument();
    });

    test('allows removing an empty semester and prevents removing a semester with courses', async () => {
      renderWithProviders(<CourseDashboard />);
      const addSemesterButtons = screen.getAllByText('Add Semester', { exact: false });
      fireEvent.click(addSemesterButtons[0]);
      fireEvent.click(screen.getByText('Add Spring 2026'));
      const year2026CardRemoveTest = await screen.findByText('2026 - 2027');
      const springYearContainer = year2026CardRemoveTest.closest('div[class*="relative"]');
      expect(springYearContainer).toBeInTheDocument();
      if (!springYearContainer) throw new Error("Spring 2026's year container not found for removal test");
      const springHeadings = within(springYearContainer).getAllByRole('heading', { name: "Spring", level: 3 });
      let springSemesterCard: HTMLElement | null = null;
      for (const heading of springHeadings) {
        const card = heading.closest('div[class*="rounded-lg"][class*="border"]');
        if (card && within(card).queryByText('0 credits')) {
          springSemesterCard = card;
          break;
        }
      }
      expect(springSemesterCard).toBeInTheDocument();
      if (!springSemesterCard) throw new Error("Spring 2026 card with 0 credits not found for removal");
      const cardHeader = springSemesterCard.firstChild;
      if (!cardHeader || !(cardHeader instanceof HTMLElement)) throw new Error("CardHeader not found for Spring semester");
      const removeSpringButton = within(cardHeader).getByRole('button');
      fireEvent.click(removeSpringButton);
      expect(require('sonner').toast.success).toHaveBeenCalledWith('Semester removed successfully.');
      expect(within(springYearContainer).queryByRole('heading', { name: "Spring", level: 3 })).not.toBeInTheDocument();

      const year2024Card = screen.getByText('2024 - 2025').closest('div[class*="relative"]');
      expect(year2024Card).toBeInTheDocument();
      if (!year2024Card) throw new Error("Year 2024 - 2025 card not found");
      const summerHeadings = within(year2024Card).getAllByRole('heading', { name: "Summer", level: 3 });
      let summer2024Card: HTMLElement | null = null;
      for (const heading of summerHeadings) {
        const card = heading.closest('div[class*="rounded-lg"][class*="border"]');
        if (card && within(card).queryByText('9 credits')) {
          summer2024Card = card;
          break;
        }
      }
      expect(summer2024Card).toBeInTheDocument();
      if (!summer2024Card) throw new Error("Summer 2024 card with 9 credits not found for removal attempt");
      const summerCardHeader = summer2024Card.firstChild;
      if (!summerCardHeader || !(summerCardHeader instanceof HTMLElement)) throw new Error("CardHeader not found for Summer semester");
      const removeSummerButton = within(summerCardHeader).getByRole('button');
      fireEvent.click(removeSummerButton);
      expect(require('sonner').toast.error).toHaveBeenCalledWith(expect.stringContaining('Cannot remove semester with'));
      expect(within(year2024Card).getByRole('heading', { name: "Summer", level: 3 })).toBeInTheDocument();
    });
  });

  describe('Course Management', () => {
    test('allows adding a course to a semester and updates credits', async () => {
      renderWithProviders(<CourseDashboard />);
      const year2024Card = screen.getByText('2024 - 2025').closest('div[class*="relative"]');
      expect(year2024Card).toBeInTheDocument();
      if (!year2024Card) throw new Error("Year 2024 - 2025 card not found for course addition");
      const fall2024Headings = within(year2024Card).getAllByRole('heading', { name: "Fall", level: 3 });
      let fall2024Card: HTMLElement | null = null;
      for (const heading of fall2024Headings) {
        const card = heading.closest('div[class*="rounded-lg"][class*="border"]');
        if (card && within(card).queryByText('8 credits')) {
          fall2024Card = card;
          break;
        }
      }
      expect(fall2024Card).toBeInTheDocument();
      if (!fall2024Card) throw new Error("Fall 2024 card with 8 credits not found for course addition");
      expect(within(fall2024Card).getByText('8 credits')).toBeInTheDocument();
      const addCoursesButton = within(fall2024Card).getByRole('button', { name: /add courses/i });
      fireEvent.click(addCoursesButton);
      expect(screen.getByTestId('mock-course-search')).toBeVisible();
      expect(screen.getByText('Mock Course Search for Fall2024')).toBeInTheDocument();
      const addCS101Button = screen.getByText('Add CS101');
      fireEvent.click(addCS101Button);
      expect(require('sonner').toast.success).toHaveBeenCalledWith('CS101 added to Fall 2024.');
      expect(within(fall2024Card).getByText('CS101')).toBeInTheDocument();
      expect(within(fall2024Card).getByText('Test Course 101')).toBeInTheDocument();
      expect(within(fall2024Card).getByText('11 credits')).toBeInTheDocument();
    });

    test('allows deleting a course from a semester and updates credits', async () => {
      renderWithProviders(<CourseDashboard />);
      const year2024CardDeleteTest = screen.getByText('2024 - 2025').closest('div[class*="relative"]');
      expect(year2024CardDeleteTest).toBeInTheDocument();
      if (!year2024CardDeleteTest) throw new Error("Year 2024 - 2025 card not found for course deletion");
      const summerHeadingsDelete = within(year2024CardDeleteTest).getAllByRole('heading', { name: "Summer", level: 3 });
      let summerCard: HTMLElement | null = null;
      for (const heading of summerHeadingsDelete) {
        const card = heading.closest('div[class*="rounded-lg"][class*="border"]');
        if (card && within(card).queryByText('9 credits')) {
          summerCard = card;
          break;
        }
      }
      expect(summerCard).toBeInTheDocument();
      if (!summerCard) throw new Error("Summer 2024 card with 9 credits not found for course deletion");
      expect(within(summerCard).getByText('9 credits')).toBeInTheDocument();
      expect(within(summerCard).getByText('CS101')).toBeInTheDocument();
      expect(within(summerCard).getByText('Introduction to Computer Science')).toBeInTheDocument();
      const courseCS101Div = within(summerCard).getByText('CS101').closest('div[class*="p-2"]');
      expect(courseCS101Div).toBeDefined();
      if(!courseCS101Div) throw new Error("CS101 course div not found in Summer 2024");
      const deleteCS101Button = within(courseCS101Div).getByRole('button');
      fireEvent.click(deleteCS101Button);
      expect(within(summerCard).queryByText('CS101')).not.toBeInTheDocument();
      expect(within(summerCard).queryByText('Introduction to Computer Science')).not.toBeInTheDocument();
      expect(within(summerCard).getByText('6 credits')).toBeInTheDocument();
    });
  });

  test('credit calculations are accurate for overall program progress', () => {
    renderWithProviders(<CourseDashboard />);

    // The studentInfo from the context will be from the @/lib/mock-data mock.
    const { mockStudent: contextStudent, mockPrograms: contextPrograms } = require('@/lib/mock-data');
    const currentMajorProgram = contextPrograms.find((p:any) => p.id === contextStudent.majorId);

    const expectedCreditsCompleted = contextStudent.totalCredits;
    const expectedCreditsRequired = currentMajorProgram?.totalCreditsRequired || 0;
    const expectedProgressPercent = expectedCreditsRequired > 0 ? Math.round((expectedCreditsCompleted / expectedCreditsRequired) * 100) : 0;

    const graduationProgressCard = screen.getByText('Graduation Progress').closest('div[class*="rounded-lg border"]');
    expect(graduationProgressCard).toBeInTheDocument();
    if (!graduationProgressCard) throw new Error("Graduation Progress card not found");

    expect(within(graduationProgressCard).getByText(`${expectedCreditsCompleted} completed`, { exact: false })).toBeInTheDocument();
    expect(within(graduationProgressCard).getByText(`${expectedCreditsRequired} total`, { exact: false })).toBeInTheDocument();
    expect(within(graduationProgressCard).getByText(`${expectedProgressPercent}%`)).toBeInTheDocument();
  });

});

describe('Explore Other Majors Tab', () => {
  test('allows exploring a different major and displays what-if audit', async () => {
    renderWithProviders(<CourseDashboard />);

    const exploreTab = screen.getByRole('tab', { name: /explore other majors/i });
    fireEvent.click(exploreTab);

    expect(await screen.findByText(/thinking about changing your major/i, {}, { timeout: 10000 })).toBeInTheDocument();

    const majorSelectTrigger = screen.getByRole('combobox', { name: /what major interests you/i });
    fireEvent.mouseDown(majorSelectTrigger);

    const mathMajorOption = await screen.findByText('Mathematics Major');
    fireEvent.click(mathMajorOption);

    const analyzeButton = screen.getByRole('button', { name: /analyze this path/i });
    fireEvent.click(analyzeButton);

    const { calculateWhatIfAudit } = require('../lib/degree-audit-utils');
    const { mockPrograms, mockCourses: allMockCourses, mockStudent: contextStudentAgain } = require('@/lib/mock-data');
    const mathMajorProgram = mockPrograms.find((p: any) => p.id === 'math_major');

    expect(calculateWhatIfAudit).toHaveBeenCalledWith(
      contextStudentAgain.completedCourses,
      mathMajorProgram,
      allMockCourses
    );

    expect(screen.getByTestId('mock-whatif-audit-view')).toBeInTheDocument();
    expect(require('sonner').toast.success).toHaveBeenCalledWith(expect.stringContaining('Analysis complete! See your progress toward Mathematics Major below.'));
  }, 15000); // Increased timeout for this specific long-running test
});
