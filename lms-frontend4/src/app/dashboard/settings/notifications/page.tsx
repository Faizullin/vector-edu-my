import ContentSection from "@/features/settings/components/content-section";
import { NotificationsForm } from "@/features/settings/notifications/notifications-form";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Notifications Settings",
  description: "Configure how you receive notifications.",
};

export default function NotificationsSettingsPage() {
  return (
    <ContentSection
      title="Notifications"
      desc="Configure how you receive notifications."
    >
      <NotificationsForm />
    </ContentSection>
  );
}
