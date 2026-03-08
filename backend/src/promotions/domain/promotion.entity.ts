export interface Promotion {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  discountPercent: number;
  active: boolean;
  expiresAt: Date;
}
