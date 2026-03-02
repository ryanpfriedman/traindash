import JSZip from 'jszip';
import { Course } from '../types';
import { SCORM_API_SCRIPT, generateScormManifest } from './scorm';

export async function exportHtmlZip(course: Course): Promise<void> {
  const zip = new JSZip();
  const brand = course.brandSnapshot;
  const primaryColor = brand.primaryColor || '#6366f1';

  // Generate CSS
  const css = `
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Arial, sans-serif; background: #f8f9fa; color: #1a1a2e; }
    .header { background: ${primaryColor}; color: white; padding: 20px 40px; display: flex; align-items: center; justify-content: space-between; position: sticky; top: 0; z-index: 100; box-shadow: 0 2px 10px rgba(0,0,0,0.2); }
    .header h1 { font-size: 1.4rem; font-weight: 700; }
    .header .company { font-size: 0.9rem; opacity: 0.8; }
    .container { display: flex; min-height: calc(100vh - 70px); }
    .sidebar { width: 280px; background: white; border-right: 1px solid #e5e7eb; padding: 20px 0; position: sticky; top: 70px; height: calc(100vh - 70px); overflow-y: auto; flex-shrink: 0; }
    .sidebar h3 { padding: 0 20px 12px; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #9ca3af; }
    .sidebar-item { display: block; padding: 12px 20px; cursor: pointer; border-left: 3px solid transparent; transition: all 0.2s; text-decoration: none; color: #374151; font-size: 0.9rem; }
    .sidebar-item:hover { background: #f3f4f6; border-left-color: ${primaryColor}; color: ${primaryColor}; }
    .sidebar-item.active { background: #f0f0ff; border-left-color: ${primaryColor}; color: ${primaryColor}; font-weight: 600; }
    .sidebar-item .chapter-num { font-size: 0.75rem; color: #9ca3af; display: block; margin-bottom: 2px; }
    .main { flex: 1; padding: 40px; max-width: 860px; }
    .lesson { display: none; }
    .lesson.active { display: block; animation: fadeIn 0.3s ease; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    .lesson-header { margin-bottom: 32px; }
    .chapter-label { font-size: 0.8rem; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: ${primaryColor}; margin-bottom: 8px; }
    .lesson-title { font-size: 2rem; font-weight: 800; color: #1a1a2e; margin-bottom: 12px; }
    .lesson-desc { font-size: 1rem; color: #6b7280; line-height: 1.6; padding: 16px; background: #f9fafb; border-radius: 8px; border-left: 4px solid ${primaryColor}; }
    .tabs { display: flex; gap: 4px; margin-bottom: 28px; border-bottom: 2px solid #e5e7eb; }
    .tab-btn { padding: 10px 18px; background: none; border: none; border-bottom: 2px solid transparent; margin-bottom: -2px; cursor: pointer; font-size: 0.9rem; font-weight: 600; color: #6b7280; transition: all 0.2s; }
    .tab-btn:hover { color: ${primaryColor}; }
    .tab-btn.active { color: ${primaryColor}; border-bottom-color: ${primaryColor}; }
    .tab-panel { display: none; }
    .tab-panel.active { display: block; animation: fadeIn 0.3s ease; }
    .slide { background: white; border-radius: 12px; margin-bottom: 24px; box-shadow: 0 4px 20px rgba(0,0,0,0.06); border: 1px solid #e5e7eb; overflow: hidden; }
    .slide-header { background: ${primaryColor}; color: white; padding: 24px 32px; border-bottom: 4px solid rgba(255,255,255,0.2); }
    .slide-header h3 { font-size: 1.4rem; font-weight: 700; margin: 0; }
    .slide-body { display: flex; padding: 32px; gap: 40px; }
    .slide-content { flex: 1; font-size: 1.05rem; color: #334155; line-height: 1.8; }
    .slide-content p { white-space: pre-line; }
    .slide-cards { width: 340px; flex-shrink: 0; display: flex; flex-direction: column; gap: 16px; }
    .feature-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px 20px; border-left: 4px solid ${primaryColor}; box-shadow: 0 2px 4px rgba(0,0,0,0.02); }
    .feature-card p { margin: 0; font-size: 0.95rem; color: #1e293b; line-height: 1.5; }
    @media (max-width: 900px) { .slide-body { flex-direction: column; } .slide-cards { width: 100%; } }
    .manual-content { background: white; border-radius: 12px; padding: 36px; box-shadow: 0 1px 6px rgba(0,0,0,0.08); line-height: 1.8; color: #374151; }
    .manual-content h1, .manual-content h2, .manual-content h3 { color: #1a1a2e; margin: 24px 0 12px; font-weight: 700; }
    .manual-content h2 { font-size: 1.4rem; border-bottom: 2px solid ${primaryColor}; padding-bottom: 8px; }
    .cards-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 20px; }
    .card { perspective: 800px; height: 180px; cursor: pointer; }
    .card-inner { position: relative; width: 100%; height: 100%; transform-style: preserve-3d; transition: transform 0.6s; }
    .card.flipped .card-inner { transform: rotateY(180deg); }
    .card-front, .card-back { position: absolute; width: 100%; height: 100%; backface-visibility: hidden; border-radius: 12px; display: flex; align-items: center; justify-content: center; padding: 20px; text-align: center; }
    .card-front { background: white; border: 2px solid #e5e7eb; color: #1a1a2e; font-weight: 600; font-size: 0.95rem; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
    .card-front::after { content: 'Click to reveal'; position: absolute; bottom: 10px; right: 12px; font-size: 0.7rem; color: #9ca3af; font-weight: 400; }
    .card-back { background: ${primaryColor}; color: white; font-size: 0.9rem; transform: rotateY(180deg); }
    .script-scene { background: white; border-radius: 12px; padding: 24px; margin-bottom: 16px; box-shadow: 0 1px 6px rgba(0,0,0,0.08); border-left: 4px solid ${primaryColor}; }
    .script-scene h4 { font-size: 1rem; font-weight: 700; color: ${primaryColor}; margin-bottom: 4px; }
    .script-scene .duration { font-size: 0.75rem; color: #9ca3af; margin-bottom: 12px; }
    .script-scene .narration { color: #374151; line-height: 1.7; margin-bottom: 10px; }
    .script-scene .visual-cue { background: #f3f4f6; border-radius: 6px; padding: 10px; font-size: 0.85rem; color: #6b7280; }
    .script-scene .visual-cue span { font-weight: 700; color: #374151; }
    .quiz-section h3 { font-size: 1.2rem; font-weight: 700; margin-bottom: 20px; color: #1a1a2e; }
    .question { background: white; border-radius: 12px; padding: 24px; margin-bottom: 16px; box-shadow: 0 1px 6px rgba(0,0,0,0.08); }
    .question p { font-weight: 600; color: #1a1a2e; margin-bottom: 16px; line-height: 1.5; }
    .options { display: flex; flex-direction: column; gap: 10px; }
    .option-btn { display: flex; align-items: center; gap: 12px; padding: 12px 16px; background: #f9fafb; border: 2px solid #e5e7eb; border-radius: 8px; cursor: pointer; text-align: left; transition: all 0.2s; font-size: 0.9rem; color: #374151; }
    .option-btn:hover { border-color: ${primaryColor}; background: #f5f5ff; }
    .option-btn.selected { border-color: ${primaryColor}; background: #f0f0ff; }
    .option-btn.correct { border-color: #10b981; background: #ecfdf5; color: #065f46; }
    .option-btn.incorrect { border-color: #ef4444; background: #fef2f2; color: #991b1b; }
    .option-letter { width: 28px; height: 28px; border-radius: 50%; background: ${primaryColor}; color: white; display: flex; align-items: center; justify-content: center; font-size: 0.8rem; font-weight: 700; flex-shrink: 0; }
    .explanation { margin-top: 12px; padding: 12px; background: #f0fff4; border-radius: 8px; border-left: 4px solid #10b981; color: #065f46; font-size: 0.9rem; display: none; }
    .explanation.show { display: block; }
    .nav-buttons { display: flex; gap: 12px; justify-content: space-between; margin-top: 32px; padding-top: 24px; border-top: 1px solid #e5e7eb; }
    .btn { padding: 12px 24px; border-radius: 8px; font-weight: 600; font-size: 0.9rem; cursor: pointer; border: none; transition: all 0.2s; }
    .btn-primary { background: ${primaryColor}; color: white; }
    .btn-primary:hover { opacity: 0.9; transform: translateY(-1px); }
    .btn-secondary { background: white; color: #374151; border: 2px solid #e5e7eb; }
    .btn-secondary:hover { border-color: ${primaryColor}; color: ${primaryColor}; }
    .btn:disabled { opacity: 0.4; cursor: not-allowed; transform: none !important; }
    .progress-bar-outer { height: 6px; background: #e5e7eb; border-radius: 3px; margin-top: 8px; }
    .progress-bar-inner { height: 100%; background: ${primaryColor}; border-radius: 3px; transition: width 0.5s ease; }
    .completion-banner { background: linear-gradient(135deg, #10b981, #059669); color: white; border-radius: 12px; padding: 32px; text-align: center; margin-bottom: 24px; }
    .completion-banner h2 { font-size: 1.8rem; font-weight: 800; margin-bottom: 8px; }
    .score-badge { display: inline-block; background: rgba(255,255,255,0.2); border-radius: 8px; padding: 8px 20px; font-size: 1.1rem; font-weight: 700; margin-top: 12px; }
    @media (max-width: 768px) { .container { flex-direction: column; } .sidebar { width: 100%; position: relative; top: 0; height: auto; max-height: 250px; } .main { padding: 20px; } }
  `;

  // Generate JS
  const js = `
    let currentLesson = 0;
    let currentTab = {};
    let quizAnswers = {};
    let quizSubmitted = {};

    function showLesson(idx) {
      document.querySelectorAll('.lesson').forEach(l => l.classList.remove('active'));
      document.querySelectorAll('.sidebar-item').forEach(s => s.classList.remove('active'));
      const lessons = document.querySelectorAll('.lesson');
      const sidebarItems = document.querySelectorAll('.sidebar-item');
      if (lessons[idx]) lessons[idx].classList.add('active');
      if (sidebarItems[idx]) sidebarItems[idx].classList.add('active');
      currentLesson = idx;
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
      // SCORM Tracking
      if (typeof scorm !== 'undefined' && scorm.setProgress) {
          scorm.setProgress(idx + 1);
          if (idx === lessons.length - 1) {
              scorm.finish();
          }
      }
    }

    function showTab(lessonIdx, tabName) {
      const lesson = document.querySelectorAll('.lesson')[lessonIdx];
      lesson.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      lesson.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
      lesson.querySelector('#tab-btn-' + lessonIdx + '-' + tabName).classList.add('active');
      lesson.querySelector('#tab-' + lessonIdx + '-' + tabName).classList.add('active');
      currentTab[lessonIdx] = tabName;
    }

    function flipCard(card) { card.classList.toggle('flipped'); }

    function selectOption(questionId, optionIdx, correctIdx) {
      if (quizSubmitted[questionId]) return;
      quizAnswers[questionId] = optionIdx;
      document.querySelectorAll('[data-qid="' + questionId + '"]').forEach((btn, idx) => {
        btn.classList.remove('selected');
        if (idx === optionIdx) btn.classList.add('selected');
      });
    }

    function submitQuiz(lessonIdx) {
      const lesson = document.querySelectorAll('.lesson')[lessonIdx];
      const questions = lesson.querySelectorAll('.question');
      let score = 0;
      questions.forEach(q => {
        const qid = q.dataset.questionId;
        const correct = parseInt(q.dataset.correct);
        quizSubmitted[qid] = true;
        const options = q.querySelectorAll('.option-btn');
        options.forEach((btn, idx) => {
          btn.classList.remove('selected');
          if (idx === correct) btn.classList.add('correct');
          else if (quizAnswers[qid] === idx) btn.classList.add('incorrect');
        });
        if (quizAnswers[qid] === correct) score++;
        const explanation = q.querySelector('.explanation');
        if (explanation) explanation.classList.add('show');
      });
      const total = questions.length;
      const pct = total > 0 ? Math.round((score/total)*100) : 0;
      const resultDiv = document.getElementById('quiz-result-' + lessonIdx);
      if (resultDiv) {
        let hrHtml = '';
        const hrEmail = '${brand.hrEmail || ''}';
        const cTitle = \`${course.title.replace(/`/g, '\\`')}\`;
        if (hrEmail && pct >= 70) {
            hrHtml = \`
            <form action="https://formsubmit.co/\${hrEmail}" method="POST" target="_blank" style="margin-top: 16px;">
                <input type="hidden" name="_subject" value="Quiz Passed! \${cTitle}" />
                <input type="hidden" name="Course" value="\${cTitle}" />
                <input type="hidden" name="Chapter" value="\${lessons[lessonIdx].title}" />
                <input type="hidden" name="Score" value="\${pct}% (\${score}/\${total})" />
                <input type="hidden" name="_captcha" value="false" />
                <input type="hidden" name="_template" value="table" />
                <button type="submit" style="background: #10b981; color: white; border: none; padding: 10px 16px; border-radius: 6px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 8px; margin: 0 auto; font-family: inherit;">
                    ✉️ Email Results to HR
                </button>
            </form>
            \`;
        }
        resultDiv.innerHTML = '<div class="completion-banner"><h2>' + (pct >= 70 ? '🎉 Passed!' : '📚 Keep Studying') + '</h2><p>You scored ' + score + ' out of ' + total + ' questions</p><div class="score-badge">' + pct + '%</div>' + hrHtml + '</div>';
        resultDiv.style.display = 'block';
      }
      const submitBtn = document.getElementById('submit-quiz-' + lessonIdx);
      if (submitBtn) submitBtn.style.display = 'none';
    }

    // Initialize
    document.addEventListener('DOMContentLoaded', () => { showLesson(0); });
  `;

  // Generate lesson HTML
  const generateLessonHtml = (lesson: Course['lessons'][0], idx: number): string => {
    const formats = course.formats;
    const tabs: string[] = [];
    if (formats.includes('slideshow') && lesson.slides.length > 0) tabs.push('slides');
    if (formats.includes('manual') && lesson.manualContent) tabs.push('manual');
    if (formats.includes('cards') && lesson.cards.length > 0) tabs.push('cards');
    if (formats.includes('script') && lesson.scriptScenes.length > 0) tabs.push('script');
    if (formats.includes('quiz') && lesson.quiz.length > 0) tabs.push('quiz');

    const renderMarkdownHtml = (text: string) => {
      return text
        .replace(/^# (.+)$/gm, '<h1>$1</h1>')
        .replace(/^## (.+)$/gm, '<h2>$1</h2>')
        .replace(/^### (.+)$/gm, '<h3>$1</h3>')
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        .replace(/^- (.+)$/gm, '<li>$1</li>')
        .replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>')
        .replace(/\n\n/g, '</p><p>')
        .replace(/^(?!<[hlu])(.*[a-zA-Z0-9].*)$/gm, '<p>$1</p>') // Wrap non-empty text lines in p
        .replace(/\n/g, ' '); // Collapse newlines
    };

    const tabButtons = tabs.map(t => {
      const labels: Record<string, string> = { slides: '📊 Slides', manual: '📄 Manual', cards: '🗂️ Cards', script: '🎥 Script', quiz: '📋 Quiz' };
      return `<button class="tab-btn${t === tabs[0] ? ' active' : ''}" id="tab-btn-${idx}-${t}" onclick="showTab(${idx}, '${t}')">${labels[t]}</button>`;
    }).join('');

    const slidesHtml = lesson.slides.map(s => {
      const hasBullets = s.bulletPoints && s.bulletPoints.length > 0;
      return `
      <div class="slide">
        <div class="slide-header">
          <h3>${s.title}</h3>
        </div>
        <div class="slide-body">
          <div class="slide-content">
            <p>${s.content || ''}</p>
          </div>
          ${hasBullets ? `
          <div class="slide-cards">
            ${s.bulletPoints.map(bp => `
            <div class="feature-card">
              <p>${bp}</p>
            </div>`).join('')}
          </div>` : ''}
        </div>
      </div>`;
    }).join('');

    const cardsHtml = lesson.cards.map(c => `
        < div class="card" onclick = "flipCard(this)" >
          <div class="card-inner" >
            <div class="card-front" > <span>${c.front} </span></div >
              <div class="card-back" > <span>${c.back} </span></div >
                </div>
                </div>`).join('');

    const scriptHtml = lesson.scriptScenes.map(s => `
      <div class="script-scene">
        <h4>${s.sceneTitle}</h4>
        <div class="duration">⏱ ${s.duration}</div>
        <p class="narration">${s.narration}</p>
        <div class="visual-cue"><span>🎬 Visual:</span> ${s.visualCue}</div>
      </div>`).join('');

    const letters = ['A', 'B', 'C', 'D'];
    const quizHtml = lesson.quiz.map(q => `
      <div class="question" data-question-id="${q.id}" data-correct="${q.correctIndex}">
        <p>${q.question}</p>
        <div class="options">
          ${q.options.map((opt, i) => `
            <button class="option-btn" data-qid="${q.id}" onclick="selectOption('${q.id}', ${i}, ${q.correctIndex})">
              <span class="option-letter">${letters[i]}</span>${opt}
            </button>`).join('')}
        </div>
        <div class="explanation">${q.explanation}</div>
      </div>`).join('');

    return `
      <div class="lesson${idx === 0 ? ' active' : ''}" id="lesson-${idx}">
        <div class="lesson-header">
          <div class="chapter-label">Chapter ${lesson.order}</div>
          <h1 class="lesson-title">${lesson.title}</h1>
          <p class="lesson-desc">${lesson.description}</p>
        </div>
        ${tabs.length > 1 ? `<div class="tabs">${tabButtons}</div>` : ''}
        ${tabs.includes('slides') ? `<div class="tab-panel${tabs[0] === 'slides' ? ' active' : ''}" id="tab-${idx}-slides">${slidesHtml}</div>` : ''}
        ${tabs.includes('manual') ? `<div class="tab-panel${tabs[0] === 'manual' ? ' active' : ''}" id="tab-${idx}-manual"><div class="manual-content">${renderMarkdownHtml(lesson.manualContent)}</div></div>` : ''}
        ${tabs.includes('cards') ? `<div class="tab-panel${tabs[0] === 'cards' ? ' active' : ''}" id="tab-${idx}-cards"><div class="cards-grid">${cardsHtml}</div></div>` : ''}
        ${tabs.includes('script') ? `<div class="tab-panel${tabs[0] === 'script' ? ' active' : ''}" id="tab-${idx}-script">${scriptHtml}</div>` : ''}
        ${tabs.includes('quiz') ? `<div class="tab-panel${tabs[0] === 'quiz' ? ' active' : ''}" id="tab-${idx}-quiz">
          <div class="quiz-section"><h3>Chapter Quiz</h3>${quizHtml}</div>
          <div id="quiz-result-${idx}" style="display:none;margin-top:20px;"></div>
          <button class="btn btn-primary" id="submit-quiz-${idx}" onclick="submitQuiz(${idx})" style="margin-top:16px;">Submit Quiz</button>
        </div>` : ''}
        <div class="nav-buttons">
          <button class="btn btn-secondary" onclick="showLesson(${idx}-1)" ${idx === 0 ? 'disabled' : ''}>← Previous</button>
          <button class="btn btn-primary" onclick="showLesson(${idx}+1)" ${idx === course.lessons.length - 1 ? 'disabled' : ''}>Next Chapter →</button>
        </div>
      </div>`;
  };

  const sidebarItems = course.lessons.map((lesson, idx) => `
    <a class="sidebar-item${idx === 0 ? ' active' : ''}" onclick="showLesson(${idx})">
      <span class="chapter-num">Chapter ${lesson.order}</span>${lesson.title}
    </a>`).join('');

  const lessonsHtml = course.lessons.map((lesson, idx) => generateLessonHtml(lesson, idx)).join('');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${course.title} — ${brand.companyName || 'TrainDash.io'}</title>
  <style>${css}</style>
  <script src="scorm.js"></script>
</head>
<body>
  <header class="header">
    <div>
      <h1>${course.title}</h1>
      <div class="company">${brand.companyName || 'TrainDash.io'} — Training Course</div>
    </div>
    <div>
      <span style="font-size:0.8rem;opacity:0.8;">${course.lessons.length} chapters · ~${course.totalEstimatedMinutes} min</span>
    </div>
  </header>
  <div class="container">
    <nav class="sidebar">
      <h3>Chapters</h3>
      ${sidebarItems}
    </nav>
    <main class="main">
      ${lessonsHtml}
    </main>
  </div>
  <script>${js}</script>
</body>
</html>`;

  zip.file('index.html', html);
  zip.file('scorm.js', SCORM_API_SCRIPT);
  zip.file('imsmanifest.xml', generateScormManifest(course.id, course.title));
  zip.file('README.txt', `${course.title} — Training Course\n\nTo open this course:\n1. Unzip this folder\n2. Double-click "index.html"\n3. Your browser will open the course\n\nNo internet connection required.\nGenerated by TrainDash.io — ${brand.companyName || ''}`);

  const blob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const safeTitle = course.title.replace(/[^a-zA-Z0-9_\-]/g, '_').replace(/_+/g, '_');
  a.download = `${safeTitle}_Course.zip`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  // Delay revocation to ensure download starts
  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 1000);
}
