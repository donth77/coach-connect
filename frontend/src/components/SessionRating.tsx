import { useState } from "react";
import { Rating } from "primereact/rating";
import { useUser } from "../UserContext";
import { Role } from "../types";

function SessionRating({
  slotBookingId,
  slotBookingNotes,
  slotBookingRating,
}: {
  slotBookingId: number;
  slotBookingNotes: string;
  slotBookingRating?: number | null;
}) {
  const { selectedUser } = useUser();
  const [rating, setRatingValue] = useState<number | null>(
    slotBookingRating || null
  );

  const isCoach = selectedUser?.role === Role.Coach;

  const updateRating = async (newRating: number) => {
    setRatingValue(newRating); // optimistic update

    try {
      const response = await fetch(`api/bookings/${slotBookingId}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${selectedUser?.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          booking: {
            satisfaction_rating: newRating,
            notes: slotBookingNotes,
          },
        }),
      });

      const json = await response.json();
      setRatingValue(json.satisfaction_rating);
    } catch (error) {
      console.error("Error updating rating:", error);
      if (slotBookingRating != null) {
        setRatingValue(slotBookingRating); // rollback optimistic update
      }
    }
  };

  return isCoach ? (
    slotBookingRating != null && (
      <div className="flex items-center gap-2">
        <i className="pi pi-star-fill text-sunflower"></i>{" "}
        <span className="font-bold">{slotBookingRating}</span>
      </div>
    )
  ) : (
    <Rating
      value={rating || 0}
      onChange={(e) => e?.value && updateRating(e.value)}
      cancel={false}
    />
  );
}

export default SessionRating;
