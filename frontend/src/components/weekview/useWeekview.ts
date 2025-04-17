import { useState } from "react";
import {
  addDays,
  eachDayOfInterval,
  eachMinuteOfInterval,
  endOfDay,
  startOfDay,
  startOfWeek,
  isToday,
  format,
  Day,
  Locale,
  isSameMonth,
  isSameYear,
} from "date-fns";

export default function useWeekView({
  initialDate,
  minuteStep = 30,
  weekStartsOn = 1,
  locale,
  disabledCell,
  disabledDay,
  disabledWeek,
}:
  | {
      initialDate?: Date;
      minuteStep?: number;
      weekStartsOn?: Day;
      locale?: Locale;
      disabledCell?: (date: Date) => boolean;
      disabledDay?: (date: Date) => boolean;
      disabledWeek?: (startDayOfWeek: Date) => boolean;
    }
  | undefined = {}) {
  const [startOfTheWeek, setStartOfTheWeek] = useState(
    startOfWeek(startOfDay(initialDate || new Date()), { weekStartsOn })
  );

  const nextWeek = () => {
    const nextWeek = addDays(startOfTheWeek, 7);
    if (disabledWeek && disabledWeek(nextWeek)) return;
    setStartOfTheWeek(nextWeek);
  };

  const previousWeek = () => {
    const previousWeek = addDays(startOfTheWeek, -7);
    if (disabledWeek && disabledWeek(previousWeek)) return;
    setStartOfTheWeek(previousWeek);
  };

  const goToToday = () => {
    setStartOfTheWeek(startOfWeek(startOfDay(new Date()), { weekStartsOn }));
  };

  const days = eachDayOfInterval({
    start: startOfTheWeek,
    end: addDays(startOfTheWeek, 6),
  }).map((day) => ({
    date: day,
    isToday: isToday(day),
    name: format(day, "EEEE", { locale }),
    shortName: format(day, "EEE", { locale }),
    dayOfMonth: format(day, "d", { locale }),
    dayOfMonthWithZero: format(day, "dd", { locale }),
    dayOfMonthWithSuffix: format(day, "do", { locale }),
    disabled: disabledDay ? disabledDay(day) : false,
    cells: eachMinuteOfInterval(
      {
        start: startOfDay(day),
        end: endOfDay(day),
      },
      {
        step: minuteStep,
      }
    ).map((hour) => ({
      date: hour,
      hour: format(hour, "HH", { locale }),
      minute: format(hour, "mm", { locale }),
      hourAndMinute: new Intl.DateTimeFormat(locale?.code, {
        hour: "numeric",
        minute: "numeric",
      }).format(hour),
      disabled: disabledCell ? disabledCell(hour) : false,
    })),
  }));

  const isAllSameYear = isSameYear(days[0].date, days[days.length - 1].date);
  const isAllSameMonth = isSameMonth(days[0].date, days[days.length - 1].date);

  let viewTitle = "";
  if (isAllSameMonth) {
    const monthYearFormatter = new Intl.DateTimeFormat(
      locale?.code || "en-US",
      {
        month: "long",
        year: "numeric",
      }
    );
    viewTitle = monthYearFormatter.format(days[0].date); // Locale-aware full month and year
  } else if (isAllSameYear) {
    const monthFormatter = new Intl.DateTimeFormat(locale?.code || "en-US", {
      month: "short",
    });
    const yearFormatter = new Intl.DateTimeFormat(locale?.code || "en-US", {
      year: "numeric",
    });
    viewTitle = `${monthFormatter.format(
      days[0].date
    )} - ${monthFormatter.format(
      days[days.length - 1].date
    )} ${yearFormatter.format(days[0].date)}`; // Locale-aware short month range and year
  } else {
    const monthYearFormatter = new Intl.DateTimeFormat(
      locale?.code || "en-US",
      {
        month: "short",
        year: "numeric",
      }
    );
    viewTitle = `${monthYearFormatter.format(
      days[0].date
    )} - ${monthYearFormatter.format(days[days.length - 1].date)}`; // Locale-aware month and year range
  }

  const weekNumber = format(days[0].date, "w", { locale });

  return {
    nextWeek,
    previousWeek,
    goToToday,
    days,
    weekNumber,
    viewTitle,
  };
}

export type Days = ReturnType<typeof useWeekView>["days"];
export type Cell = Days[number]["cells"][number];
