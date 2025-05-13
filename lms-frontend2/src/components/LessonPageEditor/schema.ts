import { BlockNoteEditor, BlockNoteSchema, defaultBlockSpecs } from "@blocknote/core";
import { DefaultReactSuggestionItem, getDefaultReactSlashMenuItems } from "@blocknote/react";
import { BluecardBlock } from "./components/blocks/bluecard/BluecardBlock";
import { ImageBlock } from "./components/blocks/image/ImageBlock";
import { VideoBlock } from "./components/blocks/video/VideoBlock";
import { QuestionBlock } from "./components/blocks/question/QuestionBlock";



const generator = (blocks: Array<any>) => {
  const blockSpecs = blocks.reduce((acc, { spec }) => {
    acc[spec.config.type] = spec;
    return acc;
  }, {} as Record<string, any>);
  const schema = BlockNoteSchema.create({
    blockSpecs: {
      ...defaultBlockSpecs,
      ...blockSpecs,
    },
  });
  const suggestionMenus = blocks.map((block) => block.options.suggestionMenu).filter((i) => !!i);
  const getCustomSlashMenuItems = (
    editor: BlockNoteEditor
  ): DefaultReactSuggestionItem[] => [
      ...getDefaultReactSlashMenuItems(editor),
      ...suggestionMenus.map((item) => item(editor)),
    ];
  return { schema, getCustomSlashMenuItems, blocks };
}

export default generator([
  BluecardBlock,
  VideoBlock,
  ImageBlock,
  QuestionBlock,
]);