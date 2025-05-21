import type { DocumentBase } from "@/client";
import { z } from "zod";
import type { ComponentBase } from "../../types";

interface MatchingComponentElementDocument extends DocumentBase {
  uid: string; // Added for internal tracking
  text: string;
  image: {
    url: string;
  } | null;
}

export interface MatchingComponent extends ComponentBase {
  title: string;
  elements: Array<MatchingComponentElementDocument>;
  couples: Array<{
    first_element: string | null;
    second_element: string | null;
  }>;
}

export interface MatchingElement {
  uid: string; // Added for internal tracking
  text: string;
  image: {
    url: string;
  } | null;
}

export interface MatchingCouple {
  trackUid: string; // Added for internal tracking
  first_element: string;
  second_element: string;
}

export interface Matching {
  title: string;
  elements: Array<MatchingElement>;
  couples: Array<MatchingCouple>;
}

export const matchingComponentSchema = z.object({
  title: z.string().min(1, "Title is required"),
  elements: z.array(
    z.object({
      uid: z.string().min(1, "UID is required"),
      text: z.string().min(1, "Text is required"),
      image_file: z.instanceof(File).optional().nullable(),
    })
  ),
  couples: z.array(
    z.object({
      first_element: z.string().or(z.null()),
      second_element: z.string().or(z.null()),
    })
  ),
});
