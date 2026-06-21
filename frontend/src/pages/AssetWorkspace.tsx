import { useCallback, useEffect, useMemo, useState } from 'react';
import { api } from '../api/client';
import { AssetModal } from '../components/AssetModal';
import type {
  AssetEntity,
  AssetMeta,
  Device,
  InternetAccount,
  OperationLog,
  PhoneNumber,
  RiskItem,
  Stats,
  User,
  ViewType,
} from '../types/assets';

type Props = {
  user: User;
  onLogout: () => void;
};

type Section = 'assets' | 'logs' | 'risks' | 'settings';

const tabs: Array<{ id: ViewType; label: string }> = [
  { id: 'devices', label: '设备列表' },
  { id: 'phones', label: '手机号视图' },
  { id: 'accounts', label: '互联网账号视图' },
];

const navItems: Array<{ id: Section; label: string }> = [
  { id: 'assets', label: '账号资产' },
  { id: 'logs', label: '操作日志' },
  { id: 'risks', label: '风险提醒' },
  { id: 'settings', label: '系统设置' },
];

const pageSizeOptions = [10, 20, 50];

const fieldLabels: Record<string, string> = {
  id: 'ID',
  device_code: '设备编号',
  device_name: '设备名称',
  brand_model: '品牌型号',
  imei: 'IMEI',
  sim_type: 'SIM 类型',
  owner_subject: '所属主体',
  department_id: '部门 ID',
  department_name: '所属部门',
  owner_user_id: '负责人 ID',
  owner_name: '负责人',
  current_user_id: '当前使用人 ID',
  current_user_name: '当前使用人',
  status: '状态',
  risk_level: '风险等级',
  remark: '备注',
  device_id: '设备 ID',
  slot_type: '卡槽',
  phone_number_masked: '手机号',
  carrier: '运营商',
  monthly_fee: '月费',
  account_code: '账号编号',
  platform: '平台',
  account_name: '账号名称',
  login_account_masked: '登录账号',
  bind_phone_masked: '绑定手机号',
  bind_email: '绑定邮箱',
  permission_status: '权限状态',
};

function riskLabel(level: string) {
  return level === 'high' ? '高风险' : level === 'medium' ? '中风险' : level === 'low' ? '低风险' : '无风险';
}

function formatDate(value: string) {
  return new Date(value).toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
}

function StatusBadge({ value, tone = 'neutral' }: { value: string; tone?: string }) {
  return <span className={`badge ${tone}`}>{value}</span>;
}

