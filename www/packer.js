/**
 * خوارزمية تقطيع مستطيلات بسيطة (Guillotine Best-Fit)
 * تُرجع قائمة المواضع لكل قطعة
 */
function packPieces(boardW, boardH, pieces, kerf) {
  const bins = [{ x: 0, y: 0, w: boardW, h: boardH }];
  const placed = [];

  // الترتيب: القطع الكبيرة أولاً
  const sorted = [];
  pieces.forEach(p => {
    for (let i = 0; i < p.qty; i++) {
      sorted.push({ w: p.w, h: p.h, id: p.id });
    }
  });
  sorted.sort((a, b) => (b.w * b.h) - (a.w * a.h));

  const freeRects = [{ x: 0, y: 0, w: boardW, h: boardH }];

  for (const piece of sorted) {
    let bestIdx = -1;
    let bestWaste = Infinity;
    let rotated = false;

    for (let i = 0; i < freeRects.length; i++) {
      const r = freeRects[i];
      // بدون دوران
      if (piece.w <= r.w && piece.h <= r.h) {
        const waste = (r.w * r.h) - (piece.w * piece.h);
        if (waste < bestWaste) { bestWaste = waste; bestIdx = i; rotated = false; }
      }
      // مع دوران
      if (piece.h <= r.w && piece.w <= r.h) {
        const waste = (r.w * r.h) - (piece.h * piece.w);
        if (waste < bestWaste) { bestWaste = waste; bestIdx = i; rotated = true; }
      }
    }

    if (bestIdx === -1) {
      // لا توجد مساحة كافية، نتجاهل هذه القطعة (أو يمكن تسجيلها كفشل)
      continue;
    }

    const rect = freeRects[bestIdx];
    const pw = rotated ? piece.h : piece.w;
    const ph = rotated ? piece.w : piece.h;

    placed.push({
      x: rect.x, y: rect.y, w: pw, h: ph,
      id: piece.id, rotated: rotated,
      origW: piece.w, origH: piece.h
    });

    // تقسيم Guillotine: نقسم إلى قسمين (يمين + أسفل)
    freeRects.splice(bestIdx, 1);

    const rightW = rect.w - pw - kerf;
    const bottomH = rect.h - ph - kerf;

    if (rightW > 0) {
      freeRects.push({ x: rect.x + pw + kerf, y: rect.y, w: rightW, h: rect.h });
    }
    if (bottomH > 0) {
      freeRects.push({ x: rect.x, y: rect.y + ph + kerf, w: rect.w, h: bottomH });
    }

    // دمج المناطق الحرة (تبسيط: تجاهل الدمج المعقد)
  }

  return { placed, freeRects, totalPieces: sorted.length };
}
