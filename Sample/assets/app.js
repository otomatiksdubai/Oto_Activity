// storage keys
const KEY_AUTH = "inst_auth";
const KEY_DB = "inst_db_v1";

// Global lock state for delete operations
let isDeleteUnlocked = false;
const DELETE_PASSWORD = "Password";

function $(id) { return document.getElementById(id); }

function formatDate(d) {
  if (!d) return "-";
  let s = String(d);
  if (s.includes("T")) s = s.split("T")[0];
  const p = s.split("-");
  if (p.length === 3) return `${p[2]}-${p[1]}-${p[0]}`;
  return s;
}

function loadDB() {
  const raw = localStorage.getItem(KEY_DB);
  if (raw) return JSON.parse(raw);

  // first time seed
  const db = {
    users: DEMO_USERS,
    students: DEMO_STUDENTS,
    sessions: DEMO_SESSIONS,
    fees: DEMO_FEES,
    attendance: [] // {sessionId, studentId, status, notes, markedAt}
  };
  localStorage.setItem(KEY_DB, JSON.stringify(db));
  return db;
}
function saveDB(db) { localStorage.setItem(KEY_DB, JSON.stringify(db)); }

function getAuth() {
  const raw = localStorage.getItem(KEY_AUTH);
  return raw ? JSON.parse(raw) : null;
}
function setAuth(auth) { localStorage.setItem(KEY_AUTH, JSON.stringify(auth)); }
function logout() { localStorage.removeItem(KEY_AUTH); window.location = "index.html"; }

function requireAuth() {
  const auth = getAuth();
  if (!auth) window.location = "index.html";
  return auth;
}

function navItemsByRole(role) {
  const base = [{ href: "dashboard.html", label: "Dashboard" }];
  if (role === "admin") {
    return base.concat([
      { href: "students.html", label: "Students" },
      { href: "staff.html", label: "Staff Management" },
      { href: "sessions.html", label: "Sessions / Timetable" },
      { href: "attendance.html", label: "Attendance" },
      { href: "fees.html", label: "Fees" },
    ]);
  }
  if (role === "staff") {
    return base.concat([
      { href: "students.html", label: "Students" },
      { href: "staff.html", label: "Staff Management" },
      { href: "sessions.html", label: "Sessions / Timetable" },
      { href: "attendance.html", label: "Attendance" },
      { href: "fees.html", label: "Fees" },
    ]);
  }
  if (role === "trainer") {
    return base.concat([
      { href: "sessions.html", label: "My Sessions" },
      { href: "attendance.html", label: "Mark Attendance" },
    ]);
  }
  // parent
  return base.concat([
    { href: "students.html", label: "My Children" },
    { href: "fees.html", label: "Fees" },
  ]);
}

function renderLayout(activeHref) {
  const auth = requireAuth();
  const items = navItemsByRole(auth.role);

  // header
  if ($("who")) {
    $("who").textContent = `${auth.name} • ${auth.role.toUpperCase()}`;
  }

  // sidebar
  if ($("nav")) {
    $("nav").innerHTML = items.map(i => {
      const cls = i.href === activeHref ? "active" : "";
      return `<a class="${cls}" href="${i.href}">${i.label}<span class="badge">${auth.role}</span></a>`;
    }).join("");
  }

  if ($("logoutBtn")) {
    $("logoutBtn").onclick = logout;
  }
}

// ---------------- LOGIN ----------------
async function doLogin() {
  const email = $("email").value.trim().toLowerCase();
  const pass = $("password").value;
  const db = loadDB();

  const u = db.users.find(x => x.email.toLowerCase() === email && x.pass === pass);
  if (!u) {
    $("msg").innerHTML = `<div class="error">Invalid login. Try admin / Oto@2026</div>`;
    return;
  }
  setAuth({ email: u.email, role: u.role, name: u.name });
  window.location = "dashboard.html";
}

