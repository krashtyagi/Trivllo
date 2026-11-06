import { useLanguageStore } from "@/store/language.store";
import translations from "@/lib/translations";

/**
 * Hook that returns a `t` function to look up translated strings
 * based on the current language from the language store.
 *
 * Usage:
 * ```tsx
 * const { t, language } = useTranslation();
 * <p>{t("settings.title")}</p>
 * ```
 */
export function useTranslation() {
  const { language } = useLanguageStore();

  const t = (key: string): string => {
    return translations[language]?.[key] ?? translations["en"]?.[key] ?? key;
  };

  return { t, language };
}
