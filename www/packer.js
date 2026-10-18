/**
 * خوارزمية Cutting Stock دقيقة جداً - تمنع أي تداخل
 */
function packPieces(boardW, boardH, pieces, kerf) {
  const placed = [];
  let sorted = [];
  
  // تجهيز القطع
  pieces.forEach(p => {
    for (let i = 0; i < p.qty; i++) {
      sorted.push({ w: p.w, h: p.h, id: p.id });
    }
  });
  
  // الترتيب من الأكبر للأصغر (لضمان أفضل استغلال)
  sorted.sort((a, b) => (b.w * b.h) - (a.w * a.h));

  for (const piece of sorted) {
    let bestPos = null;
    let bestY = Infinity;
    let bestX = Infinity;
    let rotated = false;

    // نبحث عن أفضل نقطة (y, x) لوضع القطعة
    for (let y = 0; y <= boardH - piece.h; y += 1) {
      for (let x = 0; x <= boardW - piece.w; x += 1) {
        if (canPlace(x, y, piece.w, piece.h, placed, kerf)) {
          if (y < bestY || (y === bestY && x < bestX)) {
            bestY = y; bestX = x; bestPos = {x: x, y: y}; rotated = false;
          }
        }
        // محاولة التدوير
        if (piece.w !== piece.h && canPlace(x, y, piece.h, piece.w, placed, kerf)) {
          if (y < bestY || (y === bestY && x < bestX)) {
            bestY = y; bestX = x; bestPos = {x: x, y: y}; rotated = true;
          }
        }
      }
    }

    if (bestPos) {
      placed.push({
        x: bestPos.x, y: bestPos.y,
        w: rotated ? piece.h : piece.w,
        h: rotated ? piece.w : piece.h,
        id: piece.id, rotated: rotated,
        origW: piece.w, origH: piece.h
      });
    }
  }

  return { placed, totalPieces: sorted.length };
}

// التحقق هل القطعة يمكن أن توضع في هذا المكان بدون تداخل
function canPlace(x, y, w, h, placed, kerf) {
  // التحقق من حدود اللوح
  if (x < 0 || y < 0) return false;

  for (let p of placed) {
    // نضيف الـ kerf إلى أبعاد القطع الموجودة للتحقق من المسافة
    const pRight = p.x + p.w + kerf;
    const pBottom = p.y + p.h + kerf;
    const newRight = x + w + kerf;
    const newBottom = y + h + kerf;

    // إذا تقاطعت القطعة الجديدة مع أي قطعة موجودة
    if (!(x >= pRight || newRight <= p.x || y >= pBottom || newBottom <= p.y)) {
      return false;
    }
  }
  return true;
}
