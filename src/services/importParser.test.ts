import { describe, expect, it } from "vitest";
import { parseImportText } from "./importParser";

describe("parseImportText", () => {
  it("removes supported numbering and bullet prefixes", () => {
    expect(
      parseImportText(
        [
          "1、整理本周计划",
          "1. 阅读两篇技术文章",
          "1) 备份重要文件",
          "- 购买生活用品",
          "* 运动三十分钟",
          "• 准备明天的任务清单",
        ].join("\n"),
      ),
    ).toEqual([
      "整理本周计划",
      "阅读两篇技术文章",
      "备份重要文件",
      "购买生活用品",
      "运动三十分钟",
      "准备明天的任务清单",
    ]);
  });

  it("imports the required sample as exactly 10 titles", () => {
    const raw = `1、整理本周计划
2、阅读两篇技术文章
3、备份重要文件
4、购买生活用品
5、运动三十分钟
6、整理电脑桌面
7、5.29 完成阶段复盘
8、检查待处理邮件
9、准备明天的任务清单
10、更新软件版本`;

    const titles = parseImportText(raw);

    expect(titles).toEqual([
      "整理本周计划",
      "阅读两篇技术文章",
      "备份重要文件",
      "购买生活用品",
      "运动三十分钟",
      "整理电脑桌面",
      "5.29 完成阶段复盘",
      "检查待处理邮件",
      "准备明天的任务清单",
      "更新软件版本",
    ]);
  });

  it("ignores blank and prefix-only lines", () => {
    expect(parseImportText("\n  \n- \n* 有效事项\n2、\n")).toEqual(["有效事项"]);
  });

  it("does not treat date-like text as a dotted numbering prefix", () => {
    expect(parseImportText("5.29 完成阶段复盘")).toEqual(["5.29 完成阶段复盘"]);
  });
});
