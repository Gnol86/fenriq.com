/**
 * ============================================================
 * EXAMPLE: Server Action
 * ============================================================
 *
 * This is an example of a project-specific server action.
 * Server actions handle business logic and database operations.
 *
 * Location: src/project/actions/
 * Naming: Always use .action.js suffix
 * Usage: Import with @project/actions/my.action
 * ============================================================
 */

"use server";

// import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";

/**
 * Example: Get items for current user's organization
 */
export async function getItems() {
    const _user = await getCurrentUser();

    // Example: Query items from project schema
    // const items = await db.product.findMany({
    //     where: {
    //         organizationId: user.organizationId,
    //     },
    //     orderBy: {
    //         createdAt: "desc",
    //     },
    // });

    // return items;

    return [];
}

/**
 * Example: Create a new item
 */
export async function createItem(formData) {
    const _user = await getCurrentUser();

    // Validate input
    const name = formData.get("name");
    if (!name || name.trim().length < 2) {
        throw new Error("Name must be at least 2 characters");
    }

    // Create item
    // const item = await db.product.create({
    //     data: {
    //         name: name.trim(),
    //         organizationId: user.organizationId,
    //         createdBy: user.id,
    //     },
    // });

    // Revalidate page to show new data
    revalidatePath("/app/items");

    // return item;
    return { success: true };
}

/**
 * Example: Update an item
 */
export async function updateItem(_itemId, _formData) {
    const _user = await getCurrentUser();

    // Check permissions
    // const item = await db.product.findFirst({
    //     where: {
    //         id: itemId,
    //         organizationId: user.organizationId,
    //     },
    // });

    // if (!item) {
    //     throw new Error("Item not found or access denied");
    // }

    // Update item
    // const updated = await db.product.update({
    //     where: { id: itemId },
    //     data: {
    //         name: formData.get("name"),
    //         updatedAt: new Date(),
    //     },
    // });

    revalidatePath("/app/items");

    // return updated;
    return { success: true };
}

/**
 * Example: Delete an item
 */
export async function deleteItem(_itemId) {
    const _user = await getCurrentUser();

    // Check permissions
    // const item = await db.product.findFirst({
    //     where: {
    //         id: itemId,
    //         organizationId: user.organizationId,
    //     },
    // });

    // if (!item) {
    //     throw new Error("Item not found or access denied");
    // }

    // Delete item
    // await db.product.delete({
    //     where: { id: itemId },
    // });

    revalidatePath("/app/items");

    return { success: true };
}

/**
 * ============================================================
 * USAGE IN COMPONENT
 * ============================================================
 *
 * import { useServerAction } from "@/hooks/use-server-action";
 * import { createItem } from "@project/actions/my.action";
 *
 * const { execute, isPending } = useServerAction();
 *
 * const handleSubmit = async (formData) => {
 *     await execute(() => createItem(formData), {
 *         successMessage: "Item created!",
 *         errorMessage: "Failed to create item",
 *     });
 * };
 *
 * ============================================================
 */
