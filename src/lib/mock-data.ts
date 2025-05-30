import {
  Course,
  BusyTime,
  Schedule,
  Term,
  StudentInfo,
  Degree,
  DegreeRequirement,
  DegreeAuditResults,
  MultiYearPlan,
  ExportedSchedule,
  PlannedCourse,
  DegreeRequirementAudit,
  AcademicProgram
} from "./types";

export const mockCourses: Course[] = [
  {
    id: "cs101",
    code: "CS101",
    name: "Introduction to Computer Science",
    credits: 3,
    department: "Computer Science",
    color: "#FFA726",
    attributes: ["Technical", "Introductory"],
    keywords: ["programming", "introduction", "cs"],
    college: "College of Engineering",
    campus: "North Campus",
    courseCareer: "Undergraduate",
    sections: [
      {
        id: "cs101-001",
        sectionType: "Lab",
        crn: "12345",
        instructor: "Dr. John Smith",
        sectionNumber: "001",
        schedule: [
          { days: "M,W,F", startTime: "09:00", endTime: "10:00", location: "Science Building 101" }
        ],
        location: "North Campus",
        maxSeats: 30,
        availableSeats: 5,
        locked: true,
        term: "Fall 2024",
        campus: "North Campus",
        courseCareer: "Undergraduate",
        classStatus: "Open",
        instructionMode: "In-Person",
        academicSession: "Full Term",
        classStartDate: "2024-08-26",
        notes: "Lab component required"
      },
      {
        id: "cs101-002",
        crn: "12346",
        instructor: "Prof. Jane Doe",
        sectionNumber: "002",
        schedule: [
          { days: "T,Th", startTime: "13:00", endTime: "14:30", location: "Science Building 102" }
        ],
        location: "North Campus",
        maxSeats: 30,
        availableSeats: 8,
        term: "Fall 2024",
        campus: "North Campus",
        courseCareer: "Undergraduate",
        classStatus: "Open",
        instructionMode: "In-Person",
        academicSession: "Full Term",
        classStartDate: "2024-08-26"
      }
    ]
  },
  {
    id: "math105",
    code: "MATH105",
    name: "Pre-Calculus",
    credits: 3,
    department: "Mathematics",
    color: "#EF5350",
    attributes: ["Quantitative Reasoning", "Introductory"],
    keywords: ["math", "algebra", "calculus-prep"],
    days: ["M", "W", "F"],
    college: "College of Arts and Sciences",
    campus: "Main Campus",
    locationKeywords: ["Math Building"],
    sections: [
      {
        id: "math105-001",
        sectionType: "Standard",
        crn: "23451",
        instructor: "Dr. Robert Johnson",
        sectionNumber: "001",
        schedule: [
          { days: "M,W,F", startTime: "08:00", endTime: "09:00", location: "Math Building 201" }
        ],
        location: "Main Campus",
        maxSeats: 35,
        availableSeats: 12
      },
      {
        id: "math105-002",
        crn: "23452",
        instructor: "Dr. Mary Williams",
        sectionNumber: "002",
        schedule: [
          { days: "T,Th", startTime: "11:00", endTime: "12:30", location: "Math Building 202" }
        ],
        location: "Main Campus",
        maxSeats: 35,
        availableSeats: 3,
        locked: true
      }
    ]
  },
  {
    id: "eng101", // Ensured ENG101 exists for ENG234 prerequisite
    code: "ENG101",
    name: "Composition I",
    credits: 3,
    department: "English",
    color: "#42A5FF", // Different color from ENG234
    attributes: ["Humanities", "Writing Intensive", "Introductory"],
    keywords: ["english", "writing", "composition", "foundational"],
    days: ["M", "W", "F"],
    college: "College of Liberal Arts",
    campus: "East Campus",
    locationKeywords: ["Liberal Arts"],
    sections: [
      {
        id: "eng101-001",
        sectionType: "Standard",
        crn: "34501",
        instructor: "Prof. David Copperfield",
        sectionNumber: "001",
        schedule: [ { days: "M,W,F", startTime: "09:00", endTime: "10:00", location: "Liberal Arts 101" } ],
        location: "East Campus", maxSeats: 25, availableSeats: 10
      }
    ]
  },
  {
    id: "eng234",
    code: "ENG234",
    name: "Composition II",
    credits: 3,
    prerequisites: ["ENG101"], // Corrected to use code
    department: "English",
    color: "#42A5F5",
    attributes: ["Humanities", "Writing Intensive"],
    keywords: ["english", "writing", "composition"],
    days: ["M", "W", "T", "Th"],
    college: "College of Liberal Arts",
    campus: "East Campus",
    locationKeywords: ["Liberal Arts"],
    sections: [
      {
        id: "eng234-001",
        sectionType: "Standard",
        crn: "34551",
        instructor: "Prof. Mark Antony",
        sectionNumber: "001",
        schedule: [ { days: "M,W", startTime: "10:00", endTime: "11:30", location: "Liberal Arts 301" } ],
        location: "East Campus", maxSeats: 25, availableSeats: 6
      },
      {
        id: "eng234-002",
        crn: "34552",
        instructor: "Prof. Julia Caesar",
        sectionNumber: "002",
        schedule: [ { days: "T,Th", startTime: "14:00", endTime: "15:30", location: "Liberal Arts 302" } ],
        location: "East Campus", maxSeats: 25, availableSeats: 4, sectionType: "Honors"
      }
    ]
  },
  {
    id: "phys210",
    code: "PHYS210",
    name: "Physics I: Mechanics",
    credits: 4,
    corequisites: ["math201"], // Assuming math201 exists or will be added
    department: "Physics",
    color: "#26C6DA",
    attributes: ["Natural Science", "Lab Science", "Quantitative Reasoning"],
    keywords: ["physics", "mechanics", "science"],
    days: ["M", "W", "F", "T"],
    college: "College of Engineering",
    campus: "North Campus",
    locationKeywords: ["Science Building", "Science Lab"],
    sections: [
      {
        id: "phys210-001",
        sectionType: "Lab",
        crn: "45151",
        instructor: "Dr. Albert Newton",
        sectionNumber: "001",
        schedule: [
          { days: "M,W,F", startTime: "13:00", endTime: "14:00", location: "Science Building 301" },
          { days: "T", startTime: "13:00", endTime: "16:00", location: "Science Lab 101" }
        ],
        location: "North Campus", maxSeats: 24, availableSeats: 2
      }
    ]
  },
  { // Minimal entry for math201, a corequisite for PHYS210
    id: "math201", code: "MATH201", name: "Calculus I", credits: 4, department: "Mathematics", sections: []
  },
  {
    id: "phil101",
    code: "PHIL101",
    name: "Introduction to Logic",
    credits: 3,
    department: "Philosophy",
    color: "#EC407A",
    attributes: ["Humanities", "Critical Thinking"],
    keywords: ["philosophy", "logic", "reasoning"],
    days: ["M", "W", "F"],
    college: "College of Liberal Arts", campus: "Main Campus", locationKeywords: ["Humanities"],
    sections: [
      {
        id: "phil101-001", sectionType: "Standard", crn: "51231", instructor: "Dr. Sophie Wisdom", sectionNumber: "001",
        schedule: [ { days: "M,W,F", startTime: "11:00", endTime: "12:00", location: "Humanities 101" } ],
        location: "Main Campus", maxSeats: 40, availableSeats: 18
      }
    ]
  },
  {
    id: "bio101", code: "BIO101", name: "Introduction to Biology", credits: 4, department: "Biology", color: "#66BB6A",
    attributes: ["Natural Science", "Lab Science"], days: ["M", "W", "F"], college: "College of Arts and Sciences", campus: "North Campus", locationKeywords: ["Science Building", "Biology Lab"],
    sections: [
      {
        id: "bio101-001", sectionType: "Lab", crn: "61425", instructor: "Dr. Gene Splicing", sectionNumber: "001",
        schedule: [ { days: "M,W,F", startTime: "09:00", endTime: "10:00", location: "Science Building 201" }, { days: "W", startTime: "14:00", endTime: "17:00", location: "Biology Lab 101" } ],
        location: "North Campus", maxSeats: 24, availableSeats: 0, waitlistCount: 5
      }
    ]
  },
  {
    id: "chem101", code: "CHEM101", name: "General Chemistry", credits: 4, department: "Chemistry", color: "#AB47BC",
    attributes: ["Natural Science", "Lab Science"], days: ["M", "W", "F", "Th"], college: "College of Arts and Sciences", campus: "North Campus", locationKeywords: ["Science Building", "Chemistry Lab"],
    sections: [
      {
        id: "chem101-001", sectionType: "Lab", crn: "71523", instructor: "Dr. Molecule", sectionNumber: "001",
        schedule: [ { days: "M,W,F", startTime: "13:00", endTime: "14:00", location: "Science Building 401" }, { days: "Th", startTime: "13:00", endTime: "16:00", location: "Chemistry Lab 101" } ],
        location: "North Campus", maxSeats: 24, availableSeats: 7
      }
    ]
  },
  {
    id: "univ100", code: "UNIV100", name: "University Seminar", credits: 1, department: "University", color: "#7E57C2",
    attributes: ["Introductory", "University Requirement"], days: ["W"], college: "University College", campus: "Main Campus", locationKeywords: ["Student Center"],
    sections: [
      {
        id: "univ100-001", sectionType: "Standard", crn: "81625", instructor: "Dr. Campus Guide", sectionNumber: "001",
        schedule: [ { days: "W", startTime: "14:00", endTime: "15:00", location: "Student Center 101" } ],
        location: "Main Campus", maxSeats: 30, availableSeats: 11
      }
    ]
  },
  {
    id: "econ101", code: "ECON101", name: "Principles of Microeconomics", credits: 3, department: "Economics", color: "#FF7043",
    attributes: ["Social Science", "Quantitative Reasoning"], days: ["M", "W", "F"], college: "Business School", campus: "West Campus", locationKeywords: ["Business Building"],
    sections: [
      {
        id: "econ101-001", sectionType: "Standard", crn: "91725", instructor: "Dr. Market", sectionNumber: "001",
        schedule: [ { days: "M,W,F", startTime: "10:00", endTime: "11:00", location: "Business Building 101" } ],
        location: "West Campus", maxSeats: 45, availableSeats: 15
      }
    ]
  },
  // Test courses for prerequisite graph
  { id: "test100", code: "TEST100", name: "Test Base Course", credits: 3, department: "Testing", sections: [{id: "test100-001", crn: "00100", instructor:"Staff", sectionNumber:"001", schedule:[], location:"", maxSeats:10, availableSeats:10}] },
  { id: "test200", code: "TEST200", name: "Test Mid Course", credits: 3, department: "Testing", prerequisites: ["TEST100"], sections: [{id: "test200-001", crn: "00200", instructor:"Staff", sectionNumber:"001", schedule:[], location:"", maxSeats:10, availableSeats:10}] },
  { id: "test300", code: "TEST300", name: "Test Top Course", credits: 3, department: "Testing", prerequisites: ["TEST200"], sections: [{id: "test300-001", crn: "00300", instructor:"Staff", sectionNumber:"001", schedule:[], location:"", maxSeats:10, availableSeats:10}] },
  { id: "test400", code: "TEST400", name: "Test Course with Missing Prereq", credits: 3, department: "Testing", prerequisites: ["XYZ123"], sections: [{id: "test400-001", crn: "00400", instructor:"Staff", sectionNumber:"001", schedule:[], location:"", maxSeats:10, availableSeats:10}] },
  // Circular dependency test courses
  { id: "circ1", code: "CIRC1", name: "Circular 1", credits: 3, department: "Testing", prerequisites: ["CIRC2"], sections: [{id: "circ1-001", crn: "00501", instructor:"Staff", sectionNumber:"001", schedule:[], location:"", maxSeats:10, availableSeats:10}] },
  { id: "circ2", code: "CIRC2", name: "Circular 2", credits: 3, department: "Testing", prerequisites: ["CIRC1"], sections: [{id: "circ2-001", crn: "00502", instructor:"Staff", sectionNumber:"001", schedule:[], location:"", maxSeats:10, availableSeats:10}] },

  // Real-world example: Data Sciences AI Course
  {
    id: "ds442",
    code: "DS442",
    name: "Artificial Intelligence",
    credits: 3,
    department: "Data Sciences",
    college: "College of Information Sciences and Technology",
    campus: "University Park",
    courseCareer: "Undergraduate",
    attributes: ["Advanced Elective", "Technical", "Programming Intensive"],
    keywords: ["artificial intelligence", "AI", "machine learning", "programming", "algorithms"],
    description: "This course provides an overview of the foundations, problems, approaches, implementation, and applications of artificial intelligence. Topics covered include problem solving, goal-based and adversarial search, logical, probabilistic, and decision theoretic knowledge representation and inference, decision making, and learning. Through programming assignments that sample these topics, students acquire an understanding of what it means to build rational agents of different sorts as well as applications that consider them too.",
    prerequisites: ["CMPSC221"],
    corequisites: ["CMPSC465"],
    sections: [
      {
        id: "ds442-002",
        crn: "15201",
        instructor: "Staff", // Title shows "Al" which might be incomplete
        sectionNumber: "002",
        schedule: [
          {
            days: "T,R",
            startTime: "13:35",
            endTime: "14:50",
            location: "ECoRE Bldg 247"
          }
        ],
        location: "ECoRE Bldg 247",
        maxSeats: 80,
        availableSeats: 80,
        waitlistCount: 5,
        term: "Fall 2025",
        campus: "University Park",
        courseCareer: "Undergraduate",
        classStatus: "Open",
        instructionMode: "In-Person",
        academicSession: "Regular Academic Session",
        classStartDate: "2025-08-26",
        classEndDate: "2025-12-11",
        sectionType: "Standard",
        component: "LEC",
        courseControls: "Students must be in the following Majors: DTSCE_BS, DTSCS_BS, DATSC_BS or ISTBS_BS",
        enrollmentRequirements: "Enforced Prerequisite at Enrollment: CMPSC 221. Enforced Concurrent at Enrollment: CMPSC 465",
        additionalInformation: "This course may be used as an Advanced Elective for the Applied Data Science major. The College of IST reserves the right to override your position on the wait list and/or cancel your enrollment for this course in order to accommodate students who need the course this semester to graduate.",
        notes: "Students are REQUIRED to bring a laptop computer for in-class activities."
      }
    ]
  },

  // Additional courses to demonstrate filtering
  {
    id: "cs350",
    code: "CS350",
    name: "Database Systems",
    credits: 3,
    department: "Computer Science",
    college: "College of Engineering",
    campus: "North Campus",
    courseCareer: "Undergraduate",
    attributes: ["Technical", "Advanced"],
    keywords: ["database", "sql", "data"],
    sections: [
      {
        id: "cs350-001",
        crn: "35001",
        instructor: "Dr. Data Manager",
        sectionNumber: "001",
        schedule: [{ days: "M,W,F", startTime: "14:00", endTime: "15:00", location: "Engineering 201" }],
        location: "North Campus",
        maxSeats: 25,
        availableSeats: 0,
        waitlistCount: 3,
        term: "Spring 2025",
        campus: "North Campus",
        courseCareer: "Undergraduate",
        classStatus: "Waitlist",
        instructionMode: "In-Person",
        academicSession: "Full Term",
        classStartDate: "2025-01-15"
      },
      {
        id: "cs350-002",
        crn: "35002",
        instructor: "Prof. Query Master",
        sectionNumber: "002",
        schedule: [{ days: "T,Th", startTime: "16:00", endTime: "17:30", location: "Online" }],
        location: "Online",
        maxSeats: 30,
        availableSeats: 12,
        term: "Spring 2025",
        campus: "Online",
        courseCareer: "Undergraduate",
        classStatus: "Open",
        instructionMode: "Synchronous Online",
        academicSession: "Full Term",
        classStartDate: "2025-01-15"
      }
    ]
  },
  {
    id: "grad500",
    code: "GRAD500",
    name: "Advanced Research Methods",
    credits: 4,
    department: "Graduate Studies",
    college: "Graduate School",
    campus: "Main Campus",
    courseCareer: "Graduate",
    attributes: ["Research", "Advanced", "Writing Intensive"],
    keywords: ["research", "methodology", "graduate"],
    sections: [
      {
        id: "grad500-001",
        crn: "50001",
        instructor: "Dr. Research Expert",
        sectionNumber: "001",
        schedule: [{ days: "W", startTime: "18:00", endTime: "21:00", location: "Graduate Center 301" }],
        location: "Main Campus",
        maxSeats: 15,
        availableSeats: 8,
        term: "Fall 2024",
        campus: "Main Campus",
        courseCareer: "Graduate",
        classStatus: "Open",
        instructionMode: "In-Person",
        academicSession: "Full Term",
        classStartDate: "2024-08-26",
        notes: "Graduate students only"
      }
    ]
  },
  {
    id: "art200",
    code: "ART200",
    name: "Digital Art Studio",
    credits: 3,
    department: "Art",
    college: "College of Fine Arts",
    campus: "West Campus",
    courseCareer: "Undergraduate",
    attributes: ["Creative", "Studio", "Technology"],
    keywords: ["art", "digital", "creative", "studio"],
    sections: [
      {
        id: "art200-001",
        crn: "20001",
        instructor: "Prof. Creative Mind",
        sectionNumber: "001",
        schedule: [{ days: "M,W", startTime: "10:00", endTime: "12:00", location: "Art Studio 101" }],
        location: "West Campus",
        maxSeats: 20,
        availableSeats: 5,
        term: "Fall 2024",
        campus: "West Campus",
        courseCareer: "Undergraduate",
        classStatus: "Open",
        instructionMode: "In-Person",
        academicSession: "First Half",
        classStartDate: "2024-08-26",
        notes: "Studio fee required"
      }
    ]
  },
  // Additional courses for 8 courses per semester
  {
    id: "hist101",
    code: "HIST101",
    name: "World History I",
    credits: 3,
    department: "History",
    college: "College of Liberal Arts",
    campus: "Main Campus",
    courseCareer: "Undergraduate",
    attributes: ["Humanities", "Cultural Diversity"],
    keywords: ["history", "world", "culture"],
    sections: [
      {
        id: "hist101-001",
        crn: "10101",
        instructor: "Dr. Time Keeper",
        sectionNumber: "001",
        schedule: [{ days: "T,Th", startTime: "09:00", endTime: "10:30", location: "Humanities 201" }],
        location: "Main Campus",
        maxSeats: 35,
        availableSeats: 12,
        term: "Fall 2024",
        campus: "Main Campus",
        courseCareer: "Undergraduate",
        classStatus: "Open",
        instructionMode: "In-Person",
        academicSession: "Full Term",
        classStartDate: "2024-08-26"
      }
    ]
  },
  {
    id: "psyc101",
    code: "PSYC101",
    name: "Introduction to Psychology",
    credits: 3,
    department: "Psychology",
    college: "College of Social Sciences",
    campus: "Main Campus",
    courseCareer: "Undergraduate",
    attributes: ["Social Science", "Behavioral Science"],
    keywords: ["psychology", "behavior", "mind"],
    sections: [
      {
        id: "psyc101-001",
        crn: "10201",
        instructor: "Dr. Mind Reader",
        sectionNumber: "001",
        schedule: [{ days: "M,W,F", startTime: "11:00", endTime: "12:00", location: "Social Sciences 101" }],
        location: "Main Campus",
        maxSeats: 40,
        availableSeats: 8,
        term: "Fall 2024",
        campus: "Main Campus",
        courseCareer: "Undergraduate",
        classStatus: "Open",
        instructionMode: "In-Person",
        academicSession: "Full Term",
        classStartDate: "2024-08-26"
      }
    ]
  },
  {
    id: "soc101",
    code: "SOC101",
    name: "Introduction to Sociology",
    credits: 3,
    department: "Sociology",
    college: "College of Social Sciences",
    campus: "Main Campus",
    courseCareer: "Undergraduate",
    attributes: ["Social Science", "Cultural Studies"],
    keywords: ["sociology", "society", "culture"],
    sections: [
      {
        id: "soc101-001",
        crn: "10301",
        instructor: "Dr. Social Network",
        sectionNumber: "001",
        schedule: [{ days: "T,Th", startTime: "14:00", endTime: "15:30", location: "Social Sciences 201" }],
        location: "Main Campus",
        maxSeats: 35,
        availableSeats: 15,
        term: "Fall 2024",
        campus: "Main Campus",
        courseCareer: "Undergraduate",
        classStatus: "Open",
        instructionMode: "In-Person",
        academicSession: "Full Term",
        classStartDate: "2024-08-26"
      }
    ]
  },
  {
    id: "span101",
    code: "SPAN101",
    name: "Elementary Spanish I",
    credits: 4,
    department: "World Languages",
    college: "College of Liberal Arts",
    campus: "Main Campus",
    courseCareer: "Undergraduate",
    attributes: ["Foreign Language", "Cultural Studies"],
    keywords: ["spanish", "language", "culture"],
    sections: [
      {
        id: "span101-001",
        crn: "10401",
        instructor: "Prof. Hola Mundo",
        sectionNumber: "001",
        schedule: [{ days: "M,W,F", startTime: "08:00", endTime: "09:00", location: "Language Center 101" }],
        location: "Main Campus",
        maxSeats: 25,
        availableSeats: 3,
        term: "Fall 2024",
        campus: "Main Campus",
        courseCareer: "Undergraduate",
        classStatus: "Open",
        instructionMode: "In-Person",
        academicSession: "Full Term",
        classStartDate: "2024-08-26"
      }
    ]
  },
  {
    id: "pe101",
    code: "PE101",
    name: "Physical Education - Fitness",
    credits: 1,
    department: "Physical Education",
    college: "College of Health Sciences",
    campus: "Main Campus",
    courseCareer: "Undergraduate",
    attributes: ["Physical Education", "Health"],
    keywords: ["fitness", "health", "exercise"],
    sections: [
      {
        id: "pe101-001",
        crn: "10501",
        instructor: "Coach Fit",
        sectionNumber: "001",
        schedule: [{ days: "T,Th", startTime: "07:00", endTime: "08:00", location: "Recreation Center" }],
        location: "Main Campus",
        maxSeats: 30,
        availableSeats: 20,
        term: "Fall 2024",
        campus: "Main Campus",
        courseCareer: "Undergraduate",
        classStatus: "Open",
        instructionMode: "In-Person",
        academicSession: "Full Term",
        classStartDate: "2024-08-26"
      }
    ]
  }
];

