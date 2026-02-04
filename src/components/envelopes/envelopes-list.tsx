"use client";

import { Envelope } from '@/server/queries/allocations';
import { EnvelopeCard } from './envelope-card';
import { AddEnvelopeModal } from './add-envelope-modal';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useAddEnvelopeStore } from '@/stores/add-envelope-store';

type EnvelopesListProps = {
  envelopes: Envelope[];
};

export const EnvelopesList = ({ envelopes }: EnvelopesListProps) => {
  const isModalOpen = useAddEnvelopeStore((state) => state.isOpen);
  const openModal = useAddEnvelopeStore((state) => state.open);
  const closeModal = useAddEnvelopeStore((state) => state.close);

  const handleAddEnvelope = () => {
    openModal();
  };

  // Empty state
  if (envelopes.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mb-4">
          <div className="text-6xl mb-4">📋</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No envelopes yet
          </h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Create your first envelope to start budgeting your expenses into purpose-based wallets.
          </p>
        </div>
        <Button onClick={handleAddEnvelope} size="lg">
          <Plus className="w-5 h-5 mr-2" />
          Create Your First Envelope
        </Button>
      </div>
    );
  }

  return (
    <div>
      {/* Header with Add Button */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Envelopes</h1>
          <p className="text-gray-600 mt-1">
            Manage your spending with purpose-based wallets
          </p>
        </div>
        <Button onClick={handleAddEnvelope}>
          <Plus className="w-5 h-5 mr-2" />
          Add Envelope
        </Button>
      </div>

      {/* Envelope Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {envelopes.map((envelope) => (
          <EnvelopeCard key={envelope.id} envelope={envelope} />
        ))}
      </div>

      {/* Add Envelope Modal */}
      <AddEnvelopeModal open={isModalOpen} onOpenChange={closeModal} />
    </div>
  );
};