export function AssetWorkspace({ user, onLogout }: Props) {
  const [section, setSection] = useState<Section>('assets');
  const [view, setView] = useState<ViewType>('devices');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [riskFilter, setRiskFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [items, setItems] = useState<AssetEntity[]>([]);
  const [total, setTotal] = useState(0);
  const [logs, setLogs] = useState<OperationLog[]>([]);
  const [risks, setRisks] = useState<RiskItem[]>([]);
  const [selected, setSelected] = useState<AssetEntity | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [meta, setMeta] = useState<AssetMeta | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [modalEntity, setModalEntity] = useState<AssetEntity | null | undefined>(undefined);

  const canWrite = user.roles.includes('admin');
  const title = useMemo(() => tabs.find((tab) => tab.id === view)?.label ?? '', [view]);
  const pageCount = useMemo(() => Math.max(1, Math.ceil(total / pageSize)), [pageSize, total]);

  const loadAssets = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [listResponse, statsResponse, metaResponse] = await Promise.all([api.list(view, { search, status: statusFilter, riskLevel: riskFilter, page, pageSize }), api.stats(), api.meta()]);
      setItems(listResponse.data);
      setTotal(listResponse.pagination.total);
      setStats(statsResponse.data);
      setMeta(metaResponse.data);
      setSelected((current) => {
        if (!current) return listResponse.data[0] ?? null;
        return listResponse.data.find((item) => item.id === current.id) ?? listResponse.data[0] ?? null;
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载失败');
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, riskFilter, search, statusFilter, view]);

  const loadSecondary = useCallback(async () => {
    if (section === 'logs') {
      const response = await api.logs();
      setLogs(response.data);
    }
    if (section === 'risks') {
      const response = await api.risks();
      setRisks(response.data);
    }
    if (section === 'settings') {
      const response = await api.meta();
      setMeta(response.data);
    }
  }, [section]);

  useEffect(() => {
    if (section === 'assets') {
      void loadAssets();
    } else {
      void loadSecondary().catch((err) => setError(err instanceof Error ? err.message : '加载失败'));
    }
  }, [loadAssets, loadSecondary, section]);

  useEffect(() => {
    setPage(1);
    setSelected(null);
  }, [riskFilter, search, statusFilter, view]);

  useEffect(() => {
    if (page > pageCount) {
      setPage(pageCount);
    }
  }, [page, pageCount]);

  async function submitModal(values: Record<string, unknown>) {
    if (modalEntity === undefined) return;
    setError('');
    const cleanedValues = Object.fromEntries(Object.entries(values).filter(([, value]) => value !== ''));
    try {
      if (modalEntity) {
        await api.update(view, modalEntity.id, cleanedValues);
      } else {
        await api.create(view, cleanedValues);
      }
      setModalEntity(undefined);
      await loadAssets();
    } catch (err) {
      setError(err instanceof Error ? err.message : '保存失败');
    }
  }

  async function removeSelected() {
    if (!selected || !window.confirm('确认注销当前资产？')) return;
    try {
      await api.remove(view, selected.id);
      setSelected(null);
      await loadAssets();
    } catch (err) {
      setError(err instanceof Error ? err.message : '注销失败');
    }
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">账号资产</div>
        <nav>
          {navItems.map((item) => (
            <button key={item.id} className={section === item.id ? 'active' : ''} onClick={() => setSection(item.id)}>
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      <main className="main-panel">
        <header className="topbar">
          <div>
            <span>首页</span>
            <strong>{navItems.find((item) => item.id === section)?.label}</strong>
          </div>
          <div className="user-box">
            <span>{user.name}</span>
            <span>{user.role}</span>
            <button onClick={onLogout}>退出</button>
          </div>
        </header>

        {section === 'assets' && (
          <>
            <section className="content-toolbar">
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="搜索设备名称、IMEI、手机号、账号名称..." />
              <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
                <option value="">全部状态</option>
                <option value="使用中">使用中</option>
                <option value="闲置">闲置</option>
                <option value="异常">异常</option>
              </select>
              <select value={riskFilter} onChange={(event) => setRiskFilter(event.target.value)}>
                <option value="">全部风险</option>
                <option value="high">高风险</option>
                <option value="medium">中风险</option>
                <option value="low">低风险</option>
                <option value="none">无风险</option>
              </select>
              {canWrite && <button className="primary-button" onClick={() => setModalEntity(null)}>新增</button>}
            </section>

            <section className="kpi-grid">
              <div><strong>{stats?.devices ?? '-'}</strong><span>设备总数</span></div>
              <div><strong>{stats?.phones ?? '-'}</strong><span>手机号</span></div>
              <div><strong>{stats?.accounts ?? '-'}</strong><span>互联网账号</span></div>
              <div><strong>{stats?.highRisk ?? '-'}</strong><span>高风险</span></div>
              <div><strong>{stats?.noOwner ?? '-'}</strong><span>无负责人</span></div>
            </section>

            <section className="tabs">
              {tabs.map((tab) => (
                <button key={tab.id} className={view === tab.id ? 'active' : ''} onClick={() => { setView(tab.id); setSelected(null); }}>
                  {tab.label}
                </button>
              ))}
            </section>

            {error && <div className="error-banner">{error}</div>}
            <section className="table-wrap">
              <h1>{title}</h1>
              {loading ? <div className="empty">加载中...</div> : <AssetTable view={view} items={items} selected={selected} onSelect={setSelected} />}
              <div className="table-footer">
                <span>共 {total} 条，第 {page} / {pageCount} 页</span>
                <div className="pagination-controls">
                  <select
                    value={pageSize}
                    onChange={(event) => {
                      setPageSize(Number(event.target.value));
                      setPage(1);
                    }}
                  >
                    {pageSizeOptions.map((size) => (
                      <option key={size} value={size}>{size} 条/页</option>
                    ))}
                  </select>
                  <button disabled={page <= 1 || loading} onClick={() => setPage((current) => Math.max(1, current - 1))}>上一页</button>
                  <button disabled={page >= pageCount || loading} onClick={() => setPage((current) => Math.min(pageCount, current + 1))}>下一页</button>
                </div>
              </div>
            </section>
          </>
        )}

        {section === 'logs' && <LogPanel logs={logs} />}
        {section === 'risks' && <RiskPanel risks={risks} />}
        {section === 'settings' && <SettingsPanel meta={meta} />}
      </main>

      <aside className="detail-panel">
        {section === 'assets' ? (
          <DetailPanel entity={selected} view={view} canWrite={canWrite} onEdit={() => selected && setModalEntity(selected)} onDelete={removeSelected} />
        ) : (
          <div className="detail-empty">详情面板会跟随资产列表展示</div>
        )}
      </aside>

      {modalEntity !== undefined && <AssetModal view={view} entity={modalEntity} meta={meta} onClose={() => setModalEntity(undefined)} onSubmit={submitModal} />}
    </div>
  );
}

function AssetTable({ view, items, selected, onSelect }: { view: ViewType; items: AssetEntity[]; selected: AssetEntity | null; onSelect: (entity: AssetEntity) => void }) {
  if (items.length === 0) return <div className="empty">暂无数据</div>;

  if (view === 'devices') {
    return (
      <table>
        <thead><tr><th>设备编号</th><th>设备名称</th><th>品牌型号</th><th>IMEI</th><th>部门</th><th>负责人</th><th>状态</th><th>风险</th><th>更新</th></tr></thead>
        <tbody>{(items as Device[]).map((item) => (
          <tr key={item.id} className={selected?.id === item.id ? 'selected' : ''} onClick={() => onSelect(item)}>
            <td>{item.device_code}</td><td>{item.device_name}</td><td>{item.brand_model}</td><td>{item.imei}</td><td>{item.department_name}</td><td>{item.owner_name ?? '-'}</td><td><StatusBadge value={item.status} /></td><td><StatusBadge value={riskLabel(item.risk_level)} tone={item.risk_level} /></td><td>{formatDate(item.updated_at)}</td>
          </tr>
        ))}</tbody>
      </table>
    );
  }

  if (view === 'phones') {
    return (
      <table>
        <thead><tr><th>手机号</th><th>运营商</th><th>所属设备</th><th>卡槽</th><th>负责人</th><th>月费</th><th>状态</th><th>风险</th><th>更新</th></tr></thead>
        <tbody>{(items as PhoneNumber[]).map((item) => (
          <tr key={item.id} className={selected?.id === item.id ? 'selected' : ''} onClick={() => onSelect(item)}>
            <td>{item.phone_number_masked}</td><td>{item.carrier}</td><td>{item.device_name}</td><td>{item.slot_type}</td><td>{item.owner_name ?? '-'}</td><td>{item.monthly_fee ?? '-'}</td><td><StatusBadge value={item.status} /></td><td><StatusBadge value={riskLabel(item.risk_level)} tone={item.risk_level} /></td><td>{formatDate(item.updated_at)}</td>
          </tr>
        ))}</tbody>
      </table>
    );
  }

  return (
    <table>
      <thead><tr><th>账号编号</th><th>平台</th><th>账号名称</th><th>登录账号</th><th>绑定手机号</th><th>负责人</th><th>权限</th><th>状态</th><th>风险</th></tr></thead>
      <tbody>{(items as InternetAccount[]).map((item) => (
        <tr key={item.id} className={selected?.id === item.id ? 'selected' : ''} onClick={() => onSelect(item)}>
          <td>{item.account_code}</td><td>{item.platform}</td><td>{item.account_name}</td><td>{item.login_account_masked}</td><td>{item.bind_phone_masked}</td><td>{item.owner_name ?? '-'}</td><td><StatusBadge value={item.permission_status} /></td><td><StatusBadge value={item.status} /></td><td><StatusBadge value={riskLabel(item.risk_level)} tone={item.risk_level} /></td>
        </tr>
      ))}</tbody>
    </table>
  );
}

function DetailPanel({ entity, view, canWrite, onEdit, onDelete }: { entity: AssetEntity | null; view: ViewType; canWrite: boolean; onEdit: () => void; onDelete: () => void }) {
  if (!entity) return <div className="detail-empty">请选择资产查看详情</div>;
  const rows = Object.entries(entity).filter(([key, value]) => typeof value !== 'object' && !key.endsWith('_at')).slice(0, 12);
  const title = view === 'devices' ? (entity as Device).device_name : view === 'accounts' ? (entity as InternetAccount).account_name : (entity as PhoneNumber).phone_number_masked;

  return (
    <div>
      <div className="detail-header">
        <span>{view === 'devices' ? '设备详情' : view === 'phones' ? '手机号详情' : '账号详情'}</span>
        {canWrite && <button className="ghost-button" onClick={onEdit}>编辑</button>}
      </div>
      <div className="detail-title">{title}</div>
      <div className="detail-list">
        {rows.map(([key, value]) => <div key={key}><span>{fieldLabels[key] ?? key}</span><strong>{String(value ?? '-')}</strong></div>)}
      </div>
      {canWrite && <button className="danger-button" onClick={onDelete}>注销资产</button>}
    </div>
  );
}

function LogPanel({ logs }: { logs: OperationLog[] }) {
  return (
    <section className="table-wrap standalone">
      <h1>操作日志</h1>
      <table>
        <thead><tr><th>时间</th><th>操作</th><th>对象类型</th><th>对象 ID</th><th>操作人</th></tr></thead>
        <tbody>{logs.map((log) => (
          <tr key={log.id}><td>{formatDate(log.created_at)}</td><td>{log.action_type}</td><td>{log.target_type}</td><td>{log.target_id ?? '-'}</td><td>{log.operator_name ?? '-'}</td></tr>
        ))}</tbody>
      </table>
    </section>
  );
}

function RiskPanel({ risks }: { risks: RiskItem[] }) {
  return (
    <section className="table-wrap standalone">
      <h1>风险提醒</h1>
      <table>
        <thead><tr><th>等级</th><th>风险标题</th><th>关联资产</th><th>原因</th><th>建议</th><th>检测时间</th></tr></thead>
        <tbody>{risks.map((risk) => (
          <tr key={risk.id}><td><StatusBadge value={riskLabel(risk.risk_level)} tone={risk.risk_level} /></td><td>{risk.risk_title}</td><td>{risk.entity_name}</td><td>{risk.risk_reason}</td><td>{risk.suggestion}</td><td>{formatDate(risk.detected_at)}</td></tr>
        ))}</tbody>
      </table>
    </section>
  );
}

function SettingsPanel({ meta }: { meta: AssetMeta | null }) {
  return (
    <section className="settings-panel">
      <h1>系统设置</h1>
      <div className="settings-grid">
        <div><strong>{meta?.users.length ?? '-'}</strong><span>用户</span></div>
        <div><strong>{meta?.departments.length ?? '-'}</strong><span>部门</span></div>
        <div><strong>3</strong><span>角色权限</span></div>
      </div>
    </section>
  );
}
