import type { DocumentId } from "@/client";
import type { Block, BlockIdentifier, SaveDataJsonType } from "./types";

export const createSaveData = (blocks: Block[]): SaveDataJsonType => {
  const now = new Date();
  return {
    blocks,
    date: now,
  };
};

export const generateBlockId = (): BlockIdentifier => {
  return `block-${Math.random().toString(36)}`;
};

export const focusWithCursorToEnd = (el: HTMLElement | null) => {
  if (!el) return;
  el.focus();
  const range = document.createRange();
  const selection = window.getSelection();
  range.selectNodeContents(el);
  range.collapse(false);
  selection?.removeAllRanges();
  selection?.addRange(range);
};

export const focusFirstInputFn = (block: Block, fieldname: string) => {
  setTimeout(() => {
    const el = document.querySelector(
      `[data-editable-field="${block.id}.${fieldname}"]`
    ) as HTMLElement;
    if (el) {
      focusWithCursorToEnd(el);
    }
  }, 50);
};

export function getProtectedUrl(url: string) {
  const prefix = "/protected";
  const prefix_url = "/api/v1/lms/resources/protected-media";
  if (url.startsWith(prefix)) {
    return `${prefix_url}${url.slice(prefix.length)}`;
  }
  throw new Error(`Invalid URL: ${url}`);
}

export const getTruncatedText = (text: string, maxLength: number) => {
  if (text.length <= maxLength) {
    return text;
  }
  return text.slice(0, maxLength) + "...";
};

export const getEditorLink = (
  lesson_id: DocumentId,
  page_id: DocumentId,
  post_id: DocumentId
) => {
  const url = `/lms/lessons/${lesson_id}/pages/${page_id}/editor?type=editor2&post_id=${post_id}`;
  return url;
};
