import NiceModal from "@/components/nice-modal/NiceModal";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCallback } from "react";

export const SyncErroNiceDialog = NiceModal.create(() => {
  const modal = NiceModal.useModal();
  const handleConfirm = useCallback(() => {}, []);
  return (
    <Dialog open={modal.visible} onOpenChange={(v) => !v && modal.hide()}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Sync Error Detected</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Some elements have been created or removed in the database, but are
            not accessible in the current editor state.
            <br />
            <strong className="text-red-600">
              Regenerating will delete all unsaved changes!
            </strong>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="ghost" size={"sm"}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleConfirm} size={"sm"}>
            Regenerate Anyway
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
});
