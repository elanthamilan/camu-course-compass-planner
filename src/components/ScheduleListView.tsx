import { useSchedule } from "@/contexts/ScheduleContext";
import { Card } from "@/components/atoms/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/atoms/table";
import { cn } from "@/lib/utils";
import { Lock } from "lucide-react"; // Import Lock icon
import { CourseSection, Course, SectionSchedule } from "@/lib/types"; // Import CourseSection, Course, and SectionSchedule

const ScheduleListView = () => {
  const { selectedSchedule, courses } = useSchedule();

  if (!selectedSchedule) return null;

  function getCourseColorInfo(courseCode: string): { backgroundClass: string; foregroundClass: string } {
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
      backgroundClass: `bg-course-${baseColor}`,
      foregroundClass: `text-course-${baseColor}-foreground`,
    };
  }

  return (
    <Card className="p-2 sm:p-4 mb-4 overflow-hidden animate-fade-in"> {/* Responsive padding for card */}
      <div className="overflow-x-auto"> {/* Wrapper for horizontal scrolling */}
        <Table className="min-w-full sm:w-full"> {/* Ensure table takes at least full width or its own content width */}
          <TableHeader>
            <TableRow><TableHead className="w-[120px] p-2 sm:p-4">Course Code</TableHead><TableHead className="p-2 sm:p-4">Course Name</TableHead><TableHead className="w-[80px] p-2 sm:p-4">Class #</TableHead><TableHead className="w-[80px] p-2 sm:p-4">Credits</TableHead><TableHead className="w-[100px] p-2 sm:p-4">Section</TableHead><TableHead className="p-2 sm:p-4">Instructor</TableHead><TableHead className="p-2 sm:p-4">Schedule</TableHead><TableHead className="p-2 sm:p-4">Location</TableHead></TableRow>
          </TableHeader>
          <TableBody>
            {selectedSchedule.sections.map((section: CourseSection) => {
              const courseCode = section.id.split("-")[0].toUpperCase();
              const courseDetails = courses.find((c: Course) => c.id === section.id.split("-")[0] || c.code === section.id.split("-")[0]);
              const colorInfo = getCourseColorInfo(courseCode);
              return (
                <TableRow key={section.id} className="hover:bg-muted/50 transition-colors text-xs sm:text-sm">
                  <TableCell className="p-2 sm:p-4 font-medium">
                    <span className={cn("py-1 px-2 rounded text-xs sm:text-sm font-medium flex items-center w-fit", colorInfo.backgroundClass, colorInfo.foregroundClass)}>
                      {section.locked && <Lock className="h-3 w-3 mr-1.5 flex-shrink-0" />}
                      {courseCode}
                    </span>
                  </TableCell>
                  <TableCell className="p-2 sm:p-4">{courseDetails?.name || "Unknown Course"}</TableCell>
                  <TableCell className="p-2 sm:p-4">{section.crn}</TableCell>
                  <TableCell className="p-2 sm:p-4">{courseDetails?.credits ?? "N/A"}</TableCell>
                  <TableCell className="p-2 sm:p-4">{section.sectionNumber}</TableCell>
                  <TableCell className="p-2 sm:p-4">{section.instructor}</TableCell>
                  <TableCell className="p-2 sm:p-4">
                    {section.schedule.map((sch: SectionSchedule, i: number) => (
                      <div key={i} className="mb-1 last:mb-0">
                        <div className="text-xs sm:text-sm">{sch.days}</div>
                        <div className="text-[10px] sm:text-xs text-muted-foreground">{sch.startTime} - {sch.endTime}</div>
                      </div>
                    ))}
                  </TableCell>
                  <TableCell className="p-2 sm:p-4">{section.location}</TableCell>
                </TableRow>
              );
            })}
            {selectedSchedule.busyTimes.map((busyTime) => (
              <TableRow key={busyTime.id} className="bg-muted/30 hover:bg-muted/50 text-xs sm:text-sm">
                <TableCell className="p-2 sm:p-4" colSpan={2}><span className="font-medium text-foreground">{busyTime.title} (Busy)</span></TableCell>
                <TableCell className="p-2 sm:p-4 text-muted-foreground">-</TableCell>
                <TableCell className="p-2 sm:p-4 text-muted-foreground">-</TableCell>
                <TableCell className="p-2 sm:p-4 text-muted-foreground">-</TableCell>
                <TableCell className="p-2 sm:p-4 text-muted-foreground">-</TableCell>
                <TableCell className="p-2 sm:p-4">
                  <div className="text-xs sm:text-sm">{busyTime.days.join(", ")}</div>
                  <div className="text-[10px] sm:text-xs text-muted-foreground">{busyTime.startTime} - {busyTime.endTime}</div>
                </TableCell>
                <TableCell className="p-2 sm:p-4 text-muted-foreground">-</TableCell>
              </TableRow>
            ))}
            <TableRow className="bg-muted font-semibold text-xs sm:text-sm">
              <TableCell className="p-2 sm:p-4 text-right" colSpan={3}>Total Credits:</TableCell>
              <TableCell className="p-2 sm:p-4">{selectedSchedule.totalCredits}</TableCell>
              <TableCell className="p-2 sm:p-4" colSpan={4}></TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </Card>
  );
};

export default ScheduleListView;
