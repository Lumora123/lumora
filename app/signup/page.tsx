import type { Metadata } from "next";
import AuthLayout from "@/components/auth/AuthLayout";
import SignupForm from "@/components/auth/SignupForm";

export const metadata: Metadata = {
  title: "Create Account",
  description: "Create a free Lumora account — watchlists, resume playback and personalized recommendations.",
  robots: { index: false },
};

export default function SignupPage() {
  return (
    <AuthLayout
      heading="Join Lumora"
      sub="Free forever in this showcase. No payments, no ads — just cinema."
      asideSeed="auth-signup"
    >
      <SignupForm />
    </AuthLayout>
  );
}
