import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useMemo } from "react";
import { useEditor } from "../context/editor-context";
import { useBlockSchema } from "../hooks";
import type { Block } from "../types";

const RenderBlockMainForm = () => {
  const { selectedBlockIdControl, updateBlockField } = useEditor();
  if (!selectedBlockIdControl.state) {
    return null;
  }
  const { block, schema } = useBlockSchema(selectedBlockIdControl.state);
  if (!schema) {
    return (
      <div className="flex items-center justify-center">
        <Skeleton className="h-4 w-1/2" />
      </div>
    );
  }
  if (!schema.sidebar) {
    return null;
  }
  const BlockComponent = schema.sidebar.render;
  return <BlockComponent block={block} updateBlockField={updateBlockField} />;
};

export function BlockSidebar(props: { block: Block }) {
  const { schema, block } = useBlockSchema(props.block.id);
  const obj = useMemo(() => {
    return block.data.obj;
  }, [block.data.obj]);
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>
          {schema ? (
            <>
              Component
              <span className="text-sm font-semibold">{schema.type}</span>
              {obj ? <span className="ml-6">#{obj?.id}</span> : null}
            </>
          ) : (
            <Skeleton className="h-4 w-1/2" />
          )}
        </Label>
      </div>
      <RenderBlockMainForm />
    </div>
  );
}
