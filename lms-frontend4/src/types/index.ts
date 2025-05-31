export type AuthUser = {
  first_name: string;
  last_name: string;
  email: string;
  username: string;
  is_active?: boolean;
  is_superuser?: boolean;
  full_name?: string | null;
  id: string;
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
          transformResponse: (data: any) => Array<FieldItem>;
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
