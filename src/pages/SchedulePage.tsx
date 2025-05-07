
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import ScheduleTool from '@/components/ScheduleTool';
import { useSchedule } from '@/contexts/ScheduleContext';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

const SchedulePage = () => {
  const { currentTerm } = useSchedule();
  const location = useLocation();
  const navigate = useNavigate();
  const [semesterId, setSemesterId] = useState<string | null>(null);
  
  // Extract semester ID from URL parameters
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const semester = params.get('semester');
    setSemesterId(semester);
  }, [location]);
  
  if (!currentTerm) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">No term selected</h2>
          <p className="text-gray-600 mb-4">Please go back and select a term</p>
          <Button 
            onClick={() => navigate('/')}
            className="bg-blue-500 hover:bg-blue-600"
          >
            Go to Home
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full"
      >
        <Header />
      </motion.div>
      
      <main className="container max-w-7xl mx-auto px-4 pb-12 pt-6">
        {semesterId && (
          <div className="mb-4">
            <Button
              variant="ghost"
              className="flex items-center text-gray-600 hover:text-gray-900 pl-0"
              onClick={() => navigate('/')}
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> 
              Back to Course Planner
            </Button>
          </div>
        )}
        
        <ScheduleTool semesterId={semesterId} />
      </main>
    </div>
  );
};

export default SchedulePage;
