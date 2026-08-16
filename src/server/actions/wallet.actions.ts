"use server";

import { requireRole } from "@/lib/auth/session";
import { createWithdrawalSchema, createPayoutAccountSchema, CreateWithdrawalInput, CreatePayoutAccountInput } from "@/lib/validations";
import { WalletService } from "@/server/services/wallet.service";
import { createErrorResponse, createSuccessResponse, ActionResponse } from "@/lib/errors";
import { revalidatePath } from "next/cache";

export async function requestWithdrawalAction(input: CreateWithdrawalInput): Promise<ActionResponse> {
  try {
    const user = await requireRole(["OWNER", "ADMIN"]);
    const validated = createWithdrawalSchema.parse(input);

    const withdrawal = await WalletService.requestWithdrawal(user.id, validated);

    revalidatePath("/owner/wallet");
    revalidatePath("/owner/withdrawals");

    return createSuccessResponse(withdrawal);
  } catch (err) {
    return createErrorResponse(err);
  }
}

export async function addPayoutAccountAction(input: CreatePayoutAccountInput): Promise<ActionResponse> {
  try {
    const user = await requireRole(["OWNER", "ADMIN"]);
    const validated = createPayoutAccountSchema.parse(input);

    const account = await WalletService.addPayoutAccount(user.id, validated);

    revalidatePath("/owner/wallet");

    return createSuccessResponse(account);
  } catch (err) {
    return createErrorResponse(err);
  }
}
