/** Serialisable user shape passed from server → client via loader */
export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: "customer" | "admin";
  avatarUrl: string | null;
}
