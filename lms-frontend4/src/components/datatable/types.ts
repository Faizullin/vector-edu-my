export type SortingState = {
  id: string;
  desc: boolean;
}[];

export type PaginationState = {
  pageIndex: number;
  pageSize: number;
};

export type FilterOption = {
  label: string;
  value: string | number;
};

export type ColumnFilterType =
  | "text"
  | "number"
  | "date"
  | "boolean"
  | "select"
  | "select-async";

export type ColumnFilter = {
  type: ColumnFilterType;
  options?: FilterOption[];
  fetchOptionsUrl?: string;
};

export type ColumnFilterMeta = {
  filter?: ColumnFilter;
};

export type FilterState = Record<string, any>;

export type QueryParams = {
  page?: number;
  perPage?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  filters?: Record<string, any>;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export type ActionComponent<_, CallbackProps = any> = {
  id: string;
  label?: string;
  callback: (props: CallbackProps) => void;
  shortcutIcon?: React.ReactNode;
  loading?: boolean;
  disabled?: boolean;
  renderType: "actions-menu" | "toolbar" | "panel";
};
