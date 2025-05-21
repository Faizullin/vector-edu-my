import {
  createDefaultApiService,
  useComponentBaseForm,
} from "@/components/form/component-base";
import NiceModal, {
  type NiceModalHocPropsExtended,
} from "@/components/nice-modal/NiceModal";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCustomToast } from "@/hooks/use-custom-toast";
import { memo, useCallback, useMemo } from "react";
import type { Block } from "../../types";
import { MatchingQuestionsProvider, useMatchingQuestions } from "./context";
import { CouplesList } from "./couples-list";
import { ElementEditor } from "./element-editor";
import { ElementsList } from "./element-list";
import { PreviewSection } from "./preview-section";
import {
  type Matching,
  type MatchingComponent,
  matchingComponentSchema,
} from "./schema";
import { generateCoupleTrackId } from "./utils";

export const MatchingEditNiceDialog = NiceModal.create<
  NiceModalHocPropsExtended<{
    block: Block;
  }>
>((props) => {
  const modal = NiceModal.useModal();
  const formMode = useMemo(() => {
    return props.block.data.obj ? "edit" : "create";
  }, [props.block.data.obj]);
  const { showSuccessToast, showErrorToast } = useCustomToast();
  const formHook = useComponentBaseForm<
    MatchingComponent,
    typeof matchingComponentSchema
  >({
    schema: matchingComponentSchema,
    apiService: createDefaultApiService({
      url: `/resources/component/matching`,
    }),
    queryKey: "components/matching",
    invalidateQueriesOnMutate: true,
    initialMode: formMode,
    recordId: props.block.data.obj?.id || null,
    defaultValues: {
      title: "",
      couples: [],
      elements: [],
    },
    notifications: {
      onSuccess: (title) => {
        showSuccessToast({
          title,
          duration: 2000,
        });
      },
      onError: (title) => {
        showErrorToast({
          title,
          duration: 2000,
        });
      },
    },
    transformToApi(submitData) {
      const formData = new FormData();
      formData.append("title", submitData.title);

      submitData.elements.forEach((el, index) => {
        formData.append(`elements[${index}]uid`, el.uid);
        formData.append(`elements[${index}]text`, el.text);
        if (el.image_file) {
          formData.append(`elements[${index}]image_file`, el.image_file);
        }
        const existingElement = formHook.record?.elements.find(
          (e) => e.uid === el.uid
        );
        if (existingElement?.id) {
          formData.append(`elements[${index}].id`, `${existingElement.id}`);
        }
      });

      submitData.couples.forEach((cp, index) => {
        formData.append(
          `couples[${index}]first_element`,
          cp.first_element || ""
        );
        formData.append(
          `couples[${index}]second_element`,
          cp.second_element || ""
        );
      });

      return formData;
    },
    transformToForm(data) {
      const newData: Matching = {
        title: data.title,
        elements: data.elements.map((el) => ({
          uid: el.uid,
          text: el.text,
          image_file: null,
          image: el.image,
        })),
        couples: [],
      };
      data.couples.forEach((cp) => {
        const firstElement = data.elements.find(
          (el) => el.uid === cp.first_element
        );
        const secondElement = data.elements.find(
          (el) => el.uid === cp.second_element
        );
        if (firstElement && secondElement) {
          newData.couples.push({
            first_element: firstElement.uid,
            second_element: secondElement.uid,
            trackUid: generateCoupleTrackId(firstElement, secondElement),
          });
        }
      });
      return newData;
    },
  });

  return (
    <Dialog
      open={modal.visible}
      onOpenChange={(v) => {
        if (!v) {
          modal.hide();
        }
        formHook.form.reset();
      }}
    >
      <DialogContent className="!max-w-[1000px]">
        <DialogHeader className="text-left">
          <DialogTitle>
            {formHook.record
              ? `Edit Matching Component [#${formHook.record.id}]`
              : `Create Matching Component`}
          </DialogTitle>
        </DialogHeader>
        <div className=" w-full overflow-y-auto mt-4">
          <MatchingQuestionsProvider formHook={formHook}>
            <Form {...formHook.form}>
              <ScrollArea className="h-[70vh]">
                <RenderForm formHook={formHook} />
              </ScrollArea>
            </Form>
          </MatchingQuestionsProvider>
        </div>
      </DialogContent>
    </Dialog>
  );
});

const RenderForm = memo(
  (props: { formHook: ReturnType<typeof useComponentBaseForm> }) => {
    const { handlePreview, handleSave, activeSection, setActiveSection } =
      useMatchingQuestions();
    const modal = NiceModal.useModal();

    const handleClose = useCallback(() => {
      props.formHook.form.reset();
      modal.hide();
    }, [modal, props.formHook.form]);
    return (
      <div className="bg-white rounded-b-xl shadow-md overflow-hidden px-4">
        {/* Top Form Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <form onSubmit={props.formHook.handleSubmit}>
            <FormField
              control={props.formHook.form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </div>

        <hr className="border-t border-gray-200 my-2" />

        <Tabs
          value={activeSection}
          onValueChange={(value) =>
            setActiveSection(value as typeof activeSection)
          }
        >
          <TabsList>
            <TabsTrigger value="elements" className="px-8 py-4">
              Elements
            </TabsTrigger>
            <TabsTrigger value="couples" className="px-8 py-4">
              Couples
            </TabsTrigger>
            <TabsTrigger value="preview" className="px-8 py-4">
              Preview
            </TabsTrigger>
          </TabsList>

          <TabsContent value="elements" className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                <ElementsList />
              </div>
              <div className="lg:col-span-2">
                <ElementEditor />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="couples" className="p-6">
            <CouplesList />
          </TabsContent>

          <TabsContent value="preview" className="p-6">
            <PreviewSection />
          </TabsContent>
        </Tabs>

        {/* Action Buttons */}
        <div className="p-6 border-t bg-gray-50 flex justify-end space-x-3">
          <Button
            variant="outline"
            onClick={handleClose}
            size={"sm"}
            type="button"
          >
            Close
          </Button>
          <Button
            variant="secondary"
            onClick={handlePreview}
            size="sm"
            type="button"
          >
            Preview
          </Button>
          <Button
            onClick={handleSave}
            type="button"
            size={"sm"}
            disabled={props.formHook.isSubmitting || props.formHook.isLoading}
          >
            Save
          </Button>
        </div>
      </div>
    );
  }
);
