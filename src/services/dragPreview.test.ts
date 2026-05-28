import { describe, expect, it } from "vitest";
import { calculateDragPreviewPosition, calculatePointerOffset } from "./dragPreview";

describe("dragPreview", () => {
  it("keeps the preview aligned with the source row at drag start", () => {
    const sourceRect = { left: 120, top: 240 };
    const pointer = { x: 132, y: 251 };
    const offset = calculatePointerOffset(pointer, sourceRect);

    expect(calculateDragPreviewPosition(pointer, offset)).toEqual({ left: 120, top: 240 });
  });

  it("moves the preview by the same delta as the pointer", () => {
    const offset = { x: 12, y: 11 };

    expect(calculateDragPreviewPosition({ x: 150, y: 285 }, offset)).toEqual({ left: 138, top: 274 });
  });
});
