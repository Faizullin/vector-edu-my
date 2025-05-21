import type { DocumentBase } from "@/client";

export interface LessonPageDocument extends DocumentBase {
  order: number;
}
export interface LessonBatchDocument extends DocumentBase {
  title: string;
}
export interface LessonDocument extends DocumentBase {
  title: string;
  description: string;
  is_available_on_free: boolean;
  order: number;
  lesson_batch?: LessonBatchDocument;
}