// ---------------- DASHBOARD KPIs ----------------
function renderDashboard() {
  renderLayout("dashboard.html");
  const auth = getAuth();
  const db = loadDB();

  // Role filtering
  let students = db.students;
  let sessions = db.sessions;
  let fees = db.fees;

  if (auth.role === "parent") {
    // Parent username is the child's name
    students = students.filter(s => s.name.toLowerCase() === auth.email.toLowerCase());
    const ids = students.map(s => s.id);
    const names = students.map(s => s.name.toLowerCase());

    // Filter fees by student ID or name (for manual entries)
    fees = fees.filter(f => ids.includes(f.studentId) || names.includes(f.studentId.toLowerCase()));

    sessions = sessions.filter(se => se.students.some(id => ids.includes(id)));
  }
  if (auth.role === "trainer") {
    sessions = sessions.filter(se => se.trainer === auth.email);
  }

  const unpaid = fees.filter(f => f.status === "unpaid").length;
  const partial = fees.filter(f => f.status === "partial").length;

  $("kStudents").textContent = students.length;
  $("kSessions").textContent = sessions.length;
  $("kUnpaid").textContent = unpaid;
  $("kPartial").textContent = partial;

  if (auth.role === "parent") {
    $("parentView").style.display = "block";
    const kids = db.students.filter(s => s.name.toLowerCase() === auth.email.toLowerCase()).map(s => s.name.toLowerCase());

    // Calculate hours for the child's sessions
    const childSessions = db.sessions.filter(se =>
      se.studentName && kids.includes(se.studentName.toLowerCase())
    );

    let totalHours = 0;
    let usedHours = 0;

    childSessions.forEach(se => {
      const sessionTotal = parseFloat(se.totalHours) || 0;
      totalHours += sessionTotal;

      if (sessionTotal > 0) {
        const sessionDuration = se.duration === "2 Hours" ? 2 : 1;
        const attendedCount = db.attendance.filter(a =>
          a.sessionId === se.id && a.status === 'present'
        ).length;
        usedHours += attendedCount * sessionDuration;
      }
    });

    const remainingHours = totalHours - usedHours;

    // Update KPI boxes
    $("pTotalHours").textContent = totalHours;
    $("pUsedHours").textContent = usedHours;
    $("pRemainingHours").textContent = remainingHours;

    // Highlight remaining hours if low
    const remainingBox = document.getElementById("remainingBox");
    if (remainingHours <= 2 && remainingHours > 0) {
      remainingBox.style.borderColor = "#ff5b5b";
      remainingBox.style.background = "rgba(255, 91, 91, 0.1)";
      $("pRemainingHours").style.color = "#ff5b5b";
    }

    // Get all attendance records for these kids
    const history = db.attendance.filter(a => kids.includes(a.studentName.toLowerCase()))
      .sort((a, b) => b.markedAt - a.markedAt);

    const rows = history.map(a => {
      const se = db.sessions.find(s => s.id === a.sessionId) || {};
      return `
        <tr>
          <td>${a.studentName}</td>
          <td>${se.program || "Session"}</td>
          <td>${a.status === 'present' ? '<span class="badge green">Present</span>' : (a.status === 'absent' ? '<span class="badge red">Absent</span>' : '-')}</td>
          <td>${a.notes || "-"}</td>
          <td>${new Date(a.markedAt).toLocaleString()}</td>
        </tr>
      `;
    }).join("");
    $("dashAttendance").innerHTML = rows || `<tr><td colspan="5" class="muted">No attendance history yet.</td></tr>`;
  }

  $("hint").innerHTML = `<div class="notice">
    ✅ UI is running with local dummy data. Later we will connect this to MongoDB/Node API.
  </div>`;
}

// ---------------- STUDENTS ----------------
function renderStudents() {
  renderLayout("students.html");
  const auth = getAuth();
  const db = loadDB();

  let list = db.students;
  if (auth.role === "parent") {
    list = list.filter(s => s.name.toLowerCase() === auth.email.toLowerCase());
    $("studentForm").style.display = "none"; // parents can't add students
  } else if (auth.role === "trainer") {
    $("studentForm").style.display = "none";
  }

  const rows = list.map(s => `
    <tr>
      <td>${s.name}</td>
      <td>${s.grade || "-"}</td>
      <td>${s.schoolName || "-"}</td>
      <td>${s.courseEnrolled || "-"}</td>
      <td>${s.parentPhone || "-"}</td>
      <td style="display:flex;gap:4px;align-items:center;">
        <button class="btn ghost" onclick="viewStudent('${s.id}')" style="padding:6px 10px;">View</button>
        ${(auth.role === "admin" || auth.role === "staff") ? `<button class="btn danger" onclick="deleteStudent('${s.id}')" style="padding:6px 10px;" ${!isDeleteUnlocked ? 'disabled' : ''}>Delete</button>` : ""}
      </td>
    </tr>
  `).join("");

  $("studentsTable").innerHTML = rows || `<tr><td colspan="6" class="muted">No students</td></tr>`;

  // Update lock button if it exists
  updateLockButton();
}

function addStudent() {
  const db = loadDB();
  const id = "STU" + Date.now(); // Internal ID
  const name = $("sname").value.trim();
  const grade = $("sgrade").value.trim();
  const schoolName = $("sschool").value.trim();
  const phone = $("sphone").value.trim();
  const courseEnrolled = $("scourse").value.trim();

  if (!name || !phone) { $("sMsg").innerHTML = `<div class="error">Name and Parent Phone required</div>`; return; }

  // 1. Create student record
  db.students.unshift({ id, name, grade, schoolName, courseEnrolled, parentPhone: phone });

  // 2. Automatically create parent portal user
  // Username = Student Name, Password = Phone Number
  if (!db.users.some(u => u.email.toLowerCase() === name.toLowerCase())) {
    db.users.push({
      email: name,
      pass: phone,
      role: "parent",
      name: "Parent of " + name
    });
  }

  saveDB(db);
  $("sMsg").innerHTML = `<div class="notice">✅ Student added. Parent Login: ${name} / ${phone}</div>`;
  $("sname").value = $("sgrade").value = $("sschool").value = $("sphone").value = $("scourse").value = "";
  renderStudents();
}

