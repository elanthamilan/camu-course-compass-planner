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
        <ShoppingCart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <h1 className="text-2xl font-bold mb-4">Your Registration Cart is Empty</h1>
        <p className="text-muted-foreground mb-6">Add a schedule to your cart from the schedule planning page.</p>
        <Button onClick={() => navigate("/schedule")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Scheduler
        </Button>
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
        variant="ghost" 
        className="mb-6 flex items-center text-muted-foreground hover:text-foreground"
        onClick={() => navigate("/schedule")}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Scheduler
      </Button>

      <Card className="max-w-4xl mx-auto shadow-lg animate-fade-in">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center">
            <ShoppingCart className="h-6 w-6 mr-3 text-primary" />
            Registration Cart for {studentInfo?.name || 'Student'}
          </CardTitle>
          <CardDescription>
            Term: {shoppingCart.termId} | Schedule: {shoppingCart.name} | Total Credits: {shoppingCart.totalCredits}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <h3 className="text-lg font-semibold mb-3">Selected Courses & Sections:</h3>
          {shoppingCart.sections.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Course</TableHead>
                  <TableHead>Section</TableHead>
                  <TableHead>Instructor</TableHead>
                  <TableHead>Schedule</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Credits</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {shoppingCart.sections.map(section => {
                  const parentCourse = getParentCourse(section.id);
                  return (
                    <TableRow key={section.id}>
                      <TableCell>
                        <div className="font-medium">{parentCourse?.code || section.id.split('-')[0]}</div>
                        <div className="text-xs text-muted-foreground">{parentCourse?.name}</div>
                      </TableCell>
                      <TableCell>{section.sectionNumber} {section.sectionType && section.sectionType !== "Standard" && <Badge variant="outline" className="ml-1">{section.sectionType}</Badge>}</TableCell>
                      <TableCell>{section.instructor}</TableCell>
                      <TableCell>
                        {section.schedule.map((s, idx) => (
                          <div key={idx} className="text-xs">{s.days}: {s.startTime}-{s.endTime}</div>
                        ))}
                      </TableCell>
                      <TableCell className="text-xs">{section.location}</TableCell>
                      <TableCell>{parentCourse?.credits || 'N/A'}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <p className="text-sm text-muted-foreground">No sections in this schedule.</p>
          )}
        </CardContent>
        <CardFooter className="flex justify-end space-x-3 border-t pt-6">
          <Button variant="outline" onClick={clearCart}>
            <Trash2 className="h-4 w-4 mr-2" /> Clear Cart
          </Button>
          <Button disabled> {/* Placeholder for SIS integration */}
            <Send className="h-4 w-4 mr-2" /> Proceed to Registration (SIS)
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default RegistrationSummary;
