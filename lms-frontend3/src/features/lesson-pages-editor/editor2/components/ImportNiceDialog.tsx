import type { FieldItem, PaginatedData } from "@/client";
import { MultiselectLinkInputField } from "@/components/form/MultiselectLinkField";
import NiceModal, {
  type NiceModalHocPropsExtended,
} from "@/components/nice-modal/NiceModal";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCallback, useState } from "react";
import { EditorApiService } from "../EditorApiService";

export default NiceModal.create<
  NiceModalHocPropsExtended<{
    title: string;
    type: string;
    parseSearchResponse: (response: PaginatedData<any>) => FieldItem[];
  }>
>((props) => {
  const modal = NiceModal.useModal();
  const [value, setValue] = useState<any | null>(null);
  const handleSave = useCallback(() => {
    if (value) {
      EditorApiService.fetchComponentDetail<any>(props.type, value.value).then(
        (response) => {
          modal.resolve({
            record: response,
            modal: modal,
          });
        }
      );
    }
  }, [modal, value]);
  return (
    <Dialog open={modal.visible} onOpenChange={(v) => !v && modal.hide()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Import Component</DialogTitle>
        </DialogHeader>
        <MultiselectLinkInputField
          // ref={ref}
          isMulti={false}
          url={`/resources/component/${props.type}`}
          parseResponse={props.parseSearchResponse}
          value={value}
          onChange={(newValue) => {
            setValue(newValue);
          }}
        />
        <DialogFooter>
          <Button onClick={handleSave} disabled={!value}>
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
});
