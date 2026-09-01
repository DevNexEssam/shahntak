/* eslint-disable @typescript-eslint/no-explicit-any */
// 1. User Types
export interface User {
    _id: string;
    name: string;
    email: string;
    password?: string;
    phone: string;
    role: "admin" | "super";
    status: "active" | "inactive";
    createdAt?: string;
    updatedAt?: string;
}

export interface UserResponse {
    success: boolean;
    data: User[];
    total: number;
    count: number;
    stats?: {
        active: number;
        inactive: number;
    };
}

export interface UserSingleResponse {
    success: boolean;
    message?: string;
    data: User;
}

export interface UserDeleteResponse {
    success: boolean;
    message?: string;
    data?: any;
}


// 2. Carrier Types
export interface Carrier {
    _id: string;
    name: string;
    type: "local" | "external_api";
    contactPhone?: string;
    contactEmail?: string;
    isActive: boolean;
    deletedAt?: string | null;
    createdAt?: string;
    updatedAt?: string;
}

export interface CarrierResponse {
    success: boolean;
    data: Carrier[];
    total: number;
    count: number;
    stats?: {
        active: number;
        inactive?: number;
        local?: number;
        external?: number;
        total: number;
    };
}

export interface CarrierSingleResponse {
    success: boolean;
    message?: string;
    data: Carrier;
}

export interface CarrierDeleteResponse {
    success: boolean;
    message?: string;
    data?: any;
}


// 3. Company Types
export interface Company {
    _id: string;
    companyName: string;
    email: string;
    phone: string;
    city: string;
    taxNumber?: string;
    address?: string;
    facilityInfo?: string;
    status: "active" | "inactive" | "archived" | "banned";
    approvedBy?: string | User;
    approvedAt?: string;
    deletedAt?: string | null;
    createdAt?: string;
    updatedAt?: string;
}

export interface CompanyResponse {
    success: boolean;
    data: Company[];
    total: number;
    count: number;
    stats?: {
        active: number;
        inactive: number;
        archived: number;
        banned: number;
        total: number;
    };
}

export interface CompanySingleResponse {
    success: boolean;
    message?: string;
    data: Company;
    employeesCount?: number;
    ordersCount?: number;
    shipmentsCount?: number;
    completedShipmentsCount?: number;
    activeShipmentsCount?: number;
    totalRevenue?: number;
    pendingAmount?: number;
    revenueResult?: any[];
}

export interface CompanyDeleteResponse {
    success: boolean;
    message?: string;
    data?: any;
}

export interface CompanyFullDetailsResponse {
    success: boolean;
    employeesCount: number;
    ordersCount: number;
    shipmentsCount: number;
    completedShipmentsCount: number;
    activeShipmentsCount: number;
    totalRevenue: number;
    pendingAmount: number;
    company: Company;
    message?: string;
}

// 4. CompanyUser Types
export interface CompanyUser {
    _id: string;
    companyId: string | Company;
    userName: string;
    userEmail: string;
    password?: string;
    phone: string;
    userRole: "owner" | "manager" | "staff";
    status: "active" | "inactive";
    permissions: string[];
    userIsActive: boolean;
    createdBy: string;
    createdByType?: "user" | "company_user";
    deletedAt?: string | null;
    createdAt?: string;
    updatedAt?: string;
}

export interface CompanyUserResponse {
    success: boolean;
    data: CompanyUser[];
    total: number;
    count: number;
    stats?: {
        active: number;
        inactive: number;
        total: number;
    };
}

export interface CompanyUserSingleResponse {
    success: boolean;
    message?: string;
    data: CompanyUser;
    ordersCount?: number;
    createdByDetails?: {
        _id?: string;
        name: string;
        email: string;
        type: "user" | "company_user";
    };
}

export interface CompanyUserFullDetailsResponse {
    success: boolean;
    companyUser: CompanyUser;
    ordersCount: number;
    recentOrders: Order[];
    createdByDetails?: {
        _id?: string;
        name: string;
        email: string;
        type: "user" | "company_user";
    };
    message?: string;
}

export interface CompanyUserDeleteResponse {
    success: boolean;
    message?: string;
    data?: any;
}

