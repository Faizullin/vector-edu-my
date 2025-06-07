import { getAuthSession } from "@/actions/auth-actions";
import { LessonPagesEditor } from "@/features/lesson-pages-editor";
import { lessonsPageEditorSearchSchema } from "@/features/lesson-pages-editor/data/schema";
import type {
  LessonDocument,
  LessonPageDocument,
} from "@/features/lessons/data/schema";
import { type PostDocument } from "@/features/posts/data/schema";
import { getAuthHeaders, getUrl } from "@/lib/simpleRequest";
import { Log } from "@/utils/log";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { z } from "zod";

interface EditorPageProps {
  params: Promise<{
    lesson_id: string;
    page_id: string;
  }>;
  searchParams: Promise<{
    post_id?: string;
    type?: string;
  }>;
}

// Type for validated search params
type ValidatedSearchParams = z.infer<typeof lessonsPageEditorSearchSchema>;

async function fetchWithAuth<T>({
  url,
  method = "GET",
}: {
  url: string;
  method?: string;
}): Promise<T> {
  const sessionData = await getAuthSession();
  if (!sessionData || !sessionData.token) {
    throw new Error("User is not authenticated");
  }
  const headers = await getAuthHeaders({
    auth: { token: sessionData.token },
  });
  const fullUrl = getUrl({
    url: url,
  });
  const res = await fetch(fullUrl, {
    method,
    headers: headers,
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch ${url}: ${res.status}`);
  }
  return res.json();
}

// Validate search parameters using Zod
function validateSearchParams(searchParams: {
  post_id?: string;
  type?: string;
}): ValidatedSearchParams {
  try {
    const validated = lessonsPageEditorSearchSchema.parse({
      post_id: searchParams.post_id,
      type: searchParams.type,
    });
    return validated;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.errors
        .map((err) => `${err.path.join(".")}: ${err.message}`)
        .join(", ");

      throw new Error(`Invalid search parameters: ${errorMessages}`);
    }
    throw error;
  }
}

async function loadEditorData(
  lesson_id: string,
  page_id: string,
  validatedParams: ValidatedSearchParams
) {
  try {
    const { post_id, type } = validatedParams;

    // Fetch all data concurrently for better performance
    const [postObj, lessonPageObj, lessonObj] = await Promise.all([
      fetchWithAuth<PostDocument>({
        url: `/resources/posts/${post_id}`,
      }),
      fetchWithAuth<LessonPageDocument>({
        url: `/lessons/pages/${page_id}`,
      }),
      fetchWithAuth<LessonDocument>({
        url: `/lessons/lessons/${lesson_id}`,
      }),
    ]);

    // Validate fetched data
    if (!postObj) {
      throw new Error(`Post with ID ${post_id} not found`);
    }

    const object_id = postObj.object_id;
    if (!object_id) {
      throw new Error("object_id is not defined for post #" + postObj.id);
    }

    if (!lessonPageObj) {
      throw new Error(`Lesson page with ID ${page_id} not found`);
    }

    if (object_id !== lessonPageObj.id) {
      throw new Error(
        `object_id ${object_id} does not match lesson page id ${lessonPageObj.id}`
      );
    }

    if (!lessonObj) {
      throw new Error(`Lesson with ID ${lesson_id} not found`);
    }

    if (lessonObj.id !== (lessonPageObj as any).lesson) {
      throw new Error(
        `lesson_id ${lessonObj.id} does not match lesson page lesson_id ${(lessonPageObj as any).lesson
        }`
      );
    }

    return {
      postObj,
      lessonObj,
      lessonPageObj,
      type,
    };
  } catch (error) {
    Log.error("Error loading editor data:", error);
    notFound(); // Use notFound to handle errors gracefully
  }
}

export default async function Page({ params, searchParams }: EditorPageProps) {
  const { lesson_id, page_id } = await params;
  const rawSearchParams = await searchParams;

  // Validate search parameters using Zod schema
  const validatedSearchParams = validateSearchParams(rawSearchParams);

  // Load data server-side with validated parameters
  const data = await loadEditorData(lesson_id, page_id, validatedSearchParams);

  // Pass the loaded data to the client component
  return (
    <div className="min-h-screen bg-gray-50">
      <LessonPagesEditor
        type={data.type}
        lessonObj={data.lessonObj}
        postObj={data.postObj}
        lessonPageObj={data.lessonPageObj}
      />
    </div>
  );
}

// Enhanced metadata generation with validation
export async function generateMetadata({
  params,
  searchParams,
}: EditorPageProps): Promise<Metadata> {
  try {
    const { lesson_id, page_id } = await params;
    const rawSearchParams = await searchParams;

    // Validate search params for metadata generation
    const validatedParams = validateSearchParams(rawSearchParams);

    const editorType =
      validatedParams.type === "editor2" ? "Advanced" : "Basic";

    return {
      title: `${editorType} Editor - Lesson ${lesson_id} - Page ${page_id}`,
      description: `Edit lesson content for lesson ${lesson_id}, page ${page_id}`,
      robots: "noindex, nofollow",
    };
  } catch (error) {
    return {
      title: "Lesson Editor",
      description: "Edit lesson content",
    };
  }
}
