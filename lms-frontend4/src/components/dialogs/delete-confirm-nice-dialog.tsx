import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import NiceModal, {
  type NiceModalHocPropsExtended,
} from "@/context/nice-modal-context";
import { cn } from "@/lib/utils";
import { showComponentNiceDialog } from "@/utils/nice-modal";
import { Button } from "../ui/button";

interface ConfirmDialogProps {
  title: React.ReactNode;
  disabled?: boolean;
  desc: React.JSX.Element | string;
  cancelBtnText?: string;
  confirmText?: React.ReactNode;
  destructive?: boolean;
  isLoading?: boolean;
  className?: string;
  render: () => React.ReactNode;
}

export const DeleteConfirmNiceDialog = NiceModal.create<
  NiceModalHocPropsExtended<{
    args?: ConfirmDialogProps;
  }>
>((props) => {
  const modal = NiceModal.useModal();
  const {
    title,
    desc,
    render,
    className,
    confirmText,
    cancelBtnText,
    destructive,
    isLoading,
    disabled = false,
    ...actions
  } = props.args || {};

  const descriptionText = desc ? desc : "Are you sure you want to proceed?";
  const titleText = title ? title : "Are you sure?";
  return (
    <AlertDialog
      {...actions}
      open={modal.visible}
      onOpenChange={(state) => {
        if (!state) {
          modal.resolve({
            result: false,
          });
          modal.hide().then(() => {
            modal.remove();
          });
        }
      }}
    >
      <AlertDialogContent className={cn(className && className)}>
        <AlertDialogHeader className="text-left">
          <AlertDialogTitle>{titleText}</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div>{descriptionText}</div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        {render && render()}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>
            {cancelBtnText ?? "Cancel"}
          </AlertDialogCancel>
          <Button
            variant={destructive ? "destructive" : "default"}
            onClick={() => {
              modal.resolve({
                result: true,
              });
              modal.hide().then(() => {
                modal.remove();
              });
            }}
            disabled={disabled || isLoading}
            size={"sm"}
          >
            {confirmText ?? "Continue"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
});

export const showDeleteConfirmNiceDialog = (args?: ConfirmDialogProps) => {
  return showComponentNiceDialog(DeleteConfirmNiceDialog, {
    args,
  }) as Promise<{
    result: boolean;
  }>;
};