// 5. Order Types
export interface Order {
    _id: string;
    orderNumber: string;
    companyId: string | Company;
    shipmentId?: string | Shipment;
    createdByUserId?: string | CompanyUser | User;
    createdByUserType?: "user" | "company_user";
    recipientName: string;
    recipientPhone: string;
    recipientCity: string;
    recipientDistrict?: string;
    recipientAddress: string;
    description?: string;
    quantity: number;
    weight: number;
    orderValue: number;
    codAmount?: number;
    status: "pending" | "validated" | "error" | "grouped" | "shipped" | "delivered" | "cancelled";
    source: "manual" | "bulk_upload";
    deletedAt?: string | null;
    createdAt?: string;
    updatedAt?: string;
}

export interface OrderResponse {
    success: boolean;
    data: Order[];
    total: number;
    count: number;
    stats?: {
        pending: number;
        validated: number;
        grouped: number;
        shipped: number;
        delivered: number;
        cancelled: number;
        total: number;
    };
}

export interface OrderSingleResponse {
    success: boolean;
    message?: string;
    data: Order;
}

export interface OrderDeleteResponse {
    success: boolean;
    message?: string;
    data?: any;
}

// 6. Shipment Types
export type ShipmentStatus =
    | "created" | "confirmed" | "assigned" | "ready_for_pickup" | "picked_up"
    | "in_transit" | "arrived" | "out_for_delivery" | "delivered"
    | "delivery_failed" | "cancelled" | "returned" | "exception";

export interface Shipment {
    _id: string;
    shipmentNumber: string;
    companyId: string | Company;
    type: "ftl" | "ltl" | "local_delivery";
    origin: string;
    destination: string;
    routeId?: string | Route;
    carrierId?: string | Carrier;
    vehicleId?: string | Vehicle;
    invoiceId?: string | Invoice;
    ordersCount: number;
    shippingCost: number;
    customerPrice: number;
    waybillNumber?: string;
    trackingNumber?: string;
    status: ShipmentStatus;
    deletedAt?: string | null;
    createdAt?: string;
    updatedAt?: string;
}

export interface ShipmentResponse {
    success: boolean;
    data: Shipment[];
    total: number;
    count: number;
    stats?: {
        created: number;
        in_transit: number;
        delivered: number;
        cancelled: number;
        total: number;
    };
}

export interface ShipmentSingleResponse {
    success: boolean;
    message?: string;
    data: Shipment;
}

export interface ShipmentDeleteResponse {
    success: boolean;
    message?: string;
    data?: any;
}

// 7. Vehicle Types
export interface Vehicle {
    _id: string;
    type: string;
    capacityWeight?: number;
    capacityVolume?: number;
    isActive: boolean;
    deletedAt?: string | null;
    createdAt?: string;
    updatedAt?: string;
}

export interface VehicleResponse {
    success: boolean;
    data: Vehicle[];
    total: number;
    count: number;
    stats?: {
        active: number;
        inactive: number;
        total: number;
    };
}

export interface VehicleSingleResponse {
    success: boolean;
    message?: string;
    data: Vehicle;
}

export interface VehicleDeleteResponse {
    success: boolean;
    message?: string;
    data?: any;
}

// 8. Route Types
export interface Route {
    _id: string;
    origin: string;
    destination: string;
    vehicleType: string;
    basePrice: number;
    carrierId?: string | Carrier;
    estimatedTransitTime?: string;
    isActive: boolean;
    deletedAt?: string | null;
    createdAt?: string;
    updatedAt?: string;
}

export interface RouteResponse {
    success: boolean;
    data: Route[];
    total: number;
    count: number;
    stats?: {
        active: number;
        inactive: number;
        total: number;
    };
}

export interface RouteSingleResponse {
    success: boolean;
    message?: string;
    data: Route;
}

export interface RouteDeleteResponse {
    success: boolean;
    message?: string;
    data?: any;
}

