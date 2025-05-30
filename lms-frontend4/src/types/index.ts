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
// export type SortParams = { sortBy: `${string}.${"asc" | "desc"}` };
// export type FilterChangeFn<T> = (dataFilters: Partial<T>) => void;
// export type ItemsFieldFiltersState = Record<string, any>;
// export type ItemsPaginationState = {
//     size: number;
//     page: number;
// }
// export interface ItemsFiltersState {
//     filters: ItemsFieldFiltersState;
//     pagination: ItemsPaginationState;
//     sortBy: SortingState;
// }
// export type MakeColumnsFn<T> = (helpers: {
//     actions?: Record<string, (row: Row<T>) => void> & {
//         defaultEdit?: (row: Row<T>) => void;
//         defaultDelete?: (row: Row<T>) => void;
//     }
// }) => Array<ColumnDef<T> | AccessorColumnDef<T, any> | DisplayColumnDef<T>>;

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
          transformResponse: (data: unknown) => Array<FieldItem>;
          key: string[];
          paginated?: boolean;
        };
        multi?: boolean;
      }
    | {
        type: "select-async";
        query?: {
          fetchOptionsUrl: string;
          transformResponse: (data: unknown) => Array<FieldItem>;
          key: string[];
        };
      }
  ) & {
    displayType?: "toolbar" | "column";
  };
};
// export interface PostDocument extends DocumentBase {
//     title: string;
//     author: {
//         id: DocumentId;
//         username: string;
//         email: string;
//     }
//     publication_status: 1 | 0;
// }
// export interface LessonPageDocument extends DocumentBase {
//     order: number;
// }
// export interface Attachment extends DocumentBase {
//     url: string;
//     file: string;
// }
// export interface UserDocument extends DocumentBase {
//     username: string;
//     email: string;
//     is_active: boolean;
//     is_superuser: boolean;
//     full_name: string | null;
//     first_name: string | null;
//     is_paid?: boolean;
//     user_type?: "free" | "paid" | "premium_paid";
// }
// export interface LessonDocument extends DocumentBase {
//     title: string;
//     description: string;
//     pages: LessonPageDocument[];
// }
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
