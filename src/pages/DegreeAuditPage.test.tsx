import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { TooltipProvider } from '@radix-ui/react-tooltip';

import DegreeAuditPage from './DegreeAuditPage';
import { ScheduleProvider } from '@/contexts/ScheduleContext';
import * as degreeAuditUtils from '@/lib/degree-audit-utils';
import { DegreeRequirement, Course, AcademicProgram, StudentInfo, DegreeAuditResults } from '@/lib/types';

// --- Define Global Consts for data needed by MOCK_DEGREE_AUDIT_RESULTS_DATA and test assertions ---
const MOCK_ALL_COURSES_FOR_TESTS_AND_AUDIT_MOCK: Course[] = [
  { id: 'CS101', code: 'CS101', name: 'Intro to CS', credits: 3, department: 'CS', sections: [], prerequisites: [] },
  { id: 'MA101', code: 'MA101', name: 'Calculus I', credits: 4, department: 'MATH', sections: [], prerequisites: [] },
  { id: 'CS201', code: 'CS201', name: 'Data Structures I', credits: 3, department: 'CS', sections: [], prerequisites: ['CS101'] },
  { id: 'CS301', code: 'CS301', name: 'Algorithms', credits: 3, department: 'CS', sections: [], prerequisites: ['CS201'] },
  { id: 'CS202', code: 'CS202', name: 'Data Structures II', credits: 3, department: 'CS', sections: [], prerequisites: ['CS201'] },
  { id: 'EL100', code: 'EL100', name: 'Basic Elective', credits: 3, department: 'ANY', sections: [], prerequisites: [] },
  { id: 'EL200', code: 'EL200', name: 'Advanced Elective', credits: 3, department: 'ANY', sections: [], prerequisites: [] },
  { id: 'MA201', code: 'MA201', name: 'Calculus II', credits: 4, department: 'MATH', sections: [], prerequisites: ['MA101'] },
];

// This MOCK_DEGREE_AUDIT_RESULTS_DATA is defined globally as it's used by the mock for degree-audit-utils
const MOCK_DEGREE_AUDIT_RESULTS_DATA: DegreeAuditResults = {
  studentId: 's123',
  degreeId: 'cs_major',
  overallProgress: 0,
  totalCreditsEarned: 0,
  totalCreditsRequired: 120,
  summaryNotes: ['Audit summary note.'],
  requirementAudits: [
    {
      id: 'req1', name: 'Core CS Courses', description: 'Complete all core CS courses.',
      requiredCredits: 30, earnedCredits: 6, progressCourses: 2, progress: 6/30, status: 'partially_fulfilled',
      courses: ['CS101', 'CS201', 'CS301', 'CS202'], fulfilledCourses: ['CS101', 'CS201'], remainingCourses: ['CS301', 'CS202'],
      suggestedCourses: MOCK_ALL_COURSES_FOR_TESTS_AND_AUDIT_MOCK.filter(c => ['CS301', 'CS202'].includes(c.id)),
      feedback: "Keep going!", category: 'Core',
    },
    {
      id: 'req2', name: 'Mathematics Requirements', description: 'Complete all math courses.',
      requiredCredits: 12, earnedCredits: 4, progressCourses: 1, progress: 4/12, status: 'partially_fulfilled',
      courses: ['MA101', 'MA201'], fulfilledCourses: ['MA101'], remainingCourses: ['MA201'],
      suggestedCourses: MOCK_ALL_COURSES_FOR_TESTS_AND_AUDIT_MOCK.filter(c => c.id === 'MA201'),
      feedback: "Calculus II needed.", category: 'Mathematics',
    },
    {
      id: 'req3', name: 'Electives', description: 'Complete 9 elective credits.',
      requiredCredits: 9, earnedCredits: 3, progressCourses: 1, progress: 3/9, status: 'partially_fulfilled',
      courses: ['EL100', 'EL200'], fulfilledCourses: ['EL100'], remainingCourses: ['EL200'],
      suggestedCourses: MOCK_ALL_COURSES_FOR_TESTS_AND_AUDIT_MOCK.filter(c => c.id === 'EL200'), category: 'Electives'
    }
  ]
};
MOCK_DEGREE_AUDIT_RESULTS_DATA.totalCreditsEarned = MOCK_DEGREE_AUDIT_RESULTS_DATA.requirementAudits.reduce((sum, req) => sum + req.earnedCredits, 0);
if (MOCK_DEGREE_AUDIT_RESULTS_DATA.totalCreditsRequired > 0) {
    MOCK_DEGREE_AUDIT_RESULTS_DATA.overallProgress = MOCK_DEGREE_AUDIT_RESULTS_DATA.totalCreditsEarned / MOCK_DEGREE_AUDIT_RESULTS_DATA.totalCreditsRequired;
} else {
    MOCK_DEGREE_AUDIT_RESULTS_DATA.overallProgress = 0;
}

