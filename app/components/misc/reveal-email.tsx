import { useState, type ReactNode } from "react";
import { Eye } from "lucide-react";

interface RevealEmailProps {
  /** Local part before the @, e.g. "info" */
  user: string;
  /** Domain, e.g. "minashow.com" */
  domain: string;
  /** Classes applied to the clickable element (button when masked, link when revealed). */
  className?: string;
  /** Optional leading icon (e.g. a Mail glyph). */
  leadingIcon?: ReactNode;
}

/** Mask a string keeping only its first char: "info" -> "i•••", "minashow" -> "m•••••••" */
function mask(s: string): string {
  if (s.length <= 1) return s;
  return s[0] + "•".repeat(s.length - 1);
}

/**
 * Shows a masked email with an eye icon; clicking reveals the full address and
 * turns it into a mailto link. The address is assembled from `user`/`domain`
 * client-side only, so the real email never appears in the server-rendered HTML
 * where scrapers harvest it.
 */
export function RevealEmail({ user, domain, className, leadingIcon }: RevealEmailProps) {
  const [revealed, setRevealed] = useState(false);
  const email = `${user}@${domain}`;

  if (revealed) {
    return (
      <a href={`mailto:${email}`} className={className}>
        {leadingIcon}
        {email}
      </a>
    );
  }

  const [label, ...tld] = domain.split(".");
  const maskedEmail = `${mask(user)}@${mask(label)}.${tld.join(".")}`;

  return (
    <button
      type="button"
      onClick={() => setRevealed(true)}
      className={className}
      aria-label="Reveal email address"
      title="Click to reveal email"
    >
      {leadingIcon}
      <span>{maskedEmail}</span>
      <Eye className="w-4 h-4" />
    </button>
  );
}
