import type { Metadata } from "next";
import AuthLayout from "@/components/auth/AuthLayout";
import LoginForm from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to Lumora to sync your watchlist, continue-watching progress and recommendations.",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <AuthLayout heading="Welcome back" sub="Sign in to pick up exactly where you left off.">
      <LoginForm />
    </AuthLayout>
  );
}
