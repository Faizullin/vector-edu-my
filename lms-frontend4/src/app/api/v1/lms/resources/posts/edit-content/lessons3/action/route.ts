import ApiUtils from "@/app/api/v1/lms/api-utils";
import { AttachmentDocument, TemplateDocument } from "@/features/lesson-pages-editor/editor3/types";
import { DocumentId } from "@/types";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const baseBodySchema = z.object({
    post_id: z.string().or(z.number())
});

type ActionHandlerExecuteAttributes<TBody = Record<string, any>> = {
    body: TBody & {
        post_id: DocumentId;
    };
};

abstract class BaseActionHandler {
    protected action: string;
    constructor(action: string) {
        this.action = action;
    }
    abstract execute(data: {
        body: any,
    }): Promise<any>;
    protected generateResponse(success: boolean | number, data: any, message?: string) {
        const parsedSuccess = typeof success === "number" ? success : (success ? 1 : 0);
        return {
            success: parsedSuccess,
            action: this.action,
            data,
            message,
            timestamp: ApiUtils.getNowIsoString(),
        };
    }
    getSchema() {
        return baseBodySchema;
    }
}

class TemplateFilter extends ApiUtils.BaseFilter<TemplateDocument> {
    filter(params: Record<string, any>): TemplateDocument[] {
        let filtered = [...this.data];
        if (params.search) {
            filtered = filtered.filter(template =>
                template.name.toLowerCase().includes(params.search.toLowerCase()) ||
                template.content.toLowerCase().includes(params.search.toLowerCase())
            );
        }
        if (params.block_id) {
            filtered = filtered.filter(template => template.block_id === params.block_id);
        }
        if (params.component_type) {
            filtered = filtered.filter(template => template.component_type === params.component_type);
        }
        return filtered;
    }
}

async function getPostTemplateRelations(postId: DocumentId) {
    const usedIds = (await ApiUtils.listItems("postTemplateRelations")).filter(rel => rel.post_id === postId);
    return (await ApiUtils.listItems("templates")).filter(template => usedIds.some(rel => rel.template_id === template.id));
}

class LoadContentHandler extends BaseActionHandler {
    static actionName = "load-content";
    constructor() {
        super(LoadContentHandler.actionName);
    }
    async execute(data: ActionHandlerExecuteAttributes) {
        const existingPost = await ApiUtils.findItemById("posts", data.body.post_id);
        return this.generateResponse(
            true,
            {
                content: existingPost.content,
                instance: existingPost,
                templates: await getPostTemplateRelations(existingPost.id),
            },
            "Content loaded successfully"
        );
    }
}

class SaveContentHandler extends BaseActionHandler {
    static actionName = "save-content";
    constructor() {
        super(SaveContentHandler.actionName);
    }
    async execute(data: ActionHandlerExecuteAttributes<{ content: string }>) {
        const existingPost = await ApiUtils.findItemById("posts", data.body.post_id);
        const updatedPost = await ApiUtils.updateItem("posts", existingPost.id, {
            content: data.body.content,
        });
        return this.generateResponse(
            true,
            { content: updatedPost.content, instance: updatedPost },
            "Content saved successfully"
        );
    }
    getSchema() {
        return super.getSchema().extend({
            content: z.string().min(1, "Content cannot be empty"),
        });
    }
}


class PublishContentHandler extends BaseActionHandler {
    static actionName = "publish-content";
    constructor() {
        super(PublishContentHandler.actionName);
    }
    async execute(data: ActionHandlerExecuteAttributes<{
        content: string;
        publication_status: "draft" | "published";
    }>) {
        const existingPost = await ApiUtils.findItemById("posts", data.body.post_id);
        const updatedPost = await ApiUtils.updateItem("posts", existingPost.id, {
            content: existingPost.content,
            publication_status: data.body.publication_status === "published" ? 1 : 0,
        });
        return this.generateResponse(
            true,
            { instance: updatedPost, content: updatedPost.content },
            "Content published successfully"
        );
    }
    getSchema() {
        return super.getSchema().extend({
            content: z.string().min(1, "Content cannot be empty"),
            publication_status: z.enum(["draft", "published"]),
        });
    }
}

