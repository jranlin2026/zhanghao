import React, { useState, useCallback } from 'react';
import { Tabs, Tab, Box, Button } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { getDeviceStats } from '@/api/devices';
import DeviceListView from '@/views/DeviceListView';
import PhoneListView from '@/views/PhoneListView';
import AccountListView from '@/views/AccountListView';
import DeviceFormModal from '@/modals/DeviceFormModal';
import PhoneFormModal from '@/modals/PhoneFormModal';
import AccountFormModal from '@/modals/AccountFormModal';
import KpiBar from '@/components/common/KpiBar';
import { useUIStore } from '@/stores/uiStore';
import { usePermission } from '@/hooks/usePermission';

type TabValue = 'device' | 'phone' | 'account';

/**
 * 账号资产主页
 * 核心页面 — 三栏布局的中间主区内容
 * Tab 切换三种视图：设备列表 / 手机号列表 / 互联网账号
 * 每个 Tab 渲染对应的 View 组件
 * 新增按钮打开对应实体的 FormModal
 */
const AssetPage: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<TabValue>('device');
  const [globalSearch, setGlobalSearch] = useState('');
  const { activeModal, openModal } = useUIStore();
  const { canEdit } = usePermission();

  // KPI 统计
  const { data: statsRes, isLoading: statsLoading } = useQuery({
    queryKey: ['device-stats'],
    queryFn: () => getDeviceStats(),
  });

  const handleTabChange = (_: React.SyntheticEvent, newValue: TabValue) => {
    setCurrentTab(newValue);
    setGlobalSearch('');
  };

  const handleSearchChange = useCallback((keyword: string) => {
    setGlobalSearch(keyword);
  }, []);

  const handleAdd = () => {
    const modalMap: Record<TabValue, string> = {
      device: 'device-form',
      phone: 'phone-form',
      account: 'account-form',
    };
    openModal(modalMap[currentTab]);
  };

  const tabLabelMap: Record<TabValue, string> = {
    device: '设备列表',
    phone: '手机号列表',
    account: '互联网账号',
  };

  const renderView = () => {
    switch (currentTab) {
      case 'device':
        return (
          <DeviceListView
            searchKeyword={globalSearch}
            onSearchChange={handleSearchChange}
          />
        );
      case 'phone':
        return (
          <PhoneListView
            searchKeyword={globalSearch}
            onSearchChange={handleSearchChange}
          />
        );
      case 'account':
        return (
          <AccountListView
            searchKeyword={globalSearch}
            onSearchChange={handleSearchChange}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div>
      {/* 页面头部 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 600, color: '#1F2937', margin: 0 }}>
            {tabLabelMap[currentTab]}
          </h1>
          <p style={{ fontSize: 13, color: '#6B7280', margin: '4px 0 0' }}>
            管理企业账号资产的全生命周期
          </p>
        </div>
        {canEdit && (
          <Button
            variant="contained"
            size="small"
            startIcon={<AddIcon />}
            onClick={handleAdd}
            sx={{
              backgroundColor: 'var(--color-primary)',
              color: '#fff',
              textTransform: 'none',
              fontWeight: 500,
              fontSize: 13,
              borderRadius: '8px',
              '&:hover': { backgroundColor: '#1D4ED8' },
            }}
          >
            新增{tabLabelMap[currentTab].slice(0, -2)}
          </Button>
        )}
      </div>

      {/* KPI 统计 */}
      <KpiBar stats={statsRes?.data} loading={statsLoading} viewType="device" />

      {/* Tab 切换 */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', marginBottom: 2 }}>
        <Tabs
          value={currentTab}
          onChange={handleTabChange}
          sx={{
            '& .MuiTab-root': {
              textTransform: 'none',
              fontSize: 14,
              fontWeight: 500,
              color: '#6B7280',
              minHeight: 40,
              padding: '8px 16px',
            },
            '& .Mui-selected': {
              color: 'var(--color-primary) !important',
              fontWeight: 600,
            },
            '& .MuiTabs-indicator': {
              backgroundColor: 'var(--color-primary)',
              height: 2.5,
            },
          }}
        >
          <Tab value="device" label="设备列表" />
          <Tab value="phone" label="手机号列表" />
          <Tab value="account" label="互联网账号" />
        </Tabs>
      </Box>

      {/* 视图内容 */}
      {renderView()}

      {/* 弹窗 */}
      {activeModal === 'device-form' && <DeviceFormModal open={true} />}
      {activeModal === 'phone-form' && <PhoneFormModal open={true} />}
      {activeModal === 'account-form' && <AccountFormModal open={true} />}
    </div>
  );
};

export default AssetPage;
