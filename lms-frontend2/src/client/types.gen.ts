import { Row, SortingState } from "@tanstack/react-table"

export type AuthUser = {
    email: string
    is_active?: boolean
    is_superuser?: boolean
    full_name?: string | null
    id: string
}
export type PaginatedData<T> = {
    results: T[];
    count: number;
};
export type SortParams = { sortBy: `${string}.${"asc" | "desc"}` };
export type FilterChangeFn<T> = (dataFilters: Partial<T>) => void;
export type ItemsFieldFiltersState = Record<string, any>;
export type ItemsPaginationState = {
    size: number;
    page: number;
}
export interface ItemsFiltersState {
    filters: ItemsFieldFiltersState;
    pagination: ItemsPaginationState;
    sortBy: SortingState;
}
export type MakeColumnsFn<T> = (helpers: {
    actions?: Record<string, (row: Row<T>) => void> & {
        defaultEdit?: (row: Row<T>) => void;
        defaultDelete?: (row: Row<T>) => void;
    }
}) => Array<any>;


export type DocumentId = number;
export interface DocumentBase {
    id: DocumentId;
    created_at: string;
    updated_at: string;
}
export interface PostDocument extends DocumentBase {
    title: string;
    author: {
        id: DocumentId;
        username: string;
        email: string;
    }
    publication_status: 1 | 0;
}
export interface LessonPageDocument extends DocumentBase {
    order: number;
}
export interface Attachment extends DocumentBase {
    url: string;
    file: string;
}
export interface UserDocument extends DocumentBase {
    username: string;
    email: string;
    is_active: boolean;
    is_superuser: boolean;
    full_name: string | null;
    first_name: string | null;
}
export interface LessonDocument extends DocumentBase {
    title: string;
    description: string;
    pages: LessonPageDocument[];
}