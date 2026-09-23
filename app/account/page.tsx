import { pageMetadata } from "../site-metadata";
import { Account } from "./Account";

export const metadata = {
  ...pageMetadata("Account", "Manage your LionDubai account and plugins.", "account"),
  robots: { index: false, follow: false },
};

export default function AccountPage() {
  return (
    <main id="main-content" className="account-shell shell">
      <Account />
    </main>
  );
}