export const mockBusyTimes: BusyTime[] = [
  { id: "bt1", title: "Spanish Language Study Group", days: ["M", "W", "F"], startTime: "15:00", endTime: "16:00", type: "study" },
  { id: "bt2", title: "University Soccer Team Practice", days: ["T", "Th"], startTime: "16:00", endTime: "18:00", type: "personal" },
  { id: "bt3", title: "Part-time Job at Campus Bookstore", days: ["M", "W", "F"], startTime: "17:00", endTime: "19:00", type: "work" }
];

export const mockSchedules: Schedule[] = [
  {
    id: "sched1", name: "Balanced Schedule - Morning Classes", termId: "fall2023",
    sections: [ mockCourses[0].sections[0], mockCourses[1].sections[0], mockCourses[2].sections[0] ],
    busyTimes: mockBusyTimes, totalCredits: 9, conflicts: []
  },
  {
    id: "sched2", name: "Afternoon Schedule - T/Th Focus", termId: "fall2023",
    // Corrected mockCourses[2].sections[1] (eng101's 2nd section, which doesn't exist)
    // to mockCourses[3].sections[0] (eng234's 1st section: eng234-001).
    // mockCourses[2] (eng101) only has one section (sections[0]).
    // mockCourses[3] (eng234) has sections[0] and sections[1].
    sections: [ mockCourses[0].sections[1], mockCourses[1].sections[1], mockCourses[3].sections[0] ],
    busyTimes: mockBusyTimes, totalCredits: 9, // Note: totalCredits might need update if section credits differ significantly
    conflicts: [ { type: "time", description: "Conflict between ENG234 and Part-time Job", courses: ["eng234"], severity: "warning" } ]
  }
];

