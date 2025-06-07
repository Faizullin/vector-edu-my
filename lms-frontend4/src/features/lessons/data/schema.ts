import { DocumentBase, DocumentId } from "@/types";

export interface LessonPageDocument extends DocumentBase {
  order: number;
  lesson?: DocumentId;
  title?: string;
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
