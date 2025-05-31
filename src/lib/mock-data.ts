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
        courseId: "cs101", // Added courseId
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
        courseId: "cs101", // Added courseId
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
    // days: ["M", "W", "F"], // Removed non-standard 'days' from Course
    college: "College of Arts and Sciences",
    campus: "Main Campus",
    // locationKeywords: ["Math Building"], // Removed non-standard 'locationKeywords'
    sections: [
      {
        id: "math105-001",
        courseId: "math105", // Added courseId
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
        courseId: "math105", // Added courseId
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
    id: "eng101",
    code: "ENG101",
    name: "Composition I",
    credits: 3,
    department: "English",
    color: "#42A5FF",
    attributes: ["Humanities", "Writing Intensive", "Introductory"],
    keywords: ["english", "writing", "composition", "foundational"],
    // days: ["M", "W", "F"], // Removed
    college: "College of Liberal Arts",
    campus: "East Campus",
    // locationKeywords: ["Liberal Arts"], // Removed
    sections: [
      {
        id: "eng101-001",
        courseId: "eng101", // Added courseId
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
    prerequisites: ["ENG101"],
    department: "English",
    color: "#42A5F5",
    attributes: ["Humanities", "Writing Intensive"],
    keywords: ["english", "writing", "composition"],
    // days: ["M", "W", "T", "Th"], // Removed
    college: "College of Liberal Arts",
    campus: "East Campus",
    // locationKeywords: ["Liberal Arts"], // Removed
    sections: [
      {
        id: "eng234-001",
        courseId: "eng234", // Added courseId
        sectionType: "Standard",
        crn: "34551",
        instructor: "Prof. Mark Antony",
        sectionNumber: "001",
        schedule: [ { days: "M,W", startTime: "10:00", endTime: "11:30", location: "Liberal Arts 301" } ],
        location: "East Campus", maxSeats: 25, availableSeats: 6
      },
      {
        id: "eng234-002",
        courseId: "eng234", // Added courseId
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
    // corequisites: ["math201"], // Assuming math201 exists or will be added
    department: "Physics",
    color: "#26C6DA",
    attributes: ["Natural Science", "Lab Science", "Quantitative Reasoning"],
    keywords: ["physics", "mechanics", "science"],
    // days: ["M", "W", "F", "T"], // Removed
    college: "College of Engineering",
    campus: "North Campus",
    // locationKeywords: ["Science Building", "Science Lab"], // Removed
    sections: [
      {
        id: "phys210-001",
        courseId: "phys210", // Added courseId
        sectionType: "Lab", // This implies lecture + lab combined or just lab section
        crn: "45151",
        instructor: "Dr. Albert Newton",
        sectionNumber: "001",
        schedule: [
          { days: "M,W,F", startTime: "13:00", endTime: "14:00", location: "Science Building 301" }, // Lecture part
          { days: "T", startTime: "13:00", endTime: "16:00", location: "Science Lab 101" } // Lab part
        ],
        location: "North Campus", maxSeats: 24, availableSeats: 2
      }
    ]
  },
  {
    id: "math201", code: "MATH201", name: "Calculus I", credits: 4, department: "Mathematics",
    description: "Differential calculus, including limits, continuity, derivatives, and applications. Integral calculus, including definite and indefinite integrals, and the fundamental theorem of calculus.",
    // No sections defined, will be added if this course is expanded.
    // For corequisite testing, its presence in mockCourses is enough.
    sections: [
        { id: "math201-001", courseId: "math201", crn: "20101", sectionNumber: "001", instructor: "Dr. Derivative", schedule: [{days: "M,W,F", startTime: "10:00", endTime: "11:00", location: "Math Hall 1"}]}
    ]
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
    // days: ["M", "W", "F"], // Removed
    college: "College of Liberal Arts", campus: "Main Campus",
    // locationKeywords: ["Humanities"], // Removed
    sections: [
      {
        id: "phil101-001", courseId: "phil101", sectionType: "Standard", crn: "51231", instructor: "Dr. Sophie Wisdom", sectionNumber: "001",
        schedule: [ { days: "M,W,F", startTime: "11:00", endTime: "12:00", location: "Humanities 101" } ],
        location: "Main Campus", maxSeats: 40, availableSeats: 18
      }
    ]
  },
  {
    id: "bio101", code: "BIO101", name: "Introduction to Biology", credits: 4, department: "Biology", color: "#66BB6A",
    attributes: ["Natural Science", "Lab Science"],
    // days: ["M", "W", "F"], // Removed
    college: "College of Arts and Sciences", campus: "North Campus",
    // locationKeywords: ["Science Building", "Biology Lab"], // Removed
    sections: [
      {
        id: "bio101-001", courseId: "bio101", sectionType: "Lab", crn: "61425", instructor: "Dr. Gene Splicing", sectionNumber: "001",
        schedule: [ { days: "M,W,F", startTime: "09:00", endTime: "10:00", location: "Science Building 201" }, { days: "W", startTime: "14:00", endTime: "17:00", location: "Biology Lab 101" } ],
        location: "North Campus", maxSeats: 24, availableSeats: 0, waitlistCount: 5
      }
    ]
  },
  {
    id: "chem101", code: "CHEM101", name: "General Chemistry", credits: 4, department: "Chemistry", color: "#AB47BC",
    attributes: ["Natural Science", "Lab Science"],
    // days: ["M", "W", "F", "Th"], // Removed
    college: "College of Arts and Sciences", campus: "North Campus",
    // locationKeywords: ["Science Building", "Chemistry Lab"], // Removed
    sections: [
      {
        id: "chem101-001", courseId: "chem101", sectionType: "Lab", crn: "71523", instructor: "Dr. Molecule", sectionNumber: "001",
        schedule: [ { days: "M,W,F", startTime: "13:00", endTime: "14:00", location: "Science Building 401" }, { days: "Th", startTime: "13:00", endTime: "16:00", location: "Chemistry Lab 101" } ],
        location: "North Campus", maxSeats: 24, availableSeats: 7
      }
    ]
  },
  {
    id: "univ100", code: "UNIV100", name: "University Seminar", credits: 1, department: "University", color: "#7E57C2",
    attributes: ["Introductory", "University Requirement"],
    // days: ["W"], // Removed
    college: "University College", campus: "Main Campus",
    // locationKeywords: ["Student Center"], // Removed
    sections: [
      {
        id: "univ100-001", courseId: "univ100", sectionType: "Standard", crn: "81625", instructor: "Dr. Campus Guide", sectionNumber: "001",
        schedule: [ { days: "W", startTime: "14:00", endTime: "15:00", location: "Student Center 101" } ],
        location: "Main Campus", maxSeats: 30, availableSeats: 11
      }
    ]
  },
  {
    id: "econ101", code: "ECON101", name: "Principles of Microeconomics", credits: 3, department: "Economics", color: "#FF7043",
    attributes: ["Social Science", "Quantitative Reasoning"],
    // days: ["M", "W", "F"], // Removed
    college: "Business School", campus: "West Campus",
    // locationKeywords: ["Business Building"], // Removed
    sections: [
      {
        id: "econ101-001", courseId: "econ101", sectionType: "Standard", crn: "91725", instructor: "Dr. Market", sectionNumber: "001",
        schedule: [ { days: "M,W,F", startTime: "10:00", endTime: "11:00", location: "Business Building 101" } ],
        location: "West Campus", maxSeats: 45, availableSeats: 15
      }
    ]
  },
  // Test courses for prerequisite graph
  { id: "test100", code: "TEST100", name: "Test Base Course", credits: 3, department: "Testing", sections: [{id: "test100-001", courseId: "test100", crn: "00100", instructor:"Staff", sectionNumber:"001", schedule:[], location:"", maxSeats:10, availableSeats:10}] },
  { id: "test200", code: "TEST200", name: "Test Mid Course", credits: 3, department: "Testing", prerequisites: ["TEST100"], sections: [{id: "test200-001", courseId: "test200", crn: "00200", instructor:"Staff", sectionNumber:"001", schedule:[], location:"", maxSeats:10, availableSeats:10}] },
  { id: "test300", code: "TEST300", name: "Test Top Course", credits: 3, department: "Testing", prerequisites: ["TEST200"], sections: [{id: "test300-001", courseId: "test300", crn: "00300", instructor:"Staff", sectionNumber:"001", schedule:[], location:"", maxSeats:10, availableSeats:10}] },
  { id: "test400", code: "TEST400", name: "Test Course with Missing Prereq", credits: 3, department: "Testing", prerequisites: ["XYZ123"], sections: [{id: "test400-001", courseId: "test400", crn: "00400", instructor:"Staff", sectionNumber:"001", schedule:[], location:"", maxSeats:10, availableSeats:10}] },
  // Circular dependency test courses
  { id: "circ1", code: "CIRC1", name: "Circular 1", credits: 3, department: "Testing", prerequisites: ["CIRC2"], sections: [{id: "circ1-001", courseId: "circ1", crn: "00501", instructor:"Staff", sectionNumber:"001", schedule:[], location:"", maxSeats:10, availableSeats:10}] },
  { id: "circ2", code: "CIRC2", name: "Circular 2", credits: 3, department: "Testing", prerequisites: ["CIRC1"], sections: [{id: "circ2-001", courseId: "circ2", crn: "00502", instructor:"Staff", sectionNumber:"001", schedule:[], location:"", maxSeats:10, availableSeats:10}] },

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
    prerequisites: ["CMPSC221"], // Assuming CMPSC221 is a valid course code (not in this mock file)
    // corequisites: ["CMPSC465"], // Assuming CMPSC465 is a valid course code
    sections: [
      {
        id: "ds442-002",
        courseId: "ds442", // Added courseId
        crn: "15201",
        instructor: "Staff",
        sectionNumber: "002",
        schedule: [
          {
            days: "T,R", // Assuming T,R means Tuesday, Thursday
            startTime: "13:35",
            endTime: "14:50",
            location: "ECoRE Bldg 247"
          }
        ],
        location: "ECoRE Bldg 247",
        maxSeats: 80,
        availableSeats: 80,
        waitlistCount: 5,
        term: "Fall 2025", // This term is not in mockTerms, ensure consistency or add term
        campus: "University Park",
        courseCareer: "Undergraduate",
        classStatus: "Open",
        instructionMode: "In-Person",
        academicSession: "Regular Academic Session",
        classStartDate: "2025-08-26",
        classEndDate: "2025-12-11",
        sectionType: "Standard", // Was 'LEC' in component, assuming 'Standard' or 'Lecture'
        // component: "LEC", // This field is not in CourseSection type, might be specific to some data sources
        // courseControls: "Students must be in the following Majors: DTSCE_BS, DTSCS_BS, DATSC_BS or ISTBS_BS", // Not in type
        // enrollmentRequirements: "Enforced Prerequisite at Enrollment: CMPSC 221. Enforced Concurrent at Enrollment: CMPSC 465", // Not in type
        additionalInformation: "This course may be used as an Advanced Elective for the Applied Data Science major. The College of IST reserves the right to override your position on the wait list and/or cancel your enrollment for this course in order to accommodate students who need the course this semester to graduate.",
        notes: "Students are REQUIRED to bring a laptop computer for in-class activities."
      }
    ]
  },
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
    description: "Covers concepts and techniques for database systems, including data models, database design, query languages (SQL), and transaction management.",
    sections: [
      {
        id: "cs350-001",
        courseId: "cs350", // Added courseId
        crn: "35001",
        instructor: "Dr. Data Manager",
        sectionNumber: "001",
        schedule: [{ days: "M,W,F", startTime: "14:00", endTime: "15:00", location: "Engineering 201" }],
        location: "North Campus",
        maxSeats: 25,
        availableSeats: 0,
        waitlistCount: 3,
        term: "Spring 2025", // This term is not in mockTerms, ensure consistency or add term
        campus: "North Campus",
        courseCareer: "Undergraduate",
        classStatus: "Waitlist",
        instructionMode: "In-Person",
        academicSession: "Full Term",
        classStartDate: "2025-01-15"
      },
      {
        id: "cs350-002",
        courseId: "cs350", // Added courseId
        crn: "35002",
        instructor: "Prof. Query Master",
        sectionNumber: "002",
        schedule: [{ days: "T,Th", startTime: "16:00", endTime: "17:30", location: "Online" }],
        location: "Online",
        maxSeats: 30,
        availableSeats: 12,
        term: "Spring 2025", // This term is not in mockTerms, ensure consistency or add term
        campus: "Online", // Assuming "Online" is a valid campus or should be handled
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
    description: "In-depth study of research methodologies, experimental design, and data analysis for graduate students.",
    sections: [
      {
        id: "grad500-001",
        courseId: "grad500", // Added courseId
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
    description: "Studio course exploring digital tools and techniques for artistic expression.",
    sections: [
      {
        id: "art200-001",
        courseId: "art200", // Added courseId
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
        academicSession: "First Half", // Example of different session length
        classStartDate: "2024-08-26",
        notes: "Studio fee required"
      }
    ]
  },
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
    description: "Survey of major historical events and cultural developments across the globe from ancient times to the early modern period.",
    sections: [
      {
        id: "hist101-001",
        courseId: "hist101", // Added courseId
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
    description: "An introduction to the scientific study of behavior and mental processes.",
    sections: [
      {
        id: "psyc101-001",
        courseId: "psyc101", // Added courseId
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
    description: "Examines the fundamental concepts, theories, and methods of sociology.",
    sections: [
      {
        id: "soc101-001",
        courseId: "soc101", // Added courseId
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
    description: "Introduction to Spanish language and Hispanic cultures. Focus on basic grammar, vocabulary, and conversational skills.",
    sections: [
      {
        id: "span101-001",
        courseId: "span101", // Added courseId
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
    description: "Develops physical fitness through various exercises and activities.",
    sections: [
      {
        id: "pe101-001",
        courseId: "pe101", // Added courseId
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
  },
  // Start of New Courses
  {
    id: "NURS201",
    code: "NURS201",
    name: "Fundamentals of Nursing Practice",
    description: "Introduces core concepts and skills essential for nursing practice, including patient assessment, care planning, and ethical considerations.",
    credits: 4,
    department: "Nursing",
    college: "College of Health Sciences",
    campus: "South Campus",
    attributes: ["Clinical", "Healthcare Core"],
    keywords: ["nursing", "healthcare", "clinical skills"],
    sections: [
      {
        id: "NURS201-001",
        courseId: "NURS201",
        crn: "99000",
        sectionNumber: "001",
        instructor: "Prof. Nightingale",
        schedule: [{ days: "M,W", startTime: "09:00", endTime: "11:00", location: "Health Sci Bldg 101" }],
        maxSeats: 40, availableSeats: 10, sectionType: "Lecture", term: "Fall 2024", campus: "South Campus",
      },
      {
        id: "NURS201-L01", // Lab section
        courseId: "NURS201",
        crn: "99001",
        sectionNumber: "L01",
        instructor: "Ms. Remedy",
        schedule: [{ days: "W", startTime: "13:30", endTime: "16:30", location: "Clinical Skills Lab A" }],
        maxSeats: 20, availableSeats: 5, sectionType: "Lab", term: "Fall 2024", campus: "South Campus",
      }
    ]
  },
  {
    id: "SCB200",
    code: "SCB200",
    name: "Human Anatomy and Physiology I",
    description: "Study of the structure and function of the human body, covering cells, tissues, and the integumentary, skeletal, muscular, and nervous systems.",
    credits: 4,
    department: "Biological Sciences",
    college: "College of Health Sciences",
    campus: "South Campus",
    attributes: ["Lab Science", "Pre-Med Track"],
    keywords: ["anatomy", "physiology", "biology", "pre-med"],
    sections: [
      {
        id: "SCB200-001", // This section conflicts with NURS201-L01 on Wednesday (13:00-15:00 vs 13:30-16:30)
        courseId: "SCB200",
        crn: "99002",
        sectionNumber: "001",
        instructor: "Dr. Cell",
        schedule: [{ days: "M,W", startTime: "13:00", endTime: "15:00", location: "Health Sci Complex 102" }],
        maxSeats: 30, availableSeats: 15, sectionType: "Lecture", term: "Fall 2024", campus: "South Campus",
      },
      {
        id: "SCB200-002", // Does not conflict with NURS201-L01
        courseId: "SCB200",
        crn: "99003",
        sectionNumber: "002",
        instructor: "Dr. Tissue",
        schedule: [{ days: "T,Th", startTime: "10:00", endTime: "12:00", location: "Health Sci Complex 103" }],
        maxSeats: 30, availableSeats: 12, sectionType: "Lecture", term: "Fall 2024", campus: "South Campus",
      }
    ]
  },
  {
    id: "BUS301",
    code: "BUS301",
    name: "Principles of Marketing",
    description: "Fundamental concepts of marketing, including consumer behavior, market research, product strategy, pricing, promotion, and distribution.",
    credits: 3,
    department: "Business Administration",
    college: "School of Business",
    campus: "Main Campus",
    attributes: ["Business Core", "Communication Intensive"],
    keywords: ["marketing", "business", "strategy"],
    prerequisites: ["ECON101"],
    sections: [
      {
        id: "BUS301-001",
        courseId: "BUS301",
        crn: "99004",
        sectionNumber: "001",
        instructor: "Prof. Advertise",
        schedule: [{ days: "M,W,F", startTime: "09:00", endTime: "10:00", location: "Business Hall 301" }],
        maxSeats: 40, availableSeats: 20, sectionType: "Lecture", term: "Fall 2024", campus: "Main Campus",
      },
      {
        id: "BUS301-H01", // Honors section
        courseId: "BUS301",
        crn: "99005",
        sectionNumber: "H01",
        instructor: "Dr. Market Lead",
        schedule: [{ days: "T,Th", startTime: "14:00", endTime: "15:30", location: "Business Hall 305" }],
        maxSeats: 20, availableSeats: 5, sectionType: "Honors", term: "Fall 2024", campus: "Main Campus",
      }
    ]
  },
  {
    id: "ART150",
    code: "ART150",
    name: "Foundations of 3D Design",
    description: "Introduction to the principles and elements of three-dimensional design and spatial composition. Includes hands-on studio work.",
    credits: 1,
    department: "Art & Design",
    college: "College of Fine Arts",
    campus: "West Campus",
    attributes: ["Studio Art", "Creative"],
    keywords: ["3D design", "sculpture", "art studio"],
    sections: [
      {
        id: "ART150-S01",
        courseId: "ART150",
        crn: "99006",
        sectionNumber: "S01",
        instructor: "Prof. Form",
        schedule: [{ days: "F", startTime: "13:00", endTime: "16:00", location: "Sculpture Studio A" }],
        maxSeats: 15, availableSeats: 7, sectionType: "Studio", term: "Fall 2024", campus: "West Campus",
      }
    ]
  },
  {
    id: "CS450",
    code: "CS450",
    name: "Operating Systems",
    description: "Covers the principles of operating systems, including process management, memory management, file systems, I/O, and security.",
    credits: 3,
    department: "Computer Science",
    college: "College of Engineering",
    campus: "North Campus",
    attributes: ["Technical", "Advanced CS", "Systems Programming"],
    keywords: ["operating systems", "cs", "systems"],
    prerequisites: ["CS101"],
    corequisites: ["CS350"],
    sections: [
      {
        id: "CS450-001",
        courseId: "CS450",
        crn: "99007",
        sectionNumber: "001",
        instructor: "Dr. Kernel",
        schedule: [{ days: "T,Th", startTime: "10:00", endTime: "11:30", location: "Eng Building 404" }],
        maxSeats: 35, availableSeats: 10, sectionType: "Lecture", term: "Fall 2024", campus: "North Campus",
      },
      {
        id: "CS450-002",
        courseId: "CS450",
        crn: "99008",
        sectionNumber: "002",
        instructor: "Dr. Process",
        schedule: [{ days: "T,Th", startTime: "10:00", endTime: "11:30", location: "Eng Building 405" }], // Same time, different location - potential choice for student
        maxSeats: 35, availableSeats: 8, sectionType: "Lecture", term: "Fall 2024", campus: "North Campus",
      },
       {
        id: "CS450-003",
        courseId: "CS450",
        crn: "99009",
        sectionNumber: "003",
        instructor: "Dr. Thread",
        schedule: [{ days: "M,W", startTime: "16:00", endTime: "17:30", location: "Eng Building 404" }], // No conflict with above
        maxSeats: 35, availableSeats: 12, sectionType: "Lecture", term: "Fall 2024", campus: "North Campus",
      }
    ]
  },
  {
    id: "LANG210",
    code: "LANG210",
    name: "Intermediate French Conversation",
    description: "Focuses on developing conversational fluency in French through discussions, presentations, and interactive activities.",
    credits: 3,
    department: "World Languages",
    college: "College of Liberal Arts",
    campus: "Main Campus",
    attributes: ["Foreign Language", "Communication"],
    keywords: ["french", "conversation", "language"],
    prerequisites: ["SPAN101"], // Example of unusual prereq for testing
    sections: [
      {
        id: "LANG210-H01",
        courseId: "LANG210",
        crn: "99010",
        sectionNumber: "H01",
        instructor: "Prof. Parler",
        schedule: [{ days: "M,W", startTime: "11:00", endTime: "12:30", location: "Language Hall 210" }], // Conflicts with PHIL101-001
        maxSeats: 20, availableSeats: 9, sectionType: "Hybrid", term: "Fall 2024", campus: "Main Campus",
      }
    ]
  },
  {
    id: "MUS110",
    code: "MUS110",
    name: "University Orchestra",
    description: "Participation in the university orchestra, performing a variety of classical and contemporary works. Requires audition.",
    credits: 2,
    department: "Music",
    college: "College of Fine Arts",
    campus: "East Campus",
    attributes: ["Ensemble", "Performance", "Arts Credit", "Audition Required"],
    keywords: ["music", "orchestra", "performance", "ensemble"],
    sections: [
      {
        id: "MUS110-E01",
        courseId: "MUS110",
        crn: "99011",
        sectionNumber: "E01",
        instructor: "Maestro Harmony",
        schedule: [{ days: "T,Th", startTime: "18:00", endTime: "20:00", location: "Concert Hall A" }], // Evening class
        maxSeats: 50, availableSeats: 15, sectionType: "Ensemble", term: "Fall 2024", campus: "East Campus",
      }
    ]
  }
  // End of new courses
];

  // Start of New Courses
  {
    id: "NURS201",
    code: "NURS201",
    name: "Fundamentals of Nursing Practice",
    description: "Introduces core concepts and skills essential for nursing practice, including patient assessment, care planning, and ethical considerations.",
    credits: 4,
    department: "Nursing",
    college: "College of Health Sciences",
    campus: "South Campus",
    attributes: ["Clinical", "Healthcare Core"],
    keywords: ["nursing", "healthcare", "clinical skills"],
    sections: [
      {
        id: "NURS201-001",
        courseId: "NURS201",
        crn: "99000",
        sectionNumber: "001",
        instructor: "Prof. Nightingale",
        schedule: [{ days: "M,W", startTime: "09:00", endTime: "11:00", location: "Health Sci Bldg 101" }],
        maxSeats: 40, availableSeats: 10, sectionType: "Lecture", term: "Fall 2024", campus: "South Campus",
      },
      {
        id: "NURS201-L01", // Lab section
        courseId: "NURS201",
        crn: "99001",
        sectionNumber: "L01",
        instructor: "Ms. Remedy",
        schedule: [{ days: "W", startTime: "13:30", endTime: "16:30", location: "Clinical Skills Lab A" }],
        maxSeats: 20, availableSeats: 5, sectionType: "Lab", term: "Fall 2024", campus: "South Campus",
      }
    ]
  },
  {
    id: "SCB200",
    code: "SCB200",
    name: "Human Anatomy and Physiology I",
    description: "Study of the structure and function of the human body, covering cells, tissues, and the integumentary, skeletal, muscular, and nervous systems.",
    credits: 4,
    department: "Biological Sciences",
    college: "College of Health Sciences",
    campus: "South Campus",
    attributes: ["Lab Science", "Pre-Med Track"],
    keywords: ["anatomy", "physiology", "biology", "pre-med"],
    sections: [
      {
        id: "SCB200-001", // This section conflicts with NURS201-L01 on Wednesday (13:00-15:00 vs 13:30-16:30)
        courseId: "SCB200",
        crn: "99002",
        sectionNumber: "001",
        instructor: "Dr. Cell",
        schedule: [{ days: "M,W", startTime: "13:00", endTime: "15:00", location: "Health Sci Complex 102" }],
        maxSeats: 30, availableSeats: 15, sectionType: "Lecture", term: "Fall 2024", campus: "South Campus",
      },
      {
        id: "SCB200-002", // Does not conflict with NURS201-L01
        courseId: "SCB200",
        crn: "99003",
        sectionNumber: "002",
        instructor: "Dr. Tissue",
        schedule: [{ days: "T,Th", startTime: "10:00", endTime: "12:00", location: "Health Sci Complex 103" }],
        maxSeats: 30, availableSeats: 12, sectionType: "Lecture", term: "Fall 2024", campus: "South Campus",
      }
    ]
  },
  {
    id: "BUS301",
    code: "BUS301",
    name: "Principles of Marketing",
    description: "Fundamental concepts of marketing, including consumer behavior, market research, product strategy, pricing, promotion, and distribution.",
    credits: 3,
    department: "Business Administration",
    college: "School of Business",
    campus: "Main Campus",
    attributes: ["Business Core", "Communication Intensive"],
    keywords: ["marketing", "business", "strategy"],
    prerequisites: ["ECON101"],
    sections: [
      {
        id: "BUS301-001",
        courseId: "BUS301",
        crn: "99004",
        sectionNumber: "001",
        instructor: "Prof. Advertise",
        schedule: [{ days: "M,W,F", startTime: "09:00", endTime: "10:00", location: "Business Hall 301" }],
        maxSeats: 40, availableSeats: 20, sectionType: "Lecture", term: "Fall 2024", campus: "Main Campus",
      },
      {
        id: "BUS301-H01", // Honors section
        courseId: "BUS301",
        crn: "99005",
        sectionNumber: "H01",
        instructor: "Dr. Market Lead",
        schedule: [{ days: "T,Th", startTime: "14:00", endTime: "15:30", location: "Business Hall 305" }],
        maxSeats: 20, availableSeats: 5, sectionType: "Honors", term: "Fall 2024", campus: "Main Campus",
      }
    ]
  },
  {
    id: "ART150",
    code: "ART150",
    name: "Foundations of 3D Design",
    description: "Introduction to the principles and elements of three-dimensional design and spatial composition. Includes hands-on studio work.",
    credits: 1,
    department: "Art & Design",
    college: "College of Fine Arts",
    campus: "West Campus",
    attributes: ["Studio Art", "Creative"],
    keywords: ["3D design", "sculpture", "art studio"],
    sections: [
      {
        id: "ART150-S01",
        courseId: "ART150",
        crn: "99006",
        sectionNumber: "S01",
        instructor: "Prof. Form",
        schedule: [{ days: "F", startTime: "13:00", endTime: "16:00", location: "Sculpture Studio A" }],
        maxSeats: 15, availableSeats: 7, sectionType: "Studio", term: "Fall 2024", campus: "West Campus",
      }
    ]
  },
  {
    id: "CS450",
    code: "CS450",
    name: "Operating Systems",
    description: "Covers the principles of operating systems, including process management, memory management, file systems, I/O, and security.",
    credits: 3,
    department: "Computer Science",
    college: "College of Engineering",
    campus: "North Campus",
    attributes: ["Technical", "Advanced CS", "Systems Programming"],
    keywords: ["operating systems", "cs", "systems"],
    prerequisites: ["CS101"],
    corequisites: ["CS350"],
    sections: [
      {
        id: "CS450-001",
        courseId: "CS450",
        crn: "99007",
        sectionNumber: "001",
        instructor: "Dr. Kernel",
        schedule: [{ days: "T,Th", startTime: "10:00", endTime: "11:30", location: "Eng Building 404" }],
        maxSeats: 35, availableSeats: 10, sectionType: "Lecture", term: "Fall 2024", campus: "North Campus",
      },
      {
        id: "CS450-002",
        courseId: "CS450",
        crn: "99008",
        sectionNumber: "002",
        instructor: "Dr. Process",
        schedule: [{ days: "T,Th", startTime: "10:00", endTime: "11:30", location: "Eng Building 405" }], // Same time, different location
        maxSeats: 35, availableSeats: 8, sectionType: "Lecture", term: "Fall 2024", campus: "North Campus",
      },
       {
        id: "CS450-003",
        courseId: "CS450",
        crn: "99009",
        sectionNumber: "003",
        instructor: "Dr. Thread",
        schedule: [{ days: "M,W", startTime: "16:00", endTime: "17:30", location: "Eng Building 404" }],
        maxSeats: 35, availableSeats: 12, sectionType: "Lecture", term: "Fall 2024", campus: "North Campus",
      }
    ]
  },
  {
    id: "LANG210",
    code: "LANG210",
    name: "Intermediate French Conversation",
    description: "Focuses on developing conversational fluency in French through discussions, presentations, and interactive activities.",
    credits: 3,
    department: "World Languages",
    college: "College of Liberal Arts",
    campus: "Main Campus",
    attributes: ["Foreign Language", "Communication"],
    keywords: ["french", "conversation", "language"],
    prerequisites: ["SPAN101"], // Unusual prereq for testing variety
    sections: [
      {
        id: "LANG210-H01",
        courseId: "LANG210",
        crn: "99010",
        sectionNumber: "H01",
        instructor: "Prof. Parler",
        schedule: [{ days: "M,W", startTime: "11:00", endTime: "12:30", location: "Language Hall 210" }], // Conflicts with PHIL101-001
        maxSeats: 20, availableSeats: 9, sectionType: "Hybrid", term: "Fall 2024", campus: "Main Campus",
      }
    ]
  },
  {
    id: "MUS110",
    code: "MUS110",
    name: "University Orchestra",
    description: "Participation in the university orchestra, performing a variety of classical and contemporary works. Requires audition.",
    credits: 2,
    department: "Music",
    college: "College of Fine Arts",
    campus: "East Campus",
    attributes: ["Ensemble", "Performance", "Arts Credit", "Audition Required"],
    keywords: ["music", "orchestra", "performance", "ensemble"],
    sections: [
      {
        id: "MUS110-E01",
        courseId: "MUS110",
        crn: "99011",
        sectionNumber: "E01",
        instructor: "Maestro Harmony",
        schedule: [{ days: "T,Th", startTime: "18:00", endTime: "20:00", location: "Concert Hall A" }], // Evening class
        maxSeats: 50, availableSeats: 15, sectionType: "Ensemble", term: "Fall 2024", campus: "East Campus",
      }
    ]
  }
  // End of new courses
];

export const mockBusyTimes: BusyTime[] = [
  { id: "bt1", title: "Language Study Group", days: ["M", "W"], startTime: "15:00", endTime: "16:30", type: "study" }, // Adjusted time
  { id: "bt2", title: "Soccer Practice", days: ["T", "Th"], startTime: "16:00", endTime: "18:00", type: "personal" },
  { id: "bt3", title: "Campus Bookstore Job", days: ["F"], startTime: "17:00", endTime: "20:00", type: "work" }, // Friday only
  { id: "bt4", title: "Morning Gym", days: ["M", "W", "F"], startTime: "07:00", endTime: "08:30", type: "personal" } // New busy time
];

export const mockSchedules: Schedule[] = [
  {
    id: "sched1", name: "Balanced Schedule - Morning Classes", termId: "fall2024", // Updated termId for consistency
    sections: [
        // Assuming mockCourses[0] is cs101, mockCourses[1] is math105, mockCourses[2] is eng101
        // These sections should already have courseId from the initial data cleaning pass
        // Adding term for consistency, assuming these sections are for Fall 2024
        { ...mockCourses[0].sections[0], courseId: mockCourses[0].id, term: "Fall 2024" },
        { ...mockCourses[1].sections[0], courseId: mockCourses[1].id, term: "Fall 2024" },
        { ...mockCourses[2].sections[0], courseId: mockCourses[2].id, term: "Fall 2024" }
    ],
    busyTimes: mockBusyTimes, totalCredits: 9, conflicts: []
  },
  {
    id: "sched2", name: "Afternoon Schedule - T/Th Focus", termId: "fall2024", // Updated termId for consistency
    sections: [
        { ...mockCourses[0].sections[1], courseId: mockCourses[0].id, term: "Fall 2024" },
        { ...mockCourses[1].sections[1], courseId: mockCourses[1].id, term: "Fall 2024" },
        { ...mockCourses[3].sections[0], courseId: mockCourses[3].id, term: "Fall 2024" }  // mockCourses[3] is eng234
    ],
    busyTimes: mockBusyTimes, totalCredits: 9,
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
  completedCourses: ["CS101", "MATH105", "ENG101", "ECON101", "TEST100", "AH101"], // Added ECON101 and TEST100 for prerequisites
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
  exportedSections: mockSchedules[0].sections.map(section => ({ courseId: section.courseId || section.id.split("-")[0], sectionId: section.id })), // Use courseId if available
  totalCredits: mockSchedules[0].totalCredits,
};

// Ensure mockStudent has relevant completed courses for the audit
// This was already done when mockStudent was defined earlier.
// mockStudent.completedCourses = ["CS101", "MATH105", "ENG101", "AH101"]; // Original
// ENG101 for prereq of eng234. AH101 for art history minor.
// ECON101 for BUS301. TEST100 for TEST200.

// Note: The `corequisites` field was present in one of the original mock courses (PHYS210 -> math201).
// The `Course` type definition would need to include `corequisites?: string[];` for this to be formally typed.
// Assuming it exists or can be added to the type. If not, it should be removed from PHYS210.
// For this exercise, I'll assume the type can accommodate it.
if (mockCourses.find(c => c.id === "phys210")) {
  mockCourses.find(c => c.id === "phys210")!.corequisites = ["math201"];
}
if (mockCourses.find(c => c.id === "ds442")) {
  mockCourses.find(c => c.id === "ds442")!.corequisites = ["CMPSC465"]; // From original data
}
// Ensure new CS450 has its corequisite
const cs450Course = mockCourses.find(c => c.id === "CS450");
if (cs450Course && !cs450Course.corequisites) {
    cs450Course.corequisites = ["CS350"];
}


// Adding courseId to TEST courses' sections as they were missed in previous steps if any
mockCourses.filter(c => c.department === "Testing").forEach(course => {
  course.sections.forEach(section => {
    if (!section.courseId) section.courseId = course.id;
  });
});
// Adding courseId to math201 section as it was missed if any
const math201Course = mockCourses.find(c => c.id === "math201");
if (math201Course && math201Course.sections) {
    math201Course.sections.forEach(s => {
        if(!s.courseId) s.courseId = "math201";
    });
}


// Final check and default setting for courseId and term in all sections of mockCourses
// Also ensures 'schedule' array exists for sections.
mockCourses.forEach(course => {
  if (!course.sections) {
    // console.warn(`Course ${course.id} (${course.code}) has no sections array. Initializing as empty.`);
    course.sections = [];
  }
  course.sections.forEach(section => {
    if (!section.courseId) {
      // console.error(`CRITICAL MOCK DATA ERROR: Section ${section.id} in course ${course.id} (${course.code}) is MISSING courseId! Fixing.`);
      section.courseId = course.id;
    }
    if (!section.schedule) {
      // console.warn(`Section ${section.id} in course ${course.id} (${course.code}) has no schedule array. Initializing as empty.`);
      section.schedule = [];
    }
    // Ensure all sections have a term, defaulting to "Fall 2024"
    // This is important because section.term is used in some components/logic.
    // Check against mockTerms to ensure validity if a term is present.
    const validTermIds = new Set(mockTerms.map(t => t.id));
    if (section.term && !validTermIds.has(section.term)) {
      // console.warn(`Section ${section.id} (${course.code}) has term ${section.term}, which is not in mockTerms. Defaulting to Fall 2024.`);
      section.term = "fall2024";
    }
    if (!section.term) {
        // console.warn(`Section ${section.id} (${course.code}) is missing term. Defaulting to Fall 2024.`);
        section.term = "fall2024";
    }
  });
});

// Ensure sections in mockSchedules also have courseId and a valid term
mockSchedules.forEach(schedule => {
    const validTermIds = new Set(mockTerms.map(t => t.id));
    if(!validTermIds.has(schedule.termId)) {
        // console.warn(`Mock schedule ${schedule.id} has term ${schedule.termId}, not in mockTerms. Defaulting to Fall 2024.`);
        schedule.termId = "fall2024";
    }
    schedule.sections.forEach(section => {
        if (!section.courseId) {
            const parentCourse = mockCourses.find(c => c.sections.some(s => s.id === section.id));
            if (parentCourse) {
                section.courseId = parentCourse.id;
            } else {
                // console.error(`CRITICAL MOCK DATA ERROR: Section ${section.id} in mockSchedule ${schedule.id} could not find parent course to set courseId!`);
            }
        }
        if (section.term && !validTermIds.has(section.term)) {
            // console.warn(`Section ${section.id} in mock schedule ${schedule.id} has term ${section.term}, not in mockTerms. Defaulting to Fall 2024.`);
            section.term = "fall2024";
        }
        if (!section.term) {
            // console.warn(`Section ${section.id} in mock schedule ${schedule.id} is missing term. Defaulting to Fall 2024.`);
            section.term = "fall2024";
        }
    });
});

// Note: The `corequisites` field was present in one of the original mock courses (PHYS210 -> math201).
// The `Course` type definition would need to include `corequisites?: string[];` for this to be formally typed.
// Assuming it exists or can be added to the type. If not, it should be removed from PHYS210.
// For this exercise, I'll assume the type can accommodate it.
// Added `corequisites: ["CS350"]` to CS450 as an example.
if (mockCourses.find(c => c.id === "phys210")) {
  mockCourses.find(c => c.id === "phys210")!.corequisites = ["math201"];
}
if (mockCourses.find(c => c.id === "ds442")) {
  mockCourses.find(c => c.id === "ds442")!.corequisites = ["CMPSC465"]; // From original data
}
if (mockCourses.find(c => c.id === "CS450")) {
  mockCourses.find(c => c.id === "CS450")!.corequisites = ["CS350"]; // My added example
}


// Adding courseId to TEST courses' sections as they were missed in previous steps if any
mockCourses.filter(c => c.department === "Testing").forEach(course => {
  course.sections.forEach(section => {
    if (!section.courseId) section.courseId = course.id;
  });
});
// Adding courseId to math201 section as it was missed if any
mockCourses.find(c => c.id === "math201")?.sections.forEach(s => {
    if(!s.courseId) s.courseId = "math201";
});


// Final check and default setting for courseId and term in all sections of mockCourses
// Also ensures 'schedule' array exists for sections.
mockCourses.forEach(course => {
  if (!course.sections) {
    // console.warn(`Course ${course.id} (${course.code}) has no sections array. Initializing as empty.`);
    course.sections = [];
  }
  course.sections.forEach(section => {
    if (!section.courseId) {
      // console.error(`CRITICAL MOCK DATA ERROR: Section ${section.id} in course ${course.id} (${course.code}) is MISSING courseId! Fixing.`);
      section.courseId = course.id;
    }
    if (!section.schedule) {
      // console.warn(`Section ${section.id} in course ${course.id} (${course.code}) has no schedule array. Initializing as empty.`);
      section.schedule = [];
    }
    // Ensure all sections have a term, defaulting to "Fall 2024"
    // This is important because section.term is used in some components/logic.
    // Check against mockTerms to ensure validity if a term is present.
    const validTermIds = new Set(mockTerms.map(t => t.id));
    if (section.term && !validTermIds.has(section.term)) {
      // console.warn(`Section ${section.id} (${course.code}) has term ${section.term}, which is not in mockTerms. Defaulting to Fall 2024.`);
      section.term = "fall2024";
    }
    if (!section.term) {
        // console.warn(`Section ${section.id} (${course.code}) is missing term. Defaulting to Fall 2024.`);
        section.term = "fall2024";
    }
  });
});

// Ensure sections in mockSchedules also have courseId and a valid term
mockSchedules.forEach(schedule => {
    const validTermIds = new Set(mockTerms.map(t => t.id));
    if(!validTermIds.has(schedule.termId)) {
        // console.warn(`Mock schedule ${schedule.id} has term ${schedule.termId}, not in mockTerms. Defaulting to Fall 2024.`);
        schedule.termId = "fall2024";
    }
    schedule.sections.forEach(section => {
        if (!section.courseId) {
            const parentCourse = mockCourses.find(c => c.sections.some(s => s.id === section.id));
            if (parentCourse) {
                section.courseId = parentCourse.id;
            } else {
                // console.error(`CRITICAL MOCK DATA ERROR: Section ${section.id} in mockSchedule ${schedule.id} could not find parent course to set courseId!`);
            }
        }
        if (section.term && !validTermIds.has(section.term)) {
            // console.warn(`Section ${section.id} in mock schedule ${schedule.id} has term ${section.term}, not in mockTerms. Defaulting to Fall 2024.`);
            section.term = "fall2024";
        }
        if (!section.term) {
            // console.warn(`Section ${section.id} in mock schedule ${schedule.id} is missing term. Defaulting to Fall 2024.`);
            section.term = "fall2024";
        }
    });
});
