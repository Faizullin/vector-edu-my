"use client";

import { memo } from "react";
import { EditorLoadDataProps } from "./editor2/context/load-data-context";
import { Editor as Editor2 } from "./editor2/editor";
import { Editor as Editor3 } from "./editor3/editor";


const RenderEditor2 = memo(Editor2);
const RenderEditor3 = memo(Editor3);

export function LessonPagesEditor(props: EditorLoadDataProps) {
  if (props.type === "editor2") {
    return (
      <RenderEditor2 {...props} />
    );
  } else if (props.type === "editor3") {
    return (
      <RenderEditor3 {...props} />
    );
  }
  throw new Error("Unknown editor type: " + props.type);
}