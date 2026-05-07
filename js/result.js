// 結果表示：タイプ別カードとアフィリリンク表示

async function initResult() {
  const typeId = getResultType();
  if (!typeId) {
    window.location.href = 'index.html';
    return;
  }

  const [types, affiliates] = await Promise.all([loadTypes(), loadAffiliates()]);
  const type = types.find((t) => t.id === typeId);
  if (!type) {
    window.location.href = 'index.html';
    return;
  }

  document.title = `あなたは「${type.name}」｜節約タイプ診断`;
  renderResult(type, affiliates);
}

function renderResult(type, affiliates) {
  const root = document.getElementById('result-root');
  const characterMessages = (type.characterComments || [])
    .map(
      (msg) => `
      <div class="flex items-start gap-3 mb-3">
        <img src="images/characters/dacchooo.svg" alt="だっちょ" class="w-12 h-12 rounded-full flex-shrink-0 border border-emerald-200 bg-white">
        <div class="bg-white rounded-2xl px-4 py-3 shadow-sm border border-emerald-100 max-w-md text-sm leading-relaxed text-gray-700">${msg}</div>
      </div>`
    )
    .join('');

  const stepsHTML = type.improvementSteps
    .map(
      (s) => `
      <div class="flex gap-4 p-4 bg-white rounded-2xl shadow-sm border border-emerald-100">
        <div class="flex-shrink-0 w-10 h-10 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center">${s.step}</div>
        <div>
          <div class="font-bold text-gray-800">${s.title}</div>
          <div class="text-sm text-gray-600 mt-1 leading-relaxed">${s.description}</div>
        </div>
      </div>`
    )
    .join('');

  const affiliateCards = type.recommendedAffiliates
    .map((id) => affiliates[id])
    .filter(Boolean)
    .map(
      (a) => `
      <article class="bg-white rounded-2xl shadow-sm border-2 border-emerald-100 overflow-hidden">
        <div class="p-5">
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded">${a.category}</span>
            <span class="text-xs font-bold text-gray-400">PR</span>
          </div>
          <h3 class="text-lg font-bold text-gray-800 mb-1">${a.name}</h3>
          <p class="text-sm text-emerald-700 font-bold mb-3">${a.tagline}</p>
          <ul class="space-y-1 mb-4">
            ${a.features.map((f) => `<li class="text-sm text-gray-600 flex gap-2"><span class="text-emerald-600">✓</span>${f}</li>`).join('')}
          </ul>
          <div class="flex items-start gap-2 mb-4 p-3 bg-emerald-50 rounded-xl">
            <img src="images/characters/dacchooo.svg" alt="だっちょ" class="w-8 h-8 rounded-full flex-shrink-0 border border-emerald-200 bg-white">
            <p class="text-sm text-gray-700 leading-relaxed">${a.characterComment}</p>
          </div>
          <a href="${a.url}" target="_blank" rel="noopener sponsored" class="block w-full text-center bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-full transition">
            詳しく見る →
          </a>
        </div>
      </article>`
    )
    .join('');

  root.innerHTML = `
    <div class="max-w-xl mx-auto">
      <div class="text-center mb-6">
        <div class="text-sm text-emerald-700 font-bold mb-2">あなたの節約タイプは…</div>
        <div class="text-6xl mb-3">${type.emoji}</div>
        <h1 class="text-3xl md:text-4xl font-bold text-gray-800 mb-1">${type.name}</h1>
        <p class="text-emerald-700 font-bold">${type.tagline}</p>
      </div>

      <div class="bg-white rounded-2xl p-5 shadow-sm border border-emerald-100 mb-6">
        <p class="text-sm text-gray-700 leading-relaxed">${type.summary}</p>
      </div>

      ${characterMessages}

      <h2 class="text-xl font-bold text-gray-800 mt-10 mb-4">改善のステップ</h2>
      <div class="space-y-3 mb-10">
        ${stepsHTML}
      </div>

      <h2 class="text-xl font-bold text-gray-800 mb-2">あなたにオススメ</h2>
      <p class="text-xs text-gray-500 mb-4">※ 各リンクには広告（PR）が含まれます</p>
      <div class="space-y-4 mb-10">
        ${affiliateCards}
      </div>

      <div class="space-y-3">
        <a href="diagnose.html" class="block w-full text-center bg-white hover:bg-emerald-50 text-emerald-700 font-bold py-3 rounded-full border-2 border-emerald-600 transition">最初からやり直す</a>
        <a href="https://www.instagram.com/dacchooo_money/" target="_blank" rel="noopener" class="block w-full text-center bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-full transition">だっちょのインスタを見る</a>
      </div>

      <p class="text-xs text-gray-400 text-center mt-8">© だっちょ｜お金・投資・節約</p>
    </div>
  `;
}

document.addEventListener('DOMContentLoaded', initResult);
