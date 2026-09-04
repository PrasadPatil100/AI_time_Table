/**
 * Automatic Timetable Generator - Core Application Script
 */

document.addEventListener('DOMContentLoaded', () => {
  const path = window.location.pathname;
  const isLoginPage = path.endsWith('login.html');
  const isPublicPage = path.endsWith('index.html') || path.endsWith('register.html') || path.endsWith('forgotpass.html');
  const isLoggedIn = localStorage.getItem('timetable_logged_in') === 'true';

  if (!isLoginPage && !isPublicPage && !isLoggedIn) {
    window.location.href = 'login.html';
    return;
  }

  if (!isLoginPage && !isPublicPage) {
    initDashboard();
  }

  if (isPublicPage && isLoggedIn && !path.endsWith('login.html')) {
    // Optional: redirect logged-in users away from public pages to dashboard
    // window.location.href = 'dashboard.html';
  }

  initLandingPage();
});

function initLandingPage() {
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const mobileDrawer = document.getElementById('mobile-nav-drawer');

  if (mobileMenuBtn && mobileDrawer) {
    mobileMenuBtn.addEventListener('click', () => {
      const isOpen = mobileDrawer.classList.contains('active');
      if (isOpen) {
        mobileDrawer.classList.remove('active');
        mobileMenuBtn.innerHTML = '<i class="ri-menu-3-line"></i>';
      } else {
        mobileDrawer.classList.add('active');
        mobileMenuBtn.innerHTML = '<i class="ri-close-line"></i>';
      }
    });

    // Close mobile drawer when a link is clicked
    const mobileLinks = mobileDrawer.querySelectorAll('.mobile-link');
    mobileLinks.forEach(link => {
      link.addEventListener('click', () => {
        mobileDrawer.classList.remove('active');
        mobileMenuBtn.innerHTML = '<i class="ri-menu-3-line"></i>';
      });
    });
  }

  updateLandingAuthUI();
}

function updateLandingAuthUI() {
  const isLoggedIn = localStorage.getItem('timetable_logged_in') === 'true';

  const navLogin = document.getElementById('nav-login-btn');
  const navRegister = document.getElementById('nav-register-btn');
  const navLogout = document.getElementById('nav-logout-btn');
  const heroGetStarted = document.getElementById('hero-get-started');
  const heroLogin = document.getElementById('hero-login-btn');
  const ctaGetStarted = document.getElementById('cta-get-started');
  const ctaLogin = document.getElementById('cta-login-btn');
  const mobileLogin = document.getElementById('mobile-login-btn');
  const mobileRegister = document.getElementById('mobile-register-btn');
  const mobileLogout = document.getElementById('mobile-logout-btn');

  if (isLoggedIn) {
    if (navLogin) navLogin.style.display = 'none';
    if (navRegister) navRegister.style.display = 'none';
    if (navLogout) navLogout.style.display = 'inline-flex';
    if (heroGetStarted) heroGetStarted.style.display = 'none';
    if (heroLogin) heroLogin.style.display = 'none';
    if (ctaGetStarted) ctaGetStarted.style.display = 'none';
    if (ctaLogin) ctaLogin.style.display = 'none';
    if (mobileLogin) mobileLogin.style.display = 'none';
    if (mobileRegister) mobileRegister.style.display = 'none';
    if (mobileLogout) mobileLogout.style.display = 'flex';

    if (navLogout) {
      navLogout.onclick = () => {
        localStorage.removeItem('timetable_logged_in');
        localStorage.removeItem('timetable_role');
        window.location.href = 'index.html';
      };
    }
    if (mobileLogout) {
      mobileLogout.onclick = () => {
        localStorage.removeItem('timetable_logged_in');
        localStorage.removeItem('timetable_role');
        window.location.href = 'index.html';
      };
    }
  } else {
    if (navLogin) navLogin.style.display = 'inline-flex';
    if (navRegister) navRegister.style.display = 'inline-flex';
    if (navLogout) navLogout.style.display = 'none';
    if (heroGetStarted) heroGetStarted.style.display = 'inline-flex';
    if (heroLogin) heroLogin.style.display = 'inline-flex';
    if (ctaGetStarted) ctaGetStarted.style.display = 'inline-flex';
    if (ctaLogin) ctaLogin.style.display = 'inline-flex';
    if (mobileLogin) mobileLogin.style.display = 'flex';
    if (mobileRegister) mobileRegister.style.display = 'flex';
    if (mobileLogout) mobileLogout.style.display = 'none';
  }
}

