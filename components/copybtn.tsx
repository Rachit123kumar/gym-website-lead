"use client";

import { Copy, Phone } from "lucide-react";
import { useState } from "react";

type PhoneProps = {
  phone: string;
};

export default function PhoneActions({ phone }: PhoneProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(phone);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="relative flex items-center justify-between gap-4">
      {/* Phone Info */}
      <div>
        <p className="text-xs text-muted-foreground">Phone</p>
        <p className="font-mono text-xs sm:text-sm">{phone}</p>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        {/* Copy Button */}
        <button
          onClick={handleCopy}
          title="Copy number"
          className="p-2 rounded-md border hover:bg-muted transition"
        >
          <Copy size={16} />
        </button>

        {/* Call Button */}
        <a
          href={`tel:${phone}`}
          title="Call"
          className="p-2 rounded-md border hover:bg-muted transition"
        >
          <Phone size={16} />
        </a>
      </div>

      {/* Copied Feedback */}
      {copied && (
        <span className="absolute top-full left-1/2 -translate-x-1/2 mt-1 text-xs text-green-500">
          Copied!
        </span>
      )}
    </div>
  );
}
