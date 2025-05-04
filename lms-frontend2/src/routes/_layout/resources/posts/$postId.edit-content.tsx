import { simpleRequest } from '@/client/core/simpleRequest'
import { LessonPageDocument, PostDocument } from '@/client/types.gen'
import LessonPageEditor from '@/components/LessonPageEditor/LessonPageEditor'
import { Container } from '@chakra-ui/react'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'


export const Route = createFileRoute(
  '/_layout/resources/posts/$postId/edit-content',
)({
  component: RouteComponent,
  loader: async ({ params }) => {
    const { postId } = params
    if (!postId) {
      throw new Error('postId is required')
    }
    return simpleRequest<PostDocument>({
      url: `/resources/posts/${postId}`,
      method: 'GET',
    })
  },
})

function RouteComponent() {
  const postObj = Route.useLoaderData()
  const { lesson_page_id } = Route.useSearch() as any
  const lessonPageQuery = useQuery<LessonPageDocument>({
    queryKey: ['lessonPage', lesson_page_id],
    queryFn: async () => {
      return simpleRequest({
        url: `/lessons/pages/${lesson_page_id}`,
        method: 'GET',
      });
    },
  });

  return (
    <Container maxW="full" py={12}>
      <LessonPageEditor post={postObj} lessonPage={lessonPageQuery.data!} laoding={lessonPageQuery.isLoading} />
    </Container>
  )
}
