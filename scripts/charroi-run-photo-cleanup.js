import { runChecklistPhotoDeletionCleanup } from "@project/lib/charroi/checklist-photo-cleanup";
import prisma from "@/lib/prisma";

try {
    const result = await runChecklistPhotoDeletionCleanup();

    console.log(
        JSON.stringify({
            job: "charroi-photo-cleanup",
            success: true,
            ...result,
        })
    );
} catch (error) {
    console.log(
        JSON.stringify({
            job: "charroi-photo-cleanup",
            success: false,
            errorMessage: error?.message ?? "Unknown error",
        })
    );
    process.exitCode = 1;
} finally {
    await prisma.$disconnect();
}
