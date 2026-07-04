// ── AAKAAR:STAMPED_TYPES (do not remove this marker) ──────────────────────────────
// Entity interfaces are stamped here from the build contract; they mirror
// backend/schemas.py exactly. Generated components must import from this file.

export interface Session {
  id: string;
  user_id: string;
  token: string;
  created_at: string;
  expires_at: string;
}

export interface SessionCreate {
  token: string;
}

export interface Todo {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  due_date?: string;
  completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface TodoCreate {
  title: string;
  description?: string;
  due_date?: string;
  completed: boolean;
}
