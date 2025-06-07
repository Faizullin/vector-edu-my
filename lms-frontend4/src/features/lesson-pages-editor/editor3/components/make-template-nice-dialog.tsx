import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import NiceModal, {
    NiceModalHocPropsExtended,
} from "@/context/nice-modal-context";
import { DocumentId } from "@/types";
import { showToast } from "@/utils/handle-server-error";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { EditorApiService } from "../EditorApiService";
import { Block, TemplateDocument } from "../types";

const templateSchema = z.object({
    name: z.string()
        .min(1, "Template name is required")
        .min(3, "Template name must be at least 3 characters long")
        .max(100, "Template name must be less than 100 characters"),
    component_type: z.string()
        .min(1, "Component type is required")
        .max(50, "Component type must be less than 50 characters"),
});

type TemplateFormData = z.infer<typeof templateSchema>;

const MakeTemplateNiceDialog = NiceModal.create<
    NiceModalHocPropsExtended<{
        post_id: DocumentId;
        block: Block;
        template: TemplateDocument | null;
    }>
>((props) => {
    const modal = NiceModal.useModal();
    const isUpdateMode = !!props.template;

    const form = useForm<TemplateFormData>({
        resolver: zodResolver(templateSchema),
        defaultValues: {
            name: "",
        },
    });

    const createTemplateMutation = useMutation({
        mutationFn: (body: { name: string; content: string; component_type: string }) => {
            const submitData: any = {
                name: body.name.trim(),
                content: body.content,
                block_id: props.block.id,
                component_type: body.component_type,
            }
            if (props.template) {
                submitData.id = props.template.id;
            }
            return EditorApiService.submitAction<{
                template: TemplateDocument;
            }>("import-template-submit", {
                post_id: props.post_id,
                body: submitData,
            });
        },
        onSuccess: (response) => {
            if (response.success === 0) {
                showToast("error", {
                    message: `Failed to ${isUpdateMode ? 'update' : 'create'} template`,
                    data: {
                        description: "Unknown error",
                    },
                });
                return;
            }
            showToast("success", {
                message: `Template ${isUpdateMode ? 'updated' : 'created'} successfully`,
                data: {
                    description: `Template "${form.getValues('name')}" ${isUpdateMode ? 'updated' : 'created'} successfully!`,
                }
            });
            modal.resolve({
                result: {
                    record: response.data.template
                }
            })
            modal.hide();
            form.reset();
        },
        onError: (error) => {
            showToast("error", {
                message: `Failed to ${isUpdateMode ? 'update' : 'create'} template`,
                data: {
                    description: error instanceof Error ? error.message : "Unknown error",
                },
            });
        },
    });

    const onSubmit = (data: TemplateFormData) => {
        const content = JSON.stringify(props.block.data || null, null, 2);

        createTemplateMutation.mutate({
            name: data.name.trim(),
            content: content,
            component_type: data.component_type,
        });
    };

    useEffect(() => {
        if (props.template) {
            form.reset({
                name: props.template.name,
                component_type: props.template.component_type,
            });
        } else {
            form.reset({
                name: `${props.block.type} [#${props.block.id}] Template`,
                component_type: props.block.type,
            });
        }
    }, [props.template, props.block, form]);

    return (
        <Dialog open={modal.visible} onOpenChange={(v) => !v && modal.hide()}>
            <DialogContent className="max-w-[98vw] max-h-[90vh] overflow-hidden px-0">
                <DialogHeader className="px-6 pt-6">
                    <DialogTitle>
                        {isUpdateMode ? 'Update' : 'Make'} Template {props.block.type} [#{props.block.id}]
                        {isUpdateMode && (
                            <span className="text-sm font-normal text-muted-foreground ml-2">
                                (ID: {props.template!.id})
                            </span>
                        )}
                    </DialogTitle>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col h-full">
                        <div className="px-6 py-4 space-y-4">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Template Name *</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Enter template name..."
                                                disabled={createTemplateMutation.isPending}
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            {isUpdateMode
                                                ? "Update the name for your template"
                                                : "Choose a unique name for your template"
                                            }
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="component_type"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Component Type *</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Enter component type..."
                                                disabled={createTemplateMutation.isPending}
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            Specify the type of component this template is for.
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <ScrollArea className="flex-1 h-[50vh] w-full overflow-auto">
                            <div className="px-6 py-4">
                                <Label className="text-sm font-medium mb-2 block">
                                    Template Content Preview:
                                </Label>
                                <pre className="text-sm bg-gray-100 text-gray-800 p-4 rounded overflow-auto whitespace-pre-wrap">
                                    {JSON.stringify(props.block.data || null, null, 2)}
                                </pre>
                            </div>
                        </ScrollArea>

                        <DialogFooter className="px-6 pb-6">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => modal.hide()}
                                disabled={createTemplateMutation.isPending}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={
                                    createTemplateMutation.isPending ||
                                    !form.formState.isValid
                                }
                            >
                                {createTemplateMutation.isPending
                                    ? `${isUpdateMode ? 'Updating' : 'Creating'}...`
                                    : `${isUpdateMode ? 'Update' : 'Create'} Template`}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
});

export default MakeTemplateNiceDialog;