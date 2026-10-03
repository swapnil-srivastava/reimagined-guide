import { supaServerClient } from "../../supa-server-client";
import { deliveryOptions, TAX_RATE } from "../library";

/**
 * Server-side prices. Checkout endpoints build every amount from here and
 * from the products table, never from numbers the browser sends.
 */

export interface ServicePackage {
  package_id: string;
  name: string;
  description: string;
}

/** The only Stripe prices a service package checkout may use */
export const SERVICE_PACKAGES: Record<string, ServicePackage> = {
  price_1PepBzRomQdDoc7IMPkYqS78: {
    package_id: "consultation_basic",
    name: "1:1 Consultation Call",
    description: "30-minute consultation session for web development needs",
  },
  price_1Pe4OYRomQdDoc7IJpfJFW8O: {
    package_id: "package_basic",
    name: "Basic Package",
    description: "Complete web development package with responsive design and basic features",
  },
  price_1Pe4S4RomQdDoc7IvoWyNYt8: {
    package_id: "package_standard",
    name: "Standard Package",
    description: "Advanced web development with custom features and SEO optimization",
  },
  price_1PepHnRomQdDoc7ILk13S3dE: {
    package_id: "package_premium",
    name: "Premium Package",
    description: "Enterprise-level web development with e-commerce, advanced SEO, and custom design",
  },
};

export const CURRENCY = "EUR";

/** What the browser may send for a cart: ids and counts, no prices */
export interface CartRequestItem {
  id: string;
  quantity: number;
}

export interface PricedItem {
  product_id: string;
  name: string;
  description: string;
  image_url: string | null;
  quantity: number;
  /** Unit price in euros, from the products table */
  price: number;
}

export interface PricedCart {
  items: PricedItem[];
  subtotal: number;
  tax: number;
  delivery: number;
  total: number;
}

/** Thrown for requests the caller can fix; the message is safe to show */
export class PricingError extends Error {}

const MAX_QUANTITY = 100;

const round2 = (n: number) => Math.round(n * 100) / 100;

/**
 * Reads only `id` and `quantity` from each item, so extra fields such as a
 * client-side `price` are ignored.
 */
export function parseCartItems(raw: unknown): CartRequestItem[] {
  if (!Array.isArray(raw) || raw.length === 0) {
    throw new PricingError("Your cart is empty");
  }

  const merged = new Map<string, number>();
  for (const item of raw) {
    const id = typeof item?.id === "string" ? item.id : null;
    const quantity = Number(item?.quantity);
    if (!id || !Number.isInteger(quantity) || quantity < 1 || quantity > MAX_QUANTITY) {
      throw new PricingError("Invalid cart item");
    }
    merged.set(id, (merged.get(id) || 0) + quantity);
  }

  return Array.from(merged, ([id, quantity]) => ({ id, quantity }));
}

/** Prices a cart from the products table, with tax and the chosen delivery */
export async function priceCart(
  requested: CartRequestItem[],
  deliveryOptionId?: string | null
): Promise<PricedCart> {
  if (!supaServerClient) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not configured");
  }

  const { data: products, error } = await supaServerClient
    .from("products")
    .select("id, name, description, image_url, price, stock")
    .in(
      "id",
      requested.map((item) => item.id)
    );

  if (error) throw new Error(`Could not load products: ${error.message}`);

  const items: PricedItem[] = requested.map(({ id, quantity }) => {
    const product = products?.find((p) => p.id === id);
    if (!product) throw new PricingError("A product in your cart is no longer available");
    if (product.stock < quantity) {
      throw new PricingError(`Only ${product.stock} of ${product.name} left in stock`);
    }
    return {
      product_id: product.id,
      name: product.name,
      description: product.description || "",
      image_url: product.image_url,
      quantity,
      price: Number(product.price),
    };
  });

  let delivery = 0;
  if (deliveryOptionId) {
    const option = deliveryOptions.find((o) => o.id === deliveryOptionId);
    if (!option) throw new PricingError("Unknown delivery option");
    delivery = option.deliveryPrice;
  }

  const subtotal = round2(items.reduce((sum, item) => sum + item.price * item.quantity, 0));
  const tax = round2(subtotal * TAX_RATE);
  const total = round2(subtotal + tax + delivery);

  return { items, subtotal, tax, delivery, total };
}
