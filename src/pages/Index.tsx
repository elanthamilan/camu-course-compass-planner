
import { useState } from 'react';
import CourseDashboard from '@/components/CourseDashboard';
import Header from '@/components/Header';
import AIAdvisor from '@/components/AIAdvisor';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react'; // Import Sparkles

const Index = () => {
  const [isAIAdvisorOpen, setIsAIAdvisorOpen] = useState(false);
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="px-4 pb-20">
        <CourseDashboard />
      </main>
      
      <AIAdvisor open={isAIAdvisorOpen} onOpenChange={setIsAIAdvisorOpen} />
      
      {/* Mobile Floating Action Button for AI Advisor on mobile */}
      <div className="fixed right-6 bottom-6 lg:hidden">
        <Button
          size="lg"
          className="rounded-full shadow-lg bg-gradient-to-r from-purple-600 to-violet-500 hover:from-purple-700 hover:to-violet-600 h-14 w-14 p-0 flex items-center justify-center" // Added p-0 and flex for centering icon
          onClick={() => setIsAIAdvisorOpen(true)}
          aria-label="Ask AI Advisor"
        >
          <Sparkles className="h-6 w-6 text-white" /> {/* Replaced SVG with Sparkles icon */}
        </Button>
      </div>
    </div>
  );
};

export default Index;
