import { useEffect, useState } from 'react';
import { api } from './api/client';
import { AssetWorkspace } from './pages/AssetWorkspace';
import type { User } from './types/assets';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [name, setName] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const [booting, setBooting] = useState(true);
  const [loggingIn, setLoggingIn] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem('asset_token')) {
      setBooting(false);
      return;
    }
    api.profile()
      .then((response) => setUser(response.data))
      .catch(() => localStorage.removeItem('asset_token'))
      .finally(() => setBooting(false));
  }, []);

  async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setLoggingIn(true);
    try {
      const response = await api.login(name, password);
      localStorage.setItem('asset_token', response.data.token);
      setUser(response.data.user);
    } catch (err) {
      setError(err instanceof Error ? err.message : '登录失败');
    } finally {
      setLoggingIn(false);
    }
  }

  if (booting) {
    return <main className="login-screen">加载中...</main>;
  }

  if (!user) {
    return (
      <main className="login-screen">
        <form className="login-card" onSubmit={handleLogin}>
          <h1>公司账号资产管理系统</h1>
          <p>V2 资产台账闭环 MVP</p>
          <label><span>用户名</span><input value={name} onChange={(event) => setName(event.target.value)} /></label>
          <label><span>密码</span><input type="password" value={password} onChange={(event) => setPassword(event.target.value)} /></label>
          {error && <div className="error-banner">{error}</div>}
          <button className="primary-button" type="submit" disabled={loggingIn}>{loggingIn ? '登录中...' : '登录'}</button>
        </form>
      </main>
    );
  }

  return (
    <AssetWorkspace
      user={user}
      onLogout={() => {
        localStorage.removeItem('asset_token');
        setUser(null);
      }}
    />
  );
}

export default App;
