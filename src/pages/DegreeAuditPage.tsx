import React, { useEffect, useState } from 'react';
import {
  DegreeAuditResults,
  DegreeRequirementAudit,
  DegreeAuditRuleStatus,
  StudentInfo,
  Degree,
  Course,
} from '../lib/types';
import { calculateDegreeAudit } from '../lib/degree-audit-utils';
import { mockStudent, mockPrograms, mockCourses } from '../lib/mock-data';
import Header from '../components/Header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/atoms/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import CourseCatalogView from '../components/CourseCatalogView';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CheckCircle, XCircle, Clock, ListChecks, Info } from 'lucide-react';

const DegreeAuditPage: React.FC = () => {
  const [degreeAuditData, setDegreeAuditData] = useState<DegreeAuditResults | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("audit");
  const [targetCourseInCatalog, setTargetCourseInCatalog] = useState<string | null>(null);

  useEffect(() => {
    // In a real app, studentInfo, degree, and allCourses might come from context, props, or API calls.
    const auditData = calculateDegreeAudit(mockStudent, mockPrograms[0], mockCourses);
    setDegreeAuditData(auditData);
    setLoading(false);
  }, []);

  if (loading || !degreeAuditData) {
    return (
      <div>
        <Header />
        <div className="container mx-auto p-4">
          <p>Loading degree audit data...</p>
        </div>
      </div>
    );
  }

  // Helper to get badge variant based on status
  const getStatusBadgeVariant = (status: DegreeAuditRuleStatus): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'fulfilled':
        return 'default'; // Typically green or primary
      case 'partially_fulfilled':
        return 'secondary'; // Typically yellow or gray
      case 'in_progress':
        return 'outline'; // Typically blue or another outline color
      case 'not_fulfilled':
        return 'destructive'; // Typically red
      default:
        return 'outline';
    }
  };

  const getStatusIcon = (status: DegreeAuditRuleStatus) => {
    switch (status) {
      case 'fulfilled':
        return <CheckCircle className="h-4 w-4 text-green-500 mr-2" />;
      case 'partially_fulfilled':
        return <ListChecks className="h-4 w-4 text-yellow-500 mr-2" />;
      case 'in_progress':
        return <Clock className="h-4 w-4 text-blue-500 mr-2" />;
      case 'not_fulfilled':
        return <XCircle className="h-4 w-4 text-red-500 mr-2" />;
      default:
        return <Info className="h-4 w-4 text-gray-500 mr-2" />;
    }
  };

  // Group requirements by category
  const groupedRequirements = degreeAuditData.requirementAudits.reduce((acc, req) => {
    const category = req.category || 'Other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(req);
    return acc;
  }, {} as Record<string, DegreeRequirementAudit[]>);

  const handleViewCourseInCatalog = (courseCodeOrId: string) => {
    setTargetCourseInCatalog(courseCodeOrId);
    setActiveTab("catalog");
    // Optional: Consider a smoother scroll or focusing logic later
    setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 0);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 sm:max-w-xs mb-4">
            <TabsTrigger value="audit">Degree Audit</TabsTrigger>
            <TabsTrigger value="catalog">Course Catalog</TabsTrigger>
          </TabsList>
          <TabsContent value="audit">
            <Card className="mb-6 shadow-lg border-border animate-fade-in">
              <CardHeader>
                <CardTitle className="text-xl sm:text-2xl font-bold text-gray-800">Degree Audit Summary</CardTitle>
            <CardDescription>
              Student: {mockStudent.name} ({mockStudent.id}) | Degree: {mockPrograms[0].name}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-gray-600">Overall Progress</span>
                <span className="text-sm font-semibold text-gray-700">
                  {degreeAuditData.totalCreditsEarned} / {degreeAuditData.totalCreditsRequired} Credits
                </span>
              </div>
              <Progress value={degreeAuditData.overallProgress * 100} className="w-full h-2" />
              <p className="text-xs text-gray-500 mt-1 text-right">
                {Math.round(degreeAuditData.overallProgress * 100)}% Complete
              </p>
            </div>
            {degreeAuditData.summaryNotes && degreeAuditData.summaryNotes.length > 0 && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-md text-sm text-blue-700 space-y-1">
                {degreeAuditData.summaryNotes.map((note, index) => (
                  <p key={index} className="flex items-start">
                    <Info className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                    {note}
                  </p>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <h2 className="text-xl font-semibold mb-4 text-gray-700">Requirement Breakdown</h2>

        {Object.entries(groupedRequirements).map(([category, requirements]) => (
          <div key={category} className="mb-8 animate-slide-up" style={{animationDelay: `${Object.keys(groupedRequirements).indexOf(category) * 100}ms`}}>
            <h3 className="text-base sm:text-lg font-semibold capitalize text-gray-600 mb-3 border-b pb-2">{category.replace(/_/g, ' ')}</h3>
            <Accordion type="multiple" className="w-full space-y-3">
              {requirements.map((req) => (
                <AccordionItem value={req.id} key={req.id} className="bg-white rounded-lg shadow border border-gray-200 hover:shadow-md transition-shadow">
                  <AccordionTrigger className="px-4 py-3 text-sm font-medium hover:bg-gray-50 rounded-t-lg">
                    <div className="flex flex-col items-start space-y-1 max-sm:space-y-1 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 w-full">
                      <span className="mr-2 text-left">{req.name}</span> {/* Removed truncate, added text-left for consistency when stacked */}
                      <div className="flex items-center flex-shrink-0 max-sm:mt-1"> {/* Added max-sm:mt-1 for spacing when stacked */}
                        {getStatusIcon(req.status)}
                        <Badge variant={getStatusBadgeVariant(req.status)} className="text-xs">
                          {req.status.replace(/_/g, ' ')}
                        </Badge>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 py-3 border-t bg-gray-50/50 rounded-b-lg">
                    <p className="text-xs text-gray-600 mb-3">{req.description}</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 text-xs mb-3">
                      <div>
                        <strong>Credits:</strong> {req.progressCredits ?? 0} / {req.requiredCredits}
                        <Progress value={req.requiredCredits > 0 ? ((req.progressCredits ?? 0) / req.requiredCredits) * 100 : 0} className="h-2 mt-1" />
                      </div>
                      {req.choiceRequired && (
                        <div>
                          <strong>Courses Chosen:</strong> {req.progressCourses ?? 0} / {req.choiceRequired}
                          <Progress value={req.choiceRequired > 0 ? ((req.progressCourses ?? 0) / req.choiceRequired) * 100 : 0} className="h-2 mt-1" />
                        </div>
                      )}
                    </div>

                    {req.fulfilledCourses && req.fulfilledCourses.length > 0 && (
                      <div className="mb-2">
                        <h5 className="text-xs font-semibold text-gray-700 mb-1">Fulfilled Courses:</h5>
                        <div className="flex flex-wrap gap-1">
                          {req.fulfilledCourses.map(courseCode => (
                            <Badge key={courseCode} variant="secondary" className="text-xs">{courseCode}</Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {(req.status === 'not_fulfilled' || req.status === 'partially_fulfilled' || req.status === 'in_progress') && (
                      <div>
                        <h5 className="text-xs font-semibold text-gray-700 mb-1">Suggested Courses:</h5>
                        <ul className="list-disc pl-4 text-xs text-gray-600 space-y-0.5">
                          {req.courses
                            .filter(courseIdOrCode => !(req.fulfilledCourses || []).includes(courseIdOrCode) && !mockStudent.currentCourses?.includes(courseIdOrCode) ) // Also check against current courses if needed
                            .slice(0, 5) // Show a few suggestions
                            .map(courseIdOrCode => {
                              const courseDetail = mockCourses.find(c => c.id === courseIdOrCode || c.code === courseIdOrCode);
                              return (
                                <li key={courseIdOrCode}>
                                  <span
                                    onClick={() => handleViewCourseInCatalog(courseDetail ? courseDetail.code : courseIdOrCode)}
                                    className="cursor-pointer text-blue-600 hover:underline font-medium"
                                  >
                                    {courseDetail ? `${courseDetail.code} - ${courseDetail.name} (${courseDetail.credits} cr)` : courseIdOrCode}
                                  </span>
                                </li>
                              );
                            })}
                          {req.courses.length > 5 && <li className="text-xs text-gray-500">... and more (see catalog for all options)</li>}
                        </ul>
                      </div>
                    )}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        ))}
          </TabsContent>
          <TabsContent value="catalog">
            <CourseCatalogView
              targetCourseCode={targetCourseInCatalog}
              onTargetCourseViewed={() => setTargetCourseInCatalog(null)}
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default DegreeAuditPage;
