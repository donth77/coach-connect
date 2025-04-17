import { useEffect, useState } from "react";
import { ProgressSpinner } from "primereact/progressspinner";
import { Avatar } from "primereact/avatar";
import { Card } from "primereact/card";
import { useUser } from "../UserContext";
import { Role, Slot } from "../types";
import { formatDateShort, earlyDateTimeIso } from "../utils";
import SessionRating from "./SessionRating";
import SessionNotes from "./SessionNotes";

function PastSessions() {
  const [pastSessions, setPast] = useState<Slot[]>([]);
  const [isLoading, setLoading] = useState<boolean>(true);
  const { selectedUser } = useUser();
  const isCoach = selectedUser?.role === Role.Coach;

  const fetchPastSlots = async () => {
    try {
      const nowDateTimeIso = new Date().toISOString();
      const token = selectedUser?.token;

      const endpoint = isCoach ? "coach_slots" : "student_slots";
      const url = `${
        import.meta.env.VITE_API_BASE_URL
      }/${endpoint}?from_time=${earlyDateTimeIso}&to_time=${nowDateTimeIso}&booked=true`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data: Slot[] = await response.json();
      setPast(data);
    } catch (error) {
      console.error("Error fetching slots:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    setPast([]);
    fetchPastSlots();
  }, [selectedUser]);

  return (
    <Card className="w-full">
      <span className="flex w-fill justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-black">Past Sessions</h2>
      </span>

      {isLoading ? (
        <div className="flex justify-center items-center h-50">
          <ProgressSpinner />
        </div>
      ) : (
        <div className="flex flex-col gap-4 max-h-175 overflow-y-auto">
          {pastSessions.map((slot) => (
            <div
              className="border rounded-sm p-4 flex flex-col border-gray-200 gap-4"
              key={`${slot.id}-${selectedUser?.id}`}
            >
              <div className="flex justify-between items-center" key={slot.id}>
                <div className="flex">
                  <Avatar
                    className="mr-6"
                    image={
                      isCoach
                        ? slot.booking.student_avatar_url
                        : slot.coach_avatar_url
                    }
                    size="xlarge"
                    shape="circle"
                    style={{ width: "50px", height: "50px" }}
                  />
                  <div className="flex flex-col">
                    <span className="font-bold">
                      {isCoach ? slot.booking.student_name : slot.coach_name}
                    </span>
                    <span>{formatDateShort(slot.start_time)}</span>
                  </div>
                </div>

                <SessionRating
                  slotBookingId={slot.booking?.id}
                  slotBookingNotes={slot.booking?.notes || ""}
                  slotBookingRating={slot.booking?.satisfaction_rating}
                />
              </div>

              {isCoach && (
                <SessionNotes
                  slotBookingId={slot.booking?.id}
                  slotBookingNotes={slot.booking?.notes || ""}
                  slotBookingRating={slot.booking?.satisfaction_rating}
                />
              )}
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

export default PastSessions;