class ImportTemplateSubmitHandler extends BaseActionHandler {
    static actionName = "import-template-submit";
    constructor() {
        super(ImportTemplateSubmitHandler.actionName);
    }

    async execute(data: ActionHandlerExecuteAttributes<{ body: { name: string; content: string, id?: DocumentId; block_id: string; component_type: string; } }>) {
        const existingPost = await ApiUtils.findItemById("posts", data.body.post_id);
        const mode = data.body.body.id ? "edit" : "create";
        let editedTemplate: TemplateDocument | null = null;
        const submitData = {
            name: data.body.body.name,
            content: data.body.body.content,
            block_id: data.body.body.block_id,
            component_type: data.body.body.component_type,
        }
        if (mode === "create" && !data.body.body.id) {
            editedTemplate = await ApiUtils.addItem("templates", submitData);
        } else if (mode === "edit") {
            editedTemplate = await ApiUtils.findItemById("templates", data.body.body.id!);
            editedTemplate = await ApiUtils.updateItem("templates", editedTemplate.id, submitData);
        }
        await ApiUtils.addItem("postTemplateRelations", {
            post_id: existingPost.id,
            template_id: editedTemplate!.id,
        });
        return this.generateResponse(
            true,
            { instance: existingPost, template: editedTemplate, templates: await getPostTemplateRelations(existingPost.id) },
            "Template imported successfully"
        );
    }
    getSchema() {
        return super.getSchema().extend({
            body: z.object({
                name: z.string().min(1, "Template name is required"),
                content: z.string().min(1, "Template content is required"),
                id: z.number().optional(),
                block_id: z.string().min(1, "Block ID is required"),
                component_type: z.string().min(1, "Component type is required"),
            }),
        });
    }
}


class ImportTemplateListHandler extends BaseActionHandler {
    static actionName = "import-template-list";
    constructor() {
        super(ImportTemplateListHandler.actionName);
    }

    async execute(data: ActionHandlerExecuteAttributes) {
        await ApiUtils.findItemById("posts", data.body.post_id);
        const templates = await ApiUtils.listItems("templates");
        const filter = new TemplateFilter(templates);
        const filtered = filter.filter(data.body.params);
        const paginated = ApiUtils.paginate(filtered, data.body.params.page || 1, data.body.params.page_size || 10);
        return this.generateResponse(
            true,
            paginated,
            "Templates list retrieved successfully"
        );
    }
    getSchema() {
        return super.getSchema().extend({
            params: z.object({
                search: z.string().optional(),
                component_type: z.string().optional(),
            }),
        });
    }
}

class ImportTemplateDetailHandler extends BaseActionHandler {
    static actionName = "import-template-detail";
    constructor() {
        super(ImportTemplateDetailHandler.actionName);
    }
    async execute(data: ActionHandlerExecuteAttributes<{ id: DocumentId, post_id: DocumentId }>) {
        await ApiUtils.findItemById("posts", data.body.post_id);
        const template = await ApiUtils.findItemById("templates", data.body.id);
        return this.generateResponse(
            true,
            template,
            "Template detail retrieved successfully"
        );
    }
    getSchema() {
        return super.getSchema().extend({
            id: z.number(),
        });
    }
}