export const mockTerms: Term[] = [
  { id: "summer2024", name: "Summer 2024", startDate: new Date("2024-05-15"), endDate: new Date("2024-08-15"), registrationStartDate: new Date("2024-04-01"), registrationEndDate: new Date("2024-05-10"), courses: mockCourses },
  { id: "fall2024", name: "Fall 2024", startDate: new Date("2024-08-25"), endDate: new Date("2024-12-15"), registrationStartDate: new Date("2024-07-01"), registrationEndDate: new Date("2024-08-20"), courses: mockCourses },
  { id: "spring2025", name: "Spring 2025", startDate: new Date("2025-01-15"), endDate: new Date("2025-05-10"), registrationStartDate: new Date("2024-11-01"), registrationEndDate: new Date("2024-01-10"), courses: mockCourses }
];

export const mockStudent: StudentInfo = {
  id: "s123456",
  name: "Alex Student",
  major: "Computer Science",
  majorId: "bs-cs",
  minor: "Art History",
  minorId: "minor-arthistory",
  gpa: 3.75,
  expectedGraduationDate: "May 2025",
  interests: ["Artificial Intelligence", "Web Development", "Photography"],
  academicLevel: "Junior",
  totalCredits: 62,
  requiredCredits: 120,
  completedCourses: ["CS101", "MATH105", "ENG101", "AH101"], // ENG101 for prereq of eng234, AH101 for minor
  advisorName: "Dr. Academic Advisor"
};

