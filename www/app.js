// ========== الترجمة ==========
const i18n = {
  ku: {
    langTitle: 'زمان',
    langDesc: 'تکایە زمانێ خۆ هەڵبژێرە',
    title: 'حاسبة بڕین',
    labelBoard: 'پێوانەی تەختەکە',
    labelPieces: 'پارچەکان',
    btnCalc: 'حیساب بکە',
    labelResult: 'نەخشەی بڕین',
    width: 'پانی',
    height: 'درێژی',
    kerf: 'ئەستووری مشاری',
    qty: 'ژمارە',
    addPiece: '+ پارچە زیاد بکە',
    again: 'بڕینی نوێ',
    waste: 'بەفیڕۆچوو',
    used: 'بەکارهاتوو',
    boardsNeeded: 'ژمارەی تەختە پێویستەکان',
    oneBoard: 'تەنها یەک تەختە',
    moreBoards: 'زیاتر لە یەک تەختە (پێویستت بە تەختەی زیاترە)',
    warnTitle: '⚠️ ئاگاداری: شوێن نەماوە!',
    warnDesc: 'پارچەی کەمە، پێویستت بە تەختەیەکی تر هەیە.',
    piecesInBoard: 'ژمارەی پارچەکان لەم تەختەیەدا',
    totalPieces: 'کۆی پارچەکان',
    errBoard: 'تکایە پێوانەی تەختەکە بنووسە',
    errPieces: 'تکایە لانیکەم یەک پارچە زیاد بکە',
    piecesCount: 'پارچە'
  },
  ar: {
    langTitle: 'زمان',
    langDesc: 'الرجاء اختيار اللغة',
    title: 'حاسبة القطع',
    labelBoard: 'قياس اللوح الكامل',
    labelPieces: 'القطع المطلوبة',
    btnCalc: 'احسب',
    labelResult: 'مخطط القطع',
    width: 'العرض',
    height: 'الطول',
    kerf: 'سماكة المنشار',
    qty: 'العدد',
    addPiece: '+ إضافة قطعة',
    again: 'قطع جديد',
    waste: 'الهوالك',
    used: 'المستخدم',
    boardsNeeded: 'عدد الألواح المطلوبة',
    oneBoard: 'لوح واحد فقط',
    moreBoards: 'أكثر من لوح (تحتاج لوح إضافي)',
    warnTitle: '⚠️ تنبيه: لم تكفي المساحة!',
    warnDesc: 'قطعة ناقصة تحتاج إلى لوح آخر.',
    piecesInBoard: 'عدد القطع في هذا اللوح',
    totalPieces: 'إجمالي القطع',
    errBoard: 'يرجى إدخال قياس اللوح',
    errPieces: 'يرجى إضافة قطعة واحدة على الأقل',
    piecesCount: 'قطعة'
  }
};

let lang = 'ku';
let pieceIdCounter = 0;

// ========== إعدادات اللغة ==========
function selectLang(l) {
  lang = l;
  localStorage.setItem('cutting_lang', l);
  document.documentElement.lang = l;
  document.documentElement.dir = 'rtl';
  applyLang();
  showScreen('inputScreen');
}

function applyLang() {
  const t = i18n[lang];
  document.getElementById('langScreenTitle').textContent = t.langTitle;
  document.getElementById('langScreenDesc').textContent = t.langDesc;
  document.getElementById('titleInput').textContent = t.title;
  document.getElementById('labelBoard').textContent = t.labelBoard;
  document.getElementById('labelPieces').textContent = t.labelPieces;
  document.getElementById('btnCalc').textContent = t.btnCalc;
  document.getElementById('btnAddPiece').textContent = t.addPiece;
  document.getElementById('labelResult').textContent = t.labelResult;
  document.getElementById('btnAgain').textContent = t.again;
  
  document.getElementById('boardW').placeholder = t.width;
  document.getElementById('boardH').placeholder = t.height;
  document.getElementById('kerf').placeholder = t.kerf;
}

// ========== التنقل بين الشاشات ==========
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

function goBack() {
  showScreen('inputScreen');
}

// ========== إدارة القطع ==========
function addPieceRow(w = '', h = '', qty = '') {
  const t = i18n[lang];
  const div = document.createElement('div');
  div.className = 'piece-row';
  div.dataset.id = ++pieceIdCounter;
  
  div.innerHTML = `
    <div style="display:flex; gap:8px; width:100%; margin-bottom:4px; padding-right:50px;">
      <div style="flex:1; text-align:center; font-size:12px; color:#555; font-weight:bold;">${t.width}</div>
      <div style="flex:1; text-align:center; font-size:12px; color:#555; font-weight:bold;">${t.height}</div>
      <div style="flex:1; text-align:center; font-size:12px; color:#555; font-weight:bold;">${t.qty}</div>
    </div>
    <div style="display:flex; gap:8px; width:100%; align-items:center;">
      <input type="number" placeholder="${t.width}" value="${w}" class="pw" inputmode="decimal">
      <input type="number" placeholder="${t.height}" value="${h}" class="ph" inputmode="decimal">
      <input type="number" placeholder="${t.qty}" value="${qty}" class="pq" inputmode="numeric">
      <button onclick="this.parentElement.parentElement.remove()" style="width:42px;">✕</button>
    </div>
  `;
  document.getElementById('piecesList').appendChild(div);
}

