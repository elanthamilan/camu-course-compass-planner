import React, { useState } from "react";
import { Container, Row, Col, Card, Button, ProgressBar, Form, Accordion, ListGroup, Badge } from "react-bootstrap";
import { mockDegreeRequirements, mockMandatoryCourses } from "@/lib/mock-data";
import { PlusLg, Trash, CalendarWeek, ArrowRight, ChevronDown, ChevronUp } from "react-bootstrap-icons";
import CourseSearch from "./CourseSearch";
import ViewScheduleDialog from "./ViewScheduleDialog";
import { useNavigate } from "react-router-dom";
import AddSemesterDialog from "./AddSemesterDialog";

// Define types (assuming these are correct from previous steps)
interface CourseData {
  id: string;
  code: string;
  name: string;
  credits: number;
  days: string;
  time: string;
  prerequisites?: string[];
}

interface SemesterData {
  id: string;
  name: string;
  creditsSelected: number;
  courses: CourseData[];
}

interface YearData {
  year: string;
  // 'credits' and 'schedules' in YearData seem to be aggregates, can be calculated or kept if updated properly
  credits: number; // This might represent total possible credits or planned credits for the year
  schedules: number; // Number of generated/saved schedules for this year's plan
  semesters: SemesterData[];
}

const initialYearsData: YearData[] = [
  {
    year: "2024 - 2025",
    credits: 30, // Example: total credits planned this year
    schedules: 13,
    semesters: [
      {
        id: "Summer2024", name: "Summer 2024", creditsSelected: 9, courses: [
          { id: "cs101", code: "CS101", name: "Introduction to Computer Science", credits: 3, days: "MWF", time: "09:00", prerequisites: [] },
          { id: "math105", code: "MATH105", name: "Pre-Calculus", credits: 3, days: "MWF", time: "08:00", prerequisites: [] },
          { id: "eng234", code: "ENG234", name: "Composition II", credits: 3, days: "MW", time: "10:00", prerequisites: ["ENG100"] }
        ]
      },
      {
        id: "Fall2024", name: "Fall 2024", creditsSelected: 11, courses: [
          { id: "phys210", code: "PHYS210", name: "Physics I: Mechanics", credits: 4, days: "MWF", time: "13:00", prerequisites: [] },
          { id: "phil101", code: "PHIL101", name: "Introduction to Logic", credits: 3, days: "MWF", time: "11:00", prerequisites: [] },
          { id: "univ100", code: "UNIV100", name: "University Seminar", credits: 1, days: "W", time: "14:00", prerequisites: [] }
        ]
      },
      {
        id: "Spring2025", name: "Spring 2025", creditsSelected: 10, courses: [
          { id: "econ101", code: "ECON101", name: "Principles of Microeconomics", credits: 3, days: "MWF", time: "10:00", prerequisites: [] },
          { id: "bio101", code: "BIO101", name: "Introduction to Biology", credits: 4, days: "MWF", time: "09:00", prerequisites: [] },
          { id: "chem101", code: "CHEM101", name: "General Chemistry", credits: 4, days: "MWF", time: "13:00", prerequisites: [] }
        ]
      }
    ]
  },
  // ... other years if any
];


