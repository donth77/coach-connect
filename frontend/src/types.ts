export enum Role {
  Coach = "coach",
  Student = "student",
  Admin = "admin", // Add other roles if needed
}

export interface User {
  id: number;
  name: string;
  phone_number: string;
  preferred_timezone: string;
  role: Role;
  token: string;
  created_at: string;
  updated_at: string;
  avatar_url: string;
  sessions_completed?: number;
  average_rating?: number | null;
  soonest_available_slot?: {
    start_time: string; // ISO 8601
    end_time: string; // ISO 8601
  };
}

export interface Slot {
  id: number;
  coach_id?: string;
  coach_name?: string;
  coach_phone?: string;
  coach_avatar_url?: string;
  start_time: string; // ISO 8601
  end_time: string; // ISO 8601
  booking: {
    id: number;
    student_id: number;
    student_name: string;
    student_phone: string;
    student_avatar_url: string;
    satisfaction_rating?: number | null;
    notes?: string | null;
  };
}
