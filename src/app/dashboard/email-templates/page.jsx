import { EmailTemplatesList } from "@/features/email-templates";

export const metadata = {
  title: "Email Templates | Dashboard",
  description: "Manage your email templates",
};

export default function EmailTemplatesPage() {
  return <EmailTemplatesList />;
}
