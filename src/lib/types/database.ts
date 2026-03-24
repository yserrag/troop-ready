export interface User {
  id: string;
  phone: string | null;
  email: string | null;
  display_name: string;
  role: "leader" | "parent";
  account_type: "adult" | "youth";
  parent_user_id: string | null;
  unit_id: string;
  created_at: string;
  updated_at: string;
}

export interface Event {
  id: string;
  short_id: string;
  title: string;
  description: string | null;
  location: string | null;
  starts_at: string;
  ends_at: string | null;
  itinerary: ItineraryItem[];
  created_by: string;
  unit_id: string;
  status: "draft" | "published" | "cancelled";
  created_at: string;
  updated_at: string;
}

export interface ItineraryItem {
  time: string;
  activity: string;
  notes?: string;
}

export interface RSVP {
  id: string;
  event_id: string;
  user_id: string;
  status: "going" | "not_going" | "maybe";
  head_count: number;
  note: string | null;
  created_at: string;
  updated_at: string;
  synced_at: string | null;
}

export interface GearItem {
  id: string;
  event_id: string;
  item_name: string;
  quantity: number;
  category:
    | "general"
    | "cooking"
    | "shelter"
    | "safety"
    | "personal"
    | "activity";
  is_shared: boolean;
  assigned_to: string | null;
  is_packed: boolean;
  sort_order: number;
  created_at: string;
}

export interface Duty {
  id: string;
  event_id: string;
  title: string;
  description: string | null;
  time_slot: string | null;
  assigned_to: string | null;
  assigned_by: string | null;
  assigned_at: string | null;
  is_complete: boolean;
  sort_order: number;
  created_at: string;
}

export interface LeaderInvite {
  id: string;
  unit_id: string;
  invite_code: string;
  invited_by: string;
  claimed_by: string | null;
  expires_at: string;
  created_at: string;
}
