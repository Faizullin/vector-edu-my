import { simpleRequest } from "@/client/core/simpleRequest";
import { LessonPagesEditor } from "@/features/lesson-pages-editor";
import { lessonsPageEditorSearchSchema } from "@/features/lesson-pages-editor/data/schema";
import type {
  LessonDocument,
  LessonPageDocument,
} from "@/features/lessons/data/schema";
import { type PostDocument } from "@/features/posts/data/schema";
import { createFileRoute } from "@tanstack/react-router";
import { zodValidator } from "@tanstack/zod-adapter";

export const Route = createFileRoute(
  "/_layout/lessons/$lesson_id/pages/$page_id/editor"
)({
  component: LessonPagesEditor,
  validateSearch: zodValidator(lessonsPageEditorSearchSchema),
  loaderDeps: ({ search: { post_id, type } }) => ({ post_id, type }),
  loader: async ({ params, deps }) => {
    const postObj = await simpleRequest<PostDocument>({
      url: `/resources/posts/${deps.post_id}`,
      method: "GET",
    });
    const object_id = (postObj as any).object_id;
    if (!object_id) {
      throw new Error("object_id is not defined for post #" + postObj.id);
    }
    const lessonPageObj = await simpleRequest<LessonPageDocument>({
      url: `/lessons/pages/${params.page_id}`,
      method: "GET",
    });
    if (object_id !== lessonPageObj.id) {
      throw new Error(
        `object_id ${object_id} does not match lesson page id ${lessonPageObj.id}`
      );
    }
    const lessonObj = await simpleRequest<LessonDocument>({
      url: `/lessons/lessons/${params.lesson_id}`,
      method: "GET",
    });
    if (lessonObj.id !== (lessonPageObj as any).lesson) {
      throw new Error(
        `lesson_id ${lessonObj.id} does not match lesson page lesson_id ${(lessonPageObj as any).lesson_id}`
      );
    }
    return {
      postObj,
      lessonObj,
      lessonPageObj,
      type: deps.type,
    };
  },
});
