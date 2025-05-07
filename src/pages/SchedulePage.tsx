
import React, { useState } from 'react';
import Header from '@/components/Header';
import ScheduleTool from '@/components/ScheduleTool';
import { useSchedule } from '@/contexts/ScheduleContext';

const SchedulePage = () => {
  const { currentTerm } = useSchedule();
  
  if (!currentTerm) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">No term selected</h2>
          <p className="text-gray-600">Please go back and select a term</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container max-w-7xl mx-auto px-4 pb-12">
        <ScheduleTool />
      </main>
    </div>
  );
};

export default SchedulePage;
