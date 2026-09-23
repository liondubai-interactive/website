import { pageMetadata } from "../site-metadata";
import { LoginForm } from "./LoginForm";

export const metadata = {
  ...pageMetadata("Sign in", "Sign in to your LionDubai account with TikTok.", "login"),
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <main id="main-content" className="login-shell shell">
      <LoginForm />
    </main>
  );
}
