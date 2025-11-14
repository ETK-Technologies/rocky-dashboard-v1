"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";
import {
  CustomButton,
  PageContainer,
  PageHeader,
  CustomCard,
  CustomCardContent,
  CustomCardHeader,
  CustomCardTitle,
  FormField,
  CustomLabel,
  CustomInput,
  LoadingState,
  ErrorState,
} from "@/components/ui";
import { useCouponForm } from "../hooks/useCouponForm";
import { useCoupon } from "../hooks/useCoupon";
import { cn } from "@/utils/cn";

const COUPON_TYPES = [
  { value: "PERCENTAGE", label: "Percentage" },
  { value: "FIXED_AMOUNT", label: "Fixed Amount" },
];

export default function CouponForm({ couponId = null }) {
  const router = useRouter();
  const isEditMode = !!couponId;
  const { coupon, loading: fetchLoading, fetchCoupon } = useCoupon(couponId);
  const { loading, error, submitForm } = useCouponForm(null, (data) => {
    router.push("/dashboard/coupons");
  });

  // Form state
  const [formValues, setFormValues] = useState({
    code: "",
    name: "",
    description: "",
    type: "PERCENTAGE",
    value: "",
    minimumAmount: "",
    maximumDiscount: "",
    usageLimit: "",
    usageLimitPerUser: "",
    validFrom: "",
    validUntil: "",
    isActive: true,
    wordpressId: "",
  });
  const [errors, setErrors] = useState({});

  // Load coupon data in edit mode
  useEffect(() => {
    if (isEditMode && couponId) {
      fetchCoupon();
    }
  }, [isEditMode, couponId, fetchCoupon]);

  useEffect(() => {
    if (coupon && isEditMode) {
      const formatDate = (dateString) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        return date.toISOString().slice(0, 16); // Format: YYYY-MM-DDTHH:mm
      };

      setFormValues({
        code: coupon.code || "",
        name: coupon.name || "",
        description: coupon.description || "",
        type: coupon.type || "PERCENTAGE",
        value: coupon.value || "",
        minimumAmount: coupon.minimumAmount || "",
        maximumDiscount: coupon.maximumDiscount || "",
        usageLimit: coupon.usageLimit?.toString() || "",
        usageLimitPerUser: coupon.usageLimitPerUser?.toString() || "",
        validFrom: formatDate(coupon.validFrom),
        validUntil: formatDate(coupon.validUntil),
        isActive: coupon.isActive ?? true,
        wordpressId: coupon.wordpressId?.toString() || "",
      });
    }
  }, [coupon, isEditMode]);

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? checked : value;

    setFormValues((prev) => ({
      ...prev,
      [name]: newValue,
    }));

    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formValues.code.trim()) {
      newErrors.code = "Code is required";
    }

    if (!formValues.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formValues.type) {
      newErrors.type = "Type is required";
    }

    if (!formValues.value || parseFloat(formValues.value) <= 0) {
      newErrors.value = "Value must be greater than 0";
    }

    if (formValues.minimumAmount && parseFloat(formValues.minimumAmount) < 0) {
      newErrors.minimumAmount = "Minimum amount cannot be negative";
    }

    if (
      formValues.maximumDiscount &&
      parseFloat(formValues.maximumDiscount) < 0
    ) {
      newErrors.maximumDiscount = "Maximum discount cannot be negative";
    }

    if (formValues.usageLimit && parseInt(formValues.usageLimit) < 0) {
      newErrors.usageLimit = "Usage limit cannot be negative";
    }

    if (
      formValues.usageLimitPerUser &&
      parseInt(formValues.usageLimitPerUser) < 0
    ) {
      newErrors.usageLimitPerUser = "Usage limit per user cannot be negative";
    }

    if (!formValues.validFrom) {
      newErrors.validFrom = "Valid from date is required";
    }

    if (!formValues.validUntil) {
      newErrors.validUntil = "Valid until date is required";
    }

    if (formValues.validFrom && formValues.validUntil) {
      const fromDate = new Date(formValues.validFrom);
      const untilDate = new Date(formValues.validUntil);
      if (untilDate <= fromDate) {
        newErrors.validUntil = "Valid until must be after valid from";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      // Prepare form values
      const submitData = {
        code: formValues.code.trim().toUpperCase(),
        name: formValues.name.trim(),
        description: formValues.description.trim() || null,
        type: formValues.type,
        value: parseFloat(formValues.value),
        minimumAmount: formValues.minimumAmount
          ? parseFloat(formValues.minimumAmount)
          : null,
        maximumDiscount: formValues.maximumDiscount
          ? parseFloat(formValues.maximumDiscount)
          : null,
        usageLimit: formValues.usageLimit
          ? parseInt(formValues.usageLimit)
          : null,
        usageLimitPerUser: formValues.usageLimitPerUser
          ? parseInt(formValues.usageLimitPerUser)
          : null,
        validFrom: new Date(formValues.validFrom).toISOString(),
        validUntil: new Date(formValues.validUntil).toISOString(),
        isActive: formValues.isActive,
        wordpressId: formValues.wordpressId
          ? parseInt(formValues.wordpressId)
          : null,
      };

      await submitForm(submitData, couponId);
    } catch (error) {
      // Error is already handled in the hook
    }
  };

  // Show loading state
  if (fetchLoading && isEditMode) {
    return (
      <PageContainer>
        <LoadingState message="Loading coupon..." loading={fetchLoading || loading} fullScreen={true} />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title={isEditMode ? "Edit Coupon" : "Create Coupon"}
        description={
          isEditMode
            ? "Update coupon information"
            : "Create a new discount coupon"
        }
        action={
          <CustomButton
            variant="outline"
            onClick={() => router.push("/dashboard/coupons")}
            className="flex items-center gap-2"
            size="sm"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Back to Coupons</span>
            <span className="sm:hidden">Back</span>
          </CustomButton>
        }
      />

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <CustomCard>
              <CustomCardHeader>
                <CustomCardTitle>Basic Information</CustomCardTitle>
              </CustomCardHeader>
              <CustomCardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      id="code"
                      name="code"
                      label="Coupon Code"
                      value={formValues.code}
                      onChange={handleInputChange}
                      error={errors.code}
                      required
                      placeholder="WELCOME20"
                      helperText="Unique coupon code (uppercase, no spaces)"
                    />

                    <FormField
                      id="name"
                      name="name"
                      label="Name"
                      value={formValues.name}
                      onChange={handleInputChange}
                      error={errors.name}
                      required
                      placeholder="Welcome 20% Off"
                    />
                  </div>

                  <FormField
                    id="description"
                    name="description"
                    label="Description"
                    value={formValues.description}
                    onChange={handleInputChange}
                    error={errors.description}
                    placeholder="Get 20% off on your first order"
                    helperText="Optional description of the coupon"
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <CustomLabel htmlFor="type">
                        Type <span className="text-red-600">*</span>
                      </CustomLabel>
                      <select
                        id="type"
                        name="type"
                        value={formValues.type}
                        onChange={handleInputChange}
                        className={cn(
                          "flex h-10 w-full rounded-md border px-3 py-2 text-sm transition-colors",
                          "bg-white text-gray-900 border-gray-300",
                          "placeholder:text-gray-500",
                          "dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600",
                          "dark:placeholder:text-gray-400",
                          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
                          "focus-visible:ring-blue-500 dark:focus-visible:ring-blue-400",
                          "focus-visible:border-blue-500 dark:focus-visible:border-blue-400",
                          "disabled:cursor-not-allowed disabled:opacity-50",
                          "disabled:bg-gray-100 dark:disabled:bg-gray-900",
                          errors.type && "border-red-500 dark:border-red-400",
                          errors.type && "focus-visible:ring-red-500 dark:focus-visible:ring-red-400"
                        )}
                      >
                        {COUPON_TYPES.map((type) => (
                          <option key={type.value} value={type.value} className="bg-white text-gray-900 dark:bg-gray-800 dark:text-gray-100">
                            {type.label}
                          </option>
                        ))}
                      </select>
                      {errors.type && (
                        <p className="text-sm text-red-600 dark:text-red-400">{errors.type}</p>
                      )}
                    </div>

                    <FormField
                      id="value"
                      name="value"
                      label={formValues.type === "PERCENTAGE" ? "Percentage (%)" : "Amount ($)"}
                      type="number"
                      step={formValues.type === "PERCENTAGE" ? "0.01" : "0.01"}
                      min="0"
                      value={formValues.value}
                      onChange={handleInputChange}
                      error={errors.value}
                      required
                      placeholder={formValues.type === "PERCENTAGE" ? "10" : "20"}
                    />
                  </div>
                </div>
              </CustomCardContent>
            </CustomCard>

            {/* Discount Rules */}
            <CustomCard>
              <CustomCardHeader>
                <CustomCardTitle>Discount Rules</CustomCardTitle>
              </CustomCardHeader>
              <CustomCardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      id="minimumAmount"
                      name="minimumAmount"
                      label="Minimum Amount"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formValues.minimumAmount}
                      onChange={handleInputChange}
                      error={errors.minimumAmount}
                      placeholder="50"
                      helperText="Minimum order amount to use this coupon"
                    />

                    {formValues.type === "PERCENTAGE" && (
                      <FormField
                        id="maximumDiscount"
                        name="maximumDiscount"
                        label="Maximum Discount"
                        type="number"
                        step="0.01"
                        min="0"
                        value={formValues.maximumDiscount}
                        onChange={handleInputChange}
                        error={errors.maximumDiscount}
                        placeholder="100"
                        helperText="Maximum discount amount (for percentage coupons)"
                      />
                    )}
                  </div>
                </div>
              </CustomCardContent>
            </CustomCard>

            {/* Usage Limits */}
            <CustomCard>
              <CustomCardHeader>
                <CustomCardTitle>Usage Limits</CustomCardTitle>
              </CustomCardHeader>
              <CustomCardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      id="usageLimit"
                      name="usageLimit"
                      label="Total Usage Limit"
                      type="number"
                      min="0"
                      value={formValues.usageLimit}
                      onChange={handleInputChange}
                      error={errors.usageLimit}
                      placeholder="1000"
                      helperText="Maximum number of times this coupon can be used (leave empty for unlimited)"
                    />

                    <FormField
                      id="usageLimitPerUser"
                      name="usageLimitPerUser"
                      label="Usage Limit Per User"
                      type="number"
                      min="0"
                      value={formValues.usageLimitPerUser}
                      onChange={handleInputChange}
                      error={errors.usageLimitPerUser}
                      placeholder="1"
                      helperText="Maximum number of times a single user can use this coupon (leave empty for unlimited)"
                    />
                  </div>
                </div>
              </CustomCardContent>
            </CustomCard>

            {/* Validity Period */}
            <CustomCard>
              <CustomCardHeader>
                <CustomCardTitle>Validity Period</CustomCardTitle>
              </CustomCardHeader>
              <CustomCardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      id="validFrom"
                      name="validFrom"
                      label="Valid From"
                      type="datetime-local"
                      value={formValues.validFrom}
                      onChange={handleInputChange}
                      error={errors.validFrom}
                      required
                    />

                    <FormField
                      id="validUntil"
                      name="validUntil"
                      label="Valid Until"
                      type="datetime-local"
                      value={formValues.validUntil}
                      onChange={handleInputChange}
                      error={errors.validUntil}
                      required
                    />
                  </div>
                </div>
              </CustomCardContent>
            </CustomCard>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status */}
            <CustomCard>
              <CustomCardHeader>
                <CustomCardTitle>Status</CustomCardTitle>
              </CustomCardHeader>
              <CustomCardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="isActive"
                      name="isActive"
                      checked={formValues.isActive}
                      onChange={handleInputChange}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <CustomLabel htmlFor="isActive">Active</CustomLabel>
                  </div>
                  <p className="text-sm text-gray-600">
                    Only active coupons can be used by customers.
                  </p>
                </div>
              </CustomCardContent>
            </CustomCard>

            {/* WordPress Integration */}
            <CustomCard>
              <CustomCardHeader>
                <CustomCardTitle>WordPress Integration</CustomCardTitle>
              </CustomCardHeader>
              <CustomCardContent>
                <FormField
                  id="wordpressId"
                  name="wordpressId"
                  label="WordPress ID"
                  type="number"
                  value={formValues.wordpressId}
                  onChange={handleInputChange}
                  error={errors.wordpressId}
                  placeholder="123"
                  helperText="Optional WordPress coupon ID for synchronization"
                />
              </CustomCardContent>
            </CustomCard>
          </div>
        </div>

        {/* Form Actions */}
        <div className="mt-6 flex items-center justify-end gap-4">
          <CustomButton
            type="button"
            variant="outline"
            onClick={() => router.push("/dashboard/coupons")}
          >
            Cancel
          </CustomButton>
          <CustomButton type="submit" disabled={loading}>
            {loading ? (
              <>
                <span className="mr-2">Saving...</span>
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                {isEditMode ? "Update Coupon" : "Create Coupon"}
              </>
            )}
          </CustomButton>
        </div>
      </form>
    </PageContainer>
  );
}

