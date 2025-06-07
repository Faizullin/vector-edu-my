// import type { CommentDocument } from "@/client";
// import { useMutation, useQueryClient } from "@tanstack/react-query";
// import { useLoaderData } from "@tanstack/react-router";
// import type { PropsWithChildren } from "react";
// import { createContext, useContext } from "react";
// import { EditorApiService } from "../EditorApiService";

// interface CommentsContextType {
//   comments: CommentDocument[];
//   sendComment: (
//     comment: Omit<CommentDocument, "id" | "created_at" | "updated_at">
//   ) => void;
//   isLoading: boolean;
// }

// const CommentsContext = createContext<CommentsContextType | null>(null);

// export function useComments() {
//   const context = useContext(CommentsContext);
//   if (!context)
//     throw new Error("useComments must be used inside CommentsProvider");
//   return context;
// }

// export const CommentsProvider = ({ children }: PropsWithChildren) => {
//   const queryClient = useQueryClient();
//   const { postObj } = useLoaderData({
//     from: "/_layout/lessons/$lesson_id/pages/$page_id/editor",
//   });

//   const loadCommentsMutation = useMutation({
//     mutationFn: async (
//       newComment: Omit<CommentDocument, "id" | "created_at" | "updated_at">
//     ) => EditorApiService.fetchLoadComments(postObj.id),
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["comments"] });
//     },
//   });

//   const saveCommentMutation = useMutation({
//     mutationFn: async (
//       comment: Omit<CommentDocument, "id" | "created_at" | "updated_at">
//     ) => {
//       return EditorApiService.saveComment(postObj.id, comment);
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["comments"] });
//     },
//   });
//   return (
//     <CommentsContext.Provider value={{ comments, saveCommentMutation, loadCommentsMutation }}>
//       {children}
//     </CommentsContext.Provider>
//   );
// };

// export const useBlockComments = (blockId: string) => {
//   const { comments, sendComment, isLoading } = useComments();
//   const blockComments = comments.filter((c) => c.blockId === blockId);
//   const rootComments = blockComments.filter((c) => !c.parentId);

//   const getReplies = (parentId: string) =>
//     blockComments.filter((c) => c.parentId === parentId);

//   return {
//     comments: rootComments,
//     getReplies,
//     sendComment,
//     isLoading,
//   };
// };
