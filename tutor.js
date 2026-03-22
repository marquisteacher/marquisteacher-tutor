/* ============================================================
   MarquisTeacher AI Tutor — Session Engine
   Powered by Google Gemini API
   Phase 1: Structured Exercises (8 minutes)
   Phase 2: Free Conversation   (7 minutes)
   ============================================================ */

// ── CONFIG ────────────────────────────────────────────────────
// API key loaded from config.js
// var GEMINI_API_KEY is defined there
var GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=YOUR=KEY=HERE';
// Session config
var PHASE_1_DURATION = 8 * 60; // 8 minutes in seconds
var PHASE_2_DURATION = 7 * 60; // 7 minutes in seconds
var TOTAL_DURATION   = PHASE_1_DURATION + PHASE_2_DURATION;

// ── STATE ─────────────────────────────────────────────────────
var user            = null;
var conversationHistory = [];
var currentPhase    = 1; // 1 = exercises, 2 = conversation
var timeRemaining   = TOTAL_DURATION;
var timerInterval   = null;
var sessionActive   = true;
var messageCount    = 0;
var voiceEnabled    = false;
var recognition     = null;
var isListening     = false;
var sessionStartTime = Date.now();

// ── LEVEL DATA ────────────────────────────────────────────────
var LEVEL_NAMES = {
  A1:'Beginner', A2:'Elementary', B1:'Intermediate',
  B2:'Upper-Intermediate', C1:'Advanced', C2:'Mastery'
};

var LEVEL_COLORS = {
  A1:'#2ab3c8', A2:'#27ae60', B1:'#f39c12',
  B2:'#e67e22', C1:'#e74c3c', C2:'#8e44ad'
};

// ── SYSTEM PROMPT BUILDER ─────────────────────────────────────
function buildSystemPrompt(user, phase) {
  var level     = user.level || 'B1';
  var levelName = LEVEL_NAMES[level] || 'Intermediate';
  var name      = user.name || 'Student';

  var skills = JSON.parse(localStorage.getItem('mt_exam_skills') || 'null');
  var weakSkills = '';
  if (skills) {
    var weak = [];
    if ((skills.grammar    || 0) < 65) weak.push('Grammar');
    if ((skills.vocabulary || 0) < 65) weak.push('Vocabulary');
    if ((skills.reading    || 0) < 65) weak.push('Reading Comprehension');
    if ((skills.idioms     || 0) < 65) weak.push('Idioms & Expressions');
    weakSkills = weak.length > 0
      ? 'The student\'s weak areas are: ' + weak.join(', ') + '. Focus more time on these.'
      : 'The student is performing well across all skill areas.';
  }

  var basePrompt = [
    'You are Marq, a friendly and encouraging AI English tutor for MarquisTeacher Academy.',
    'You are teaching ' + name + ', who is at CEFR level ' + level + ' (' + levelName + ').',
    weakSkills,
    '',
    'Your personality:',
    '- Warm, patient and encouraging — never make the student feel judged',
    '- Celebrate correct answers enthusiastically',
    '- When correcting errors, be gentle: "Great attempt! Just a small tweak — [correction]"',
    '- Keep responses concise — this is a conversation, not a lecture',
    '- Use language appropriate for ' + level + ' level',
    '- Occasionally use light humour to keep things fun',
    '',
    'Important rules:',
    '- Never write long paragraphs — keep responses to 2-4 sentences maximum',
    '- Always end with either a question or a prompt for the student to respond',
    '- Track mistakes gently and correct inline',
    '- Stay focused on English learning at all times',
  ].join('\n');

  if (phase === 1) {
    return basePrompt + '\n\n' + [
      'CURRENT PHASE: Structured Exercises (8 minutes)',
      'You are running structured exercises. Cover these skill areas:',
      '1. Grammar — give a fill-in-the-blank or correction exercise',
      '2. Vocabulary — introduce and test a new word in context',
      '3. Reading — give a short sentence/paragraph to interpret',
      '4. Idioms — teach and test an idiom appropriate for their level',
      '',
      'Exercise format:',
      '- Give one exercise at a time',
      '- Wait for the student to respond',
      '- Give feedback on their answer',
      '- Move to the next exercise',
      '- Keep each exercise brief and engaging',
      '- Adjust difficulty to ' + level + ' level',
    ].join('\n');
  } else {
    return basePrompt + '\n\n' + [
      'CURRENT PHASE: Free Conversation (7 minutes)',
      'Exercises are complete. Now have a natural conversation in English.',
      'Topics to explore (pick based on student interest and level):',
      '- Their day, hobbies, travel, food, culture',
      '- Current events appropriate for their level',
      '- Storytelling — ask them to describe something',
      '- Opinion sharing — ask what they think about a topic',
      '',
      'Conversation rules:',
      '- Be natural and conversational — like a friendly tutor chat',
      '- Gently correct grammar and vocabulary errors inline',
      '- Introduce 1-2 new expressions naturally in your responses',
      '- Ask follow-up questions to keep the conversation flowing',
      '- Celebrate good English use: "I love how you used that word!"',
    ].join('\n');
  }
}

// ── GEMINI API CALL ───────────────────────────────────────────
async function callGemini(userMessage) {
  // Add user message to history
  conversationHistory.push({
    role:  'user',
    parts: [{ text: userMessage }]
  });

  var systemPrompt = buildSystemPrompt(user, currentPhase);

  var body = {
    system_instruction: {
      parts: [{ text: systemPrompt }]
    },
    contents: conversationHistory,
    generationConfig: {
      temperature:     0.8,
      maxOutputTokens: 300,
      topP:            0.9,
    }
  };

  try {
    var res  = await fetch(GEMINI_URL, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(body)
    });

    var data = await res.json();

    if (!res.ok) {
      console.error('Gemini error:', data);
      return "I'm having a little trouble connecting right now. Let's try again — could you repeat that?";
    }

    var reply = data.candidates[0].content.parts[0].text;

    // Add assistant response to history
    conversationHistory.push({
      role:  'model',
      parts: [{ text: reply }]
    });

    return reply;

  } catch(e) {
    console.error('Gemini fetch error:', e);
    return "I had a small hiccup there! No worries — let's continue. Could you say that again?";
  }
}

