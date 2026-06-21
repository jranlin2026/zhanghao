import { createTheme } from '@mui/material/styles';

/**
 * MUI 主题配置
 * 对齐 DESIGN.md 的 Linear 蓝灰风格令牌
 */
const theme = createTheme({
  palette: {
    primary: {
      main: '#2B6CB0',
      light: '#EBF1FA',
      dark: '#1A4F8A',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#6B7280',
      light: '#F3F4F6',
      dark: '#4B5563',
    },
    error: {
      main: '#DC2626',
      light: '#FEF2F2',
    },
    warning: {
      main: '#D97706',
      light: '#FFFBEB',
    },
    success: {
      main: '#059669',
      light: '#ECFDF5',
    },
    info: {
      main: '#2563EB',
      light: '#EFF6FF',
    },
    text: {
      primary: '#1F2937',
      secondary: '#6B7280',
      disabled: '#9CA3AF',
    },
    background: {
      default: '#F7F8FA',
      paper: '#FFFFFF',
    },
    divider: '#F0F1F3',
  },
  typography: {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    h1: {
      fontSize: '24px',
      fontWeight: 700,
      lineHeight: 1.3,
      letterSpacing: '-0.01em',
    },
    h2: {
      fontSize: '20px',
      fontWeight: 600,
      lineHeight: 1.4,
      letterSpacing: '-0.005em',
    },
    h3: {
      fontSize: '18px',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h4: {
      fontSize: '16px',
      fontWeight: 600,
      lineHeight: 1.5,
    },
    body1: {
      fontSize: '14px',
      fontWeight: 400,
      lineHeight: 1.5,
    },
    body2: {
      fontSize: '13px',
      fontWeight: 400,
      lineHeight: 1.4,
    },
    caption: {
      fontSize: '12px',
      fontWeight: 400,
      lineHeight: 1.5,
      letterSpacing: '0.01em',
    },
    overline: {
      fontSize: '11px',
      fontWeight: 500,
      lineHeight: 1.4,
      letterSpacing: '0.02em',
    },
    button: {
      fontSize: '14px',
      fontWeight: 500,
      textTransform: 'none',
    },
  },
  shape: {
    borderRadius: 6,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          padding: '8px 16px',
          fontSize: '14px',
          fontWeight: 500,
          textTransform: 'none',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
        containedPrimary: {
          backgroundColor: '#2B6CB0',
          '&:hover': {
            backgroundColor: '#1A4F8A',
          },
          '&:active': {
            backgroundColor: '#0F3A6B',
          },
        },
        sizeSmall: {
          padding: '4px 12px',
          fontSize: '13px',
        },
      },
    },
    MuiTableContainer: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          border: '1px solid #E5E7EB',
          boxShadow: 'none',
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          '& .MuiTableCell-head': {
            backgroundColor: '#F9FAFB',
            color: '#6B7280',
            fontSize: '12px',
            fontWeight: 500,
            letterSpacing: '0.02em',
            borderBottom: '1px solid #F0F1F3',
          },
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:hover': {
            backgroundColor: '#F3F4F6',
          },
          '& td': {
            borderBottom: '1px solid #F0F1F3',
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          padding: '12px 16px',
          fontSize: '14px',
          color: '#1F2937',
          borderBottom: '1px solid #F0F1F3',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          height: 32,
          fontSize: '13px',
        },
        filled: {
          backgroundColor: '#F3F4F6',
          color: '#6B7280',
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 12,
          padding: '24px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
        },
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          fontSize: '18px',
          fontWeight: 600,
          padding: '0 0 16px 0',
          borderBottom: '1px solid #F0F1F3',
        },
      },
    },
    MuiDialogContent: {
      styleOverrides: {
        root: {
          padding: '24px 0',
        },
      },
    },
    MuiDialogActions: {
      styleOverrides: {
        root: {
          padding: '16px 0 0 0',
          borderTop: '1px solid #F0F1F3',
          justifyContent: 'flex-end',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 6,
            fontSize: '14px',
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          fontSize: '14px',
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          fontSize: '14px',
          fontWeight: 500,
          textTransform: 'none',
          minHeight: 36,
          padding: '0 16px',
          color: '#6B7280',
          '&.Mui-selected': {
            color: '#1F2937',
          },
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        indicator: {
          backgroundColor: '#2B6CB0',
          height: 2,
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: '#374151',
          borderRadius: 6,
          fontSize: '12px',
          padding: '6px 10px',
        },
      },
    },
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
          color: '#1F2937',
          backgroundColor: '#F7F8FA',
        },
      },
    },
  },
});

export default theme;
