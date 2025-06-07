import {
  LessonDocument,
  LessonPageDocument,
} from "@/features/lessons/data/schema";
import { PostDocument } from "@/features/posts/data/schema";
import React, { createContext, PropsWithChildren, useContext } from "react";

type LoadDataContextType = {
  postObj: PostDocument;
  lessonObj: LessonDocument;
  lessonPageObj: LessonPageDocument;
};

const LoadDataContext = createContext<LoadDataContextType | undefined>(
  undefined
);

export const useLoadDataContext = () => {
  const context = useContext(LoadDataContext);
  if (!context) {
    throw new Error(
      "useLoadDataContext must be used within a LoadDataProvider"
    );
  }
  return context;
};

export interface EditorLoadDataProps {
  postObj: PostDocument;
  lessonObj: LessonDocument;
  lessonPageObj: LessonPageDocument;
  type: string;
}

type LoadDataProviderProps = PropsWithChildren<EditorLoadDataProps>;

export const LoadDataProvider: React.FC<LoadDataProviderProps> = ({
  postObj,
  lessonObj,
  lessonPageObj,
  children,
}) => (
  <LoadDataContext.Provider value={{ postObj, lessonObj, lessonPageObj }}>
    {children}
  </LoadDataContext.Provider>
);
