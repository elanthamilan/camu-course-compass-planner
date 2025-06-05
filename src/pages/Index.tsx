
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
      <div className="fixed right-4 bottom-20 lg:hidden z-40">
        <Button
          size="lg"
          className="rounded-full shadow-lg bg-gradient-to-r from-purple-600 to-violet-500 hover:from-purple-700 hover:to-violet-600 h-12 w-12 p-0 flex items-center justify-center" // Reduced size and adjusted positioning
          onClick={() => setIsAIAdvisorOpen(true)}
          aria-label="Ask AI Advisor"
        >
          <Sparkles className="h-5 w-5 text-white" /> {/* Reduced icon size */}
        </Button>
      </div>
    </div>
  );
};

export default Index;
