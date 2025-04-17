import { useEffect, useState } from "react";
import { ScheduleMeeting } from "react-schedule-meeting";
import { ProgressSpinner } from "primereact/progressspinner";
import { Avatar } from "primereact/avatar";
import { Card } from "primereact/card";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog"; // Import Dialog component
import { format } from "date-fns";
import { toast } from "react-hot-toast";
import { Slot, User } from "./types";
import { formatDateRange } from "./utils";
import { useUser } from "./UserContext";

function AvailableCoaches({
  onBookingCreated,
}: {
  onBookingCreated: () => void;
}) {
  const { selectedUser } = useUser();
  const [coaches, setCoaches] = useState<User[]>([]);
  const [isLoading, setLoading] = useState<boolean>(true);
  const [isLoadingAvailableSlots, setLoadingAvailableSlots] =
    useState<boolean>(true);
  const [showDialog, setShowDialog] = useState(false); // dialog visibility
  const [selectedCoach, setSelectedCoach] = useState<User | null>(null);
  const [selectedCoachSlots, setSelectedCoachSlots] = useState<Slot[]>([]);
  const [selectedBookedCoachSlot, setSelectedBookedCoachSlot] =
    useState<Slot | null>(null);

  const fetchCoaches = async () => {
    try {
      const response = await fetch(
        "/api/users?role=coach&available=true&stats=true"
      );
      const data = await response.json();
      setCoaches(data);
    } catch (error) {
      console.error("Error fetching coaches:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCoachSlots = async (selectedCoachParam: User) => {
    setLoadingAvailableSlots(true);
    try {
      const token = selectedUser?.token;
      const nowDateTimeIso = new Date().toISOString();

      const response = await fetch(
        `/api/coach_slots?from_time=${nowDateTimeIso}&booked=false&coach_id=${selectedCoachParam?.id}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data: Slot[] = await response.json();
      setSelectedCoachSlots(data);
    } catch (error) {
      console.error("Error fetching coaches:", error);
    } finally {
      setLoadingAvailableSlots(false);
    }
  };

  useEffect(() => {
    fetchCoaches();
  }, []);

  const handleBookClick = (selectedCoach: User) => {
    setSelectedCoach(selectedCoach);
    fetchCoachSlots(selectedCoach); // Fetch slots for the selected coach
    setShowDialog(true); // Show the dialog
  };

  const handleBookSelectionClick = async () => {
    if (
      !selectedCoach ||
      selectedCoachSlots.length === 0 ||
      !selectedBookedCoachSlot
    ) {
      console.error("No coach or slot selected");
      return;
    }

    const token = selectedUser?.token;

    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          booking: {
            slot_id: selectedBookedCoachSlot.id, // Use the selected slot ID
          },
        }),
      });

      if (response.ok) {
        toast.success(
          "Booking created successfully at\n" +
            format(new Date(selectedBookedCoachSlot.start_time), "PPp"),
          {
            duration: 2000,
          }
        );
        setShowDialog(false); // Close the dialog
        onBookingCreated(); // notify to refresh upcoming section
      } else {
        const errorData = await response.json();
        console.error("Error creating booking:", errorData);
      }
    } catch (error) {
      console.error("Error creating booking:", error);
    }
  };

  const handleCancelClick = () => {
    setShowDialog(false); // Hide the dialog
  };

  return (
    <Card className="w-full">
      <span className="flex w-fill justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-black">Available Coaches</h2>
      </span>
      {isLoading ? (
        <div className="flex justify-center items-center h-60">
          <ProgressSpinner />
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-4 max-h-135 overflow-y-auto">
          {coaches.map((coach) => (
            <div
              className="flex flex-col border border-gray-200 rounded-sm p-4"
              key={coach.id}
            >
              <div className="flex">
                <Avatar
                  className="mr-6"
                  size="xlarge"
                  image={coach.avatar_url}
                  shape="circle"
                  style={{ height: "64px", width: "64px" }}
                />
                <div
                  key={coach.id}
                  className="flex flex-col items-center justify-center"
                >
                  <span className="text-xl font-bold text-black">
                    {coach.name}
                  </span>
                </div>
              </div>
              <div className="flex my-4">
                <div className="flex items-center gap-2">
                  <i className="pi pi-star-fill text-sunflower"></i>{" "}
                  {coach.sessions_completed && (
                    <div className="flex gap-2">
                      <span className="font-bold text-black">
                        {Number(coach.average_rating).toFixed(2)}
                      </span>
                      <span className="">
                        ({coach.sessions_completed} sessions)
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <div className="mb-4">
                <span>
                  Available&nbsp;
                  {formatDateRange(
                    coach.soonest_available_slot?.start_time || "",
                    coach.soonest_available_slot?.end_time || ""
                  )}
                </span>
              </div>
              <Button
                className=""
                label="Book Session"
                onClick={() => handleBookClick(coach)} // Show dialog on button click
              />
            </div>
          ))}
        </div>
      )}

      {/* Dialog Component */}
      <Dialog
        className="sm:w-3/4 md:w-7/8 w-full max-w-[1250px]"
        header={`Book Session - ${selectedCoach?.name || ""}`}
        visible={showDialog}
        onHide={handleCancelClick} // Close dialog when hiding
        footer={
          <div className="flex justify-end gap-2">
            <Button
              label="Cancel"
              className="p-button-text"
              onClick={handleCancelClick}
            />
            <Button
              label="Book"
              className="p-button-primary"
              onClick={handleBookSelectionClick}
            />
          </div>
        }
      >
        {isLoadingAvailableSlots ? (
          <div className="flex items-center h-125 mb-2">
            <ProgressSpinner />
          </div>
        ) : (
          <ScheduleMeeting
            borderRadius={10}
            primaryColor="#2563eb"
            eventDurationInMinutes={120}
            availableTimeslots={selectedCoachSlots.map((slot) => ({
              id: slot.id,
              startTime: new Date(slot.start_time),
              endTime: new Date(slot.end_time),
            }))}
            onStartTimeSelect={(evt) => {
              const availableTimeslot = evt.availableTimeslot;
              const selectedSlot = selectedCoachSlots.find(
                (slot) =>
                  new Date(slot.start_time).getTime() ===
                    new Date(availableTimeslot.startTime).getTime() &&
                  new Date(slot.end_time).getTime() ===
                    new Date(availableTimeslot.endTime).getTime()
              );

              setSelectedBookedCoachSlot(selectedSlot || null);
            }}
          />
        )}
      </Dialog>
    </Card>
  );
}

export default AvailableCoaches;
