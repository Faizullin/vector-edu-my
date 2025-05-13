import Posts from "@/features/posts";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_layout/posts/")({
  component: Posts,
});
