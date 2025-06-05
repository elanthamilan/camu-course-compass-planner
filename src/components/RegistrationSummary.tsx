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

  if (!shoppingCart || shoppingCart.length === 0) {
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
      <div className="mb-6 max-w-4xl mx-auto px-4">
        <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 mb-4">
          <div className="flex items-start space-x-3 w-full sm:w-auto">
            <span className="text-3xl flex-shrink-0">🛒</span>
            <div className="min-w-0 flex-1">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 leading-tight">
                Registration Cart
              </h1>
              <p className="text-sm sm:text-base text-gray-600 leading-tight">
                Review your schedules and complete enrollment
              </p>
            </div>
          </div>
          <div className="flex flex-col sm:items-end space-y-1 bg-gray-50 p-3 rounded-lg sm:bg-transparent sm:p-0">
            <p className="text-sm text-gray-500 font-medium">{shoppingCart[0]?.termId || 'No term'}</p>
            <p className="font-semibold text-lg text-gray-900">
              {shoppingCart.reduce((total, schedule) => total + schedule.totalCredits, 0)} total credits
            </p>
            <p className="text-xs text-gray-500">{shoppingCart.length} schedule{shoppingCart.length !== 1 ? 's' : ''}</p>
          </div>
        </div>
      </div>

      <div className="space-y-6 max-w-4xl mx-auto px-4">
        {shoppingCart.map((schedule, scheduleIndex) => (
          <Card key={schedule.id} className="shadow-lg animate-fade-in">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg sm:text-xl flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                <span className="font-bold leading-tight">{schedule.name}</span>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary" className="text-sm">
                    {schedule.totalCredits} credits
                  </Badge>
                  {schedule.conflicts && schedule.conflicts.length > 0 && (
                    <Badge variant="destructive" className="text-sm">
                      {schedule.conflicts.length} conflict{schedule.conflicts.length > 1 ? 's' : ''}
                    </Badge>
                  )}
                </div>
              </CardTitle>
              <CardDescription className="text-sm">
                {schedule.termId} • {schedule.sections?.length || 0} classes
              </CardDescription>
            </CardHeader>
            <CardContent>
              {schedule.sections && schedule.sections.length > 0 ? (
                <div className="space-y-4">
                  {schedule.sections.map((section, index) => {
                    const parentCourse = getParentCourse(section.id);
                    return (
                      <div key={section.id} className="border rounded-lg p-3 sm:p-4 bg-gray-50">
                        <div className="flex flex-col space-y-2 sm:flex-row sm:items-start sm:justify-between sm:space-y-0 mb-3">
                          <div className="min-w-0 flex-1">
                            <h4 className="text-base sm:text-lg font-bold text-gray-800 leading-tight">
                              {parentCourse?.code || section.id.split('-')[0]}
                            </h4>
                            <p className="text-sm sm:text-base text-gray-600 leading-tight">{parentCourse?.name}</p>
                          </div>
                          <Badge variant="secondary" className="text-sm flex-shrink-0">
                            {parentCourse?.credits || 'N/A'} credits
                          </Badge>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 text-sm">
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2 w-full">
                              <span className="text-base sm:text-lg flex-shrink-0">👨‍🏫</span>
                              <div className="min-w-0 flex-1">
                                <p className="font-medium text-gray-700 text-xs sm:text-sm">Instructor</p>
                                <p className="text-gray-600 text-xs sm:text-sm truncate">{section.instructor}</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2 w-full">
                              <span className="text-base sm:text-lg flex-shrink-0">📍</span>
                              <div className="min-w-0 flex-1">
                                <p className="font-medium text-gray-700 text-xs sm:text-sm">Location</p>
                                <p className="text-gray-600 text-xs sm:text-sm truncate">{section.location}</p>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center space-x-2 w-full">
                              <span className="text-base sm:text-lg flex-shrink-0">📝</span>
                              <div className="min-w-0 flex-1">
                                <p className="font-medium text-gray-700 text-xs sm:text-sm">Section</p>
                                <p className="text-gray-600 text-xs sm:text-sm">
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

                          <div className="space-y-2 sm:col-span-2 lg:col-span-1">
                            <div className="flex items-start space-x-2 w-full">
                              <span className="text-base sm:text-lg flex-shrink-0">⏰</span>
                              <div className="min-w-0 flex-1">
                                <p className="font-medium text-gray-700 text-xs sm:text-sm">When it meets</p>
                                <div className="text-gray-600">
                                  {section.schedule && section.schedule.length > 0 ? (
                                    section.schedule.map((s, idx) => (
                                      <div key={idx} className="text-xs sm:text-sm">
                                        {s.days}: {s.startTime}-{s.endTime}
                                      </div>
                                    ))
                                  ) : (
                                    <div className="text-xs sm:text-sm">TBA</div>
                                  )}
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
          </Card>
        ))}
      </div>

      {/* Action Section */}
      <Card className="max-w-4xl mx-auto mt-6 shadow-lg">
        <CardFooter className="pt-6 px-4">
          <div className="w-full">
            <div className="flex flex-col space-y-4 sm:flex-row sm:justify-between sm:items-center sm:space-y-0 sm:space-x-6">
              <Button variant="outline" onClick={clearCart} size="sm" className="w-full sm:w-auto order-2 sm:order-1">
                <Trash2 className="h-4 w-4 mr-2" />
                Clear Cart
              </Button>

              <div className="flex-1 order-1 sm:order-2">
                <div className="p-3 sm:p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center justify-center sm:justify-end space-x-2 mb-2">
                    <Send className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                    <span className="font-medium text-sm sm:text-base text-blue-900">Ready to Register</span>
                  </div>
                  <p className="text-xs sm:text-sm text-blue-700 text-center sm:text-right">
                    Complete your enrollment on the official enrollment page during your registration window.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default RegistrationSummary;
