import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import api from "../api/client.jsx";
import { loadRazorpayScript } from "../utils/loadRazorpay.js";

function formatMoney(amount) {
  if (amount === null || amount === undefined) {
    return "₹0.00";
  }

  return `₹${Number(amount).toFixed(2)}`;
}

function getPaymentStatusLabel(status) {
  switch (status) {
    case "PENDING":
      return "Payment pending";

    case "HELD":
      return "Payment secured";

    case "RELEASED":
      return "Payment released";

    case "FAILED":
      return "Payment failed";

    case "DISPUTED":
      return "Payment disputed";

    case "REFUNDED":
      return "Payment refunded";

    default:
      return "Payment not created";
  }
}

export default function Payment() {
  const { taskId } = useParams();

  const [task, setTask] = useState(null);

  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function fetchTask() {
    setLoading(true);
    setError("");

    try {
      const response = await api.get(`/tasks/${taskId}`);

      setTask(response.data.data);
    } catch (error) {
      setError(
        error.response?.data?.message || "Unable to load payment details.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchTask();
  }, [taskId]);

  async function handlePayment() {
    setPaymentLoading(true);
    setError("");
    setSuccess("");

    try {
      const scriptLoaded = await loadRazorpayScript();

      if (!scriptLoaded) {
        throw new Error("Razorpay checkout could not be loaded.");
      }

      const response = await api.post(`/payments/tasks/${taskId}/order`);

      const data = response.data.data;

      const payment = data.payment;
      const razorpayOrder = data.razorpayOrder;
      const keyId = data.keyId;

      if (!payment || !razorpayOrder || !keyId) {
        throw new Error("Invalid payment order response.");
      }

      const options = {
        key: keyId,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,

        name: "HEREPHERI",

        description: task.title,

        order_id: razorpayOrder.id,

        handler: async function (razorpayResponse) {
          try {
            setPaymentLoading(true);
            setError("");

            await api.post(`/payments/${payment.id}/verify`, {
              razorpayOrderId: razorpayResponse.razorpay_order_id,

              razorpayPaymentId: razorpayResponse.razorpay_payment_id,

              razorpaySignature: razorpayResponse.razorpay_signature,
            });

            setSuccess("Payment completed successfully.");

            /*
              Reload task so that the UI immediately
              sees payment.status = HELD.
            */
            await fetchTask();
          } catch (error) {
            setError(
              error.response?.data?.message || "Payment verification failed.",
            );
          } finally {
            setPaymentLoading(false);
          }
        },

        modal: {
          ondismiss: () => {
            setPaymentLoading(false);
          },
        },

        prefill: {
          name: "",
          email: "",
          contact: "",
        },

        notes: {
          taskId,
          paymentId: payment.id,
        },

        theme: {
          color: "#17202a",
        },
      };

      const razorpay = new window.Razorpay(options);

      razorpay.on("payment.failed", function (response) {
        setError(response.error?.description || "Payment failed.");

        setPaymentLoading(false);
      });

      razorpay.open();
    } catch (error) {
      setError(
        error.response?.data?.message ||
          error.message ||
          "Unable to start payment.",
      );

      setPaymentLoading(false);
    }
  }

  if (loading) {
    return <div className="empty-state">Loading payment details...</div>;
  }

  if (!task) {
    return (
      <div className="empty-state">
        <h3>Task unavailable</h3>

        <p>{error || "Unable to load task."}</p>

        <Link to="/tasks" className="primary-button">
          Back to tasks
        </Link>
      </div>
    );
  }

  const payment = task.payment;

  /*
    Payment can only be initiated when:
    - task is assigned/in progress
    - payment doesn't exist yet
  */
  const canPay = ["ASSIGNED", "IN_PROGRESS"].includes(task.status) && !payment;

  return (
    <div className="page-container">
      <Link to={`/tasks/${taskId}`} className="back-link">
        ← Back to task
      </Link>

      <div className="payment-page">
        <div className="payment-card">
          <p className="eyebrow">SECURE PAYMENT</p>

          <h1>
            {payment ? getPaymentStatusLabel(payment.status) : "Fund this task"}
          </h1>

          <p className="page-description">
            {payment?.status === "HELD"
              ? "Your payment has been secured. The Executor can now start working on the task."
              : payment?.status === "RELEASED"
                ? "The task was completed and the Executor's earnings have been released."
                : "Your payment is held by HEREPHERI until the task reaches the appropriate completion stage."}
          </p>

          <div className="payment-task-summary">
            <div>
              <span>Task</span>

              <strong>{task.title}</strong>
            </div>

            <div>
              <span>Task reward</span>

              <strong>{formatMoney(task.reward_amount)}</strong>
            </div>

            <div>
              <span>Platform fee</span>

              <strong>
                {payment ? formatMoney(payment.platform_fee) : "10%"}
              </strong>
            </div>

            <div>
              <span>Total paid</span>

              <strong>
                {payment
                  ? formatMoney(payment.gross_amount)
                  : formatMoney(Number(task.reward_amount) * 1.1)}
              </strong>
            </div>

            <div>
              <span>Task status</span>

              <strong>{task.status}</strong>
            </div>

            <div>
              <span>Payment status</span>

              <strong>{payment ? payment.status : "NOT FUNDED"}</strong>
            </div>
          </div>

          {payment?.status === "HELD" && (
            <div className="payment-note">
              <span>✓</span>

              <p>
                Your payment is secured. The Executor can now begin the task.
              </p>
            </div>
          )}

          {payment?.status === "RELEASED" && (
            <div className="payment-note">
              <span>✓</span>

              <p>
                {formatMoney(payment.executor_amount)} has been released to the
                Executor.
              </p>
            </div>
          )}

          {!payment && (
            <div className="payment-note">
              <span>✓</span>

              <p>
                The final amount is calculated by the backend. Do not modify
                payment amounts in the frontend.
              </p>
            </div>
          )}

          {error && <div className="error-message">{error}</div>}

          {success && <div className="success-message">{success}</div>}

          {canPay && (
            <button
              className="primary-button payment-button"
              onClick={handlePayment}
              disabled={paymentLoading}
            >
              {paymentLoading ? "Processing..." : "Pay & Fund Task"}
            </button>
          )}

          {payment?.status === "HELD" && (
            <div className="success-message">
              ✓ Already funded — no further payment is required.
            </div>
          )}

          {payment?.status === "RELEASED" && (
            <Link
              to={`/tasks/${taskId}`}
              className="primary-button payment-button"
            >
              View Completed Task
            </Link>
          )}

          {payment?.status === "FAILED" && (
            <div className="error-message">
              This payment failed. Please contact support before creating
              another payment.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
