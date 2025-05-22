import Reports from '@/features/reports'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_layout/reports/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <Reports />;
}
