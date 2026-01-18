import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateRefreshTokenData, RefreshToken } from './refresh-token.entity';
import { IRefreshTokenRepository } from './refresh-token-repository.interface';

/**
 * Prisma Refresh Token Repository
 *
 * Production implementation using PostgreSQL via Prisma.
 */
@Injectable()
export class PrismaRefreshTokenRepository implements IRefreshTokenRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateRefreshTokenData): Promise<RefreshToken> {
    const token = await this.prisma.refreshToken.create({
      data: {
        token: data.token,
        userId: data.userId,
        expiresAt: data.expiresAt,
      },
    });

    return this.toDomain(token);
  }

  async findByToken(token: string): Promise<RefreshToken | null> {
    const existing = await this.prisma.refreshToken.findUnique({
      where: { token },
    });
    return existing ? this.toDomain(existing) : null;
  }

  async findActiveByUserId(userId: string): Promise<RefreshToken[]> {
    const now = new Date();
    const tokens = await this.prisma.refreshToken.findMany({
      where: {
        userId,
        revokedAt: null,
        expiresAt: { gt: now },
      },
    });
    return tokens.map((token) => this.toDomain(token));
  }

  async revoke(token: string): Promise<RefreshToken | null> {
    const existing = await this.prisma.refreshToken.findUnique({
      where: { token },
    });
    if (!existing) {
      return null;
    }
    if (existing.revokedAt) {
      return this.toDomain(existing);
    }

    const revoked = await this.prisma.refreshToken.update({
      where: { token },
      data: { revokedAt: new Date() },
    });
    return this.toDomain(revoked);
  }

  async revokeAllByUserId(userId: string): Promise<number> {
    const result = await this.prisma.refreshToken.updateMany({
      where: {
        userId,
        revokedAt: null,
      },
      data: { revokedAt: new Date() },
    });
    return result.count;
  }

  async deleteExpired(): Promise<number> {
    const now = new Date();
    const result = await this.prisma.refreshToken.deleteMany({
      where: { expiresAt: { lte: now } },
    });
    return result.count;
  }

  async isValid(token: string): Promise<boolean> {
    const existing = await this.prisma.refreshToken.findUnique({
      where: { token },
    });
    if (!existing) return false;
    if (existing.revokedAt) return false;
    return existing.expiresAt > new Date();
  }

  private toDomain(token: {
    id: string;
    token: string;
    userId: string;
    expiresAt: Date;
    revokedAt: Date | null;
    createdAt: Date;
  }): RefreshToken {
    return {
      id: token.id,
      token: token.token,
      userId: token.userId,
      expiresAt: token.expiresAt,
      revokedAt: token.revokedAt,
      createdAt: token.createdAt,
    };
  }
}
