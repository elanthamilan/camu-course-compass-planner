
import React from "react";
import { useSchedule } from "../../contexts/ScheduleContext";
import { Card } from "@/components/atoms/card";
import { Button } from "@/components/atoms/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { timeSlots, weekDays, busyTimeColors } from "../../lib/mock-data";
import { cn } from "../../lib/utils";
import { motion } from "framer-motion";
import { BusyTimeType } from "../../lib/types";

interface CompareCalendarViewProps {
  scheduleIds: string[];
}

const CompareCalendarView: React.FC<CompareCalendarViewProps> = ({ scheduleIds }) => {
  const { schedules } = useSchedule();
  const [currentIndex, setCurrentIndex] = React.useState(0);
  
  // Filter schedules by the provided IDs and ensure they're in the same order
  const selectedSchedules = scheduleIds
    .map(id => schedules.find(s => s.id === id))
    .filter(Boolean) as any[];
  
  // Get first schedule to show
  const currentSchedule = selectedSchedules[currentIndex];
  
  if (!currentSchedule) return null;
  
  const handleNext = () => {
    if (currentIndex < selectedSchedules.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };
  
  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };
  
  // Process sections and busy times to map them to the calendar
  const scheduledSections = currentSchedule.sections;
  const busyTimes = currentSchedule.busyTimes;
  
  // Create a map of day-time slots to course sections
  const calendarMap: Record<string, any[]> = {};
  
  scheduledSections.forEach((section: any) => {
    section.schedule.forEach((schedule: any) => {
      const days = schedule.days.split(",");
      days.forEach((day: string) => {
        const startHour = parseInt(schedule.startTime.split(":")[0]);
        const endHour = parseInt(schedule.endTime.split(":")[0]);
        
        for (let hour = startHour; hour < endHour; hour++) {
          const timeKey = `${hour}`;
          const dayKey = day.trim();
          const key = `${dayKey}-${timeKey}`;
          
          if (!calendarMap[key]) {
            calendarMap[key] = [];
          }
          
          // Find the course this section belongs to
          const courseCode = section.id.split("-")[0].toUpperCase();
          
          calendarMap[key].push({
            type: 'course',
            courseCode: courseCode as string,
            sectionId: section.id,
            instructor: section.instructor,
            location: schedule.location,
            color: getCourseColor(courseCode as string)
          });
        }
      });
    });
  });
  
  // Add busy times to the calendar map
  busyTimes.forEach((busyTime: any) => {
    busyTime.days.forEach((day: string) => {
      const startHour = parseInt(busyTime.startTime.split(":")[0]);
      const endHour = parseInt(busyTime.endTime.split(":")[0]);
      
      for (let hour = startHour; hour < endHour; hour++) {
        const timeKey = `${hour}`;
        const key = `${day}-${timeKey}`;
        
        if (!calendarMap[key]) {
          calendarMap[key] = [];
        }
        
        calendarMap[key].push({
          type: 'busy',
          title: busyTime.title,
          busyTimeType: busyTime.type as BusyTimeType
        });
      }
    });
  });
  
  function getCourseColor(courseCode: string) {
    if (courseCode.startsWith("CS")) return "course-cs";
    if (courseCode.startsWith("MATH")) return "course-math";
    if (courseCode.startsWith("ENG")) return "course-eng";
    if (courseCode.startsWith("BIO")) return "course-bio";
    if (courseCode.startsWith("CHEM")) return "course-chem";
    if (courseCode.startsWith("PHYS")) return "course-phys";
    if (courseCode.startsWith("PHIL")) return "course-phil";
    if (courseCode.startsWith("UNIV")) return "course-univ";
    if (courseCode.startsWith("ECON")) return "course-econ";
    return "bg-gray-200";
  }
  
  return (
    <motion.div 
      className="space-y-4 animate-fade-in"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className="flex items-center"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Previous
        </Button>
        
        <div className="text-center">
          <h3 className="font-medium">{currentSchedule.name}</h3>
          <div className="text-xs text-gray-600">
            Schedule {currentIndex + 1} of {selectedSchedules.length}
          </div>
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={handleNext}
          disabled={currentIndex === selectedSchedules.length - 1}
          className="flex items-center"
        >
          Next
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
      
      <Card className="p-4 overflow-auto border border-gray-200 rounded-xl shadow-sm">
        <div className="min-w-[900px]">
          {/* Calendar Header with Weekdays */}
          <div className="grid grid-cols-[80px_repeat(7,1fr)] gap-1 mb-2">
            <div className="text-center font-medium p-2 text-gray-500">Time</div>
            {weekDays.map(day => (
              <motion.div 
                key={day} 
                className="text-center font-medium p-2 bg-gray-100 rounded-md"
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: weekDays.indexOf(day) * 0.05 }}
              >
                {day}
              </motion.div>
            ))}
          </div>
          
          {/* Calendar Body with Time Slots */}
          {timeSlots.map((timeSlot, index) => (
            <motion.div 
              key={timeSlot}
              className="grid grid-cols-[80px_repeat(7,1fr)] gap-1 mb-1"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.03 }}
            >
              {/* Time slot label */}
              <div className="text-center text-sm font-medium flex items-center justify-center bg-gray-50 rounded-md text-gray-600">
                {timeSlot}
              </div>
              
              {/* Days of the week */}
              {weekDays.map(day => {
                const hour = index + 7; // 7 AM is the first slot
                const key = `${day.charAt(0)}-${hour}`;
                const items = calendarMap[key] || [];
                
                return (
                  <div 
                    key={`${day}-${timeSlot}`}
                    className={cn(
                      "p-0.5 rounded-lg border min-h-[70px] transition-all",
                      items.length > 0 ? "border-gray-300 shadow-sm" : "border-gray-100"
                    )}
                  >
                    {items.map((item, i: number) => {
                      if (item.type === 'course') {
                        return (
                          <motion.div 
                            key={`${item.courseCode}-${i}`}
                            className={cn(
                              "p-1 text-xs rounded-md bg-opacity-90 h-full",
                              `bg-${item.color}`,
                              item.courseCode.startsWith("CS") && "bg-course-cs text-black",
                              item.courseCode.startsWith("MATH") && "bg-course-math text-white",
                              item.courseCode.startsWith("ENG") && "bg-course-eng text-white",
                              item.courseCode.startsWith("PHYS") && "bg-course-phys text-black",
                              item.courseCode.startsWith("CHEM") && "bg-course-chem text-white",
                              item.courseCode.startsWith("BIO") && "bg-course-bio text-white",
                              item.courseCode.startsWith("PHIL") && "bg-course-phil text-white",
                              item.courseCode.startsWith("UNIV") && "bg-course-univ text-white",
                              item.courseCode.startsWith("ECON") && "bg-course-econ text-white",
                            )}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.3 }}
                          >
                            <div className="font-semibold">{item.courseCode}</div>
                            <div className="text-[10px] truncate">{item.instructor}</div>
                            <div className="text-[10px] truncate">{item.location}</div>
                          </motion.div>
                        );
                      } else if (item.type === 'busy') {
                        const busyType = item.busyTimeType as BusyTimeType;
                        const busyTypeStyle = busyTimeColors[busyType] || busyTimeColors.other;
                        
                        return (
                          <motion.div 
                            key={`busy-${i}`}
                            className={cn(
                              "p-1 text-xs rounded-md h-full flex items-center space-x-1",
                              busyTypeStyle.bg,
                              busyTypeStyle.text
                            )}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.3 }}
                          >
                            <span className="truncate flex-1">{item.title}</span>
                          </motion.div>
                        );
                      }
                      
                      return null;
                    })}
                  </div>
                );
              })}
            </motion.div>
          ))}
        </div>
      </Card>
    </motion.div>
  );
};

export default CompareCalendarView;
