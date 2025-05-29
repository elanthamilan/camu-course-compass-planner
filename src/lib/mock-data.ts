
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
  DegreeRequirementAudit
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
        location: "North Campus",
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
  major: "Computer Science",
  minor: "Mathematics",
  academicLevel: "Junior",
  totalCredits: 62,
  requiredCredits: 120,
  completedCourses: ["cs101", "math101", "eng101"],
  advisorName: "Dr. Academic Advisor"
};

export const mockDegreeRequirements: DegreeRequirement[] = [
  {
    id: "core_cs",
    name: "Computer Science Core",
    description: "Fundamental courses for Computer Science.",
    requiredCredits: 22,
    courses: ["cs101", "CS201", "CS301", "CS310"], // Added more specific courses
    completed: false,
    progress: 0.25,
    category: "core",
  },
  {
    id: "core_math",
    name: "Mathematics Core",
    description: "Core mathematics courses required for CS.",
    requiredCredits: 8,
    courses: ["math105", "MATH201"], // MATH201 would be Calculus I
    completed: false,
    progress: 0.5,
    category: "core",
  },
  {
    id: "major_adv_cs",
    name: "Advanced CS Electives",
    description: "Choose 3 advanced Computer Science electives.",
    requiredCredits: 9, // Assuming 3 courses * 3 credits each
    courses: ["CS410", "CS450", "CS490", "CS420", "CS430"], // Hypothetical advanced courses
    completed: false,
    progress: 0,
    category: "major",
    choiceRequired: 3,
  },
  {
    id: "gen_ed_hum",
    name: "Humanities Elective",
    description: "Choose 1 course from Humanities list.",
    requiredCredits: 3,
    courses: ["eng234", "phil101", "HIST101", "ART100"], // Added more options
    completed: true,
    progress: 1,
    category: "general_education",
    choiceRequired: 1,
  },
  {
    id: "gen_ed_sci",
    name: "Science Elective",
    description: "Choose 1 lab science course.",
    requiredCredits: 4,
    courses: ["phys210", "bio101", "chem101"],
    completed: false,
    progress: 0,
    category: "general_education",
    choiceRequired: 1,
  },
  {
    id: "univ_req",
    name: "University Seminar",
    description: "Required university seminar.",
    requiredCredits: 1,
    courses: ["univ100"],
    completed: false,
    progress: 0,
    category: "other",
  }
];

export const mockDegree: Degree = {
  id: "cs-bs",
  name: "Bachelor of Science in Computer Science",
  totalCredits: 120,
  requirements: mockDegreeRequirements
};

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
  degreeId: mockDegree.id,
  overallProgress: mockStudent.totalCredits / mockDegree.totalCredits,
  totalCreditsEarned: mockStudent.totalCredits,
  totalCreditsRequired: mockDegree.totalCredits,
  requirementAudits: [
    {
      ...mockDegreeRequirements[0], // Core CS
      status: 'partially_fulfilled',
      fulfilledCourses: ['cs101'],
      progressCredits: 3,
      progressCourses: 1,
    },
    {
      ...mockDegreeRequirements[1], // Core Math
      status: 'partially_fulfilled',
      fulfilledCourses: ['math105'], // Assuming math101 is an alias or completed
      progressCredits: 3,
      progressCourses: 1,

    },
    {
      ...mockDegreeRequirements[2], // Advanced CS Electives
      status: 'not_fulfilled',
      fulfilledCourses: [],
      progressCredits: 0,
      progressCourses: 0,
    },
    {
      ...mockDegreeRequirements[3], // Humanities Elective
      status: 'fulfilled',
      fulfilledCourses: ['eng234'], // From mockStudent.completedCourses
      progressCredits: 3,
      progressCourses: 1,
    },
     {
      ...mockDegreeRequirements[4], // Science Elective
      status: 'not_fulfilled',
      fulfilledCourses: [],
      progressCredits: 0,
      progressCourses: 0,
    },
    {
      ...mockDegreeRequirements[5], // University Seminar
      status: 'not_fulfilled',
      fulfilledCourses: [],
      progressCredits: 0,
      progressCourses: 0,
    }
  ],
  summaryNotes: [
    `Overall progress: ${Math.round((mockStudent.totalCredits / mockDegree.totalCredits) * 100)}%`,
    "Core CS requirements partially met.",
    "Humanities requirement fulfilled.",
    "Advanced CS electives and Science elective need attention."
  ]
};

export const mockMultiYearPlan: MultiYearPlan = {
  id: "plan123",
  studentId: mockStudent.id,
  degreeId: mockDegree.id,
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
mockStudent.completedCourses = ["cs101", "math105", "eng234", "ENG101"]; // ENG101 for prereq of eng234
