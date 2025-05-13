import LessonPages from "@/features/lesson-pages";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_layout/lessons/$lesson_id/pages")({
  component: RouteComponent,
});

function RouteComponent() {
  return <LessonPages />;
}
