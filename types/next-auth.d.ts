import { DefaultSession, DefaultUser } from "next-auth";

export type AuthRole =
  | "super"
  | "admin"
  | "company"
  | "owner"
  | "manager"
  | "staff";

declare module "next-auth" {
  interface Session {
    user: {
      id?: string | null;
      role?: AuthRole;
      companyId?: string;
      logo?: string | null;
      image?: string | null;
      impersonatedBy?: {
        id: string;
        role: string;
      } | null;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    role?: AuthRole;
    companyId?: string;
    logo?: string | null;
    image?: string | null;
    impersonatedBy?: {
      id: string;
      role: string;
    } | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: AuthRole;
    companyId?: string;
    logo?: string | null;
    image?: string | null;
    impersonatedBy?: {
      id: string;
      role: string;
    } | null;
  }
}
