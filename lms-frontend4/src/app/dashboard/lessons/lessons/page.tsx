import Header from "@/components/layout/header";
import { ProfileDropdown } from "@/components/layout/profile-dropdown";
import { Search } from "@/components/layout/search";
import Lessons from "@/features/lessons";

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Lessons",
  description: "Manage your lessons",
  keywords: ["lessons", "education", "courses"],
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
      <Lessons />
    </>
  );
}
