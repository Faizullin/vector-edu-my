import { LessonBatches } from "@/features/lesson-batches";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_layout/lessons/batches")({
  component: RouteComponent,
});

function RouteComponent() {
  return <LessonBatches />;
}
