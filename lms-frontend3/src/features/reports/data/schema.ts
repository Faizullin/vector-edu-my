import type { PostDocument } from "@/features/posts/data/schema";

export interface ReportDocument extends PostDocument {
  content: string;
  created_at: string;
}

export interface ReportJSONContent {
  name: string;
  timestamp: {
    start: string;
    end: string;
    duration: string;
  };
  data: any;
}

export const reportsOptions = [
  {
    label: "Lesson Page Element Component Use",
    value: "lesson_page_element_component_use",
  },
  {
    label: "Storage Files Use",
    value: "storage_files_use",
  },
];
