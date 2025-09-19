"use client";

import { authClient } from "@/lib/auth-client";

export default function ActiveOrgLabel() {
  const { data: activeOrganization, isPending } =
    authClient.useActiveOrganization();
  const organizationLabel = isPending
    ? "Chargement..."
    : activeOrganization?.name || "Organisation";
  return <span>{organizationLabel}</span>;
}
