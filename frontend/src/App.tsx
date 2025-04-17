import { useState, useEffect } from "react";
import { Dropdown } from "primereact/dropdown";
import { ProgressSpinner } from "primereact/progressspinner";
import { Avatar } from "primereact/avatar";
import { Role, User } from "./types";
import { useUser } from "./UserContext";
import CoachingCalendar from "./components/CoachingCalendar";
import UpcomingSessions from "./components/UpcomingSessions";
import PastSessions from "./components/PastSessions";
import AvailableCoaches from "./AvailableCoaches";

function App() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setLoading] = useState(true);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const { selectedUser, setSelectedUser } = useUser();
  const isCoach = selectedUser?.role === Role.Coach;

  const [refreshUpcomingSessions, setRefreshUpcomingSessions] = useState(false);

  const handleRefreshUpcomingSessions = () => {
    setRefreshUpcomingSessions((prev) => !prev); // Toggle state to trigger refresh
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/users");
      const data: User[] = await response.json();
      setUsers(data);

      data.forEach((user) => {
        if (user.avatar_url) {
          const img = new Image();
          img.src = user.avatar_url;
        }
      }); // Preload avatar images

      if (data.length > 0) {
        setSelectedUser(data[0]); // Set the first user as selected by default
        setAvatarUrl(data[0].avatar_url || null);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSelectUser = (user: User) => {
    setSelectedUser(user);
    setAvatarUrl(user.avatar_url || null);
  };

  const selectedUserOptionTemplate = (option: User) => {
    return (
      <div className="flex items-center gap-4">
        <Avatar image={avatarUrl || undefined} shape="circle" />
        <div>{option.name}</div>
      </div>
    );
  };

  const userOptionTemplate = (option: User) => {
    return (
      <div className="flex items-center gap-4">
        <div>{option.name}</div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-screen">
      {isLoading ? (
        <div className="flex items-center justify-center h-1/2">
          <ProgressSpinner />
        </div>
      ) : (
        <>
          <header className="w-full h-16 flex px-20 py-6 bg-white items-center shadow-md justify-between">
            <h1 className="text-2xl font-bold text-azul">CoachConnect</h1>

            <span className="text-gray-400">
              Time Zone: {Intl.DateTimeFormat().resolvedOptions().timeZone}
            </span>

            <Dropdown
              className="w-60 min-w-fit"
              value={selectedUser}
              onChange={(e) => handleSelectUser(e.value)}
              options={users}
              optionLabel="name"
              placeholder="Select a User"
              itemTemplate={userOptionTemplate}
              valueTemplate={selectedUserOptionTemplate}
            />
          </header>

          <main className="bg-ghostWhite w-full px-20 py-12 flex flex-col gap-8">
            {isCoach ? (
              <CoachingCalendar />
            ) : (
              <AvailableCoaches
                onBookingCreated={handleRefreshUpcomingSessions}
              />
            )}
            <UpcomingSessions refresh={refreshUpcomingSessions} />
            <PastSessions />
          </main>
        </>
      )}
    </div>
  );
}

export default App;
