// ========== الترجمة ==========
const i18n = {
  ku: {
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
    failed: 'پارچەی نەگیراوە'
  },
  ar: {
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
    failed: 'قطع لم يتم وضعها'
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
  document.getElementById('titleInput').textContent = t.title;
  document.getElementById('labelBoard').textContent = t.labelBoard;
  document.getElementById('labelPieces').textContent = t.labelPieces;
  document.getElementById('btnCalc').textContent = t.btnCalc;
  document.getElementById('labelResult').textContent = t.labelResult;
  document.getElementById('btnAgain').textContent = t.again;
  
  // تحديث placeholders
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
function addPieceRow(w = '', h = '', qty = 1) {
  const t = i18n[lang];
  const div = document.createElement('div');
  div.className = 'piece-row';
  div.dataset.id = ++pieceIdCounter;
  div.innerHTML = `
    <input type="number" placeholder="${t.width}" value="${w}" class="pw">
    <input type="number" placeholder="${t.height}" value="${h}" class="ph">
    <input type="number" placeholder="${t.qty}" value="${qty}" min="1" class="pq">
    <button onclick="this.parentElement.remove()">✕</button>
  `;
  document.getElementById('piecesList').appendChild(div);
}

// ========== الحساب الرئيسي ==========
function calculate() {
  const t = i18n[lang];
  const boardW = parseFloat(document.getElementById('boardW').value);
  const boardH = parseFloat(document.getElementById('boardH').value);
  const kerf = parseFloat(document.getElementById('kerf').value) || 0;

  if (!boardW || !boardH) return alert('يرجى إدخال قياس اللوح');

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

  if (pieces.length === 0) return alert('يرجى إضافة قطعة واحدة على الأقل');

  const result = packPieces(boardW, boardH, pieces, kerf);

  // عرض النتائج
  renderResult(boardW, boardH, result, pieces, kerf, t);
  showScreen('resultScreen');
}

function renderResult(boardW, boardH, result, pieces, kerf, t) {
  const placed = result.placed;
  const totalArea = boardW * boardH;
  const usedArea = placed.reduce((s, p) => s + p.w * p.h, 0);
  const wasteArea = totalArea - usedArea;
  const wastePercent = ((wasteArea / totalArea) * 100).toFixed(1);
  const usedPercent = ((usedArea / totalArea) * 100).toFixed(1);

  // معلومات
  const info = document.getElementById('resultInfo');
  info.innerHTML = `
    <div>${t.used}: <span>${usedPercent}%</span></div>
    <div>${t.waste}: <span>${wastePercent}%</span> (${wasteArea.toFixed(0)} سم²)</div>
    <div>عدد القطع الموضوعة: ${placed.length} / ${pieces.reduce((s,p)=>s+p.qty,0)}</div>
  `;

  // SVG
  const scale = 600 / Math.max(boardW, boardH);
  const svgW = boardW * scale;
  const svgH = boardH * scale;

  let svg = `<svg viewBox="0 0 ${svgW} ${svgH}" xmlns="http://www.w3.org/2000/svg">`;
  // اللوح
  svg += `<rect x="0" y="0" width="${svgW}" height="${svgH}" fill="#f9f9f9" stroke="#333" stroke-width="2"/>`;

  const colors = ['#FF6B6B','#4ECDC4','#45B7D1','#96CEB4','#FFEAA7','#DDA0DD','#98D8C8','#F7DC6F','#BB8FCE','#85C1E9'];

  placed.forEach((p, i) => {
    const cx = p.x * scale;
    const cy = p.y * scale;
    const cw = p.w * scale;
    const ch = p.h * scale;
    const color = colors[i % colors.length];

    svg += `<rect x="${cx}" y="${cy}" width="${cw}" height="${ch}" fill="${color}" fill-opacity="0.75" stroke="#333" stroke-width="1"/>`;

    // النص (الحجم معكوس لأن dir=rtl)
    const label = `${p.origW}×${p.origH}`;
    const fontSize = Math.min(14, Math.max(8, cw / 6));
    const textX = cx + cw / 2;
    const textY = cy + ch / 2;
    svg += `<text x="${textX}" y="${textY}" text-anchor="middle" dominant-baseline="middle" font-size="${fontSize}" fill="#000" transform="translate(${textX},${textY}) scale(-1,1) translate(${-textX},${-textY})">${label}</text>`;
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
  // إضافة صف قطعة افتراضي
  addPieceRow(40, 80, 4);
  addPieceRow(20, 200, 3);
};
