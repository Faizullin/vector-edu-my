import Header from "@/components/layout/header";
import { ProfileDropdown } from "@/components/layout/profile-dropdown";
import { Search } from "@/components/layout/search";
import Reports from "@/features/reports";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reports",
  description: "View and manage reports",
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
      <Reports />
    </>
  );
}
