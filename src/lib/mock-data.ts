
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
    attributes: ["Technical", "Introductory"], // Added attributes
    keywords: ["programming", "introduction", "cs"], // Added keywords
    // Adding new filter fields for testing
    days: ["M", "W", "F"], 
    college: "College of Engineering",
    campus: "North Campus",
    locationKeywords: ["Science Building"], // Using keywords for broader matching
    sections: [
      {
        id: "cs101-001",
        sectionType: "Lab", // Added sectionType
        crn: "12345",
        instructor: "Dr. John Smith",
        sectionNumber: "001",
        schedule: [
          { days: "M,W,F", startTime: "09:00", endTime: "10:00", location: "Science Building 101" }
        ],
        location: "North Campus", // This is section specific, top-level campus is for the course offering
        maxSeats: 30,
        availableSeats: 5,
        locked: true // Added lock status
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
        availableSeats: 8
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
    attributes: ["Quantitative Reasoning", "Introductory"], // Added attributes
    keywords: ["math", "algebra", "calculus-prep"], // Added keywords
    // Adding new filter fields for testing
    days: ["M", "W", "F"],
    college: "College of Arts and Sciences",
    campus: "Main Campus",
    locationKeywords: ["Math Building"],
    sections: [
      {
        id: "math105-001",
        sectionType: "Standard", // Added sectionType
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
        locked: true // Added lock status
      }
    ]
  },
  {
    id: "eng234",
    code: "ENG234",
    name: "Composition II",
    credits: 3,
    prerequisites: ["eng101"],
    department: "English",
    color: "#42A5F5",
    attributes: ["Humanities", "Writing Intensive"], // Added attributes
    keywords: ["english", "writing", "composition"], // Added keywords
    // Adding new filter fields for testing
    days: ["M", "W", "T", "Th"], // Has MW and TTh sections
    college: "College of Liberal Arts",
    campus: "East Campus",
    locationKeywords: ["Liberal Arts"],
    sections: [
      {
        id: "eng234-001",
        sectionType: "Standard", // Added sectionType
        crn: "34551",
        instructor: "Prof. Mark Antony",
        sectionNumber: "001",
        schedule: [
          { days: "M,W", startTime: "10:00", endTime: "11:30", location: "Liberal Arts 301" }
        ],
        location: "East Campus",
        maxSeats: 25,
        availableSeats: 6
      },
      {
        id: "eng234-002",
        crn: "34552",
        instructor: "Prof. Julia Caesar",
        sectionNumber: "002",
        schedule: [
          { days: "T,Th", startTime: "14:00", endTime: "15:30", location: "Liberal Arts 302" }
        ],
        location: "East Campus",
        maxSeats: 25,
        availableSeats: 4,
        sectionType: "Honors" // Added sectionType
      }
    ]
  },
  {
    id: "phys210",
    code: "PHYS210",
    name: "Physics I: Mechanics",
    credits: 4,
    corequisites: ["math201"],
    department: "Physics",
    color: "#26C6DA",
    attributes: ["Natural Science", "Lab Science", "Quantitative Reasoning"], // Added attributes
    keywords: ["physics", "mechanics", "science"], // Added keywords
    // Adding new filter fields
    days: ["M", "W", "F", "T"], // Has MWF and T sections
    college: "College of Engineering", // Assuming Physics is under Engineering for this example
    campus: "North Campus",
    locationKeywords: ["Science Building", "Science Lab"],
    sections: [
      {
        id: "phys210-001",
        sectionType: "Lab", // Added sectionType
        crn: "45151",
        instructor: "Dr. Albert Newton",
        sectionNumber: "001",
        schedule: [
          { days: "M,W,F", startTime: "13:00", endTime: "14:00", location: "Science Building 301" },
          { days: "T", startTime: "13:00", endTime: "16:00", location: "Science Lab 101" }
        ],
        location: "North Campus",
        maxSeats: 24,
        availableSeats: 2
      }
    ]
  },
  {
    id: "phil101",
    code: "PHIL101",
    name: "Introduction to Logic",
    credits: 3,
    department: "Philosophy",
    color: "#EC407A",
    attributes: ["Humanities", "Critical Thinking"], // Added attributes
    keywords: ["philosophy", "logic", "reasoning"], // Added keywords
    days: ["M", "W", "F"],
    college: "College of Liberal Arts",
    campus: "Main Campus",
    locationKeywords: ["Humanities"],
    sections: [
      {
        id: "phil101-001",
        sectionType: "Standard", // Added sectionType
        crn: "51231",
        instructor: "Dr. Sophie Wisdom",
        sectionNumber: "001",
        schedule: [
          { days: "M,W,F", startTime: "11:00", endTime: "12:00", location: "Humanities 101" }
        ],
        location: "Main Campus",
        maxSeats: 40,
        availableSeats: 18
      }
    ]
  },
  {
    id: "bio101",
    code: "BIO101",
    name: "Introduction to Biology",
    credits: 4,
    department: "Biology",
    color: "#66BB6A",
    attributes: ["Natural Science", "Lab Science"], // Added attributes
    days: ["M", "W", "F"], // Lecture MWF, Lab W
    college: "College of Arts and Sciences",
    campus: "North Campus",
    locationKeywords: ["Science Building", "Biology Lab"],
    sections: [
      {
        id: "bio101-001",
        sectionType: "Lab", // Added sectionType
        crn: "61425",
        instructor: "Dr. Gene Splicing",
        sectionNumber: "001",
        schedule: [
          { days: "M,W,F", startTime: "09:00", endTime: "10:00", location: "Science Building 201" },
          { days: "W", startTime: "14:00", endTime: "17:00", location: "Biology Lab 101" }
        ],
        location: "North Campus",
        maxSeats: 24,
        availableSeats: 0,
        waitlistCount: 5
      }
    ]
  },
  {
    id: "chem101",
    code: "CHEM101",
    name: "General Chemistry",
    credits: 4,
    department: "Chemistry",
    color: "#AB47BC",
    attributes: ["Natural Science", "Lab Science"], // Added attributes
    days: ["M", "W", "F", "Th"], // Lecture MWF, Lab Th
    college: "College of Arts and Sciences",
    campus: "North Campus",
    locationKeywords: ["Science Building", "Chemistry Lab"],
    sections: [
      {
        id: "chem101-001",
        sectionType: "Lab", // Added sectionType
        crn: "71523",
        instructor: "Dr. Molecule",
        sectionNumber: "001",
        schedule: [
          { days: "M,W,F", startTime: "13:00", endTime: "14:00", location: "Science Building 401" },
          { days: "Th", startTime: "13:00", endTime: "16:00", location: "Chemistry Lab 101" }
        ],
        location: "North Campus",
        maxSeats: 24,
        availableSeats: 7
      }
    ]
  },
  {
    id: "univ100",
    code: "UNIV100",
    name: "University Seminar",
    credits: 1,
    department: "University",
    color: "#7E57C2",
    attributes: ["Introductory", "University Requirement"], // Added attributes
    days: ["W"],
    college: "University College", // Example college
    campus: "Main Campus",
    locationKeywords: ["Student Center"],
    sections: [
      {
        id: "univ100-001",
        sectionType: "Standard", // Added sectionType
        crn: "81625",
        instructor: "Dr. Campus Guide",
        sectionNumber: "001",
        schedule: [
          { days: "W", startTime: "14:00", endTime: "15:00", location: "Student Center 101" }
        ],
        location: "Main Campus",
        maxSeats: 30,
        availableSeats: 11
      }
    ]
  },
  {
    id: "econ101",
    code: "ECON101",
    name: "Principles of Microeconomics",
    credits: 3,
    department: "Economics",
    color: "#FF7043",
    attributes: ["Social Science", "Quantitative Reasoning"], // Added attributes
    days: ["M", "W", "F"],
    college: "Business School",
    campus: "West Campus",
    locationKeywords: ["Business Building"],
    sections: [
      {
        id: "econ101-001",
        sectionType: "Standard", // Added sectionType
        crn: "91725",
        instructor: "Dr. Market",
        sectionNumber: "001",
        schedule: [
          { days: "M,W,F", startTime: "10:00", endTime: "11:00", location: "Business Building 101" }
        ],
        location: "West Campus",
        maxSeats: 45,
        availableSeats: 15
      }
    ]
  }
];

