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
