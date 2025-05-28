
import Header from '@/components/Header';
import AIAdvisor from '@/components/AIAdvisor';

const AdvisorPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="px-4 py-8">
        <div className="bg-gradient-to-r from-purple-600 to-violet-500 rounded-lg p-8 text-white mb-8 shadow-lg animate-fade-in">
          <h1 className="text-3xl font-bold mb-4">AI Course Advisor</h1>
          <p className="mb-6">
            Get personalized guidance on your course planning, degree requirements, 
            and scheduling from your AI assistant. Ask questions about prerequisites, 
            course load, or recommendations for your next semester.
          </p>
          <div className="flex items-center space-x-3">
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
        
        {/* Embed AI advisor directly on the page */}
        <div className="bg-white rounded-lg shadow-lg p-4 animate-scale-in">
          <AIAdvisor open={true} onOpenChange={() => {}} />
        </div>
      </main>
    </div>
  );
};

export default AdvisorPage;
