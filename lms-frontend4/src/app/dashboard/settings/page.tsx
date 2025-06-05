import ContentSection from "@/features/settings/components/content-section";
import ProfileForm from "@/features/settings/profile/profile-form";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Profile Settings",
  description: "Manage your profile settings and preferences.",
};

export default function ProfileSettingsPage() {
  return (
    <ContentSection
      title="Profile"
      desc="This is how others will see you on the site."
    >
      <ProfileForm />
    </ContentSection>
  );
}
