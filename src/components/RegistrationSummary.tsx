import React, { useState } from "react";
import { useSchedule } from "@/contexts/ScheduleContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, ArrowLeft, Check, ShoppingCart, Trash2, ShieldCheck, CircleSlash } from "lucide-react"; // Added Trash2, ShieldCheck, CircleSlash
import { toast } from "sonner";
import { Course, CourseSection, BusyTime, StudentInfo } from "@/lib/types"; // For validation function
import { isSectionConflictWithBusyTimes, isSectionConflictWithOtherSections } from "@/contexts/ScheduleContextUtils"; // Import helpers

// Define validation result types
interface SectionValidationResult {
  isValid: boolean;
  message?: string;
  conflicts?: string[]; // e.g., ["vs CS102", "vs Busy Time"]
}
interface CartValidationResults {
  overallValid: boolean;
  messages: string[];
  sectionResults: Record<string, SectionValidationResult>; // section.id -> result
}


const RegistrationSummary = () => {
  const { 
    shoppingCart, 
    clearCart, 
    studentInfo, 
    courses: planningCourses, // User's selected courses for planning (might not contain all catalog courses)
    busyTimes,
    currentTerm // Assuming currentTerm.courses has all available courses for full details
  } = useSchedule();
  const navigate = useNavigate();
  const [validationResults, setValidationResults] = useState<CartValidationResults | null>(null);

  const allCatalogCourses = currentTerm?.courses || mockCourses; // Fallback to mockCourses if needed

  const getCourseDetails = (section: CourseSection): Course | undefined => {
    const courseIdOrCode = section.id.split("-")[0];
    // Try finding in planningCourses first, then in allCatalogCourses
    return planningCourses.find(c => c.id === courseIdOrCode || c.code === courseIdOrCode) || 
           allCatalogCourses.find(c => c.id === courseIdOrCode || c.code === courseIdOrCode);
  };


  const handleCompleteRegistration = () => {
    if (!validationResults || !validationResults.overallValid) {
      toast.error("Please validate your cart or resolve issues before completing registration.");
      return;
    }
    toast.success("Registration completed successfully! (Mocked)");
    // clearCart(); // Optionally clear cart after successful registration
    setTimeout(() => {
      navigate("/"); 
    }, 1500);
  };

  const handleValidateCart = () => {
    if (!shoppingCart) {
      toast.error("Shopping cart is empty.");
      return;
    }

    const results: CartValidationResults = {
      overallValid: true,
      messages: [],
      sectionResults: {},
    };

    // 1. Prerequisite Check (Mock)
    shoppingCart.sections.forEach(section => {
      const course = getCourseDetails(section);
      results.sectionResults[section.id] = { isValid: true, conflicts: [] }; // Default to valid

      if (course?.prerequisites && course.prerequisites.length > 0) {
        const metAllPrereqs = course.prerequisites.every(prereqId => 
          studentInfo.completedCourses.includes(prereqId)
        );
        if (!metAllPrereqs) {
          results.sectionResults[section.id].isValid = false;
          results.sectionResults[section.id].message = `Prerequisites not met (${course.prerequisites.join(', ')})`;
          results.overallValid = false;
        }
      }
    });

    // 2. Time Conflict Check (among sections in cart)
    for (let i = 0; i < shoppingCart.sections.length; i++) {
      const sectionA = shoppingCart.sections[i];
      if (!results.sectionResults[sectionA.id].isValid) continue; // Skip if already invalid

      for (let j = i + 1; j < shoppingCart.sections.length; j++) {
        const sectionB = shoppingCart.sections[j];
        if (isSectionConflictWithOtherSections(sectionA, [sectionB])) {
          results.sectionResults[sectionA.id].isValid = false;
          results.sectionResults[sectionA.id].conflicts = [...(results.sectionResults[sectionA.id].conflicts || []), `vs ${getCourseDetails(sectionB)?.code || sectionB.id.split("-")[0]}`];
          results.sectionResults[sectionB.id].isValid = false; // Mark both conflicting sections
          results.sectionResults[sectionB.id].conflicts = [...(results.sectionResults[sectionB.id].conflicts || []), `vs ${getCourseDetails(sectionA)?.code || sectionA.id.split("-")[0]}`];
          results.overallValid = false;
        }
      }
    }
    
    // 3. Time Conflict Check (with Busy Times)
    shoppingCart.sections.forEach(section => {
      if (!results.sectionResults[section.id].isValid && results.sectionResults[section.id].message?.includes("Prerequisites")) return; // Don't overwrite prereq message unless new conflict type

      if (isSectionConflictWithBusyTimes(section, busyTimes)) {
        results.sectionResults[section.id].isValid = false;
        results.sectionResults[section.id].conflicts = [...(results.sectionResults[section.id].conflicts || []), "vs Busy Time"];
        results.overallValid = false;
      }
    });

    // Consolidate messages for sections
     Object.values(results.sectionResults).forEach(sr => {
        if (!sr.isValid && sr.conflicts && sr.conflicts.length > 0) {
            sr.message = (sr.message ? sr.message + "; " : "") + "Conflicts: " + sr.conflicts.join(', ');
        }
    });

    if (results.overallValid) {
      results.messages.push("All courses in cart are valid!");
      toast.success("Cart validation successful!");
    } else {
      results.messages.push("Your cart has issues. Please review highlighted courses.");
      toast.error("Cart validation failed. Please review issues.");
    }
    setValidationResults(results);
  };


  if (!shoppingCart) {
    return (
      <div className="container max-w-4xl mx-auto px-4 py-8 text-center animate-fade-in">
        <ShoppingCart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <h1 className="text-2xl font-bold mb-4">Your Shopping Cart is Empty</h1>
        <p className="text-muted-foreground mb-6">Add a schedule to your cart to see it here.</p>
        <Button onClick={() => navigate("/schedule")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Scheduler
        </Button>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8 animate-fade-in">
      <Button 
        variant="ghost" 
        className="mb-6 flex items-center text-muted-foreground hover:text-foreground"
        onClick={() => navigate("/schedule")}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Scheduler
      </Button>
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h1 className="text-3xl font-bold">Shopping Cart</h1>
        <div className="flex space-x-2 mt-3 sm:mt-0">
            <Button variant="outline" onClick={handleValidateCart}>
                <ShieldCheck className="h-4 w-4 mr-2" />
                Validate Cart
            </Button>
            <Button variant="destructive" onClick={clearCart} size="icon" aria-label="Clear Cart">
                <Trash2 className="h-4 w-4" />
            </Button>
        </div>
      </div>
      
      {validationResults && validationResults.messages.length > 0 && (
        <Card className={`mb-6 ${validationResults.overallValid ? 'border-green-500' : 'border-red-500'} animate-scale-in`}>
          <CardContent className="p-4">
            {validationResults.messages.map((msg, idx) => (
              <p key={idx} className={`text-sm ${validationResults.overallValid ? 'text-green-700' : 'text-red-700'}`}>
                {validationResults.overallValid ? <Check className="h-4 w-4 mr-2 inline" /> : <AlertTriangle className="h-4 w-4 mr-2 inline" />}
                {msg}
              </p>
            ))}
          </CardContent>
        </Card>
      )}

      <div className="space-y-8">
        <Card className="shadow-lg border-border animate-scale-in">
          <CardHeader>
            <CardTitle className="text-xl">Schedule: {shoppingCart.name} ({shoppingCart.totalCredits} credits)</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {shoppingCart.sections.map(section => {
                const courseDetails = getCourseDetails(section);
                const sectionResult = validationResults?.sectionResults[section.id];
                
                return (
                  <div 
                    key={section.id} 
                    className={cn(
                        "flex flex-col sm:flex-row justify-between sm:items-center border-b pb-4 last:border-0 last:pb-0",
                        sectionResult && !sectionResult.isValid && "bg-red-50/50 p-3 rounded-md ring-1 ring-red-200"
                    )}
                  >
                    <div>
                      <div className="flex items-center">
                        <span className="font-semibold">{courseDetails?.code || section.id.split("-")[0]} - {courseDetails?.name || "Unknown Course"}</span>
                        {sectionResult && sectionResult.isValid && (
                           <Check className="h-5 w-5 ml-2 text-green-500" />
                        )}
                        {sectionResult && !sectionResult.isValid && (
                           <AlertTriangle className="h-5 w-5 ml-2 text-red-500" />
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground mt-0.5">
                        Credits: {courseDetails?.credits || "N/A"}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Section {section.sectionNumber} • CRN: {section.crn} • {section.instructor}
                      </div>
                       {sectionResult && !sectionResult.isValid && sectionResult.message && (
                        <p className="text-xs text-red-600 mt-1">{sectionResult.message}</p>
                      )}
                    </div>
                    <div className="mt-2 sm:mt-0">
                      {/* Placeholder for potential actions like "Remove from cart" if needed */}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in" style={{animationDelay: "100ms"}}>
          <Card className="shadow-sm">
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-3">Program Progress (Mock)</h2>
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
              <h2 className="text-lg font-semibold mb-3">Mandatory Courses (Mock)</h2>
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
        
        <div className="flex flex-col sm:flex-row justify-center items-center gap-3 animate-fade-in" style={{animationDelay: "200ms"}}>
          <Button 
            variant="default"
            size="lg"
            className="text-lg px-8 w-full sm:w-auto"
            onClick={handleCompleteRegistration}
            disabled={validationResults && !validationResults.overallValid}
          >
            <ShoppingCart className="h-5 w-5 mr-2" />
            Complete Registration
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RegistrationSummary;
