"use client";

import { useEffect, useState } from "react";
import { CustomButton } from "@/components/ui/CustomButton";
import { CustomCard, CustomCardContent } from "@/components/ui/CustomCard";
import { CustomInput } from "@/components/ui/CustomInput";
import { CustomLabel } from "@/components/ui/CustomLabel";
import { cn } from "@/utils/cn";

const defaultValues = {
  search: "",
  actorId: "",
  action: "",
  scope: "",
  status: "",
  targetType: "",
  targetId: "",
  dateFrom: "",
  dateTo: "",
  limit: "20",
};

const toDateInputValue = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
};

/**
 * Filter form for activity logs
 * @param {Object} props
 * @param {Object} props.filters
 * @param {Function} props.onApply
 * @param {Function} props.onReset
 * @param {boolean} props.disabled
 */
export function ActivityFilters({
  filters,
  onApply,
  onReset,
  disabled = false,
}) {
  const [values, setValues] = useState(defaultValues);

  useEffect(() => {
    const nextValues = { ...defaultValues };

    Object.entries(defaultValues).forEach(([key, defaultValue]) => {
      const incomingValue = filters?.[key];
      if (incomingValue === undefined || incomingValue === null) {
        nextValues[key] = defaultValue;
        return;
      }

      if (key === "dateFrom" || key === "dateTo") {
        nextValues[key] = toDateInputValue(incomingValue);
        return;
      }

      nextValues[key] = String(incomingValue ?? "");
    });

    setValues(nextValues);
  }, [filters]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const buildDateValue = (value) => {
    if (!value) return undefined;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return undefined;
    }
    return date.toISOString();
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const payload = {
      page: 1,
      search: values.search?.trim() || undefined,
      actorId: values.actorId?.trim() || undefined,
      action: values.action?.trim() || undefined,
      scope: values.scope?.trim() || undefined,
      status: values.status?.trim() || undefined,
      targetType: values.targetType?.trim() || undefined,
      targetId: values.targetId?.trim() || undefined,
      limit: values.limit ? Number(values.limit) : undefined,
    };

    const dateFromIso = buildDateValue(values.dateFrom);
    const dateToIso = buildDateValue(values.dateTo);

    if (dateFromIso) {
      payload.dateFrom = dateFromIso;
    }

    if (dateToIso) {
      payload.dateTo = dateToIso;
    }

    onApply?.(payload);
  };

  const handleReset = () => {
    setValues({ ...defaultValues });
    onReset?.();
  };

  return (
    <CustomCard>
      <CustomCardContent className="pt-6">
        <form
          onSubmit={handleSubmit}
          className="space-y-6"
          aria-label="Activity log filters"
        >
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <FilterField
              label="Search"
              name="search"
              placeholder="Search message, action, actor email..."
              value={values.search}
              onChange={handleChange}
              disabled={disabled}
            />
            <FilterField
              label="Action"
              name="action"
              placeholder="IMPORT_START"
              value={values.action}
              onChange={handleChange}
              disabled={disabled}
            />
            <FilterField
              label="Scope"
              name="scope"
              placeholder="products"
              value={values.scope}
              onChange={handleChange}
              disabled={disabled}
            />
            <FilterField
              label="Actor ID"
              name="actorId"
              placeholder="usr_123"
              value={values.actorId}
              onChange={handleChange}
              disabled={disabled}
            />
            <FilterField
              label="Status"
              name="status"
              placeholder="SUCCESS"
              value={values.status}
              onChange={handleChange}
              disabled={disabled}
            />
            <FilterField
              label="Target Type"
              name="targetType"
              placeholder="order"
              value={values.targetType}
              onChange={handleChange}
              disabled={disabled}
            />
            <FilterField
              label="Target ID"
              name="targetId"
              placeholder="ord_456"
              value={values.targetId}
              onChange={handleChange}
              disabled={disabled}
            />
            <FilterField
              label="From"
              name="dateFrom"
              type="date"
              value={values.dateFrom || ""}
              onChange={handleChange}
              disabled={disabled}
            />
            <FilterField
              label="To"
              name="dateTo"
              type="date"
              value={values.dateTo || ""}
              onChange={handleChange}
              disabled={disabled}
            />
          </div>

          <div className="flex flex-col lg:flex-row lg:items-end gap-4">
            <div className="w-full max-w-[160px]">
              <FilterField
                label="Page Size"
                name="limit"
                component="select"
                value={values.limit}
                onChange={handleChange}
                disabled={disabled}
              >
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </FilterField>
            </div>

            <div className="ml-auto flex flex-col sm:flex-row gap-3">
              <CustomButton
                type="button"
                variant="outline"
                onClick={handleReset}
                disabled={disabled}
              >
                Reset
              </CustomButton>
              <CustomButton type="submit" disabled={disabled}>
                Apply Filters
              </CustomButton>
            </div>
          </div>
        </form>
      </CustomCardContent>
    </CustomCard>
  );
}

function FilterField({
  label,
  name,
  component = "input",
  className,
  children,
  ...props
}) {
  const sharedClassName =
    "flex h-10 w-full rounded-md border px-3 py-2 text-sm transition-colors " +
    "bg-white text-gray-900 border-gray-300 placeholder:text-gray-500 " +
    "dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600 dark:placeholder:text-gray-400 " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500 " +
    "dark:focus-visible:ring-blue-400 focus-visible:border-blue-500 dark:focus-visible:border-blue-400 " +
    "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-100 dark:disabled:bg-gray-900";

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <CustomLabel htmlFor={name}>{label}</CustomLabel>
      {component === "select" ? (
        <select id={name} name={name} className={sharedClassName} {...props}>
          {children}
        </select>
      ) : (
        <CustomInput id={name} name={name} {...props} />
      )}
    </div>
  );
}
