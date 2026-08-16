import prisma from "@/lib/db";
import { UserRole, PropertyStatus, WithdrawalStatus } from "@prisma/client";
import { NotFoundError } from "@/lib/errors";

export class AdminService {
  /**
   * Platform Overview Statistics
   */
  static async getPlatformStats() {
    const [
      totalUsers,
      totalOwners,
      totalListings,
      activeBookings,
      totalRevenueResult,
      pendingWithdrawalsCount,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: UserRole.OWNER } }),
      prisma.property.count({ where: { status: PropertyStatus.PUBLISHED } }),
      prisma.booking.count({ where: { status: "CONFIRMED" } }),
      prisma.payment.aggregate({
        where: { status: "SUCCESS" },
        _sum: { amount: true },
      }),
      prisma.withdrawal.count({ where: { status: WithdrawalStatus.PENDING } }),
    ]);

    const grossVolume = totalRevenueResult._sum.amount || 0;
    // 5% platform fee
    const platformRevenue = Math.round(grossVolume * 0.05);

    return {
      totalUsers,
      totalOwners,
      totalListings,
      activeBookings,
      grossVolume,
      platformRevenue,
      pendingWithdrawalsCount,
    };
  }

  /**
   * List users with search and role filter
   */
  static async getUsers(page: number = 1, limit: number = 20, role?: UserRole) {
    const skip = (page - 1) * limit;
    const where = role ? { role } : {};

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          banned: true,
          createdAt: true,
          _count: {
            select: {
              properties: true,
              bookings: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.user.count({ where }),
    ]);

    return { users, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  /**
   * Ban or unban a user
   */
  static async toggleUserBan(userId: string, banned: boolean, reason?: string) {
    return prisma.user.update({
      where: { id: userId },
      data: {
        banned,
        banReason: banned ? reason || "Violation of platform policies" : null,
      },
    });
  }

  /**
   * Approve or reject a host withdrawal
   */
  static async processWithdrawal(withdrawalId: string, approved: boolean, note?: string) {
    const withdrawal = await prisma.withdrawal.findUnique({
      where: { id: withdrawalId },
      include: { user: { include: { wallet: true } } },
    });

    if (!withdrawal) {
      throw new NotFoundError("Withdrawal");
    }

    return prisma.$transaction(async (tx) => {
      const status = approved ? WithdrawalStatus.COMPLETED : WithdrawalStatus.REJECTED;

      const updatedWithdrawal = await tx.withdrawal.update({
        where: { id: withdrawalId },
        data: {
          status,
          processedAt: new Date(),
          adminNote: note,
        },
      });

      const wallet = withdrawal.user.wallet;
      if (wallet) {
        if (approved) {
          // Finalize: Deduct from pendingBalance, increment totalWithdrawn
          await tx.wallet.update({
            where: { id: wallet.id },
            data: {
              pendingBalance: { decrement: withdrawal.amount },
              totalWithdrawn: { increment: withdrawal.amount },
            },
          });
        } else {
          // Refund back to availableBalance
          await tx.wallet.update({
            where: { id: wallet.id },
            data: {
              pendingBalance: { decrement: withdrawal.amount },
              availableBalance: { increment: withdrawal.amount },
            },
          });
        }
      }

      return updatedWithdrawal;
    });
  }
}
