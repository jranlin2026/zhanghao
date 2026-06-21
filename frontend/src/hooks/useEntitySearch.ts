import { useState, useEffect, useCallback } from 'react';
import { useDebounce } from './useDebounce';
import { useSelectionStore } from '@/stores/selectionStore';
import { useUIStore } from '@/stores/uiStore';
import { getDevices } from '@/api/devices';
import { getPhones } from '@/api/phones';
import { getAccounts } from '@/api/accounts';
import type { DeviceDTO } from '@/types/device';
import type { PhoneNumberDTO } from '@/types/phone';
import type { InternetAccountDTO } from '@/types/account';

/**
 * 全局搜索结果
 */
interface SearchResults {
  devices: DeviceDTO[];
  phones: PhoneNumberDTO[];
  accounts: InternetAccountDTO[];
  loading: boolean;
  totalCount: number;
}

/**
 * 全局搜索 Hook
 * 同时查询设备/手机号/互联网账号三层 API
 * 300ms 防抖后自动搜索
 *
 * 用法:
 *   const { searchTerm, setSearchTerm, results, isSearching } = useEntitySearch();
 *   // results.devices, results.phones, results.accounts
 */
export function useEntitySearch() {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<SearchResults>({
    devices: [],
    phones: [],
    accounts: [],
    loading: false,
    totalCount: 0,
  });
  const [isSearching, setIsSearching] = useState(false);

  const debouncedSearch = useDebounce(searchTerm, 300);
  const { setSelection } = useSelectionStore();
  const { openPanel, showToast } = useUIStore();

  // 执行搜索
  useEffect(() => {
    if (!debouncedSearch || debouncedSearch.trim().length < 1) {
      setResults({ devices: [], phones: [], accounts: [], loading: false, totalCount: 0 });
      setIsSearching(false);
      return;
    }

    let cancelled = false;
    setIsSearching(true);

    const performSearch = async () => {
      try {
        setResults((prev) => ({ ...prev, loading: true }));

        const [deviceRes, phoneRes, accountRes] = await Promise.all([
          getDevices({ search: debouncedSearch, pageSize: 10 }).catch(() => null),
          getPhones({ search: debouncedSearch, pageSize: 10 }).catch(() => null),
          getAccounts({ search: debouncedSearch, pageSize: 10 }).catch(() => null),
        ]);

        if (cancelled) return;

        const devices = deviceRes?.data || [];
        const phones = phoneRes?.data || [];
        const accounts = accountRes?.data || [];
        const totalCount = devices.length + phones.length + accounts.length;

        setResults({ devices, phones, accounts, loading: false, totalCount });
      } catch {
        if (!cancelled) {
          setResults({ devices: [], phones: [], accounts: [], loading: false, totalCount: 0 });
        }
      } finally {
        if (!cancelled) {
          setIsSearching(false);
        }
      }
    };

    performSearch();

    return () => {
      cancelled = true;
    };
  }, [debouncedSearch]);

  /**
   * 跳转到选中实体
   */
  const navigateToEntity = useCallback(
    (type: 'device' | 'phone' | 'account', id: number, data: Record<string, unknown>, label?: string) => {
      setSelection(type, id, data, label);
      openPanel();
      setSearchTerm('');
      setResults({ devices: [], phones: [], accounts: [], loading: false, totalCount: 0 });
    },
    [setSelection, openPanel],
  );

  /**
   * 清除搜索
   */
  const clearSearch = useCallback(() => {
    setSearchTerm('');
    setResults({ devices: [], phones: [], accounts: [], loading: false, totalCount: 0 });
    setIsSearching(false);
  }, []);

  return {
    searchTerm,
    setSearchTerm,
    results,
    isSearching,
    navigateToEntity,
    clearSearch,
  };
}
