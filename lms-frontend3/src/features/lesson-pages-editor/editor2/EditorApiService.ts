import type { CommentDocument, DocumentId, PaginatedData } from "@/client";
import { simpleRequest } from "@/client/core/simpleRequest";
import type { LessonPageDocument } from "@/features/lessons/data/schema";

type ActionResult<T> = {
  success: boolean;
  data: T;
};

export class EditorApiService {
  static baseActionUrl = `/resources/posts/edit-content/lessons2/action`;
  static saveContent(postId: DocumentId, content: string) {
    return this.submitAction("save-content", {
      post_id: postId,
      content,
    });
  }
  static submitAction<T = any>(
    action: string,
    formData: {
      post_id: string;
    } & any
  ): Promise<ActionResult<T>> {
    return simpleRequest({
      method: "POST",
      url: `${this.baseActionUrl}`,
      formData,
      query: {
        action,
      },
    });
  }
  static loadContent(postId: DocumentId) {
    return this.submitAction("load-content", {
      post_id: postId,
    });
  }
  static loadContentObjData(
    postId: DocumentId,
    items: Array<{
      component_type: string;
      object_id: DocumentId;
    }>
  ) {
    return this.submitAction<{
      items: Array<{
        component_type: string;
        object_id: DocumentId;
        component_data: any;
      }>;
    }>("load-content-obj-data", {
      post_id: postId,
      items,
    });
  }
  static fetchComponentDetail<T>(type: string, id: DocumentId): Promise<T> {
    return simpleRequest<T>({
      method: "GET",
      url: `/resources/component/${type}/${id}`,
    });
  }
  static fetchComponentList<T>(
    type: string,
    params: Record<string, any>
  ): Promise<T[]> {
    return simpleRequest<T[]>({
      method: "GET",
      url: `/resources/component/${type}`,
      query: params,
    });
  }
  static fetchComponentListPaginated<T>(
    type: string,
    params: Record<string, any>
  ): Promise<PaginatedData<T>> {
    return simpleRequest<PaginatedData<T>>({
      method: "GET",
      url: `/resources/component/${type}`,
      query: params,
    });
  }
  static createComponent<T>(
    type: string,
    data: Record<string, any>,
    options = {
      mediaType: "application/json",
    }
  ): Promise<T> {
    return simpleRequest<T>({
      method: "POST",
      url: `/resources/component/${type}/`,
      formData: data,
      mediaType: options.mediaType,
    });
  }
  static updateComponent<T>(
    type: string,
    id: DocumentId,
    data: Record<string, any>,
    options = {
      mediaType: "application/json",
    }
  ): Promise<T> {
    return simpleRequest<T>({
      method: "PUT",
      url: `/resources/component/${type}/${id}/`,
      formData: data,
      mediaType: options.mediaType,
    });
  }
  static publishContent(postId: string, content: string) {
    return this.submitAction("build-and-publish-content", {
      post_id: postId,
      content,
    });
  }
  static fetchLoadDemoLessonData(post_id: DocumentId) {
    return this.submitAction<{
      lesson_page: LessonPageDocument;
    }>("load-demo-lesson-data", {
      post_id,
    });
  }
  static fetchLoadComments(postId: DocumentId) {
    return this.submitAction("load-comments", {
      post_id: postId,
    });
  }
  static saveComment(
    postId: DocumentId,
    comment:
      | Omit<CommentDocument, "id" | "created_at" | "updated_at">
      | CommentDocument
  ) {
    return this.submitAction("save-comment", {
      post_id: postId,
      comment,
    });
  }
}
