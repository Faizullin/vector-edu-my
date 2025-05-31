import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import NiceModal, {
  NiceModalHocPropsExtended,
} from "@/context/nice-modal-context";
import type { LessonPageDocument } from "@/features/lessons/data/schema";

export default NiceModal.create<
  NiceModalHocPropsExtended<{
    lesson_page_data: LessonPageDocument;
  }>
>((props) => {
  const modal = NiceModal.useModal();

  return (
    <Dialog open={modal.visible} onOpenChange={(v) => !v && modal.hide()}>
      <DialogTrigger asChild>
        <Button variant="outline">Edit Profile</Button>
      </DialogTrigger>

      <DialogContent className="max-w-[98vw] max-h-[90vh] overflow-hidden px-0">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle>Demo Data</DialogTitle>
        </DialogHeader>

        <ScrollArea className="h-[80vh] w-full overflow-auto">
          <div className="px-6 py-4 overflow-auto">
            <pre className="text-sm bg-gray-100 text-gray-800 p-4 rounded overflow-auto whitespace-pre-wrap">
              {JSON.stringify(props.lesson_page_data || null, null, 2)}
            </pre>
          </div>
        </ScrollArea>

        <DialogFooter className="px-6 pb-6" />
      </DialogContent>
    </Dialog>
  );
});
