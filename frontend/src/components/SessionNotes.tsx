import { useState } from "react";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { useUser } from "../UserContext";

function SessionNotes({
  slotBookingId,
  slotBookingNotes,
  slotBookingRating,
}: {
  slotBookingId: number;
  slotBookingNotes: string;
  slotBookingRating?: number | null;
}) {
  const { selectedUser } = useUser();
  const [showDialog, setShowDialog] = useState(false); // State to control dialog visibility

  const [textContent, setTextContent] = useState(slotBookingNotes || ""); // State to hold the text are content
  const [notes, setNotes] = useState(slotBookingNotes || ""); // State to update the notes on save

  const updateNotes = async (newNotes: string) => {
    try {
      await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/bookings/${slotBookingId}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${selectedUser?.token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            booking: {
              satisfaction_rating: slotBookingRating,
              notes: newNotes,
            },
          }),
        }
      );
    } catch (error) {
      console.error("Error updating notes:", error);
    }
  };
  const handleSave = () => {
    setShowDialog(false);
    setNotes(textContent);
    updateNotes(textContent);
  };

  return (
    <div className="flex flex-col">
      <div>
        <p className="text-mysticShade p-4">{notes}&nbsp;</p>
      </div>
      <div className="flex w-full justify-end">
        <Button label="Edit Notes" onClick={() => setShowDialog(true)} />
      </div>

      {/* Dialog for editing notes */}
      <Dialog
        header="Edit Notes"
        visible={showDialog}
        style={{ width: "50vw" }}
        onHide={() => setShowDialog(false)} // Close dialog on cancel
      >
        <div className="flex flex-col gap-4">
          <textarea
            className="w-full p-2 border border-gray-300 rounded-md"
            rows={5}
            value={textContent}
            onChange={(e) => setTextContent(e.target.value)} // Update notes state
            maxLength={524288}
          />
          <div className="flex justify-end gap-2">
            <Button
              label="Cancel"
              className="p-button-text"
              onClick={() => setShowDialog(false)}
            />
            <Button
              label="Save"
              className="p-button-success"
              onClick={handleSave}
            />
          </div>
        </div>
      </Dialog>
    </div>
  );
}

export default SessionNotes;