const csProgramRequirements: DegreeRequirement[] = [
  {
    id: "core_cs", name: "Computer Science Core", description: "Fundamental courses for Computer Science.", requiredCredits: 22, progress: 0.25,
    courseMatcher: { type: "specificCourses", values: ["CS101", "CS201", "CS301", "CS310"] },
  },
  {
    id: "core_math", name: "Mathematics Core", description: "Core mathematics courses required for CS.", requiredCredits: 8, progress: 0.5,
    courseMatcher: { type: "specificCourses", values: ["MATH105", "MATH201"] },
  },
  {
    id: "major_adv_cs", name: "Advanced CS Electives", description: "Choose 3 advanced Computer Science electives.", requiredCredits: 9, progress: 0,
    choiceRequired: 3, courseMatcher: { type: "courseCodePrefix", values: ["CS4"] }, progressCourses: 0,
  },
  {
    id: "gen_ed_hum", name: "Humanities Elective", description: "Choose 1 course from Humanities list.", requiredCredits: 3, progress: 1,
    choiceRequired: 1, choiceCourses: ["ENG234", "PHIL101", "HIST101", "ART100"], progressCourses: 1,
  },
  {
    id: "gen_ed_sci", name: "Science Elective", description: "Choose 1 lab science course.", requiredCredits: 4, progress: 0,
    choiceRequired: 1, courseMatcher: { type: "keyword", values: ["science", "lab"] }, progressCourses: 0,
  },
  {
    id: "univ_req", name: "University Seminar", description: "Required university seminar.", requiredCredits: 1, progress: 0,
    courseMatcher: { type: "specificCourses", values: ["UNIV100"] }
  }
];