// Sample presets for quick demoing
const SAMPLE_DATA = {
  className: '10-A',
  numStudents: 42,
  numClassrooms: 6,
  periodDuration: 45,
  startTime: '09:00',
  endTime: '16:00',
  lunchStart: '12:45',
  lunchDuration: 45,
  workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  subjects: [
    { name: 'Mathematics', teacher: 'Dr. Alan Turing' },
    { name: 'Physics', teacher: 'Prof. Albert Einstein' },
    { name: 'Chemistry', teacher: 'Dr. Marie Curie' },
    { name: 'English Literature', teacher: 'Ms. Emily Bronte' },
    { name: 'Computer Science', teacher: 'Grace Hopper' },
    { name: 'History & Civics', teacher: 'Mr. Herodotus' },
    { name: 'Biology', teacher: 'Dr. Charles Darwin' },
    { name: 'Physical Education', teacher: 'Coach Jack' }
  ]
};

function initDashboard() {
  const logoutBtn = document.getElementById('logout-btn');
  const addSubjectBtn = document.getElementById('add-subject-btn');
  const saveBtn = document.getElementById('save-btn');
  const generateBtn = document.getElementById('generate-btn');
  const regenerateBtn = document.getElementById('regenerate-btn');
  const printBtn = document.getElementById('print-btn');
  const loadSampleBtn = document.getElementById('load-sample-btn');

  // Logout Handler
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      localStorage.removeItem('timetable_logged_in');
      window.location.href = 'login.html';
    });
  }

  // Add Subject Row Button
  if (addSubjectBtn) {
    addSubjectBtn.addEventListener('click', () => {
      addSubjectRow();
    });
  }

  // Save Details Button
  if (saveBtn) {
    saveBtn.addEventListener('click', () => {
      const data = collectFormData();
      if (data) {
        saveConfigToStorage(data);
        showToast('Configuration details saved to localStorage!');
      }
    });
  }

  // Generate Timetable Button
  if (generateBtn) {
    generateBtn.addEventListener('click', () => {
      const data = collectFormData();
      if (!data) return;
      
      saveConfigToStorage(data);
      const timetable = generateTimetableEngine(data);
      renderTimetableUI(timetable, data);
      
      // Smooth scroll to timetable display
      const timetableSection = document.getElementById('timetable-section');
      timetableSection.style.display = 'block';
      timetableSection.scrollIntoView({ behavior: 'smooth' });
      
      showToast('Timetable successfully generated!');
    });
  }

  // Regenerate Button
  if (regenerateBtn) {
    regenerateBtn.addEventListener('click', () => {
      const data = collectFormData();
      if (!data) return;

      const timetable = generateTimetableEngine(data, true); // true for randomized seed
      renderTimetableUI(timetable, data);
      showToast('New timetable arrangement generated!');
    });
  }

  // Print / Export Button
  if (printBtn) {
    printBtn.addEventListener('click', () => {
      const className = document.getElementById('class-name').value || '10-A';
      document.getElementById('print-meta-subtitle').textContent = `Class: ${className} | Academic Schedule`;
      window.print();
    });
  }

  // Load Sample Data Button
  if (loadSampleBtn) {
    loadSampleBtn.addEventListener('click', () => {
      populateForm(SAMPLE_DATA);
      showToast('Sample dataset loaded into form!');
    });
  }

  // Restore saved configuration or default sample data on load
  const savedConfig = localStorage.getItem('timetable_config');
  if (savedConfig) {
    try {
      populateForm(JSON.parse(savedConfig));
    } catch (e) {
      populateForm(SAMPLE_DATA);
    }
  } else {
    populateForm(SAMPLE_DATA);
  }

  // Check if a timetable was previously generated
  const savedGrid = localStorage.getItem('timetable_generated_grid');
  if (savedGrid) {
    try {
      const parsedGrid = JSON.parse(savedGrid);
      const config = collectFormData();
      if (config) {
        renderTimetableUI(parsedGrid, config);
        document.getElementById('timetable-section').style.display = 'block';
      }
    } catch (e) {
      console.error('Error rendering cached timetable grid', e);
    }
  }
}

