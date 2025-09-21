import { getInitials } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

const AVATAR_SIZES = {
    xs: "h-6 w-6",
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-12 w-12",
    xl: "h-16 w-16",
    "2xl": "h-20 w-20",
};

const INITIAL_SIZES = {
    xs: "text-xs",
    sm: "text-sm",
    md: "text-md",
    lg: "text-lg",
    xl: "text-xl",
    "2xl": "text-2xl",
};

export default function ImageProfile({
    user,
    size = "md",
    defaultImage = undefined,
}) {
    return (
        <Avatar className={`${AVATAR_SIZES[size]}`}>
            <AvatarFallback
                className={`ring ring-inset ring-foreground/20 ${INITIAL_SIZES[size]}`}
            >
                {getInitials(user?.name || user?.email || "-")}
            </AvatarFallback>
            <AvatarImage src={user?.image ?? defaultImage} alt={user?.name} />
        </Avatar>
    );
}
