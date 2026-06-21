import { create } from 'zustand';

/**
 * Toast 消息
 */
interface ToastMessage {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
}

/**
 * UI 状态管理（面板、弹窗、通知）
 */
interface UIState {
  /** 详情面板是否打开 */
  detailPanelOpen: boolean;
  /** 当前打开的弹窗名称 */
  activeModal: string | null;
  /** Toast 通知 */
  toast: ToastMessage | null;

  /** 打开详情面板 */
  openPanel: () => void;
  /** 关闭详情面板 */
  closePanel: () => void;
  /** 切换详情面板 */
  togglePanel: () => void;
  /** 打开弹窗 */
  openModal: (modalName: string) => void;
  /** 关闭弹窗 */
  closeModal: () => void;
  /** 显示 Toast 通知 */
  showToast: (type: ToastMessage['type'], message: string) => void;
  /** 清除 Toast */
  clearToast: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  detailPanelOpen: false,
  activeModal: null,
  toast: null,

  openPanel: () => {
    // 打开面板时关闭弹窗
    set({ detailPanelOpen: true, activeModal: null });
  },

  closePanel: () => {
    set({ detailPanelOpen: false });
  },

  togglePanel: () => {
    set((state) => ({ detailPanelOpen: !state.detailPanelOpen }));
  },

  openModal: (modalName: string) => {
    // 打开弹窗时关闭面板
    set({ activeModal: modalName, detailPanelOpen: false });
  },

  closeModal: () => {
    set({ activeModal: null });
  },

  showToast: (type: ToastMessage['type'], message: string) => {
    set({ toast: { type, message } });
    // 3 秒后自动清除
    setTimeout(() => {
      set({ toast: null });
    }, 3000);
  },

  clearToast: () => {
    set({ toast: null });
  },
}));
