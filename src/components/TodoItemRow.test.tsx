import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { TodoEditForm } from "./TodoItemRow";

describe("TodoItemRow editing", () => {
  it("uses a multiline editable field for long todo content", () => {
    const html = renderToStaticMarkup(
      <TodoEditForm
        value="这是一条很长的待办内容，需要在编辑模式下直接换行显示，而不是挤在一行里横向滚动"
        hasError={false}
        onChange={() => undefined}
        onCancel={() => undefined}
        onSave={() => undefined}
      />,
    );

    expect(html).toContain("<textarea");
    expect(html).toContain('rows="3"');
    expect(html).toContain("resize-y");
  });
});
