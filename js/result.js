// 結果表示：TOP3タイプとアフィリリンクを表示

const RANK_LABELS = ['🥇 1位', '🥈 2位', '🥉 3位'];
const RANK_COLORS = ['border-emerald-600', 'border-emerald-400', 'border-emerald-300'];
const TODAY = '2026-05-07';

// LINE公式URL：Phase 1完了後に lin.ee/XXXXX 形式に置換（だっちょ確認後・要差し替え）
const LINE_OFFICIAL_URL_BASE = 'https://lin.ee/PLACEHOLDER';

async function initResult() {
  const ranking = getResultRanking();
  if (!ranking || ranking.length === 0) {
    window.location.href = 'index.html';
    return;
  }

  const [types, affiliates] = await Promise.all([loadTypes(), loadAffiliates()]);
  const top3 = ranking.slice(0, 3).map((r) => ({
    rank: ranking.indexOf(r),
    type: types.find((t) => t.id === r.id),
    score: r.score,
  })).filter((x) => x.type);

  if (top3.length === 0) {
    window.location.href = 'index.html';
    return;
  }

  document.title = `あなたは「${top3[0].type.name}」｜節約タイプ診断`;
  renderResult(top3, affiliates);
}

function renderResult(top3, affiliates) {
  const root = document.getElementById('result-root');
  const first = top3[0].type;

  const heroCharacterMessages = (first.characterComments || [])
    .map(
      (msg) => `
      <div class="flex items-start gap-3 mb-3">
        <img src="images/characters/dacchooo.png" alt="だっちょ" class="w-12 h-12 rounded-full flex-shrink-0 border border-emerald-200 bg-white">
        <div class="bg-white rounded-2xl px-4 py-3 shadow-sm border border-emerald-100 max-w-md text-sm leading-relaxed text-gray-700">${msg}</div>
      </div>`
    )
    .join('');

  const cardsHTML = top3.map((entry, i) => renderTypeCard(entry, i, affiliates)).join('');

  root.innerHTML = `
    <div class="max-w-xl mx-auto" id="result-capture">
      <div class="text-center mb-6">
        <div class="text-sm text-emerald-700 font-bold mb-2">あなたの節約タイプ TOP 3</div>
        <div class="text-6xl mb-3">${first.emoji}</div>
        <div class="inline-block bg-emerald-600 text-white text-sm font-bold px-3 py-1 rounded-full mb-2">🥇 1位</div>
        <h1 class="text-3xl md:text-4xl font-bold text-gray-800 mb-1">${first.name}</h1>
        <p class="text-emerald-700 font-bold">${first.tagline}</p>
      </div>

      <div class="bg-white rounded-2xl p-5 shadow-sm border border-emerald-100 mb-6">
        <p class="text-sm text-gray-700 leading-relaxed">${first.summary}</p>
      </div>

      ${heroCharacterMessages}

      ${cardsHTML}

      <div class="bg-white border border-emerald-100 rounded-2xl p-4 mb-6 text-center">
        <p class="text-xs text-gray-500">節約情報の最終更新：${TODAY}</p>
      </div>
    </div>

    <div class="max-w-xl mx-auto">
      <button id="share-btn" class="block w-full bg-white hover:bg-emerald-50 text-emerald-700 font-bold py-3 rounded-full border-2 border-emerald-600 transition mb-3">
        📷 結果を画像で保存・SNSシェア
      </button>
      <a href="diagnose.html" class="block w-full text-center bg-white hover:bg-emerald-50 text-emerald-700 font-bold py-3 rounded-full border-2 border-emerald-200 transition mb-3">
        最初からやり直す
      </a>
      <a href="${LINE_OFFICIAL_URL_BASE}?from=setsuyaku&type=${first.id}" target="_blank" rel="noopener" class="block w-full text-center bg-[#06C755] hover:bg-[#05B04C] text-white font-bold py-3 rounded-full transition mb-3">
        💚 LINEで続きの節約ネタを受け取る
      </a>
      <a href="https://www.instagram.com/dacchooo_money/" target="_blank" rel="noopener" class="block w-full text-center bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-full transition">
        だっちょのインスタを見る
      </a>
      <p class="text-xs text-gray-400 text-center mt-8 leading-relaxed">※ 結果ページのリンク先には、広告（アフィリエイトリンク）を含むコンテンツがあります。</p>
      <p class="text-xs text-gray-500 text-center mt-3 space-x-3">
        <a href="about.html" class="hover:text-emerald-700 underline">運営者情報</a>
        <a href="privacy.html" class="hover:text-emerald-700 underline">プライバシーポリシー</a>
        <a href="terms.html" class="hover:text-emerald-700 underline">利用規約</a>
      </p>
      <p class="text-xs text-gray-400 text-center mt-3">© だっちょ｜お金・投資・節約</p>
    </div>
  `;

  // 改善ステップのアコーディオン制御
  root.querySelectorAll('details.steps-acc').forEach((d) => {
    d.addEventListener('toggle', () => {
      const summary = d.querySelector('summary > .acc-arrow');
      if (summary) summary.textContent = d.open ? '▲' : '▼';
    });
  });

  // 画像保存ボタン
  const shareBtn = document.getElementById('share-btn');
  if (shareBtn) shareBtn.addEventListener('click', captureAndShare);
}

