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
    + '<div class="msg-text">' + text.replace(/\n/g, '<br>') + '</div>'
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

  // Set nav info
  document.getElementById('sn-user').textContent = user.name || 'Student';

  // Set level tag
  var levelTag = document.getElementById('marq-level-tag');
  if (levelTag) {
    levelTag.textContent = 'Teaching: ' + (user.level || 'A1') + ' — ' + (LEVEL_NAMES[user.level] || 'Beginner');
    levelTag.style.color = LEVEL_COLORS[user.level] || '#2ab3c8';
  }

  // Start timer and phase display
  startTimer();
  updatePhaseDisplay();

  // Clear the intro placeholder
  var introMsg = document.getElementById('intro-text');
  if (introMsg) {
    introMsg.closest('.message').style.display = 'none';
  }

  // Get opening message from Marq
  showTyping();
  var openingMessage = await callGemini(
    '[SYSTEM: This is the start of a new 15-minute English tutoring session. ' +
    'Greet the student warmly by name (' + (user.name || 'Student') + '), ' +
    'tell them you\'re excited to work together today, briefly mention you\'ll start with ' +
    'some exercises then have a conversation, and jump straight into the first exercise. ' +
    'Make it energetic and welcoming!]'
  );
  hideTyping();

  // Display as proper chat bubble
  addMessage(openingMessage, 'marq');

  // Focus input
  document.getElementById('chat-input').focus();
});
