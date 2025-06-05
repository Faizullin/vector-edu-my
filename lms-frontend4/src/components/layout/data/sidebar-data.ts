import {
  Bell,
  BookIcon,
  Command,
  ListIcon,
  PanelTopIcon,
  Settings,
  UserCog,
  UserIcon,
} from "lucide-react";
import { SidebarData } from "../types";

export const sidebarData: SidebarData = {
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
          href: "/dashboard",
          icon: PanelTopIcon,
        },
        // {
        //   title: 'Tasks',
        //   url: '/tasks',
        //   icon: IconChecklist,
        // },
        {
          title: "Posts",
          href: "/dashboard/posts",
          icon: BookIcon,
        },
        // {
        //   title: "Chats",
        //   url: "/chats",
        //   badge: "3",
        //   icon: IconMessages,
        // },
        {
          title: "Users",
          href: "/dashboard/users",
          icon: UserIcon,
        },
        {
          title: "Lessons",
          icon: BookIcon,
          items: [
            {
              title: "Batches",
              href: "/dashboard/lessons/batches",
            },
            {
              title: "Lessons",
              href: "/dashboard/lessons/lessons",
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
          href: "/dashboard/reports",
          icon: ListIcon,
        },
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
    {
      title: "Other",
      items: [
        {
          title: "Settings",
          icon: Settings,
          items: [
            {
              title: "Profile",
              href: "/dashboard/settings",
              icon: UserCog,
            },
            {
              title: "Notifications",
              href: "/dashboard/settings/notifications",
              icon: Bell,
            },
          ],
        },
      ],
    },
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
