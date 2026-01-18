import { InMemoryPrescriptionRepository } from '../repositories/in-memory-prescription.repository';
import { SubmitPrescriptionUseCase } from './submit-prescription.use-case';
import { GetMyPrescriptionsUseCase } from './get-my-prescriptions.use-case';
import { GetPendingPrescriptionsUseCase } from './get-pending-prescriptions.use-case';
import { ReviewPrescriptionUseCase } from './review-prescription.use-case';
import { PrescriptionStatus } from '../domain';
import { InvalidPrescriptionStatusException } from '../exceptions';

describe('Prescription Use Cases', () => {
  let repository: InMemoryPrescriptionRepository;
  let submitUseCase: SubmitPrescriptionUseCase;
  let getMyUseCase: GetMyPrescriptionsUseCase;
  let getPendingUseCase: GetPendingPrescriptionsUseCase;
  let reviewUseCase: ReviewPrescriptionUseCase;

  beforeEach(() => {
    repository = new InMemoryPrescriptionRepository();
    submitUseCase = new SubmitPrescriptionUseCase(repository);
    getMyUseCase = new GetMyPrescriptionsUseCase(repository);
    getPendingUseCase = new GetPendingPrescriptionsUseCase(repository);
    reviewUseCase = new ReviewPrescriptionUseCase(repository);
  });

  afterEach(() => {
    repository.clear();
  });

  it('creates a pending prescription for user', async () => {
    const result = await submitUseCase.execute('user-1', {
      fileReference: 'ref://example',
    });

    expect(result.userId).toBe('user-1');
    expect(result.status).toBe(PrescriptionStatus.PENDING);
  });

  it('returns prescriptions for authenticated user only', async () => {
    await submitUseCase.execute('user-1', { fileReference: 'ref://a' });
    await submitUseCase.execute('user-2', { fileReference: 'ref://b' });

    const mine = await getMyUseCase.execute('user-1');
    expect(mine).toHaveLength(1);
    expect(mine[0].userId).toBe('user-1');
  });

  it('returns pending prescriptions for admin review', async () => {
    await submitUseCase.execute('user-1', { fileReference: 'ref://a' });
    await submitUseCase.execute('user-2', { fileReference: 'ref://b' });

    const pending = await getPendingUseCase.execute();
    expect(pending).toHaveLength(2);
    expect(pending.every((item) => item.status === PrescriptionStatus.PENDING)).toBe(true);
  });

  it('allows admin to approve a pending prescription', async () => {
    const created = await submitUseCase.execute('user-1', { fileReference: 'ref://a' });

    const reviewed = await reviewUseCase.execute(created.id, 'APPROVE');
    expect(reviewed.status).toBe(PrescriptionStatus.APPROVED);
    expect(reviewed.reviewedAt).not.toBeNull();
  });

  it('allows admin to reject a pending prescription', async () => {
    const created = await submitUseCase.execute('user-1', { fileReference: 'ref://a' });

    const reviewed = await reviewUseCase.execute(created.id, 'REJECT', 'Unreadable');
    expect(reviewed.status).toBe(PrescriptionStatus.REJECTED);
    expect(reviewed.rejectionReason).toBe('Unreadable');
  });

  it('prevents invalid transitions once reviewed', async () => {
    const created = await submitUseCase.execute('user-1', { fileReference: 'ref://a' });
    await reviewUseCase.execute(created.id, 'APPROVE');

    await expect(reviewUseCase.execute(created.id, 'REJECT')).rejects.toThrow(
      InvalidPrescriptionStatusException,
    );
  });
});