function deleteStudent(id) {
  if (!isDeleteUnlocked) {
    alert("Please unlock delete functionality first using the lock button.");
    return;
  }

  if (!confirm(`Are you sure you want to delete this student?`)) return;

  const db = loadDB();
  const student = db.students.find(s => s.id === id);
  if (student) {
    // Remove associated user account
    db.users = db.users.filter(u => u.email.toLowerCase() !== student.name.toLowerCase());
  }
  db.students = db.students.filter(s => s.id !== id);
  // also remove from sessions and fees
  db.sessions.forEach(se => {
    if (se.students) se.students = se.students.filter(x => x !== id);
    if (se.studentName === student.name) se.studentName = "";
  });
  db.fees = db.fees.filter(f => f.studentId !== id);
  saveDB(db);
  renderStudents();
}

// Student Modal Functions
let currentStudentId = null;

function viewStudent(id) {
  const auth = getAuth();
  const db = loadDB();
  const student = db.students.find(s => s.id === id);

  if (!student) return;

  currentStudentId = id;

  // Populate modal fields
  $("viewName").value = student.name || "";
  $("viewGrade").value = student.grade || "";
  $("viewSchool").value = student.schoolName || "";
  $("viewCourse").value = student.courseEnrolled || "";
  $("viewPhone").value = student.parentPhone || "";
  $("viewUsername").value = student.name || "";
  $("viewPassword").value = student.parentPhone || "";

  // Show/hide edit button based on role
  if (auth.role === "admin" || auth.role === "staff") {
    $("editBtn").style.display = "inline-block";
  } else {
    $("editBtn").style.display = "none";
  }

  // Reset to view mode
  $("saveBtn").style.display = "none";
  setFieldsReadonly(true);

  // Show modal
  $("studentModal").style.display = "flex";
}

function closeStudentModal() {
  $("studentModal").style.display = "none";
  currentStudentId = null;
  setFieldsReadonly(true);
  $("editBtn").style.display = "none";
  $("saveBtn").style.display = "none";
}

function enableEdit() {
  setFieldsReadonly(false);
  $("editBtn").style.display = "none";
  $("saveBtn").style.display = "inline-block";
}

function setFieldsReadonly(readonly) {
  $("viewName").readOnly = readonly;
  $("viewGrade").readOnly = readonly;
  $("viewSchool").readOnly = readonly;
  $("viewPhone").readOnly = readonly;

  if (readonly) {
    $("viewName").style.background = "#f8f9fa";
    $("viewGrade").style.background = "#f8f9fa";
    $("viewSchool").style.background = "#f8f9fa";
    $("viewPhone").style.background = "#f8f9fa";
  } else {
    $("viewName").style.background = "#ffffff";
    $("viewGrade").style.background = "#ffffff";
    $("viewSchool").style.background = "#ffffff";
    $("viewPhone").style.background = "#ffffff";
  }
}

function saveStudent() {
  if (!currentStudentId) return;

  const db = loadDB();
  const studentIndex = db.students.findIndex(s => s.id === currentStudentId);

  if (studentIndex === -1) return;

  const oldStudent = db.students[studentIndex];
  const oldName = oldStudent.name;

  // Get updated values
  const newName = $("viewName").value.trim();
  const newGrade = $("viewGrade").value.trim();
  const newSchool = $("viewSchool").value.trim();
  const newPhone = $("viewPhone").value.trim();

  if (!newName || !newPhone) {
    alert("Name and Parent Phone are required");
    return;
  }

  // Update student record
  db.students[studentIndex] = {
    ...oldStudent,
    name: newName,
    grade: newGrade,
    schoolName: newSchool,
    parentPhone: newPhone
  };

  // Update parent user account if name or password changed
  const userIndex = db.users.findIndex(u => u.email.toLowerCase() === oldName.toLowerCase());
  if (userIndex !== -1) {
    db.users[userIndex] = {
      ...db.users[userIndex],
      email: newName,
      pass: newPhone,
      name: "Parent of " + newName
    };
  } else if (newName !== oldName) {
    // Create new parent account if it doesn't exist
    db.users.push({
      email: newName,
      pass: newPhone,
      role: "parent",
      name: "Parent of " + newName
    });
  }

  // Update username and password display
  $("viewUsername").value = newName;
  $("viewPassword").value = newPhone;

  saveDB(db);

  // Reset to view mode
  setFieldsReadonly(true);
  $("editBtn").style.display = "inline-block";
  $("saveBtn").style.display = "none";

  renderStudents();

  alert("Student details updated successfully!");
}

