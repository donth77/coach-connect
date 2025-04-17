import * as loc from "date-fns/locale";
import { parseISO, isBefore } from "date-fns";

export const getDateFnsLocaleByActiveLanguage = (lang: string) => {
  const shortLang = lang.split("-")[0];

  if (shortLang === "en") return loc["enUS"];

  return Object.values(loc).find(
    (l: any) => typeof l === "object" && l.code === shortLang
  );
};

export const browserLocale = getDateFnsLocaleByActiveLanguage(
  navigator.language
); // browser locale converted to date-fns locale

// Locale aware formatting of date range
export function formatDateRange(
  startISO: string,
  endISO: string,
  locale = navigator.language
) {
  const start = new Date(startISO);
  const end = new Date(endISO);
  const now = new Date();

  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const startDateOnly = new Date(
    start.getFullYear(),
    start.getMonth(),
    start.getDate()
  );
  const endDateOnly = new Date(
    end.getFullYear(),
    end.getMonth(),
    end.getDate()
  );

  const timeFormatter = new Intl.DateTimeFormat(locale, {
    hour: "numeric",
    minute: "2-digit",
  });

  const dateFormatter = new Intl.DateTimeFormat(locale, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const startTime = timeFormatter.format(start);
  const endTime = timeFormatter.format(end);

  const isSameDay = startDateOnly.getTime() === endDateOnly.getTime();

  const isToday = startDateOnly.getTime() === today.getTime();
  const isTomorrow = startDateOnly.getTime() === tomorrow.getTime();

  if (isToday) {
    return isSameDay
      ? `Today, ${startTime} - ${endTime}`
      : `Today, ${startTime} - ${dateFormatter.format(end)}, ${endTime}`;
  }

  if (isTomorrow) {
    return isSameDay
      ? `Tomorrow, ${startTime} - ${endTime}`
      : `Tomorrow, ${startTime} - ${dateFormatter.format(end)}, ${endTime}`;
  }

  if (isSameDay) {
    return `${dateFormatter.format(start)}, ${startTime} - ${endTime}`;
  }

  return `${dateFormatter.format(start)}, ${startTime} - ${dateFormatter.format(
    end
  )}, ${endTime}`;
}

// Locale aware short date formatting
export function formatDateShort(
  isoString: string,
  locale = navigator.language
) {
  const date = new Date(isoString);
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

// Checks if the first date in ISO format is before the second date
export function isFirstDateIsoBeforeSecond(isoA: string, isoB: string) {
  return isBefore(parseISO(isoA), parseISO(isoB));
}

// Checks if the locale should use 12-hour time format
export function is12HourLocale(locale = navigator.language) {
  const formatted = new Intl.DateTimeFormat(locale, {
    hour: "numeric",
  }).format(new Date()); // 1 PM

  return /AM|PM/i.test(formatted);
}

// Checks if the locale starts the week on Monday
export function doesWeekStartOnMonday(locale = navigator.language) {
  try {
    const loc = new Intl.Locale(locale);
    // @ts-ignore
    const weekStart = loc.weekInfo?.firstDay;

    if (typeof weekStart === "number") {
      return weekStart === 1;
    }
  } catch (e) {
    // Not all browsers support weekInfo, so catch the error
    console.error(e);
  }

  // hardcoded list of locales that typically start on Monday
  const mondayLocales = [
    "en-GB",
    "de-DE",
    "fr-FR",
    "es-ES",
    "it-IT",
    "ru-RU",
    "zh-CN",
    "nl-NL",
    "pl-PL",
    "fi-FI",
    "sv-SE",
    "no-NO",
    "da-DK",
    "pt-PT",
  ];

  return mondayLocales.some((code) => locale.startsWith(code));
}

export const earlyDateTimeIso = new Date(0).toISOString();
