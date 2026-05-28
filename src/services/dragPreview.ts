interface Point {
  x: number;
  y: number;
}

interface RectOrigin {
  left: number;
  top: number;
}

export function calculatePointerOffset(pointer: Point, sourceRect: RectOrigin): Point {
  return {
    x: pointer.x - sourceRect.left,
    y: pointer.y - sourceRect.top,
  };
}

export function calculateDragPreviewPosition(pointer: Point, offset: Point): { left: number; top: number } {
  return {
    left: pointer.x - offset.x,
    top: pointer.y - offset.y,
  };
}
