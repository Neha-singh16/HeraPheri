import { useEffect, useState } from "react";

import { Link, useNavigate, useParams } from "react-router-dom";

import api from "../api/client.jsx";

import { loadRazorpayScript } from "../utils/loadRazorpay.js";

export default function Payment() {
  const { taskId } = useParams();

  const navigate = useNavigate();

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
      setError(error.response?.data?.message || "Unable to load task.");
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

      // Create our internal payment + Razorpay order.
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

            /*
                Browser receives Razorpay result.

                We still send these values to our
                backend, where the Razorpay signature
                is verified server-side.
              */
            await api.post(`/payments/${payment.id}/verify`, {
              razorpayOrderId: razorpayResponse.razorpay_order_id,

              razorpayPaymentId: razorpayResponse.razorpay_payment_id,

              razorpaySignature: razorpayResponse.razorpay_signature,
            });

            setSuccess("Payment completed successfully.");
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

  const canPay = task.status === "ASSIGNED" || task.status === "IN_PROGRESS";

  return (
    <div className="page-container">
      <Link to={`/tasks/${taskId}`} className="back-link">
        ← Back to task
      </Link>

      <div className="payment-page">
        <div className="payment-card">
          <p className="eyebrow">SECURE PAYMENT</p>

          <h1>Fund this task</h1>

          <p className="page-description">
            Your payment is held by HEREPHERI until the task reaches the
            appropriate completion stage.
          </p>

          <div className="payment-task-summary">
            <div>
              <span>Task</span>

              <strong>{task.title}</strong>
            </div>

            <div>
              <span>Task reward</span>

              <strong>₹{task.reward_amount}</strong>
            </div>

            <div>
              <span>Platform fee</span>

              <strong>10%</strong>
            </div>

            <div>
              <span>Status</span>

              <strong>{task.status}</strong>
            </div>
          </div>

          <div className="payment-note">
            <span>✓</span>

            <p>
              The final amount is calculated by the backend. Do not modify
              payment amounts in the frontend.
            </p>
          </div>

          {error && <div className="error-message">{error}</div>}

          {success && <div className="success-message">{success}</div>}

          {canPay ? (
            <button
              className="primary-button payment-button"
              onClick={handlePayment}
              disabled={paymentLoading}
            >
              {paymentLoading ? "Processing..." : "Pay & Fund Task"}
            </button>
          ) : (
            <div className="empty-state">
              <h3>Payment unavailable</h3>

              <p>
                Payment can only be created after the task has been assigned.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
