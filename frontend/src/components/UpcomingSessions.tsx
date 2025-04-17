import { useEffect, useState } from "react";
import { ProgressSpinner } from "primereact/progressspinner";
import { Avatar } from "primereact/avatar";
import { Card } from "primereact/card";
import { useUser } from "../UserContext";
import { Role, Slot } from "../types";
import { formatDateRange } from "../utils";

/**
 * List of upcoming bookings for the current user
 *
 */
function UpcomingSessions({ refresh }: { refresh: boolean }) {
  const [upcomingSessions, setUpcoming] = useState<Slot[]>([]);
  const [isLoading, setLoading] = useState<boolean>(true);
  const { selectedUser } = useUser();
  const isCoach = selectedUser?.role === Role.Coach;

  const fetchBookedSlots = async () => {
    try {
      const nowDateTimeIso = new Date().toISOString();
      const token = selectedUser?.token;

      const endpoint = isCoach ? "coach_slots" : "student_slots";
      const url = `${
        import.meta.env.VITE_API_BASE_URL
      }/${endpoint}?from_time=${nowDateTimeIso}&booked=true`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data: Slot[] = await response.json();

      setUpcoming(data.reverse()); // Reverse to show the most recent first
    } catch (error) {
      console.error("Error fetching slots:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchBookedSlots();
  }, [selectedUser, refresh]);

  return (
    <Card className="w-full">
      <span className="flex w-fill justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-black">Upcoming Sessions</h2>
      </span>
      {isLoading ? (
        <div className="flex justify-center items-center h-50">
          <ProgressSpinner />
        </div>
      ) : (
        <div className="flex flex-col gap-4 max-h-100 overflow-y-auto">
          {upcomingSessions.map((slot) => (
            <div
              className="border rounded-sm p-4 flex justify-between border-gray-200 items-center"
              key={slot.id}
            >
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
                  <span>{formatDateRange(slot.start_time, slot.end_time)}</span>
                </div>
              </div>

              <span className="font-bold text-azul cursor-pointer hover:opacity-75 flex gap-2 items-center">
                <i className="pi pi-phone"></i>
                {isCoach ? slot.booking.student_phone : slot.coach_phone}
              </span>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

export default UpcomingSessions;
