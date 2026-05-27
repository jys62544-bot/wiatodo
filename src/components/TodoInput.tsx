import { Plus } from "lucide-react";
import { FormEvent, useState } from "react";

interface TodoInputProps {
  onAdd: (title: string) => void;
}

export function TodoInput({ onAdd }: TodoInputProps) {
  const [title, setTitle] = useState("");
  const [error, setError] = useState(false);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const trimmed = title.trim();

    if (!trimmed) {
      setError(true);
      return;
    }

    onAdd(trimmed);
    setTitle("");
    setError(false);
  }

  return (
    <form className="flex gap-2" onSubmit={handleSubmit}>
      <input
        className={`min-w-0 flex-1 rounded-md border bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100 ${
          error ? "border-red-300" : "border-slate-200"
        }`}
        value={title}
        onChange={(event) => {
          setTitle(event.target.value);
          setError(false);
        }}
        placeholder="添加待办事项"
      />
      <button className="btn-primary shrink-0" type="submit" title="添加">
        <Plus size={16} />
        <span>添加</span>
      </button>
    </form>
  );
}
