import { createFileRoute, Outlet } from "@tanstack/react-router";
import { requireUser } from "@/lib/auth-guard";

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: async () => {
    const user = await requireUser();
    return { user };
  },
  component: () => <Outlet />,
});
