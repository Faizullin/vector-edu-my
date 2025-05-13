import { simpleRequest } from "@/client/core/simpleRequest";
import { Header } from "@/components/layout/header";
import { Main } from "@/components/layout/main";
import { ProfileDropdown } from "@/components/profile-dropdown";
import { ThemeSwitch } from "@/components/theme-switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import {
  BookOpen,
  Headphones,
  MessageSquare,
  Pencil,
  Search,
} from "lucide-react";
import { useMemo } from "react";
import type { LessonBatchDocument } from "../lessons/data/schema";

interface LessonBatchExtendedDocument extends LessonBatchDocument {
  lesson_count: number;
}
interface BatchConfig {
  slug: string;
  icon: React.ReactNode;
}
const batchConfigs: BatchConfig[] = [
  {
    slug: "writing",
    icon: <Pencil className="text-muted-foreground h-4 w-4" />,
  },
  {
    slug: "listening",
    icon: <Headphones className="text-muted-foreground h-4 w-4" />,
  },
  {
    slug: "reading",
    icon: <BookOpen className="text-muted-foreground h-4 w-4" />,
  },
  {
    slug: "speaking",
    icon: <MessageSquare className="text-muted-foreground h-4 w-4" />,
  },
];
export function LessonBatches() {
  const { data, isLoading } = useQuery<LessonBatchExtendedDocument[]>({
    queryKey: ["lesson-batches"],
    queryFn: () =>
      simpleRequest({
        url: "/lessons/batches/",
        method: "GET",
        query: {
          disablePagination: true,
        },
      }),
  });

  const batches = useMemo(() => {
    if (!data) return [];

    return data.map((batch) => {
      const config = batchConfigs.find((cfg) => cfg.slug === batch.title);
      return {
        ...batch,
        icon: config?.icon ?? null,
      };
    });
  }, [data]);

  return (
    <>
      <Header fixed>
        <Search />
        <div className="ml-auto flex items-center space-x-4">
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>
      <Main>
        <div className="container py-10">
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight">
              Lesson Batches
            </h1>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {isLoading ? (
              <div className="flex items-center justify-center">
                <p>Loading...</p>
              </div>
            ) : (
              batches.map((batch) => (
                <Link
                  key={batch.id}
                  to={"/lessons/lessons/?batch_id=" + batch.id}
                >
                  <Card className="hover:bg-accent/5 transition-colors">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        {batch.title}
                      </CardTitle>
                      {batch.icon}
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {batch.lesson_count} Lessons
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))
            )}
          </div>
        </div>
      </Main>
    </>
  );
}