// ── MESSAGE DISPLAY ───────────────────────────────────────────
function addMessage(text, sender, correction) {
  var messages = document.getElementById('messages');
  var div      = document.createElement('div');
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
  messages.scrollTop = messages.scrollHeight;
}

function showTyping() {
  document.getElementById('typing-indicator').style.display = 'flex';
  document.getElementById('messages').scrollTop = document.getElementById('messages').scrollHeight;
}

function hideTyping() {
  document.getElementById('typing-indicator').style.display = 'none';
}

// ── SEND MESSAGE ──────────────────────────────────────────────
async function sendMessage() {
  var input = document.getElementById('chat-input');
  var text  = input.value.trim();
  if (!text || !sessionActive) return;

  input.value = '';
  input.style.height = 'auto';

  // Display user message
  addMessage(text, 'user');

  // Disable input while waiting
  document.getElementById('send-btn').disabled = true;
  showTyping();

  // Get Gemini response
  var reply = await callGemini(text);
  hideTyping();

  // Display Marq response
  addMessage(reply, 'marq');
  document.getElementById('send-btn').disabled = false;

  // Update phase indicator
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

    var mins = Math.floor(timeRemaining / 60);
    var secs = timeRemaining % 60;
    var display = (mins < 10 ? '0' : '') + mins + ':' + (secs < 10 ? '0' : '') + secs;

    document.getElementById('session-timer').textContent = display;

    // Switch phase at 7 minutes remaining
    if (timeRemaining === PHASE_2_DURATION && currentPhase === 1) {
      switchToPhase2();
    }

    // Urgent warning
    if (timeRemaining <= 60) {
      document.getElementById('session-timer').classList.add('urgent');
    }

    // End session
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

  // Transition message from Marq
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
    if (pp1) pp1.classList.add('active');
    if (label) label.textContent = 'Structured Exercises';
  } else {
    if (phase1Dot) { phase1Dot.classList.remove('active'); phase1Dot.classList.add('done'); }
    if (phase2Dot) phase2Dot.classList.add('active');
    if (pp1) { pp1.classList.remove('active'); pp1.classList.add('done'); }
    if (pp2) pp2.classList.add('active');
    if (label) label.textContent = 'Free Conversation';
  }
}

// ── END SESSION ───────────────────────────────────────────────
function endSession() {
  sessionActive = false;
  clearInterval(timerInterval);

  // Save session to localStorage
  var sessions = JSON.parse(localStorage.getItem('mt_sessions') || '[]');
  sessions.push({
    ts:        Date.now(),
    level:     user.level || 'A1',
    exchanges: messageCount,
    duration:  15
  });
  localStorage.setItem('mt_sessions', JSON.stringify(sessions));

  // Show completion overlay
  var overlay = document.getElementById('session-complete');
  overlay.style.display = 'flex';

  document.getElementById('sc-name').textContent    = 'Excellent work, ' + (user.name || 'Student') + '!';
  document.getElementById('sc-messages').textContent = messageCount;
  document.getElementById('sc-level').textContent   = user.level || 'A1';

  // Generate summary
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
  recognition = new SpeechRecognition();
  recognition.continuous    = false;
  recognition.interimResults = true;
  recognition.lang          = 'en-US';

  recognition.onresult = function(e) {
    var transcript = '';
    for (var i = e.resultIndex; i < e.results.length; i++) {
      transcript += e.results[i][0].transcript;
    }
    document.getElementById('chat-input').value = transcript;
    autoResize(document.getElementById('chat-input'));

    if (e.results[e.results.length-1].isFinal) {
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
  if (!voiceEnabled) {
    toggleVoice();
    return;
  }
  if (!recognition) { setupSpeechRecognition(); return; }

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
  // Auth guard
  var token    = localStorage.getItem('mt_token');
  var userData = localStorage.getItem('mt_user');

  if (!token || !userData) {
    window.location.href = 'index.html';
    return;
  }

  user = JSON.parse(userData);

  // Set nav user info
  document.getElementById('sn-user').textContent = user.name || 'Student';

  // Set level tag
  var levelTag = document.getElementById('marq-level-tag');
  if (levelTag) {
    levelTag.textContent = 'Teaching: ' + (user.level || 'A1') + ' — ' + (LEVEL_NAMES[user.level] || 'Beginner');
    levelTag.style.color = LEVEL_COLORS[user.level] || '#2ab3c8';
  }

  // Start timer
  startTimer();
  updatePhaseDisplay();

  // Opening message from Marq
  showTyping();

  var openingMessage = await callGemini(
    '[SYSTEM: This is the start of a new 15-minute English tutoring session. ' +
    'Greet the student warmly by name (' + (user.name || 'Student') + '), ' +
    'tell them you\'re excited to work together today, briefly mention you\'ll start with ' +
    'some exercises then have a conversation, and jump straight into the first exercise. ' +
    'Make it energetic and welcoming!]'
  );

  hideTyping();

  // Remove loading message
  var introText = document.getElementById('intro-text');
  if (introText) {
    introText.textContent = openingMessage;
  }

  // Focus input
  document.getElementById('chat-input').focus();
});
