import { NextResponse } from "next/server";
import { getAuth } from "./lib/access-control";

export async function proxy(request) {
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-pathname", request.nextUrl.pathname);
    const isPublicChecklistPath = request.nextUrl.pathname.startsWith("/app/checklist");

    // Vérification d'authentification uniquement pour /app et /dashboard
    if (
        (request.nextUrl.pathname.startsWith("/app") && !isPublicChecklistPath) ||
        request.nextUrl.pathname.startsWith("/dashboard")
    ) {
        const { user } = await getAuth();

        if (!user) {
            return NextResponse.redirect(new URL("/signin", request.url));
        }
    }

    return NextResponse.next({
        request: {
            headers: requestHeaders,
        },
    });
}

export const config = {
    matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
