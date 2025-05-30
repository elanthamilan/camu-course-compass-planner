
import { useSchedule } from "@/contexts/ScheduleContext";
import { Card } from "@/components/ui/card";
import { timeSlots, weekDays, busyTimeColors } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Lock } from "lucide-react"; // Import Lock icon
import { BusyTimeType } from "@/lib/types"; // Import BusyTimeType

interface ScheduleCalendarViewProps {
  lockedCourses?: string[]; 
}

const ScheduleCalendarView: React.FC<ScheduleCalendarViewProps> = ({ lockedCourses = [] }) => {
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
            color: getCourseColorInfo(courseCode),
            // locked: section.locked // This was section.locked, changing to check against lockedCourses prop
            isCourseLocked: lockedCourses.includes(section.id.split("-")[0]) || lockedCourses.includes(courseCode)
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

  function getCourseColorInfo(courseCode: string): { baseColor: string; backgroundClass: string; foregroundClass: string } {
    let baseColor = "default";
    if (courseCode.startsWith("CS")) baseColor = "cs";
    else if (courseCode.startsWith("MATH")) baseColor = "math";
    else if (courseCode.startsWith("ENG")) baseColor = "eng";
    else if (courseCode.startsWith("BIO")) baseColor = "bio";
    else if (courseCode.startsWith("CHEM")) baseColor = "chem";
    else if (courseCode.startsWith("PHYS")) baseColor = "phys";
    else if (courseCode.startsWith("PHIL")) baseColor = "phil";
    else if (courseCode.startsWith("UNIV")) baseColor = "univ";
    else if (courseCode.startsWith("ECON")) baseColor = "econ";
    
    return {
      baseColor,
      backgroundClass: `bg-course-${baseColor}`,
      foregroundClass: `text-course-${baseColor}-foreground`,
    };
  }
  
  const shortWeekDays = ["M", "T", "W", "Th", "F", "Sa", "Su"];


  return (
    <motion.div 
      className="animate-fade-in"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="p-4 mb-4 overflow-auto border border-gray-200 rounded-xl shadow-sm">
        <div className="min-w-[900px]">
          {/* Calendar Header with Weekdays */}
          <div className="grid grid-cols-[theme(spacing.16)_repeat(7,1fr)] sm:grid-cols-[theme(spacing.20)_repeat(7,1fr)] gap-1 mb-2"> {/* Responsive time column */}
            <div className="text-center font-medium p-1 sm:p-2 text-gray-500 text-xs sm:text-sm">Time</div> {/* Responsive padding and text size */}
            {weekDays.map((day, index) => (
              <motion.div 
                key={day} 
                className="text-center font-medium p-1 sm:p-2 bg-gray-100 rounded-md text-xs sm:text-sm" // Responsive padding and text size
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <span className="hidden sm:inline">{day}</span>
                <span className="sm:hidden">{shortWeekDays[index]}</span> {/* Show short day names on small screens */}
              </motion.div>
            ))}
          </div>
          
          {/* Calendar Body with Time Slots */}
          {timeSlots.map((timeSlot, index) => (
            <motion.div 
              key={timeSlot}
              className="grid grid-cols-[theme(spacing.16)_repeat(7,1fr)] sm:grid-cols-[theme(spacing.20)_repeat(7,1fr)] gap-1 mb-1" // Responsive time column
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.03 }}
            >
              {/* Time slot label */}
              <div className="text-center text-xs sm:text-sm font-medium flex items-center justify-center bg-gray-50 rounded-md text-gray-600"> {/* Responsive text size */}
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
                      "p-0.5 rounded-lg border min-h-[60px] sm:min-h-[70px] transition-all", // Responsive min-height
                      items.length > 0 ? "border-gray-300 shadow-sm" : "border-gray-100"
                    )}
                  >
                    {items.map((item: any, i: number) => {
                      if (item.type === 'course') {
                        const colorInfo = getCourseColorInfo(item.courseCode);
                        return (
                          <motion.div 
                            key={`${item.courseCode}-${i}`}
                            className={cn(
                              "p-0.5 sm:p-1 text-xs rounded-md bg-opacity-90 h-full relative", // Responsive padding
                              colorInfo.backgroundClass,
                              colorInfo.foregroundClass
                            )}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.3 }}
                          >
                            {item.isCourseLocked && (
                              <Lock 
                                className="absolute top-0.5 right-0.5 h-3 w-3 sm:h-3.5 sm:w-3.5 text-white" 
                                style={{ filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.7))' }} 
                              />
                            )}
                            <div className="font-semibold text-[11px] sm:text-xs">{item.courseCode}</div> {/* Responsive text */}
                            <div className="text-[9px] sm:text-[10px] truncate">{item.instructor}</div> {/* Responsive text */}
                            <div className="text-[9px] sm:text-[10px] truncate">{item.location}</div> {/* Responsive text */}
                          </motion.div>
                        );
                      } else if (item.type === 'busy') {
                        const busyType = item.busyTimeType as BusyTimeType; // Cast to BusyTimeType
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

export default ScheduleCalendarView;
