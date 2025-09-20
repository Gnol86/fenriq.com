import React from "react";
import {
    Breadcrumb as BC,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export default function Breadcrumb({ items = [{ name: "???" }] }) {
    return (
        <BC>
            <BreadcrumbList>
                {items.map(({ name, href }, index) => (
                    <React.Fragment key={href || name}>
                        <BreadcrumbItem>
                            {href ? (
                                <BreadcrumbLink href={href}>
                                    {index < items.length - 1 ? (
                                        name
                                    ) : (
                                        <BreadcrumbPage>{name}</BreadcrumbPage>
                                    )}
                                </BreadcrumbLink>
                            ) : index < items.length - 1 ? (
                                name
                            ) : (
                                <BreadcrumbPage>{name}</BreadcrumbPage>
                            )}
                        </BreadcrumbItem>
                        {index < items.length - 1 && <BreadcrumbSeparator />}
                    </React.Fragment>
                ))}
            </BreadcrumbList>
        </BC>
    );
}
