import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { TodoInput } from "./TodoInput";

describe("TodoInput", () => {
  it("uses a multiline field when adding todo content", () => {
    const html = renderToStaticMarkup(<TodoInput onAdd={() => undefined} />);

    expect(html).toContain("<textarea");
    expect(html).toContain('rows="3"');
    expect(html).toContain("resize-y");
  });
});
