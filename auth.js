/* ============================================================
   MarquisTeacher AI Tutor — Auth Logic
   Connects to MarquisTeacher Academy backend API
   ============================================================ */

var API_URL    = 'https://marquisteacher-backend.onrender.com';
var selectedLevel = '';

// ── TAB SWITCHING ─────────────────────────────────────────────
function switchTab(tab) {
  document.querySelectorAll('.auth-tab').forEach(function(t, i) {
    t.classList.toggle('active', (i===0 && tab==='login') || (i===1 && tab==='register'));
  });
  document.getElementById('login-form').style.display    = tab === 'login'    ? 'block' : 'none';
  document.getElementById('register-form').style.display = tab === 'register' ? 'block' : 'none';
}

// ── LEVEL SELECTION ───────────────────────────────────────────
function selectLevel(btn) {
  document.querySelectorAll('.level-sel-btn').forEach(function(b) {
    b.classList.remove('selected');
  });
  btn.classList.add('selected');
  selectedLevel = btn.getAttribute('data-level');
}

// ── LOGIN ─────────────────────────────────────────────────────
async function handleLogin() {
  var email    = document.getElementById('login-email').value.trim();
  var password = document.getElementById('login-password').value;
  var errEl    = document.getElementById('login-error');
  var btnEl    = document.getElementById('login-btn-text');

  errEl.textContent = '';

  if (!email || !password) {
    errEl.textContent = 'Please enter your email and password.';
    return;
  }

  btnEl.textContent = 'Signing in...';
  document.querySelector('.btn-auth').disabled = true;

  try {
    var res  = await fetch(API_URL + '/api/auth/login', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ email, password })
    });

    var data = await res.json();

    if (!res.ok) {
      errEl.textContent = data.error || 'Login failed. Please try again.';
      btnEl.textContent = 'Sign In →';
      document.querySelector('.btn-auth').disabled = false;
      return;
    }

    // Save token and user info
    localStorage.setItem('mt_token', data.token);
    localStorage.setItem('mt_user',  JSON.stringify(data.user));

    // Redirect to dashboard
    window.location.href = 'dashboard.html';

  } catch(e) {
    errEl.textContent = 'Could not connect to server. Please try again.';
    btnEl.textContent = 'Sign In →';
    document.querySelector('.btn-auth').disabled = false;
  }
}

// ── REGISTER ──────────────────────────────────────────────────
async function handleRegister() {
  var name     = document.getElementById('reg-full-name').value.trim();
  var email    = document.getElementById('reg-email').value.trim();
  var password = document.getElementById('reg-password').value;
  var errEl    = document.getElementById('reg-error');
  var btnEl    = document.getElementById('reg-btn-text');

  errEl.textContent = '';

  if (!name || !email || !password) {
    errEl.textContent = 'Please fill in all fields.';
    return;
  }
  if (!selectedLevel) {
    errEl.textContent = 'Please select your CEFR level.';
    return;
  }
  if (password.length < 8) {
    errEl.textContent = 'Password must be at least 8 characters.';
    return;
  }

  btnEl.textContent = 'Creating account...';
  document.querySelectorAll('.btn-auth')[1].disabled = true;

  try {
    var res  = await fetch(API_URL + '/api/auth/signup', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ name, email, password, level: selectedLevel })
    });

    var data = await res.json();

    if (!res.ok) {
      errEl.textContent = data.error || 'Registration failed. Please try again.';
      btnEl.textContent = 'Create Account →';
      document.querySelectorAll('.btn-auth')[1].disabled = false;
      return;
    }

    // Save token and user info
localStorage.setItem('mt_token', data.token);
localStorage.setItem('mt_user', JSON.stringify({
  ...data.user,
  level: selectedLevel
}));

// Clear previous user's session data
localStorage.removeItem('mt_sessions');

window.location.href = 'dashboard.html';

    // Redirect to dashboard
    window.location.href = 'dashboard.html';

  } catch(e) {
    errEl.textContent = 'Could not connect to server. Please try again.';
    btnEl.textContent = 'Create Account →';
    document.querySelectorAll('.btn-auth')[1].disabled = false;
  }
}

// ── ENTER KEY SUPPORT ─────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function() {
  // If already logged in go to dashboard
  if (localStorage.getItem('mt_token')) {
    window.location.href = 'dashboard.html';
    return;
  }

  document.getElementById('login-password').addEventListener('keydown', function(e) {
    if (e.key === 'Enter') handleLogin();
  });

  document.getElementById('reg-password').addEventListener('keydown', function(e) {
    if (e.key === 'Enter') handleRegister();
  });
});
