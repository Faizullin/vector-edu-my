import { AudioBlock } from "./blocks/audio";
import { BluecardBlock } from "./blocks/bluecard";
import { FillTextBlock } from "./blocks/fill-in";
import { ImageBlock } from "./blocks/image";
import { MatchingBlock } from "./blocks/matching";
import { OrderBlock } from "./blocks/order";
import { QuestionBlock } from "./blocks/question";
import { RecordAudioBlock } from "./blocks/record-audio";
import { TextProBlock } from "./blocks/text-pro";
import { VideoBlock } from "./blocks/video";
import type { BlockSpecCreated } from "./types";

const generateSpec = (array: BlockSpecCreated<any>[]) => {
  const specs: Record<string, BlockSpecCreated<any>> = {};
  array.forEach((item) => {
    const { type } = item;
    if (specs[type]) {
      throw new Error(`Duplicate block type: ${type}`);
    }
    specs[type] = item;
  });
  return specs;
};

export const schema = generateSpec([
  TextProBlock,
  BluecardBlock,
  ImageBlock,
  VideoBlock,
  QuestionBlock,
  AudioBlock,
  FillTextBlock,
  OrderBlock,
  RecordAudioBlock,
  MatchingBlock,
]);
