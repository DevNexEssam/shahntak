export const permissions = {
    super: {
        user: { read: true, create: true, update: true, softDelete: true, delete: true },
        company: { read: true, create: true, update: true, softDelete: true, delete: true },
        companyUser: { read: true, create: true, update: true, softDelete: true, delete: true },
        order: { read: true, create: true, update: true, softDelete: true, delete: true },
        shipment: { read: true, create: true, update: true, softDelete: true, delete: true },
        carrier: { read: true, create: true, update: true, softDelete: true, delete: true },
        vehicle: { read: true, create: true, update: true, softDelete: true, delete: true },
        route: { read: true, create: true, update: true, softDelete: true, delete: true },
        waybill: { read: true, create: true, update: true, softDelete: true, delete: true },
        invoice: { read: true, create: true, update: true, softDelete: true, delete: true },
        payment: { read: true, create: true, update: true, softDelete: true, delete: true },
        trackingEvent: { read: true, create: true, update: true, softDelete: true, delete: true },
        notification: { read: true, create: true, update: true, softDelete: true, delete: true },
    },

    admin: {
        user: { read: true, create: true, update: true, softDelete: true, delete: false },
        company: { read: true, create: true, update: true, softDelete: true, delete: false },
        companyUser: { read: true, create: true, update: true, softDelete: true, delete: false },
        order: { read: true, create: true, update: true, softDelete: true, delete: false },
        shipment: { read: true, create: true, update: true, softDelete: true, delete: false },
        carrier: { read: true, create: true, update: true, softDelete: true, delete: false },
        vehicle: { read: true, create: true, update: true, softDelete: true, delete: false },
        route: { read: true, create: true, update: true, softDelete: true, delete: false },
        waybill: { read: true, create: true, update: true, softDelete: true, delete: false },
        invoice: { read: true, create: true, update: true, softDelete: true, delete: false },
        payment: { read: true, create: true, update: true, softDelete: true, delete: false },
        trackingEvent: { read: true, create: true, update: true, softDelete: true, delete: false },
        notification: { read: true, create: true, update: true, softDelete: true, delete: false },
    },

    company: {
        companyUser: { read: true, create: true, update: true, softDelete: true, delete: true },
        order: { read: true, create: true, update: true, softDelete: true, delete: true },
        shipment: { read: true, create: true, update: true, softDelete: true, delete: true },
        waybill: { read: true, create: true, update: true, softDelete: true, delete: true },
        invoice: { read: true, create: true, update: true, softDelete: true, delete: true },
        payment: { read: true, create: true, update: true, softDelete: true, delete: true },
        trackingEvent: { read: true, create: true, update: true, softDelete: true, delete: true },
        notification: { read: true, create: true, update: true, softDelete: true, delete: true },
    }
};

export function can(role: string, resource: string, action: string): boolean {
    return (
        permissions[role as keyof typeof permissions]?.[
        resource as keyof (typeof permissions)[keyof typeof permissions]
        ]?.[
        action as keyof (typeof permissions)[keyof typeof permissions][keyof (typeof permissions)[keyof typeof permissions]]
        ] === true
    );
}
