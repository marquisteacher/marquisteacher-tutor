/* ============================================================
   MarquisTeacher Academy — Level Up Exam Engine
   B1 → B2 Assessment
   Pass score: 70% (14/20 correct)
   ============================================================ */

const API_URL = 'https://marquisteacher-backend.onrender.com';

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

// ── EXAM QUESTIONS ────────────────────────────────────────────
const QUESTIONS = [
  // GRAMMAR
  {
    skill: 'Grammar',
    text: 'Choose the correct form: "By the time she arrived, we _____ for two hours."',
    options: ['waited', 'were waiting', 'had been waiting', 'have waited'],
    correct: 2
  },
  {
    skill: 'Grammar',
    text: 'Which sentence is correct?',
    options: [
      'If I would have more time, I study more.',
      'If I had more time, I would study more.',
      'If I have more time, I would studied more.',
      'If I had more time, I will study more.'
    ],
    correct: 1
  },
  {
    skill: 'Grammar',
    text: 'Complete the sentence: "The report _____ by the team before the deadline."',
    options: ['completed', 'was completed', 'has complete', 'were completing'],
    correct: 1
  },
  {
    skill: 'Grammar',
    text: 'Choose the correct option: "She suggested _____ the meeting until Friday."',
    options: ['to postpone', 'postponing', 'postpone', 'postponed'],
    correct: 1
  },
  {
    skill: 'Grammar',
    text: 'Which is grammatically correct?',
    options: [
      'Despite of the rain, they continued playing.',
      'Despite the rain, they continued playing.',
      'Despite that it rained, they continued playing.',
      'Despite it was raining, they continued playing.'
    ],
    correct: 1
  },
  // VOCABULARY
  {
    skill: 'Vocabulary',
    text: 'Choose the word closest in meaning to "reluctant":',
    options: ['Eager', 'Unwilling', 'Confused', 'Confident'],
    correct: 1
  },
  {
    skill: 'Vocabulary',
    text: 'Complete the sentence: "The new policy will _____ all employees regardless of their position."',
    options: ['affect', 'effect', 'infect', 'reflect'],
    correct: 0
  },
  {
    skill: 'Vocabulary',
    text: 'Which word best completes the sentence? "Her _____ approach to the problem impressed everyone in the meeting."',
    options: ['careless', 'systematic', 'vague', 'impulsive'],
    correct: 1
  },
  {
    skill: 'Vocabulary',
    text: 'Choose the correct word: "The politician\'s speech was _____, leaving the audience inspired."',
    options: ['monotonous', 'compelling', 'confusing', 'irrelevant'],
    correct: 1
  },
  {
    skill: 'Vocabulary',
    text: 'What does "to take something for granted" mean?',
    options: [
      'To appreciate something deeply',
      'To assume something will always be available without appreciating it',
      'To work hard to achieve something',
      'To give something away freely'
    ],
    correct: 1
  },
  // READING
  {
    skill: 'Reading',
    passage: 'Remote work has transformed the modern workplace significantly. While many employees enjoy the flexibility remote work offers, others struggle with isolation and the blurring of boundaries between professional and personal life. Companies are now reconsidering their policies, with some adopting hybrid models that combine office and remote work.',
    text: 'What is the main idea of this passage?',
    options: [
      'Remote work is always better than office work',
      'Remote work has both advantages and challenges',
      'Companies prefer office work over remote work',
      'Employees dislike working from home'
    ],
    correct: 1
  },
  {
    skill: 'Reading',
    passage: 'Remote work has transformed the modern workplace significantly. While many employees enjoy the flexibility remote work offers, others struggle with isolation and the blurring of boundaries between professional and personal life. Companies are now reconsidering their policies, with some adopting hybrid models that combine office and remote work.',
    text: 'The word "blurring" in the passage most likely means:',
    options: ['Strengthening', 'Clarifying', 'Making less clear', 'Removing'],
    correct: 2
  },
  {
    skill: 'Reading',
    passage: 'Remote work has transformed the modern workplace significantly. While many employees enjoy the flexibility remote work offers, others struggle with isolation and the blurring of boundaries between professional and personal life. Companies are now reconsidering their policies, with some adopting hybrid models that combine office and remote work.',
    text: 'What solution are some companies adopting?',
    options: [
      'Fully remote work for all employees',
      'Returning entirely to office work',
      'A combination of office and remote work',
      'Reducing working hours'
    ],
    correct: 2
  },
  {
    skill: 'Reading',
    passage: 'Remote work has transformed the modern workplace significantly. While many employees enjoy the flexibility remote work offers, others struggle with isolation and the blurring of boundaries between professional and personal life. Companies are now reconsidering their policies, with some adopting hybrid models that combine office and remote work.',
    text: 'Which word in the passage means "to think about something again carefully"?',
    options: ['Transformed', 'Reconsidering', 'Adopting', 'Combining'],
    correct: 1
  },
  {
    skill: 'Reading',
    passage: 'Remote work has transformed the modern workplace significantly. While many employees enjoy the flexibility remote work offers, others struggle with isolation and the blurring of boundaries between professional and personal life. Companies are now reconsidering their policies, with some adopting hybrid models that combine office and remote work.',
    text: 'What can be inferred about hybrid work models?',
    options: [
      'They are a response to the challenges of remote work',
      'They were introduced before remote work existed',
      'They are unpopular with employees',
      'They require employees to work longer hours'
    ],
    correct: 0
  },
  // IDIOMS
  {
    skill: 'Idioms',
    text: 'What does "to hit the nail on the head" mean?',
    options: [
      'To make a mistake',
      'To describe something exactly correctly',
      'To work very hard',
      'To solve a problem quickly'
    ],
    correct: 1
  },
  {
    skill: 'Idioms',
    text: 'Choose the sentence that uses "under pressure" correctly:',
    options: [
      'She works well under pressure and delivers great results.',
      'He put the box under pressure to fit it in the car.',
      'They studied under pressure of the library.',
      'The team was under pressure of winning.'
    ],
    correct: 0
  },
  {
    skill: 'Idioms',
    text: 'What does "to see eye to eye" mean?',
    options: [
      'To have perfect vision',
      'To look at someone directly',
      'To agree with someone',
      'To misunderstand someone'
    ],
    correct: 2
  },
  {
    skill: 'Idioms',
    text: 'Complete the sentence naturally: "After years of hard work, her business finally _____ off."',
    options: ['took', 'made', 'went', 'came'],
    correct: 0
  },
  {
    skill: 'Idioms',
    text: 'Which sentence uses "on the fence" correctly?',
    options: [
      'The farmer sat on the fence to rest.',
      'She was on the fence about accepting the job offer.',
      'They painted on the fence all morning.',
      'He jumped on the fence to see better.'
    ],
    correct: 1
  }
];

