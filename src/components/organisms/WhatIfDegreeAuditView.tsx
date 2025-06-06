import React from 'react';
import { AcademicProgram, DegreeRequirement } from '../../lib/types'; // Adjust path if needed
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/atoms/card';
import { Badge } from '@/components/atoms/badge';
import { Button } from '@/components/atoms/button'; // Added Button import
import { CheckCircle2, CircleDot, Circle } from 'lucide-react'; // For status icons

interface WhatIfDegreeAuditViewProps {
  whatIfProgram: AcademicProgram | null;
  whatIfRequirements: DegreeRequirement[] | null;
  onFindCoursesForRequirement: (requirement: DegreeRequirement) => void;
  // studentCompletedCourses?: string[]; // Optional, for more detailed display later
}

const WhatIfDegreeAuditView: React.FC<WhatIfDegreeAuditViewProps> = ({
  whatIfProgram,
  whatIfRequirements,
  onFindCoursesForRequirement,
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


  // Calculate overall progress
  const totalRequirements = whatIfRequirements.length;
  const completedRequirements = whatIfRequirements.filter(req => (req.progress ?? 0) === 1).length;
  const inProgressRequirements = whatIfRequirements.filter(req => (req.progress ?? 0) > 0 && (req.progress ?? 0) < 1).length;
  const notStartedRequirements = totalRequirements - completedRequirements - inProgressRequirements;

  const overallProgress = totalRequirements > 0 ? (completedRequirements / totalRequirements) * 100 : 0;

  return (
    <div className="space-y-6 mt-6">
      {/* Results Summary Card */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-green-800">
            <CheckCircle2 className="h-6 w-6" />
            <span>Analysis Complete!</span>
          </CardTitle>
          <CardDescription className="text-green-700">
            Here's how your current progress would apply to <strong>{whatIfProgram.name}</strong>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div className="text-center p-3 bg-white rounded-lg border">
              <div className="text-2xl font-bold text-green-600">{completedRequirements}</div>
              <div className="text-sm text-gray-600">Requirements Complete</div>
            </div>
            <div className="text-center p-3 bg-white rounded-lg border">
              <div className="text-2xl font-bold text-yellow-600">{inProgressRequirements}</div>
              <div className="text-sm text-gray-600">In Progress</div>
            </div>
            <div className="text-center p-3 bg-white rounded-lg border">
              <div className="text-2xl font-bold text-gray-600">{notStartedRequirements}</div>
              <div className="text-sm text-gray-600">Still Needed</div>
            </div>
            <div className="text-center p-3 bg-white rounded-lg border">
              <div className="text-2xl font-bold text-blue-600">{Math.round(overallProgress)}%</div>
              <div className="text-sm text-gray-600">Overall Progress</div>
            </div>
          </div>

          {whatIfProgram.totalCreditsRequired && (
            <div className="p-3 bg-white rounded-lg border">
              <p className="text-sm font-medium text-gray-700 mb-1">
                Total Credits Required: {whatIfProgram.totalCreditsRequired}
              </p>
              <p className="text-xs text-gray-600">
                This program typically takes {Math.ceil(whatIfProgram.totalCreditsRequired / 15)} semesters to complete at 15 credits per semester.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detailed Requirements */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Detailed Requirements Breakdown</CardTitle>
          <CardDescription>
            See exactly what you've completed and what you still need for this program.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Completed Requirements */}
            {completedRequirements > 0 && (
              <div>
                <h4 className="font-semibold text-green-700 mb-2 flex items-center">
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  ✅ Requirements You've Already Met ({completedRequirements})
                </h4>
                <div className="space-y-2 ml-6">
                  {whatIfRequirements
                    .filter(req => (req.progress ?? 0) === 1)
                    .map(req => (
                      <div key={req.id} className="p-2 bg-green-50 border border-green-200 rounded">
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-green-800">{req.name}</span>
                          <Badge variant="default" className="bg-green-600">
                            {getRequirementDisplayProgress(req)}
                          </Badge>
                        </div>
                        {req.description && (
                          <p className="text-xs text-green-700 mt-1">{req.description}</p>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* In Progress Requirements */}
            {inProgressRequirements > 0 && (
              <div>
                <h4 className="font-semibold text-yellow-700 mb-2 flex items-center">
                  <CircleDot className="h-4 w-4 mr-2" />
                  🔄 Requirements You're Partially Done With ({inProgressRequirements})
                </h4>
                <div className="space-y-2 ml-6">
                  {whatIfRequirements
                    .filter(req => (req.progress ?? 0) > 0 && (req.progress ?? 0) < 1)
                    .map(req => (
                      <div key={req.id} className="p-2 bg-yellow-50 border border-yellow-200 rounded">
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-yellow-800">{req.name}</span>
                          <Badge variant="secondary">
                            {getRequirementDisplayProgress(req)}
                          </Badge>
                        </div>
                        {req.description && (
                          <p className="text-xs text-yellow-700 mt-1">{req.description}</p>
                        )}
                        <Button
                          variant="link"
                          size="sm"
                          className="mt-1 text-xs px-0 h-auto text-yellow-700 hover:text-yellow-900"
                          onClick={() => onFindCoursesForRequirement(req)}
                        >
                          → Find courses to complete this requirement
                        </Button>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Not Started Requirements */}
            {notStartedRequirements > 0 && (
              <div>
                <h4 className="font-semibold text-gray-700 mb-2 flex items-center">
                  <Circle className="h-4 w-4 mr-2" />
                  📋 Requirements You Still Need to Start ({notStartedRequirements})
                </h4>
                <div className="space-y-2 ml-6">
                  {whatIfRequirements
                    .filter(req => (req.progress ?? 0) === 0 || req.progress === undefined || isNaN(req.progress ?? 0))
                    .map(req => (
                      <div key={req.id} className="p-2 bg-gray-50 border border-gray-200 rounded">
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-gray-800">{req.name}</span>
                          <Badge variant="outline">
                            {getRequirementDisplayProgress(req)}
                          </Badge>
                        </div>
                        {req.description && (
                          <p className="text-xs text-gray-600 mt-1">{req.description}</p>
                        )}
                        <Button
                          variant="link"
                          size="sm"
                          className="mt-1 text-xs px-0 h-auto text-blue-600 hover:text-blue-800"
                          onClick={() => onFindCoursesForRequirement(req)}
                        >
                          → Find courses for this requirement
                        </Button>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Next Steps Card */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-800">What This Means & Next Steps</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {overallProgress >= 75 ? (
            <div className="p-3 bg-green-100 border border-green-300 rounded">
              <p className="text-green-800 font-medium">🎉 Great news! You're well on your way!</p>
              <p className="text-green-700 text-sm mt-1">
                You've completed most requirements for this program. Consider talking to an academic advisor about officially switching or adding this as a minor.
              </p>
            </div>
          ) : overallProgress >= 50 ? (
            <div className="p-3 bg-yellow-100 border border-yellow-300 rounded">
              <p className="text-yellow-800 font-medium">📈 You're making good progress!</p>
              <p className="text-yellow-700 text-sm mt-1">
                You've completed about half the requirements. This could be a viable option with some additional planning.
              </p>
            </div>
          ) : overallProgress >= 25 ? (
            <div className="p-3 bg-orange-100 border border-orange-300 rounded">
              <p className="text-orange-800 font-medium">🚀 It's possible, but will take some work!</p>
              <p className="text-orange-700 text-sm mt-1">
                You have a foundation, but would need to complete several more requirements. Consider if this aligns with your goals and timeline.
              </p>
            </div>
          ) : (
            <div className="p-3 bg-blue-100 border border-blue-300 rounded">
              <p className="text-blue-800 font-medium">🌟 This would be a fresh start!</p>
              <p className="text-blue-700 text-sm mt-1">
                This program would require completing most requirements from scratch. Make sure this aligns with your career goals and available time.
              </p>
            </div>
          )}

          <div className="text-sm text-blue-700 space-y-1">
            <p><strong>Remember:</strong> This is just an exploration tool. To make any official changes:</p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>Talk to your academic advisor</li>
              <li>Check with the admissions office for program requirements</li>
              <li>Consider how this fits with your graduation timeline</li>
              <li>Look into any additional application requirements</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WhatIfDegreeAuditView;
