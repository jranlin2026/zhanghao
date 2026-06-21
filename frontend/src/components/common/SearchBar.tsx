import React, { useState, useEffect, useRef } from 'react';
import { useDebounce } from '@/hooks/useDebounce';
import { useEntitySearch } from '@/hooks/useEntitySearch';
import { useUIStore } from '@/stores/uiStore';
import StatusBadge from './StatusBadge';
import RiskBadge from './RiskBadge';

interface SearchBarProps {
  /** 占位文本 */
  placeholder?: string;
  /** 外部受控搜索关键词 */
  value?: string;
  /** 搜索回调 */
  onChange?: (value: string) => void;
  /** 是否显示下拉搜索结果 */
  showDropdown?: boolean;
}

/**
 * 全局搜索框
 * 300ms 防抖，自动跨三层搜索
 * 支持键盘导航 (上下键 + Enter)
 */
const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = '搜索设备名称/IMEI、手机号、账号名称/登录账号...',
  value: externalValue,
  onChange: externalOnChange,
  showDropdown = true,
}) => {
  const [internalValue, setInternalValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const value = externalValue !== undefined ? externalValue : internalValue;
  const setValue = externalOnChange || setInternalValue;

  const { results, isSearching, navigateToEntity, clearSearch } = useEntitySearch();
  const { showToast } = useUIStore();

  // 点击外部关闭下拉
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setIsFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 选中索引重置
  useEffect(() => {
    setSelectedIndex(-1);
  }, [results]);

  const hasResults = results.totalCount > 0;
  const allItems = [
    ...results.devices.map((d) => ({ type: 'device' as const, id: d.id, label: d.device_name, sub: d.device_code, data: d })),
    ...results.phones.map((p) => ({ type: 'phone' as const, id: p.id, label: p.phone_number, sub: p.carrier, data: p })),
    ...results.accounts.map((a) => ({ type: 'account' as const, id: a.id, label: a.account_name, sub: a.platform, data: a })),
  ];

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown || !isFocused || allItems.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) => (prev < allItems.length - 1 ? prev + 1 : 0));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : allItems.length - 1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < allItems.length) {
          const item = allItems[selectedIndex];
          navigateToEntity(item.type, item.id, item.data as Record<string, unknown>, item.label);
          setIsFocused(false);
        }
        break;
      case 'Escape':
        setIsFocused(false);
        break;
    }
  };

  return (
    <div style={{ position: 'relative', maxWidth: 480, width: '100%' }}>
      {/* 输入框 */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          backgroundColor: '#F3F4F6',
          borderRadius: 8,
          padding: '0 12px',
          border: isFocused ? '2px solid var(--color-primary)' : '2px solid transparent',
          transition: 'border-color 0.2s',
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2">
          <circle cx="11" cy="11" r="8" />
          <path d="M21 21l-4.35-4.35" />
        </svg>
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          style={{
            flex: 1,
            border: 'none',
            outline: 'none',
            backgroundColor: 'transparent',
            padding: '8px 8px',
            fontSize: 13,
            color: '#1F2937',
            width: '100%',
          }}
        />
        {value && (
          <button
            onClick={() => {
              setValue('');
              clearSearch();
            }}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#9CA3AF',
              fontSize: 16,
              lineHeight: 1,
              padding: 4,
            }}
          >
            ×
          </button>
        )}
        {isSearching && (
          <span style={{ fontSize: 12, color: '#9CA3AF', whiteSpace: 'nowrap' }}>搜索中...</span>
        )}
      </div>

      {/* 下拉搜索结果 */}
      {showDropdown && isFocused && value && hasResults && (
        <div
          ref={dropdownRef}
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            marginTop: 4,
            backgroundColor: 'white',
            borderRadius: 8,
            boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
            border: '1px solid var(--color-border)',
            zIndex: 1000,
            maxHeight: 400,
            overflow: 'auto',
          }}
        >
          {/* 设备结果 */}
          {results.devices.length > 0 && (
            <div>
              <div style={groupHeaderStyle}>设备</div>
              {results.devices.map((d, i) => {
                const idx = allItems.indexOf({ type: 'device', id: d.id, label: d.device_name, sub: d.device_code || '', data: d });
                return (
                  <SearchItem
                    key={`device-${d.id}`}
                    label={d.device_name}
                    sub={d.device_code}
                    selected={selectedIndex === idx}
                    onClick={() => {
                      navigateToEntity('device', d.id, d as unknown as Record<string, unknown>, d.device_name);
                      setIsFocused(false);
                    }}
                  />
                );
              })}
            </div>
          )}

          {/* 手机号结果 */}
          {results.phones.length > 0 && (
            <div>
              <div style={groupHeaderStyle}>手机号</div>
              {results.phones.map((p, i) => {
                const idx = allItems.indexOf({ type: 'phone', id: p.id, label: p.phone_number, sub: p.carrier, data: p });
                return (
                  <SearchItem
                    key={`phone-${p.id}`}
                    label={p.phone_number}
                    sub={p.carrier}
                    selected={selectedIndex === idx}
                    onClick={() => {
                      navigateToEntity('phone', p.id, p as unknown as Record<string, unknown>, p.phone_number);
                      setIsFocused(false);
                    }}
                  />
                );
              })}
            </div>
          )}

          {/* 账号结果 */}
          {results.accounts.length > 0 && (
            <div>
              <div style={groupHeaderStyle}>互联网账号</div>
              {results.accounts.map((a, i) => {
                const idx = allItems.indexOf({ type: 'account', id: a.id, label: a.account_name, sub: a.platform, data: a });
                return (
                  <SearchItem
                    key={`account-${a.id}`}
                    label={a.account_name}
                    sub={a.platform}
                    selected={selectedIndex === idx}
                    onClick={() => {
                      navigateToEntity('account', a.id, a as unknown as Record<string, unknown>, a.account_name);
                      setIsFocused(false);
                    }}
                  />
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 无结果提示 */}
      {showDropdown && isFocused && value && !isSearching && !hasResults && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            marginTop: 4,
            backgroundColor: 'white',
            borderRadius: 8,
            boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
            border: '1px solid var(--color-border)',
            zIndex: 1000,
            padding: '24px 16px',
            textAlign: 'center',
            fontSize: 13,
            color: '#9CA3AF',
          }}
        >
          未找到相关结果
        </div>
      )}
    </div>
  );
};

const groupHeaderStyle: React.CSSProperties = {
  padding: '6px 12px',
  fontSize: 11,
  fontWeight: 600,
  color: '#9CA3AF',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  backgroundColor: '#F9FAFB',
  borderBottom: '1px solid var(--color-border)',
};

interface SearchItemProps {
  label: string;
  sub: string;
  selected: boolean;
  onClick: () => void;
}

const SearchItem: React.FC<SearchItemProps> = ({ label, sub, selected, onClick }) => (
  <div
    onClick={onClick}
    style={{
      padding: '8px 12px',
      cursor: 'pointer',
      backgroundColor: selected ? '#F3F4F6' : 'transparent',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderBottom: '1px solid #F3F4F6',
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.backgroundColor = '#F9FAFB';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.backgroundColor = selected ? '#F3F4F6' : 'transparent';
    }}
  >
    <span style={{ fontSize: 14, color: '#1F2937', fontWeight: 500 }}>{label}</span>
    <span style={{ fontSize: 12, color: '#9CA3AF' }}>{sub}</span>
  </div>
);

export default SearchBar;
