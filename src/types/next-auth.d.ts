import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "SUPERADMIN" | "ADMIN" | "EDITOR" | "CLIENT";
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: "SUPERADMIN" | "ADMIN" | "EDITOR" | "CLIENT";
  }
}