export const mockPrograms: AcademicProgram[] = [
  {
    id: "bs-cs", name: "Bachelor of Science in Computer Science", type: 'Major', requirements: csProgramRequirements, totalCreditsRequired: 120,
    description: "Provides a strong foundation in computer science theory and practice."
  },
  {
    id: "ba-engl", name: "Bachelor of Arts in English Literature", type: 'Major', totalCreditsRequired: 120,
    description: "Explores the rich history and diverse forms of literature in English.",
    requirements: [
      { id: "engl-intro", name: "Introductory Literature Survey", requiredCredits: 6, progress: 0, courseMatcher: {type: "courseCodePrefix", values: ["ENGL1"]}},
      { id: "engl-shakespeare", name: "Shakespearean Studies", requiredCredits: 3, progress: 0, choiceRequired: 1, choiceCourses: ["ENGL301", "ENGL302"]},
      { id: "engl-poetry", name: "Poetry Workshop", requiredCredits: 3, progress: 0, courseMatcher: {type: "specificCourses", values: ["ENGL250"]}},
      { id: "engl-theory", name: "Literary Theory", requiredCredits: 3, progress: 0, courseMatcher: {type: "specificCourses", values: ["ENGL400"]}},
      { id: "engl-sr-sem", name: "Senior Seminar", requiredCredits: 3, progress: 0, courseMatcher: {type: "specificCourses", values: ["ENGL490"]}},
      { id: "engl-electives", name: "English Electives", requiredCredits: 15, progress: 0, choiceRequired: 5, courseMatcher: {type: "department", values: ["ENGL"]}}
    ]
  },
  {
    id: "minor-ds", name: "Minor in Data Science", type: 'Minor', totalCreditsRequired: 18,
    description: "Introduces fundamental concepts and tools in data analysis and interpretation.",
    requirements: [
      { id: "ds-intro", name: "Introduction to Data Science", requiredCredits: 3, progress: 0, courseMatcher: {type: "specificCourses", values: ["DS101"]}},
      { id: "ds-stats", name: "Statistics for Data Science", requiredCredits: 3, progress: 0, courseMatcher: {type: "specificCourses", values: ["STAT210"]}},
      { id: "ds-ml", name: "Machine Learning Basics", requiredCredits: 3, progress: 0, courseMatcher: {type: "specificCourses", values: ["CS370"]}},
      { id: "ds-viz", name: "Data Visualization", requiredCredits: 3, progress: 0, courseMatcher: {type: "specificCourses", values: ["DS320"]}},
      { id: "ds-elective1", name: "Data Science Elective I", requiredCredits: 3, progress: 0, choiceRequired: 1, choiceCourses: ["DS410", "CS475", "STAT350"]},
      { id: "ds-elective2", name: "Data Science Elective II", requiredCredits: 3, progress: 0, choiceRequired: 1, choiceCourses: ["DS420", "CS480", "ECON420"]}
    ]
  },
  {
    id: "minor-arthistory", name: "Minor in Art History", type: 'Minor', totalCreditsRequired: 15,
    description: "Explores the history of art across various cultures and periods.",
    requirements: [
      { id: "ah-intro1", name: "Survey of Western Art I", requiredCredits: 3, progress: 0, courseMatcher: {type: "specificCourses", values: ["AH101"]}},
      { id: "ah-intro2", name: "Survey of Western Art II", requiredCredits: 3, progress: 0, courseMatcher: {type: "specificCourses", values: ["AH102"]}},
      { id: "ah-nonwest", name: "Non-Western Art", requiredCredits: 3, progress: 0, courseMatcher: {type: "specificCourses", values: ["AH250"]}},
      { id: "ah-theory", name: "Art History Theory & Methods", requiredCredits: 3, progress: 0, courseMatcher: {type: "specificCourses", values: ["AH300"]}},
      { id: "ah-elective", name: "Art History Elective (300+ Level)", requiredCredits: 3, progress: 0, courseMatcher: {type: "courseCodePrefix", values: ["AH3", "AH4"]}}
    ]
  }
];