export const mockBusyTimes: BusyTime[] = [
  {
    id: "bt1",
    title: "Spanish Language Study Group",
    days: ["M", "W", "F"],
    startTime: "15:00",
    endTime: "16:00",
    type: "study"
  },
  {
    id: "bt2",
    title: "University Soccer Team Practice",
    days: ["T", "Th"],
    startTime: "16:00",
    endTime: "18:00",
    type: "personal"
  },
  {
    id: "bt3",
    title: "Part-time Job at Campus Bookstore",
    days: ["M", "W", "F"],
    startTime: "17:00",
    endTime: "19:00",
    type: "work"
  }
];

export const mockSchedules: Schedule[] = [
  {
    id: "sched1",
    name: "Balanced Schedule - Morning Classes",
    termId: "fall2023",
    sections: [
      mockCourses[0].sections[0],  // CS101 - MWF 9-10
      mockCourses[1].sections[0],  // MATH105 - MWF 8-9
      mockCourses[2].sections[0]   // ENG234 - MW 10-11:30
    ],
    busyTimes: mockBusyTimes,
    totalCredits: 9,
    conflicts: []
  },
  {
    id: "sched2",
    name: "Afternoon Schedule - T/Th Focus",
    termId: "fall2023",
    sections: [
      mockCourses[0].sections[1],  // CS101 - TTh 13-14:30
      mockCourses[1].sections[1],  // MATH105 - TTh 11-12:30
      mockCourses[2].sections[1]   // ENG234 - TTh 14-15:30
    ],
    busyTimes: mockBusyTimes,
    totalCredits: 9,
    conflicts: [
      {
        type: "time",
        description: "Conflict between ENG234 and Part-time Job",
        courses: ["eng234"],
        severity: "warning"
      }
    ]
  }
];

