import { useState } from "react";
import {
  Locale,
  format,
  getDay,
  getHours,
  getMinutes,
  isSameWeek,
  isSameDay,
  addDays,
  startOfDay,
  endOfDay,
  Day,
} from "date-fns";
import { toast } from "react-hot-toast";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";

import { Days } from "./useWeekview";
import { WeekviewEvent } from "./Weekview";
import { useUser } from "../../UserContext";

export default function EventGrid({
  days,
  events,
  weekStartsOn,
  locale,
  minuteStep,
  rowHeight,
  onEventClick,
  is12Hour = false,
  onDeleteEvent,
}: {
  days: Days;
  events?: WeekviewEvent[];
  weekStartsOn: Day;
  locale?: Locale;
  minuteStep: number;
  rowHeight: number;
  onEventClick?: (event: WeekviewEvent) => void;
  is12Hour?: boolean;
  onDeleteEvent?: (event: WeekviewEvent) => void;
}) {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<WeekviewEvent | null>(
    null
  );
  const { selectedUser } = useUser();

  const mins = (d: Date) => getHours(d) * 60 + getMinutes(d);

  // Split events that span multiple days into separate parts
  const splitEventByDay = (event: WeekviewEvent) => {
    const parts: WeekviewEvent[] = [];
    let currentStart = event.startDate;

    while (!isSameDay(currentStart, event.endDate)) {
      const currentEnd = endOfDay(currentStart);
      parts.push({
        ...event,
        startDate: currentStart,
        endDate: currentEnd,
      });
      currentStart = addDays(startOfDay(currentStart), 1);
    }

    // Add the final part for the last day
    parts.push({
      ...event,
      startDate: currentStart,
      endDate: event.endDate,
    });

    return parts;
  };

  // Flatten the events array to include split parts
  const processedEvents = (events || []).flatMap(splitEventByDay);

  const handleDeleteEvent = async () => {
    if (selectedEvent) {
      try {
        const response = await fetch(`api/slots/${selectedEvent.id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${selectedUser?.token}`,
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          toast.success("Slot deleted!");
          setShowConfirmDialog(false);
          onDeleteEvent?.(selectedEvent);
        } else {
          const errorData = await response.json();
          console.error("Failed to delete:", errorData);
          toast.error("Failed to delete the slot.");
        }
      } catch (error) {
        console.error("Error deleting:", error);
        toast.error("An error occurred while deleting the slot.");
      }
    }
  };

  return (
    <>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${days.length}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${
            (24 * 60) / minuteStep
          }, minmax(${rowHeight}px, 1fr))`,
        }}
      >
        {processedEvents
          .filter((e) =>
            isSameWeek(days[0].date, e.startDate, { weekStartsOn, locale })
          )
          .map((event) => {
            const start = Math.floor(mins(event.startDate) / minuteStep) + 1;
            const end = Math.ceil(mins(event.endDate) / minuteStep) + 1;

            const paddingTop =
              ((mins(event.startDate) % minuteStep) / minuteStep) * rowHeight;

            const paddingBottom =
              (rowHeight -
                ((mins(event.endDate) % minuteStep) / minuteStep) * rowHeight) %
              rowHeight;

            const timeFormatter = new Intl.DateTimeFormat(
              locale?.code || "en-US",
              {
                hour: "numeric",
                minute: "numeric",
                hour12: is12Hour, // Use 12-hour or 24-hour format based on is12Hour
              }
            );

            const tooltipContent = `${event.title}\n${timeFormatter.format(
              event.startDate
            )} - ${timeFormatter.format(event.endDate)}`;

            return (
              <div
                key={`${event.id}-${event.startDate.toISOString()}`}
                className="relative flex mt-[1px] transition-all"
                style={{
                  gridRowStart: start,
                  gridRowEnd: end,
                  gridColumnStart:
                    ((getDay(event.startDate) - weekStartsOn + 7) % 7) + 1,
                  gridColumnEnd: "span 1",
                }}
              >
                <button
                  className={`absolute inset-1 flex flex-col overflow-y-auto rounded-md p-2 text-xs text-left leading-5 border border-transparent border-dashed transition  ${
                    event.disabled
                      ? "bg-red-50"
                      : event.highlighted
                      ? "bg-orange-50"
                      : "bg-blue-50"
                  }`}
                  style={{
                    top: paddingTop + 4,
                    bottom: paddingBottom + 4,
                    overflow: "hidden",
                  }}
                  onClick={() => onEventClick?.(event)}
                  title={tooltipContent} // Add tooltip here
                >
                  <div className="flex justify-between">
                    <p
                      className={`leading-4 ${
                        event.disabled
                          ? "text-gray-500"
                          : event.highlighted
                          ? "text-black"
                          : "text-blue-500"
                      }`}
                    >
                      {timeFormatter.format(event.startDate)} -{" "}
                      {timeFormatter.format(event.endDate)}
                    </p>

                    {!event.highlighted && !event.disabled && (
                      <i
                        className="pi pi-trash text-gray-400 hover:text-gray-500 cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent triggering the parent button's onClick
                          setSelectedEvent(event);
                          setShowConfirmDialog(true);
                        }}
                      ></i>
                    )}
                  </div>
                  <p
                    className={`font-semibold ${
                      event.disabled
                        ? "text-gray-500"
                        : event.highlighted
                        ? "text-black"
                        : "text-blue-700"
                    }`}
                  >
                    {event.title}
                  </p>
                </button>
              </div>
            );
          })}
      </div>

      {/* Delete Event onfirmation Dialog */}
      <Dialog
        header="Confirm Deletion"
        visible={showConfirmDialog}
        style={{ width: "30vw" }}
        onHide={() => setShowConfirmDialog(false)}
      >
        <p>Are you sure you want to delete this available slot?</p>
        <div className="flex justify-end gap-2 mt-4">
          <Button
            label="Cancel"
            className="p-button-text"
            onClick={() => setShowConfirmDialog(false)}
          />
          <Button
            label="Delete"
            className="p-button-danger"
            onClick={handleDeleteEvent}
          />
        </div>
      </Dialog>
    </>
  );
}
