import React from 'react';
import { AcademicProgram, DegreeRequirement } from '@/lib/types'; // Adjust path if needed
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, CircleDot, Circle } from 'lucide-react'; // For status icons

interface WhatIfDegreeAuditViewProps {
  whatIfProgram: AcademicProgram | null;
  whatIfRequirements: DegreeRequirement[] | null;
  // studentCompletedCourses?: string[]; // Optional, for more detailed display later
}

const WhatIfDegreeAuditView: React.FC<WhatIfDegreeAuditViewProps> = ({
  whatIfProgram,
  whatIfRequirements,
}) => {
  if (!whatIfProgram || !whatIfRequirements || whatIfRequirements.length === 0) {
    return (
      <div className="mt-6 text-center text-muted-foreground">
        <p>Select a major (and optionally a minor) above and click "Analyze" to see a What-If degree progress report.</p>
      </div>
    );
  }

  // Helper to get status badge variant (similar to CourseDashboard)
  const getStatusBadgeVariant = (progress: number): "default" | "secondary" | "destructive" | "outline" => {
    if (progress === 1) return "default"; // Green for completed
    if (progress > 0) return "secondary"; // Blue/grey for in-progress
    return "outline"; // Outline for not started
  };
  
  const getRequirementDisplayProgress = (req: DegreeRequirement): string => {
    if (req.choiceRequired && req.choiceCourses) { // Or just req.choiceRequired if progressCourses is always calculated
      return `${req.progressCourses ?? 0}/${req.choiceRequired} courses`;
    }
    if (req.requiredCredits > 0) {
      const completedCredits = Math.round((req.progress ?? 0) * req.requiredCredits);
      return `${completedCredits}/${req.requiredCredits} credits`;
    }
    // Fallback for requirements that might be activity-based (e.g. 1 specific course with 0 credits)
    if (req.progress === 1) return "Completed";
    return "Not Started";
  };


  return (
    <Card className="w-full mt-6 animate-fade-in">
      <CardHeader>
        <CardTitle className="text-xl">
          What-If Degree Progress: <span className="text-primary">{whatIfProgram.name}</span>
          {whatIfProgram.type === 'Minor' && " (Minor)"}
        </CardTitle>
        <CardDescription>
          This is a hypothetical view showing how your completed courses might apply to the selected program(s).
          It does not change your officially declared program.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {whatIfProgram.totalCreditsRequired && (
          <div className="mb-4 pb-2 border-b">
            <p className="text-sm text-muted-foreground">
              Total Credits Required for Program: {whatIfProgram.totalCreditsRequired}
            </p>
            {/* Future: Could calculate and display total applied credits from student's history */}
          </div>
        )}
        <ul className="space-y-3">
          {whatIfRequirements.map(req => (
            <li key={req.id} className="p-3 border rounded-md bg-background/30 hover:bg-muted/20 transition-colors">
              <div className="flex justify-between items-start">
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-5 pt-0.5"> {/* Container for icon */}
                    {req.progress === 1 && <CheckCircle2 className="h-5 w-5 text-green-600" />}
                    {req.progress > 0 && req.progress < 1 && <CircleDot className="h-5 w-5 text-yellow-500" />}
                    {(req.progress === 0 || req.progress === undefined || isNaN(req.progress)) && <Circle className="h-5 w-5 text-gray-400" />}
                  </div>
                  <div className="ml-2">
                    <h4 className="font-semibold">{req.name}</h4>
                    {req.description && <p className="text-xs text-muted-foreground mt-0.5">{req.description}</p>}
                  </div>
                </div>
                <Badge variant={getStatusBadgeVariant(req.progress ?? 0)} className="ml-2 whitespace-nowrap">
                  {getRequirementDisplayProgress(req)}
                </Badge>
              </div>
              {/* Optional: Display which courses fulfilled this requirement in the what-if scenario */}
              {/* This would require passing studentCompletedCourses and enhancing logic here */}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};

export default WhatIfDegreeAuditView;