// -------------------------------------------------------------
// 2. Form Helper Functions
// -------------------------------------------------------------

function addSubjectRow(name = '', teacher = '') {
  const tbody = document.getElementById('subject-list-body');
  const tr = document.createElement('tr');

  tr.innerHTML = `
    <td>
      <input type="text" class="form-control subject-name" placeholder="Subject (e.g. Mathematics)" value="${escapeHtml(name)}" required>
    </td>
    <td>
      <input type="text" class="form-control subject-teacher" placeholder="Teacher (e.g. Dr. Turing)" value="${escapeHtml(teacher)}" required>
    </td>
    <td style="text-align: center;">
      <button type="button" class="btn btn-danger remove-row-btn" title="Remove row">
        <i class="ri-delete-bin-line"></i>
      </button>
    </td>
  `;

  tr.querySelector('.remove-row-btn').addEventListener('click', () => {
    if (tbody.children.length <= 1) {
      alert('You must maintain at least one subject row!');
      return;
    }
    tr.remove();
  });

  tbody.appendChild(tr);
}

function collectFormData() {
  const className = document.getElementById('class-name').value.trim();
  const numStudents = parseInt(document.getElementById('num-students').value, 10) || 40;
  const numClassrooms = parseInt(document.getElementById('num-classrooms').value, 10) || 5;
  const periodDuration = parseInt(document.getElementById('period-duration').value, 10) || 45;
  const startTime = document.getElementById('start-time').value;
  const endTime = document.getElementById('end-time').value;
  const lunchStart = document.getElementById('lunch-start').value;
  const lunchDuration = parseInt(document.getElementById('lunch-duration').value, 10) || 45;

  // Working Days
  const checkedDays = Array.from(document.querySelectorAll('input[name="working-days"]:checked')).map(cb => cb.value);

  if (checkedDays.length === 0) {
    alert('Please select at least one working day!');
    return null;
  }

  // Subjects
  const subjectRows = document.querySelectorAll('#subject-list-body tr');
  const subjects = [];

  subjectRows.forEach(row => {
    const nameInput = row.querySelector('.subject-name');
    const teacherInput = row.querySelector('.subject-teacher');
    
    if (nameInput && teacherInput) {
      const sName = nameInput.value.trim();
      const tName = teacherInput.value.trim();
      if (sName && tName) {
        subjects.push({ name: sName, teacher: tName });
      }
    }
  });

  if (subjects.length === 0) {
    alert('Please enter at least one valid subject with teacher name!');
    return null;
  }

  return {
    className,
    numStudents,
    numClassrooms,
    periodDuration,
    startTime,
    endTime,
    lunchStart,
    lunchDuration,
    workingDays: checkedDays,
    subjects
  };
}

function populateForm(data) {
  if (!data) return;

  document.getElementById('class-name').value = data.className || '10-A';
  document.getElementById('num-students').value = data.numStudents || 40;
  document.getElementById('num-classrooms').value = data.numClassrooms || 5;
  document.getElementById('period-duration').value = data.periodDuration || 45;
  document.getElementById('start-time').value = data.startTime || '09:00';
  document.getElementById('end-time').value = data.endTime || '17:00';
  document.getElementById('lunch-start').value = data.lunchStart || '13:00';
  document.getElementById('lunch-duration').value = data.lunchDuration || 45;

  // Checkboxes
  const dayCheckboxes = document.querySelectorAll('input[name="working-days"]');
  dayCheckboxes.forEach(cb => {
    cb.checked = data.workingDays ? data.workingDays.includes(cb.value) : true;
  });

  // Subjects
  const tbody = document.getElementById('subject-list-body');
  tbody.innerHTML = '';

  if (data.subjects && data.subjects.length > 0) {
    data.subjects.forEach(sub => addSubjectRow(sub.name, sub.teacher));
  } else {
    SAMPLE_DATA.subjects.forEach(sub => addSubjectRow(sub.name, sub.teacher));
  }
}

