/* eslint-disable */

// @ts-nocheck

// noinspection JSUnusedGlobalSymbols

// This file was automatically generated by TanStack Router.
// You should NOT make any changes in this file as it will be overwritten.
// Additionally, you should also exclude this file from your linter and/or formatter to prevent it from being checked or modified.

// Import Routes

import { Route as rootRoute } from './routes/__root'
import { Route as LoginImport } from './routes/login'
import { Route as LayoutImport } from './routes/_layout'
import { Route as LayoutIndexImport } from './routes/_layout/index'
import { Route as LayoutUsersIndexImport } from './routes/_layout/users/index'
import { Route as LayoutLessonsIndexImport } from './routes/_layout/lessons/index'
import { Route as LayoutResourcesPostsIndexImport } from './routes/_layout/resources/posts/index'
import { Route as LayoutLessonsLessonIdPagesImport } from './routes/_layout/lessons/$lessonId.pages'
import { Route as LayoutResourcesPostsPostIdEditContentImport } from './routes/_layout/resources/posts/$postId.edit-content'

// Create/Update Routes

const LoginRoute = LoginImport.update({
  id: '/login',
  path: '/login',
  getParentRoute: () => rootRoute,
} as any)

const LayoutRoute = LayoutImport.update({
  id: '/_layout',
  getParentRoute: () => rootRoute,
} as any)

const LayoutIndexRoute = LayoutIndexImport.update({
  id: '/',
  path: '/',
  getParentRoute: () => LayoutRoute,
} as any)

const LayoutUsersIndexRoute = LayoutUsersIndexImport.update({
  id: '/users/',
  path: '/users/',
  getParentRoute: () => LayoutRoute,
} as any)

const LayoutLessonsIndexRoute = LayoutLessonsIndexImport.update({
  id: '/lessons/',
  path: '/lessons/',
  getParentRoute: () => LayoutRoute,
} as any)

const LayoutResourcesPostsIndexRoute = LayoutResourcesPostsIndexImport.update({
  id: '/resources/posts/',
  path: '/resources/posts/',
  getParentRoute: () => LayoutRoute,
} as any)

const LayoutLessonsLessonIdPagesRoute = LayoutLessonsLessonIdPagesImport.update(
  {
    id: '/lessons/$lessonId/pages',
    path: '/lessons/$lessonId/pages',
    getParentRoute: () => LayoutRoute,
  } as any,
)

const LayoutResourcesPostsPostIdEditContentRoute =
  LayoutResourcesPostsPostIdEditContentImport.update({
    id: '/resources/posts/$postId/edit-content',
    path: '/resources/posts/$postId/edit-content',
    getParentRoute: () => LayoutRoute,
  } as any)

// Populate the FileRoutesByPath interface

declare module '@tanstack/react-router' {
  interface FileRoutesByPath {
    '/_layout': {
      id: '/_layout'
      path: ''
      fullPath: ''
      preLoaderRoute: typeof LayoutImport
      parentRoute: typeof rootRoute
    }
    '/login': {
      id: '/login'
      path: '/login'
      fullPath: '/login'
      preLoaderRoute: typeof LoginImport
      parentRoute: typeof rootRoute
    }
    '/_layout/': {
      id: '/_layout/'
      path: '/'
      fullPath: '/'
      preLoaderRoute: typeof LayoutIndexImport
      parentRoute: typeof LayoutImport
    }
    '/_layout/lessons/': {
      id: '/_layout/lessons/'
      path: '/lessons'
      fullPath: '/lessons'
      preLoaderRoute: typeof LayoutLessonsIndexImport
      parentRoute: typeof LayoutImport
    }
    '/_layout/users/': {
      id: '/_layout/users/'
      path: '/users'
      fullPath: '/users'
      preLoaderRoute: typeof LayoutUsersIndexImport
      parentRoute: typeof LayoutImport
    }
    '/_layout/lessons/$lessonId/pages': {
      id: '/_layout/lessons/$lessonId/pages'
      path: '/lessons/$lessonId/pages'
      fullPath: '/lessons/$lessonId/pages'
      preLoaderRoute: typeof LayoutLessonsLessonIdPagesImport
      parentRoute: typeof LayoutImport
    }
    '/_layout/resources/posts/': {
      id: '/_layout/resources/posts/'
      path: '/resources/posts'
      fullPath: '/resources/posts'
      preLoaderRoute: typeof LayoutResourcesPostsIndexImport
      parentRoute: typeof LayoutImport
    }
    '/_layout/resources/posts/$postId/edit-content': {
      id: '/_layout/resources/posts/$postId/edit-content'
      path: '/resources/posts/$postId/edit-content'
      fullPath: '/resources/posts/$postId/edit-content'
      preLoaderRoute: typeof LayoutResourcesPostsPostIdEditContentImport
      parentRoute: typeof LayoutImport
    }
  }
}

// Create and export the route tree

interface LayoutRouteChildren {
  LayoutIndexRoute: typeof LayoutIndexRoute
  LayoutLessonsIndexRoute: typeof LayoutLessonsIndexRoute
  LayoutUsersIndexRoute: typeof LayoutUsersIndexRoute
  LayoutLessonsLessonIdPagesRoute: typeof LayoutLessonsLessonIdPagesRoute
  LayoutResourcesPostsIndexRoute: typeof LayoutResourcesPostsIndexRoute
  LayoutResourcesPostsPostIdEditContentRoute: typeof LayoutResourcesPostsPostIdEditContentRoute
}

