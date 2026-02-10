/**
 * Derived compliance status for an order (ADR-0055).
 * Not an order state — used only to gate fulfilment.
 */
export enum ComplianceStatus {
  APPROVED = 'APPROVED',
  PENDING = 'PENDING',
  REJECTED = 'REJECTED',
}
