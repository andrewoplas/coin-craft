"use client";

import { EnvelopeDetailHeader } from './envelope-detail-header';
import { TransferEnvelopeModal } from './transfer-envelope-modal';
import type { EnvelopeDetail } from '@/server/queries/envelopes';
import type { Envelope } from '@/server/queries/allocations';

type EnvelopeDetailClientProps = {
  envelope: EnvelopeDetail;
  allEnvelopes: Envelope[];
};

export function EnvelopeDetailClient({ envelope, allEnvelopes }: EnvelopeDetailClientProps) {
  return (
    <>
      <EnvelopeDetailHeader envelope={envelope} />
      <TransferEnvelopeModal envelopes={allEnvelopes} />
    </>
  );
}
