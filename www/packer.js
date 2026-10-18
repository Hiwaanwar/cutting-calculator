function packPieces(boardW, boardH, pieces, kerf) {
  const placed = [];
  const failed = []; 
  let sorted = [];
  
  pieces.forEach(p => {
    for (let i = 0; i < p.qty; i++) {
      sorted.push({ w: p.w, h: p.h, id: p.id });
    }
  });
  
  sorted.sort((a, b) => (b.w * b.h) - (a.w * a.h));

  for (const piece of sorted) {
    let bestPos = null;
    let bestY = Infinity;
    let bestX = Infinity;
    let rotated = false;

    for (let y = 0; y <= boardH - piece.h; y += 1) {
      for (let x = 0; x <= boardW - piece.w; x += 1) {
        if (canPlace(x, y, piece.w, piece.h, placed, kerf)) {
          if (y < bestY || (y === bestY && x < bestX)) {
            bestY = y; bestX = x; bestPos = {x: x, y: y}; rotated = false;
          }
        }
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
    } else {
      failed.push({ w: piece.w, h: piece.h }); // القطع التي لم تجد مكان
    }
  }

  return { placed, failed, totalPieces: sorted.length };
}

function canPlace(x, y, w, h, placed, kerf) {
  if (x < 0 || y < 0) return false;

  for (let p of placed) {
    const pRight = p.x + p.w + kerf;
    const pBottom = p.y + p.h + kerf;
    const newRight = x + w + kerf;
    const newBottom = y + h + kerf;

    if (!(x >= pRight || newRight <= p.x || y >= pBottom || newBottom <= p.y)) {
      return false;
    }
  }
  return true;
}
