import ProtectedRoute from "@/components/common/ProtectedRoute";
import { Users } from "@/features/users";

export default function UsersPage() {
  return (
    <ProtectedRoute roles={["super_admin"]}>
      <Users />
    </ProtectedRoute>
  );
}


