import { useSchedule } from "../../contexts/ScheduleContext";
import { Card } from "@/components/atoms/card";
import { Badge } from "@/components/atoms/badge";
import { timeSlots, weekDays, busyTimeColors } from "../../lib/mock-data";
import { cn } from "../../lib/utils";
import { motion } from "framer-motion";
import { Lock } from "lucide-react"; // Import Lock icon
import { BusyTimeType, CourseSection as CourseSectionType } from "../../lib/types"; // Import BusyTimeType and CourseSectionType
import { useIsMobile } from "../../hooks/use-mobile"; // Import useIsMobile
import { AlertTriangle, CalendarDays, Clock, MapPin, User, Briefcase, BookOpen, Heart, Users, GraduationCap, Bell, Bookmark } from "lucide-react"; // Icons for mobile view

interface ScheduleCalendarViewProps {
  lockedCourses?: string[];
}

const ScheduleCalendarView: React.FC<ScheduleCalendarViewProps> = ({ lockedCourses = [] }) => {
  const { selectedSchedule, busyTimes, courses: allPlannedCourses } = useSchedule(); // Added allPlannedCourses to get full course details
  const isMobile = useIsMobile();

  if (!selectedSchedule) {
    return (
      <div className="text-center py-12 px-4">
        <div className="max-w-md mx-auto">
          <span className="text-6xl mb-4 block">📅</span>
          <h3 className="text-lg font-medium text-gray-700 mb-2">No schedule selected</h3>
          <p className="text-gray-500">
            Generate a schedule to see your weekly calendar view.
          </p>
        </div>
      </div>
    );
  }

  // Process sections to map them to the calendar
  const scheduledSections = selectedSchedule.sections;

  // Create a map of day-time slots to course sections
  const calendarMap: Record<string, any> = {};

  scheduledSections.forEach(section => {
    section.schedule.forEach(schedule => {
      const days = schedule.days.split(",");
      days.forEach(day => {
        const startHour = parseInt(schedule.startTime.split(":")[0]);
        const startMinute = parseInt(schedule.startTime.split(":")[1]);
        const endHour = parseInt(schedule.endTime.split(":")[0]);
        const endMinute = parseInt(schedule.endTime.split(":")[1]);

        // Calculate the duration in hours, including partial hours
        const duration = (endHour + endMinute/60) - (startHour + startMinute/60);
        
        // Add the section to each hour slot it occupies
        for (let i = 0; i < duration; i++) {
          const currentHour = Math.floor(startHour + i);
          const timeKey = `${currentHour}`;
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
            isCourseLocked: lockedCourses.includes(section.id.split("-")[0]) || lockedCourses.includes(courseCode),
            startTime: schedule.startTime,
            endTime: schedule.endTime,
            days: schedule.days
          });
        }
      });
    });
  });

  // Add busy times to the calendar map with improved time handling
  busyTimes.forEach(busyTime => {
    busyTime.days.forEach(day => {
      const startHour = parseInt(busyTime.startTime.split(":")[0]);
      const startMinute = parseInt(busyTime.startTime.split(":")[1]);
      const endHour = parseInt(busyTime.endTime.split(":")[0]);
      const endMinute = parseInt(busyTime.endTime.split(":")[1]);

      // Calculate the duration in hours, including partial hours
      const duration = (endHour + endMinute/60) - (startHour + startMinute/60);
      
      // Add the busy time to each hour slot it occupies
      for (let i = 0; i < duration; i++) {
        const currentHour = Math.floor(startHour + i);
        const timeKey = `${currentHour}`;
        const key = `${day}-${timeKey}`;

        if (!calendarMap[key]) {
          calendarMap[key] = [];
        }

        calendarMap[key].push({
          type: 'busy',
          title: busyTime.title,
          busyTimeType: busyTime.type,
          startTime: busyTime.startTime,
          endTime: busyTime.endTime,
          days: busyTime.days
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

  // Mobile Calendar View
  if (isMobile) {
    return (
      <div className="h-full flex flex-col bg-white">
        <div className="flex-1 overflow-auto">
          <div className="min-w-[800px] p-2">
            {/* Mobile Calendar Header with Weekdays */}
            <div className="grid grid-cols-[60px_repeat(7,1fr)] gap-1 mb-2 sticky top-0 bg-white z-10 border-b pb-2">
              <div className="text-center font-medium p-2 text-gray-500 text-xs flex items-center justify-center">
                Time
              </div>
              {weekDays.map((day, index) => (
                <motion.div
                  key={day}
                  className="text-center font-medium p-2 bg-gray-50 rounded-md text-xs text-gray-800 border"
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  {day.substring(0, 3)}
                </motion.div>
              ))}
            </div>

            {/* Mobile Calendar Body with Time Slots */}
            {timeSlots.map((timeSlot, index) => (
              <motion.div
                key={timeSlot}
                className="grid grid-cols-[60px_repeat(7,1fr)] gap-1 mb-1"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.03 }}
              >
                {/* Time slot label */}
                <div className="text-center text-xs font-medium flex items-center justify-center bg-gray-50 rounded-md text-gray-600 border min-h-[60px]">
                  {timeSlot}
                </div>

                {/* Days of the week */}
                {weekDays.map((day, dayIndex) => {
                  const hour = index + 7; // 7 AM is the first slot
                  const mapKey = `${shortWeekDays[dayIndex]}-${hour}`;
                  const items = calendarMap[mapKey] || [];

                  return (
                    <div
                      key={`${day}-${hour}`}
                      className="relative border border-gray-100 rounded-md min-h-[60px] bg-white hover:bg-gray-50 transition-colors"
                    >
                      {items.map((item: any, i: number) => {
                        if (item.type === 'course') {
                          const colorInfo = getCourseColorInfo(item.courseCode);
                          return (
                            <motion.div
                              key={`${item.courseCode}-${i}`}
                              className={cn(
                                "absolute inset-0.5 p-1 text-xs rounded-sm shadow-sm border overflow-hidden",
                                colorInfo.backgroundClass,
                                colorInfo.foregroundClass
                              )}
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ duration: 0.3 }}
                              title={`${item.courseCode} with ${item.instructor} in ${item.location}`}
                            >
                              {item.isCourseLocked && (
                                <div className="absolute top-0.5 right-0.5 bg-blue-600 rounded-full p-0.5 shadow-lg">
                                  <Lock
                                    className="h-2 w-2 text-white fill-current"
                                    style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.8))' }}
                                  />
                                </div>
                              )}
                              <div className="font-semibold text-xs leading-tight">{item.courseCode}</div>
                              <div className="text-[10px] truncate leading-tight">{item.instructor}</div>
                            </motion.div>
                          );
                        } else if (item.type === 'busy') {
                          const busyType = item.busyTimeType as BusyTimeType;
                          const busyTypeStyle = busyTimeColors[busyType] || busyTimeColors.other;

                          return (
                            <motion.div
                              key={`busy-${i}`}
                              className={cn(
                                "absolute inset-0.5 p-1 text-xs rounded-sm border shadow-sm overflow-hidden flex items-center space-x-1",
                                busyTypeStyle.bg,
                                busyTypeStyle.text
                              )}
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ duration: 0.3 }}
                              title={`Busy time: ${item.title}`}
                            >
                              <span className="text-xs">🚫</span>
                              <span className="truncate flex-1 font-medium text-xs leading-tight">{item.title}</span>
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
        </div>
      </div>
    );
  }

  // Desktop view (existing calendar code)
  return (
    <div className="h-full flex flex-col bg-white">
      <div className="flex-1 overflow-auto">
        <div className="min-w-[1200px] p-4">
          {/* Calendar Header with Weekdays */}
          <div className="grid grid-cols-[100px_repeat(7,1fr)] gap-2 mb-4">
            <div className="text-center font-medium p-3 text-gray-500 text-sm flex items-center justify-center">
              Time
            </div>
            {weekDays.map((day, index) => (
              <motion.div
                key={day}
                className="text-center font-medium p-3 bg-gray-50 rounded-lg text-sm text-gray-800 border"
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                {day}
              </motion.div>
            ))}
          </div>

          {/* Calendar Body with Time Slots */}
          {timeSlots.map((timeSlot, index) => (
            <motion.div
              key={timeSlot}
              className="grid grid-cols-[100px_repeat(7,1fr)] gap-2 mb-2"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.03 }}
            >
              {/* Time slot label */}
              <div className="text-center text-sm font-medium flex items-center justify-center bg-gray-50 rounded-lg text-gray-600 border min-h-[80px]">
                {timeSlot}
              </div>

              {/* Days of the week */}
              {weekDays.map((day, dayIndex) => {
                const hour = index + 7; // 7 AM is the first slot
                // Use the shortWeekDays for consistent key generation for map lookup
                const mapKey = `${shortWeekDays[dayIndex]}-${hour}`;
                const items = calendarMap[mapKey] || [];

                return (
                  <div
                    key={`${shortWeekDays[dayIndex]}-${timeSlot}`}
                    className={cn(
                      "p-2 rounded-lg border min-h-[80px] transition-all relative overflow-hidden",
                      items.length > 0 ? "border-gray-300 bg-gray-50" : "border-gray-200 hover:bg-gray-50"
                    )}
                  >
                    {items.map((item: any, i: number) => {
                      if (item.type === 'course') {
                        const colorInfo = getCourseColorInfo(item.courseCode);
                        return (
                          <motion.div
                            key={`${item.courseCode}-${i}`}
                            className={cn(
                              "absolute inset-1 p-2 text-xs rounded-md shadow-sm border overflow-hidden",
                              colorInfo.backgroundClass,
                              colorInfo.foregroundClass
                            )}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.3 }}
                            title={`${item.courseCode} with ${item.instructor} in ${item.location}`}
                          >
                            {item.isCourseLocked && (
                              <div className="absolute top-1 right-1 bg-blue-600 rounded-full p-1 shadow-lg">
                                <Lock
                                  className="h-4 w-4 text-white fill-current"
                                  style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.8))' }}
                                />
                              </div>
                            )}
                            <div className="space-y-0.5">
                              <div className="font-semibold text-sm truncate">{item.courseCode}</div>
                              <div className="text-xs opacity-90 truncate">{item.instructor}</div>
                              <div className="text-xs opacity-80 truncate">{item.location}</div>
                            </div>
                          </motion.div>
                        );
                      } else if (item.type === 'busy') {
                        const busyType = item.busyTimeType as BusyTimeType;
                        const busyTypeStyle = busyTimeColors[busyType] || busyTimeColors.other;

                        return (
                          <motion.div
                            key={`busy-${i}`}
                            className={cn(
                              "absolute inset-1 p-2 text-xs rounded-md border shadow-sm overflow-hidden flex items-center space-x-1",
                              busyTypeStyle.bg,
                              busyTypeStyle.text
                            )}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.3 }}
                            title={`Busy time: ${item.title}`}
                          >
                            <span className="text-sm">🚫</span>
                            <span className="truncate flex-1 font-medium">{item.title}</span>
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
      </div>
    </div>
  );
};

export default ScheduleCalendarView;