const LayoutRouteChildren: LayoutRouteChildren = {
  LayoutIndexRoute: LayoutIndexRoute,
  LayoutLessonsIndexRoute: LayoutLessonsIndexRoute,
  LayoutUsersIndexRoute: LayoutUsersIndexRoute,
  LayoutLessonsLessonIdPagesRoute: LayoutLessonsLessonIdPagesRoute,
  LayoutResourcesPostsIndexRoute: LayoutResourcesPostsIndexRoute,
  LayoutResourcesPostsPostIdEditContentRoute:
    LayoutResourcesPostsPostIdEditContentRoute,
}

const LayoutRouteWithChildren =
  LayoutRoute._addFileChildren(LayoutRouteChildren)

export interface FileRoutesByFullPath {
  '': typeof LayoutRouteWithChildren
  '/login': typeof LoginRoute
  '/': typeof LayoutIndexRoute
  '/lessons': typeof LayoutLessonsIndexRoute
  '/users': typeof LayoutUsersIndexRoute
  '/lessons/$lessonId/pages': typeof LayoutLessonsLessonIdPagesRoute
  '/resources/posts': typeof LayoutResourcesPostsIndexRoute
  '/resources/posts/$postId/edit-content': typeof LayoutResourcesPostsPostIdEditContentRoute
}

export interface FileRoutesByTo {
  '/login': typeof LoginRoute
  '/': typeof LayoutIndexRoute
  '/lessons': typeof LayoutLessonsIndexRoute
  '/users': typeof LayoutUsersIndexRoute
  '/lessons/$lessonId/pages': typeof LayoutLessonsLessonIdPagesRoute
  '/resources/posts': typeof LayoutResourcesPostsIndexRoute
  '/resources/posts/$postId/edit-content': typeof LayoutResourcesPostsPostIdEditContentRoute
}

export interface FileRoutesById {
  __root__: typeof rootRoute
  '/_layout': typeof LayoutRouteWithChildren
  '/login': typeof LoginRoute
  '/_layout/': typeof LayoutIndexRoute
  '/_layout/lessons/': typeof LayoutLessonsIndexRoute
  '/_layout/users/': typeof LayoutUsersIndexRoute
  '/_layout/lessons/$lessonId/pages': typeof LayoutLessonsLessonIdPagesRoute
  '/_layout/resources/posts/': typeof LayoutResourcesPostsIndexRoute
  '/_layout/resources/posts/$postId/edit-content': typeof LayoutResourcesPostsPostIdEditContentRoute
}

export interface FileRouteTypes {
  fileRoutesByFullPath: FileRoutesByFullPath
  fullPaths:
    | ''
    | '/login'
    | '/'
    | '/lessons'
    | '/users'
    | '/lessons/$lessonId/pages'
    | '/resources/posts'
    | '/resources/posts/$postId/edit-content'
  fileRoutesByTo: FileRoutesByTo
  to:
    | '/login'
    | '/'
    | '/lessons'
    | '/users'
    | '/lessons/$lessonId/pages'
    | '/resources/posts'
    | '/resources/posts/$postId/edit-content'
  id:
    | '__root__'
    | '/_layout'
    | '/login'
    | '/_layout/'
    | '/_layout/lessons/'
    | '/_layout/users/'
    | '/_layout/lessons/$lessonId/pages'
    | '/_layout/resources/posts/'
    | '/_layout/resources/posts/$postId/edit-content'
  fileRoutesById: FileRoutesById
}

export interface RootRouteChildren {
  LayoutRoute: typeof LayoutRouteWithChildren
  LoginRoute: typeof LoginRoute
}

const rootRouteChildren: RootRouteChildren = {
  LayoutRoute: LayoutRouteWithChildren,
  LoginRoute: LoginRoute,
}

export const routeTree = rootRoute
  ._addFileChildren(rootRouteChildren)
  ._addFileTypes<FileRouteTypes>()

/* ROUTE_MANIFEST_START
{
  "routes": {
    "__root__": {
      "filePath": "__root.tsx",
      "children": [
        "/_layout",
        "/login"
      ]
    },
    "/_layout": {
      "filePath": "_layout.tsx",
      "children": [
        "/_layout/",
        "/_layout/lessons/",
        "/_layout/users/",
        "/_layout/lessons/$lessonId/pages",
        "/_layout/resources/posts/",
        "/_layout/resources/posts/$postId/edit-content"
      ]
    },
    "/login": {
      "filePath": "login.tsx"
    },
    "/_layout/": {
      "filePath": "_layout/index.tsx",
      "parent": "/_layout"
    },
    "/_layout/lessons/": {
      "filePath": "_layout/lessons/index.tsx",
      "parent": "/_layout"
    },
    "/_layout/users/": {
      "filePath": "_layout/users/index.tsx",
      "parent": "/_layout"
    },
    "/_layout/lessons/$lessonId/pages": {
      "filePath": "_layout/lessons/$lessonId.pages.tsx",
      "parent": "/_layout"
    },
    "/_layout/resources/posts/": {
      "filePath": "_layout/resources/posts/index.tsx",
      "parent": "/_layout"
    },
    "/_layout/resources/posts/$postId/edit-content": {
      "filePath": "_layout/resources/posts/$postId.edit-content.tsx",
      "parent": "/_layout"
    }
  }
}
ROUTE_MANIFEST_END */
