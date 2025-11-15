import { EmailTriggersLogs } from "@/features/email-triggers-logs";
import { PageContainer } from "@/components/ui";

export const metadata = {
  title: "Email Triggers Logs | Dashboard",
  description: "View email trigger logs",
};

export default function EmailTriggersLogsPage() {
  return (
    <PageContainer>
      <EmailTriggersLogs />
    </PageContainer>
  );
}

