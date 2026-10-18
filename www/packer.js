/**
 * خوارزمية MaxRects - الأكثر دقة لترتيب القطع مع مسافة المنشار
 */
function packPieces(boardW, boardH, pieces, kerf) {
  // المساحة المتاحة في البداية هي اللوح كاملاً
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
    let bestArea = Infinity;
    let rotated = false;

    // البحث عن أفضل مساحة فارغة تناسب القطعة
    for (let i = 0; i < freeRects.length; i++) {
      const r = freeRects[i];
      
      // 1. المحاولة بدون تدوير
      if (piece.w <= r.w && piece.h <= r.h) {
        const area = r.w * r.h;
        if (area < bestArea) { bestArea = area; bestIdx = i; rotated = false; }
      }
      // 2. المحاولة مع التدوير
      if (piece.h <= r.w && piece.w <= r.h) {
        const area = r.w * r.h;
        if (area < bestArea) { bestArea = area; bestIdx = i; rotated = true; }
      }
    }

    // إذا لم يجد مكاناً، يتخطى القطعة (يمكنك تسجيلها كقطعة غير موضوعة)
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

    // --- تحديث المساحات الفارغة (MaxRects Algorithm) ---
    let newFreeRects = [];
    
    // نمر على جميع المساحات الفارغة الحالية ونقصها بناءً على القطعة الموضوعة
    for (let i = 0; i < freeRects.length; i++) {
      const r = freeRects[i];
      
      // إذا كانت المساحة الفارغة لا تتقاطع مع القطعة الموضوعة، نحتفظ بها كما هي
      if (r.x + r.w <= rect.x || r.x >= rect.x + pw + kerf || r.y + r.h <= rect.y || r.y >= rect.y + ph + kerf) {
        newFreeRects.push(r);
        continue;
      }

      // إذا تقاطعت، نقسمها إلى 4 أجزاء (يمين، يسار، فوق، تحت) مع مراعاة الـ kerf
      // 1. الجزء الأيسر
      if (r.x < rect.x) {
        newFreeRects.push({ x: r.x, y: r.y, w: rect.x - r.x, h: r.h });
      }
      // 2. الجزء الأيمن (مع طرح الـ kerf)
      if (r.x + r.w > rect.x + pw + kerf) {
        newFreeRects.push({ 
          x: rect.x + pw + kerf, 
          y: r.y, 
          w: r.x + r.w - (rect.x + pw + kerf), 
          h: r.h 
        });
      }
      // 3. الجزء العلوي
      if (r.y < rect.y) {
        newFreeRects.push({ x: r.x, y: r.y, w: r.w, h: rect.y - r.y });
      }
      // 4. الجزء السفلي (مع طرح الـ kerf)
      if (r.y + r.h > rect.y + ph + kerf) {
        newFreeRects.push({ 
          x: r.x, 
          y: rect.y + ph + kerf, 
          w: r.w, 
          h: r.y + r.h - (rect.y + ph + kerf) 
        });
      }
    }

    // إزالة المساحات الفارغة المتداخلة أو الصغيرة جداً لتحسين الأداء
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
      // تجاهل المساحات الصغيرة جداً (أصغر من 1 سم)
      if (!isContained && newFreeRects[i].w > 1 && newFreeRects[i].h > 1) {
        freeRects.push(newFreeRects[i]);
      }
    }
  }

  return { placed, freeRects, totalPieces: sorted.length };
}