// --- Mock Dependencies ---
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
  useLocation: () => ({ state: null }),
}));

jest.mock('sonner', () => ({
  toast: { success: jest.fn(), error: jest.fn(), info: jest.fn(), warn: jest.fn() },
}));

jest.mock('@/components/organisms/CourseCatalogView', () => {
  return function MockedCourseCatalogView({ targetCourseCode, onTargetCourseViewed }: { targetCourseCode: string | null, onTargetCourseViewed: () => void }) {
    if (!targetCourseCode) return null;
    return (
      <div data-testid="mock-course-catalog-view">
        CourseCatalogView Mock: Target={targetCourseCode}
        <button onClick={onTargetCourseViewed}>Clear Target</button>
      </div>
    );
  };
});

jest.mock('@/lib/degree-audit-utils', () => ({
  ...jest.requireActual('@/lib/degree-audit-utils'),
  calculateDegreeAudit: jest.fn(() => MOCK_DEGREE_AUDIT_RESULTS_DATA),
}));

jest.mock('@/lib/mock-data', () => {
  const localMockStudent: StudentInfo = {
    studentId: 's123', name: 'Test Student', major: 'Computer Science', majorId: 'cs_major',
    minor: null, minorId: null, email: 'test@example.com', totalCredits: 0, requiredCredits: 0,
    completedCourses: ['CS101', 'MA101'],
  };
  const localMockCSProgram: AcademicProgram = {
    id: 'cs_major', name: 'Computer Science Program', type: 'Major', description: 'A CS program',
    college: 'Engineering College', totalCreditsRequired: 120, gpaRequired: 2.0,
    requirements: [], // Simplified, actual reqs are in the audit result
    catalogYear: "2023-2024"
  };
  // Define courses literally inside this factory to avoid hoisting issues
  const localMockAllCourses: Course[] = [
    { id: 'CS101', code: 'CS101', name: 'Intro to CS', credits: 3, department: 'CS', sections: [], prerequisites: [] },
    { id: 'MA101', code: 'MA101', name: 'Calculus I', credits: 4, department: 'MATH', sections: [], prerequisites: [] },
    { id: 'CS201', code: 'CS201', name: 'Data Structures I', credits: 3, department: 'CS', sections: [], prerequisites: ['CS101'] },
    { id: 'CS301', code: 'CS301', name: 'Algorithms', credits: 3, department: 'CS', sections: [], prerequisites: ['CS201'] },
    { id: 'CS202', code: 'CS202', name: 'Data Structures II', credits: 3, department: 'CS', sections: [], prerequisites: ['CS201'] },
    { id: 'EL100', code: 'EL100', name: 'Basic Elective', credits: 3, department: 'ANY', sections: [], prerequisites: [] },
    { id: 'EL200', code: 'EL200', name: 'Advanced Elective', credits: 3, department: 'ANY', sections: [], prerequisites: [] },
    { id: 'MA201', code: 'MA201', name: 'Calculus II', credits: 4, department: 'MATH', sections: [], prerequisites: ['MA101'] },
  ];

  return {
    __esModule: true,
    mockStudent: localMockStudent,
    mockPrograms: [localMockCSProgram],
    mockCourses: localMockAllCourses,
    mockSchedules: [], // Add missing mockSchedules
    mockBusyTimes: [], // Add missing mockBusyTimes (ScheduleContext uses it)
    mockTerms: [{id: 'T1', name: 'Test Term 1', startDate: new Date('2024-01-01'), endDate: new Date('2024-05-15')}], // Add mockTerms
  };
});

const mockCalculateDegreeAuditSpy = degreeAuditUtils.calculateDegreeAudit as jest.Mock;

// For test assertions, get the mocked data that the component will use.
const { mockStudent: testScopeMockStudent, mockPrograms: testScopeMockPrograms } = jest.requireMock('@/lib/mock-data');
const testScopeMockCSProgram = testScopeMockPrograms[0];


const renderPage = () => {
  mockCalculateDegreeAuditSpy.mockReturnValue(MOCK_DEGREE_AUDIT_RESULTS_DATA);
  return render(
    <ScheduleProvider initialStudentInfo={testScopeMockStudent}>
      <TooltipProvider>
        <DegreeAuditPage />
      </TooltipProvider>
    </ScheduleProvider>
  );
};

