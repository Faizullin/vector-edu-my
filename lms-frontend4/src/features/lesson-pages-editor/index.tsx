"use client";

import { memo } from "react";
import { EditorLoadDataProps } from "./editor2/context/load-data-context";
import { Editor } from "./editor2/editor";

export function LessonPagesEditor(props: EditorLoadDataProps) {
  if (props.type === "editor2") {
    return (
      <>
        {/* <Header fixed>
          <Search />
          <div className="ml-auto flex items-center space-x-4">
            <ThemeSwitch />
            <ProfileDropdown />
          </div>
        </Header> */}
        <RenderEditor {...props} />
      </>
    );
  }
  throw new Error("Unknown editor type: " + props.type);
}
const RenderEditor = memo(Editor);
