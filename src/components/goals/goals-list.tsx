"use client";

import { useRouter } from 'next/navigation';
import { Goal } from '@/server/queries/allocations';
import { GoalCard } from './goal-card';
import { AddGoalModal } from './add-goal-modal';
import { EditGoalModal } from './edit-goal-modal';
import { Button } from '@/components/ui/button';
import { Plus, Target } from 'lucide-react';
import { useAddGoalStore } from '@/stores/add-goal-store';
import { useEditGoalStore } from '@/stores/edit-goal-store';
import { formatPHP } from '@/lib/format';

type GoalsListProps = {
  goals: Goal[];
};

export const GoalsList = ({ goals }: GoalsListProps) => {
  const router = useRouter();
  const isAddModalOpen = useAddGoalStore((state) => state.isOpen);
  const openAddModal = useAddGoalStore((state) => state.open);
  const closeAddModal = useAddGoalStore((state) => state.close);

  const isEditModalOpen = useEditGoalStore((state) => state.isOpen);
  const openEditModal = useEditGoalStore((state) => state.openForEdit);
  const closeEditModal = useEditGoalStore((state) => state.close);

  const handleAddGoal = () => {
    openAddModal();
  };

  const handleEditGoal = (goal: Goal) => {
    openEditModal(goal);
  };

  const handleViewGoal = (goalId: string) => {
    router.push(`/modules/goals/${goalId}`);
  };

  // Calculate summary stats
  const totalSaved = goals.reduce((sum, goal) => sum + (goal.currentAmount || 0), 0);
  const totalTargets = goals.reduce((sum, goal) => sum + (goal.targetAmount || 0), 0);
  const completedGoals = goals.filter(
    (goal) => goal.targetAmount && goal.currentAmount >= goal.targetAmount
  ).length;

  // Empty state
  if (goals.length === 0) {
    return (
      <>
        <div className="text-center py-12">
          <div className="mb-4">
            <div className="w-24 h-24 mx-auto mb-4 bg-green-500/10 rounded-full flex items-center justify-center">
              <Target className="w-12 h-12 text-green-500" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Start saving towards your dreams
            </h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Create your first savings goal. Whether it&apos;s a vacation, emergency fund, or that gadget you&apos;ve been eyeing — every peso gets you closer.
            </p>
          </div>
          <Button onClick={handleAddGoal} size="lg" className="bg-green-600 hover:bg-green-700">
            <Plus className="w-5 h-5 mr-2" />
            Create Your First Goal
          </Button>
        </div>
        <AddGoalModal open={isAddModalOpen} onOpenChange={closeAddModal} />
      </>
    );
  }

  return (
    <div>
      {/* Header with Add Button */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Goals</h1>
          <p className="text-muted-foreground mt-1">
            Track your savings progress towards your dreams
          </p>
        </div>
        <Button onClick={handleAddGoal} className="bg-green-600 hover:bg-green-700">
          <Plus className="w-5 h-5 mr-2" />
          New Goal
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-card rounded-xl border p-4">
          <p className="text-sm text-muted-foreground mb-1">Total Saved</p>
          <p className="text-2xl font-bold text-green-600">{formatPHP(totalSaved)}</p>
        </div>
        <div className="bg-card rounded-xl border p-4">
          <p className="text-sm text-muted-foreground mb-1">Total Targets</p>
          <p className="text-2xl font-bold text-foreground">{formatPHP(totalTargets)}</p>
        </div>
        <div className="bg-card rounded-xl border p-4">
          <p className="text-sm text-muted-foreground mb-1">Goals Completed</p>
          <p className="text-2xl font-bold text-foreground">
            {completedGoals} <span className="text-sm font-normal text-muted-foreground">of {goals.length}</span>
          </p>
        </div>
      </div>

      {/* Goal Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {goals.map((goal) => (
          <GoalCard
            key={goal.id}
            goal={goal}
            onClick={() => handleViewGoal(goal.id)}
            onEdit={() => handleEditGoal(goal)}
          />
        ))}
      </div>

      {/* Add Goal Modal */}
      <AddGoalModal open={isAddModalOpen} onOpenChange={closeAddModal} />

      {/* Edit Goal Modal */}
      <EditGoalModal open={isEditModalOpen} onOpenChange={closeEditModal} />
    </div>
  );
};
