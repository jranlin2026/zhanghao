import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import DetailPanel from './DetailPanel';
import { useUIStore } from '@/stores/uiStore';
import { Snackbar, Alert } from '@mui/material';

/**
 * 三栏布局容器
 * CSS Grid: 220px 左侧导航 | 1fr 中间主区
 * 右侧 380px 详情面板通过 fixed 叠加
 * 整体 min-height: 100vh
 */
const MainLayout: React.FC = () => {
  const { toast, clearToast } = useUIStore();

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--color-bg)' }}>
      {/* 左侧导航 */}
      <Sidebar />

      {/* 中间主区 + 顶部 Header */}
      <div
        style={{
          marginLeft: 220,
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 680,
          minHeight: '100vh',
        }}
      >
        <Header showSearch={true} />

        <main
          style={{
            flex: 1,
            padding: '20px 24px',
            overflow: 'auto',
          }}
        >
          <Outlet />
        </main>
      </div>

      {/* 右侧详情面板 */}
      <DetailPanel />

      {/* 全局 Toast */}
      <Snackbar
        open={toast !== null}
        autoHideDuration={3000}
        onClose={clearToast}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={clearToast}
          severity={toast?.type || 'info'}
          variant="filled"
          sx={{
            borderRadius: '8px',
            fontSize: 14,
            fontWeight: 500,
          }}
        >
          {toast?.message || ''}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default MainLayout;
