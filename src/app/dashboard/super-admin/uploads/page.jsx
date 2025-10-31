import ProtectedRoute from "@/components/common/ProtectedRoute";
import { FileManager } from "@/features/uploads";

export default function UploadsPage() {
  return (
    <ProtectedRoute roles={["super_admin"]}>
      <FileManager />
    </ProtectedRoute>
  );
}
