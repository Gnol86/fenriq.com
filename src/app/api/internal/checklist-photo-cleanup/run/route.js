import { runChecklistPhotoDeletionCleanup } from "@project/lib/charroi/checklist-photo-cleanup";
import { NextResponse } from "next/server";

function getProvidedSecret(request) {
    const bearerToken = request.headers.get("authorization");

    if (bearerToken?.startsWith("Bearer ")) {
        return bearerToken.slice("Bearer ".length);
    }

    return request.headers.get("x-checklist-photo-cleanup-secret");
}

export async function POST(request) {
    const expectedSecret = process.env.CHECKLIST_PHOTO_CLEANUP_SECRET;
    const providedSecret = getProvidedSecret(request);

    if (!expectedSecret || providedSecret !== expectedSecret) {
        return NextResponse.json(
            {
                error: "Unauthorized",
            },
            { status: 401 }
        );
    }

    try {
        const result = await runChecklistPhotoDeletionCleanup();

        return NextResponse.json({
            success: true,
            ...result,
        });
    } catch (error) {
        console.error("[charroi] Checklist photo cleanup runner failed", {
            errorMessage: error?.message,
            errorName: error?.name,
        });

        return NextResponse.json(
            {
                error: "Checklist photo cleanup run failed",
            },
            { status: 500 }
        );
    }
}
