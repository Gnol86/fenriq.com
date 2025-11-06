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

export default function ImageProfile({ entity, size = "md", defaultImage = undefined }) {
    const src = entity?.image || entity?.logo || defaultImage;
    return (
        <Avatar className={`${AVATAR_SIZES[size]} rounded-lg`}>
            <AvatarFallback
                className={`ring-foreground/20 rounded-lg ring ring-inset ${INITIAL_SIZES[size]}`}
            >
                {getInitials(entity?.name || entity?.email || "-")}
            </AvatarFallback>
            <AvatarImage src={src} alt={entity?.name} />
        </Avatar>
    );
}
