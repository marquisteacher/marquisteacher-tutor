/* ============================================================
   MarquisTeacher AI Tutor — Session Engine
   Powered by Google Gemini API via Backend
   Phase 1: Structured Exercises (8 minutes)
   Phase 2: Free Conversation   (7 minutes)
   ============================================================ */

// ── CONFIG ────────────────────────────────────────────────────
var API_URL          = 'https://marquisteacher-backend.onrender.com';
var PHASE_1_DURATION = 8 * 60;
var PHASE_2_DURATION = 7 * 60;
var TOTAL_DURATION   = PHASE_1_DURATION + PHASE_2_DURATION;
// ── URL PARAMETERS ────────────────────────────────────────────
function getURLParams() {
  var params = new URLSearchParams(window.location.search);
  return {
    name:       params.get('name')       || null,
    level:      params.get('level')      || null,
    selfLevel:  params.get('selfLevel')  || null,
    grammar:    parseInt(params.get('grammar'))    || 0,
    vocabulary: parseInt(params.get('vocabulary')) || 0,
    reading:    parseInt(params.get('reading'))    || 0,
    idioms:     parseInt(params.get('idioms'))     || 0
  };
}
// ── STATE ─────────────────────────────────────────────────────
var user                = null;
var conversationHistory = [];
var currentPhase        = 1;
var timeRemaining       = TOTAL_DURATION;
var timerInterval       = null;
var sessionActive       = true;
var messageCount        = 0;
var voiceEnabled        = false;
var recognition         = null;
var isListening         = false;

// ── LEVEL DATA ────────────────────────────────────────────────
var LEVEL_NAMES = {
  A1:'Beginner',    A2:'Elementary',
  B1:'Intermediate', B2:'Upper-Intermediate',
  C1:'Advanced',    C2:'Mastery'
};

var LEVEL_COLORS = {
  A1:'#2ab3c8', A2:'#27ae60', B1:'#f39c12',
  B2:'#e67e22', C1:'#e74c3c', C2:'#8e44ad'
};

// ── GEMINI API CALL (via backend) ─────────────────────────────
async function callGemini(userMessage) {
  conversationHistory.push({
    role:  'user',
    parts: [{ text: userMessage }]
  });

  try {
    var res = await fetch(API_URL + '/api/tutor/chat', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({
        name:    user.name  || 'Student',
        level:   user.level || 'B1',
        skills:  JSON.parse(localStorage.getItem('mt_exam_skills') || '{}'),
        phase:   currentPhase,
        history: conversationHistory.slice(-10),
        message: userMessage
      })
    });

    var data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Chat error');

    conversationHistory.push({
      role:  'model',
      parts: [{ text: data.reply }]
    });

    return data.reply;

  } catch(e) {
    console.error('Chat error:', e);
    return "I had a small hiccup! Could you say that again? 😊";
  }
}

// ── MARKDOWN PARSER ───────────────────────────────────────────
function parseMarkdown(text) {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code style="background:rgba(42,179,200,0.15);padding:2px 6px;border-radius:4px;font-family:monospace">$1</code>')
    .replace(/\n/g, '<br>');
}

// ── MESSAGE DISPLAY ───────────────────────────────────────────
function addMessage(text, sender, correction) {
  var messages  = document.getElementById('messages');
  var div       = document.createElement('div');
  div.className = 'message ' + (sender === 'user' ? 'user-msg' : 'marq-msg');
  messageCount++;

  var avatar   = sender === 'user' ? '👤' : '🤖';
  var name     = sender === 'user' ? (user.name || 'You') : 'Marq';
  var corrHtml = correction
    ? '<div class="msg-correction">✏️ ' + correction + '</div>'
    : '';

  div.innerHTML = '<div class="msg-avatar">' + avatar + '</div>'
    + '<div class="msg-bubble">'
    + '<div class="msg-name">' + name + '</div>'
    + '<div class="msg-text">' + parseMarkdown(text) + '</div>'
    + corrHtml
    + '</div>';

  messages.appendChild(div);

  // Scroll to bottom after render
  setTimeout(function() {
    messages.scrollTop = messages.scrollHeight;
  }, 100);
}

function showTyping() {
  var messages = document.getElementById('messages');
  var indicator = document.getElementById('typing-indicator');
  indicator.style.display = 'flex';
  setTimeout(function() {
    messages.scrollTop = messages.scrollHeight;
  }, 100);
}

function hideTyping() {
  document.getElementById('typing-indicator').style.display = 'none';
}

// ── SEND MESSAGE ──────────────────────────────────────────────
async function sendMessage() {
  var input = document.getElementById('chat-input');
  var text  = input.value.trim();
  if (!text || !sessionActive) return;

  input.value       = '';
  input.style.height = 'auto';

  addMessage(text, 'user');
  document.getElementById('send-btn').disabled = true;
  showTyping();

  var reply = await callGemini(text);
  hideTyping();
  addMessage(reply, 'marq');
  document.getElementById('send-btn').disabled = false;
  updatePhaseDisplay();
}

