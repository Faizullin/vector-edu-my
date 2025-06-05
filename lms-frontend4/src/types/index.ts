export interface AuthUserNotificationSettings {
  friend_request_notification: boolean;
  global_event_notification: boolean;
  last_lesson_reminder: string;
  last_streak_notification: string;
  periodic_lesson_reminder: boolean;
  streak_notification: boolean;
}
export type AuthUser = {
  day_streak: number;
  description: string;
  email: string;
  id: DocumentId;
  max_day_streak: number;
  name: string;
  notification_settings: AuthUserNotificationSettings;
  paid: boolean;
  photo: string;
  progress: number;
  ranking: number;
  timezone_difference: number;
};
export type PaginatedData<T> = {
  results: T[];
  count: number;
};
export type DocumentId = number;
export interface DocumentBase {
  id: DocumentId;
}
export type FieldItem = {
  label: string;
  value: string;
};
export type MyColumnMeta = {
  filter?: (
    | {
        type: "text";
      }
    | {
        type: "select";
        options: Array<FieldItem>;
        query?: {
          fetchOptionsUrl: string;
          transformResponse: (data: any) => Array<FieldItem>;
          key: string[];
          paginated?: boolean;
        };
        multi?: boolean;
        renderMode?: "select" | "checkbox";
      }
    | {
        type: "select-async";
        query?: {
          fetchOptionsUrl: string;
          transformResponse: (data: never) => Array<FieldItem>;
          key: string[];
        };
        renderMode?: "select" | "checkbox";
      }
  ) & {
    displayType?: "toolbar" | "column";
  };
};
export interface CommentDocument extends DocumentBase {
  content: string;
  type: string;
  content_type: unknown;
  object_id: DocumentId;
  user: {
    id: DocumentId;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
  };
  created_at: string;
  updated_at: string;
}
