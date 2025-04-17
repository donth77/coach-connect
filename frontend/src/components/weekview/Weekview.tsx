import { isSameWeek, Day, Locale } from "date-fns";

import useWeekView, { Cell } from "./useWeekview";
import Header from "./Header";
import DaysHeader from "./DaysHeader";
import Grid from "./Grid";
import EventGrid from "./EventGrid";

export interface WeekviewEvent {
  id: string;
  title: string;
  startDate: Date;
  endDate: Date;
  disabled: boolean;
  highlighted?: boolean;
}

export default function WeekView({
  initialDate,
  minuteStep = 30,
  weekStartsOn = 1,
  locale,
  rowHeight = 56,
  disabledCell,
  disabledDay,
  disabledWeek,
  events,
  onCellClick,
  onEventClick,
  is12Hour,
  onDeleteEvent,
}: {
  initialDate?: Date;
  minuteStep?: number;
  weekStartsOn?: Day;
  locale?: Locale;
  rowHeight?: number;
  disabledCell?: (date: Date) => boolean;
  disabledDay?: (date: Date) => boolean;
  disabledWeek?: (startDayOfWeek: Date) => boolean;
  events?: WeekviewEvent[];
  onCellClick?: (cell: Cell) => void;
  onEventClick?: (event: WeekviewEvent) => void;
  is12Hour?: boolean;
  onDeleteEvent?: (event: WeekviewEvent) => void;
}) {
  const { days, nextWeek, previousWeek, goToToday, viewTitle } = useWeekView({
    initialDate,
    minuteStep,
    weekStartsOn,
    locale,
    disabledCell,
    disabledDay,
    disabledWeek,
  });

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Header
        title={viewTitle}
        onNext={nextWeek}
        onPrev={previousWeek}
        onToday={goToToday}
        showTodayButton={!isSameWeek(days[0].date, new Date())}
      />
      <div className="flex flex-col flex-1 overflow-hidden select-none">
        <div className="flex flex-col flex-1 isolate overflow-auto">
          <div className="flex flex-col flex-none min-w-[700px]">
            <DaysHeader days={days} />
            <div className="grid grid-cols-1 grid-rows-1">
              <div className="row-start-1 col-start-1">
                <Grid
                  days={days}
                  rowHeight={rowHeight}
                  onCellClick={onCellClick}
                />
              </div>
              <div className="row-start-1 col-start-1">
                <EventGrid
                  days={days}
                  events={events}
                  weekStartsOn={weekStartsOn}
                  locale={locale}
                  minuteStep={minuteStep}
                  rowHeight={rowHeight}
                  onEventClick={onEventClick}
                  is12Hour={is12Hour}
                  onDeleteEvent={onDeleteEvent}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
