import { IconBook, IconLayoutDashboard, IconReport, IconUsers } from "@tabler/icons-react";
import { Command } from "lucide-react";
import { type SidebarData } from "../types";

export const sidebarData: SidebarData = {
  user: {
    name: "satnaing",
    email: "admin@gmail.com",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      name: "Vector Admin",
      logo: Command,
      plan: "Startup",
    },
    // {
    //   name: "Acme Inc",
    //   logo: GalleryVerticalEnd,
    //   plan: "Enterprise",
    // },
    // {
    //   name: "Acme Corp.",
    //   logo: AudioWaveform,
    //   plan: "Startup",
    // },
  ],
  navGroups: [
    {
      title: "General",
      items: [
        {
          title: "Dashboard",
          url: "/",
          icon: IconLayoutDashboard,
        },
        // {
        //   title: 'Tasks',
        //   url: '/tasks',
        //   icon: IconChecklist,
        // },
        {
          title: "Posts",
          url: "/posts",
          icon: IconBook,
        },
        // {
        //   title: "Chats",
        //   url: "/chats",
        //   badge: "3",
        //   icon: IconMessages,
        // },
        {
          title: "Users",
          url: "/users",
          icon: IconUsers,
        },
        {
          title: "Lessons",
          icon: IconBook,
          items: [
            {
              title: "Batches",
              url: "/lessons/batches",
            },
            {
              title: "Lessons",
              url: "/lessons/lessons",
            },
            // {
            //   title: "Lesson Categories",
            //   url: "/lesson-categories",
            //   icon: IconCategory2,
            // },
          ],
        },
        {
          title: "Reports",
          url: "/reports",
          icon: IconReport,
        }
      ],
    },
    // {
    //   title: "Pages",
    //   items: [
    //     {
    //       title: "Auth",
    //       icon: IconLockAccess,
    //       items: [
    //         {
    //           title: "Sign In",
    //           url: "/sign-in",
    //         },
    //         // {
    //         //   title: "Sign In (2 Col)",
    //         //   url: "/sign-in-2",
    //         // },
    //         // {
    //         //   title: "OTP",
    //         //   url: "/otp",
    //         // },
    //       ],
    //     },
    //     // {
    //     //   title: "Errors",
    //     //   icon: IconBug,
    //     //   items: [
    //     //     {
    //     //       title: "Unauthorized",
    //     //       url: "/401",
    //     //       icon: IconLock,
    //     //     },
    //     //     {
    //     //       title: "Forbidden",
    //     //       url: "/403",
    //     //       icon: IconUserOff,
    //     //     },
    //     //     {
    //     //       title: "Not Found",
    //     //       url: "/404",
    //     //       icon: IconError404,
    //     //     },
    //     //     {
    //     //       title: "Internal Server Error",
    //     //       url: "/500",
    //     //       icon: IconServerOff,
    //     //     },
    //     //     {
    //     //       title: "Maintenance Error",
    //     //       url: "/503",
    //     //       icon: IconBarrierBlock,
    //     //     },
    //     //   ],
    //     // },
    //   ],
    // },
    // {
    //   title: "Other",
    //   items: [
    //     {
    //       title: "Settings",
    //       icon: IconSettings,
    //       items: [
    //         {
    //           title: "Profile",
    //           url: "/settings",
    //           icon: IconUserCog,
    //         },
    //         {
    //           title: "Account",
    //           url: "/settings/account",
    //           icon: IconTool,
    //         },
    //         // {
    //         //   title: "Appearance",
    //         //   url: "/settings/appearance",
    //         //   icon: IconPalette,
    //         // },
    //         // {
    //         //   title: "Notifications",
    //         //   url: "/settings/notifications",
    //         //   icon: IconNotification,
    //         // },
    //         // {
    //         //   title: "Display",
    //         //   url: "/settings/display",
    //         //   icon: IconBrowserCheck,
    //         // },
    //       ],
    //     },
    //     // {
    //     //   title: "Help Center",
    //     //   url: "/help-center",
    //     //   icon: IconHelp,
    //     // },
    //   ],
    // },
  ],
};