function handleInputKey(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
}

function autoResize(el) {
  el.style.height = 'auto';
  el.style.height = Math.min(el.scrollHeight, 120) + 'px';
}

// ── TIMER ─────────────────────────────────────────────────────
function startTimer() {
  timerInterval = setInterval(function() {
    timeRemaining--;

    var mins    = Math.floor(timeRemaining / 60);
    var secs    = timeRemaining % 60;
    var display = (mins < 10 ? '0' : '') + mins + ':' + (secs < 10 ? '0' : '') + secs;

    document.getElementById('session-timer').textContent = display;

    if (timeRemaining === PHASE_2_DURATION && currentPhase === 1) {
      switchToPhase2();
    }

    if (timeRemaining <= 60) {
      document.getElementById('session-timer').classList.add('urgent');
    }

    if (timeRemaining <= 0) {
      clearInterval(timerInterval);
      endSession();
    }

  }, 1000);
}

// ── PHASE SWITCHING ───────────────────────────────────────────
async function switchToPhase2() {
  currentPhase = 2;
  updatePhaseDisplay();

  showTyping();
  var transition = await callGemini(
    '[SYSTEM: Phase 1 exercises are complete. Transition naturally to free conversation phase. ' +
    'Tell the student great job on the exercises and invite them to just chat in English about anything they like.]'
  );
  hideTyping();
  addMessage(transition, 'marq');
}

function updatePhaseDisplay() {
  var phase1Dot = document.getElementById('phase-1-dot');
  var phase2Dot = document.getElementById('phase-2-dot');
  var pp1       = document.getElementById('pp-exercises');
  var pp2       = document.getElementById('pp-conversation');
  var label     = document.getElementById('timer-phase');

  if (currentPhase === 1) {
    if (phase1Dot) phase1Dot.classList.add('active');
    if (pp1)       pp1.classList.add('active');
    if (label)     label.textContent = 'Structured Exercises';
  } else {
    if (phase1Dot) { phase1Dot.classList.remove('active'); phase1Dot.classList.add('done'); }
    if (phase2Dot) phase2Dot.classList.add('active');
    if (pp1)       { pp1.classList.remove('active'); pp1.classList.add('done'); }
    if (pp2)       pp2.classList.add('active');
    if (label)     label.textContent = 'Free Conversation';
  }
}

// ── TRANSCRIPT DOWNLOAD ───────────────────────────────────────
function downloadTranscript() {
  var dateStr  = new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });
  var timeStr  = new Date().toLocaleTimeString('en-US');
  var lines    = [];

  // Header
  lines.push('============================================================');
  lines.push('   MarquisTeacher Academy — Session Transcript');
  lines.push('============================================================');
  lines.push('');
  lines.push('Student:  ' + (user.name  || 'Student'));
  lines.push('Level:    ' + (user.level || 'A1') + ' — ' + (LEVEL_NAMES[user.level] || 'Beginner'));
  lines.push('Date:     ' + dateStr);
  lines.push('Time:     ' + timeStr);
  lines.push('Duration: 15 minutes');
  lines.push('Exchanges: ' + messageCount);
  lines.push('');
  lines.push('------------------------------------------------------------');
  lines.push('   CONVERSATION');
  lines.push('------------------------------------------------------------');
  lines.push('');

  // Conversation history
  conversationHistory.forEach(function(msg) {
    var speaker = msg.role === 'user'
      ? (user.name || 'Student')
      : 'Marq';
    var text = msg.parts[0].text;

    // Skip system messages
    if (text.indexOf('[SYSTEM:') === 0) return;

    lines.push(speaker + ':');
    lines.push(text);
    lines.push('');
  });

  // Summary
  var summaryEl = document.getElementById('sc-summary');
  if (summaryEl && summaryEl.textContent) {
    lines.push('------------------------------------------------------------');
    lines.push('   SESSION SUMMARY');
    lines.push('------------------------------------------------------------');
    lines.push('');
    lines.push(summaryEl.textContent);
    lines.push('');
  }

  // Footer
  lines.push('============================================================');
  lines.push('   MarquisTeacher Academy');
  lines.push('   MarquisTeacher@gmail.com');
  lines.push('   © 2025 Marquis Williams');
  lines.push('============================================================');

  // Create and download file
  var content  = lines.join('\n');
  var blob     = new Blob([content], { type: 'text/plain' });
  var url      = window.URL.createObjectURL(blob);
  var a        = document.createElement('a');
  a.href       = url;
  a.download   = 'MarquisTeacher_Transcript_' + (user.name || 'Student').replace(/\s/g,'_') + '_' + Date.now() + '.txt';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}