// ---------------- SESSIONS ----------------
function renderSessions() {
  renderLayout("sessions.html");
  const auth = getAuth();
  const db = loadDB();

  let sessions = db.sessions;

  if (auth.role === "trainer") {
    sessions = sessions.filter(se => se.trainer === auth.email);
    $("sessionForm").style.display = "none"; // trainer can't create in this simple UI
  }
  if (auth.role === "parent") {
    $("sessionForm").style.display = "none";
  }

  // Populate Trainer Dropdown
  if ($("seTrainer")) {
    const trainers = db.users.filter(u => u.role === "trainer" || u.role === "admin" || u.role === "staff");
    $("seTrainer").innerHTML = trainers.map(t => `<option value="${t.email}">${t.name}</option>`).join("");
  }

  // Populate Student Dropdown
  if ($("seStudentName")) {
    $("seStudentName").innerHTML = db.students.map(s => `<option value="${s.name}">${s.name}</option>`).join("");
  }

  const canDelete = auth.role === "admin" || auth.role === "staff";

  const rows = sessions.map(se => {
    // Calculate remaining hours based on attendance
    const totalHours = parseFloat(se.totalHours) || 0;
    const sessionDuration = se.duration === "2 Hours" ? 2 : 1;

    // Count attended sessions for this student
    const attendedCount = db.attendance.filter(a =>
      a.sessionId === se.id && a.status === 'present'
    ).length;

    const usedHours = attendedCount * sessionDuration;
    const remainingHours = totalHours - usedHours;

    return `
    <tr>
      <td>${se.studentName || (se.students ? se.students[0] : "-")}</td>
      <td>${se.program}</td>
      <td>${se.day || "-"}</td>
      <td>${se.time || (se.start ? se.start + " - " + se.end : "-")}</td>
      <td>${se.duration || "1 Hour"}</td>
      <td>${totalHours > 0 ? totalHours : "-"}</td>
      <td style="${remainingHours <= 2 && remainingHours > 0 ? 'color: #ff5b5b; font-weight: 700;' : ''}">${totalHours > 0 ? remainingHours : "-"}</td>
      <td>${se.room || "-"}</td>
      <td>${se.trainer}</td>
      <td>
        ${canDelete ? `<button class="btn danger" onclick="deleteSession('${se.id}')" style="padding:6px 10px;" title="Delete"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg></button>` : "-"}
      </td>
    </tr>
  `;
  }).join("");

  $("sessionsTable").innerHTML = rows || `<tr><td colspan="10" class="muted">No sessions</td></tr>`;
}

function deleteSession(id) {
  if (!confirm("Delete session " + id + "?")) return;
  const db = loadDB();
  db.sessions = db.sessions.filter(se => se.id !== id);
  // also cleanup attendance records for this session
  db.attendance = db.attendance.filter(a => a.sessionId !== id);
  saveDB(db);
  renderSessions();
}

function addSession() {
  const db = loadDB();
  const studentName = $("seStudentName").value.trim();
  const program = $("seProgram").value.trim();
  const room = $("seRoom").value.trim();
  const day = $("seDay").value;
  const time = $("seTime").value;
  const duration = $("seDuration").value;
  const totalHours = $("seTotalHours").value.trim();
  const trainer = $("seTrainer").value;

  // Auto date and internal ID
  const date = new Date().toISOString().split('T')[0];
  const id = "SES" + Date.now();

  if (!studentName || !program || !trainer) {
    $("seMsg").innerHTML = `<div class="error">Fill required fields</div>`; return;
  }

  db.sessions.unshift({
    id,
    studentName,
    program,
    room,
    day,
    time,
    duration,
    totalHours: totalHours || "0",
    date,
    trainer,
    students: [studentName], // Keep array for compatibility
    notes: ""
  });
  saveDB(db);
  $("seMsg").innerHTML = `<div class="notice">✅ Session created for ${studentName}</div>`;
  $("seStudentName").value = $("seProgram").value = $("seRoom").value = $("seTotalHours").value = "";
  renderSessions();
}

// ---------------- ATTENDANCE ----------------
function renderAttendance() {
  renderLayout("attendance.html");
  const auth = getAuth();
  const db = loadDB();

  // sessions shown depend on role
  let sessions = db.sessions;
  if (auth.role === "trainer") sessions = sessions.filter(se => se.trainer === auth.email);
  if (auth.role === "parent") {
    const kids = db.students.filter(s => s.parentEmail === auth.email).map(s => s.id);
    sessions = sessions.filter(se => se.students.some(id => kids.includes(id)));
  }

  // populate session dropdown
  const opt = sessions.map(se => {
    const label = `${se.studentName || 'Group'} • ${se.day || ''} ${se.time || ''} • ${se.program}`;
    return `<option value="${se.id}">${label}</option>`;
  }).join("");
  $("attSession").innerHTML = opt || `<option value="">No sessions</option>`;

  if (auth.role === "parent") {
    $("markBox").style.display = "none"; // parent can't mark attendance
    // For parents, hide the session selector and show ALL history
    if ($("attSession").closest('.row')) $("attSession").closest('.row').style.display = "none";
    renderParentAttendanceHistory();
    return;
  }

  // render current selected
  renderAttendanceTable();
}

