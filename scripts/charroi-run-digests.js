import { runChecklistDigestDispatch } from "@project/lib/charroi/notifications";
import prisma from "@/lib/prisma";

try {
    const result = await runChecklistDigestDispatch();

    console.log(
        JSON.stringify({
            job: "charroi-digests",
            success: true,
            ...result,
        })
    );
} catch (error) {
    console.log(
        JSON.stringify({
            job: "charroi-digests",
            success: false,
            errorMessage: error?.message ?? "Unknown error",
        })
    );
    process.exitCode = 1;
} finally {
    await prisma.$disconnect();
}
