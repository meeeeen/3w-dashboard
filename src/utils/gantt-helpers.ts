import {
  startOfMonth,
  endOfMonth,
  addMonths,
  differenceInDays,
  format,
  isBefore,
  isAfter,
  parseISO,
  startOfQuarter,
  addQuarters,
} from "date-fns";
import { ko } from "date-fns/locale";
import type { ViewMode } from "@/components/dashboard/FilterBar";

export interface TimelineRange {
  start: Date;
  end: Date;
  columns: { label: string; subLabel: string; start: Date; end: Date }[];
  totalDays: number;
}

export function getTimelineRange(
  viewMode: ViewMode,
  referenceDate: Date = new Date()
): TimelineRange {
  let start: Date;
  let end: Date;
  const columns: TimelineRange["columns"] = [];

  switch (viewMode) {
    case "month": {
      start = startOfMonth(addMonths(referenceDate, -1));
      end = endOfMonth(addMonths(referenceDate, 4));
      let cursor = start;
      while (isBefore(cursor, end)) {
        const monthEnd = endOfMonth(cursor);
        columns.push({
          label: format(cursor, "yyyy", { locale: ko }),
          subLabel: format(cursor, "M월", { locale: ko }),
          start: cursor,
          end: monthEnd,
        });
        cursor = addMonths(cursor, 1);
        cursor = startOfMonth(cursor);
      }
      break;
    }
    case "quarter": {
      start = startOfQuarter(addQuarters(referenceDate, -1));
      end = endOfMonth(addQuarters(referenceDate, 3));
      let cursor = start;
      while (isBefore(cursor, end)) {
        const monthEnd = endOfMonth(cursor);
        columns.push({
          label: format(cursor, "yyyy", { locale: ko }),
          subLabel: format(cursor, "M월", { locale: ko }),
          start: cursor,
          end: monthEnd,
        });
        cursor = addMonths(cursor, 1);
        cursor = startOfMonth(cursor);
      }
      break;
    }
    case "half": {
      start = startOfMonth(addMonths(referenceDate, -3));
      end = endOfMonth(addMonths(referenceDate, 8));
      let cursor = start;
      while (isBefore(cursor, end)) {
        const monthEnd = endOfMonth(cursor);
        columns.push({
          label: format(cursor, "yyyy", { locale: ko }),
          subLabel: format(cursor, "M월", { locale: ko }),
          start: cursor,
          end: monthEnd,
        });
        cursor = addMonths(cursor, 1);
        cursor = startOfMonth(cursor);
      }
      break;
    }
  }

  return {
    start,
    end,
    columns,
    totalDays: differenceInDays(end, start),
  };
}

export function getBarPosition(
  projectStart: string,
  projectEnd: string,
  timeline: TimelineRange
): { left: string; width: string } | null {
  const pStart = parseISO(projectStart);
  const pEnd = parseISO(projectEnd);

  if (isAfter(pStart, timeline.end) || isBefore(pEnd, timeline.start)) {
    return null;
  }

  const effectiveStart = isBefore(pStart, timeline.start)
    ? timeline.start
    : pStart;
  const effectiveEnd = isAfter(pEnd, timeline.end) ? timeline.end : pEnd;

  const startOffset = differenceInDays(effectiveStart, timeline.start);
  const duration = differenceInDays(effectiveEnd, effectiveStart) + 1;

  const left = (startOffset / timeline.totalDays) * 100;
  const width = (duration / timeline.totalDays) * 100;

  return {
    left: `${Math.max(0, left)}%`,
    width: `${Math.min(100 - left, Math.max(1, width))}%`,
  };
}

export function getTodayPosition(timeline: TimelineRange): string | null {
  const today = new Date();
  if (isBefore(today, timeline.start) || isAfter(today, timeline.end)) {
    return null;
  }
  const offset = differenceInDays(today, timeline.start);
  return `${(offset / timeline.totalDays) * 100}%`;
}