describe('DegreeAuditPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCalculateDegreeAuditSpy.mockReturnValue(MOCK_DEGREE_AUDIT_RESULTS_DATA);
  });

  test('renders basic structure and overall progress', () => {
    renderPage();
    expect(screen.getByText(testScopeMockCSProgram.name, { exact: false })).toBeInTheDocument();

    const expectedEarned = MOCK_DEGREE_AUDIT_RESULTS_DATA.totalCreditsEarned;
    const expectedRequired = MOCK_DEGREE_AUDIT_RESULTS_DATA.totalCreditsRequired;
    expect(screen.getByText(/Overall Progress/i)).toBeInTheDocument();
    expect(screen.getByText(new RegExp(`${expectedEarned} / ${expectedRequired} Credits Completed`, "i"))).toBeInTheDocument();
    if (MOCK_DEGREE_AUDIT_RESULTS_DATA.summaryNotes && MOCK_DEGREE_AUDIT_RESULTS_DATA.summaryNotes.length > 0) {
        expect(screen.getByText(MOCK_DEGREE_AUDIT_RESULTS_DATA.summaryNotes[0], {exact: false})).toBeInTheDocument();
    }
  });

  test('displays status of individual degree requirements', () => {
    renderPage();
    const req1 = MOCK_DEGREE_AUDIT_RESULTS_DATA.requirementAudits[0];
    const req2 = MOCK_DEGREE_AUDIT_RESULTS_DATA.requirementAudits[1];
    const req3 = MOCK_DEGREE_AUDIT_RESULTS_DATA.requirementAudits[2];

    const req1Card = screen.getByText(req1.name).closest('div[role="region"]');
    expect(req1Card).toBeInTheDocument();
    if(req1Card) {
      expect(within(req1Card).getByText(new RegExp(`${req1.earnedCredits} / ${req1.requiredCredits} credits`, "i"))).toBeInTheDocument();
      if(req1.feedback) expect(within(req1Card).getByText(req1.feedback, {exact:false})).toBeInTheDocument();
      if(req1.suggestedCourses && req1.suggestedCourses.length > 0) {
        expect(within(req1Card).getByText(new RegExp(req1.suggestedCourses[0].code, "i"))).toBeInTheDocument();
      }
    }

    const req2Card = screen.getByText(req2.name).closest('div[role="region"]');
    expect(req2Card).toBeInTheDocument();
    if(req2Card) {
      expect(within(req2Card).getByText(new RegExp(`${req2.earnedCredits} / ${req2.requiredCredits} credits`, "i"))).toBeInTheDocument();
      if(req2.feedback) expect(within(req2Card).getByText(req2.feedback, {exact: false})).toBeInTheDocument();
      expect(within(req2Card).getByText(/partially fulfilled/i)).toBeInTheDocument();
    }

    const req3Card = screen.getByText(req3.name).closest('div[role="region"]');
    expect(req3Card).toBeInTheDocument();
    if(req3Card) {
      expect(within(req3Card).getByText(new RegExp(`${req3.earnedCredits} / ${req3.requiredCredits} credits`, "i"))).toBeInTheDocument();
      if(req3.suggestedCourses && req3.suggestedCourses.length > 0) {
        expect(within(req3Card).getByText(new RegExp(req3.suggestedCourses[0].code, "i"))).toBeInTheDocument();
      }
    }
  });

  test('clicking suggested course shows CourseCatalogView modal', async () => {
    renderPage();

    const reqWithSuggestion = MOCK_DEGREE_AUDIT_RESULTS_DATA.requirementAudits.find(r => r.id === 'req1');
    expect(reqWithSuggestion).toBeDefined();
    expect(reqWithSuggestion!.suggestedCourses).toBeDefined();
    expect(reqWithSuggestion!.suggestedCourses!.length).toBeGreaterThan(0);

    const suggestedCourse = reqWithSuggestion!.suggestedCourses![0];
    const reqCard = screen.getByText(reqWithSuggestion!.name).closest('div[role="region"]');
    expect(reqCard).toBeInTheDocument();

    const suggestedCourseButton = within(reqCard!).getByText(new RegExp(`${suggestedCourse.code} - ${suggestedCourse.name}`, "i"));
    expect(suggestedCourseButton).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(suggestedCourseButton);
    });

    const catalogView = screen.getByTestId('mock-course-catalog-view');
    expect(catalogView).toBeVisible();
    expect(within(catalogView).getByText(`CourseCatalogView Mock: Target=${suggestedCourse.code}`)).toBeInTheDocument();
  });

});
