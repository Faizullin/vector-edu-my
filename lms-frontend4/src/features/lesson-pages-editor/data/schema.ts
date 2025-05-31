import { z } from "zod";

export const lessonsPageEditorSearchSchema = z.object({
  post_id: z.number(),
  type: z.enum(["editor2"]),
});
