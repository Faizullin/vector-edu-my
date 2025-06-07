import { z } from "zod";

export const editors = ["editor2", "editor3"] as const;

export const lessonsPageEditorSearchSchema = z.object({
  post_id: z.string(),
  type: z.enum(editors),
});
