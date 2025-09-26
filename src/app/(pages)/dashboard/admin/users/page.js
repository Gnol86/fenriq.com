import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export default async function Page() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    const user = session.user;
    if (user.role !== "admin") {
        redirect("/dashboard");
    }
    
    const users = await auth.api.listUsers({
        query: {
            query: {
                searchValue: "some name",
                searchField: "name",
                searchOperator: "contains",
                limit: 100,
                offset: 100,
                sortBy: "name",
                sortDirection: "desc",
                filterField: "email",
                filterValue: "hello@example.com",
                filterOperator: "eq",
            },
        },
        // This endpoint requires session cookies.
        headers: await headers(),
    });

    return (
        <div>
            <h1>Admin Dashboard</h1>
            <p>Welcome, {user.name}!</p>
        </div>
    );
}
