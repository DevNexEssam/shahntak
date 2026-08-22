import { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id?: string | null;
      role?: "admin" | "clinic" | "doctor" | "super" | "reception" | "manager" | "worker" | "patient";
      clinicId?: string;
      branchId?: string;
      doctorId?: string;
      logo?: string | null;
      image?: string | null;
      impersonatedBy?: {
        id: string;
        role: "admin" | "super";
      } | null;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    role?: "admin" | "clinic" | "doctor" | "super" | "reception" | "manager" | "worker" | "patient";
    clinicId?: string;
    branchId?: string;
    doctorId?: string;
    logo?: string | null;
    image?: string | null;
    impersonatedBy?: {
      id: string;
      role: "admin" | "super";
    } | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: "admin" | "clinic" | "doctor" | "super" | "reception" | "manager" | "worker" | "patient";
    clinicId?: string;
    branchId?: string;
    doctorId?: string;
    logo?: string | null;
    image?: string | null;
    impersonatedBy?: {
      id: string;
      role: "admin" | "super";
    } | null;
  }
}
