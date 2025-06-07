import type { LessonPageDocument } from "@/features/lessons/data/schema";
import { PostDocument } from "@/features/posts/data/schema";
import { simpleRequest } from "@/lib/simpleRequest";
import type { DocumentId } from "@/types";
import { showToast } from "@/utils/handle-server-error";
import { Log } from "@/utils/log";
import { showComponentNiceDialog } from "@/utils/nice-modal";
import { useMutation } from "@tanstack/react-query";
import React, { createContext, useCallback, useContext, useMemo } from "react";
import MakeTemplateNiceDialog from "../components/make-template-nice-dialog";
import { EditorApiService } from "../EditorApiService";
import type { BlockIdentifier, SaveDataJsonType } from "../types";
import { createSaveData, generateBlockId } from "../utils";
import { useEditor } from "./editor-context";
import { useLoadDataContext } from "./load-data-context";

type UnwrapPromise<T> = T extends Promise<infer U> ? U : T;
type MutationReturn<TFn extends (...args: any[]) => Promise<any>, TVariables> = ReturnType<
  typeof useMutation<UnwrapPromise<ReturnType<TFn>>, Error, TVariables>
>;
interface ActionsContextValue {
  saveMuatation: MutationReturn<typeof EditorApiService.saveContent, string>;
  publishMutation: MutationReturn<
    typeof EditorApiService.publishContent,
    { content: string; publication_status: "draft" | "published" }
  >;
  loadDemoMutation: MutationReturn<typeof EditorApiService.fetchLoadDemoLessonData, DocumentId>;
  loadRelatedLessonPagesMutation: MutationReturn<
    typeof simpleRequest<LessonPageDocument[]>, void
  >;
  loadAndParseEditor: () => Promise<{
    response: { success: 1; data: { content: string; instance: PostDocument; } };
    parsed: SaveDataJsonType | null;
  }>;
  makeTemplateFromBlock: (blockId: BlockIdentifier) => void;
}

const ActionsContext = createContext<ActionsContextValue | null>(null);

export function ActionsProvider({ children }: { children: React.ReactNode }) {
  const { lessonObj, postObj } = useLoadDataContext();
  const { setInitialContent, setTemplates } = useEditor();

  const loadQuery = useMutation({
    mutationFn: () => EditorApiService.loadContent(postObj.id),
    mutationKey: ["loadContent", postObj.id],
  });
  const saveMuatation = useMutation({
    mutationFn: (content: string) =>
      EditorApiService.saveContent(postObj.id, content),
    mutationKey: ["saveContent"],
  });
  const publishMutation = useMutation({
    mutationFn: ({
      content,
      publication_status,
    }: {
      content: string;
      publication_status: "draft" | "published";
    }) =>
      EditorApiService.publishContent(postObj.id, content, publication_status),
    mutationKey: ["publishContent"],
  });
  const { blocks, templates } = useEditor();
  const loadRelatedLessonPagesMutationQuery = useMemo(() => {
    return {
      lesson: `${lessonObj.id}`,
      disablePagination: `${true}`,
    };
  }, [lessonObj]);
  const loadRelatedLessonPagesMutation = useMutation({
    mutationFn: () =>
      simpleRequest<LessonPageDocument[]>({
        url: `/lessons/pages`,
        method: "GET",
        params: loadRelatedLessonPagesMutationQuery,
      }) as Promise<LessonPageDocument[]>,
    mutationKey: ["lesson-pages", loadRelatedLessonPagesMutationQuery],
  });
  const loadAndParseEditor = useCallback(async () => {
    const response = await loadQuery.mutateAsync();
    if (response.success === 0) {
      showToast("error", {
        message: "Failed to load content",
      });
      throw new Error("No data returned from loadContent mutation");
    }
    const r = response.data;
    let parsed: SaveDataJsonType | null = null;
    try {
      if (r.content) {
        parsed = JSON.parse(response.data.content);
      } else {
        parsed = createSaveData([
          {
            id: generateBlockId(),
            type: "text-pro",
            data: {
              values: {
                title: "Text Pro",
                text: "This is a TextPro block.",
              },
              obj: null,
            },
          },
        ]);
      }
    } catch (e) {
      Log.error(e);
      showToast("error", {
        message: "Failed to parse JSON content",
        data: {
          description: `${e}`,
        },
      });
      throw e;
    }
    if (parsed !== null) {
      const newTemplates = response.data.templates;
      const items = parsed.blocks
        .filter((block) => block.data.template_id);
      if (items.length > 0) {
        items.forEach((block) => {
          const template = newTemplates.find((t) => t.id === block.data.template_id);
          if (template) {
            let newValues: any = {}
            try {
              const JSONContent = JSON.parse(template.content);
              newValues = {
                ...JSONContent.values,
              };
            } catch (error) {
              showToast("error", {
                message: "Error importing template",
                data: {
                  description: `${error}`,
                },
              });
              return;
            }
            block.data.values = {
              ...block.data.values,
              ...newValues,
            };
          }
        });
      }
      setTemplates(newTemplates);
      setInitialContent(parsed);
    }
    return {
      success: 1,
      response,
      parsed,
    };
  }, [loadQuery, setInitialContent]);
  const loadDemoMutation = useMutation({
    mutationFn: (postId: DocumentId) =>
      EditorApiService.fetchLoadDemoLessonData(postId),
    mutationKey: ["loadDemoContent"],
  });

  const makeTemplateFromBlock = useCallback(
    (blockId: BlockIdentifier) => {
      const block = blocks.find((b) => b.id === blockId);
      if (!block) {
        throw new Error(`Block with id "${blockId}" not found`);
      }
      const existingTemplate = templates.find(
        (t) => t.block_id === block.id
      );
      showComponentNiceDialog(MakeTemplateNiceDialog, {
        block: block,
        template: existingTemplate,
        post_id: postObj.id,
      });
    },
    [blocks, templates]
  );
  return (
    <ActionsContext.Provider
      value={{
        saveMuatation,
        publishMutation,
        loadDemoMutation,
        loadRelatedLessonPagesMutation,
        loadAndParseEditor,
        makeTemplateFromBlock,
      }}
    >
      {children}
    </ActionsContext.Provider>
  );
}

export function useActionsContext() {
  const context = useContext(ActionsContext);
  if (!context) {
    throw new Error(
      "useActionsContext must be used inside an ActionsContextProvider"
    );
  }
  return context;
}
