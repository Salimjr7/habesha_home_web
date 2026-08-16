// ============================================================================
// Habesha Home — Payment Provider Abstraction
// ============================================================================

export interface PaymentInitData {
  amount: number; // in minor units
  currency: string;
  txRef: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  callbackUrl: string;
  returnUrl: string;
  title?: string;
  description?: string;
  metadata?: Record<string, unknown>;
}

export interface PaymentInitResult {
  success: boolean;
  checkoutUrl?: string;
  providerRef?: string;
  providerData?: Record<string, unknown>;
  error?: string;
}

export interface PaymentVerifyResult {
  success: boolean;
  status: "SUCCESS" | "FAILED" | "PENDING";
  amount?: number;
  currency?: string;
  providerRef?: string;
  providerData?: Record<string, unknown>;
  error?: string;
}

export interface RefundResult {
  success: boolean;
  refundedAmount?: number;
  providerRef?: string;
  error?: string;
}

export interface PaymentWebhookData {
  txRef: string;
  status: string;
  amount: number;
  currency: string;
  providerRef?: string;
  rawData: Record<string, unknown>;
}

/**
 * Payment Provider Interface
 * All payment providers must implement this interface.
 * This allows adding new providers without changing booking logic.
 */
export interface PaymentProvider {
  readonly name: string;
  readonly displayName: string;
  readonly icon: string;
  
  initializePayment(data: PaymentInitData): Promise<PaymentInitResult>;
  verifyPayment(txRef: string): Promise<PaymentVerifyResult>;
  refundPayment(txRef: string, amount?: number): Promise<RefundResult>;
  parseWebhook(body: unknown, headers: Record<string, string>): PaymentWebhookData | null;
  verifyWebhookSignature(body: unknown, headers: Record<string, string>): boolean;
}
