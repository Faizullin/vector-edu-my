import { lazy } from 'react';

import AdminLayout from '../layouts/AdminLayout';

const DashboardSales = lazy(() => import('../views/dashboard/DashSales/index'));

const Typography = lazy(() => import('../views/ui-elements/basic/BasicTypography'));
const Color = lazy(() => import('../views/ui-elements/basic/BasicColor'));

const FeatherIcon = lazy(() => import('../views/ui-elements/icons/Feather'));
const FontAwesome = lazy(() => import('../views/ui-elements/icons/FontAwesome'));
const MaterialIcon = lazy(() => import('../views/ui-elements/icons/Material'));

const Login = lazy(() => import('../views/auth/login'));
const Register = lazy(() => import('../views/auth/register'));

const Sample = lazy(() => import('../views/sample'));

const ResourcesPostPage = lazy(() => import('../views/resources/posts'));
const ResourcesPostEditContentPage = lazy(() => import('../views/resources/posts/edit-content'));
const LessonsLessonBatchPage = lazy(() => import('../views/lessons/lesson-batches'));
const LessonsLessonListPage = lazy(() => import('../views/lessons/lessons-list'));
const LessonPageListEditView = lazy(() => import('../views/lessons/lesson-page-list-edit-view'));
const AccountsUsersListPage = lazy(() => import('../views/accounts/users/UsersList'));

const MainRoutes = {
  path: '/',
  children: [
    {
      path: '/',
      element: <AdminLayout />,
      children: [
        {
          path: '/dashboard/sales',
          element: <DashboardSales />
        },
        {
          path: '/typography',
          element: <Typography />
        },
        {
          path: '/color',
          element: <Color />
        },
        {
          path: '/icons/Feather',
          element: <FeatherIcon />
        },
        {
          path: '/icons/font-awesome-5',
          element: <FontAwesome />
        },
        {
          path: '/icons/material',
          element: <MaterialIcon />
        },

        {
          path: '/sample-page',
          element: <Sample />
        },

        {
          path: '/resources',
          children: [
            {
              path: '/resources/posts',
              children: [
                {
                  path: '',
                  element: <ResourcesPostPage />
                },
                {
                  path: ':id',
                  element: <ResourcesPostPage />
                },
                {
                  path: ':id/edit-content',
                  element: <ResourcesPostEditContentPage />
                }
              ]
            }
          ]
        },
        {
          path: '/lessons',
          children: [
            {
              path: 'batches',
              element: <LessonsLessonBatchPage />
            },
            {
              path: 'lessons',
              element: <LessonsLessonListPage />
            },
            {
              path: ':lesson_id/pages/edit-view',
              element: <LessonPageListEditView />
            }
          ]
        },
        {
          path: "/accounts",
          children: [
            {
              path: 'users',
              element: <AccountsUsersListPage />
            }
          ]
        }
      ]
    }
    // {
    //   path: '/',
    //   element: <GuestLayout />,
    //   children: [
    //     {
    //       path: CONFIG.routes.login,
    //       element: <Login />
    //     },
    //     {
    //       path: '/register',
    //       element: <Register />
    //     }
    //   ]
    // }
  ]
};

export default MainRoutes;
