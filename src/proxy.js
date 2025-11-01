import { NextResponse } from "next/server";
import { getAuth } from "./lib/access-control";

export async function proxy(request) {
    const { user } = await getAuth();

    if (!user) {
        return NextResponse.redirect(new URL("/signin", request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/app/:path*", "/dashboard/:path*"],
};
