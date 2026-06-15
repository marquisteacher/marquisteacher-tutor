/* ============================================================
   MarquisTeacher AI Tutor — Dashboard Logic
   ============================================================ */

var API_URL = 'https://marquisteacher-backend.onrender.com';

// ── AUTH GUARD ────────────────────────────────────────────────
function getUser() {
  var token = localStorage.getItem('mt_token');
  var user  = localStorage.getItem('mt_user');
  if (!token || !user) {
    window.location.href = 'index.html';
    return null;
  }
  return JSON.parse(user);
}

function logout() {
  localStorage.removeItem('mt_token');
  localStorage.removeItem('mt_user');
  window.location.href = 'index.html';
}

// ── LEVEL COLORS ──────────────────────────────────────────────
var LEVEL_COLORS = {
  A1:'#2ab3c8', A2:'#27ae60', B1:'#f39c12',
  B2:'#e67e22', C1:'#e74c3c', C2:'#8e44ad'
};
var LEVEL_NAMES = {
  A1:'Beginner', A2:'Elementary', B1:'Intermediate',
  B2:'Upper-Intermediate', C1:'Advanced', C2:'Mastery'
};

// ── START SESSION ─────────────────────────────────────────────
function startSession() {
  window.location.href = 'tutor.html';
}

// ── GREETING ──────────────────────────────────────────────────
function getGreeting() {
  var h = new Date().getHours();
  if (h < 12) return 'Good morning!';
  if (h < 18) return 'Good afternoon!';
  return 'Good evening!';
}

// ── LOAD SESSION HISTORY ──────────────────────────────────────
function loadSessionHistory() {
  var sessions = JSON.parse(localStorage.getItem('mt_sessions') || '[]');
  var container = document.getElementById('session-history');

  if (sessions.length === 0) {
    container.innerHTML = '<div class="empty-history">No sessions yet — start your first one above! 🎓</div>';
    return sessions;
  }

  var html = sessions.slice().reverse().slice(0,5).map(function(s) {
    var date = new Date(s.ts).toLocaleDateString('en-US', {
      month:'short', day:'numeric', year:'numeric'
    });
    return '<div class="session-history-item">'
      + '<div class="shi-left">'
      + '<div class="shi-icon">🎓</div>'
      + '<div>'
      + '<div class="shi-title">15-Minute Session</div>'
      + '<div class="shi-date">' + date + ' · ' + s.exchanges + ' exchanges</div>'
      + '</div></div>'
      + '<div class="shi-badge">' + s.level + '</div>'
      + '</div>';
  }).join('');

  container.innerHTML = html;
  return sessions;
}

// ── LOAD SKILL SNAPSHOT FROM EXAM BOARD ───────────────────────
function loadSkillSnapshot(user) {
  // Check if user has exam results stored locally
  var examResults = JSON.parse(localStorage.getItem('mt_exam_skills') || 'null');

  var skills = examResults || {
    grammar:    user.grammar    || 0,
    vocabulary: user.vocabulary || 0,
    reading:    user.reading    || 0,
    idioms:     user.idioms     || 0,
  };

  var bars = {
    grammar:    document.getElementById('bar-grammar'),
    vocabulary: document.getElementById('bar-vocab'),
    reading:    document.getElementById('bar-reading'),
    idioms:     document.getElementById('bar-idioms'),
  };
  var pcts = {
    grammar:    document.getElementById('pct-grammar'),
    vocabulary: document.getElementById('pct-vocab'),
    reading:    document.getElementById('pct-reading'),
    idioms:     document.getElementById('pct-idioms'),
  };

  setTimeout(function() {
    Object.keys(bars).forEach(function(k) {
      var val = skills[k] || 0;
      if (bars[k]) bars[k].style.width = val + '%';
      if (pcts[k]) pcts[k].textContent = val > 0 ? val + '%' : '—';
    });
  }, 300);
}

// ── INIT DASHBOARD ────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function() {
  var user = getUser();
  if (!user) return;
   
 // ── LEVEL UP CHECK ────────────────────────────────────────────
