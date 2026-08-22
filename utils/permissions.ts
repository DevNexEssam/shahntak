export const permissions = {
    super: {
        user: {
            read: true,
            create: true,
            update: true,
            softDelete: true,
            delete: true,
        },
    },

    admin: {
        user: {
            read: true,
            create: true,
            update: true,
            softDelete: true,
            delete: false,
        },
    },
};

export function can(role: string, resource: string, action: string) {
    return (
        permissions[role as keyof typeof permissions]?.[
        resource as keyof (typeof permissions)[keyof typeof permissions]
        ]?.[
        action as keyof (typeof permissions)[keyof typeof permissions][keyof (typeof permissions)[keyof typeof permissions]]
        ] === true
    );
}
