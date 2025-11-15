// Available email triggers by scope
export const EMAIL_TRIGGERS = {
  ORDER: [
    { value: "order.created", label: "Order Created" },
    { value: "order.processing", label: "Order Processing" },
    { value: "order.shipped", label: "Order Shipped" },
    { value: "order.refunded", label: "Order Refunded" },
    { value: "order.note.added", label: "Order Note Added" },
  ],
  USER: [
    { value: "user.registered", label: "User Registered" },
    { value: "user.profile.updated", label: "User Profile Updated" },
    { value: "user.password.changed", label: "User Password Changed" },
    { value: "user.account.deleted", label: "User Account Deleted" },
  ],
  SUBSCRIPTION: [
    { value: "subscription.created", label: "Subscription Created" },
    { value: "subscription.activated", label: "Subscription Activated" },
    { value: "subscription.cancelled", label: "Subscription Cancelled" },
    { value: "subscription.paused", label: "Subscription Paused" },
    { value: "subscription.resumed", label: "Subscription Resumed" },
    {
      value: "subscription.renewal.succeeded",
      label: "Subscription Renewal Succeeded",
    },
    {
      value: "subscription.renewal.failed",
      label: "Subscription Renewal Failed",
    },
  ],
};

// Available scopes
export const EMAIL_SCOPES = [
  { value: "CUSTOM", label: "Custom" },
  { value: "ORDER", label: "Order" },
  { value: "USER", label: "User" },
  { value: "SUBSCRIPTION", label: "Subscription" },
];

// Flatten all triggers for dropdown
export const ALL_EMAIL_TRIGGERS = [
  ...EMAIL_TRIGGERS.ORDER,
  ...EMAIL_TRIGGERS.USER,
  ...EMAIL_TRIGGERS.SUBSCRIPTION,
];

// Get triggers for a specific scope
export const getTriggersForScope = (scope) => {
  if (scope === "ORDER") return EMAIL_TRIGGERS.ORDER;
  if (scope === "USER") return EMAIL_TRIGGERS.USER;
  if (scope === "SUBSCRIPTION") return EMAIL_TRIGGERS.SUBSCRIPTION;
  return []; // CUSTOM scope has no triggers
};

