import type { DocumentBase } from "@/client";

interface Author extends DocumentBase {
  username: string;
  email: string;
}
export interface PostDocument extends DocumentBase {
  title: string;
  author: Author;
  publication_status: 1 | 0;
}

export const postsPublicationStatusOptions = [
  { label: "Published", value: "1" },
  { label: "Draft", value: "0" },
];
