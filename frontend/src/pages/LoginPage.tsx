import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TextField, Button, CircularProgress, Alert } from '@mui/material';
import { login } from '@/api/auth';
import { useAuthStore } from '@/stores/authStore';

/**
 * 登录页面
 *
 * - 用户名 + 密码表单
 * - 调用 login API
 * - 成功后存储 token 到 localStorage + 跳转到 /
 */
const LoginPage: React.FC = () => {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { login: setAuth } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !password.trim()) {
      setError('请输入用户名和密码');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await login({ name: name.trim(), password });
      const { token, user } = res.data;
      setAuth(user, token);
      navigate('/', { replace: true });
    } catch (err: any) {
      setError(err.message || '登录失败，请检查用户名和密码');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: 'var(--color-bg-primary)',
      }}
    >
      <div
        style={{
          width: 400,
          padding: 40,
          backgroundColor: '#FFFFFF',
          borderRadius: 12,
          boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
        }}
      >
        {/* Logo 和标题 */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              backgroundColor: 'var(--color-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: 24,
              fontWeight: 700,
              margin: '0 auto 16px',
            }}
          >
            A
          </div>
          <h1 style={{ fontSize: 20, fontWeight: 600, color: '#1F2937', margin: 0 }}>
            账号资产管理系统
          </h1>
          <p style={{ fontSize: 14, color: '#6B7280', margin: '8px 0 0' }}>
            请登录您的账号
          </p>
        </div>

        {/* 错误提示 */}
        {error && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        {/* 登录表单 */}
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            size="small"
            label="用户名"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={loading}
            autoFocus
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            size="small"
            label="密码"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            sx={{ mb: 3 }}
          />
          <Button
            fullWidth
            type="submit"
            variant="contained"
            size="large"
            disabled={loading}
            sx={{
              height: 44,
              fontSize: 15,
              fontWeight: 600,
              textTransform: 'none',
              borderRadius: 2,
            }}
          >
            {loading ? <CircularProgress size={20} sx={{ color: 'white' }} /> : '登 录'}
          </Button>
        </form>

        {/* 底部提示 */}
        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <p style={{ fontSize: 12, color: '#9CA3AF', margin: 0 }}>
            默认管理员账号: admin / admin123
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
