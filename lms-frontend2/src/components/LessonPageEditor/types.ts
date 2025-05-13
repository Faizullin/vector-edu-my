import { DocumentBase } from "@/client/types.gen";
export type ComponentId = number;
export interface ComponentBase extends DocumentBase {
    id: ComponentId;
}
export interface VideoComponent extends ComponentBase {
    video_url: string;
    embedded_video_url: string;
    description: string;
}
export interface BluecardComponent extends ComponentBase {
    text: string;
}
export interface TextProComponent extends ComponentBase {
    title: string;
    text: string;
}
interface StorageFile {
    url: string;
}
export interface ImageComponent extends ComponentBase {
    image_url?: string;
    image: StorageFile | null;
    description: string;
}
interface QuestionAnswer extends DocumentBase {
    text: string;
    is_correct: boolean;
}
export interface QuestionComponent extends ComponentBase {
    text: string;
    answers: Array<QuestionAnswer>;
}
export type EmptyValuesWrapComponent<T> =  Omit<T, "id" | "created_at" | "updated_at">;