// ── PREVIEW SCREEN ────────────────────────────────────────────
function showPreviewScreen(params) {
  var preview = document.getElementById('preview-screen');
  var session = document.getElementById('session-layout');
  var nav     = document.querySelector('.session-nav');

  // Hide session layout and nav
  if (session) session.style.display = 'none';
  if (nav)     nav.style.display     = 'none';

  // Show preview
  preview.style.display = 'block';

  // Set title
  var titleEl = document.getElementById('preview-title');
  if (titleEl) titleEl.textContent = 'Welcome ' + (params.name || 'Student') + '! 🎓';

  // Set level badge
  var levelCode = params.level || 'A1';
  var levelColor = {
    A1:'#2ab3c8', A2:'#27ae60', B1:'#f39c12',
    B2:'#e67e22', C1:'#e74c3c', C2:'#8e44ad'
  }[levelCode] || '#2ab3c8';

  var codeEl = document.getElementById('preview-level-code');
  var nameEl = document.getElementById('preview-level-name');
  if (codeEl) {
    codeEl.textContent = levelCode;
    codeEl.style.color = levelColor;
  }
  if (nameEl) nameEl.textContent = LEVEL_NAMES[levelCode] || levelCode;

  // Build skill items
  var skills = [
    { name: 'Grammar',    icon: '📐', pct: params.grammar    || 0 },
    { name: 'Vocabulary', icon: '📖', pct: params.vocabulary || 0 },
    { name: 'Reading',    icon: '📰', pct: params.reading    || 0 },
    { name: 'Idioms',     icon: '💬', pct: params.idioms     || 0 },
  ];

  var skillsEl = document.getElementById('preview-skills');
  if (skillsEl) {
    skillsEl.innerHTML = skills.map(function(s) {
      var tag   = s.pct < 40  ? 'PRIORITY'
                : s.pct < 65  ? 'FOCUS'
                : s.pct < 85  ? 'GOOD'
                : 'STRONG';
      var cls   = s.pct < 40  ? 'tag-priority'
                : s.pct < 65  ? 'tag-focus'
                : s.pct < 85  ? 'tag-good'
                : 'tag-strong';
      var color = s.pct < 40  ? '#e74c3c'
                : s.pct < 65  ? '#f39c12'
                : s.pct < 85  ? '#2ab3c8'
                : '#27ae60';

      return '<div class="preview-skill-item">'
        + '<div class="psi-left">'
        + '<span class="psi-icon">' + s.icon + '</span>'
        + '<span class="psi-name">' + s.name + '</span>'
        + '</div>'
        + '<div style="display:flex;align-items:center;gap:0.75rem">'
        + '<span class="psi-pct" style="color:' + color + '">' + s.pct + '%</span>'
        + '<span class="psi-tag ' + cls + '">' + tag + '</span>'
        + '</div>'
        + '</div>';
    }).join('');
  }
}

function startFromPreview() {
  var preview = document.getElementById('preview-screen');
  var session = document.getElementById('session-layout');
  var nav     = document.querySelector('.session-nav');

  // Hide preview
  preview.style.display = 'none';

  // Show session
  if (session) session.style.display = 'grid';
  if (nav)     nav.style.display     = 'flex';

  // Start the actual session
  initSession();
}

function skipPreview() {
  startFromPreview();
}
// ── END SESSION ───────────────────────────────────────────────
function endSession() {
  sessionActive = false;
  clearInterval(timerInterval);

  var sessions = JSON.parse(localStorage.getItem('mt_sessions') || '[]');
  sessions.push({
    ts:        Date.now(),
    level:     user.level || 'A1',
    exchanges: messageCount,
    duration:  15
  });
  localStorage.setItem('mt_sessions', JSON.stringify(sessions));

  var overlay = document.getElementById('session-complete');
  overlay.style.display = 'flex';

  document.getElementById('sc-name').textContent     = 'Excellent work, ' + (user.name || 'Student') + '!';
  document.getElementById('sc-messages').textContent = messageCount;
  document.getElementById('sc-level').textContent    = user.level || 'A1';

  generateSessionSummary();
}

async function generateSessionSummary() {
  try {
    var summary = await callGemini(
      '[SYSTEM: The session is complete. Write a brief, encouraging 2-sentence summary of ' +
      'what was covered today and one specific thing the student did well. Be warm and motivating.]'
    );
    document.getElementById('sc-summary').textContent = summary;
  } catch(e) {
    document.getElementById('sc-summary').textContent =
      'Great session today! Keep practising every day and you will reach your goal. See you next time! 🎓';
  }
}

