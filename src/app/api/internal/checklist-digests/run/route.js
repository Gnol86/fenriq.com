import { runChecklistDigestDispatch } from "@project/lib/charroi/notifications";
import { NextResponse } from "next/server";

function getProvidedSecret(request) {
    const bearerToken = request.headers.get("authorization");

    if (bearerToken?.startsWith("Bearer ")) {
        return bearerToken.slice("Bearer ".length);
    }

    return request.headers.get("x-checklist-digests-secret");
}

export async function POST(request) {
    const expectedSecret = process.env.CHECKLIST_DIGESTS_SECRET;
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
        const result = await runChecklistDigestDispatch();

        return NextResponse.json({
            success: true,
            ...result,
        });
    } catch (error) {
        console.error("[charroi] Digest runner failed", {
            errorMessage: error?.message,
            errorName: error?.name,
        });

        return NextResponse.json(
            {
                error: "Digest run failed",
            },
            { status: 500 }
        );
    }
}