const parseAttachment = (obj: AttachmentDocument) => {
    return {
        id: obj.id,
        name: obj.name,
        original_name: obj.original_name,
        size: obj.size,
        url: obj.url,
        content_type: obj.content_type,
        object_id: obj.object_id,
        attachment_type: obj.attachment_type,
        storage_engine: obj.storage_engine,
        uploaded_at: obj.uploaded_at,
        extension: obj.extension,
        alt: obj.alt,
        file_type: obj.file_type,
    };
}
class FileControlHandler extends BaseActionHandler {
    static actionName = "file-control";
    constructor() {
        super(FileControlHandler.actionName);
    }
    async execute(data: ActionHandlerExecuteAttributes<{
        file_action: "upload";
        file?: File;
    } | {
        file_action: "remove";
        attachment_id: DocumentId;
    }>) {
        const existingPost = await ApiUtils.findItemById("posts", data.body.post_id);

        const fileAction = data.body.file_action;

        if (fileAction === "upload") {
            if (!data.body.file) {
                throw new Error("File is required for upload action");
            }

            try {
                const file = data.body.file;

                // Get file extension
                const fileName = file.name;
                const extension = ("." + fileName.split('.').pop()?.toLowerCase()) as AttachmentDocument["extension"];

                // Upload file using FileStorage utility
                const storedFile = await ApiUtils.FileStorage.uploadFile({
                    file: file,
                    storageEngine: "protected-local",
                    maxSize: 50 * 1024 * 1024, // 50MB
                    allowedTypes: [], // Allow all file types
                    directory: `posts/${existingPost.id}` // Organize files by post
                });
                // Create attachment record in database
                const newAttachment = await ApiUtils.addItem("attachments", {
                    name: storedFile.filename,
                    original_name: storedFile.originalName,
                    size: storedFile.size,
                    url: `${storedFile.url}`, // Public URL for access
                    content_type: "posts",
                    object_id: existingPost.id,
                    attachment_type: "file",
                    storage_engine: "protected-local",
                    uploaded_at: storedFile.uploadedAt,
                    file: storedFile.path, // Path to the file on disk
                    extension,
                    alt: storedFile.originalName || storedFile.filename,
                    file_type: ApiUtils.FileStorage.getFileType(extension),
                });
                let updatedAttachment = await ApiUtils.updateItem("attachments", newAttachment.id, {
                    url: newAttachment.url + `?attachment_id=${newAttachment.id}`,
                });
                return this.generateResponse(
                    true,
                    {
                        message: "File uploaded successfully",
                        attachment: parseAttachment(updatedAttachment),
                    },
                    "File uploaded successfully"
                );
            } catch (error) {
                return this.generateResponse(
                    false,
                    {},
                    error instanceof Error ? error.message : "File upload failed"
                );
            }
        }
        else if (fileAction === "remove") {
            const attachmentId = data.body.attachment_id;

            try {
                const existingAttachment = await ApiUtils.findItemById("attachments", attachmentId!);

                // Validate attachment belongs to the post
                if (existingAttachment.content_type !== "posts" || existingAttachment.object_id !== existingPost.id) {
                    return this.generateResponse(false, {}, "Attachment ID does not refer to a valid attachment for the post");
                }

                // Remove physical file if path exists
                if (existingAttachment.file) {
                    await ApiUtils.FileStorage.removeFile(existingAttachment.file);
                }

                // Remove attachment record from database
                await ApiUtils.deleteItem("attachments", existingAttachment.id);

                return this.generateResponse(
                    true,
                    {
                        message: "File removed successfully",
                        attachment_id: attachmentId
                    },
                    "File removed successfully"
                );
            } catch (error) {
                return this.generateResponse(false, {}, "Attachment ID is invalid");
            }
        }

        return this.generateResponse(false, {}, "Invalid file action");
    }

    getSchema() {
        return z.object({
            post_id: z.string().or(z.number()),
            file_action: z.enum(["upload", "remove"]),
            file: z.any().optional(),
            attachment_id: z.number().optional(),
        }).superRefine((data, ctx) => {
            // If file_action is "upload", file is required
            if (data.file_action === "upload") {
                if (!data.file) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        message: "File is required when file_action is 'upload'",
                        path: ["file"],
                    });
                }
            }

            // If file_action is "remove", attachment_id is required
            if (data.file_action === "remove") {
                if (!data.attachment_id) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        message: "attachment_id is required when file_action is 'remove'",
                        path: ["attachment_id"],
                    });
                }
            }
        }) as any;
    }
}