function renderTypeCard(entry, index, affiliates) {
  const t = entry.type;
  const rankLabel = RANK_LABELS[index] || `${index + 1}位`;
  const borderColor = RANK_COLORS[index] || 'border-emerald-200';

  const stepsHTML = (t.improvementSteps || [])
    .map(
      (s) => `
      <div class="flex gap-3 p-3 bg-emerald-50 rounded-xl mb-2">
        <div class="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-600 text-white text-sm font-bold flex items-center justify-center">${s.step}</div>
        <div class="flex-1">
          <div class="font-bold text-gray-800 text-sm">${s.title}</div>
          <div class="text-xs text-gray-600 mt-1 leading-relaxed">${s.description}</div>
        </div>
      </div>`
    )
    .join('');

  const affiliateCards = (t.recommendedAffiliates || [])
    .map((id) => affiliates[id])
    .filter(Boolean)
    .map(
      (a) => `
      <article class="bg-white rounded-xl shadow-sm border border-emerald-100 overflow-hidden mb-3">
        <div class="p-4">
          <div class="flex items-center justify-between mb-1">
            <span class="text-xs font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded">${a.category}</span>
            <span class="text-xs font-bold text-gray-400">PR</span>
          </div>
          <h4 class="text-base font-bold text-gray-800 mb-0.5">${a.name}</h4>
          <p class="text-xs text-emerald-700 font-bold mb-2">${a.tagline}</p>
          <div class="flex items-start gap-2 mb-3 p-2 bg-emerald-50 rounded-lg">
            <img src="images/characters/dacchooo.png" alt="だっちょ" class="w-7 h-7 rounded-full flex-shrink-0 border border-emerald-200 bg-white">
            <p class="text-xs text-gray-700 leading-relaxed">${a.characterComment}</p>
          </div>
          <a href="${a.url}" target="_blank" rel="noopener sponsored" class="block w-full text-center bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm py-2.5 rounded-full transition">
            詳しく見る →
          </a>
        </div>
      </article>`
    )
    .join('');

  // 1位は詳細表示（改善ステップを開いた状態）、2位3位は折りたたみ
  const isFirst = index === 0;
  const detailsOpen = isFirst ? 'open' : '';

  return `
    <div class="bg-white rounded-2xl border-2 ${borderColor} p-5 mb-5 shadow-sm">
      <div class="flex items-center gap-2 mb-2">
        <span class="text-sm font-bold ${isFirst ? 'text-emerald-700' : 'text-gray-500'}">${rankLabel}</span>
        <span class="text-2xl">${t.emoji}</span>
      </div>
      <h3 class="text-lg font-bold text-gray-800 mb-1">${t.name}</h3>
      <p class="text-xs text-emerald-700 font-bold mb-3">${t.tagline}</p>
      ${!isFirst ? `<p class="text-xs text-gray-600 mb-3 leading-relaxed">${t.summary}</p>` : ''}

      <details class="steps-acc mb-4" ${detailsOpen}>
        <summary class="cursor-pointer text-sm font-bold text-emerald-700 mb-2 list-none flex items-center gap-1">
          <span>改善のステップ</span>
          <span class="acc-arrow">${isFirst ? '▲' : '▼'}</span>
        </summary>
        <div class="mt-2">
          ${stepsHTML}
        </div>
      </details>

      <p class="text-xs text-gray-500 mb-2">あなたにオススメ（${(t.recommendedAffiliates || []).length}件）</p>
      ${affiliateCards}
    </div>
  `;
}

async function captureAndShare() {
  const btn = document.getElementById('share-btn');
  if (!window.html2canvas) {
    alert('画像生成ライブラリが読み込めませんでした。再読み込みしてもう一度お試しください。');
    return;
  }
  const target = document.getElementById('result-capture');
  if (!target) return;

  const originalText = btn.textContent;
  btn.textContent = '⏳ 画像生成中…';
  btn.disabled = true;

  try {
    const canvas = await window.html2canvas(target, {
      backgroundColor: '#ecfdf5',
      scale: 2,
      useCORS: true,
      logging: false,
    });

    canvas.toBlob(async (blob) => {
      if (!blob) {
        alert('画像生成に失敗しました。');
        btn.textContent = originalText;
        btn.disabled = false;
        return;
      }
      const filename = `setsuyaku-shindan-${Date.now()}.png`;
      const file = new File([blob], filename, { type: 'image/png' });

      // Web Share API（モバイル）
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            files: [file],
            title: '節約タイプ診断',
            text: 'あなたの節約タイプは？診断はこちら👉',
          });
          btn.textContent = originalText;
          btn.disabled = false;
          return;
        } catch (e) {
          // 共有キャンセルされた場合はダウンロードにフォールバック
        }
      }

      // フォールバック：ダウンロード
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      btn.textContent = '✅ 画像を保存しました！';
      setTimeout(() => {
        btn.textContent = originalText;
        btn.disabled = false;
      }, 2000);
    }, 'image/png');
  } catch (e) {
    console.error(e);
    alert('画像生成に失敗しました。');
    btn.textContent = originalText;
    btn.disabled = false;
  }
}

document.addEventListener('DOMContentLoaded', initResult);
