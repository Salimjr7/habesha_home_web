// ============================================================================
// Habesha Home — Payment Provider Factory
// ============================================================================

import { PaymentProvider } from "./types";
import { ChapaProvider } from "./providers/chapa";
import { TelebirrProvider } from "./providers/telebirr";
import { PaymentError } from "@/lib/errors";

export type SupportedPaymentProvider = "CHAPA" | "TELEBIRR";

export class PaymentProviderFactory {
  private static providers: Map<string, PaymentProvider> = new Map();

  static getProvider(type: SupportedPaymentProvider | string): PaymentProvider {
    const key = type.toUpperCase();

    if (!this.providers.has(key)) {
      switch (key) {
        case "CHAPA":
          this.providers.set(key, new ChapaProvider());
          break;
        case "TELEBIRR":
          this.providers.set(key, new TelebirrProvider());
          break;
        default:
          throw new PaymentError(`Unsupported payment provider: ${type}`);
      }
    }

    const provider = this.providers.get(key);
    if (!provider) {
      throw new PaymentError(`Failed to initialize payment provider: ${type}`);
    }

    return provider;
  }

  static getAvailableProviders(): Array<{
    id: SupportedPaymentProvider;
    name: string;
    description: string;
    popular?: boolean;
  }> {
    return [
      {
        id: "CHAPA",
        name: "Chapa Payment Gateway",
        description: "Pay with Debit/Credit Card, Telebirr, CBE Birr, Awash, or Bank Transfer",
        popular: true,
      },
      {
        id: "TELEBIRR",
        name: "telebirr SuperApp",
        description: "Direct seamless payment using your Ethio Telecom Telebirr account",
        popular: true,
      },
    ];
  }
}
