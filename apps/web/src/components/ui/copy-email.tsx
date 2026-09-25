"use client";

import { Check, Copy } from "@phosphor-icons/react";
import { useState } from "react";
import { MailLink } from "./mail-link";

export function CopyEmail({ email }: { email: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      window.location.href = `mailto:${email}`;
    }
  };

  return (
    <div className="group inline-flex max-w-full items-center gap-2 rounded-full border border-line-strong bg-ink/60 p-1.5 pl-4 sm:pl-5">
      <MailLink className="block min-w-0 truncate font-mono text-[13px] text-fg sm:text-sm transition-colors hover:text-accent md:text-base">{email}</MailLink>
      <button
        type="button"
        onClick={copy}
        aria-label={copied ? "Email copied" : "Copy email"}
        className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-fg transition-transform duration-500 ease-[var(--ease-spring)] hover:scale-105 active:scale-95"
      >
        {copied ? <Check size={14} weight="light" className="text-accent" /> : <Copy size={14} weight="light" />}
      </button>
      <span role="status" className="sr-only">
        {copied ? "Copied to clipboard" : ""}
      </span>
    </div>
  );
}