export const mockTerms: Term[] = [
  {
    id: "summer2024",
    name: "Summer 2024",
    startDate: new Date("2024-05-15"),
    endDate: new Date("2024-08-15"),
    registrationStartDate: new Date("2024-04-01"),
    registrationEndDate: new Date("2024-05-10"),
    courses: mockCourses
  },
  {
    id: "fall2024",
    name: "Fall 2024",
    startDate: new Date("2024-08-25"),
    endDate: new Date("2024-12-15"),
    registrationStartDate: new Date("2024-07-01"),
    registrationEndDate: new Date("2024-08-20"),
    courses: mockCourses
  },
  {
    id: "spring2025",
    name: "Spring 2025",
    startDate: new Date("2025-01-15"),
    endDate: new Date("2025-05-10"),
    registrationStartDate: new Date("2024-11-01"),
    registrationEndDate: new Date("2024-01-10"),
    courses: mockCourses
  }
];

export const mockStudent: StudentInfo = {
  id: "s123456",
  name: "Alex Student",
  major: "Computer Science", // Will be overridden by majorId if used
  majorId: "bs-cs", // Link to the BS CS program
  minor: "Art History", // Example, will be overridden by minorId if used
  minorId: "minor-arthistory", // Link to Art History minor
  gpa: 3.75,            // Example
  expectedGraduationDate: "May 2025", // Example
  interests: ["Artificial Intelligence", "Web Development", "Photography"], // Example
  academicLevel: "Junior",
  totalCredits: 62, // This would be calculated based on completed courses in a real app
  requiredCredits: 120, // This would come from the selected AcademicProgram
  completedCourses: ["cs101", "math101", "eng101", "math105", "eng234", "AH101"], // Updated at the end of file too
  advisorName: "Dr. Academic Advisor"
};