// ========== الحساب الرئيسي ==========
function calculate() {
  const t = i18n[lang];
  const boardW = parseFloat(document.getElementById('boardW').value);
  const boardH = parseFloat(document.getElementById('boardH').value);
  const kerf = parseFloat(document.getElementById('kerf').value) || 0;

  if (!boardW || !boardH) return alert(t.errBoard);

  const rows = document.querySelectorAll('#piecesList .piece-row');
  const pieces = [];
  rows.forEach(row => {
    const w = parseFloat(row.querySelector('.pw').value);
    const h = parseFloat(row.querySelector('.ph').value);
    const q = parseInt(row.querySelector('.pq').value);
    if (w > 0 && h > 0 && q > 0) {
      pieces.push({ w, h, qty: q, id: row.dataset.id });
    }
  });

  if (pieces.length === 0) return alert(t.errPieces);

  const result = packPieces(boardW, boardH, pieces, kerf);
  renderResult(boardW, boardH, result, pieces, kerf);
  showScreen('resultScreen');
}

// ========== رسم النتائج ==========
function renderResult(boardW, boardH, result, pieces, kerf) {
  const t = i18n[lang];
  const placed = result.placed;
  const failed = result.failed || [];
  const totalArea = boardW * boardH;
  const usedArea = placed.reduce((s, p) => s + (p.w * p.h), 0);
  const wasteArea = totalArea - usedArea;
  const wastePercent = ((wasteArea / totalArea) * 100).toFixed(1);
  const usedPercent = ((usedArea / totalArea) * 100).toFixed(1);

  const totalQty = pieces.reduce((s,p)=>s+p.qty,0);
  const boardsNeeded = failed.length > 0 ? t.moreBoards : t.oneBoard;

  const info = document.getElementById('resultInfo');
  
  let html = `
    <div style="background:#1e3a5f; color:white; padding:8px; border-radius:8px; text-align:center; margin-bottom:12px; font-weight:bold;">
      ${t.boardsNeeded}: ${boardsNeeded}
    </div>
    <div>${t.used}: <span>${usedPercent}%</span></div>
    <div>${t.waste}: <span>${wastePercent}%</span> (${wasteArea.toFixed(0)} سم²)</div>
    <div>${t.piecesInBoard}: ${placed.length} / ${totalQty}</div>
  `;

  if (failed.length > 0) {
    html += `
      <div style="background:#ffe6e6; border: 2px solid #ff4d4d; color:#cc0000; padding:10px; border-radius:8px; margin-top:12px; text-align:center;">
        <div style="font-size:18px; font-weight:bold; margin-bottom:6px;">${t.warnTitle}</div>
        <div>يوجد <strong>${failed.length}</strong> ${t.warnDesc}</div>
        <div style="font-size:14px; margin-top:8px; background:#fff; padding:6px; border-radius:6px;">
          ${failed.map(f => `<span style="display:inline-block; margin:2px; padding:2px 6px; border:1px solid #ff4d4d; border-radius:4px;">${f.w}×${f.h}</span>`).join('')}
        </div>
      </div>
    `;
  }

  info.innerHTML = html;

  const scale = 600 / Math.max(boardW, boardH);
  const svgW = boardW * scale;
  const svgH = boardH * scale;

  let svg = `<svg viewBox="0 0 ${svgW} ${svgH}" xmlns="http://www.w3.org/2000/svg" style="direction: ltr;">`;
  svg += `<rect x="0" y="0" width="${svgW}" height="${svgH}" fill="#fcfcfc" stroke="#333" stroke-width="2"/>`;

  const colors = ['#FF6B6B','#4ECDC4','#45B7D1','#96CEB4','#FFEAA7','#DDA0DD','#98D8C8','#F7DC6F','#BB8FCE','#85C1E9'];

  placed.forEach((p, i) => {
    const cx = p.x * scale;
    const cy = p.y * scale;
    const cw = p.w * scale;
    const ch = p.h * scale;
    const color = colors[i % colors.length];

    svg += `<rect x="${cx}" y="${cy}" width="${cw}" height="${ch}" fill="${color}" fill-opacity="0.85" stroke="#222" stroke-width="1.5"/>`;

    const label = `${p.origW}×${p.origH}`;
    let fontSize = Math.min(16, Math.max(8, cw / 6, ch / 3));
    const textWidth = label.length * fontSize * 0.6;
    const textHeight = fontSize * 1.2;

    if (cw > textWidth && ch > textHeight) {
      const textX = cx + cw / 2;
      const textY = cy + ch / 2;
      svg += `<text x="${textX}" y="${textY}" text-anchor="middle" dominant-baseline="middle" font-size="${fontSize}" fill="#000" font-weight="bold" style="direction:ltr;">${label}</text>`;
    }
  });

  svg += `</svg>`;
  document.getElementById('svgContainer').innerHTML = svg;
}

// ========== التهيئة ==========
window.onload = function() {
  const saved = localStorage.getItem('cutting_lang');
  if (saved) {
    lang = saved;
    document.documentElement.lang = saved;
    document.documentElement.dir = 'rtl';
    applyLang();
    showScreen('inputScreen');
  } else {
    showScreen('langScreen');
  }
};