const CourseDashboard: React.FC = () => {
  const [showProgramDetails, setShowProgramDetails] = useState(false);
  const [showMandatoryCourses, setShowMandatoryCourses] = useState(false);
  const [isCourseSearchOpen, setIsCourseSearchOpen] = useState(false);
  const [selectedSemester, setSelectedSemester] = useState("");
  const [isViewScheduleOpen, setIsViewScheduleOpen] = useState(false);
  const [viewingSemester, setViewingSemester] = useState<SemesterData | null>(null);
  const [yearsData, setYearsData] = useState<YearData[]>(initialYearsData);
  const [isAddSemesterDialogOpen, setIsAddSemesterDialogOpen] = useState(false);
  
  const navigate = useNavigate();

  const handleOpenCourseSearch = (semesterId: string) => {
    setSelectedSemester(semesterId);
    setIsCourseSearchOpen(true);
  };
  
  const handleViewSchedule = (semester: SemesterData) => {
    setViewingSemester(semester);
    setIsViewScheduleOpen(true);
  };
  
  const handleOpenSchedulePage = (semesterId: string) => {
    navigate(`/schedule?semester=${semesterId}`);
  };

  const handleDeleteCourse = (semesterId: string, courseId: string) => {
    setYearsData(prevYearsData => prevYearsData.map(year => ({
      ...year,
      semesters: year.semesters.map(semester => {
        if (semester.id === semesterId) {
          const updatedCourses = semester.courses.filter(course => course.id !== courseId);
          return {
            ...semester,
            courses: updatedCourses,
            creditsSelected: updatedCourses.reduce((acc, curr) => acc + curr.credits, 0)
          };
        }
        return semester;
      })
    })));
  };

  const handleOpenAddSemesterDialog = () => {
    setIsAddSemesterDialogOpen(true);
  };

  const handleAddSemesterSubmit = (data: { year: string; semesterType: string }) => {
    const { year: dialogYearStr, semesterType } = data;
    const academicYearStr = `${dialogYearStr} - ${parseInt(dialogYearStr) + 1}`;
    const semesterName = `${semesterType} ${dialogYearStr}`;
    const semesterId = `${semesterType}${dialogYearStr}`;

    const newSemester: SemesterData = {
      id: semesterId, name: semesterName, creditsSelected: 0, courses: [],
    };

    setYearsData(prevYearsData => {
      const updatedYearsData = [...prevYearsData];
      const yearIndex = updatedYearsData.findIndex(y => y.year === academicYearStr);

      if (yearIndex > -1) {
        const yearToUpdate = updatedYearsData[yearIndex];
        const semesterExists = yearToUpdate.semesters.some(s => s.name.startsWith(semesterType));
        if (!semesterExists) {
          yearToUpdate.semesters.push(newSemester);
          const semesterOrder = ["Spring", "Summer", "Fall"]; // Spring < Summer < Fall
          yearToUpdate.semesters.sort((a, b) => {
            const typeA = a.name.split(" ")[0];
            const typeB = b.name.split(" ")[0];
            const yearNumA = parseInt(a.name.split(" ")[1]);
            const yearNumB = parseInt(b.name.split(" ")[1]);
            if (yearNumA !== yearNumB) return yearNumA - yearNumB;
            return semesterOrder.indexOf(typeA) - semesterOrder.indexOf(typeB);
          });
        } else {
          console.warn(`Semester ${semesterType} already exists for year ${academicYearStr}`);
        }
      } else {
        updatedYearsData.push({
          year: academicYearStr, credits: 0, schedules: 0, semesters: [newSemester],
        });
      }
      updatedYearsData.sort((a,b) => a.year.localeCompare(b.year));
      return updatedYearsData;
    });
    setIsAddSemesterDialogOpen(false);
  };

  // Helper to get status badge variant
  const getStatusVariant = (status: string) => {
    if (status === "Completed") return "success";
    if (status === "In Progress") return "primary";
    return "secondary";
  };

  return (
    <Container fluid className="py-3">
      <Row className="mb-4 g-3"> {/* g-3 for gap */}
        <Col md={6}>
          <Card className="shadow-sm">
            <Card.Header className="pb-2 d-flex justify-content-between align-items-center">
              <div>
                <div className="d-flex align-items-baseline">
                  <Card.Title as="h2" className="mb-0 me-2" style={{fontSize: '1.75rem', fontWeight: 'bold'}}>58</Card.Title>
                  <span className="text-muted small">62/120</span>
                </div>
                <p className="text-muted mb-0 mt-1">Program credits left</p>
              </div>
              <Button variant="outline-primary" size="sm" onClick={() => setShowProgramDetails(!showProgramDetails)}>
                {showProgramDetails ? "Hide details" : "View details"}
              </Button>
            </Card.Header>
            <ProgressBar now={62} max={120} style={{ height: "0.5rem", borderTopLeftRadius:0, borderTopRightRadius:0 }} />
            {showProgramDetails && (
              <Card.Body>
                <Card.Subtitle className="mb-3 fw-semibold">Program Credits Breakdown</Card.Subtitle>
                <ListGroup variant="flush">
                  {mockDegreeRequirements.map(req => (
                    <ListGroup.Item key={req.id} className="d-flex justify-content-between align-items-center px-0">
                      <span>{req.name}</span>
                      <span className="text-muted">
                        {Math.round(req.requiredCredits * req.progress)}/{req.requiredCredits} credits
                      </span>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              </Card.Body>
            )}
          </Card>
        </Col>
        <Col md={6}>
          <Card className="shadow-sm">
            <Card.Header className="pb-2 d-flex justify-content-between align-items-center">
              <div>
                <div className="d-flex align-items-baseline">
                  <Card.Title as="h2" className="mb-0 me-2" style={{fontSize: '1.75rem', fontWeight: 'bold'}}>7</Card.Title>
                  <span className="text-muted small">8/15</span>
                </div>
                 <p className="text-muted mb-0 mt-1">Mandatory courses left</p>
              </div>
              <Button variant="outline-primary" size="sm" onClick={() => setShowMandatoryCourses(!showMandatoryCourses)}>
                {showMandatoryCourses ? "Hide details" : "View details"}
              </Button>
            </Card.Header>
            <ProgressBar now={8} max={15} style={{ height: "0.5rem", borderTopLeftRadius:0, borderTopRightRadius:0 }} />
            {showMandatoryCourses && (
              <Card.Body>
                <Card.Subtitle className="mb-3 fw-semibold">Mandatory Courses</Card.Subtitle>
                <ListGroup variant="flush">
                  {mockMandatoryCourses.map(course => (
                    <ListGroup.Item key={course.code} className="d-flex justify-content-between align-items-center px-0">
                      <div>
                        <span className="fw-medium">{course.code}: </span>
                        <span>{course.name}</span>
                      </div>
                      <Badge pill bg={getStatusVariant(course.status)} text={getStatusVariant(course.status) === 'secondary' ? 'dark' : 'light'}>
                        {course.status}
                      </Badge>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              </Card.Body>
            )}
          </Card>
        </Col>
      </Row>
      
      <div className="mb-4"> {/* Using div for spacing between sections */}
        {yearsData.map((year) => (
          <div key={year.year} className="mb-4">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <h2 className="h4 fw-semibold">{year.year}</h2>
              <div className="small text-muted">
                {year.semesters.reduce((acc, sem) => acc + sem.creditsSelected, 0)} credits · {year.schedules} Schedules ✓
              </div>
            </div>
            
            <Row xs={1} md={2} lg={3} className="g-3"> {/* Responsive grid for semesters */}
              {year.semesters.map((semester) => (
                <Col key={semester.id}>
                  <Card className="shadow-sm h-100"> {/* h-100 for equal height cards in a row */}
                    <Card.Header className="pb-2">
                      <div className="d-flex justify-content-between align-items-center">
                        <Card.Title as="h5" className="fw-semibold mb-0">
                          {semester.name.replace(/\s\d{4}$/, "")}
                        </Card.Title>
                        <div>
                          <Button 
                            variant="outline-secondary" 
                            size="sm" 
                            className="rounded-circle p-0 me-1"
                            style={{ width: '2rem', height: '2rem' }}
                            onClick={() => handleOpenCourseSearch(semester.id)}
                          >
                            <PlusLg size={16} />
                          </Button>
                          <Button 
                            variant="outline-secondary" 
                            size="sm" 
                            className="rounded-circle p-0"
                            style={{ width: '2rem', height: '2rem' }}
                            onClick={() => handleViewSchedule(semester)}
                          >
                            <CalendarWeek size={16} />
                          </Button>
                        </div>
                      </div>
                      <div className="small text-muted mt-1">
                        {semester.creditsSelected}/18 credits selected ✓
                      </div>
                    </Card.Header>
                    
                    <Card.Body>
                      <Form.Select size="sm" className="mb-3">
                        <option>Case Western Reserve University</option>
                        <option>Cleveland State University</option>
                      </Form.Select>
                      
                      {semester.courses.map(course => (
                        <ListGroup.Item key={course.id} className="px-0 py-2 border-bottom d-flex justify-content-between align-items-start">
                          <div>
                            <div className="d-flex align-items-center">
                              <span className="fw-medium me-2">{course.code}</span>
                              <Badge bg="light" text="dark" className="me-2">{course.credits} cr</Badge>
                            </div>
                            <div className="small">{course.name}</div>
                            <div className="small text-muted">
                              {course.days} {course.time}
                            </div>
                            {course.prerequisites && course.prerequisites.length > 0 && (
                              <div className="mt-1 small text-warning"> {/* Using text-warning for prerequisites */}
                                <span className="fw-medium">Prerequisites: </span>
                                {course.prerequisites.join(', ')}
                              </div>
                            )}
                          </div>
                          <Button
                            variant="link"
                            size="sm"
                            className="p-0 text-danger" // Using text-danger for delete button
                            onClick={() => handleDeleteCourse(semester.id, course.id)}
                          >
                            <Trash size={16} />
                          </Button>
                        </ListGroup.Item>
                      ))}
                      {semester.courses.length === 0 && <p className="small text-muted text-center mt-2">No courses added yet.</p>}
                      
                      <div className="d-flex mt-3">
                        <Button
                          onClick={() => handleOpenCourseSearch(semester.id)}
                          variant="outline-primary"
                          size="sm"
                          className="flex-grow-1 me-1" // flex-grow-1 to take available space
                        >
                          <PlusLg size={14} className="me-1" /> Add courses
                        </Button>
                        
                        <Button
                          onClick={() => handleOpenSchedulePage(semester.id)}
                          variant="outline-info" // Using info for view schedule
                          size="sm"
                          className="ms-1"
                        >
                          View Schedule <ArrowRight size={14} className="ms-1" />
                        </Button>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
            
            <div className="d-flex justify-content-center mt-3">
              <Button 
                variant="outline-secondary" 
                onClick={handleOpenAddSemesterDialog}
                className="w-100" // Full width button, max-width can be set by parent if needed
                style={{ maxWidth: '400px', borderStyle: 'dashed' }}
              >
                <PlusLg size={16} className="me-2" /> Add Semester
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Dialogs remain the same, assuming they are either already migrated or will be */}
      <CourseSearch 
        open={isCourseSearchOpen} 
        onOpenChange={setIsCourseSearchOpen} // These props might need to change if dialogs are also migrated
        termId={selectedSemester}
      />
      
      {viewingSemester && (
        <ViewScheduleDialog 
          open={isViewScheduleOpen} // Prop might change to 'show'
          onOpenChange={setIsViewScheduleOpen} // Prop might change to 'onHide'
          semesterName={viewingSemester.name}
          courses={viewingSemester.courses}
        />
      )}

      <AddSemesterDialog
        show={isAddSemesterDialogOpen} // Prop already 'show' from previous migration
        onHide={() => setIsAddSemesterDialogOpen(false)} // Prop already 'onHide'
        onAddSemester={handleAddSemesterSubmit}
      />
    </Container>
  );
};

export default CourseDashboard;
