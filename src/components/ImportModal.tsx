import { ClipboardList, X } from "lucide-react";
import { useMemo, useState } from "react";
import { parseImportText } from "../services/importParser";

interface ImportModalProps {
  onClose: () => void;
  onImport: (titles: string[]) => void;
}

export function canSubmitImport(raw: string): boolean {
  return raw.trim().length > 0;
}

export function ImportModal({ onClose, onImport }: ImportModalProps) {
  const [raw, setRaw] = useState("");
  const [hasPreviewed, setHasPreviewed] = useState(false);
  const titles = useMemo(() => parseImportText(raw), [raw]);
  const showError = hasPreviewed && titles.length === 0;
  const canImport = canSubmitImport(raw);

  function handlePreview() {
    setHasPreviewed(true);
  }

  function handleImport() {
    if (titles.length === 0) {
      setHasPreviewed(true);
      return;
    }

    onImport(titles);
    setRaw("");
    setHasPreviewed(false);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-20 flex items-center justify-center bg-slate-900/20 p-4">
      <div className="flex max-h-[92vh] w-full max-w-sm flex-col rounded-md border border-slate-200 bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <ClipboardList size={17} />
            <span>批量导入</span>
          </div>
          <button className="icon-btn" type="button" title="关闭" onClick={onClose}>
            <X size={16} />
          </button>
        </div>
        <div className="min-h-0 flex-1 space-y-3 overflow-auto p-4">
          <textarea
            className="h-36 w-full resize-none rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm leading-5 text-slate-900 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            value={raw}
            onChange={(event) => {
              setRaw(event.target.value);
              setHasPreviewed(false);
            }}
            placeholder="1、整理本周计划"
          />
          {showError ? <p className="text-sm text-red-500">没有识别到有效事项，请检查格式</p> : null}
          {hasPreviewed && titles.length > 0 ? (
            <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
              <p className="mb-2 text-xs font-semibold text-slate-500">将导入 {titles.length} 条待办事项</p>
              <ol className="max-h-48 list-decimal space-y-1 overflow-auto pl-5 text-sm leading-5 text-slate-700">
                {titles.map((title, index) => (
                  <li key={`${title}-${index}`} className="break-words">
                    {title}
                  </li>
                ))}
              </ol>
            </div>
          ) : null}
        </div>
        <div className="flex justify-end gap-2 border-t border-slate-100 px-4 py-3">
          <button className="btn-secondary" type="button" onClick={onClose}>
            取消
          </button>
          <button className="btn-secondary" type="button" onClick={handlePreview}>
            预览
          </button>
          <button
            className="btn-primary"
            type="button"
            disabled={!canImport}
            onClick={handleImport}
          >
            导入
          </button>
        </div>
      </div>
    </div>
  );
}
