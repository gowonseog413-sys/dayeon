export type MotionItem = {
  left: string;
  top: string;
  delay: number;
  duration: number;
  scale: number;
};

const ROW_BANDS = 3;
const COL_BANDS = 4;

function clampPct(value: number) {
  return Math.min(96, Math.max(3, value));
}

/** 상·중·하 × 좌·우 구역별 균등 배치 */
export function buildBalancedItems(count: number, seed = 1): MotionItem[] {
  const cells = ROW_BANDS * COL_BANDS;
  const base = Math.floor(count / cells);
  const extra = count % cells;
  const items: MotionItem[] = [];
  let idx = 0;

  for (let row = 0; row < ROW_BANDS; row += 1) {
    for (let col = 0; col < COL_BANDS; col += 1) {
      const cellIndex = row * COL_BANDS + col;
      const cellCount = base + (cellIndex < extra ? 1 : 0);
      const topMin = (row / ROW_BANDS) * 100;
      const topSpan = 100 / ROW_BANDS;
      const leftMin = (col / COL_BANDS) * 100;
      const leftSpan = 100 / COL_BANDS;

      for (let j = 0; j < cellCount; j += 1) {
        const i = idx;
        idx += 1;
        const jx = (((i + 1) * seed * 13) % 18) - 9;
        const jy = (((i + 1) * seed * 11) % 16) - 8;
        const slot = (j + 0.5) / Math.max(cellCount, 1);

        items.push({
          left: `${clampPct(leftMin + leftSpan * slot + jx * 0.25)}%`,
          top: `${clampPct(topMin + topSpan * (0.35 + (j % 3) * 0.2) + jy * 0.2)}%`,
          delay: (i * 0.32) % 5,
          duration: 5 + (i % 5) * 1,
          scale: 0.6 + (i % 4) * 0.15,
        });
      }
    }
  }

  for (let i = 0; i < 10; i += 1) {
    const leftSide = i % 2 === 0;
    items.push({
      left: leftSide
        ? `${clampPct(4 + (i % 5) * 2.2)}%`
        : `${clampPct(88 + (i % 5) * 1.8)}%`,
      top: `${clampPct(8 + ((i * 17) % 78))}%`,
      delay: (i * 0.41) % 4.5,
      duration: 4.5 + (i % 4) * 0.9,
      scale: 0.55 + (i % 3) * 0.14,
    });
  }

  return items;
}
