import NiceModal from "@/components/nice-modal/NiceModal";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { useCallback, useEffect, useMemo } from "react";
import { BlockCardWrapper } from "../../components/BlockCardWrapper";
import { createBlockSpec } from "../../createBlockSpec";
import { useBlockImportDialog } from "../../hooks";
import { MatchingEditNiceDialog } from "./edit-nice-dialog";
import type { MatchingComponent } from "./schema";

// Defaults
const type = "matching";
const defaultValues = {
  title: "Match the pairs",
  element_couples: [
    {
      first_element: { text: "Cat", image: null },
      second_element: { text: "🐱", image: null },
    },
  ],
};

// Block
export const MatchingBlock = createBlockSpec<MatchingComponent>({
  type,
  suggestionMenu: ({ addBlock }) => ({
    title: "Matching",
    subtext: "Add match-the-pair items",
    icon: (props) => <PlusCircle size={18} {...props} />,
    onItemClick: () => addBlock(type),
  }),
  sideMenu: () => ({
    title: "Matching",
    parseSearchResponse: (response) =>
      response.results.map((item) => ({
        label: item.title,
        value: `${item.id}`,
      })),
    parseObjToValues: (obj) => ({
      title: obj.title,
      couples: obj.couples,
      elements: obj.elements,
    }),
  }),
  render: ({ block }) => {
    useEffect(() => {
      NiceModal.show(MatchingEditNiceDialog, {
        block,
      });
    }, []);
    return (
      <BlockCardWrapper block={block}>
        <h4 className="font-semibold">{block.data.values?.title}</h4>
        <ul className="text-sm">
          {block.data.values?.couples?.map((pair, i) => {
            const { firstElement, secondElement } = useMemo(() => {
              if (!block.data.obj) {
                return { firstElement: null, secondElement: null };
              }
              return {
                firstElement: block.data.obj.elements.find(
                  (el) => el.uid === pair.first_element
                ),
                secondElement: block.data.obj.elements.find(
                  (el) => el.uid === pair.second_element
                ),
              };
            }, [block.data.obj, pair.first_element, pair.second_element]);
            return (
              <li key={i}>
                {firstElement?.text || "🖼"} ⇄ {secondElement?.text || "🖼"}
              </li>
            );
          })}
        </ul>
      </BlockCardWrapper>
    );
  },
  initialContent: {
    default: defaultValues,
    empty: { title: "", element_couples: [] },
  },
  sidebar: {
    render: ({ block, updateBlockField }) => {
      const { showDialog } = useBlockImportDialog<MatchingComponent>(block.id);
      const handleImportClick = useCallback(() => {
        showDialog({
          title: "Image",
          parseSearchResponse: (response) =>
            response.results.map((item) => ({
              label: item.title,
              value: `${item.id}`,
            })),
        });
      }, [showDialog]);
      const handleOpenEditDialog = useCallback(() => {
        NiceModal.show(MatchingEditNiceDialog, {
          block,
        }).then((result: any) => {
          if (result?.record) {
            const newValues = result.record as MatchingComponent;
            updateBlockField(block.id, {
              values: newValues,
              obj: result.record,
              static: block.data.static,
            });
          }
        });
      }, [updateBlockField, block]);
      const staticMode = block.data?.static || false;
      return (
        <div className="space-y-4">
          <div className="flex justify-end mt-4">
            <Button
              type="button"
              variant="outline"
              className="cursor-pointer ml-2"
              onClick={handleImportClick}
              size={"sm"}
            >
              Import
            </Button>
            <Button
              type="button"
              className="cursor-pointer ml-2"
              onClick={handleOpenEditDialog}
              size={"sm"}
              disabled={staticMode}
            >
              Edit
            </Button>
          </div>
        </div>
      );
    },
  },
});
