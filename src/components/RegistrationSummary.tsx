
import React from "react";
import { useSchedule } from "@/contexts/ScheduleContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Check } from "lucide-react";
import { toast } from "sonner";

const RegistrationSummary = () => {
  const { selectedSchedule, studentInfo } = useSchedule();
  const navigate = useNavigate();

  if (!selectedSchedule) {
    navigate("/schedule");
    return null;
  }

  const handleCompleteRegistration = () => {
    toast.success("Registration completed successfully!");
    setTimeout(() => {
      navigate("/");
    }, 1500);
  };

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8 animate-fade-in">
      <Button 
        variant="ghost" 
        className="mb-6 flex items-center text-gray-600 hover:text-gray-800"
        onClick={() => navigate("/schedule")}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        Back to Schedule
      </Button>
      
      <h1 className="text-2xl font-bold mb-6">Course Registration Summary</h1>
      
      <div className="space-y-8">
        <Card className="shadow-sm animate-scale-in">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4">Selected Courses</h2>
            <div className="space-y-4">
              {selectedSchedule.sections.map(section => {
                const courseCode = section.id.split("-")[0].toUpperCase();
                const courseName = courseCode === "CS101" ? "Introduction to Computer Science" : 
                                    courseCode === "MATH105" ? "Pre-Calculus" :
                                    courseCode === "ENG234" ? "Composition II" :
                                    "Unknown Course";
                
                return (
                  <div key={section.id} className="flex justify-between items-center border-b pb-4 last:border-0 last:pb-0">
                    <div>
                      <div className="flex items-center">
                        <span className="font-semibold">{courseCode} - {courseName}</span>
                        <span className="ml-2 bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full flex items-center">
                          <Check className="h-3 w-3 mr-1" />
                          Seat available
                        </span>
                      </div>
                      <div className="text-sm text-gray-600">
                        Credits: {courseCode === "CS101" || courseCode === "MATH105" || courseCode === "ENG234" ? 3 : 4}
                      </div>
                      <div className="text-sm text-gray-600">
                        Section {section.sectionNumber} • {section.instructor}
                      </div>
                    </div>
                    <span className="text-green-500">
                      <Check className="h-5 w-5" />
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in" style={{animationDelay: "100ms"}}>
          <Card className="shadow-sm">
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-3">Program Progress</h2>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Completed Credits:</span>
                  <span className="font-medium">{studentInfo.totalCredits}</span>
                </div>
                <div className="flex justify-between">
                  <span>Required Credits:</span>
                  <span className="font-medium">{studentInfo.requiredCredits - studentInfo.totalCredits}</span>
                </div>
                <div className="flex justify-between text-base font-medium border-t pt-2 mt-2">
                  <span>Total Credits:</span>
                  <span>{studentInfo.requiredCredits}</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-sm">
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-3">Mandatory Courses</h2>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Completed:</span>
                  <span className="font-medium">8</span>
                </div>
                <div className="flex justify-between">
                  <span>Required:</span>
                  <span className="font-medium">7</span>
                </div>
                <div className="flex justify-between text-base font-medium border-t pt-2 mt-2">
                  <span>Total:</span>
                  <span>15</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="flex justify-center animate-fade-in" style={{animationDelay: "200ms"}}>
          <Button 
            size="lg"
            className="bg-blue-500 hover:bg-blue-600 text-lg px-8"
            onClick={handleCompleteRegistration}
          >
            Complete Registration
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RegistrationSummary;