function renderParentAttendanceHistory() {
  const auth = getAuth();
  const db = loadDB();
  const kids = db.students.filter(s => s.parentEmail === auth.email).map(s => s.name.toLowerCase());

  const history = db.attendance.filter(a => kids.includes(a.studentName.toLowerCase()))
    .sort((a, b) => b.markedAt - a.markedAt);

  const rows = history.map(a => {
    const se = db.sessions.find(s => s.id === a.sessionId) || {};
    return `
      <tr>
        <td>${a.studentName}</td>
        <td>${a.status === 'present' ? '<span class="badge green">Present</span>' : (status === 'absent' ? '<span class="badge red">Absent</span>' : '-')}</td>
        <td>${a.notes || "-"}</td>
        <td>${new Date(a.markedAt).toLocaleString()}</td>
      </tr>
    `;
  }).join("");

  $("attTable").innerHTML = rows || `<tr><td colspan="4" class="muted">No attendance history yet.</td></tr>`;
}

function renderAttendanceTable() {
  const auth = getAuth();
  const db = loadDB();
  const sessionId = $("attSession").value;
  if (!sessionId) { $("attTable").innerHTML = `<tr><td colspan="5" class="muted">No session selected</td></tr>`; return; }

  const se = db.sessions.find(x => x.id === sessionId);
  if (!se) return;

  // Build the list of students to display for this session
  // In the new model, we have se.studentName. In the old model, we have se.students array.
  let studentEntries = [];
  if (se.studentName) {
    studentEntries.push({ id: se.id, name: se.studentName }); // Using session ID as placeholder student ID if missing
  } else if (se.students) {
    studentEntries = se.students.map(id => db.students.find(s => s.id === id)).filter(Boolean);
  }

  // Parent sees only their kids
  let view = studentEntries;
  if (auth.role === "parent") {
    // For legacy sessions only, or if we matched by studentName to a physical student
    const kids = db.students.filter(s => s.parentEmail === auth.email).map(s => s.name.toLowerCase());
    view = view.filter(s => kids.includes(s.name.toLowerCase()));
  }

  const rows = view.map(st => {
    // Match attendance by session ID and student identifier (Name or ID)
    const rec = db.attendance.find(a => a.sessionId === sessionId && (a.studentId === st.id || a.studentName === st.name));
    const status = rec ? rec.status : "-";
    const notes = rec ? rec.notes : "";
    return `
      <tr>
        <td>${st.name}</td>
        <td>${status === 'present' ? '<span class="badge green">Present</span>' : (status === 'absent' ? '<span class="badge red">Absent</span>' : '-')}</td>
        <td>${notes}</td>
        <td>${rec ? new Date(rec.markedAt).toLocaleString() : "-"}</td>
      </tr>
    `;
  }).join("");

  // Populate Attendance Student Dropdown
  if ($("attStudent")) {
    $("attStudent").innerHTML = view.map(v => `<option value="${v.name}">${v.name}</option>`).join("");
  }

  $("attTable").innerHTML = rows || `<tr><td colspan="4" class="muted">No students in this session</td></tr>`;
}

function markAttendance(status) {
  const auth = getAuth();
  const db = loadDB();
  const sessionId = $("attSession").value;
  const studentIdentifier = $("attStudent").value.trim();
  const notes = $("attNotes").value.trim();

  if (!sessionId || !studentIdentifier) {
    $("attMsg").innerHTML = `<div class="error">Select session and enter Student Name or ID</div>`; return;
  }
  const se = db.sessions.find(x => x.id === sessionId);
  if (!se) return;

  // Check if identifier matches session studentName or is in the students array
  const isMatch = (se.studentName && se.studentName.toLowerCase().includes(studentIdentifier.toLowerCase())) ||
    (se.students && se.students.includes(studentIdentifier));

  if (!isMatch) {
    $("attMsg").innerHTML = `<div class="error">Student not found in this session</div>`; return;
  }

  // upsert
  const idx = db.attendance.findIndex(a => a.sessionId === sessionId && (a.studentId === studentIdentifier || a.studentName === se.studentName));
  const rec = {
    sessionId,
    studentId: se.id.startsWith('SES') ? se.id : studentIdentifier, // Use internal ID for custom sessions
    studentName: se.studentName || studentIdentifier,
    status,
    notes,
    markedAt: Date.now(),
    markedBy: auth.email
  };

  if (idx >= 0) db.attendance[idx] = rec; else db.attendance.unshift(rec);

  saveDB(db);
  $("attMsg").innerHTML = `<div class="notice">✅ Marked ${se.studentName || studentIdentifier} as ${status}</div>`;
  $("attStudent").value = "";
  $("attNotes").value = "";
  renderAttendanceTable();
}

