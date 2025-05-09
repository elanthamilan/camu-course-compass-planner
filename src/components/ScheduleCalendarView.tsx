
import React from "react";
import { useSchedule } from "@/contexts/ScheduleContext";
import { Card } from "@/components/ui/card";
import { timeSlots, weekDays, busyTimeColors } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const ScheduleCalendarView = () => {
  const { selectedSchedule, busyTimes } = useSchedule();

  if (!selectedSchedule) return null;

  // Process sections to map them to the calendar
  const scheduledSections = selectedSchedule.sections;
  
  // Create a map of day-time slots to course sections
  const calendarMap: Record<string, any> = {};
  
  scheduledSections.forEach(section => {
    section.schedule.forEach(schedule => {
      const days = schedule.days.split(",");
      days.forEach(day => {
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
            courseCode,
            sectionId: section.id,
            instructor: section.instructor,
            location: schedule.location,
            color: getCourseColor(courseCode)
          });
        }
      });
    });
  });
  
  // Add busy times to the calendar map
  busyTimes.forEach(busyTime => {
    busyTime.days.forEach(day => {
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
          busyTimeType: busyTime.type
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
      className="animate-fade-in"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="p-4 mb-4 overflow-auto border border-[#9EA6B5] rounded-xl shadow-sm">
        <div className="min-w-[900px]">
          {/* Calendar Header with Weekdays */}
          <div className="grid grid-cols-[80px_repeat(7,1fr)] gap-1 mb-2">
            <div className="text-center font-medium p-2 text-[#3D4F6D]">Time</div>
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
              <div className="text-center text-sm font-medium flex items-center justify-center bg-gray-50 rounded-md text-[#3D4F6D]">
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
                      items.length > 0 ? "border-[#9EA6B5] shadow-sm" : "border-gray-100"
                    )}
                  >
                    {items.map((item: any, i: number) => {
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
                        const busyTypeStyle = busyTimeColors[item.busyTimeType] || busyTimeColors.other;
                        
                        return (
                          <motion.div 
                            key={`busy-${i}`}
                            className={cn(
                              "p-1 text-xs rounded-md h-full flex items-center space-x-1",
                              busyTypeStyle.bg || "bg-[#FDF3BF]",
                              busyTypeStyle.text || "text-[#011434]"
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

export default ScheduleCalendarView;