// ── STATE ─────────────────────────────────────────────────────
var user        = null;
var current     = 0;
var score       = 0;
var answered    = false;
var userAnswers = [];
const PASS_SCORE = 14; // 70% of 20

// ── START EXAM ────────────────────────────────────────────────
function startExam() {
  document.getElementById('exam-intro').style.display = 'none';
  document.getElementById('exam-main').style.display  = 'block';
  renderQuestion();
}

// ── RENDER QUESTION ───────────────────────────────────────────
function renderQuestion() {
  var q       = QUESTIONS[current];
  var letters = ['A', 'B', 'C', 'D'];

  // Update progress
  document.getElementById('q-counter').textContent      = 'Question ' + (current + 1) + ' of ' + QUESTIONS.length;
  document.getElementById('q-skill').textContent        = q.skill;
  document.getElementById('progress-fill').style.width  = (((current + 1) / QUESTIONS.length) * 100) + '%';

  // Show reading passage if exists
  var passageEl = document.getElementById('reading-passage');
  if (q.passage) {
    passageEl.style.display = 'block';
    passageEl.textContent   = q.passage;
  } else {
    passageEl.style.display = 'none';
  }

  // Question text
  document.getElementById('q-text').textContent = q.text;

  // Options
  var optsEl = document.getElementById('q-options');
  optsEl.innerHTML = '';

  q.options.forEach(function(opt, i) {
    var btn       = document.createElement('button');
    btn.className = 'quiz-option';
    btn.innerHTML = '<span class="quiz-option-letter">' + letters[i] + '</span>' + opt;
    btn.onclick   = function() { selectAnswer(i, btn); };
    optsEl.appendChild(btn);
  });

  document.getElementById('next-btn').disabled = true;
  answered = false;
}

// ── SELECT ANSWER ─────────────────────────────────────────────
function selectAnswer(idx, btn) {
  if (answered) return;
  answered = true;

  var q       = QUESTIONS[current];
  var allOpts = document.querySelectorAll('.quiz-option');

  allOpts.forEach(function(b) { b.setAttribute('disabled', true); });
  allOpts[q.correct].classList.add('correct');

  if (idx === q.correct) {
    score++;
    btn.classList.add('correct');
    userAnswers.push({ skill: q.skill, correct: true });
  } else {
    btn.classList.add('wrong');
    userAnswers.push({ skill: q.skill, correct: false });
  }

  document.getElementById('next-btn').disabled = false;
}

