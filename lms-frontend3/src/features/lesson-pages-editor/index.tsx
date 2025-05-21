import { useLoaderData } from "@tanstack/react-router";
import { memo } from "react";
import { Editor } from "./editor2/editor";

export function LessonPagesEditor() {
  const { type } = useLoaderData({
    from: "/_layout/lessons/$lesson_id/pages/$page_id/editor",
  });
  if (type === "editor2") {
    return (
      <>
        {/* <Header fixed>
          <Search />
          <div className="ml-auto flex items-center space-x-4">
            <ThemeSwitch />
            <ProfileDropdown />
          </div>
        </Header> */}
        <RenderEditor />
      </>
    );
  }
  throw new Error("Unknown editor type: " + type);
}
const RenderEditor = memo(Editor);
