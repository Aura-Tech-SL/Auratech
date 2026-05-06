"use client";

import { useLocale } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/navigation';
import { locales } from '@/i18n/config';
import { cn } from '@/lib/utils';

const localeLabels: Record<string, string> = {
  en: 'EN',
  ca: 'CA',
  es: 'ES',
};

export function LanguageSelector() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  const switchLocale = (newLocale: string) => {
    router.replace(pathname, { locale: newLocale });
  };

  return (
    <div className="flex items-center gap-1" role="group" aria-label="Language selector">
      {locales.map((l, i) => (
        <span key={l} className="flex items-center">
          {i > 0 && (
            <span className="text-foreground/15 mx-0.5 text-[10px]">/</span>
          )}
          <button
            onClick={() => switchLocale(l)}
            aria-current={locale === l ? 'true' : undefined}
            className={cn(
              "font-mono text-[10px] tracking-wider uppercase transition-colors duration-200",
              locale === l
                ? "text-foreground"
                : "text-foreground/30 hover:text-foreground/60"
            )}
          >
            {localeLabels[l]}
          </button>
        </span>
      ))}
    </div>
  );
}
