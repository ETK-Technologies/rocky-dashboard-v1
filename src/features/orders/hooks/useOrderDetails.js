"use client";

import { useCallback, useEffect, useState } from "react";
import { orderService } from "../services/orderService";
import { toast } from "react-toastify";

/**
 * Hook for fetching and managing a single order
 * @param {string} orderId - Order identifier
 * @returns {Object} Order state and action handlers
 */
export function useOrderDetails(orderId) {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paymentIntent, setPaymentIntent] = useState(null);

  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [processingRefund, setProcessingRefund] = useState(false);
  const [markingShipped, setMarkingShipped] = useState(false);
  const [capturingPayment, setCapturingPayment] = useState(false);

  const fetchOrder = useCallback(async () => {
    if (!orderId) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await orderService.getById(orderId);
      const orderData =
        response?.order ??
        response?.data ??
        response?.result ??
        response?.payload ??
        response;

      setOrder(orderData);
    } catch (err) {
      const message = err.message || "Failed to load order";
      setError(message);
      toast.error(message);
      console.error("Error loading order:", err);
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  const updateStatus = useCallback(
    async (data) => {
      if (!orderId) return;
      setUpdatingStatus(true);

      try {
        await orderService.updateStatus(orderId, data);
        toast.success("Order status updated successfully");
        await fetchOrder();
      } catch (err) {
        toast.error(err.message || "Failed to update order status");
        console.error("Error updating order status:", err);
        throw err;
      } finally {
        setUpdatingStatus(false);
      }
    },
    [orderId, fetchOrder]
  );

  const processRefund = useCallback(
    async (data) => {
      if (!orderId) return;
      setProcessingRefund(true);

      try {
        await orderService.processRefund(orderId, data);
        toast.success("Refund processed successfully");
        await fetchOrder();
      } catch (err) {
        toast.error(err.message || "Failed to process refund");
        console.error("Error processing refund:", err);
        throw err;
      } finally {
        setProcessingRefund(false);
      }
    },
    [orderId, fetchOrder]
  );

  const markAsShipped = useCallback(
    async (data) => {
      if (!orderId) return;
      setMarkingShipped(true);

      try {
        await orderService.markAsShipped(orderId, data);
        toast.success("Order marked as shipped");
        await fetchOrder();
      } catch (err) {
        toast.error(err.message || "Failed to mark order as shipped");
        console.error("Error marking order as shipped:", err);
        throw err;
      } finally {
        setMarkingShipped(false);
      }
    },
    [orderId, fetchOrder]
  );

  const capturePayment = useCallback(async () => {
    if (!orderId) return;
    setCapturingPayment(true);

    try {
      await orderService.capturePayment(orderId);
      toast.success("Payment captured successfully");
      await fetchOrder();
    } catch (err) {
      toast.error(err.message || "Failed to capture payment");
      console.error("Error capturing payment:", err);
      throw err;
    } finally {
      setCapturingPayment(false);
    }
  }, [orderId, fetchOrder]);

  const fetchPaymentIntent = useCallback(async () => {
    if (!orderId) return;

    try {
      const response = await orderService.getPaymentIntent(orderId);
      setPaymentIntent(
        response?.paymentIntent ||
          response?.data ||
          response?.result ||
          response
      );
      toast.success("Payment intent retrieved");
    } catch (err) {
      toast.error(err.message || "Failed to retrieve payment intent");
      console.error("Error retrieving payment intent:", err);
      throw err;
    }
  }, [orderId]);

  return {
    order,
    loading,
    error,
    refresh: fetchOrder,
    paymentIntent,
    fetchPaymentIntent,
    updateStatus,
    updatingStatus,
    processRefund,
    processingRefund,
    markAsShipped,
    markingShipped,
    capturePayment,
    capturingPayment,
  };
}