// ---------------- FEES ----------------
function renderFees() {
  renderLayout("fees.html");
  const auth = getAuth();
  const db = loadDB();

  let fees = db.fees;
  if (auth.role === "parent") {
    // Parent username is the child's name, so find all students with matching name
    const kids = db.students.filter(s => s.name.toLowerCase() === auth.email.toLowerCase());
    const kidIds = kids.map(s => s.id);
    const kidNames = kids.map(s => s.name.toLowerCase());

    // Filter fees by student ID or by student name (for manual entries)
    fees = fees.filter(f => {
      // Check if studentId matches a child's ID
      if (kidIds.includes(f.studentId)) return true;
      // Check if studentId is actually a name that matches
      if (kidNames.includes(f.studentId.toLowerCase())) return true;
      return false;
    });

    $("feeForm").style.display = "none"; // parent can't create invoices
  } else if (auth.role === "trainer") {
    $("feeForm").style.display = "none";
  }

  // Student Datalist removed

  const canDelete = auth.role === "admin" || auth.role === "staff";

  const rows = fees.map(f => {
    const discount = Number(f.discount) || 0;
    const price = Number(f.amount) || 0;
    const total = price - discount;
    const student = db.students.find(s => s.id === f.studentId);
    const studentName = student ? student.name : f.studentId;

    // Different button text for parents vs admin/staff
    const buttonText = auth.role === "parent" ? "View" : "Print";

    return `
    <tr>
      <td>${f.id}</td>
      <td>${studentName}</td>
      <td>${f.title}</td>
      <td>${price} ${f.currency}</td>
      <td>${discount}</td>
      <td>${total} ${f.currency}</td>
      <td><span class="badge ${f.status === 'paid' ? 'green' : (f.status === 'unpaid' ? 'red' : '')}">${f.status}</span></td>
      <td style="display:flex;gap:4px;align-items:center;">
        <button class="btn ghost" onclick="window.open('invoice.html?id=${encodeURIComponent(f.id)}','_blank','width=800,height=600,resizable=yes,scrollbars=yes');return false;" style="text-decoration:none;padding:6px 10px;">${buttonText}</button>
        ${canDelete ? `<button class="btn danger" onclick="deleteInvoice('${f.id}')" style="padding:6px 10px;" title="Delete"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg></button>` : ""}
      </td>
    </tr>
  `}).join("");

  $("feesTable").innerHTML = rows || `<tr><td colspan="7" class="muted">No invoices</td></tr>`;
}

function deleteInvoice(id) {
  if (!confirm("Delete invoice " + id + "?")) return;
  const db = loadDB();
  db.fees = db.fees.filter(f => f.id !== id);
  saveDB(db);
  renderFees();
  $("fMsg").innerHTML = `<div class="notice">🗑️ Invoice deleted</div>`;
}

function addInvoice() {
  const db = loadDB();

  // Sequential ID logic
  // Pattern: OTO26xxx (e.g. OTO26001)
  let maxId = 26000; // Base start for OTO26...
  if (db.fees && db.fees.length > 0) {
    db.fees.forEach(f => {
      const match = f.id.match(/^OTO(\d+)$/);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > maxId) maxId = num;
      }
    });
  }
  const nextNum = maxId + 1;
  const id = "OTO" + String(nextNum);

  const studentId = $("fStudent").value.trim();
  const title = $("fCourse").value;
  const amount = Number($("fAmount").value);
  const discount = Number($("fDiscount").value) || 0;
  const status = $("fStatus").value;
  // Removed due date logic as per request

  if (!studentId || !amount) {
    $("fMsg").innerHTML = `<div class="error">Fill required fields</div>`; return;
  }

  // Removed student ID validation to allow manual name entry


  db.fees.unshift({ id, studentId, title, amount, discount, currency: "AED", status, createdAt: new Date().toISOString() });
  saveDB(db);
  $("fMsg").innerHTML = `<div class="notice">✅ Invoice created: ${id}</div>`;
  $("fStudent").value = $("fAmount").value = "";
  $("fDiscount").value = "0";
  renderFees();
}

