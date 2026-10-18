/**
 * خوارزمية تقطيع مستطيلات مع احتساب مسافة المنشار (Kerf)
 */
function packPieces(boardW, boardH, pieces, kerf) {
  // قائمة المساحات الفارغة في اللوح
  let freeRects = [{ x: 0, y: 0, w: boardW, h: boardH }];
  const placed = [];

  // تجهيز القطع وترتيبها من الأكبر إلى الأصغر (لضمان أفضل استغلال)
  let sorted = [];
  pieces.forEach(p => {
    for (let i = 0; i < p.qty; i++) {
      sorted.push({ w: p.w, h: p.h, id: p.id });
    }
  });
  sorted.sort((a, b) => (b.w * b.h) - (a.w * a.h));

  for (const piece of sorted) {
    let bestIdx = -1;
    let bestWaste = Infinity;
    let rotated = false;

    // البحث عن أفضل مكان للقطعة
    for (let i = 0; i < freeRects.length; i++) {
      const r = freeRects[i];
      
      // المحاولة بدون تدوير
      if (piece.w <= r.w && piece.h <= r.h) {
        const waste = (r.w * r.h) - (piece.w * piece.h);
        if (waste < bestWaste) { bestWaste = waste; bestIdx = i; rotated = false; }
      }
      // المحاولة مع التدوير
      if (piece.h <= r.w && piece.w <= r.h) {
        const waste = (r.w * r.h) - (piece.h * piece.w);
        if (waste < bestWaste) { bestWaste = waste; bestIdx = i; rotated = true; }
      }
    }

    // إذا لم يجد مكاناً، يتخطى القطعة
    if (bestIdx === -1) continue;

    const rect = freeRects[bestIdx];
    const pw = rotated ? piece.h : piece.w;
    const ph = rotated ? piece.w : piece.h;

    // إضافة القطعة
    placed.push({
      x: rect.x, y: rect.y, w: pw, h: ph,
      id: piece.id, rotated: rotated,
      origW: piece.w, origH: piece.h
    });

    // إزالة المساحة المستخدمة
    freeRects.splice(bestIdx, 1);

    // حساب المساحات المتبقية (يمين وأسفل) مع طرح مسافة المنشار (kerf)
    const rightW = rect.w - pw - kerf;
    const bottomH = rect.h - ph - kerf;

    if (rightW > 0) {
      freeRects.push({ x: rect.x + pw + kerf, y: rect.y, w: rightW, h: rect.h });
    }
    if (bottomH > 0) {
      freeRects.push({ x: rect.x, y: rect.y + ph + kerf, w: rect.w, h: bottomH });
    }
  }

  return { placed, freeRects, totalPieces: sorted.length };
}
