
import React from "react";
import { useSchedule } from "@/contexts/ScheduleContext";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

const ScheduleListView = () => {
  const { selectedSchedule } = useSchedule();

  if (!selectedSchedule) return null;

  function getCourseColor(courseCode: string) {
    if (courseCode.startsWith("CS")) return "bg-course-cs";
    if (courseCode.startsWith("MATH")) return "bg-course-math text-white";
    if (courseCode.startsWith("ENG")) return "bg-course-eng text-white";
    if (courseCode.startsWith("BIO")) return "bg-course-bio text-white";
    if (courseCode.startsWith("CHEM")) return "bg-course-chem text-white";
    if (courseCode.startsWith("PHYS")) return "bg-course-phys";
    if (courseCode.startsWith("PHIL")) return "bg-course-phil text-white";
    if (courseCode.startsWith("UNIV")) return "bg-course-univ text-white";
    if (courseCode.startsWith("ECON")) return "bg-course-econ text-white";
    return "";
  }

  return (
    <Card className="p-4 mb-4 overflow-hidden animate-fade-in">
      <Table className="w-full">
        <TableHeader>
          <TableRow>
            <TableHead className="w-[120px]">Course Code</TableHead>
            <TableHead>Course Name</TableHead>
            <TableHead className="w-[80px]">Class #</TableHead>
            <TableHead className="w-[80px]">Credits</TableHead>
            <TableHead className="w-[100px]">Section</TableHead>
            <TableHead>Instructor</TableHead>
            <TableHead>Schedule</TableHead>
            <TableHead>Location</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {selectedSchedule.sections.map((section) => {
            const courseCode = section.id.split("-")[0].toUpperCase();
            const course = courseCode === "CS101" ? "Introduction to Computer Science" : 
                            courseCode === "MATH105" ? "Pre-Calculus" :
                            courseCode === "ENG234" ? "Composition II" :
                            courseCode === "PHYS210" ? "Physics I: Mechanics" :
                            courseCode === "PHIL101" ? "Introduction to Logic" :
                            courseCode === "BIO101" ? "Introduction to Biology" :
                            courseCode === "CHEM101" ? "General Chemistry" :
                            courseCode === "UNIV100" ? "University Seminar" :
                            courseCode === "ECON101" ? "Principles of Microeconomics" :
                            "Unknown Course";
            
            const credits = courseCode === "UNIV100" ? "1" : 
                            courseCode === "PHYS210" || courseCode === "BIO101" || courseCode === "CHEM101" ? "4" : "3";
            
            return (
              <TableRow key={section.id} className="hover:bg-gray-50 transition-colors">
                <TableCell>
                  <span className={cn(
                    "py-1 px-2 rounded text-sm font-medium",
                    getCourseColor(courseCode)
                  )}>
                    {courseCode}
                  </span>
                </TableCell>
                <TableCell>{course}</TableCell>
                <TableCell>{section.crn}</TableCell>
                <TableCell>{credits}</TableCell>
                <TableCell>{section.sectionNumber}</TableCell>
                <TableCell>{section.instructor}</TableCell>
                <TableCell>
                  {section.schedule.map((sch, i) => (
                    <div key={i} className="mb-1 last:mb-0">
                      <div className="text-sm">{sch.days}</div>
                      <div className="text-xs text-gray-600">{sch.startTime} - {sch.endTime}</div>
                    </div>
                  ))}
                </TableCell>
                <TableCell>{section.location}</TableCell>
              </TableRow>
            );
          })}
          {/* Display busy times */}
          {selectedSchedule.busyTimes.map((busyTime) => (
            <TableRow key={busyTime.id} className="bg-gray-50/50">
              <TableCell colSpan={2}>
                <span className="font-medium text-gray-700">{busyTime.title}</span>
              </TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>
                <div className="text-sm">{busyTime.days.join(", ")}</div>
                <div className="text-xs text-gray-600">{busyTime.startTime} - {busyTime.endTime}</div>
              </TableCell>
              <TableCell>-</TableCell>
            </TableRow>
          ))}
          <TableRow className="bg-gray-100 font-medium">
            <TableCell colSpan={3} className="text-right">Total Credits:</TableCell>
            <TableCell>{selectedSchedule.totalCredits}</TableCell>
            <TableCell colSpan={4}></TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </Card>
  );
};

export default ScheduleListView;
