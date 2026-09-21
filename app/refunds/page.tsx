import Link from "next/link";
import { PolicyPage } from "../components/PolicyPage";
import { pageMetadata } from "../site-metadata";

export const metadata = pageMetadata(
  "Refunds",
  "Refunds, free trials and subscription cancellation for LionDubai Interactive.",
  "refunds",
);

export default function RefundsPage() {
  return (
    <PolicyPage
      eyebrow="REFUNDS"
      title="Refunds & cancellation"
      summary="Try a plugin before subscribing. Cancel future renewals whenever you need."
    >
      <section>
        <h2>Refund policy</h2>
        <p>
          Subscription payments are generally non-refundable, except where
          required by applicable law or approved under Paddle&apos;s refund
          policy. Try each plugin free for 24 hours before subscribing.
          Cancellation stops future renewals.
        </p>
        <p>
          Paddle is the merchant of record for purchases processed through
          Paddle. Its{" "}
          <a href="https://www.paddle.com/legal/refund-policy">refund policy</a>{" "}
          and <a href="https://www.paddle.com/legal/buyer-terms">buyer terms</a>{" "}
          apply. Nothing in this policy limits your mandatory consumer rights,
          including applicable rights relating to faulty or misdescribed
          products. Completing a free trial does not remove those rights.
        </p>
      </section>
      <section>
        <h2>Free trials</h2>
        <p>
          Each LionDubai account can activate one free 24-hour trial per plugin.
          A trial requires no payment card and does not become a paid
          subscription automatically. Expiry or cancellation does not reset a
          previously used trial.
        </p>
      </section>
      <section>
        <h2>Cancellation</h2>
        <p>
          Use the Manage subscription link in your Paddle receipt or visit
          <a href="https://paddle.net"> Paddle support</a> to cancel.
          Cancellation prevents the next renewal; access continues until the
          current paid period ends. Cancellation does not itself refund a past
          payment.
        </p>
      </section>
      <section>
        <h2>Problems and refund requests</h2>
        <p>
          For a technical problem,{" "}
          <Link href="/contact">contact LionDubai</Link> so we can help. For a
          billing issue or refund request, use the support link in your receipt
          or visit <a href="https://paddle.net">paddle.net</a>. Paddle assesses
          eligibility under its policy and applicable law. An approved full
          refund removes access granted by the refunded payment.
        </p>
        <p>
          Fraud and refund abuse are handled under Paddle&apos;s policy. This
          does not prevent legitimate refund requests or lawful payment
          disputes.
        </p>
      </section>
      <section>
        <h2>Current availability</h2>
        <p>
          Public purchases are not available yet. Payment testing uses Paddle
          Sandbox and does not charge real money.
        </p>
      </section>
    </PolicyPage>
  );
}
