import { create } from 'zustand';

interface GlobalActionsState {
  isTaskModalOpen: boolean;
  isHabitModalOpen: boolean;
  isGoalModalOpen: boolean;
  openTaskModal: () => void;
  closeTaskModal: () => void;
  openHabitModal: () => void;
  closeHabitModal: () => void;
  openGoalModal: () => void;
  closeGoalModal: () => void;
}

export const useGlobalActionsStore = create<GlobalActionsState>((set) => ({
  isTaskModalOpen: false,
  isHabitModalOpen: false,
  isGoalModalOpen: false,
  openTaskModal: () => set({ isTaskModalOpen: true }),
  closeTaskModal: () => set({ isTaskModalOpen: false }),
  openHabitModal: () => set({ isHabitModalOpen: true }),
  closeHabitModal: () => set({ isHabitModalOpen: false }),
  openGoalModal: () => set({ isGoalModalOpen: true }),
  closeGoalModal: () => set({ isGoalModalOpen: false }),
}));
