
import { useState, useEffect } from 'react';
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
            variant="default" // Added
            size="sm"         // Added
            onClick={() => navigate('/')}
            // className removed
          >
            Go to Home
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Header />
      </motion.div>
      
      <main className="w-full px-4 pb-12 pt-6 flex-grow"> {/* Removed container, mx-auto, max-w-7xl */}
        {semesterId && (
          <motion.div 
            className="mb-4"
            initial={{ opacity: 0, x: -5 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Button
              variant="ghost"
              className="flex items-center text-gray-600 hover:text-gray-900 pl-0"
              onClick={() => navigate('/')}
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> 
              Back to Course Planner
            </Button>
          </motion.div>
        )}
        
        <ScheduleTool semesterId={semesterId} />
      </main>
    </div>
  );
};

export default SchedulePage;