async function checkLevelUp(userId) {
  try {
    var token = localStorage.getItem('mt_token');
    var res   = await fetch('https://marquisteacher-backend.onrender.com/api/auth/me', {
      headers: { 'Authorization': 'Bearer ' + token }
    });
    var data  = await res.json();
    var totalMinutes = data.totalMinutes || 0;

    if (totalMinutes >= 245) {
      showLevelUpNotification();
    }
  } catch(e) {
    console.log('Level up check failed:', e);
  }
}

function showLevelUpNotification() {
  var existing = document.getElementById('levelup-banner');
  if (existing) return;

  var banner = document.createElement('div');
  banner.id  = 'levelup-banner';
  banner.innerHTML = `
    <div style="background:linear-gradient(135deg,#f39c12,#e67e22);
                border-radius:12px;padding:1.25rem 1.5rem;
                margin-bottom:1.5rem;display:flex;
                align-items:center;justify-content:space-between;
                flex-wrap:wrap;gap:1rem">
      <div>
        <div style="font-family:'Syne',sans-serif;font-weight:800;
                    font-size:1rem;color:#fff;margin-bottom:0.25rem">
          🎓 You're ready to level up!
        </div>
        <div style="font-size:0.85rem;color:rgba(255,255,255,0.85)">
          You've completed 168+ minutes of practice.
          Take the exam when you're ready!
        </div>
      </div>
      <div style="display:flex;gap:0.75rem;align-items:center">
        <a href="levelup.html"
           target="_blank"
           style="background:#fff;color:#e67e22;padding:0.6rem 1.25rem;
                  border-radius:8px;font-family:'Syne',sans-serif;
                  font-weight:700;font-size:0.85rem;text-decoration:none">
          Take the Exam →
        </a>
        <button onclick="document.getElementById('levelup-banner').style.display='none'"
                style="background:transparent;border:none;
                       color:rgba(255,255,255,0.7);cursor:pointer;
                       font-size:1.2rem">✕</button>
      </div>
    </div>`;

  var main = document.querySelector('.dashboard-main');
  if (main) main.insertBefore(banner, main.firstChild);
}
 
   // Nav
  document.getElementById('nav-user-info').textContent = user.name || user.email;

  // Greeting
  document.getElementById('dash-greeting').textContent = getGreeting();
  document.getElementById('dash-name').textContent     = 'Hi, ' + (user.name || 'Student') + '!';

  // Level badge
  var level = user.level || 'A1';
  var color = LEVEL_COLORS[level] || '#2ab3c8';
  var dlbCode = document.getElementById('dlb-code');
  var dlbName = document.getElementById('dlb-name');
  if (dlbCode) {
    dlbCode.textContent  = level;
    dlbCode.style.color  = color;
  }
  if (dlbName) dlbName.textContent = LEVEL_NAMES[level] || level;

  // Stats
  var sessions = loadSessionHistory();
 var totalMin = sessions.reduce(function(sum, s) {
  return sum + (s.duration || 15);
}, 0);
  var streak   = calculateStreak(sessions);

  document.getElementById('stat-sessions').textContent = sessions.length;
  document.getElementById('stat-minutes').textContent  = totalMin;
  document.getElementById('stat-streak').textContent   = streak;
  document.getElementById('stat-level').textContent    = level;

  // Skill snapshot
  loadSkillSnapshot(user);
  
// Check level up eligibility
  if (user.uid) checkLevelUp(user.uid);
});

// ── STREAK CALCULATION ────────────────────────────────────────
function calculateStreak(sessions) {
  if (sessions.length === 0) return 0;

  var today     = new Date();
  today.setHours(0,0,0,0);
  var streak    = 0;
  var checkDate = new Date(today);

  var sessionDates = sessions.map(function(s) {
    var d = new Date(s.ts);
    d.setHours(0,0,0,0);
    return d.getTime();
  });

  for (var i = 0; i < 30; i++) {
    if (sessionDates.indexOf(checkDate.getTime()) !== -1) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
}
