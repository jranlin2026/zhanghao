import React from 'react';
import { useSelectionStore } from '@/stores/selectionStore';
import { useUIStore } from '@/stores/uiStore';
import DeviceDetail from '@/components/detail-sections/DeviceDetail';
import PhoneDetail from '@/components/detail-sections/PhoneDetail';
import AccountDetail from '@/components/detail-sections/AccountDetail';
import BreadCrumb from '@/components/common/BreadCrumb';
import { DetailSkeleton } from '@/components/common/Skeleton';
import { ENTITY_TYPE_LABELS } from '@/utils/constants';

/**
 * 右侧详情面板容器
 * 从右侧滑入，宽度 380px
 * 遮罩层半透明黑，点击关闭
 * 根据 selectedEntity.type 渲染不同 detail-section
 */
const DetailPanel: React.FC = () => {
  const { selectedEntity, clearSelection } = useSelectionStore();
  const { detailPanelOpen, closePanel } = useUIStore();

  const isOpen = detailPanelOpen && selectedEntity !== null;

  const handleClose = () => {
    closePanel();
    clearSelection();
  };

  const renderContent = () => {
    if (!selectedEntity) return null;

    switch (selectedEntity.type) {
      case 'device':
        return <DeviceDetail deviceId={selectedEntity.id} />;
      case 'phone':
        return <PhoneDetail phoneId={selectedEntity.id} />;
      case 'account':
        return <AccountDetail accountId={selectedEntity.id} />;
      default:
        return <DetailSkeleton />;
    }
  };

  return (
    <>
      {/* 遮罩层 */}
      {isOpen && (
        <div
          onClick={handleClose}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
            zIndex: 199,
            transition: 'opacity 0.3s ease',
          }}
        />
      )}

      {/* 详情面板 */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          width: 380,
          height: '100vh',
          backgroundColor: 'var(--color-surface)',
          borderLeft: '1px solid var(--color-border)',
          zIndex: 200,
          display: 'flex',
          flexDirection: 'column',
          transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.25s ease-in-out',
          boxShadow: isOpen ? '-4px 0 20px rgba(0,0,0,0.08)' : 'none',
        }}
      >
        {/* 面板头部 */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 20px',
            borderBottom: '1px solid var(--color-border)',
            flexShrink: 0,
          }}
        >
          <div>
            <div style={{ fontSize: 12, color: '#9CA3AF', marginBottom: 4 }}>
              {selectedEntity ? ENTITY_TYPE_LABELS[selectedEntity.type] || '详情' : '详情'}
            </div>
            <BreadCrumb />
          </div>
          <button
            onClick={handleClose}
            style={{
              width: 28,
              height: 28,
              borderRadius: 6,
              border: 'none',
              backgroundColor: 'transparent',
              cursor: 'pointer',
              color: '#9CA3AF',
              fontSize: 18,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F3F4F6'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
          >
            ×
          </button>
        </div>

        {/* 面板内容 */}
        <div style={{ flex: 1, overflow: 'auto' }}>
          {isOpen ? renderContent() : <DetailSkeleton />}
        </div>
      </div>
    </>
  );
};

export default DetailPanel;