// ── NEXT QUESTION ─────────────────────────────────────────────
function nextQuestion() {
  current++;
  if (current >= QUESTIONS.length) {
    showResult();
  } else {
    renderQuestion();
  }
}

// ── SHOW RESULT ───────────────────────────────────────────────
async function showResult() {
  document.getElementById('exam-main').style.display   = 'none';
  document.getElementById('exam-result').style.display = 'block';

  var pct    = Math.round((score / QUESTIONS.length) * 100);
  var passed = score >= PASS_SCORE;

  // Skill breakdown
  var skills    = ['Grammar', 'Vocabulary', 'Reading', 'Idioms'];
  var skillData = {};
  skills.forEach(function(s) { skillData[s] = { correct: 0, total: 0 }; });
  userAnswers.forEach(function(a) {
    skillData[a.skill].total++;
    if (a.correct) skillData[a.skill].correct++;
  });

  // Display results
  document.getElementById('result-emoji').textContent = passed ? '🎉' : '💪';
  document.getElementById('result-title').textContent = passed ? 'You Passed!' : 'Keep Going!';
  document.getElementById('result-sub').textContent   = passed
    ? 'Congratulations! You\'ve advanced to B2 — Upper Intermediate!'
    : 'You scored ' + pct + '%. You need 70% to pass. Keep practising with Marq!';

  document.getElementById('result-score').textContent = score + '/20';
  document.getElementById('result-pct').textContent   = pct + '%';

  var levelEl = document.getElementById('result-level');
  if (passed) {
    levelEl.textContent  = 'B2';
    levelEl.style.color  = '#e67e22';
  } else {
    levelEl.textContent  = 'B1';
    levelEl.style.color  = '#f39c12';
  }

  // Skill breakdown
  var breakdownHtml = '<div style="font-family:\'Space Mono\',monospace;font-size:0.65rem;color:var(--muted);text-transform:uppercase;letter-spacing:0.1em;margin-bottom:1rem">Skill Breakdown</div>';
  skills.forEach(function(s) {
    var d    = skillData[s];
    var spct = d.total ? Math.round((d.correct / d.total) * 100) : 0;
    var col  = spct >= 70 ? '#27ae60' : spct >= 50 ? '#f39c12' : '#e74c3c';
    breakdownHtml += '<div style="margin-bottom:0.75rem">'
      + '<div style="display:flex;justify-content:space-between;font-size:0.8rem;margin-bottom:4px">'
      + '<span style="color:var(--text)">' + s + '</span>'
      + '<span style="color:' + col + ';font-family:\'Space Mono\',monospace">' + d.correct + '/' + d.total + ' (' + spct + '%)</span>'
      + '</div>'
      + '<div style="height:5px;background:rgba(255,255,255,0.06);border-radius:3px;overflow:hidden">'
      + '<div style="height:100%;width:' + spct + '%;background:' + col + ';border-radius:3px;transition:width 1s ease"></div>'
      + '</div></div>';
  });
  document.getElementById('result-breakdown').innerHTML = breakdownHtml;

  // Update level and reset minutes if passed
  if (passed) {
    await updateUserLevel('B2');
    document.getElementById('result-btn-primary').textContent  = 'Go to Dashboard →';
    document.getElementById('result-btn-secondary').style.display = 'none';
  } else {
    document.getElementById('result-btn-primary').textContent  = 'Back to Dashboard';
    document.getElementById('result-btn-secondary').textContent = 'Try Again';
  }
}

// ── UPDATE USER LEVEL ─────────────────────────────────────────
async function updateUserLevel(newLevel) {
  try {
    var token = localStorage.getItem('mt_token');

    await fetch(API_URL + '/api/auth/level', {
      method:  'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': 'Bearer ' + token
      },
      body: JSON.stringify({ level: newLevel })
    });

    // Update localStorage
    var userData  = JSON.parse(localStorage.getItem('mt_user') || '{}');
    userData.level = newLevel;
    localStorage.setItem('mt_user', JSON.stringify(userData));

  } catch(e) {
    console.error('Level update error:', e);
  }
}

// ── RETRY ─────────────────────────────────────────────────────
function retryExam() {
  current     = 0;
  score       = 0;
  answered    = false;
  userAnswers = [];

  document.getElementById('exam-result').style.display = 'none';
  document.getElementById('exam-main').style.display   = 'block';
  renderQuestion();
}

// ── INIT ──────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function() {
  user = getUser();
  if (!user) return;

  document.getElementById('nav-user-info').textContent = user.name || user.email;
});
