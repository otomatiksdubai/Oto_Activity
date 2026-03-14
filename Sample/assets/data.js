// Demo users (for UI testing only)
const DEMO_USERS = [
  { email: "admin", pass: "Oto@2026", role: "admin", name: "Admin" },
  { email: "staff@demo.com", pass: "123456", role: "staff", name: "Staff" },
  { email: "trainer@demo.com", pass: "123456", role: "trainer", name: "Trainer Ali" },
  { email: "parent@demo.com", pass: "123456", role: "parent", name: "Parent Noor" },
];

// Demo students (parent has 2 students)
const DEMO_STUDENTS = [
  { id: "S001", name: "Ahmed", grade: "G4", schoolName: "Dubai International School", parentEmail: "parent@demo.com", parentPhone: "0501234567" },
  { id: "S002", name: "Aisha", grade: "G2", schoolName: "Dubai International School", parentEmail: "parent@demo.com", parentPhone: "0501234567" },
  { id: "S003", name: "Hassan", grade: "G6", schoolName: "Abu Dhabi Academy", parentEmail: "", parentPhone: "0509876543" },
];

// Demo sessions (timetable)
const DEMO_SESSIONS = [
  { id: "SE001", program: "Robotics Basics", date: "2026-01-12", start: "16:00", end: "17:00", room: "Lab 1", trainer: "trainer@demo.com", students: ["S001", "S002"] },
  { id: "SE002", program: "Arduino Level 1", date: "2026-01-13", start: "17:00", end: "18:00", room: "Lab 2", trainer: "trainer@demo.com", students: ["S003"] },
];

// Demo fees (invoices)
const DEMO_FEES = [
  { id: "INV001", studentId: "S001", title: "Robotics Monthly", amount: 300, currency: "AED", status: "unpaid", due: "2026-01-31" },
  { id: "INV002", studentId: "S002", title: "Robotics Monthly", amount: 300, currency: "AED", status: "partial", due: "2026-01-31" },
  { id: "INV003", studentId: "S003", title: "Arduino Monthly", amount: 250, currency: "AED", status: "paid", due: "2026-01-31" },
];
