import type { DocumentBase } from "@/client";

export interface UserDocument extends DocumentBase {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  user_type?: "free" | "paid" | "premium_paid";
}

export const userPaymentTypes = [
  { label: "Бесплатный", value: "free" },
  { label: "Оплаченный", value: "paid" },
  { label: "Премиум оплаченный", value: "premium_paid" },
];
