import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import NiceModal, {
  NiceModalHocPropsExtended,
} from "@/context/nice-modal-context";
import { simpleRequest } from "@/lib/simpleRequest";
import type { DocumentId } from "@/types";
import { showToast } from "@/utils/handle-server-error";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useCallback, useMemo, useState } from "react";
import {
  reportsOptions,
  type ReportDocument,
  type ReportJSONContent,
} from "../data/schema";
import { lessonPageElementComponentUse } from "./reports/lesson_page_element_component_use";
import { StorageFilesUse } from "./reports/storage_files_use";

export const RequestReportNiceDialog = NiceModal.create(() => {
  const modal = NiceModal.useModal();
  const [selectedReportName, setSelectedReportName] = useState<string | null>(
    null
  );
  const requestReportMutation = useMutation({
    mutationFn: (selectedName: string) =>
      simpleRequest({
        url: `/reports/record_start`,
        method: "POST",
        body: {
          name: selectedName,
        },
      }),
    onSuccess: () => {
      showToast("success", {
        message: "Report requested successfully",
      });
      modal.resolve({
        result: true,
      });
      modal.hide();
    },
    onError: (error) => {
      showToast("error", {
        message: error.message || "Failed to request report",
      });
    },
  });
  const handleConfirm = useCallback(() => {
    if (!selectedReportName) {
      showToast("error", {
        message: "Please select a report name",
      });
      return;
    }
    requestReportMutation.mutate(selectedReportName);
  }, [requestReportMutation, selectedReportName]);
  return (
    <Dialog
      open={modal.visible}
      onOpenChange={(v) => {
        if (!v) {
          modal.hide();
        }
      }}
    >
      <DialogContent className="!max-w-[1000px]">
        <DialogHeader className="text-left">
          <DialogTitle>Request Report Confirmation</DialogTitle>
          <DialogDescription>
            {"Click save when you are done."}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 p-0.5 mb-6">
          <select
            className="w-full"
            onChange={(e) => setSelectedReportName(e.target.value)}
          >
            <option value="">Select Report Name</option>
            {reportsOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <DialogFooter>
          <Button
            size="sm"
            onClick={handleConfirm}
            disabled={requestReportMutation.isPending}
          >
            Request
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
});

const CompMap = {
  lesson_page_element_component_use: lessonPageElementComponentUse,
  storage_files_use: StorageFilesUse,
};
export const ReportViewContentNiceDialog = NiceModal.create<
  NiceModalHocPropsExtended<{
    recordId: DocumentId;
  }>
>((props) => {
  const modal = NiceModal.useModal();
  const detailQuery = useQuery({
    queryKey: ["reports", props.recordId],
    queryFn: () =>
      simpleRequest<ReportDocument>({
        url: `/reports/${props.recordId}`,
        method: "GET",
      }),
  });
  const loadedData = useMemo(() => {
    if (!detailQuery.data) return null;
    const parsedData = JSON.parse(detailQuery.data.content);
    return parsedData as ReportJSONContent;
  }, [detailQuery.data]);
  const RenderComp = useMemo(() => {
    if (!loadedData) return null;
    const Comp = CompMap[loadedData.name as keyof typeof CompMap];
    if (!Comp) return null;
    return <Comp recordObj={detailQuery.data!} loadedData={loadedData} />;
  }, [loadedData, detailQuery.data]);
  return (
    <Dialog
      open={modal.visible}
      onOpenChange={(v) => {
        if (!v) {
          modal.hide();
        }
      }}
    >
      <DialogContent className="max-w-[600px] max-h-[70vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Post Content</DialogTitle>
        </DialogHeader>
        <ScrollArea className="mb-4 h-[50vh] w-full overflow-auto p-2">
          {detailQuery.isPending ? (
            <div className="flex items-center justify-center h-full">
              Loading...
            </div>
          ) : detailQuery.isError ? (
            <div className="text-red-500">{detailQuery.error.message}</div>
          ) : (
            RenderComp
          )}
        </ScrollArea>
        <DialogFooter>
          <Button onClick={() => modal.hide()}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
});
