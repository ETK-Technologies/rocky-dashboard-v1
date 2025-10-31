import ProtectedRoute from "@/components/common/ProtectedRoute";
import UploadSettings from "@/features/uploads/components/UploadSettings";

export default function UploadSettingsPage() {
  return (
    <ProtectedRoute roles={["super_admin"]}>
      <UploadSettings />
    </ProtectedRoute>
  );
}