export const mockMandatoryCourses = [
  { code: "CS101", name: "Introduction to Computer Science", status: "Completed" },
  { code: "CS201", name: "Data Structures", status: "In Progress" },
  { code: "CS301", name: "Algorithms", status: "Not Started" },
  { code: "MATH101", name: "Calculus I", status: "Completed" }
];

export const timeSlots = [ "7 AM", "8 AM", "9 AM", "10 AM", "11 AM", "12 PM", "1 PM", "2 PM", "3 PM", "4 PM", "5 PM", "6 PM", "7 PM", "8 PM" ];
export const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export const busyTimeColors = {
  'work': { bg: 'bg-slate-500', text: 'text-white', icon: 'briefcase' },
  'study': { bg: 'bg-blue-500', text: 'text-white', icon: 'book-open' },
  'personal': { bg: 'bg-rose-500', text: 'text-white', icon: 'heart' },
  'event': { bg: 'bg-indigo-500', text: 'text-white', icon: 'calendar' },
  'meeting': { bg: 'bg-amber-500', text: 'text-white', icon: 'users' },
  'class': { bg: 'bg-emerald-500', text: 'text-white', icon: 'graduation-cap' },
  'reminder': { bg: 'bg-yellow-500', text: 'text-black', icon: 'bell' },
  'other': { bg: 'bg-violet-500', text: 'text-white', icon: 'bookmark' },
};