// Define mockDegreeRequirements directly within the first program or adapt them.
// For this step, we'll adapt them to the new DegreeRequirement structure.
const csProgramRequirements: DegreeRequirement[] = [
  {
    id: "core_cs",
    name: "Computer Science Core",
    description: "Fundamental courses for Computer Science.",
    requiredCredits: 22,
    progress: 0.25, // Example progress, would be calculated
    courseMatcher: { type: "specificCourses", values: ["CS101", "CS201", "CS301", "CS310"] },
    // Assuming CS101 is completed, progressCourses would be 1 if choiceRequired was set.
    // For specific courses, progressCourses isn't as relevant unless a subset is chosen.
  },
  {
    id: "core_math",
    name: "Mathematics Core",
    description: "Core mathematics courses required for CS.",
    requiredCredits: 8,
    progress: 0.5, // Example progress
    courseMatcher: { type: "specificCourses", values: ["MATH105", "MATH201"] },
  },
  {
    id: "major_adv_cs",
    name: "Advanced CS Electives",
    description: "Choose 3 advanced Computer Science electives.",
    requiredCredits: 9, 
    progress: 0,
    choiceRequired: 3,
    courseMatcher: { type: "courseCodePrefix", values: ["CS4"] }, // Example: CS4xx courses
    progressCourses: 0,
  },
  {
    id: "gen_ed_hum",
    name: "Humanities Elective",
    description: "Choose 1 course from Humanities list.",
    requiredCredits: 3,
    progress: 1, // Marked as completed
    choiceRequired: 1,
    choiceCourses: ["ENG234", "PHIL101", "HIST101", "ART100"], 
    progressCourses: 1, // Assuming ENG234 was taken
  },
  {
    id: "gen_ed_sci",
    name: "Science Elective",
    description: "Choose 1 lab science course.",
    requiredCredits: 4,
    progress: 0,
    choiceRequired: 1,
    courseMatcher: { type: "keyword", values: ["science", "lab"] }, // Match courses with "science" AND "lab" keywords
    progressCourses: 0,
  },
  {
    id: "univ_req",
    name: "University Seminar",
    description: "Required university seminar.",
    requiredCredits: 1,
    progress: 0,
    courseMatcher: { type: "specificCourses", values: ["UNIV100"] }
  }
];

