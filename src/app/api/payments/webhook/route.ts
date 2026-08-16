import { NextRequest, NextResponse } from "next/server";
import { PaymentService } from "@/server/services/payment.service";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-chapa-signature") || req.headers.get("chapa-signature");
    const secret = process.env.CHAPA_WEBHOOK_SECRET;

    // Verify HMAC-SHA256 signature if secret is configured
    if (secret && signature) {
      const hash = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
      if (hash !== signature) {
        return NextResponse.json({ error: "Invalid webhook signature" }, { status: 401 });
      }
    }

    const payload = JSON.parse(rawBody);
    const tx_ref = payload.tx_ref || payload.trx_ref || payload.reference;

    if (!tx_ref) {
      return NextResponse.json({ error: "Missing transaction reference" }, { status: 400 });
    }

    // Process payment verification & wallet crediting
    const result = await PaymentService.verifyAndConfirmPayment(tx_ref);

    return NextResponse.json({
      success: true,
      message: "Webhook processed successfully",
      bookingId: result.bookingId,
    });
  } catch (error: any) {
    console.error("Webhook processing error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process webhook" },
      { status: 500 }
    );
  }
}
