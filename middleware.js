import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function middleware(request) {
    const pathname = request.nextUrl.pathname;

    // Routes protégées qui nécessitent une authentification
    const protectedRoutes = ["/app", "/dashboard"];

    // Vérifier si la route courante est protégée
    const isProtectedRoute = protectedRoutes.some((route) =>
        pathname.startsWith(route)
    );

    // Si ce n'est pas une route protégée, continuer
    if (!isProtectedRoute) {
        return NextResponse.next();
    }

    try {
        // Vérifier la session avec Better Auth
        const session = await auth.api.getSession({
            headers: request.headers,
        });

        // Si pas de session ou utilisateur, rediriger vers signin
        if (!session?.user) {
            const signInUrl = new URL("/signin", request.url);
            // Ajouter l'URL de retour comme paramètre de requête
            signInUrl.searchParams.set("callbackUrl", pathname);
            return NextResponse.redirect(signInUrl);
        }

        // Vérifier si l'email est vérifié (requis par votre config)
        if (!session.user.emailVerified) {
            const verifyUrl = new URL("/verify-email", request.url);
            return NextResponse.redirect(verifyUrl);
        }

        // Session valide, continuer
        return NextResponse.next();
    } catch (error) {
        console.error("Middleware auth error:", error);
        // En cas d'erreur, rediriger vers signin par sécurité
        const signInUrl = new URL("/signin", request.url);
        return NextResponse.redirect(signInUrl);
    }
}

export const config = {
    // Utiliser le runtime Node.js (stable dans Next.js 15.5)
    runtime: "nodejs",
    matcher: [
        "/((?!api|_next/static|_next/image|favicon.ico|signin|signup|verify-email|email-verified).*)",
    ],
};
