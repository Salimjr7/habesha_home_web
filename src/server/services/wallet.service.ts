import prisma from "@/lib/db";
import { NotFoundError, AppError } from "@/lib/errors";
import { WalletTransactionType, WalletTransactionStatus, WithdrawalStatus, NotificationType } from "@prisma/client";
import { CreateWithdrawalInput, CreatePayoutAccountInput } from "@/lib/validations";

export class WalletService {
  /**
   * Get or create user wallet
   */
  static async getOrCreateWallet(userId: string) {
    let wallet = await prisma.wallet.findUnique({
      where: { userId },
      include: {
        transactions: {
          orderBy: { createdAt: "desc" },
          take: 20,
        },
      },
    });

    if (!wallet) {
      wallet = await prisma.wallet.create({
        data: {
          userId,
          availableBalance: 0,
          pendingBalance: 0,
          totalEarnings: 0,
          totalWithdrawn: 0,
          currency: "ETB",
        },
        include: {
          transactions: true,
        },
      });
    }

    return wallet;
  }

  /**
   * Request a payout / withdrawal (AUDITABLE FINANCIAL LEDGER)
   */
  static async requestWithdrawal(userId: string, input: CreateWithdrawalInput) {
    const { amount, payoutAccountId } = input;

    const wallet = await this.getOrCreateWallet(userId);

    // Verify payout account ownership
    const payoutAccount = await prisma.payoutAccount.findUnique({
      where: { id: payoutAccountId },
    });

    if (!payoutAccount || payoutAccount.userId !== userId) {
      throw new NotFoundError("Payout account");
    }

    if (wallet.availableBalance < amount) {
      throw new AppError(
        `Insufficient available balance. You have ETB ${(wallet.availableBalance / 100).toLocaleString()}, requested ETB ${(amount / 100).toLocaleString()}`,
        400,
        "INSUFFICIENT_FUNDS"
      );
    }

    // Execute atomic withdrawal request and ledger debit
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create withdrawal record
      const withdrawal = await tx.withdrawal.create({
        data: {
          userId,
          amount,
          currency: "ETB",
          status: WithdrawalStatus.PENDING,
          payoutAccountId,
        },
        include: { payoutAccount: true },
      });

      // 2. Debit from available balance and move to pending
      const updatedBalance = wallet.availableBalance - amount;

      await tx.walletTransaction.create({
        data: {
          walletId: wallet.id,
          type: WalletTransactionType.WITHDRAWAL,
          status: WalletTransactionStatus.PENDING,
          amount: -amount, // Negative for debit
          balance: updatedBalance,
          currency: "ETB",
          description: `Withdrawal request #${withdrawal.id.slice(0, 8)} to ${payoutAccount.provider.toUpperCase()} (${payoutAccount.accountNumber})`,
          reference: withdrawal.id,
        },
      });

      await tx.wallet.update({
        where: { id: wallet.id },
        data: {
          availableBalance: { decrement: amount },
          pendingBalance: { increment: amount },
        },
      });

      // 3. Create notification
      await tx.notification.create({
        data: {
          userId,
          type: NotificationType.SYSTEM,
          title: "Withdrawal Request Submitted",
          message: `Your withdrawal of ETB ${(amount / 100).toLocaleString()} is pending review.`,
          link: `/owner/withdrawals`,
        },
      });

      return withdrawal;
    });

    return result;
  }

  /**
   * Add a new payout account
   */
  static async addPayoutAccount(userId: string, input: CreatePayoutAccountInput) {
    if (input.isDefault) {
      // Unset previous defaults
      await prisma.payoutAccount.updateMany({
        where: { userId },
        data: { isDefault: false },
      });
    }

    return prisma.payoutAccount.create({
      data: {
        userId,
        provider: input.provider,
        accountName: input.accountName,
        accountNumber: input.accountNumber,
        bankName: input.bankName,
        isDefault: input.isDefault,
      },
    });
  }

  /**
   * Get user payout accounts
   */
  static async getPayoutAccounts(userId: string) {
    return prisma.payoutAccount.findMany({
      where: { userId },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    });
  }
}
