import { getAuthSession } from "@/actions/auth-actions";
import { LessonPagesEditor } from "@/features/lesson-pages-editor";
import type {
  LessonDocument,
  LessonPageDocument,
} from "@/features/lessons/data/schema";
import { type PostDocument } from "@/features/posts/data/schema";
import { getAuthHeaders, getUrl } from "@/lib/simpleRequest";
import { Log } from "@/utils/log";
import { Metadata, ResolvingMetadata } from "next";
import { notFound } from "next/navigation";

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

async function fetchWithAuth<T>({
  url,
  method = "GET",
}: {
  url: string;
  method: string;
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
    headers: headers,
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch ${url}: ${res.status}`);
  }
  return res.json();
}

async function loadEditorData(
  lesson_id: string,
  page_id: string,
  post_id: string,
  type: string
) {
  try {
    if (type !== "editor2") {
      throw new Error(`Unsupported type: ${type}`);
    }

    if (!post_id) {
      throw new Error("post_id is required");
    }

    // Fetch post data
    const postObj = await fetchWithAuth<PostDocument>({
      url: `/resources/posts/${post_id}`,
      method: "GET",
    });

    if (!postObj) {
      throw new Error(`Post with ID ${post_id} not found`);
    }

    const object_id = postObj.object_id;
    if (!object_id) {
      throw new Error("object_id is not defined for post #" + postObj.id);
    }

    // Fetch lesson page data
    const lessonPageObj = await fetchWithAuth<LessonPageDocument>({
      url: `/lessons/pages/${page_id}`,
      method: "GET",
    });

    if (!lessonPageObj) {
      throw new Error(`Lesson page with ID ${page_id} not found`);
    }

    if (object_id !== lessonPageObj.id) {
      throw new Error(
        `object_id ${object_id} does not match lesson page id ${lessonPageObj.id}`
      );
    }

    // Fetch lesson data
    const lessonObj = await fetchWithAuth<LessonDocument>({
      url: `/lessons/lessons/${lesson_id}`,
      method: "GET",
    });

    if (!lessonObj) {
      throw new Error(`Lesson with ID ${lesson_id} not found`);
    }

    if (lessonObj.id !== (lessonPageObj as any).lesson) {
      throw new Error(
        `lesson_id ${lessonObj.id} does not match lesson page lesson_id ${
          (lessonPageObj as any).lesson
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
    notFound();
  }
}

export default async function Page({ params, searchParams }: EditorPageProps) {
  const { lesson_id, page_id } = await params;
  const { post_id, type } = await searchParams;

  // Check if required search params are present
  if (!post_id || !type) {
    notFound();
  }
  // Load data server-side
  const data = await loadEditorData(lesson_id, page_id, post_id, type);

  if (!data) {
    notFound();
  }

  // Pass the loaded data to the client component
  return (
    <LessonPagesEditor
      type={data.type}
      lessonObj={data.lessonObj}
      postObj={data.postObj}
      lessonPageObj={data.lessonPageObj}
    />
  );
}

// Optional: Generate metadata
export async function generateMetadata(
  { params, searchParams }: EditorPageProps,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { lesson_id, page_id } = await params;
  return {
    title: `Editor - Lesson ${lesson_id} - Page ${page_id}`,
  };
}