function exportFees() {
  const db = loadDB();
  const fees = db.fees;
  const students = db.students;

  if (!fees || fees.length === 0) {
    alert("No data to export");
    return;
  }

  // CSV Header
  const headers = ["Invoice ID", "Student Name", "Course", "Amount", "Discount", "Total", "Currency", "Status", "Date"];

  // CSV Rows
  const rows = fees.map(f => {
    // resolve student name
    const student = students.find(s => s.id === f.studentId);
    const studentName = student ? student.name : f.studentId;

    // calculations
    const amt = Number(f.amount) || 0;
    const disc = Number(f.discount) || 0;
    const total = amt - disc;
    const date = f.createdAt ? formatDate(f.createdAt) : "-";

    // Escape commas in strings to avoid breaking CSV
    const safeName = `"${studentName.replace(/"/g, '""')}"`;
    const safeTitle = `"${f.title.replace(/"/g, '""')}"`;

    return [
      f.id,
      safeName,
      safeTitle,
      amt,
      disc,
      total,
      f.currency,
      f.status,
      date
    ].join(",");
  });

  const csvContent = [headers.join(","), ...rows].join("\n");

  // Create download link
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", "fees_export_" + formatDate(new Date()) + ".csv");
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// ---------------- INVOICE PRINT PAGE ----------------
// ---------------- INVOICE PRINT PAGE ----------------
function renderInvoicePage() {
  const auth = requireAuth();
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  if (!id) {
    document.getElementById("invoiceContent").innerHTML = `<div style="padding:24px">Invoice not found.</div>`;
    return;
  }
  const db = loadDB();
  const inv = db.fees.find(f => f.id === id);
  if (!inv) {
    document.getElementById("invoiceContent").innerHTML = `<div style="padding:24px">Invoice not found.</div>`;
    return;
  }
  const student = db.students.find(s => s.id === inv.studentId) || {};

  const currency = inv.currency || "AED";
  const fmt = (n) => `${currency} ${Number(n).toFixed(2)}`;
  const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };

  const issueDate = formatDate(inv.createdAt || new Date().toISOString());

  const price = Number(inv.amount) || 0;
  const discount = Number(inv.discount) || 0;
  const subtotal = price;
  const total = subtotal - discount;

  set("invoiceId", inv.id);
  set("invoiceDate", issueDate);

  set("billName", student.name || inv.studentId || "Student");
  set("billAddress", "");
  set("billEmail", student.parentEmail || "");
  set("invStatus", inv.status);
  set("invCurrency", currency);
  set("itemTitle", inv.title);
  set("itemDesc", `Invoice for ${inv.title}`);

  set("itemPrice", fmt(price));
  set("itemDiscount", fmt(discount));
  set("itemAmount", fmt(subtotal));

  set("subtotal", fmt(subtotal));
  set("discountAmount", fmt(discount));
  set("totalAmount", fmt(total));
  set("amountDue", fmt(total));
}

// ---------------- STAFF MANAGEMENT ----------------
function renderStaff() {
  renderLayout("staff.html");
  const auth = getAuth();
  const db = loadDB();

  // Only admin can access this page
  if (auth.role !== "admin") {
    window.location = "dashboard.html";
    return;
  }

  // Filter to show only staff, trainers, and admins (not parents)
  const staffList = db.users.filter(u => u.role === "admin" || u.role === "staff" || u.role === "trainer");

  const rows = staffList.map(s => `
    <tr>
      <td>${s.name}</td>
      <td>${s.email}</td>
      <td><span class="badge ${s.role === 'admin' ? 'green' : (s.role === 'trainer' ? '' : '')}">${s.role.toUpperCase()}</span></td>
      <td>${s.phone || "-"}</td>
      <td>${s.specialization || "-"}</td>
      <td style="display:flex;gap:4px;align-items:center;">
        <button class="btn ghost" onclick="viewStaffMember('${s.email}')" style="padding:6px 10px;">View</button>
        <button class="btn danger" onclick="deleteStaffMember('${s.email}')" style="padding:6px 10px;" ${!isDeleteUnlocked ? 'disabled' : ''}>Delete</button>
      </td>
    </tr>
  `).join("");

  $("staffTable").innerHTML = rows || `<tr><td colspan="6" class="muted">No staff members</td></tr>`;

  // Update lock button if it exists
  updateLockButton();
}

function addStaff() {
  const db = loadDB();
  const name = $("staffName").value.trim();
  const email = $("staffEmail").value.trim();
  const password = $("staffPassword").value.trim();
  const role = $("staffRole").value;
  const phone = $("staffPhone").value.trim();
  const specialization = $("staffSpecialization").value.trim();

  if (!name || !email || !password) {
    $("staffMsg").innerHTML = `<div class="error">Name, Email, and Password are required</div>`;
    return;
  }

  // Check if email already exists
  if (db.users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
    $("staffMsg").innerHTML = `<div class="error">Email already exists</div>`;
    return;
  }

  // Add new staff member
  db.users.push({
    email: email,
    pass: password,
    role: role,
    name: name,
    phone: phone,
    specialization: specialization
  });

  saveDB(db);
  $("staffMsg").innerHTML = `<div class="notice">✅ Staff member added successfully</div>`;
  $("staffName").value = $("staffEmail").value = $("staffPassword").value = $("staffPhone").value = $("staffSpecialization").value = "";
  renderStaff();
}

