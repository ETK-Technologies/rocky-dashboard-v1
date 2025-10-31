import ProtectedRoute from "@/components/common/ProtectedRoute";
import { UserForm } from "@/features/users";

export default function NewUserPage() {
  return (
    <ProtectedRoute roles={["super_admin"]}>
      <UserForm />
    </ProtectedRoute>
  );
}


