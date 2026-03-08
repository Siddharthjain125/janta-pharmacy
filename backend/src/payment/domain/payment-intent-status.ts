/**
 * Payment intent status (Phase 6 — manual payment v1)
 * COD: created as VERIFIED; UPI: PENDING → SUBMITTED → VERIFIED (admin)
 */
export enum PaymentIntentStatus {
  PENDING = 'PENDING',
  SUBMITTED = 'SUBMITTED',
  VERIFIED = 'VERIFIED',
  REJECTED = 'REJECTED',
}
