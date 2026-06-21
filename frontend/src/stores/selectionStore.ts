import { create } from 'zustand';
import type { EntityType } from '@/utils/constants';

/**
 * 选中实体信息
 */
interface SelectedEntity {
  /** 实体类型：device | phone | account */
  type: EntityType;
  /** 实体 ID */
  id: number;
  /** 实体数据 */
  data: Record<string, unknown>;
}

/**
 * 面包屑导航项
 */
interface BreadcrumbItem {
  type: EntityType;
  id: number;
  label: string;
}

/**
 * 当前选中实体状态管理
 */
interface SelectionState {
  /** 当前选中的实体 */
  selectedEntity: SelectedEntity | null;
  /** 面包屑导航路径 */
  breadcrumb: BreadcrumbItem[];

  /** 设置选中实体 */
  setSelection: (type: EntityType, id: number, data: Record<string, unknown>, label?: string) => void;
  /** 清除选中实体 */
  clearSelection: () => void;
  /** 更新当前选中实体的数据 */
  updateSelectionData: (data: Record<string, unknown>) => void;
  /** 设置面包屑 */
  setBreadcrumb: (items: BreadcrumbItem[]) => void;
}

export const useSelectionStore = create<SelectionState>((set) => ({
  selectedEntity: null,
  breadcrumb: [],

  setSelection: (type: EntityType, id: number, data: Record<string, unknown>, label?: string) => {
    set((state) => {
      const newBreadcrumb = [...state.breadcrumb];

      // 如果面包屑中已有该类型实体，则截断到当前位置
      const existingIndex = newBreadcrumb.findIndex((item) => item.type === type && item.id === id);
      if (existingIndex >= 0) {
        newBreadcrumb.splice(existingIndex + 1);
      } else {
        newBreadcrumb.push({ type, id, label: label || `${type}-${id}` });
      }

      return {
        selectedEntity: { type, id, data },
        breadcrumb: newBreadcrumb,
      };
    });
  },

  clearSelection: () => {
    set({
      selectedEntity: null,
      breadcrumb: [],
    });
  },

  updateSelectionData: (data: Record<string, unknown>) => {
    set((state) => {
      if (!state.selectedEntity) return state;
      return {
        selectedEntity: {
          ...state.selectedEntity,
          data: { ...state.selectedEntity.data, ...data },
        },
      };
    });
  },

  setBreadcrumb: (items: BreadcrumbItem[]) => {
    set({ breadcrumb: items });
  },
}));
