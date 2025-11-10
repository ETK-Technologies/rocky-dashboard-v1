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
  const [doctorOptions, setDoctorOptions] = useState([]);
  const [doctorOptionsLoaded, setDoctorOptionsLoaded] = useState(false);

  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [processingRefund, setProcessingRefund] = useState(false);
  const [markingShipped, setMarkingShipped] = useState(false);
  const [capturingPayment, setCapturingPayment] = useState(false);
  const [assigningDoctor, setAssigningDoctor] = useState(false);
  const [loadingDoctorOptions, setLoadingDoctorOptions] = useState(false);

  const normalizeDoctorOptions = useCallback((orderData) => {
    if (!orderData) {
      setDoctorOptions([]);
      return;
    }

    const possibleOptions =
      orderData.doctorOptions ??
      orderData.availableDoctors ??
      orderData.assignableDoctors ??
      orderData.doctors ??
      orderData.doctorList ??
      orderData.providers ??
      [];

    if (Array.isArray(possibleOptions)) {
      setDoctorOptions(possibleOptions);
      return;
    }

    if (Array.isArray(possibleOptions?.items)) {
      setDoctorOptions(possibleOptions.items);
      return;
    }

    setDoctorOptions([]);
  }, []);

  const fetchOrder = useCallback(async () => {
    if (!orderId) {
      return;
    }

    setLoading(true);
    setDoctorOptionsLoaded(false);
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
      normalizeDoctorOptions(orderData);
    } catch (err) {
      const message = err.message || "Failed to load order";
      setError(message);
      toast.error(message);
      console.error("Error loading order:", err);
    } finally {
      setLoading(false);
    }
  }, [orderId, normalizeDoctorOptions]);

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

  const addOrderNote = useCallback(
    async (data) => {
      if (!orderId) return;

      try {
        await orderService.addOrderNote(orderId, data);
        toast.success("Order note added successfully");
        await fetchOrder();
      } catch (err) {
        toast.error(err.message || "Failed to add order note");
        console.error("Error adding order note:", err);
        throw err;
      }
    },
    [orderId, fetchOrder]
  );

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

  const fetchDoctorOptions = useCallback(async (search) => {
    setLoadingDoctorOptions(true);
    try {
      const response = await orderService.getDoctorOptions(
        search ? { search } : undefined
      );
      const options =
        response?.doctorOptions ??
        response?.data ??
        response?.result ??
        response?.payload ??
        response;

      if (Array.isArray(options)) {
        setDoctorOptions(options);
        setDoctorOptionsLoaded(true);
        return options;
      }

      if (Array.isArray(response?.doctors)) {
        setDoctorOptions(response.doctors);
        setDoctorOptionsLoaded(true);
        return response.doctors;
      }

      setDoctorOptions([]);
      setDoctorOptionsLoaded(true);
      return [];
    } catch (err) {
      toast.error(err.message || "Failed to load doctor options");
      console.error("Error loading doctor options:", err);
      throw err;
    } finally {
      setLoadingDoctorOptions(false);
    }
  }, []);

  const assignDoctor = useCallback(
    async (doctorId) => {
      if (!orderId) return;
      setAssigningDoctor(true);

      try {
        await orderService.assignDoctor(orderId, doctorId || null);
        toast.success("Assigned doctor updated successfully");
        await fetchOrder();
      } catch (err) {
        toast.error(err.message || "Failed to update assigned doctor");
        console.error("Error updating assigned doctor:", err);
        throw err;
      } finally {
        setAssigningDoctor(false);
      }
    },
    [orderId, fetchOrder]
  );

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
    doctorOptions,
    doctorOptionsLoaded,
    fetchDoctorOptions,
    loadingDoctorOptions,
    assignDoctor,
    assigningDoctor,
    addOrderNote,
  };
}
