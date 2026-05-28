import { Plus } from "lucide-react";
import { FormEvent, KeyboardEvent, useState } from "react";

interface TodoInputProps {
  onAdd: (title: string) => void;
}

export function TodoInput({ onAdd }: TodoInputProps) {
  const [title, setTitle] = useState("");
  const [error, setError] = useState(false);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    submitTitle();
  }

  function submitTitle() {
    const trimmed = title.trim();

    if (!trimmed) {
      setError(true);
      return;
    }

    onAdd(trimmed);
    setTitle("");
    setError(false);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
      event.preventDefault();
      submitTitle();
    }
  }

  return (
    <form className="flex items-start gap-2" onSubmit={handleSubmit}>
      <textarea
        className={`min-h-[4.5rem] max-h-40 min-w-0 flex-1 resize-y rounded-md border bg-white px-3 py-2 text-sm leading-5 text-slate-900 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100 ${
          error ? "border-red-300" : "border-slate-200"
        }`}
        value={title}
        rows={3}
        onChange={(event) => {
          setTitle(event.target.value);
          setError(false);
        }}
        onKeyDown={handleKeyDown}
        placeholder="添加待办事项"
        aria-label="添加待办事项"
      />
      <button className="btn-primary shrink-0" type="submit" title="添加">
        <Plus size={16} />
        <span>添加</span>
      </button>
    </form>
  );
}
