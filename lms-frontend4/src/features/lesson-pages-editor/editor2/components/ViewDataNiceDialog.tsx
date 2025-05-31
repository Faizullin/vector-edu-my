import { Alert, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Log } from "@/utils/log";
import { AlertCircle } from "lucide-react";
import { useEffect } from "react";
import type { Block } from "../types";
import NiceModal, {
  NiceModalHocPropsExtended,
} from "@/context/nice-modal-context";

const ViewDataNiceDialog = NiceModal.create<
  NiceModalHocPropsExtended<{
    content: Block[];
  }>
>((props) => {
  const modal = NiceModal.useModal();

  useEffect(() => {
    Log.info("ViewDataNiceDialog: content => ", props.content);
  }, [props.content]);

  const blocks = props.content ?? [];

  return (
    <Dialog open={modal.visible} onOpenChange={(v) => !v && modal.hide()}>
      <DialogContent className="max-w-[98vw] max-h-[90vh] overflow-hidden px-0">
        <DialogTitle className="px-6 pt-6">Block Data</DialogTitle>

        <ScrollArea className="h-[80vh] w-full overflow-auto">
          <div className="min-w-[1400px] px-6 py-4 space-y-4">
            {blocks.map((block) => {
              const dataField = block.data;
              const obj = dataField.obj;
              const values = dataField.values;

              const renderDataContent = () => {
                if (obj && values) {
                  return (
                    <>
                      <div className="bg-blue-50 p-3 rounded-md mb-3">
                        <p className="text-sm font-bold mb-1">Object Data:</p>
                        <pre className="text-blue-700 bg-blue-100 p-2 rounded text-xs overflow-auto whitespace-pre">
                          {JSON.stringify(obj, null, 2)}
                        </pre>
                        {dataField.static && (
                          <Badge
                            variant="outline"
                            className="bg-blue-100 text-blue-700 mt-2"
                          >
                            static and not editable
                          </Badge>
                        )}
                      </div>
                      <div className="bg-green-50 p-3 rounded-md">
                        <p className="text-sm font-bold mb-1">Values:</p>
                        <pre className="text-green-700 bg-green-100 p-2 rounded text-xs w-full overflow-auto whitespace-pre">
                          {JSON.stringify(values, null, 2)}
                        </pre>
                      </div>
                    </>
                  );
                } else if (obj) {
                  return (
                    <div className="bg-blue-50 p-3 rounded-md">
                      <p className="text-sm font-bold mb-1">Object Data:</p>
                      <pre className="text-blue-700 bg-blue-100 p-2 rounded text-xs overflow-auto whitespace-pre">
                        {JSON.stringify(obj, null, 2)}
                      </pre>
                      {dataField.static && (
                        <Badge
                          variant="outline"
                          className="bg-blue-100 text-blue-700 mt-2"
                        >
                          static and not editable
                        </Badge>
                      )}
                    </div>
                  );
                } else if (values) {
                  return (
                    <div className="bg-green-50 p-3 rounded-md">
                      <p className="text-sm font-bold mb-1">Values:</p>
                      <pre className="text-green-700 bg-green-100 p-2 rounded text-xs w-full overflow-auto whitespace-pre">
                        {JSON.stringify(values, null, 2)}
                      </pre>
                    </div>
                  );
                }

                return (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>
                      No valid `obj` or `values` in data field.
                    </AlertTitle>
                  </Alert>
                );
              };

              return (
                <div
                  key={block.id}
                  className={`p-4 border border-gray-200 ${
                    block.data ? "bg-gray-100" : "bg-gray-50"
                  } rounded-md`}
                >
                  <p className="text-sm mb-2 text-gray-700">
                    Block Type: {block.type} | ID: {block.id}
                  </p>
                  {block.data && (
                    <>
                      {dataField.element_id && (
                        <p className="text-sm font-bold mb-1 text-gray-700">
                          Element ID: {dataField.element_id}
                        </p>
                      )}
                      {renderDataContent()}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
});

export default ViewDataNiceDialog;
