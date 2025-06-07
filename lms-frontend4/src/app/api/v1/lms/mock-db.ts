import { AttachmentDocument, TemplateDocument } from "@/features/lesson-pages-editor/editor3/types";
import { LessonDocument, LessonPageDocument } from "@/features/lessons/data/schema";
import { PostDocument } from "@/features/posts/data/schema";
import { DocumentBase, DocumentId } from "@/types";

const mockPagesData: LessonPageDocument[] = [
    {
        id: 1,
        title: "Introduction to JavaScript",
        order: 1,
        lesson: 789,
    },
    {
        id: 2,
        title: "Advanced JavaScript",
        order: 2,
        lesson: 789,
    },
    {
        id: 456,
        order: 1,
        lesson: 789,
    },
]
type ExtendedPostDocument = PostDocument & { content: string };
const mockPostsData: ExtendedPostDocument[] = [
    {
        id: 123,
        object_id: 456,
        title: 'Introduction to Advanced Concepts',
        publication_status: 0,
        author: {
            id: 1,
            username: 'John Doe',
            email: 'john.doe@example.com'
        },
        post_type: "",
        content: ""
    },
]
const mockTemplatesData: TemplateDocument[] = [
    {
        id: 1,
        name: "JavaScript Basics Template",
        content: JSON.stringify({
            type: "lesson",
            title: "JavaScript Basics",
            content: "This is a template for JavaScript basics lesson.",
        }),
        block_id: "block-123",
        component_type: "",
        created_at: "",
        updated_at: ""
    },
]
interface PostTemplateRelation extends DocumentBase {
    post_id: DocumentId;
    template_id: DocumentId;
}
const mockPostTemplateRelations: PostTemplateRelation[] = []
const mockLessonsData: LessonDocument[] = [
    {
        id: 789,
        title: 'Advanced Programming Fundamentals',
        description: 'Master advanced programming concepts with hands-on examples',
        is_available_on_free: false,
        order: 0
    }
];
const mockAttachmentsData: AttachmentDocument[] = []
const mockDb = {
    pages: mockPagesData,
    posts: mockPostsData,
    templates: mockTemplatesData,
    postTemplateRelations: mockPostTemplateRelations,
    lessons: mockLessonsData,
    attachments: mockAttachmentsData,
}
export default mockDb;