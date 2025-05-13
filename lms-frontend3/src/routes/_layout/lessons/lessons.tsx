import Lessons from "@/features/lessons";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_layout/lessons/lessons")({
  component: Lessons,
});
