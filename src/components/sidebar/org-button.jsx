"use client";
import { useMemo, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Check, Loader2, Plus } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { getInitials } from "@/lib/utils";

export default function OrgButton({ user }) {
  const router = useRouter();

  const { data: organizations = [], isPending: isLoadingOrganizations } =
    authClient.useListOrganizations();
  const { data: activeOrganization } = authClient.useActiveOrganization();
  const [switchingOrgId, setSwitchingOrgId] = useState(null);

  const sortedOrganizations = useMemo(() => {
    if (!organizations) {
      return [];
    }
    return [...organizations].sort((a, b) => a.name.localeCompare(b.name));
  }, [organizations]);

  const handleSwitchOrganization = async (organizationId) => {
    if (!organizationId || organizationId === activeOrganization?.id) {
      return;
    }

    setSwitchingOrgId(organizationId);
    try {
      await authClient.organization.setActive({
        organizationId,
      });
      router.refresh();
    } catch (error) {
      console.error("Failed to switch organization", error);
    } finally {
      setSwitchingOrgId(null);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2 p-2 cursor-pointer">
        <Avatar className="h-10 w-10">
          <AvatarFallback className="bg-background">
            {getInitials(activeOrganization?.name || "P")}
          </AvatarFallback>
          <AvatarImage
            src={activeOrganization?.image || "/images/logo_noborder.png"}
            alt={`Avatar of ${activeOrganization?.name || "PolGPT"}`}
          />
        </Avatar>
        <div className="flex flex-col justify-start items-start flex-1 text-left overflow-hidden min-w-0">
          <span className="font-bold truncate w-full">PolGPT</span>
          <span className="text-xs font-medium text-muted-foreground -mt-1 truncate w-full">
            {activeOrganization?.name || "Aucune organisation"}
          </span>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-56"
        onCloseAutoFocus={(event) => event.preventDefault()}
      >
        <DropdownMenuLabel className="text-xs text-muted-foreground">
          Mes organisations
        </DropdownMenuLabel>
        {isLoadingOrganizations && (
          <DropdownMenuItem disabled className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Chargement...
          </DropdownMenuItem>
        )}
        {!isLoadingOrganizations && sortedOrganizations.length === 0 && (
          <DropdownMenuItem disabled>Aucune organisation</DropdownMenuItem>
        )}
        {!isLoadingOrganizations &&
          sortedOrganizations.map((organization) => {
            const isActive = organization.id === activeOrganization?.id;
            const isSwitching = switchingOrgId === organization.id;

            return (
              <DropdownMenuItem
                key={organization.id}
                onSelect={async (event) => {
                  event.preventDefault();
                  await handleSwitchOrganization(organization.id);
                }}
                disabled={isSwitching}
                className="flex items-center justify-between gap-2"
              >
                <Avatar className="h-6 w-6">
                  <AvatarFallback className="bg-background text-xs">
                    {getInitials(organization.name)}
                  </AvatarFallback>
                  <AvatarImage
                    src={organization.image}
                    alt={`Avatar of ${organization.name}`}
                  />
                </Avatar>
                <span className="truncate text-sm flex-1">
                  {organization.name}
                </span>
                {isSwitching ? (
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                ) : isActive ? (
                  <Check className="h-4 w-4 text-primary" />
                ) : null}
              </DropdownMenuItem>
            );
          })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
