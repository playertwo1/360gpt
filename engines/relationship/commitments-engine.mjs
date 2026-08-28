/** Deterministic commitment states. A missed deadline never closes a commitment. */
export function assessCommitment(commitment, asOf = new Date()) {
  const dueAt = commitment?.due_at ? new Date(commitment.due_at) : null;
  const validDueAt = dueAt && !Number.isNaN(dueAt.getTime());
  if (!validDueAt || !commitment?.responsible || !commitment?.evidence_ref) {
    return { status: 'INCOMPLETE', reasonCode: 'COMMITMENT_DATA_INCOMPLETE' };
  }
  if (commitment.status === 'COMPLETED' || commitment.status === 'CANCELLED') {
    return { status: commitment.status, dueAt: dueAt.toISOString() };
  }
  const now = asOf instanceof Date ? asOf : new Date(asOf);
  const status = dueAt.getTime() < now.getTime() ? 'OVERDUE_OPEN' : 'OPEN';
  return { status, dueAt: dueAt.toISOString(), responsible: commitment.responsible, evidenceRef: commitment.evidence_ref };
}
