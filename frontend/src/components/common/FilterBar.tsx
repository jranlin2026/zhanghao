import React from 'react';
import {
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  OutlinedInput,
  IconButton,
} from '@mui/material';
import { RestartAlt as ResetIcon } from '@mui/icons-material';

/** 筛选字段定义 */
interface FilterField {
  key: string;
  label: string;
  options: { value: string; label: string }[];
  width?: number;
}

interface FilterBarProps {
  /** 筛选字段列表 */
  fields: FilterField[];
  /** 当前筛选值 */
  values: Record<string, string>;
  /** 筛选值变更回调 */
  onChange: (key: string, value: string) => void;
  /** 重置所有筛选 */
  onReset: () => void;
}

/**
 * 多条件筛选栏
 * 6 维筛选条件 + 重置按钮
 * 支持：SIM 类型、平台类型、所属部门、负责人、状态、风险等级
 */
const FilterBar: React.FC<FilterBarProps> = ({ fields, values, onChange, onReset }) => {
  const hasActiveFilters = Object.values(values).some((v) => v && v !== '');

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        flexWrap: 'wrap',
        padding: '8px 0',
      }}
    >
      {fields.map((field) => (
        <FormControl key={field.key} size="small" sx={{ minWidth: field.width || 130 }}>
          <Select
            displayEmpty
            value={values[field.key] || ''}
            onChange={(e) => onChange(field.key, e.target.value)}
            input={<OutlinedInput />}
            renderValue={(selected) => {
              if (!selected || selected === '') {
                return <span style={{ color: '#9CA3AF', fontSize: 13 }}>{field.label}</span>;
              }
              const option = field.options.find((o) => o.value === selected);
              return <span style={{ fontSize: 13 }}>{option?.label || selected}</span>;
            }}
            sx={{
              fontSize: 13,
              borderRadius: '8px',
              '& .MuiOutlinedInput-notchedOutline': { borderColor: 'var(--color-border)' },
              '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#D1D5DB' },
              backgroundColor: values[field.key] ? 'var(--color-primary-bg)' : '#F9FAFB',
            }}
          >
            <MenuItem value="">
              <em style={{ color: '#9CA3AF' }}>全部</em>
            </MenuItem>
            {field.options.map((opt) => (
              <MenuItem key={opt.value} value={opt.value} sx={{ fontSize: 13 }}>
                {opt.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      ))}

      {hasActiveFilters && (
        <IconButton
          onClick={onReset}
          size="small"
          title="重置筛选"
          sx={{
            color: '#6B7280',
            '&:hover': { backgroundColor: '#F3F4F6' },
          }}
        >
          <ResetIcon fontSize="small" />
        </IconButton>
      )}
    </div>
  );
};

export default FilterBar;
