function packPieces(boardW, boardH, pieces, kerf) {
  const placed = [];
  const failed = [];

  // تجهيز القطع وترتيبها من الأكبر إلى الأصغر
  let sorted = [];
  pieces.forEach(p => {
    for (let i = 0; i < p.qty; i++) {
      sorted.push({ w: p.w, h: p.h, id: p.id });
    }
  });
  // الترتيب مهم جداً لنجاح الخوارزمية
  sorted.sort((a, b) => Math.max(b.w, b.h) - Math.max(a.w, a.h));

  // المساحة المتاحة في البداية هي اللوح كاملاً
  let freeRects = [{ x: 0, y: 0, w: boardW, h: boardH }];

  for (const piece of sorted) {
    let bestRect = null;
    let bestShortSideFit = Infinity;
    let bestLongSideFit = Infinity;
    let rotated = false;

    // البحث عن أفضل مساحة تناسب القطعة (MaxRects - Best Short Side Fit)
    for (const rect of freeRects) {
      // 1. المحاولة بدون تدوير
      if (piece.w <= rect.w && piece.h <= rect.h) {
        const leftoverHoriz = Math.abs(rect.w - piece.w);
        const leftoverVert = Math.abs(rect.h - piece.h);
        const shortSideFit = Math.min(leftoverHoriz, leftoverVert);
        const longSideFit = Math.max(leftoverHoriz, leftoverVert);

        if (shortSideFit < bestShortSideFit || (shortSideFit === bestShortSideFit && longSideFit < bestLongSideFit)) {
          bestRect = { x: rect.x, y: rect.y, w: piece.w, h: piece.h };
          bestShortSideFit = shortSideFit;
          bestLongSideFit = longSideFit;
          rotated = false;
        }
      }
      // 2. المحاولة مع تدوير
      if (piece.h <= rect.w && piece.w <= rect.h) {
        const leftoverHoriz = Math.abs(rect.w - piece.h);
        const leftoverVert = Math.abs(rect.h - piece.w);
        const shortSideFit = Math.min(leftoverHoriz, leftoverVert);
        const longSideFit = Math.max(leftoverHoriz, leftoverVert);

        if (shortSideFit < bestShortSideFit || (shortSideFit === bestShortSideFit && longSideFit < bestLongSideFit)) {
          bestRect = { x: rect.x, y: rect.y, w: piece.h, h: piece.w };
          bestShortSideFit = shortSideFit;
          bestLongSideFit = longSideFit;
          rotated = true;
        }
      }
    }

    if (bestRect) {
      // إضافة القطعة
      placed.push({
        x: bestRect.x, y: bestRect.y, w: bestRect.w, h: bestRect.h,
        id: piece.id, rotated: rotated,
        origW: piece.w, origH: piece.h
      });

      // --- تحديث المساحات الفارغة (MaxRects Algorithm) ---
      let newFreeRects = [];
      const pw = bestRect.w;
      const ph = bestRect.h;

      for (const free of freeRects) {
        // إذا لم تكن المساحة تتقاطع مع القطعة الموضوعة
        if (free.x >= bestRect.x + pw + kerf || free.x + free.w <= bestRect.x || 
            free.y >= bestRect.y + ph + kerf || free.y + free.h <= bestRect.y) {
          newFreeRects.push(free);
          continue;
        }

        // إذا تقاطعت، نقسمها إلى 4 أجزاء
        // يسار
        if (free.x < bestRect.x) newFreeRects.push({ x: free.x, y: free.y, w: bestRect.x - free.x, h: free.h });
        // يمين
        if (free.x + free.w > bestRect.x + pw + kerf) newFreeRects.push({ x: bestRect.x + pw + kerf, y: free.y, w: free.x + free.w - (bestRect.x + pw + kerf), h: free.h });
        // فوق
        if (free.y < bestRect.y) newFreeRects.push({ x: free.x, y: free.y, w: free.w, h: bestRect.y - free.y });
        // تحت
        if (free.y + free.h > bestRect.y + ph + kerf) newFreeRects.push({ x: free.x, y: bestRect.y + ph + kerf, w: free.w, h: free.y + free.h - (bestRect.y + ph + kerf) });
      }

      // إزالة المساحات الصغيرة جداً والمتداخلة
      freeRects = [];
      for (let i = 0; i < newFreeRects.length; i++) {
        let isContained = false;
        for (let j = 0; j < newFreeRects.length; j++) {
          if (i !== j && 
              newFreeRects[i].x >= newFreeRects[j].x && 
              newFreeRects[i].y >= newFreeRects[j].y &&
              newFreeRects[i].x + newFreeRects[i].w <= newFreeRects[j].x + newFreeRects[j].w &&
              newFreeRects[i].y + newFreeRects[i].h <= newFreeRects[j].y + newFreeRects[j].h) {
            isContained = true; break;
          }
        }
        if (!isContained && newFreeRects[i].w > 0.1 && newFreeRects[i].h > 0.1) {
          freeRects.push(newFreeRects[i]);
        }
      }
    } else {
      // إذا لم يجد مكاناً
      failed.push({ w: piece.w, h: piece.h });
    }
  }

  return { placed, failed, totalPieces: sorted.length };
}
