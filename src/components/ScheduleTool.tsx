
import React, { useState } from "react";
import TermHeader from "./TermHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Course } from "@/lib/types";
import { useSchedule } from "@/contexts/ScheduleContext";
import ScheduleCalendarView from "./ScheduleCalendarView";
import ScheduleListView from "./ScheduleListView";
import BusyTimeItem from "./BusyTimeItem";
import AddBusyTimeDialog from "./AddBusyTimeDialog";
import EditBusyTimeDialog from "./EditBusyTimeDialog";
import AIAdvisorDialog from "./AIAdvisor";
import TunePreferencesDialog from "./TunePreferencesDialog";
import CompareSchedulesDialog from "./CompareSchedulesDialog";
import { PlusCircle, Sliders, ArrowLeftRight } from "lucide-react";

const ScheduleTool = () => {
  const { 
    courses, 
    busyTimes, 
    selectedSchedule, 
    generateSchedules 
  } = useSchedule();

  const [view, setView] = useState("calendar");
  const [isAddBusyTimeOpen, setIsAddBusyTimeOpen] = useState(false);
  const [isEditBusyTimeOpen, setIsEditBusyTimeOpen] = useState(false);
  const [selectedBusyTime, setSelectedBusyTime] = useState(null);
  const [isAIAdvisorOpen, setIsAIAdvisorOpen] = useState(false);
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [isPreferencesOpen, setIsPreferencesOpen] = useState(false);

  const handleEditBusyTime = (busyTime: any) => {
    setSelectedBusyTime(busyTime);
    setIsEditBusyTimeOpen(true);
  };

  return (
    <div className="animate-fade-in">
      {/* Term Header with View Toggles */}
      <TermHeader view={view} setView={setView} />
      
      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          {/* Busy Times Section */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-medium flex items-center">
                <Badge variant="outline" className="mr-2">
                  Busy time ({busyTimes.length})
                </Badge>
              </h3>
              <Button 
                variant="outline" 
                className="h-8" 
                onClick={() => setIsAddBusyTimeOpen(true)}
              >
                <PlusCircle className="h-4 w-4 mr-1.5" />
                Add busy time
              </Button>
            </div>
            
            <div className="space-y-2">
              {busyTimes.map(busyTime => (
                <BusyTimeItem 
                  key={busyTime.id} 
                  busyTime={busyTime}
                  onEdit={handleEditBusyTime}
                />
              ))}
              
              {busyTimes.length === 0 && (
                <div className="text-sm text-gray-500 bg-gray-50 p-3 rounded-md">
                  No busy times added yet. Add your regular commitments to avoid scheduling conflicts.
                </div>
              )}
            </div>
          </div>
          
          {/* Courses Section */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-medium flex items-center">
                <Badge variant="outline" className="mr-2">
                  Courses ({courses.length})
                </Badge>
              </h3>
              <div className="flex space-x-1">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="h-8 flex items-center"
                  onClick={() => setIsCompareOpen(true)}
                >
                  <ArrowLeftRight className="h-4 w-4 mr-1.5" />
                  Compare schedules
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="h-8"
                  onClick={() => setIsPreferencesOpen(true)}
                >
                  <Sliders className="h-4 w-4 mr-1.5" />
                  Tune preferences
                </Button>
              </div>
            </div>
            
            <div className="space-y-2 mb-4">
              {courses.map((course: Course) => (
                <div 
                  key={course.id}
                  className="bg-white border rounded-md p-3 flex justify-between items-start group hover:shadow-sm transition-all"
                >
                  <div>
                    <div className="flex items-center mb-1">
                      <span className="font-medium mr-2">{course.code}</span>
                      <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">{course.credits}cr</span>
                    </div>
                    <div className="text-sm mb-1">{course.name}</div>
                    <div className="text-xs text-gray-500">Pre-Calculus</div>
                  </div>
                  
                  <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="h-6 w-6">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/><path d="m15 5 3 3"/></svg>
                    </Button>
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-red-500 hover:text-red-700 hover:bg-red-50">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>
                    </Button>
                  </div>
                </div>
              ))}
              
              {courses.length === 0 && (
                <div className="text-sm text-gray-500 bg-gray-50 p-3 rounded-md">
                  No courses added yet. Add courses to generate schedules.
                </div>
              )}
            </div>
            
            <Button 
              onClick={generateSchedules} 
              className="w-full bg-blue-500 hover:bg-blue-600 transition-colors"
              disabled={courses.length === 0}
            >
              Generate schedule
            </Button>
          </div>
        </div>
        
        {/* Main Schedule View */}
        <div className="lg:col-span-3">
          <div className="space-y-2 mb-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-lg">
                {selectedSchedule?.name || "No Schedule Selected"}
              </h3>
              <div className="flex items-center space-x-1">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setIsAIAdvisorOpen(true)}
                  className="flex items-center text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
                  Ask AI Advisor
                </Button>
              </div>
            </div>
            
            {selectedSchedule && (
              <div className="text-sm text-gray-500">
                {selectedSchedule.totalCredits} credits {selectedSchedule.conflicts?.length > 0 && (
                  <span className="text-amber-500">
                    • {selectedSchedule.conflicts.length} conflict{selectedSchedule.conflicts.length > 1 ? 's' : ''}
                  </span>
                )}
              </div>
            )}
          </div>
          
          {/* Schedule Views */}
          {view === "calendar" ? (
            <ScheduleCalendarView />
          ) : (
            <ScheduleListView />
          )}
        </div>
      </div>
      
      {/* Dialogs */}
      <AddBusyTimeDialog 
        open={isAddBusyTimeOpen} 
        onOpenChange={setIsAddBusyTimeOpen} 
      />
      
      <EditBusyTimeDialog 
        open={isEditBusyTimeOpen}
        onOpenChange={setIsEditBusyTimeOpen}
        busyTime={selectedBusyTime}
      />
      
      <AIAdvisorDialog
        open={isAIAdvisorOpen}
        onOpenChange={setIsAIAdvisorOpen}
      />
      
      <TunePreferencesDialog
        open={isPreferencesOpen}
        onOpenChange={setIsPreferencesOpen}
      />
      
      <CompareSchedulesDialog
        open={isCompareOpen}
        onOpenChange={setIsCompareOpen}
      />
    </div>
  );
};

export default ScheduleTool;