// 9. Waybill Types
export interface Waybill {
    _id: string;
    shipmentId: string | Shipment;
    waybillNumber: string;
    pdfUrl: string;
    issuedAt: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface WaybillResponse {
    success: boolean;
    data: Waybill[];
    total: number;
    count: number;
}

export interface WaybillSingleResponse {
    success: boolean;
    message?: string;
    data: Waybill;
}

export interface WaybillDeleteResponse {
    success: boolean;
    message?: string;
    data?: any;
}

// 10. Invoice Types
export interface Invoice {
    _id: string;
    invoiceNumber: string;
    companyId: string | Company;
    total: number;
    status: "draft" | "issued" | "paid" | "overdue" | "cancelled";
    dueDate?: string;
    deletedAt?: string | null;
    createdAt?: string;
    updatedAt?: string;
}

export interface InvoiceResponse {
    success: boolean;
    data: Invoice[];
    total: number;
    count: number;
    stats?: {
        draft: number;
        issued: number;
        paid: number;
        overdue: number;
        cancelled: number;
        total: number;
        totalCollected?: number;
        totalPending?: number;
    };
}

export interface InvoiceSingleResponse {
    success: boolean;
    message?: string;
    data: Invoice;
}

export interface InvoiceDeleteResponse {
    success: boolean;
    message?: string;
    data?: any;
}

// 11. Payment Types
export interface Payment {
    _id: string;
    invoiceId: string | Invoice;
    amount: number;
    method: "bank_transfer" | "card" | "cash" | "other";
    paidAt: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface PaymentResponse {
    success: boolean;
    data: Payment[];
    total: number;
    count: number;
    stats?: {
        total: number;
        totalAmount: number;
        bankTransferCount: number;
        cardCount: number;
        cashCount: number;
    };
}

export interface PaymentSingleResponse {
    success: boolean;
    message?: string;
    data: Payment;
}

export interface PaymentDeleteResponse {
    success: boolean;
    message?: string;
    data?: any;
}

// 12. TrackingEvent Types
export interface TrackingEvent {
    _id: string;
    shipmentId: string | Shipment;
    status: string;
    location?: string;
    occurredAt: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface TrackingEventResponse {
    success: boolean;
    data: TrackingEvent[];
    total: number;
    count: number;
}

export interface TrackingEventSingleResponse {
    success: boolean;
    message?: string;
    data: TrackingEvent;
}

export interface TrackingEventDeleteResponse {
    success: boolean;
    message?: string;
    data?: any;
}

// 13. Notification Types
export interface Notification {
    _id: string;
    recipientType: "company_user" | "user";
    recipientId: string;
    channel: "email" | "sms" | "in_app";
    event: string;
    title: string;
    body: string;
    isRead: boolean;
    sentAt?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface NotificationResponse {
    success: boolean;
    data: Notification[];
    total: number;
    count: number;
    stats?: {
        read: number;
        unread: number;
        total: number;
    };
}

export interface NotificationSingleResponse {
    success: boolean;
    message?: string;
    data: Notification;
}

export interface NotificationDeleteResponse {
    success: boolean;
    message?: string;
    data?: any;
}

// 14. Plan Types
export interface Plan {
    _id: string;
    name: string;
    description?: string;
    price: number;
    billingCycle: "monthly" | "yearly";
    maxOrdersPerMonth: number;
    maxShipmentsPerMonth: number;
    maxCompanyUsers: number;
    features: string[];
    isActive: boolean;
    deletedAt?: string | null;
    createdAt?: string;
    updatedAt?: string;
}

export interface PlanResponse {
    success: boolean;
    data: Plan[];
    total: number;
    count: number;
    stats?: {
        active: number;
        inactive: number;
        total: number;
    };
}

export interface PlanSingleResponse {
    success: boolean;
    message?: string;
    data: Plan;
}

export interface PlanDeleteResponse {
    success: boolean;
    message?: string;
    data?: any;
}

// 15. Subscription Types
export interface Subscription {
    _id: string;
    companyId: string | Company;
    planId: string | Plan;
    startDate: string;
    endDate: string;
    status: "active" | "expired" | "pending_payment" | "cancelled";
    ordersUsedThisMonth: number;
    shipmentsUsedThisMonth: number;
    autoRenew: boolean;
    deletedAt?: string | null;
    createdAt?: string;
    updatedAt?: string;
}

export interface SubscriptionResponse {
    success: boolean;
    data: Subscription[];
    total: number;
    count: number;
    stats?: {
        active: number;
        expired: number;
        pending_payment: number;
        cancelled: number;
        total: number;
    };
}

export interface SubscriptionSingleResponse {
    success: boolean;
    message?: string;
    data: Subscription;
    remainingOrders?: number;
    remainingShipments?: number;
}

export interface SubscriptionDeleteResponse {
    success: boolean;
    message?: string;
    data?: any;
}

// Multi-Tenant Roles & Actions
export type UserRole =
    | "super_admin"
    | "admin"
    | "company_owner"
    | "company_manager"
    | "company_staff"
    | "customer"
    | "super";

export type PermissionAction = "read" | "create" | "update" | "softDelete" | "delete";
