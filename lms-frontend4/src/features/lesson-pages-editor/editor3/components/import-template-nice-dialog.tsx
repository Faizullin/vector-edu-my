import { MultiselectLinkInputField } from "@/components/form/MultiselectLinkField";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import NiceModal, {
  NiceModalHocPropsExtended,
} from "@/context/nice-modal-context";
import type { DocumentId, FieldItem, PaginatedData } from "@/types";
import { showToast } from "@/utils/handle-server-error";
import { showComponentNiceDialog } from "@/utils/nice-modal";
import { Eye } from "lucide-react";
import { useCallback, useState } from "react";
import { EditorApiService } from "../EditorApiService";
import TemplateListViewNiceDialog from "./template-list-view-nice-dialog";

const ImportTemplateNiceDialog = NiceModal.create<
  NiceModalHocPropsExtended<{
    title: string;
    type: string;
    parseSearchResponse: (response: PaginatedData<any>) => FieldItem[];
    post_id: DocumentId;
  }>
>((props) => {
  const modal = NiceModal.useModal();
  const [value, setValue] = useState<any | null>(null);

  const handleSave = useCallback(() => {
    if (value) {
      EditorApiService.fetchTemplateDetail(props.post_id, Number(value.value)).then(
        (response) => {
          if (response.success === 0) {
            showToast("error", {
              message: "Error importing template",
              data: {
                description: "Error loading template data",
              },
            });
            return;
          }
          modal.resolve({
            result: {
              record: response.data,
            },
            modal: modal,
          });
          modal.hide();
        }
      );
    }
  }, [modal, value]);

  const handleViewTemplates = useCallback(() => {
    showComponentNiceDialog(TemplateListViewNiceDialog, {
      post_id: props.post_id,
      component_type: props.type,
      onSelectTemplate: (template) => {
        setValue({
          label: `${template.name} [#${template.id}]`,
          value: `${template.id}`,
        });
      },
    });
  }, [props.post_id, props.type]);

  return (
    <Dialog open={modal.visible} onOpenChange={(v) => !v && modal.hide()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Import Template Component</DialogTitle>
        </DialogHeader>

        <div className="flex items-end gap-2">
          <div className="flex-1">
            <MultiselectLinkInputField
              isMulti={false}
              customQueryFn={async (search) => {
                const response = await EditorApiService.fetchTemplateList(props.post_id, {
                  search,
                  component_type: props.type,
                });
                if (!response.success) {
                  throw new Error(
                    typeof response.errors === "string"
                      ? response.errors
                      : JSON.stringify(response.errors) || "Failed to fetch templates"
                  );
                }
                return response.data;
              }}
              parseResponse={(response) => {
                return response.results.map((item) => ({
                  label: `${item.name} [#${item.id}]`,
                  value: `${item.id}`,
                }));
              }}
              value={value}
              onChange={(newValue) => {
                setValue(newValue);
              }}
            />
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleViewTemplates}
            className="shrink-0"
            title="View all templates"
          >
            <Eye className="h-4 w-4" />
          </Button>
        </div>

        <DialogFooter>
          <Button onClick={handleSave} disabled={!value} size={"sm"}>
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
});

export default ImportTemplateNiceDialog;