import Header from "@/components/layout/header";
import { ProfileDropdown } from "@/components/layout/profile-dropdown";
import { Search } from "@/components/layout/search";
import LessonBatches from "@/features/lesson-batches";

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Lesson Batches",
  description: "Manage your lesson batches",
  keywords: ["lessons", "batches", "education", "courses"],
};

export default function Page() {
  return (
    <>
      <Header fixed>
        <Search />
        <div className="ml-auto flex items-center space-x-4">
          {/* <ThemeSwitch /> */}
          <ProfileDropdown />
        </div>
      </Header>
      <LessonBatches />
    </>
  );
}
