# 📦 Shahntak

**Shahntak** is a multi-tenant **B2B SaaS logistics management platform** designed for shipping companies and logistics providers in Saudi Arabia and the region.

It provides a complete workflow for managing logistics operations — from creating orders and grouping them into shipments to route management, tracking, invoicing, and waybill generation.

---

## ✨ Features

* 📦 **Order & Shipment Management** — Create, manage, and group orders into shipments.
* 🚚 **Routes, Carriers & Vehicles** — Manage logistics routes, carriers, trucks, and fleet operations.
* 💰 **Financial Management** — Automated shipment pricing, invoices, payments, discounts, and financial tracking.
* 📍 **Shipment Tracking** — Track shipments and record real-time tracking events and status updates.
* 📄 **Invoices & Waybills** — Generate professional invoices and shipping waybills as PDF documents.
* 🏢 **Multi-Company Architecture** — Secure multi-tenant environment for managing multiple companies.
* 📊 **Reports & Analytics** — Monitor operations, financial performance, and logistics statistics.
* 📥 **Bulk Import** — Import orders and shipments using `.xlsx` and `.csv` files.
* 🔐 **Role-Based Access Control** — Separate permissions for platform administrators and company users.
* 🔔 **Notifications** — Centralized system notifications for important operational events.
* 🌐 **Arabic RTL Interface** — Built primarily for Arabic-speaking logistics teams.

---

## 🧠 Core Business Logic

Shahntak is built around four main entities:

**Order → Shipment → Route → Invoice**

* **Order** — An individual shipping order.
* **Shipment** — A shipment containing one or multiple orders.
* **Route** — Defines the logistics route, transportation details, and route cost.
* **Invoice** — The financial document associated with the shipment.

### Shipment Pricing

The shipment price is automatically calculated as:

```text
Total Orders Amount + Route Shipping Cost
```

Manual price and discount modifications are restricted to the **Invoice** module to maintain financial integrity across the system.

---

## 🏗️ Architecture

The project follows a modular architecture built around:

```text
Next.js App Router
        │
        ├── Components
        ├── React Query Hooks
        ├── API Services
        ├── API Routes
        ├── Validation Layer
        ├── Mongoose Models
        └── MongoDB
```

The application uses a clear separation between UI components, data-fetching hooks, API services, validation schemas, and database models.

---

## 🛠️ Tech Stack

### Frontend

* Next.js 16.3.1
* React 19.2.8
* TypeScript 5
* Tailwind CSS v4
* React Icons
* React Hook Form
* Zod

### Backend

* Next.js API Routes
* MongoDB
* Mongoose 9.9.3
* NextAuth.js 4.24.15
* JWT Authentication
* Bcrypt.js

### Data & Utilities

* TanStack React Query v5
* Axios
* Cloudinary
* `@react-pdf/renderer`

---

## 📁 Project Structure

```text
shahntak/
│
├── app/
│   ├── admin/
│   │   ├── (pages)/
│   │   │   ├── companies/
│   │   │   ├── invoices/
│   │   │   ├── orders/
│   │   │   ├── reports/
│   │   │   ├── routes/
│   │   │   └── settings/
│   │   ├── layout.tsx
│   │   └── page.tsx
│   │
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
│
├── components/
│   ├── admin/
│   │   ├── layout/
│   │   └── ...
│   ├── home/
│   └── ui/
│
├── hooks/
│   └── users/
│
├── lib/
│   ├── authOptions.ts
│   ├── mongodb.ts
│   └── validations/
│
├── models/
│
├── services/
│   ├── carriers/
│   ├── companies/
│   ├── companyUsers/
│   ├── invoices/
│   ├── notifications/
│   ├── orders/
│   ├── payments/
│   ├── routes/
│   ├── shipments/
│   ├── trackingEvents/
│   ├── users/
│   ├── vehicles/
│   └── waybills/
│
├── types/
│   └── data.ts
│
└── package.json
```

---

## 🗄️ Main Data Models

| Model           | Description                                      |
| --------------- | ------------------------------------------------ |
| `Company`       | Shipping and logistics companies                 |
| `CompanyUser`   | Users and employees belonging to companies       |
| `User`          | Platform users / Super Admins                    |
| `Order`         | Individual shipping orders                       |
| `Shipment`      | Grouped shipping orders                          |
| `Carrier`       | Contracted carriers and transportation companies |
| `Vehicle`       | Trucks and fleet vehicles                        |
| `Route`         | Logistics routes and route pricing               |
| `Waybill`       | Official shipping waybills                       |
| `Invoice`       | Financial invoices                               |
| `Payment`       | Payment transactions                             |
| `TrackingEvent` | Shipment tracking history                        |
| `Notification`  | System notifications                             |

---

## 🔐 Security & Data Integrity

Shahntak implements strict referential integrity across the application.

Referenced IDs are validated through:

1. MongoDB ObjectId structure validation.
2. Database existence checks.
3. Active-record validation.
4. Zod validation for required fields.
5. Role-based access control.
6. Multi-company data isolation.

The system also prevents unauthorized price manipulation outside the invoice workflow.

---

## 📥 Bulk Import

Shahntak supports bulk data import through:

* `.xlsx`
* `.csv`

Supported imports include:

* Orders
* Shipments

The import system automatically handles:

* Validation
* Route matching
* Pricing
* Shipment grouping
* Sequential numbering
* Form reset after successful import

---

## 🔢 Sequential Numbering

Orders and shipments use a standardized sequential numbering system:

```text
ORD-0001
ORD-0002
ORD-0003

SHP-0001
SHP-0002
SHP-0003
```

The numbering system is shared across individual creation, bulk imports, company dashboards, and admin dashboards.

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone <repository-url>
cd shahntak
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env.local` file:

```env
MONGODB_URI=
NEXTAUTH_SECRET=
NEXTAUTH_URL=

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

Fill in the required values before running the application.

### 4. Run the development server

```bash
npm run dev
```

The application will be available at:

```text
http://localhost:3000
```

---

## 🧪 Available Scripts

```bash
# Development
npm run dev

# Production build
npm run build

# Start production server
npm run start

# Lint
npm run lint

# Type checking
npx tsc --noEmit
```

---

## 🔑 Demo Accounts

> Use these credentials to access the demo environment.

### 👨‍💼 Admin Account

```text
Email:
Password:
```

### 🏢 Company Account

```text
Email:
Password:
```

---

## 📊 Project Status

The core platform architecture and major operational modules have been implemented.

Current capabilities include:

* Multi-company management
* Order management
* Shipment management
* Route management
* Carrier management
* Vehicle management
* Invoice management
* Waybill generation
* Payment management
* Shipment tracking
* Notifications
* Reports & analytics
* Bulk Excel/CSV imports
* Authentication & authorization
* Financial price governance

Production build and TypeScript validation have been successfully completed.

---

## 🎯 Project Goals

Shahntak aims to provide logistics companies with a centralized platform that reduces manual work, improves operational visibility, and provides stronger financial and data control.

The platform is designed to scale from individual logistics operations to multi-company environments with complex shipping workflows.

---

## 👨‍💻 Development

Built with ❤️ using **Next.js, TypeScript, MongoDB, and modern web technologies**.

**Shahntak — Simplifying Logistics Operations.**