class AttachmentFilter extends ApiUtils.BaseFilter<AttachmentDocument> {
    filter(params: Record<string, any>): AttachmentDocument[] {
        let filtered = [...this.data];
        if (!params) {
            return filtered;
        }
        if (params.search) {
            filtered = filtered.filter(attachment =>
                attachment.name.toLowerCase().includes(params.search.toLowerCase()) ||
                attachment.original_name.toLowerCase().includes(params.search.toLowerCase())
            );
        }
        if (params.file_type) {
            filtered = filtered.filter(attachment => attachment.file_type === params.file_type);
        }
        return filtered;
    }
}
class MediaListHandler extends BaseActionHandler {
    static actionName = "media-list";
    constructor() {
        super(MediaListHandler.actionName);
    }
    async execute(data: ActionHandlerExecuteAttributes<{
        params?: {
            search?: string;
            file_type?: string;
            page?: number;
            page_size?: number;
        }
    }>) {
        await ApiUtils.findItemById("posts", data.body.post_id);
        const attachments = await ApiUtils.listItems("attachments");
        const filter = new AttachmentFilter(attachments);
        const filtered = filter.filter(data.body.params || {});
        const paginated = ApiUtils.paginate(filtered, data.body.params?.page || 1, data.body.params?.page_size || 10);
        return this.generateResponse(
            true,
            {
                ...paginated,
                results: paginated.results.map(parseAttachment),
            },
            "Media list retrieved successfully"
        );
    }
    getSchema() {
        return super.getSchema().extend({
            params: z.object({
                search: z.string().optional(),
                file_type: z.string().optional(),
            }).optional(),
        });
    }
}

// --- Centralized list of handlers ---
const actionHandlers = [
    new LoadContentHandler(),
    new SaveContentHandler(),
    new PublishContentHandler(),
    new ImportTemplateSubmitHandler(),
    new ImportTemplateListHandler(),
    new ImportTemplateDetailHandler(),
    new FileControlHandler(), // Add FileControlHandler to the list
    new MediaListHandler(),
];

// URL params validation
const paramsSchema = z.object({
    action: z.enum((actionHandlers as any).map((h: any) => h.constructor.actionName)),
});


export async function POST(request: NextRequest) {
    try {
        // Extract action from URL search params
        const { searchParams } = new URL(request.url);
        const urlParams = {
            action: searchParams.get("action"),
        };

        // Validate URL parameters
        const validatedParams = paramsSchema.parse(urlParams);
        const { action } = validatedParams;

        // Parse request body
        let body: any | FormData = {};

        // Handle different content types generically
        const contentType = request.headers.get("content-type");
        if (contentType?.includes("multipart/form-data")) {
            body = await request.formData();
            for (const [key, value] of body.entries()) {
                if (value instanceof File) {
                    const file = body.get('file');
                    // Keep File objects as-is
                    body[key] = value;
                } else {
                    // Convert form fields to appropriate types
                    const stringValue = value.toString();

                    // Try to parse numbers
                    if (/^\d+$/.test(stringValue)) {
                        body[key] = parseInt(stringValue, 10);
                    }
                    // Try to parse JSON objects/arrays
                    else if ((stringValue.startsWith('{') && stringValue.endsWith('}')) ||
                        (stringValue.startsWith('[') && stringValue.endsWith(']'))) {
                        try {
                            body[key] = JSON.parse(stringValue);
                        } catch {
                            body[key] = stringValue;
                        }
                    }
                    // Keep as string
                    else {
                        body[key] = stringValue;
                    }
                }
            }
        } else if (contentType?.includes("application/json")) {
            body = await request.json();
        }
        else {
            throw new Error("Unsupported content type. Only multipart/form-data and application/json are supported.");
        }

        const handler = actionHandlers.find(h => (h.constructor as any).actionName === action);
        if (!handler) {
            return NextResponse.json(
                {
                    success: false,
                    error: `Action handler not found for action: ${action}`,
                },
                { status: 400 }
            );
        }

        let validatedBody;
        try {
            const schema = handler.getSchema();
            validatedBody = schema.parse(body);
        } catch (validationError) {
            // For handlers that need custom validation (like file uploads), pass through
            if (validationError instanceof z.ZodError &&
                validationError.errors.some(err => err.message.includes('File') || err.path.includes('file'))) {
                validatedBody = body;
            } else {
                throw validationError;
            }
        }
        const result = await handler.execute({
            body: validatedBody as any,
        });

        return NextResponse.json(result, { status: 200 });

    } catch (error) {
        // Handle validation errors
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Validation failed",
                    details: error.errors.map(err => ({
                        field: err.path.join("."),
                        message: err.message,
                    })),
                },
                { status: 400 }
            );
        }

        // Handle other errors
        throw error; // Re-throw other errors for centralized error handling

        // return NextResponse.json(
        //     {
        //         success: false,
        //         error: "Internal server error",
        //         message: error instanceof Error ? error.message : "Unknown error",
        //     },
        //     { status: 500 }
        // );
    }
}