function deleteStaffMember(email) {
  if (!isDeleteUnlocked) {
    alert("Please unlock delete functionality first using the lock button.");
    return;
  }

  if (!confirm(`Are you sure you want to delete staff member ${email}?`)) return;

  const db = loadDB();
  db.users = db.users.filter(u => u.email !== email);
  saveDB(db);
  renderStaff();
}

let currentStaffEmail = null;

function viewStaffMember(email) {
  const db = loadDB();
  const staff = db.users.find(u => u.email === email);

  if (!staff) return;

  currentStaffEmail = email;

  // Populate modal fields
  $("viewStaffName").value = staff.name || "";
  $("viewStaffEmail").value = staff.email || "";
  $("viewStaffRole").value = staff.role ? staff.role.toUpperCase() : "";
  $("viewStaffPhone").value = staff.phone || "";
  $("viewStaffSpecialization").value = staff.specialization || "";

  // Show edit button
  $("editStaffBtn").style.display = "inline-block";
  $("saveStaffBtn").style.display = "none";

  // Set fields to readonly
  setStaffFieldsReadonly(true);

  // Show modal
  $("staffModal").style.display = "flex";
}

function closeStaffModal() {
  $("staffModal").style.display = "none";
  currentStaffEmail = null;
  setStaffFieldsReadonly(true);
  $("editStaffBtn").style.display = "none";
  $("saveStaffBtn").style.display = "none";
}

function enableStaffEdit() {
  setStaffFieldsReadonly(false);
  $("editStaffBtn").style.display = "none";
  $("saveStaffBtn").style.display = "inline-block";
}

function setStaffFieldsReadonly(readonly) {
  $("viewStaffName").readOnly = readonly;
  $("viewStaffPhone").readOnly = readonly;
  $("viewStaffSpecialization").readOnly = readonly;

  if (readonly) {
    $("viewStaffName").style.background = "#f8f9fa";
    $("viewStaffPhone").style.background = "#f8f9fa";
    $("viewStaffSpecialization").style.background = "#f8f9fa";
  } else {
    $("viewStaffName").style.background = "#ffffff";
    $("viewStaffPhone").style.background = "#ffffff";
    $("viewStaffSpecialization").style.background = "#ffffff";
  }
}

function saveStaff() {
  if (!currentStaffEmail) return;

  const db = loadDB();
  const staffIndex = db.users.findIndex(u => u.email === currentStaffEmail);

  if (staffIndex === -1) return;

  // Get updated values
  const newName = $("viewStaffName").value.trim();
  const newPhone = $("viewStaffPhone").value.trim();
  const newSpecialization = $("viewStaffSpecialization").value.trim();

  if (!newName) {
    alert("Name is required");
    return;
  }

  // Update staff record
  db.users[staffIndex] = {
    ...db.users[staffIndex],
    name: newName,
    phone: newPhone,
    specialization: newSpecialization
  };

  saveDB(db);

  // Reset to view mode
  setStaffFieldsReadonly(true);
  $("editStaffBtn").style.display = "inline-block";
  $("saveStaffBtn").style.display = "none";

  renderStaff();

  alert("Staff details updated successfully!");
}

// ---------------- LOCK/UNLOCK DELETE FUNCTIONALITY ----------------
function toggleDeleteLock() {
  const isStudentsPage = !!document.getElementById('studentsTable');
  const isStaffPage = !!document.getElementById('staffTable');

  if (isDeleteUnlocked) {
    // Lock it
    isDeleteUnlocked = false;
    updateLockButton();
    // Re-render to disable delete buttons
    if (isStudentsPage) renderStudents();
    else if (isStaffPage) renderStaff();
  } else {
    // Unlock with password
    // Use a small timeout to ensure prompt allows UI to update if needed
    setTimeout(() => {
      const password = prompt("Enter password to unlock delete functionality:");
      if (password === DELETE_PASSWORD) {
        isDeleteUnlocked = true;
        updateLockButton();
        // Re-render to enable delete buttons
        if (isStudentsPage) renderStudents();
        else if (isStaffPage) renderStaff();
        // Feedback
        // alert("Unlocked! You can now delete records.");
      } else if (password !== null) {
        alert("Incorrect password!");
      }
    }, 10);
  }
}

function updateLockButton() {
  const lockBtn = document.getElementById('lockBtn');
  if (lockBtn) {
    if (isDeleteUnlocked) {
      lockBtn.innerHTML = '🔓 Unlock Mode (Click to Lock)';
      lockBtn.className = 'btn danger';
    } else {
      lockBtn.innerHTML = '🔒 Locked (Click to Unlock Delete)';
      lockBtn.className = 'btn ghost';
    }
  }
}
