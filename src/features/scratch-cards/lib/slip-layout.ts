// Where each PIN slip sits on A4 portrait, in millimetres: two columns of five,
// ten slips a page. A slip is big enough to read and cut with scissors, and
// ten a page keeps a 600-student school to 60 sheets.

export const PAGE = { width: 210, height: 297, margin: 10 } as const;
export const SLIP = { columns: 2, rows: 5, gap: 4 } as const;
export const SLIPS_PER_PAGE = SLIP.columns * SLIP.rows;

export const SLIP_WIDTH = (PAGE.width - PAGE.margin * 2 - SLIP.gap * (SLIP.columns - 1)) / SLIP.columns;
export const SLIP_HEIGHT = (PAGE.height - PAGE.margin * 2 - SLIP.gap * (SLIP.rows - 1)) / SLIP.rows;

export interface SlipPosition {
  page: number; // 0-based
  x: number;
  y: number;
}

// Filled row by row, left to right, so the order on paper matches the list.
export function slipPosition(index: number): SlipPosition {
  const page = Math.floor(index / SLIPS_PER_PAGE);
  const onPage = index % SLIPS_PER_PAGE;
  const column = onPage % SLIP.columns;
  const row = Math.floor(onPage / SLIP.columns);
  return {
    page,
    x: PAGE.margin + column * (SLIP_WIDTH + SLIP.gap),
    y: PAGE.margin + row * (SLIP_HEIGHT + SLIP.gap),
  };
}
