
import { useSchedule } from "@/contexts/ScheduleContext";
import { Card } from "@/components/ui/card";
import { timeSlots, weekDays, busyTimeColors } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Lock } from "lucide-react"; // Import Lock icon
import { BusyTimeType, CourseSection as CourseSectionType } from "@/lib/types"; // Import BusyTimeType and CourseSectionType
import { useIsMobile } from "@/hooks/use-mobile"; // Import useIsMobile
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

  // Placeholder for Mobile View
  if (isMobile) {
    // Combine and sort all events (courses and busy times)
    const events: Array<{ day: string; startTime: string; endTime: string; type: 'course' | 'busy'; data: any }> = [];
    selectedSchedule.sections.forEach(section => {
      const courseInfo = allPlannedCourses.find(c => c.id === section.courseId);
      section.schedule.forEach(sch => {
        sch.days.split(',').forEach(day => {
          events.push({
            day,
            startTime: sch.startTime,
            endTime: sch.endTime,
            type: 'course',
            data: { ...section, courseCode: courseInfo?.code || section.courseId, courseName: courseInfo?.name || 'Unknown Course' }
          });
        });
      });
    });
    busyTimes.forEach(bt => {
      bt.days.forEach(day => {
        events.push({ day, startTime: bt.startTime, endTime: bt.endTime, type: 'busy', data: bt });
      });
    });

    // Sort events: by day index, then by start time
    const dayOrder = ["M", "T", "W", "Th", "F", "Sa", "Su"];
    events.sort((a, b) => {
      const dayIndexA = dayOrder.indexOf(a.day);
      const dayIndexB = dayOrder.indexOf(b.day);
      if (dayIndexA !== dayIndexB) {
        return dayIndexA - dayIndexB;
      }
      return a.startTime.localeCompare(b.startTime);
    });

    const busyTypeIcons: Record<string, JSX.Element> = {
      work: <Briefcase className="h-4 w-4" />, study: <BookOpen className="h-4 w-4" />,
      personal: <Heart className="h-4 w-4" />, event: <CalendarDays className="h-4 w-4" />,
      meeting: <Users className="h-4 w-4" />, class: <GraduationCap className="h-4 w-4" />, // Though 'class' type busy time is less common if courses are separate
      reminder: <Bell className="h-4 w-4" />, other: <Bookmark className="h-4 w-4" />
    };

    return (
      <div className="p-4 space-y-4 bg-gray-50 min-h-full">
        <Card className="p-3 bg-blue-50 border-blue-200">
          <p className="text-sm text-blue-700">
            <CalendarDays className="inline h-4 w-4 mr-2" />
            Mobile view: Displaying schedule as a list. For a full calendar grid, please use a larger screen.
          </p>
        </Card>

        {selectedSchedule.conflicts && selectedSchedule.conflicts.length > 0 && (
          <Card className="p-3 bg-red-50 border-red-300">
            <h4 className="text-sm font-semibold text-red-700 mb-1 flex items-center">
              <AlertTriangle className="h-4 w-4 mr-2 text-red-600" />
              Schedule Conflicts Detected!
            </h4>
            <ul className="list-disc pl-5 text-xs text-red-600 space-y-0.5">
              {selectedSchedule.conflicts.map((conflict, index) => (
                <li key={index}>{`${conflict.type}: ${conflict.message}`}</li>
              ))}
            </ul>
          </Card>
        )}

        {events.length === 0 && (
          <Card className="p-6 text-center text-gray-500">
            <CalendarDays className="mx-auto h-12 w-12 text-gray-400 mb-2" />
            No events scheduled for this period.
          </Card>
        )}

        {events.map((event, index) => (
          <Card key={index} className="p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start space-x-3">
              <div className={`p-2 rounded-full mt-1 ${event.type === 'course' ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-600'}`}>
                {event.type === 'course' ? <GraduationCap className="h-5 w-5" /> : busyTypeIcons[event.data.type] || <Bookmark className="h-5 w-5" />}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-center mb-1">
                  <h4 className="font-semibold text-sm">
                    {event.type === 'course' ? `${event.data.courseCode} - ${event.data.courseName}` : event.data.title}
                  </h4>
                  <Badge variant={event.type === 'course' ? "default" : "secondary"} className="text-xs capitalize">
                    {event.type === 'course' ? event.data.sectionNumber : event.data.type}
                  </Badge>
                </div>
                <div className="text-xs text-gray-600 space-y-1">
                  <p className="flex items-center"><CalendarDays className="h-3 w-3 mr-1.5 text-gray-500" /> {event.day}</p>
                  <p className="flex items-center"><Clock className="h-3 w-3 mr-1.5 text-gray-500" /> {event.startTime} - {event.endTime}</p>
                  {event.type === 'course' && (
                    <>
                      <p className="flex items-center"><User className="h-3 w-3 mr-1.5 text-gray-500" /> {event.data.instructors?.join(', ') || 'TBA'}</p>
                      <p className="flex items-center"><MapPin className="h-3 w-3 mr-1.5 text-gray-500" /> {event.data.schedule.find((s:any)=>s.days.includes(event.day))?.location || event.data.location || 'TBA'}</p>
                      {lockedCourses.includes(event.data.courseId) && (
                        <p className="flex items-center text-blue-600 font-medium"><Lock className="h-3 w-3 mr-1.5" /> Locked</p>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </Card>
        ))}
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
