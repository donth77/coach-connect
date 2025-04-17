import { useEffect, useState } from "react";
import { Card } from "primereact/card";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { ProgressSpinner } from "primereact/progressspinner";
import { Calendar } from "primereact/calendar";
import { format, isBefore, setHours, setMinutes, startOfWeek } from "date-fns";
import { toast } from "react-hot-toast";
import { useUser } from "../UserContext";
import {
  browserLocale,
  doesWeekStartOnMonday,
  is12HourLocale,
  isFirstDateIsoBeforeSecond,
  earlyDateTimeIso,
} from "../utils";
import { Slot } from "../types";
import { WeekView } from "./weekview";
import { WeekviewEvent } from "./weekview/Weekview";

function CoachingCalendar() {
  const [events, setEvents] = useState<WeekviewEvent[]>([]);
  const [isLoading, setLoading] = useState<boolean>(true);
  const [showSelectDialog, setShowSelectDialog] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [startTimeSelect, setStartTime] = useState<Date | null>(null);
  const [endTimeSelect, setEndTime] = useState<Date | null>(null);
  const [startTimeClicked, setStartTimeClicked] = useState<Date | null>(null);
  const [endTimeClicked, setEndTimeClicked] = useState<Date | null>(null);
  const [errorText, setErrorText] = useState<string>(" ");
  const { selectedUser } = useUser();

  const fetchCalendarEvents = async () => {
    try {
      const token = selectedUser?.token;
      const nowDateTimeIso = new Date().toISOString();

      const response = await fetch(
        `/api/coach_slots?from_time=${earlyDateTimeIso}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data: Slot[] = await response.json();
      const events: WeekviewEvent[] = data.map((slot) => ({
        id: String(slot.id),
        title: slot.booking ? slot.booking.student_name : "Available",
        startDate: new Date(slot.start_time),
        endDate: new Date(slot.end_time),
        disabled: isFirstDateIsoBeforeSecond(slot.end_time, nowDateTimeIso),
        highlighted: slot.booking != null,
      }));
      setEvents(events);
      setErrorText("");
    } catch (err) {
      console.error("Error fetching slots:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCalendarEvents();
  }, [selectedUser]);

  const addNewSlot = async (
    startTimeParam: Date | null,
    endTimeParam: Date | null
  ) => {
    const startTime = startTimeParam || startTimeSelect;
    const endTime = endTimeParam || endTimeSelect;

    if (!startTime || !endTime || !selectedUser) {
      return;
    }

    const tempId = String(Date.now());

    try {
      const token = selectedUser.token;

      const response = await fetch(`/api/slots`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          slot: {
            start_time: startTime.toISOString(),
            end_time: endTime.toISOString(),
          },
        }),
      });

      if (response.ok) {
        const responseData = await response.json();

        // Add the new slot to the state
        const newSlot = {
          id: String(responseData.id),
          title: "Available",
          startDate: startTime,
          endDate: endTime,
          disabled: false,
          highlighted: false,
        };

        setEvents((prevEvents) => [...prevEvents, newSlot]);

        toast.success("Added new available slot\n" + format(startTime, "PPp"), {
          duration: 2000,
        });

        setShowSelectDialog(false);
        setShowConfirmDialog(false);
      } else {
        const errorResp = await response.json();
        setErrorText(errorResp?.error);
        console.error("Error creating slot:", errorResp);
      }
    } catch (error) {
      console.error("Error creating slot:", error);
      // Rollback the optimistic update if error
      setEvents((prevEvents) =>
        prevEvents.filter((event) => event.id !== tempId)
      );
      toast.error("Faileed to create slot");
      setShowSelectDialog(false);
      setShowConfirmDialog(false);
    }
  };

  const is12Hour = is12HourLocale();

  // dynamic date format based on locale
  const localeDateFormat = new Intl.DateTimeFormat(navigator.language, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
    .formatToParts(new Date())
    .filter((part) => part.type !== "literal") // Exclude literal parts
    .map((part) => {
      if (part.type === "year") return "yy";
      if (part.type === "month") return "mm";
      if (part.type === "day") return "dd";
      return part.value;
    })
    .join("-");

  return (
    <Card className="w-full">
      <span className="flex w-fill justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-black">Coaching Calendar</h2>
        <Button
          label="Add New Slot"
          icon="pi pi-plus"
          onClick={() => setShowSelectDialog(true)}
        />
      </span>

      {isLoading ? (
        <div className="flex justify-center h-200">
          <div className="mt-24">
            <ProgressSpinner />
          </div>
        </div>
      ) : (
        <WeekView
          initialDate={new Date()}
          weekStartsOn={doesWeekStartOnMonday() ? 1 : 0}
          disabledCell={(date) => {
            return isBefore(date, new Date());
          }}
          disabledWeek={(startDayOfWeek) => {
            return isBefore(startDayOfWeek, startOfWeek(new Date()));
          }}
          minuteStep={120}
          locale={browserLocale}
          events={events}
          onEventClick={() => {}}
          onCellClick={(cell) => {
            const start = cell.date;
            const end = setMinutes(setHours(start, start.getHours() + 2), 0);
            setStartTimeClicked(start);
            setEndTimeClicked(end);
            setShowConfirmDialog(true);
          }}
          is12Hour={is12Hour}
          onDeleteEvent={(slot: WeekviewEvent) => {
            setEvents((prevEvents) =>
              prevEvents.filter((event) => event.id !== slot.id)
            );
          }}
        />
      )}

      <Dialog
        className="sm:w-110"
        header="Add New Slot"
        visible={showSelectDialog}
        onHide={() => {
          setShowSelectDialog(false);
          setErrorText("");
        }}
      >
        <div className="flex flex-col gap-4">
          <div>
            <label htmlFor="startTime" className="block font-bold mb-2">
              Start Time
            </label>
            <Calendar
              id="startTime"
              value={startTimeSelect}
              onChange={(e) => {
                const selectedStartTime = e.value as Date;
                setStartTime(selectedStartTime);

                // Automatically set end time to 2 hours after start time
                const calculatedEndTime = new Date(selectedStartTime);
                calculatedEndTime.setHours(calculatedEndTime.getHours() + 2);
                setEndTime(calculatedEndTime);
                setTimeout(() => {
                  setErrorText("");
                }, 300);
              }}
              showTime
              dateFormat={localeDateFormat}
              hourFormat={is12Hour ? "12" : "24"}
              minDate={new Date()} // Disable past dates and times
            />
          </div>
          <div>
            <label htmlFor="endTime" className="block font-bold mb-2">
              End Time
            </label>
            <Calendar
              id="endTime"
              value={endTimeSelect}
              readOnlyInput // Prevent manual input
              disabled // Disable user interaction
              showTime
              dateFormat={localeDateFormat}
              hourFormat={is12Hour ? "12" : "24"}
            />
          </div>
          <span className="text-red-500 my-2">{errorText}&nbsp;</span>
          <Button
            label="Add Slot"
            onClick={() => addNewSlot(startTimeSelect, endTimeSelect)}
            disabled={!startTimeSelect || !endTimeSelect}
          />
        </div>
      </Dialog>

      {/* Add Slot Dialog */}
      <Dialog
        className="sm:w-110"
        header="Add New Slot"
        visible={showConfirmDialog}
        onHide={() => {
          setShowConfirmDialog(false);
          setTimeout(() => {
            setErrorText("");
          }, 300);
        }}
      >
        <div className="flex flex-col">
          <p>
            Are you sure you want to create a new slot from <br />
            <strong>
              {startTimeClicked ? format(startTimeClicked, "p") : ""}
            </strong>
            &nbsp;to&nbsp;
            <strong>
              {endTimeClicked ? format(endTimeClicked, "p") : ""}
            </strong>{" "}
            &nbsp;on&nbsp;
            <strong>
              {startTimeClicked ? format(startTimeClicked, "PP") : ""}
            </strong>
            ?
          </p>
          <span className="text-red-500 my-4">{errorText}&nbsp;</span>
          <div className="flex justify-end gap-2 mt-4">
            <Button
              label="Cancel"
              className="p-button-text"
              onClick={() => {
                setShowConfirmDialog(false);
                setTimeout(() => {
                  setErrorText("");
                }, 300);
              }}
            />
            <Button
              label="Confirm"
              className="p-button-success"
              onClick={() => addNewSlot(startTimeClicked, endTimeClicked)}
            />
          </div>
        </div>
      </Dialog>
    </Card>
  );
}

export default CoachingCalendar;
