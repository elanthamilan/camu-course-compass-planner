
import React, { useState } from 'react';
import CourseDashboard from '@/components/CourseDashboard';
import Header from '@/components/Header';
import AIAdvisor from '@/components/AIAdvisor';
import { Button } from '@/components/ui/button';

const Index = () => {
  const [isAIAdvisorOpen, setIsAIAdvisorOpen] = useState(false);
  
  const handleAddSemester = () => {
    // Logic to add a new semester
    console.log("Adding new semester");
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container max-w-7xl mx-auto px-4 pb-20">
        <CourseDashboard onAddSemester={handleAddSemester} />
      </main>
      
      <AIAdvisor open={isAIAdvisorOpen} onOpenChange={setIsAIAdvisorOpen} />
      
      {/* Mobile Floating Action Button for AI Advisor on mobile */}
      <div className="fixed right-6 bottom-6 lg:hidden">
        <Button
          size="lg"
          className="rounded-full shadow-lg bg-gradient-to-r from-purple-600 to-violet-500 hover:from-purple-700 hover:to-violet-600 h-14 w-14"
          onClick={() => setIsAIAdvisorOpen(true)}
        >
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
        </Button>
      </div>
    </div>
  );
};

export default Index;