export const mockDegreeAuditResult: DegreeAuditResults = {
  studentId: mockStudent.id,
  degreeId: mockPrograms[0].id,
  overallProgress: mockStudent.totalCredits / (mockPrograms[0].totalCreditsRequired || 120),
  totalCreditsEarned: mockStudent.totalCredits,
  totalCreditsRequired: mockPrograms[0].totalCreditsRequired || 120,
  requirementAudits: [
    { ...csProgramRequirements[0], status: 'partially_fulfilled', fulfilledCourses: ['CS101'], progressCredits: 3, progressCourses: 1 } as DegreeRequirementAudit,
    { ...csProgramRequirements[1], status: 'partially_fulfilled', fulfilledCourses: ['MATH105'], progressCredits: 3, progressCourses: 1 } as DegreeRequirementAudit,
    { ...csProgramRequirements[2], status: 'not_fulfilled', fulfilledCourses: [], progressCredits: 0, progressCourses: 0 } as DegreeRequirementAudit,
    { ...csProgramRequirements[3], status: 'fulfilled', fulfilledCourses: ['ENG234'], progressCredits: 3, progressCourses: 1 } as DegreeRequirementAudit,
    { ...csProgramRequirements[4], status: 'not_fulfilled', fulfilledCourses: [], progressCredits: 0, progressCourses: 0 } as DegreeRequirementAudit,
    { ...csProgramRequirements[5], status: 'not_fulfilled', fulfilledCourses: [], progressCredits: 0, progressCourses: 0 } as DegreeRequirementAudit
  ],
  summaryNotes: [
    `Overall progress: ${Math.round((mockStudent.totalCredits / (mockPrograms[0].totalCreditsRequired || 120)) * 100)}%`,
    "Core CS requirements partially met.",
    "Humanities requirement fulfilled.",
    "Advanced CS electives and Science elective need attention."
  ]
};

export const mockMultiYearPlan: MultiYearPlan = {
  id: "plan123", studentId: mockStudent.id, degreeId: mockPrograms[0].id, planName: "My CS Graduation Plan",
  plannedCourses: [
    { courseId: "CS201", termId: "fall2024" }, { courseId: "CS301", termId: "spring2025" },
    { courseId: "MATH201", termId: "fall2024" }, { courseId: "CS310", termId: "fall2024" },
    { courseId: "CS410", termId: "spring2025" }, { courseId: "phys210", termId: "spring2025" },
    { courseId: "univ100", termId: "fall2024" },
  ]
};

export const mockExportedSchedule: ExportedSchedule = {
  version: "1.0", name: mockSchedules[0].name, termId: mockSchedules[0].termId,
  exportedSections: mockSchedules[0].sections.map(section => ({ courseId: section.id.split("-")[0], sectionId: section.id })),
  totalCredits: mockSchedules[0].totalCredits,
};

// Ensure mockStudent has relevant completed courses for the audit
// This was already done when mockStudent was defined earlier.
// mockStudent.completedCourses = ["CS101", "MATH105", "ENG101", "AH101"];
// ENG101 for prereq of eng234. AH101 for art history minor.