// ── VOICE INPUT ───────────────────────────────────────────────
function toggleVoice() {
  voiceEnabled = !voiceEnabled;
  var toggle = document.getElementById('voice-toggle');
  var icon   = document.getElementById('voice-icon');
  var label  = document.getElementById('voice-label');

  if (voiceEnabled) {
    toggle.classList.add('active');
    icon.textContent  = '🎤';
    label.textContent = 'Voice On';
    setupSpeechRecognition();
  } else {
    toggle.classList.remove('active');
    icon.textContent  = '🎤';
    label.textContent = 'Enable Voice';
    if (recognition) recognition.stop();
  }
}

function setupSpeechRecognition() {
  if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
    alert('Voice input is not supported in your browser. Try Chrome for voice support!');
    voiceEnabled = false;
    return;
  }

  var SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  recognition                = new SpeechRecognition();
  recognition.continuous     = false;
  recognition.interimResults = true;
  recognition.lang           = 'en-US';

  recognition.onresult = function(e) {
    var transcript = '';
    for (var i = e.resultIndex; i < e.results.length; i++) {
      transcript += e.results[i][0].transcript;
    }
    document.getElementById('chat-input').value = transcript;
    autoResize(document.getElementById('chat-input'));
    if (e.results[e.results.length - 1].isFinal) {
      isListening = false;
      updateMicBtn();
    }
  };

  recognition.onend = function() {
    isListening = false;
    updateMicBtn();
  };

  recognition.onerror = function(e) {
    console.error('Speech error:', e.error);
    isListening = false;
    updateMicBtn();
  };
}

function startListening() {
  if (!voiceEnabled) { toggleVoice(); return; }
  if (!recognition)  { setupSpeechRecognition(); return; }

  if (isListening) {
    recognition.stop();
    isListening = false;
  } else {
    recognition.start();
    isListening = true;
  }
  updateMicBtn();
}

function updateMicBtn() {
  var btn = document.getElementById('mic-btn');
  if (isListening) {
    btn.classList.add('active');
    btn.textContent = '🔴';
  } else {
    btn.classList.remove('active');
    btn.textContent = '🎤';
  }
}

// ── INIT SESSION ──────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async function() {
  var token    = localStorage.getItem('mt_token');
  var userData = localStorage.getItem('mt_user');

  if (!token || !userData) {
    window.location.href = 'index.html';
    return;
  }

  user = JSON.parse(userData);

  // Check for URL parameters from Academy
  var urlParams = getURLParams();

  // If URL has exam data — merge into user object
  if (urlParams.name)  user.name  = urlParams.name;
  if (urlParams.level) user.level = urlParams.level;

  // Save skill scores from URL to localStorage
  if (urlParams.grammar || urlParams.vocabulary || urlParams.reading || urlParams.idioms) {
    localStorage.setItem('mt_exam_skills', JSON.stringify({
      grammar:    urlParams.grammar,
      vocabulary: urlParams.vocabulary,
      reading:    urlParams.reading,
      idioms:     urlParams.idioms
    }));
  }

  // Set nav info
  document.getElementById('sn-user').textContent = user.name || 'Student';

  // Set level tag
  var levelTag = document.getElementById('marq-level-tag');
  if (levelTag) {
    levelTag.textContent = 'Teaching: ' + (user.level || 'A1') + ' — ' + (LEVEL_NAMES[user.level] || 'Beginner');
    levelTag.style.color = LEVEL_COLORS[user.level] || '#2ab3c8';
  }

   // Show preview screen if came from Academy
  if (urlParams.level) {
    // Reset any existing session state
    clearInterval(timerInterval);
    timeRemaining    = TOTAL_DURATION;
    currentPhase     = 1;
    sessionActive    = true;
    messageCount     = 0;
    conversationHistory = [];

    // Clear chat messages
    var messages = document.getElementById('messages');
    if (messages) messages.innerHTML = '';

    showPreviewScreen(urlParams);
    return;
  }

  // Otherwise start session directly
  initSession();
});

// ── INIT SESSION ────────────────────────────────────────────── 
async function initSession() {
  // Prevent double initialisation
  if (sessionActive === false || timerInterval !== null) return;

  // Start timer and phase display
  startTimer();
  updatePhaseDisplay();

  // Clear intro placeholder
  var introMsg = document.getElementById('intro-text');
  if (introMsg) {
    introMsg.closest('.message').style.display = 'none';
  }

  // Get opening message from Marq
  conversationHistory = [];
  showTyping();
  var openingMessage = await callGemini(
    '[SYSTEM: This is the start of a new 15-minute English tutoring session. ' +
    'Greet the student warmly by name (' + (user.name || 'Student') + '), ' +
    'tell them you\'re excited to work together today, briefly mention you\'ll start with ' +
    'some exercises then have a conversation, and jump straight into the first exercise. ' +
    'Make it energetic and welcoming!]'
  );
  hideTyping();
  conversationHistory = [];

  // Display as proper chat bubble
  addMessage(openingMessage, 'marq');

  // Focus input
  document.getElementById('chat-input').focus();
}