function saveConfigToStorage(data) {
  localStorage.setItem('timetable_config', JSON.stringify(data));
}

// -------------------------------------------------------------
// 3. Timetable Generation Engine (Slots Calculation & Grid Allocation)
// -------------------------------------------------------------

function timeToMinutes(timeStr) {
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
}

function minutesToFormattedTime(totalMins) {
  let hours = Math.floor(totalMins / 60);
  let mins = totalMins % 60;
  const ampm = hours >= 12 ? 'PM' : 'AM';
  
  hours = hours % 12;
  if (hours === 0) hours = 12;
  
  const formattedHours = String(hours).padStart(2, '0');
  const formattedMins = String(mins).padStart(2, '0');
  return `${formattedHours}:${formattedMins} ${ampm}`;
}

function calculateTimeSlots(config) {
  const startMins = timeToMinutes(config.startTime);
  const endMins = timeToMinutes(config.endTime);
  const lunchStartMins = timeToMinutes(config.lunchStart);
  const lunchEndMins = lunchStartMins + config.lunchDuration;
  const duration = config.periodDuration;

  const slots = [];
  let curr = startMins;
  let periodNum = 1;

  while (curr + duration <= endMins) {
    const slotStart = curr;
    const slotEnd = curr + duration;

    // Check if this slot overlaps with lunch break
    const isLunchOverlap = (slotStart < lunchEndMins && slotEnd > lunchStartMins);

    if (isLunchOverlap) {
      slots.push({
        isLunch: true,
        label: `${minutesToFormattedTime(lunchStartMins)} - ${minutesToFormattedTime(lunchEndMins)}`,
        title: 'LUNCH BREAK'
      });
      curr = lunchEndMins; // Resume periods after lunch break
    } else {
      slots.push({
        isLunch: false,
        periodNum: periodNum++,
        label: `${minutesToFormattedTime(slotStart)} - ${minutesToFormattedTime(slotEnd)}`
      });
      curr += duration;
    }
  }

  return slots;
}

function generateTimetableEngine(config, randomize = false) {
  const timeSlots = calculateTimeSlots(config);
  const days = config.workingDays;
  const subjects = config.subjects;
  const numClassrooms = config.numClassrooms || 1;

  // We will build a matrix structure:
  // grid[slotIndex][dayIndex] = { subject, teacher, room, isLunch }
  const grid = [];

  // Helper shuffle for subjects if randomize is requested
  let subjectPool = [...subjects];
  if (randomize) {
    subjectPool.sort(() => Math.random() - 0.5);
  }

  // Pre-generate room numbers (e.g. Room 101, Room 102...)
  const rooms = Array.from({ length: numClassrooms }, (_, i) => `Room ${101 + i}`);

  // Track subject distribution to keep subjects evenly spread out across the week
  // For each day, we maintain a history of assigned subjects to prevent consecutive repeats
  const dayHistories = days.map(() => []);

  timeSlots.forEach((slot, slotIdx) => {
    const rowCells = [];

    if (slot.isLunch) {
      // Lunch break slot for all days
      days.forEach(() => {
        rowCells.push({
          isLunch: true,
          subjectName: 'LUNCH BREAK',
          teacherName: '',
          room: ''
        });
      });
    } else {
      // Non-lunch teaching period
      days.forEach((day, dayIdx) => {
        const dayHistory = dayHistories[dayIdx];

        // Pick a subject that was NOT taught in the immediately preceding slot of this day
        let candidateIndex = (slotIdx + dayIdx) % subjectPool.length;
        if (randomize) {
          candidateIndex = Math.floor(Math.random() * subjectPool.length);
        }

        let selectedSubject = subjectPool[candidateIndex];

        // Avoid consecutive repeat on the same day if possible
        if (dayHistory.length > 0) {
          const lastSubject = dayHistory[dayHistory.length - 1];
          if (lastSubject.name === selectedSubject.name && subjectPool.length > 1) {
            // Pick next candidate in loop
            candidateIndex = (candidateIndex + 1) % subjectPool.length;
            selectedSubject = subjectPool[candidateIndex];
          }
        }

        dayHistory.push(selectedSubject);

        // Assign room deterministically/fairly
        const assignedRoom = rooms[(slotIdx + dayIdx) % rooms.length];

        rowCells.push({
          isLunch: false,
          subjectName: selectedSubject.name,
          teacherName: selectedSubject.teacher,
          room: assignedRoom,
          themeIndex: candidateIndex % 8
        });
      });
    }

    grid.push({
      slotInfo: slot,
      cells: rowCells
    });
  });

  const resultData = {
    timeSlots,
    days,
    grid
  };

  localStorage.setItem('timetable_generated_grid', JSON.stringify(resultData));
  return resultData;
}

