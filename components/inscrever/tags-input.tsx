"use client";

import { useState, type ClipboardEvent, type KeyboardEvent } from "react";
import { X } from "lucide-react";

import { Badge } from "@/components/ui/badge";

const MAX_LENGTH = 45;
const MAX_TAGS = 50;

const cleanName = (raw: string) =>
  raw
    .replace(/^[0-9]+[-.]?\s*/, "")
    .replace(/[^a-zà-ú\s]/gi, "")
    .replace(/[-\s]+$/, "")
    .trim();

export function TagsInput({
  value,
  onChange,
  placeholder,
}: {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
}) {
  const [input, setInput] = useState("");

  const addMany = (names: string[]) => {
    const next = [...value];
    for (const raw of names) {
      const name = cleanName(raw);
      if (!name || name.length > MAX_LENGTH) continue;
      if (next.length >= MAX_TAGS) break;
      if (!next.includes(name)) next.push(name);
    }
    onChange(next);
  };

  const removeTag = (index: number) =>
    onChange(value.filter((_, i) => i !== index));

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === "," || e.key === ";") {
      e.preventDefault();
      addMany([input]);
      setInput("");
    } else if (e.key === "Backspace" && input === "" && value.length > 0) {
      removeTag(value.length - 1);
    }
  };

  const onPaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text");
    addMany(text.split(/\s*[,;\r\n]+\s*/));
    setInput("");
  };

  return (
    <div className="flex min-h-10 w-full flex-wrap items-center gap-1.5 rounded-md border border-input bg-transparent px-2 py-1.5 text-sm transition-[box-shadow] focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50">
      {value.map((tag, index) => (
        <Badge key={`${tag}-${index}`} variant="secondary" className="gap-1">
          {tag}
          <button
            type="button"
            onClick={() => removeTag(index)}
            aria-label={`Remover ${tag}`}
            className="rounded-full transition-colors hover:text-destructive"
          >
            <X className="size-3" />
          </button>
        </Badge>
      ))}
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={onKeyDown}
        onPaste={onPaste}
        placeholder={value.length === 0 ? placeholder : ""}
        className="min-w-[80px] flex-1 bg-transparent outline-none placeholder:text-muted-foreground sm:min-w-[120px]"
      />
    </div>
  );
}
