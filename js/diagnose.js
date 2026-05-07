// 診断フロー：質問の表示・回答の保存・タイプ判定・遷移

let questions = [];
let currentStep = 0;
let answers = {};

async function initDiagnose() {
  questions = await loadQuestions();
  answers = loadAnswers();
  currentStep = 0;
  renderStep();
}

function renderStep() {
  const q = questions[currentStep];
  const root = document.getElementById('diagnose-root');
  const progress = ((currentStep + 1) / questions.length) * 100;

  const characterMessages = (q.characterMessages || [])
    .map(
      (msg) => `
      <div class="flex items-start gap-3 mb-3">
        <img src="images/characters/dacchooo.svg" alt="だっちょ" class="w-12 h-12 rounded-full flex-shrink-0 border border-emerald-200 bg-white">
        <div class="bg-white rounded-2xl px-4 py-3 shadow-sm border border-emerald-100 max-w-md text-sm leading-relaxed text-gray-700">${msg}</div>
      </div>`
    )
    .join('');

  const optionsHTML = q.options
    .map(
      (opt) => `
      <button data-value="${opt.value}" class="option-btn w-full text-left p-4 bg-white border-2 border-emerald-100 rounded-2xl hover:border-emerald-500 hover:bg-emerald-50 transition shadow-sm">
        <div class="font-bold text-gray-800">${opt.label}</div>
        ${opt.subtext ? `<div class="text-sm text-gray-500 mt-1">${opt.subtext}</div>` : ''}
      </button>`
    )
    .join('');

  root.innerHTML = `
    <div class="max-w-xl mx-auto">
      <div class="flex items-center justify-between mb-3">
        <button id="back-btn" class="text-emerald-700 text-sm font-bold ${currentStep === 0 ? 'invisible' : ''}">← 戻る</button>
        <div class="text-sm text-gray-500">ステップ ${currentStep + 1} / ${questions.length}</div>
        <div class="text-sm text-emerald-700 font-bold">${Math.round(progress)}%</div>
      </div>
      <div class="w-full h-2 bg-emerald-100 rounded-full mb-6 overflow-hidden">
        <div class="h-full bg-emerald-600 rounded-full transition-all duration-500" style="width: ${progress}%"></div>
      </div>
      <h2 class="text-xl md:text-2xl font-bold text-gray-800 mb-2">${q.title}</h2>
      ${q.subtitle ? `<p class="text-sm text-gray-500 mb-5">${q.subtitle}</p>` : ''}
      ${characterMessages}
      <div class="grid gap-3 mt-4">
        ${optionsHTML}
      </div>
    </div>
  `;

  root.querySelectorAll('.option-btn').forEach((btn) => {
    btn.addEventListener('click', () => onSelect(btn.dataset.value));
  });

  const backBtn = document.getElementById('back-btn');
  if (backBtn) backBtn.addEventListener('click', onBack);
}

function onSelect(value) {
  const q = questions[currentStep];
  answers[q.id] = value;
  saveAnswers(answers);

  if (currentStep < questions.length - 1) {
    currentStep++;
    renderStep();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } else {
    finishDiagnose();
  }
}

function onBack() {
  if (currentStep > 0) {
    currentStep--;
    renderStep();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

function finishDiagnose() {
  const ranking = computeRanking(answers, questions);
  saveResultRanking(ranking);
  window.location.href = 'result.html';
}

function computeRanking(answers, questions) {
  const scores = { A: 0, B: 0, C: 0, D: 0, E: 0 };
  for (const q of questions) {
    const selected = answers[q.id];
    if (!selected) continue;
    const opt = q.options.find((o) => o.value === selected);
    if (!opt || !opt.weights) continue;
    for (const [type, weight] of Object.entries(opt.weights)) {
      scores[type] = (scores[type] || 0) + weight;
    }
  }
  // 同点はA→B→C→D→Eで先勝ち（順序を保ちつつスコア降順）
  const order = ['A', 'B', 'C', 'D', 'E'];
  return order
    .map((id) => ({ id, score: scores[id] }))
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return order.indexOf(a.id) - order.indexOf(b.id);
    });
}

document.addEventListener('DOMContentLoaded', initDiagnose);
