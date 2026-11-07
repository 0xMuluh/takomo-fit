"use client";

import { useRef } from "react";
import { useI18n } from "@/i18n/context";
import { Button } from "../ui";

/** Native camera on phones (full resolution, no permission prompt), file picker everywhere else. */
export function MediaPicker({
  kind,
  onPick,
  label,
}: {
  kind: "photo" | "video";
  onPick: (f: File) => void;
  label?: string;
}) {
  const l = useI18n();
  const camera = useRef<HTMLInputElement>(null);
  const library = useRef<HTMLInputElement>(null);
  const accept = kind === "photo" ? "image/*" : "video/*";
  const take = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (f) onPick(f);
  };
  return (
    <div className="flex flex-col gap-2 sm:flex-row">
      <Button onClick={() => camera.current?.click()} className="flex-1">
        {label ?? (kind === "photo" ? l.t.media.takePhoto : l.t.media.recordVideo)}
      </Button>
      <Button variant="secondary" onClick={() => library.current?.click()} className="flex-1">
        {l.t.media.library}
      </Button>
      <input ref={camera} type="file" accept={accept} capture="environment" hidden onChange={take} />
      <input ref={library} type="file" accept={accept} hidden onChange={take} />
    </div>
  );
}
