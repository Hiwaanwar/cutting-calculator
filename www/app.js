function renderResult(boardW, boardH, result, pieces, kerf) {
  const t = i18n[lang];
  const placed = result.placed;
  const failed = result.failed; // استدعاء القطع الناقصة
  const totalArea = boardW * boardH;
  const usedArea = placed.reduce((s, p) => s + (p.w * p.h), 0);
  const wasteArea = totalArea - usedArea;
  const wastePercent = ((wasteArea / totalArea) * 100).toFixed(1);
  const usedPercent = ((usedArea / totalArea) * 100).toFixed(1);

  const totalQty = pieces.reduce((s,p)=>s+p.qty,0);
  
  // حساب هل يحتاج لوح اخر ام لا
  const boardsNeeded = failed.length > 0 ? "أكثر من لوح (تحتاج لوح إضافي)" : "لوح واحد فقط";

  const info = document.getElementById('resultInfo');
  
  // بناء الإحصائيات مع المربع الأزرق
  let html = `
    <div style="background:#1e3a5f; color:white; padding:8px; border-radius:8px; text-align:center; margin-bottom:12px; font-weight:bold;">
      عدد الألواح المطلوبة: ${boardsNeeded}
    </div>
    <div>${t.used}: <span>${usedPercent}%</span></div>
    <div>${t.waste}: <span>${wastePercent}%</span> (${wasteArea.toFixed(0)} سم²)</div>
    <div>عدد القطع في هذا اللوح: ${placed.length} / ${totalQty}</div>
  `;

  // المربع الأحمر للقطع الناقصة
  if (failed.length > 0) {
    html += `
      <div style="background:#ffe6e6; border: 2px solid #ff4d4d; color:#cc0000; padding:10px; border-radius:8px; margin-top:12px; text-align:center;">
        <div style="font-size:18px; font-weight:bold; margin-bottom:6px;">⚠️ تنبيه: لم تكفي المساحة!</div>
        <div>يوجد <strong>${failed.length}</strong> قطعة ناقصة تحتاج إلى لوح آخر.</div>
        <div style="font-size:14px; margin-top:8px; background:#fff; padding:6px; border-radius:6px;">
          ${failed.map(f => `<span style="display:inline-block; margin:2px; padding:2px 6px; border:1px solid #ff4d4d; border-radius:4px;">${f.w}×${f.h}</span>`).join('')}
        </div>
      </div>
    `;
  }

  info.innerHTML = html;

  // --- بقية كود الرسم (SVG) ---
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
 
