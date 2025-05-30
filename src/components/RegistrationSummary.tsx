import React from 'react';
import { useSchedule } from '@/contexts/ScheduleContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Trash2, Send, ArrowLeft } from 'lucide-react'; // Added ArrowLeft
import { useNavigate } from "react-router-dom"; // Added useNavigate
import { Course } from '@/lib/types'; // For getParentCourse

const RegistrationSummary: React.FC = () => {
  const { shoppingCart, clearCart, studentInfo, courses: allCoursesInContext } = useSchedule();
  const navigate = useNavigate(); // Added for back button

  if (!shoppingCart) {
    return (
      <div className="container mx-auto p-4 py-8 text-center animate-fade-in">
        <div className="max-w-lg mx-auto">
          <span className="text-8xl mb-6 block">🛒</span>
          <h1 className="text-3xl font-bold mb-4 text-gray-800">Registration Cart is Empty</h1>
          <p className="text-gray-600 mb-6">
            Add a schedule from the Schedule Planner to get started.
          </p>
          <Button onClick={() => navigate("/schedule")} size="sm" className="text-base"> {/* size="sm", removed px-8 */}
            <ArrowLeft className="h-5 w-5 mr-2" />
            Go to Schedule Planner
          </Button>
        </div>
      </div>
    );
  }

  // Helper to find parent course details from context for more info if needed
  const getParentCourse = (sectionId: string): Course | undefined => {
    const courseIdOrCode = sectionId.split('-')[0]; // Assuming section ID format is "COURSECODE-XXX" or "COURSEID-XXX"
    return allCoursesInContext.find(c => c.id === courseIdOrCode || c.code === courseIdOrCode);
  };

  return (
    <div className="container mx-auto p-4 py-8">
      <Button
        variant="outline"
        className="mb-6"
        onClick={() => navigate("/schedule")}
        size="sm" // Changed size
      >
        <ArrowLeft className="h-5 w-5 mr-2" />
        Back to Schedule Playground
      </Button>

      {/* Simple Header */}
      <div className="mb-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <span className="text-3xl">🛒</span>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Registration Cart
              </h1>
              <p className="text-gray-600">
                Review your schedule and register for classes
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">{shoppingCart.termId}</p>
            <p className="font-semibold text-lg">{shoppingCart.totalCredits} credits</p>
          </div>
        </div>
      </div>

      <Card className="max-w-4xl mx-auto shadow-lg animate-fade-in">
        <CardHeader>
          <CardTitle className="text-xl">
            Classes for {shoppingCart.termId}
          </CardTitle>
        </CardHeader>
        <CardContent>

          {shoppingCart.sections.length > 0 ? (
            <div className="space-y-4">
              {shoppingCart.sections.map((section, index) => {
                const parentCourse = getParentCourse(section.id);
                return (
                  <div key={section.id} className="border rounded-lg p-4 bg-gray-50">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="text-lg font-bold text-gray-800">
                          {parentCourse?.code || section.id.split('-')[0]}
                        </h4>
                        <p className="text-gray-600">{parentCourse?.name}</p>
                      </div>
                      <Badge variant="secondary" className="text-sm">
                        {parentCourse?.credits || 'N/A'} credits
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-lg">👨‍🏫</span>
                          <div>
                            <p className="font-medium text-gray-700">Instructor</p>
                            <p className="text-gray-600">{section.instructor}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-lg">📍</span>
                          <div>
                            <p className="font-medium text-gray-700">Location</p>
                            <p className="text-gray-600">{section.location}</p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-lg">📝</span>
                          <div>
                            <p className="font-medium text-gray-700">Section</p>
                            <p className="text-gray-600">
                              {section.sectionNumber}
                              {section.sectionType && section.sectionType !== "Standard" && (
                                <Badge variant="outline" className="ml-1 text-xs">
                                  {section.sectionType}
                                </Badge>
                              )}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-lg">⏰</span>
                          <div>
                            <p className="font-medium text-gray-700">When it meets</p>
                            <div className="text-gray-600">
                              {section.schedule.map((s, idx) => (
                                <div key={idx} className="text-sm">
                                  {s.days}: {s.startTime}-{s.endTime}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <span className="text-4xl mb-4 block">📚</span>
              <p className="text-gray-500">No classes in this schedule yet.</p>
            </div>
          )}
        </CardContent>
        <CardFooter className="border-t pt-6">
          <div className="w-full">
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-between space-y-3 sm:space-y-0 sm:space-x-3">
              <Button variant="outline" onClick={clearCart} size="sm" className="flex-1"> {/* size="sm" */}
                <Trash2 className="h-5 w-5 mr-2" />
                Clear Cart
              </Button>
              <Button variant="default" disabled size="sm" className="flex-1"> {/* variant="default", size="sm", removed bg classes */}
                <Send className="h-5 w-5 mr-2" />
                Register for Classes
              </Button>
            </div>


          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default RegistrationSummary;
