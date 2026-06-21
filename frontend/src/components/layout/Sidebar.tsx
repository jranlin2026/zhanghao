import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { ROLE_LABELS } from '@/utils/constants';

/** 导航项定义 */
interface NavItem {
  path: string;
  label: string;
  icon: React.ReactNode;
  active: boolean;
  badge?: string;
  disabled?: boolean;
}

/**
 * 左侧导航栏
 * 220px 固定宽度
 * 4 个激活项：账号资产、操作日志、风险提醒、系统设置
 * 底部显示当前用户信息
 */
const Sidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const currentPath = location.pathname;

  const navItems: NavItem[] = [
    {
      path: '/',
      label: '账号资产',
      icon: <DeviceIcon />,
      active: currentPath === '/' || currentPath.startsWith('/asset'),
    },
    {
      path: '/logs',
      label: '操作日志',
      icon: <LogIcon />,
      active: currentPath === '/logs',
    },
    {
      path: '/risks',
      label: '风险提醒',
      icon: <RiskIcon />,
      active: currentPath === '/risks',
    },
    {
      path: '/settings',
      label: '系统设置',
      icon: <SettingsIcon />,
      active: currentPath === '/settings',
    },
    {
      path: '',
      label: '员工使用',
      icon: <UserIcon />,
      active: false,
      disabled: true,
      badge: 'V2',
    },
    {
      path: '',
      label: '申请审批',
      icon: <ApprovalIcon />,
      active: false,
      disabled: true,
      badge: 'V2',
    },
    {
      path: '',
      label: '离职交接',
      icon: <HandoverIcon />,
      active: false,
      disabled: true,
      badge: 'V3',
    },
  ];

  return (
    <aside
      style={{
        width: 220,
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'var(--color-surface)',
        borderRight: '1px solid var(--color-border)',
        position: 'fixed',
        left: 0,
        top: 0,
        zIndex: 100,
      }}
    >
      {/* Logo 区域 */}
      <div
        style={{
          padding: '20px 20px 16px',
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              backgroundColor: 'var(--color-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: 16,
              fontWeight: 700,
            }}
          >
            A
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#1F2937', lineHeight: 1.3 }}>
              账号资产管理
            </div>
            <div style={{ fontSize: 11, color: '#9CA3AF' }}>v1.0</div>
          </div>
        </div>
      </div>

      {/* 导航菜单 */}
      <nav style={{ flex: 1, padding: '12px 12px', overflow: 'auto' }}>
        {navItems.map((item, index) => {
          // V2/V3 分隔线
          const isV2Start = item.label === '员工使用' && item.disabled;
          return (
            <React.Fragment key={item.label}>
              {isV2Start && (
                <div
                  style={{
                    margin: '16px 4px 8px',
                    height: 1,
                    backgroundColor: 'var(--color-border)',
                  }}
                />
              )}
              <button
                onClick={() => !item.disabled && item.path && navigate(item.path)}
                disabled={item.disabled}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 8,
                  border: 'none',
                  backgroundColor: item.active ? 'var(--color-primary-bg)' : 'transparent',
                  color: item.active ? 'var(--color-primary)' : item.disabled ? '#D1D5DB' : '#6B7280',
                  cursor: item.disabled ? 'not-allowed' : 'pointer',
                  fontSize: 14,
                  fontWeight: item.active ? 600 : 400,
                  textAlign: 'left',
                  marginBottom: 2,
                  transition: 'all 0.15s',
                }}
                onMouseEnter={(e) => {
                  if (!item.disabled && !item.active) {
                    e.currentTarget.style.backgroundColor = '#F3F4F6';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!item.active) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                <span style={{ display: 'flex', opacity: item.disabled ? 0.4 : 1 }}>
                  {item.icon}
                </span>
                <span style={{ flex: 1 }}>{item.label}</span>
                {item.badge && (
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 600,
                      color: '#9CA3AF',
                      backgroundColor: '#F3F4F6',
                      padding: '1px 6px',
                      borderRadius: 4,
                      lineHeight: '18px',
                    }}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            </React.Fragment>
          );
        })}
      </nav>

      {/* 用户信息底部 */}
      <div
        style={{
          padding: '12px 16px',
          borderTop: '1px solid var(--color-border)',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            backgroundColor: 'var(--color-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: 13,
            fontWeight: 600,
            flexShrink: 0,
          }}
        >
          {user?.name?.[0] || 'U'}
        </div>
        <div style={{ overflow: 'hidden' }}>
          <div style={{ fontSize: 13, fontWeight: 500, color: '#1F2937', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {user?.name || '未登录'}
          </div>
          <div style={{ fontSize: 11, color: '#9CA3AF' }}>
            {user?.roles?.length ? user.roles.map((r) => ROLE_LABELS[r as keyof typeof ROLE_LABELS] || r).join('、') : '暂无角色'}
          </div>
        </div>
      </div>
    </aside>
  );
};

/* ── SVG Icon 组件 ── */

const DeviceIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
    <line x1="8" y1="21" x2="16" y2="21" />
    <line x1="12" y1="17" x2="12" y2="21" />
  </svg>
);

const LogIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="8" y1="13" x2="16" y2="13" />
    <line x1="8" y1="17" x2="16" y2="17" />
  </svg>
);

const RiskIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

const SettingsIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

const UserIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const ApprovalIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 11l3 3L22 4" />
    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
  </svg>
);

const HandoverIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="8.5" cy="7" r="4" />
    <polyline points="17 11 19 13 23 9" />
  </svg>
);

export default Sidebar;
