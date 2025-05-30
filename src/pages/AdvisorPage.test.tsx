import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { TooltipProvider } from '@/components/ui/tooltip';
import { ScheduleProvider } from '@/contexts/ScheduleContext';
import AdvisorPage from './AdvisorPage';

// Mock child components
jest.mock('@/components/Header', () => () => <div data-testid="mock-header">Header Mock</div>);
jest.mock('@/components/AIAdvisor', () => () => <div data-testid="mock-ai-advisor">AIAdvisor Mock</div>);

// Mock react-router-dom as Header likely uses it
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
  Link: ({ children, to }: { children: React.ReactNode, to: string }) => <a href={to}>{children}</a>,
}));

// Helper to render with necessary providers
const renderWithProviders = (ui: React.ReactElement) => {
  // Basic student info for ScheduleProvider, can be expanded if needed by underlying components
  const mockStudentInfo = {
    studentId: "testUser",
    name: "Test User",
    majorId: "cs",
    completedCourses: [],
    totalCredits: 0,
    requiredCredits: 120,
  };
  return render(
    <ScheduleProvider initialStudentInfo={mockStudentInfo} initialSchedule={{courses:[]}}>
      <TooltipProvider>
        {ui}
      </TooltipProvider>
    </ScheduleProvider>
  );
};

describe('AdvisorPage', () => {
  test('renders main sections of the page', () => {
    renderWithProviders(<AdvisorPage />);

    // Check for the main title
    expect(screen.getByRole('heading', { name: /ai course advisor/i, level: 1 })).toBeInTheDocument();

    // Check for the mocked AIAdvisor component
    expect(screen.getByTestId('mock-ai-advisor')).toBeInTheDocument();
    expect(screen.getByText('AIAdvisor Mock')).toBeInTheDocument();

    // Check for the "Share & Manage Your Schedules" section title
    // This might be an h2 or other heading element
    expect(screen.getByRole('heading', { name: /share & manage your schedules/i })).toBeInTheDocument();
  });
});
