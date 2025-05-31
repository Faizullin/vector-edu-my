import Header from "@/components/layout/header";
import { ProfileDropdown } from "@/components/layout/profile-dropdown";
import { Search } from "@/components/layout/search";
import Users from "@/features/users";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Users",
  description: "Manage your users",
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
      <Users />
    </>
  );
}
