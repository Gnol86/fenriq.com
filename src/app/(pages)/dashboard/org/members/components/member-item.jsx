import ImageProfile from "@/components/image-profile";
import { Badge } from "@/components/ui/badge";
import {
    Item,
    ItemActions,
    ItemContent,
    ItemDescription,
    ItemMedia,
    ItemTitle,
} from "@/components/ui/item";
import MembersActionMenu from "./members-action-menu";
export default function MemberItem({
    member,
    organizationId,
    currentUserId,
    canUpdate,
    canDelete,
}) {
    const user = member.user;
    const memberRole = member?.role ?? "member";
    const showActions = canUpdate || canDelete;

    return (
        <Item>
            <ItemMedia>
                <ImageProfile entity={user} />
            </ItemMedia>
            <ItemContent>
                <ItemTitle>
                    {user.name}
                    {memberRole !== "member" && <Badge>{memberRole}</Badge>}
                </ItemTitle>
                <ItemDescription>{user.email}</ItemDescription>
            </ItemContent>
            {showActions && (
                <ItemActions>
                    <MembersActionMenu
                        member={member}
                        memberRole={memberRole}
                        organizationId={organizationId}
                        currentUserId={currentUserId}
                        canUpdate={canUpdate}
                        canDelete={canDelete}
                    />
                </ItemActions>
            )}
        </Item>
    );
}
