import React, { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useNavigate } from 'react-router-dom';
import { useUIStore } from '@/stores/uiStore';
import { ROLE_LABELS } from '@/utils/constants';
import BreadCrumb from '@/components/common/BreadCrumb';
import SearchBar from '@/components/common/SearchBar';

interface HeaderProps {
  /** 是否显示搜索栏 */
  showSearch?: boolean;
}

/**
 * 顶部 Header
 * 左侧：面包屑导航
 * 右侧：用户头像/姓名 + 角色标签 + 退出登录
 */
const Header: React.FC<HeaderProps> = ({ showSearch = true }) => {
  const { user, logout } = useAuthStore();
  const { showToast } = useUIStore();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = () => {
    logout();
    showToast('info', '已退出登录');
    navigate('/login');
  };

  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'center',
        height: 56,
        padding: '0 24px',
        borderBottom: '1px solid var(--color-border)',
        backgroundColor: 'var(--color-surface)',
        gap: 16,
      }}
    >
      {/* 左侧面包屑 */}
      <BreadCrumb />

      <div style={{ flex: 1 }} />

      {/* 全局搜索 */}
      {showSearch && <SearchBar />}

      {/* 用户信息 */}
      <div style={{ position: 'relative' }}>
        <button
          onClick={() => setShowUserMenu(!showUserMenu)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '4px 8px',
            borderRadius: 8,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#F3F4F6';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: '50%',
              backgroundColor: 'var(--color-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            {user?.name?.[0] || 'U'}
          </div>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: 13, fontWeight: 500, color: '#1F2937', lineHeight: 1.2 }}>
              {user?.name || '未登录'}
            </div>
            <div style={{ fontSize: 11, color: '#9CA3AF', lineHeight: 1.2 }}>
              {user?.roles?.length
                ? user.roles.map((r) => ROLE_LABELS[r as keyof typeof ROLE_LABELS] || r).join('、')
                : '暂无角色'}
            </div>
          </div>
        </button>

        {/* 用户下拉菜单 */}
        {showUserMenu && (
          <>
            <div
              style={{ position: 'fixed', inset: 0, zIndex: 99 }}
              onClick={() => setShowUserMenu(false)}
            />
            <div
              style={{
                position: 'absolute',
                right: 0,
                top: '100%',
                marginTop: 4,
                backgroundColor: 'white',
                borderRadius: 8,
                boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
                border: '1px solid var(--color-border)',
                zIndex: 100,
                minWidth: 160,
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  padding: '10px 16px',
                  fontSize: 12,
                  color: '#9CA3AF',
                  borderBottom: '1px solid var(--color-border)',
                }}
              >
                {user?.email || user?.phone || '未设置联系方式'}
              </div>
              <button
                onClick={handleLogout}
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '10px 16px',
                  border: 'none',
                  background: 'none',
                  cursor: 'pointer',
                  fontSize: 13,
                  color: '#DC2626',
                  textAlign: 'left',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#FEF2F2'; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
              >
                退出登录
              </button>
            </div>
          </>
        )}
      </div>
    </header>
  );
};

export default Header;
