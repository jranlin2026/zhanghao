import { useState } from 'react';

function App() {
  const [loadFailed, setLoadFailed] = useState(false);

  if (loadFailed) {
    return (
      <main className="prototype-fallback">
        <h1>V2 原型加载失败</h1>
        <p>请确认 <code>/prototype-v2.html</code> 已存在于前端 public 目录。</p>
      </main>
    );
  }

  return (
    <iframe
      className="prototype-shell"
      title="公司账号资产管理系统 V2"
      src="/prototype-v2.html"
      onError={() => setLoadFailed(true)}
    />
  );
}

export default App;
