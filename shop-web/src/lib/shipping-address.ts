import type { ShippingAddress, User } from "@/lib/types";

export function fullNameFromUser(user: User | null | undefined): string {
  if (!user) return "";
  return `${user.firstName}${user.lastName ? ` ${user.lastName}` : ""}`.trim();
}

export function emptyShippingAddress(): ShippingAddress {
  return { name: "", phone: "", address: "", city: "Jakarta", postalCode: "" };
}

export function shippingFromUser(user: User | null | undefined): ShippingAddress {
  if (!user) return emptyShippingAddress();
  if (user.shippingAddress?.address || user.shippingAddress?.name) {
    return {
      name: user.shippingAddress.name || fullNameFromUser(user),
      phone: user.shippingAddress.phone || user.phone || "",
      address: user.shippingAddress.address || user.address || "",
      city: user.shippingAddress.city || "Jakarta",
      postalCode: user.shippingAddress.postalCode || "",
    };
  }
  return {
    name: fullNameFromUser(user),
    phone: user.phone || "",
    address: user.address || "",
    city: "Jakarta",
    postalCode: "",
  };
}

export function formatShippingLine(addr: ShippingAddress): string {
  return addr.address || "";
}

export function hasSavedShipping(user: User | null | undefined): boolean {
  const s = shippingFromUser(user);
  return Boolean(s.name && s.phone && s.address);
}
