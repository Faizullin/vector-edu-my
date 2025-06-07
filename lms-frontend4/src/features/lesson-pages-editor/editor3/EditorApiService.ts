import type { LessonPageDocument } from "@/features/lessons/data/schema";
import { PostDocument } from "@/features/posts/data/schema";
import { simpleRequest } from "@/lib/simpleRequest";
import type { CommentDocument, DocumentId, PaginatedData } from "@/types";
import { AttachmentDocument, TemplateDocument } from "./types";

type FirstArg<T extends (...args: any) => any> = Parameters<T>[0];

type ActionResult<T> = {
  success: 1;
  data: T;
} | {
  success: 0;
  errors: {
    message: string;
    errors: Array<{
      block_id: string;
      error: string;
    }>;
  };
};

export class EditorApiService {
  static baseActionUrl = `/resources/posts/edit-content/lessons3/action`;
  static saveContent(postId: DocumentId, content: string) {
    return this.submitAction<{
      instance: PostDocument;
      content: string;
    }>("save-content", {
      post_id: postId,
      content,
    });
  }
  static submitAction<T = any>(
    action: string,
    formData: {
      post_id: string;
    } & any | FormData,
    // options for simpleRequest
    options?: {
      // headers in props of simpleRequest using Props of typeof not simply Record<string, string>
      headers?: FirstArg<typeof simpleRequest>["headers"];
    }
  ) {
    return simpleRequest({
      method: "POST",
      url: `${this.baseActionUrl}`,
      body: formData,
      params: {
        action,
      },
      ...options,
    }) as Promise<ActionResult<T>>;
  }
  static loadContent(postId: DocumentId) {
    return this.submitAction<{
      content: string;
      instance: PostDocument;
      templates: TemplateDocument[];
    }>("load-content", {
      post_id: postId,
    });
  }
  static fetchTemplateDetail<T>(post_id: DocumentId, id: DocumentId) {
    return this.submitAction<TemplateDocument>("import-template-detail", {
      post_id,
      id: id,
    });
  }
  static fetchTemplateList(post_id: DocumentId, filters: Record<string, any> = {}) {
    return this.submitAction<PaginatedData<TemplateDocument>>("import-template-list", {
      post_id,
      params: filters,
    });
  }
  static createTemplate(
    post_id: DocumentId,
    data: Omit<TemplateDocument, "id" | "created_at" | "updated_at" | "post_id">
  ) {
    return this.submitAction<TemplateDocument>("import-template-create", {
      post_id,
      ...data,
    });
  }
  static updateTemplate(
    post_id: DocumentId,
    data: Omit<TemplateDocument, "id" | "created_at" | "updated_at">
  ) {
    return this.submitAction<TemplateDocument>("import-template-update", {
      post_id,
      ...data,
    });
  }
  static deleteTemplate(post_id: DocumentId, id: DocumentId) {
    return this.submitAction("import-template-delete", {
      post_id,
      id,
    });
  }
  static publishContent(postId: string, content: string, publication_status: "draft" | "published") {
    return this.submitAction<{
      instance: PostDocument;
      content: string;
    }>("publish-content", {
      post_id: postId,
      content,
      publication_status,
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
  static fileControl(
    postId: DocumentId,
    data: {
      file_action: "upload" | "remove" | "view";
      file?: File;
      attachment_id?: DocumentId;
      download?: boolean;
    }
  ) {
    const formData = new FormData();
    formData.append("post_id", `${postId}`);
    formData.append("file_action", data.file_action);

    if (data.file) {
      formData.append("file", data.file);
    }

    if (data.attachment_id) {
      formData.append("attachment_id", `${data.attachment_id}`);
    }

    if (data.download !== undefined) {
      formData.append("download", data.download.toString());
    }

    return this.submitAction<{
      attachment?: AttachmentDocument;
      view_url?: string;
      is_viewable?: boolean;
      file_info?: any;
      disposition?: 'inline' | 'attachment';
      message?: string;
    }>("file-control", formData);
  }

  static fetchMediaList(postId: DocumentId, filters: Record<string, any> = {}) {
    return this.submitAction<PaginatedData<AttachmentDocument>>("media-list", {
      post_id: postId,
      ...filters,
    });
  }
}
