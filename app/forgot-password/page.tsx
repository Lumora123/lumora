import type { Metadata } from "next";
import AuthLayout from "@/components/auth/AuthLayout";
import ForgotForm from "@/components/auth/ForgotForm";

export const metadata: Metadata = {
  title: "Reset Password",
  description: "Reset your Lumora account password.",
  robots: { index: false },
};

export default function ForgotPasswordPage() {
  return (
    <AuthLayout
      heading="Reset password"
      sub="We'll send you a secure link to choose a new password."
      asideSeed="auth-reset"
    >
      <ForgotForm />
    </AuthLayout>
  );
}
