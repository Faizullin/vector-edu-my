import { simpleRequest } from "@/client/core/simpleRequest";
import { PaginatedData } from "@/client/types.gen";
import { ComponentId } from "./types";

export class EditorApiService {
    static baseActionUrl = `/resources/posts/edit-content/lessons2/action`
    static saveContent(postId: string, content: string): Promise<void> {
        return this.submitAction("save-content", {
            post_id: postId,
            content,
        })
    }
    static submitAction(
        action: string,
        formData: {
            post_id: string
        } & any): Promise<void> {
        return simpleRequest({
            method: "POST",
            url: `${this.baseActionUrl}`,
            formData,
            query: {
                action,
            }
        })
    }
    static loadContent(postId: string): Promise<any> {
        return this.submitAction("load-content", {
            post_id: postId,
        })
    }
    static fetchComponentDetail<T,>(type: string, id: ComponentId): Promise<T> {
        return simpleRequest<T>({
            method: "GET",
            url: `/resources/component/${type}/${id}`,
        });
    }
    static fetchComponentList<T,>(type: string, params: Record<string, any>): Promise<T[]> {
        return simpleRequest<T[]>({
            method: "GET",
            url: `/resources/component/${type}`,
            query: params,
        });
    }
    static fetchComponentListPaginated<T,>(type: string, params: Record<string, any>): Promise<PaginatedData<T>> {
        return simpleRequest<PaginatedData<T>>({
            method: "GET",
            url: `/resources/component/${type}`,
            query: params,
        });
    }
    static createComponent<T,>(type: string, data: Record<string, any>): Promise<T> {
        return simpleRequest<T>({
            method: "POST",
            url: `/resources/component/${type}/`,
            formData: data,
        });
    }
    static updateComponent<T,>(type: string, id: ComponentId, data: Record<string, any>): Promise<T> {
        return simpleRequest<T>({
            method: "PUT",
            url: `/resources/component/${type}/${id}/`,
            formData: data,
        });
    }
}