// -------------------------------------------------------------
// 4. UI Rendering Functions
// -------------------------------------------------------------

function renderTimetableUI(timetableData, config) {
  const { timeSlots, days, grid } = timetableData;

  // Title
  document.getElementById('timetable-card-title').innerHTML = `
    <i class="ri-grid-fill"></i> Generated Timetable - Class ${escapeHtml(config.className)}
  `;

  // Summary Chips Bar
  const nonLunchSlotsCount = timeSlots.filter(s => !s.isLunch).length;
  const summaryBar = document.getElementById('summary-bar');
  summaryBar.innerHTML = `
    <div class="chip"><i class="ri-team-line"></i> Class: <strong>${escapeHtml(config.className)} (${config.numStudents} Students)</strong></div>
    <div class="chip"><i class="ri-calendar-check-line"></i> Working Days: <strong>${days.length} Days/Week</strong></div>
    <div class="chip"><i class="ri-time-line"></i> Periods per Day: <strong>${nonLunchSlotsCount} Teaching Slots</strong></div>
    <div class="chip"><i class="ri-book-line"></i> Total Subjects: <strong>${config.subjects.length} Active Courses</strong></div>
  `;

  // Table Header
  const thead = document.getElementById('timetable-head');
  let headerHtml = '<tr><th class="time-col"><i class="ri-time-line"></i> Time Slot</th>';
  days.forEach(day => {
    headerHtml += `<th><i class="ri-calendar-event-line"></i> ${escapeHtml(day)}</th>`;
  });
  headerHtml += '</tr>';
  thead.innerHTML = headerHtml;

  // Table Body
  const tbody = document.getElementById('timetable-body');
  let bodyHtml = '';

  grid.forEach(row => {
    const slot = row.slotInfo;
    bodyHtml += '<tr>';
    
    // Time Column
    if (slot.isLunch) {
      bodyHtml += `<td class="time-col" style="background:#fffbeb; color:#92400e;"><strong>${slot.label}</strong><br><small>(Break)</small></td>`;
    } else {
      bodyHtml += `<td class="time-col"><strong>Period ${slot.periodNum}</strong><br><span style="font-size:0.75rem;">${slot.label}</span></td>`;
    }

    // Days Columns
    row.cells.forEach(cell => {
      if (cell.isLunch) {
        bodyHtml += `<td class="lunch-cell"><i class="ri-restaurant-line"></i> LUNCH BREAK</td>`;
      } else {
        bodyHtml += `
          <td>
            <div class="cell-content theme-${cell.themeIndex}">
              <div>
                <div class="cell-subject">${escapeHtml(cell.subjectName)}</div>
                <div class="cell-teacher"><i class="ri-user-follow-line"></i> ${escapeHtml(cell.teacherName)}</div>
              </div>
              <div class="cell-room"><i class="ri-building-line"></i> ${escapeHtml(cell.room)}</div>
            </div>
          </td>
        `;
      }
    });

    bodyHtml += '</tr>';
  });

  tbody.innerHTML = bodyHtml;
}

// Toast helper
function showToast(message) {
  const toast = document.getElementById('toast');
  const toastMsg = document.getElementById('toast-message');
  
  if (toast && toastMsg) {
    toastMsg.textContent = message;
    toast.classList.add('show');
    
    setTimeout(() => {
      toast.classList.remove('show');
    }, 3000);
  }
}

// XSS Prevention helper
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
