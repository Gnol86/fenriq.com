export default {
    statements: {
        vehicle: ["create", "update", "delete", "read"],
        checklist: ["create", "update", "delete", "read"],
        checklistCategory: ["create", "update", "delete", "read"],
        checklistAssignment: ["create", "update", "delete", "read"],
        checklistSubmission: ["read"],
        checklistSubscription: ["read", "update"],
    },
    roles: {
        owner: {
            vehicle: ["create", "update", "delete", "read"],
            checklist: ["create", "update", "delete", "read"],
            checklistCategory: ["create", "update", "delete", "read"],
            checklistAssignment: ["create", "update", "delete", "read"],
            checklistSubmission: ["read"],
            checklistSubscription: ["read", "update"],
        },
        admin: {
            vehicle: ["create", "update", "delete", "read"],
            checklist: ["create", "update", "delete", "read"],
            checklistCategory: ["create", "update", "delete", "read"],
            checklistAssignment: ["create", "update", "delete", "read"],
            checklistSubmission: ["read"],
            checklistSubscription: ["read", "update"],
        },
        member: {
            vehicle: ["read"],
            checklist: ["read"],
            checklistCategory: ["read"],
            checklistAssignment: ["read"],
            checklistSubmission: ["read"],
            checklistSubscription: ["read", "update"],
        },
    },
};
