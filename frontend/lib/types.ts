export type TodoStatus = "not_started" | "completed" | "trashed";

export interface UserSummary {
  id: number;
  user_id: string;
  display_name: string;
  created_at: string;
}

export interface SessionResponse {
  authenticated: boolean;
  user: UserSummary | null;
}

export interface LoginPayload {
  user_id: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  user: UserSummary;
}

export interface TodoItem {
  id: number;
  title: string;
  description: string;
  status: TodoStatus;
  created_at: string;
  updated_at: string;
}

export interface TodoCreatePayload {
  title: string;
  description?: string;
}

export interface TodoUpdatePayload {
  title?: string;
  description?: string;
  status?: TodoStatus;
}

export interface MessageResponse {
  message: string;
}