export const mockPrograms: AcademicProgram[] = [
  {
    id: "bs-cs",
    name: "Bachelor of Science in Computer Science",
    type: 'Major',
    requirements: csProgramRequirements,
    totalCreditsRequired: 120,
    description: "Provides a strong foundation in computer science theory and practice."
  },
  {
    id: "ba-engl",
    name: "Bachelor of Arts in English Literature",
    type: 'Major',
    totalCreditsRequired: 120,
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
    id: "minor-ds",
    name: "Minor in Data Science",
    type: 'Minor',
    totalCreditsRequired: 18,
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
    id: "minor-arthistory",
    name: "Minor in Art History",
    type: 'Minor',
    totalCreditsRequired: 15,
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

// mockDegree is no longer needed as its data is in mockPrograms[0]
// export const mockDegree: Degree = {
//   id: "cs-bs",
//   name: "Bachelor of Science in Computer Science",
//   totalCredits: 120,
//   requirements: csProgramRequirements // Use the adapted requirements
// };

export const mockMandatoryCourses = [
  {
    code: "CS101",
    name: "Introduction to Computer Science",
    status: "Completed"
  },
  {
    code: "CS201",
    name: "Data Structures",
    status: "In Progress"
  },
  {
    code: "CS301",
    name: "Algorithms",
    status: "Not Started"
  },
  {
    code: "MATH101",
    name: "Calculus I",
    status: "Completed"
  }
];

export const timeSlots = [
  "7 AM", "8 AM", "9 AM", "10 AM", "11 AM", "12 PM", 
  "1 PM", "2 PM", "3 PM", "4 PM", "5 PM", "6 PM", "7 PM", "8 PM"
];

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

// New Mock Data for Degree Audit, Multi-Year Plan, and Exported Schedule

export const mockDegreeAuditResult: DegreeAuditResults = {
  studentId: mockStudent.id,
  degreeId: mockPrograms[0].id, // Link to the BS CS program ID
  overallProgress: mockStudent.totalCredits / (mockPrograms[0].totalCreditsRequired || 120),
  totalCreditsEarned: mockStudent.totalCredits,
  totalCreditsRequired: mockPrograms[0].totalCreditsRequired || 120,
  requirementAudits: [ // This would need to be dynamically generated based on mockPrograms[0].requirements and student's courses
    // For simplicity, we'll manually create a few based on the new structure.
    // This part needs careful regeneration if the requirements changed significantly.
    // The spread operator `...csProgramRequirements[0]` might not work if the structure is too different.
    // Let's assume csProgramRequirements are correctly structured DegreeRequirement items.
    {
      ...csProgramRequirements[0], // Core CS
      status: 'partially_fulfilled',
      fulfilledCourses: ['CS101'], // Assuming CS101 is completed by mockStudent
      progressCredits: 3, // Credits for CS101
      progressCourses: 1, // 1 course towards the specific list
    } as DegreeRequirementAudit, // Cast to ensure type compatibility
    {
      ...csProgramRequirements[1], // Core Math
      status: 'partially_fulfilled',
      fulfilledCourses: ['MATH105'], // Assuming MATH105 is completed by mockStudent
      progressCredits: 3, // Credits for MATH105
      progressCourses: 1,
    } as DegreeRequirementAudit,
    {
      ...csProgramRequirements[2], // Advanced CS Electives
      status: 'not_fulfilled',
      fulfilledCourses: [],
      progressCredits: 0,
      progressCourses: 0,
    } as DegreeRequirementAudit,
    {
      ...csProgramRequirements[3], // Humanities Elective
      status: 'fulfilled',
      fulfilledCourses: ['ENG234'], // Assuming ENG234 is completed by mockStudent
      progressCredits: 3,
      progressCourses: 1,
    } as DegreeRequirementAudit,
     {
      ...csProgramRequirements[4], // Science Elective
      status: 'not_fulfilled',
      fulfilledCourses: [],
      progressCredits: 0,
      progressCourses: 0,
    } as DegreeRequirementAudit,
    {
      ...csProgramRequirements[5], // University Seminar
      status: 'not_fulfilled',
      fulfilledCourses: [],
      progressCredits: 0,
      progressCourses: 0,
    } as DegreeRequirementAudit
  ],
  summaryNotes: [
    `Overall progress: ${Math.round((mockStudent.totalCredits / (mockPrograms[0].totalCreditsRequired || 120)) * 100)}%`,
    "Core CS requirements partially met.",
    "Humanities requirement fulfilled.",
    "Advanced CS electives and Science elective need attention."
  ]
};

export const mockMultiYearPlan: MultiYearPlan = {
  id: "plan123",
  studentId: mockStudent.id,
  degreeId: mockPrograms[0].id, // Link to the BS CS program ID
  planName: "My CS Graduation Plan",
  plannedCourses: [
    { courseId: "CS201", termId: "fall2024" }, // Assuming CS201 is a valid course code
    { courseId: "CS301", termId: "spring2025" },
    { courseId: "MATH201", termId: "fall2024" }, // Assuming MATH201 is a valid course code
    { courseId: "CS310", termId: "fall2024" },
    { courseId: "CS410", termId: "spring2025" }, // Advanced elective
    { courseId: "phys210", termId: "spring2025" }, // Science elective
    { courseId: "univ100", termId: "fall2024" },
  ]
};

export const mockExportedSchedule: ExportedSchedule = {
  version: "1.0",
  name: mockSchedules[0].name, // "Balanced Schedule - Morning Classes"
  termId: mockSchedules[0].termId, // "fall2023" - Note: mockTerms might need a "fall2023" or adjust this
  exportedSections: mockSchedules[0].sections.map(section => ({
    courseId: section.id.split("-")[0], // e.g., "cs101"
    sectionId: section.id, // e.g., "cs101-001"
  })),
  totalCredits: mockSchedules[0].totalCredits, // 9
};

// Ensure mockStudent has relevant completed courses for the audit
mockStudent.completedCourses = ["CS101", "MATH105", "ENG234", "ENG101", "AH101"]; // ENG101 for prereq of eng234, AH101 for minor
