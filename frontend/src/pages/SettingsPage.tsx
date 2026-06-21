import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getUsers, getDepartments, getRoles } from '@/api/admin';
import type { UserListItem } from '@/types/auth';
import type { DepartmentOption } from '@/utils/constants';
import { usePermission } from '@/hooks/usePermission';
import { formatDate } from '@/utils/formatters';

/** 设置 Tab */
type SettingsTab = 'users' | 'departments' | 'roles';

const SETTINGS_TABS: { key: SettingsTab; label: string }[] = [
  { key: 'users', label: '用户管理' },
  { key: 'departments', label: '部门管理' },
  { key: 'roles', label: '角色管理' },
];

/**
 * 系统设置页
 * 左侧设置导航 + 右侧内容区
 * 用户管理/部门管理/角色管理
 */
const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('users');
  const { canManage } = usePermission();

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <h1 style={{ fontSize: 20, fontWeight: 600, color: '#1F2937', margin: 0 }}>系统设置</h1>
        <p style={{ fontSize: 13, color: '#6B7280', margin: '4px 0 0' }}>管理用户、部门与角色配置</p>
      </div>

      <div style={{ display: 'flex', gap: 24 }}>
        {/* 左侧导航 */}
        <div
          style={{
            width: 200,
            flexShrink: 0,
            border: '1px solid var(--color-border)',
            borderRadius: 8,
            overflow: 'hidden',
            backgroundColor: 'var(--color-surface)',
            alignSelf: 'flex-start',
          }}
        >
          {SETTINGS_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                display: 'block',
                width: '100%',
                padding: '12px 16px',
                border: 'none',
                borderBottom: '1px solid var(--color-border)',
                backgroundColor: activeTab === tab.key ? 'var(--color-primary-bg)' : 'transparent',
                color: activeTab === tab.key ? 'var(--color-primary)' : '#374151',
                fontWeight: activeTab === tab.key ? 600 : 400,
                fontSize: 14,
                textAlign: 'left',
                cursor: 'pointer',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* 右侧内容区 */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {activeTab === 'users' && <UserManagement />}
          {activeTab === 'departments' && <DepartmentManagement />}
          {activeTab === 'roles' && <RoleManagement />}
        </div>
      </div>
    </div>
  );
};

/** ── 用户管理 ── */
const UserManagement: React.FC = () => {
  const { canManage } = usePermission();

  const { data: usersRes, isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => getUsers({ pageSize: 100 }),
  });

  const { data: deptsRes } = useQuery({
    queryKey: ['admin-departments'],
    queryFn: () => getDepartments(),
  });

  const users = usersRes?.data || [];
  const departments = deptsRes?.data || [];

  const getDeptName = (deptId: number | null) => {
    if (!deptId) return '-';
    return departments.find((d) => d.id === deptId)?.name || `ID:${deptId}`;
  };

  if (isLoading) {
    return <div style={{ color: '#9CA3AF', fontSize: 14, padding: 24 }}>加载中...</div>;
  }

  return (
    <div>
      <div style={{ border: '1px solid var(--color-border)', borderRadius: 8, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ backgroundColor: '#F9FAFB' }}>
              <th style={thStyle}>ID</th>
              <th style={thStyle}>姓名</th>
              <th style={thStyle}>邮箱</th>
              <th style={thStyle}>手机号</th>
              <th style={thStyle}>部门</th>
              <th style={thStyle}>角色</th>
              <th style={thStyle}>状态</th>
              <th style={thStyle}>创建时间</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ padding: 48, textAlign: 'center', color: '#9CA3AF' }}>暂无用户数据</td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} style={{ borderBottom: '1px solid #F3F4F6' }}>
                  <td style={tdStyle}>{user.id}</td>
                  <td style={{ ...tdStyle, fontWeight: 500 }}>{user.name}</td>
                  <td style={tdStyle}>{user.email || '-'}</td>
                  <td style={tdStyle}>{user.phone || '-'}</td>
                  <td style={tdStyle}>{getDeptName(user.department_id)}</td>
                  <td style={tdStyle}>{(user.role_names || []).join('、') || '-'}</td>
                  <td style={tdStyle}>{user.status}</td>
                  <td style={tdStyle}>{formatDate(user.created_at)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

/** ── 部门管理 ── */
const DepartmentManagement: React.FC = () => {
  const { data: deptsRes, isLoading } = useQuery({
    queryKey: ['admin-departments'],
    queryFn: () => getDepartments(),
  });

  const departments = deptsRes?.data || [];

  if (isLoading) {
    return <div style={{ color: '#9CA3AF', fontSize: 14, padding: 24 }}>加载中...</div>;
  }

  return (
    <div>
      <div style={{ border: '1px solid var(--color-border)', borderRadius: 8, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ backgroundColor: '#F9FAFB' }}>
              <th style={thStyle}>ID</th>
              <th style={thStyle}>部门名称</th>
              <th style={thStyle}>操作</th>
            </tr>
          </thead>
          <tbody>
            {departments.length === 0 ? (
              <tr>
                <td colSpan={3} style={{ padding: 48, textAlign: 'center', color: '#9CA3AF' }}>暂无部门数据</td>
              </tr>
            ) : (
              departments.map((dept) => (
                <tr key={dept.id} style={{ borderBottom: '1px solid #F3F4F6' }}>
                  <td style={tdStyle}>{dept.id}</td>
                  <td style={{ ...tdStyle, fontWeight: 500 }}>{dept.name}</td>
                  <td style={tdStyle}>
                    <span style={{ fontSize: 12, color: '#9CA3AF' }}>-</span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

/** ── 角色管理 ── */
const RoleManagement: React.FC = () => {
  const { data: rolesRes, isLoading } = useQuery({
    queryKey: ['admin-roles'],
    queryFn: () => getRoles(),
  });

  const roles = rolesRes?.data || [];

  if (isLoading) {
    return <div style={{ color: '#9CA3AF', fontSize: 14, padding: 24 }}>加载中...</div>;
  }

  return (
    <div>
      <div style={{ border: '1px solid var(--color-border)', borderRadius: 8, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ backgroundColor: '#F9FAFB' }}>
              <th style={thStyle}>角色编码</th>
              <th style={thStyle}>角色名称</th>
            </tr>
          </thead>
          <tbody>
            {roles.length === 0 ? (
              <tr>
                <td colSpan={2} style={{ padding: 48, textAlign: 'center', color: '#9CA3AF' }}>暂无角色数据</td>
              </tr>
            ) : (
              roles.map((role) => (
                <tr key={role.id} style={{ borderBottom: '1px solid #F3F4F6' }}>
                  <td style={tdStyle}>{role.code}</td>
                  <td style={{ ...tdStyle, fontWeight: 500 }}>{role.name}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const thStyle: React.CSSProperties = {
  padding: '10px 12px',
  textAlign: 'left',
  color: '#6B7280',
  fontWeight: 600,
  fontSize: 12,
  whiteSpace: 'nowrap',
  borderBottom: '1px solid var(--color-border)',
};

const tdStyle: React.CSSProperties = {
  padding: '8px 12px',
  color: '#374151',
  borderBottom: '1px solid #F3F4F6',
};

export default SettingsPage;
