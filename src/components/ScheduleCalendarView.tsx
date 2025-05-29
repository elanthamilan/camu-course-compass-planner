
import { useSchedule } from "@/contexts/ScheduleContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { timeSlots, weekDays, busyTimeColors } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Lock, Unlock } from "lucide-react"; // Import Lock and Unlock icons
import { BusyTimeType } from "@/lib/types"; // Import BusyTimeType
import { toast } from "sonner";

const ScheduleCalendarView = () => {
  const { selectedSchedule, busyTimes, courses, selectSchedule } = useSchedule();

  if (!selectedSchedule) return null;

  // Function to toggle section lock status
  const toggleSectionLock = (sectionId: string) => {
    const section = selectedSchedule.sections.find(s => s.id === sectionId);
    if (!section) return;

    const courseCode = sectionId.split("-")[0].toUpperCase();
    const course = courses.find(c => c.code === courseCode || c.id === sectionId.split("-")[0]);

    // Create updated schedule with toggled lock status
    const updatedSchedule = {
      ...selectedSchedule,
      sections: selectedSchedule.sections.map(s =>
        s.id === sectionId
          ? { ...s, locked: !s.locked }
          : s
      )
    };

    // Update the schedule in context
    selectSchedule(updatedSchedule.id, updatedSchedule);

    if (section.locked) {
      toast.success(`${courseCode} section unlocked! It can now be changed by regeneration.`);
    } else {
      toast.success(`${courseCode} section locked! It will be preserved during regeneration.`);
    }
  };

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
            locked: section.locked // Pass locked status
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
      className="animate-fade-in w-full"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="p-3 sm:p-6 mb-4 border border-gray-200 rounded-xl shadow-sm w-full">
        <div className="w-full">
          {/* Calendar Header with Weekdays */}
          <div className="grid grid-cols-[140px_repeat(7,1fr)] gap-4 mb-6 w-full">
            <div className="text-center font-bold p-4 text-gray-700 bg-gradient-to-r from-gray-100 to-gray-200 rounded-lg shadow-sm text-base">
              ⏰ Time
            </div>
            {weekDays.map((day, index) => (
              <motion.div
                key={day}
                className="text-center font-bold p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg shadow-sm text-base border border-blue-200"
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <span className="hidden sm:inline text-gray-700">{day}</span>
                <span className="sm:hidden text-gray-700">{shortWeekDays[index]}</span>
              </motion.div>
            ))}
          </div>

          {/* Calendar Legend */}
          <motion.div
            className="flex flex-wrap items-center justify-between gap-2 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200 mb-3"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <div className="flex items-center space-x-4">
              <h4 className="font-bold text-gray-700">📋 Legend:</h4>
              <div className="flex items-center space-x-1">
                <div className="w-4 h-4 bg-blue-200 rounded border-l-2 border-blue-500 shadow-sm"></div>
                <span className="text-xs font-medium text-gray-700">📚 Courses</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-4 h-4 bg-gray-200 rounded border-l-2 border-dashed border-gray-500 opacity-80"></div>
                <span className="text-xs font-medium text-gray-700">📅 Busy Times</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-4 h-4 bg-amber-200 rounded border-l-2 border-amber-500 shadow-sm"></div>
                <span className="text-xs font-medium text-gray-700">🔒 Locked Courses</span>
              </div>
            </div>
            <div className="text-xs text-gray-600 bg-white/60 px-2 py-1 rounded">
              💡 Click lock icons to preserve courses during regeneration
            </div>
          </motion.div>

          {/* Calendar Body with Time Slots */}
          <div className="space-y-4">
            {timeSlots.map((timeSlot, index) => (
              <motion.div
                key={timeSlot}
                className="grid grid-cols-[140px_repeat(7,1fr)] gap-4 w-full"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.03 }}
              >
                {/* Time slot label */}
                <div className="text-center text-base font-bold flex items-center justify-center bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg text-gray-700 border border-gray-200 min-h-[120px] shadow-sm">
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
                        "p-4 rounded-lg border min-h-[120px] transition-all relative",
                        items.length > 0
                          ? "border-gray-300 shadow-sm bg-white"
                          : "border-gray-200 bg-gray-50/30 hover:bg-gray-50/50"
                      )}
                    >
                    {items.map((item: any, i: number) => {
                      if (item.type === 'course') {
                        const colorInfo = getCourseColorInfo(item.courseCode);
                        return (
                          <motion.div
                            key={`${item.courseCode}-${i}`}
                            className={cn(
                              "w-full h-full rounded-lg bg-opacity-95 group border-l-4 p-4 relative flex flex-col",
                              colorInfo.backgroundClass,
                              colorInfo.foregroundClass,
                              "shadow-md hover:shadow-lg transition-all duration-200"
                            )}
                            style={{
                              borderLeftColor: item.locked ? '#f59e0b' : 'transparent',
                            }}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.3 }}
                          >
                            {/* Lock/Unlock Button - More Visible */}
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className={cn(
                                    "absolute top-2 right-2 h-7 w-7 p-0 rounded-full transition-all duration-200 z-10",
                                    item.locked
                                      ? "bg-amber-500/90 hover:bg-amber-600 text-white shadow-md"
                                      : "bg-white/90 hover:bg-white text-gray-600 shadow-sm border border-gray-200"
                                  )}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleSectionLock(item.sectionId);
                                  }}
                                >
                                  {item.locked ? (
                                    <Lock className="h-3.5 w-3.5" />
                                  ) : (
                                    <Unlock className="h-3.5 w-3.5" />
                                  )}
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{item.locked ? "Unlock section (allows changes)" : "Lock section (preserve in regeneration)"}</p>
                              </TooltipContent>
                            </Tooltip>

                            {/* Course Content */}
                            <div className="pr-10 flex-1 flex flex-col justify-center">
                              {/* Course Title - Bold and Prominent */}
                              <div className="font-bold text-base leading-tight mb-2 text-center">
                                {item.courseCode}
                              </div>
                              <div className="text-sm opacity-90 mb-1 text-center truncate">
                                {item.instructor}
                              </div>
                              <div className="text-sm opacity-90 text-center truncate">
                                📍 {item.location}
                              </div>
                            </div>

                            {/* Locked Indicator Badge */}
                            {item.locked && (
                              <div className="absolute bottom-2 left-2">
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-amber-100 text-amber-800 font-medium">
                                  🔒 Locked
                                </span>
                              </div>
                            )}
                          </motion.div>
                        );
                      } else if (item.type === 'busy') {
                        const busyType = item.busyTimeType as BusyTimeType;
                        const busyTypeStyle = busyTimeColors[busyType] || busyTimeColors.other;

                        // Get appropriate icon for busy time type
                        const getBusyTimeIcon = (type: BusyTimeType) => {
                          switch (type) {
                            case 'work': return '💼';
                            case 'study': return '📚';
                            case 'personal': return '👤';
                            case 'event': return '🎉';
                            case 'meeting': return '🤝';
                            case 'class': return '🎓';
                            case 'reminder': return '⏰';
                            default: return '📅';
                          }
                        };

                        return (
                          <motion.div
                            key={`busy-${i}`}
                            className={cn(
                              "w-full h-full rounded-lg border-l-4 border-dashed p-4 relative flex flex-col",
                              busyTypeStyle.bg,
                              busyTypeStyle.text,
                              "shadow-md opacity-85 hover:opacity-100 transition-all duration-200"
                            )}
                            style={{
                              borderLeftColor: 'currentColor',
                              borderLeftStyle: 'dashed',
                            }}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.3 }}
                          >
                            {/* Busy Time Type Badge */}
                            <div className="absolute top-2 right-2">
                              <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-white/30 text-base shadow-sm">
                                {getBusyTimeIcon(busyType)}
                              </span>
                            </div>

                            {/* Busy Time Content */}
                            <div className="pr-10 flex-1 flex flex-col justify-center">
                              {/* Busy Time Title - Bold and Prominent */}
                              <div className="font-bold text-base leading-tight mb-2 text-center">
                                {item.title}
                              </div>

                              {/* Busy Time Type Label */}
                              <div className="text-sm opacity-90 capitalize text-center">
                                {busyType} time
                              </div>
                            </div>

                            {/* Busy Time Indicator Badge */}
                            <div className="absolute bottom-2 left-2">
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-white/40 font-medium">
                                📅 Busy
                              </span>
                            </div>
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
      </Card>
    </motion.div>
  );
};

export default ScheduleCalendarView;
