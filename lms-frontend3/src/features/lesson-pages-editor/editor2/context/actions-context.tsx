//// filepath: c:\Users\osman\Desktop\OSMANPROJECTS\vector-education-master\lms-frontend3\src\features\lesson-pages-editor\editor2\actions-context.tsx
import type { DocumentBase, DocumentId } from "@/client";
import { simpleRequest } from "@/client/core/simpleRequest";
import type { LessonPageDocument } from "@/features/lessons/data/schema";
import type { PostDocument } from "@/features/posts/data/schema";
import { useCustomToast } from "@/hooks/use-custom-toast";
import { Log } from "@/utils/log";
import { useMutation } from "@tanstack/react-query";
import { useLoaderData } from "@tanstack/react-router";
import React, { createContext, useCallback, useContext } from "react";
import { EditorApiService } from "../EditorApiService";
import { schema } from "../schema";
import type { SaveDataJsonType } from "../types";
import { createSaveData, generateBlockId } from "../utils";
import { useEditor } from "./editor-context";

interface ActionsContextValue {
  saveMuatation: any;
  publishMutation: any;
  loadDemoMutation: any;
  loadInitial: () => void;
  loadRelatedLessonPagesMutation: ReturnType<
    typeof useMutation<LessonPageDocument[]>
  >;
  publishAndLoad: () => void;
}

const ActionsContext = createContext<ActionsContextValue | null>(null);

export function ActionsProvider({ children }: { children: React.ReactNode }) {
  const { lessonObj, postObj } = useLoaderData({
    from: "/_layout/lessons/$lesson_id/pages/$page_id/editor",
  });
  const { setInitialContent } = useEditor();

  const loadQuery = useMutation({
    mutationFn: () => EditorApiService.loadContent(postObj.id),
    mutationKey: ["loadContent", postObj.id],
  });
  const loadContentObjDataMutation = useMutation({
    mutationFn: (
      items: Array<{ component_type: string; object_id: DocumentId }>
    ) => EditorApiService.loadContentObjData(postObj.id, items),
    mutationKey: ["loadContentObjData", postObj.id],
  });
  const saveMuatation = useMutation({
    mutationFn: (content: string) =>
      EditorApiService.saveContent(postObj.id, content),
    mutationKey: ["saveContent"],
  });
  const publishMutation = useMutation({
    mutationFn: (content: string) =>
      EditorApiService.publishContent(`${postObj.id}`, content),
    mutationKey: ["publishContent"],
  });
  const { blocks, setErrors } = useEditor();
  const loadRelatedLessonPagesMutationQuery = {
    lesson: lessonObj.id,
    disablePagination: true,
  };
  const loadRelatedLessonPagesMutation = useMutation<LessonPageDocument[]>({
    mutationFn: () =>
      simpleRequest({
        url: `/lessons/pages`,
        method: "GET",
        query: loadRelatedLessonPagesMutationQuery,
      }),
    mutationKey: ["lesson-pages", loadRelatedLessonPagesMutationQuery],
  });
  const loadAndParseEditor = useCallback(() => {
    loadQuery.mutateAsync().then((response) => {
      let parsed: SaveDataJsonType | null = null;
      try {
        if (response.data.content) {
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
      }
      if (parsed !== null) {
        try {
          const items = parsed.blocks
            .filter((block) => block.data.obj)
            .map((block) => ({
              component_type: block.type,
              object_id: block.data.obj!.id,
            }));
          if (items.length > 0) {
            loadContentObjDataMutation.mutateAsync(items).then((response) => {
              const objMap = response.data.items.reduce(
                (acc, item) => {
                  acc[item.object_id] = item;
                  return acc;
                },
                {} as Record<string, any>
              );
              parsed.blocks.forEach((block) => {
                if (!block.id) {
                  block.id = generateBlockId();
                }
                if (block.data.obj && objMap[block.data.obj.id]) {
                  block.data.obj = objMap[block.data.obj.id].component_data;
                  const blockSchema = schema[block.type]!;
                  if (!blockSchema) {
                    Log.error("Block schema not found", block.type);
                    return;
                  } else {
                    const newalues = blockSchema
                      .sideMenu()
                      .parseObjToValues(block.data.obj);
                    block.data.values = {
                      ...block.data.values,
                      ...newalues,
                    };
                  }
                }
              });
              setInitialContent(parsed);
            });
          } else {
            setInitialContent(parsed);
          }
        } catch (e) {
          Log.error(e);
        }
      }
    });
  }, [loadQuery, loadContentObjDataMutation]);
  const loadInitial = useCallback(() => {
    loadRelatedLessonPagesMutation.mutateAsync();
    loadAndParseEditor();
  }, [loadAndParseEditor, loadRelatedLessonPagesMutation]);
  const { showSuccessToast, showErrorToast } = useCustomToast();
  const publishAndLoad = useCallback(() => {
    const parsed = createSaveData(blocks);
    const content = JSON.stringify(parsed);
    setErrors([]);
    publishMutation.mutateAsync(content).then((response: any) => {
      const r = response as
        | {
            success: 1;
            data: {
              instance: PostDocument;
              content: string;
              elements: Array<DocumentBase>;
            };
          }
        | {
            success: 0;
            errors: {
              message: string;
              errors: Array<{
                block_id: string;
                error: string;
              }>;
            };
          };
      if (r.success === 1) {
        loadAndParseEditor();
        showSuccessToast({
          title: "Published successfully",
          duration: 2000,
        });
      } else if (r.success === 0) {
        setErrors((prev) => {
          const newErrors = r.errors.errors.map((error) => ({
            block_id: error.block_id,
            error: error.error,
          }));
          return [...prev, ...newErrors];
        });
        let errMessage = r.errors.message || "Publish failed";
        showErrorToast({
          title: errMessage,
          duration: 2000,
        });
      }
    });
  }, [blocks, loadAndParseEditor]);
  const loadDemoMutation = useMutation({
    mutationFn: (postId: DocumentId) =>
      EditorApiService.fetchLoadDemoLessonData(postId),
    mutationKey: ["loadDemoContent"],
  });
  return (
    <ActionsContext.Provider
      value={{
        loadInitial,
        saveMuatation,
        publishMutation,
        loadDemoMutation,
        loadRelatedLessonPagesMutation,
        publishAndLoad,
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
