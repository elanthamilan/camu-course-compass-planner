
import React, { useState, useEffect } from 'react'; // Added useEffect
import Header from '@/components/organisms/Header';
import AIAdvisor from '@/components/organisms/AIAdvisor';
import AIAdvisorBottomSheet from '@/components/organisms/AIAdvisorBottomSheet'; // Added
import { useIsMobile } from '@/hooks/use-mobile'; // Added

const AdvisorPage = () => {
  const isMobile = useIsMobile(); // Added
  const [isSheetOpen, setIsSheetOpen] = useState(false); // Added

  useEffect(() => {
    if (isMobile) {
      setIsSheetOpen(true); // Open by default on mobile
    }
  }, [isMobile]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="px-4 py-8">
        <div className="bg-gradient-to-r from-purple-600 to-violet-500 rounded-lg p-4 sm:p-6 md:p-8 text-white mb-8 shadow-lg animate-fade-in">
          <h1 className="text-2xl sm:text-3xl font-bold mb-4">AI Course Advisor</h1>
          <p className="mb-6">
            Get personalized guidance on your course planning, degree requirements, 
            and scheduling from your AI assistant. Ask questions about prerequisites, 
            course load, or recommendations for your next semester.
          </p>
          <div className="flex flex-col items-center text-center space-y-3 xs:flex-row xs:items-center xs:space-y-0 xs:space-x-3 xs:text-left">
            <div className="bg-white/20 rounded-lg p-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19.7 14a2 2 0 0 0-1.7-1h-1.2a3 3 0 0 0-3 3v.7c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5V16" />
                <path d="M15.5 14h-.17c-.47.68-1.14 1.25-1.92 1.5" />
                <path d="M13.41 14.5c.87-1.98.87-4.02 0-6" />
                <path d="M18.24 9.5c2.13 2.13 2.13 5.57 0 7.7" />
                <path d="M18.24 6c3.53 3.53 3.53 9.24 0 12.77" />
                <path d="M11.5 9.5c-2.13 2.13-2.13 5.57 0 7.7" />
                <path d="M11.5 6c-3.53 3.53-3.53 9.24 0 12.77" />
                <path d="M8.35 8.35a4.8 4.8 0 0 0 0 7.3" />
                <path d="M4.9 4.9a8.5 8.5 0 0 0 0 14.2" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold">Your AI Advisor is ready to help</h2>
              <p className="text-sm text-white/80">Available 24/7 with personalized academic guidance</p>
            </div>
          </div>
        </div>
        
        {/* Conditional AI Advisor */}
        {isMobile ? (
          <AIAdvisorBottomSheet open={isSheetOpen} onOpenChange={setIsSheetOpen} />
        ) : (
          <div className="bg-white rounded-lg shadow-lg p-4 animate-scale-in">
            <AIAdvisor open={true} onOpenChange={() => { /* Desktop version is always open, no-op change */ }} />
          </div>
        )}

        {/* New Section: Schedule Sharing Information */}
        <div className="mt-10 bg-white rounded-lg shadow-md p-6 animate-fade-in" style={{animationDelay: "300ms"}}>
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-700 mb-3">Share & Manage Your Schedules</h2>
          <p className="text-sm text-gray-600 mb-4">
            You can now easily manage and share your academic schedules:
          </p>
          <ul className="list-disc list-inside text-sm text-gray-600 space-y-2">
            <li>
              <strong>Export Schedules:</strong> From the "Schedule Tool" page, when viewing a specific schedule, you can use the "Actions" menu to export your schedule as a JSON file. This file contains all the necessary details of your selected courses and sections for that term.
            </li>
            <li>
              <strong>Import Schedules:</strong> If you have a schedule JSON file (either one you exported previously or one shared by an advisor or friend), you can import it back into the "Schedule Tool". Use the "Actions" menu to find the "Import Schedule from File" option. The application will validate the file and add it to your list of schedules.
            </li>
            <li>
              <strong>Collaboration:</strong> This feature is great for discussing your plans with your academic advisor. Simply export your schedule and send them the file. They can then import it into their system to review and provide feedback.
            </li>
          </ul>
          <p className="text-xs text-gray-500 mt-4">
            Ensure that the term and course catalog of the imported schedule are compatible with the current system for best results. The import process will attempt to match course and section IDs.
          </p>
        </div>
      </main>
    </div>
  );
};

export default AdvisorPage;
