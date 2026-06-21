import React from 'react';
import { useSelectionStore } from '@/stores/selectionStore';
import { ENTITY_TYPE_LABELS } from '@/utils/constants';

/**
 * 面包屑导航组件
 * 显示层级导航路径: 设备名称 > 手机号 > 账号名称
 * 点击可跳转到对应层级
 */
const BreadCrumb: React.FC = () => {
  const { breadcrumb, setSelection } = useSelectionStore();

  if (breadcrumb.length === 0) return null;

  const handleClick = (item: (typeof breadcrumb)[0]) => {
    setSelection(item.type, item.id, {}, item.label);
  };

  return (
    <nav
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        fontSize: 13,
        color: '#6B7280',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
      }}
    >
      {breadcrumb.map((item, index) => {
        const isLast = index === breadcrumb.length - 1;
        return (
          <React.Fragment key={`${item.type}-${item.id}`}>
            {index > 0 && (
              <span style={{ color: '#D1D5DB', margin: '0 2px' }}>/</span>
            )}
            <button
              onClick={() => handleClick(item)}
              style={{
                background: 'none',
                border: 'none',
                padding: '2px 4px',
                cursor: isLast ? 'default' : 'pointer',
                color: isLast ? '#1F2937' : '#6B7280',
                fontWeight: isLast ? 600 : 400,
                fontSize: 13,
                maxWidth: 150,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                borderRadius: 4,
              }}
              title={item.label}
            >
              {item.label}
            </button>
          </React.Fragment>
        );
      })}
    </nav>
  );
};

export default BreadCrumb;
