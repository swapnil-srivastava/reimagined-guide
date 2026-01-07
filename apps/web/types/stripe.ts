// types/stripe.ts
// TypeScript interfaces for Stripe checkout and webhook handling

/**
 * Base metadata that all Stripe checkout sessions share
 */
interface BaseStripeMetadata {
  user_id?: string;
}

/**
 * Metadata for cart-based checkout (multiple products)
 */
export interface CartCheckoutMetadata extends BaseStripeMetadata {
  order_type: 'cart';
}

/**
 * Metadata for service package checkout (single service)
 */
export interface ServicePackageCheckoutMetadata extends BaseStripeMetadata {
  order_type: 'service_package';
  package_name?: string;
  package_description?: string;
  package_id?: string;
}

/**
 * Discriminated union type for all checkout metadata types
 * Use session.metadata.order_type to narrow the type
 */
export type StripeCheckoutMetadata = CartCheckoutMetadata | ServicePackageCheckoutMetadata;

/**
 * Order types supported by the system
 */
export type OrderType = 'cart' | 'service_package';

/**
 * Type guard to check if metadata indicates a service package order
 */
export function isServicePackageOrder(
  metadata: Record<string, string> | null
): metadata is Record<string, string> & { order_type: 'service_package' } {
  return metadata?.order_type === 'service_package';
}

/**
 * Type guard to check if metadata indicates a cart order
 */
export function isCartOrder(
  metadata: Record<string, string> | null
): metadata is Record<string, string> & { order_type: 'cart' } {
  return !metadata?.order_type || metadata.order_type === 'cart';
}

/**
 * Structure for order items data before database insertion
 */
export interface OrderItemData {
  name: string;
  quantity: number;
  price: number;
  product_id?: string;
}

/**
 * Structure for parsed service package from Stripe session
 */
export interface ParsedServicePackage {
  name: string;
  description?: string;
  price: number;
  package_id?: string;
}

/**
 * Parameters for creating a checkout session with order type support
 */
export interface CreateCheckoutParams {
  // Existing params
  priceId?: string;
  price?: number;
  currency?: string;
  name?: string;
  email?: string;
  userId?: string;
  items?: Array<{
    name: string;
    description?: string;
    image_url?: string;
    price: number;
    quantity: number;
    product_id?: string;
  }>;
  tax?: number;
  deliveryCost?: number;
  
  // New params for order type support
  order_type?: OrderType;
  package_name?: string;
  package_description?: string;
  package_id?: string;
}
