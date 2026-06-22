import { useCallback, useEffect, useMemo, useState } from 'react';
import { api } from '../api/client';
import { AssetModal } from '../components/AssetModal';
import type {
  AdminDepartment,
  AdminUser,
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

const navItems: Array<{ id: Section; label: string; icon: string }> = [
  { id: 'assets', label: '账号资产', icon: 'folder' },
  { id: 'logs', label: '操作日志', icon: 'history' },
  { id: 'risks', label: '风险提醒', icon: 'alert' },
  { id: 'settings', label: '系统设置', icon: 'gear' },
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

function Icon({ name }: { name: string }) {
  return <span className={`ui-icon ui-icon-${name}`} aria-hidden="true" />;
}

function riskLabel(level: string) {
  if (level === 'high') return '高风险';
  if (level === 'medium') return '中风险';
  if (level === 'low') return '低风险';
  return '无风险';
}

function riskTone(level: string) {
  if (level === 'high') return 'danger';
  if (level === 'medium') return 'warning';
  if (level === 'low') return 'idle';
  return 'success';
}

function statusTone(value: string) {
  if (value.includes('异常') || value.includes('注销') || value.includes('禁用')) return 'danger';
  if (value.includes('闲置')) return 'idle';
  if (value.includes('待') || value.includes('复核')) return 'warning';
  return 'success';
}

function formatDate(value: string | Date) {
  return new Date(value).toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
}

function StatusBadge({ value, tone }: { value: string; tone?: string }) {
  return <span className={`badge badge-${tone ?? statusTone(value)}`}>{value}</span>;
}

function RiskBadge({ value }: { value: string }) {
  return (
    <span className={`badge badge-${riskTone(value)}`}>
      <span className={`risk-dot ${value === 'high' ? 'high' : value === 'medium' ? 'mid' : 'low'}`} />
      {riskLabel(value)}
    </span>
  );
}

function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedValue(value), delayMs);
    return () => window.clearTimeout(timer);
  }, [delayMs, value]);

  return debouncedValue;
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
  const [logTotal, setLogTotal] = useState(0);
  const [risks, setRisks] = useState<RiskItem[]>([]);
  const [riskTotal, setRiskTotal] = useState(0);
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [adminDepartments, setAdminDepartments] = useState<AdminDepartment[]>([]);
  const [selected, setSelected] = useState<AssetEntity | null>(null);
  const [checkedIds, setCheckedIds] = useState<Set<number>>(new Set());
  const [stats, setStats] = useState<Stats | null>(null);
  const [meta, setMeta] = useState<AssetMeta | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [modalEntity, setModalEntity] = useState<AssetEntity | null | undefined>(undefined);

  const canWrite = user.roles.includes('admin');
  const pageCount = useMemo(() => Math.max(1, Math.ceil(total / pageSize)), [pageSize, total]);
  const debouncedSearch = useDebouncedValue(search, 300);
  const currentSectionLabel = navItems.find((item) => item.id === section)?.label ?? '';

  const loadAssets = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [listResponse, statsResponse, metaResponse] = await Promise.all([
        api.list(view, { search: debouncedSearch, status: statusFilter, riskLevel: riskFilter, page, pageSize }),
        api.stats(),
        api.meta(),
      ]);
      setItems(listResponse.data);
      setTotal(listResponse.pagination.total);
      setStats(statsResponse.data);
      setMeta(metaResponse.data);
      setCheckedIds(new Set());
      setSelected((current) => {
        if (!current) return listResponse.data[0] ?? null;
        return listResponse.data.find((item) => item.id === current.id) ?? listResponse.data[0] ?? null;
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载失败');
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, page, pageSize, riskFilter, statusFilter, view]);

  const loadSecondary = useCallback(async () => {
    setError('');
    if (section === 'logs') {
      const response = await api.logs();
      setLogs(response.data);
      setLogTotal(response.pagination.total);
    }
    if (section === 'risks') {
      const response = await api.risks();
      setRisks(response.data);
      setRiskTotal(response.pagination.total);
    }
    if (section === 'settings') {
      const [metaResponse, usersResponse, departmentsResponse] = await Promise.all([api.meta(), api.adminUsers(), api.adminDepartments()]);
      setMeta(metaResponse.data);
      setAdminUsers(usersResponse.data);
      setAdminDepartments(usersResponse.data.length ? departmentsResponse.data : departmentsResponse.data);
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
    setCheckedIds(new Set());
  }, [riskFilter, search, statusFilter, view]);

  useEffect(() => {
    if (page > pageCount) setPage(pageCount);
  }, [page, pageCount]);

  function toggleChecked(id: number, checked: boolean) {
    setCheckedIds((current) => {
      const next = new Set(current);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  function toggleAll(checked: boolean) {
    setCheckedIds(checked ? new Set(items.map((item) => item.id)) : new Set());
  }

  async function submitModal(values: Record<string, unknown>) {
    if (modalEntity === undefined) return;
    setError('');
    const cleanedValues = Object.fromEntries(Object.entries(values).filter(([, value]) => value !== ''));
    try {
      if (modalEntity) await api.update(view, modalEntity.id, cleanedValues);
      else await api.create(view, cleanedValues);
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
    <div className="app-container">
      <header className="header">
        <div className="header-left">
          <div className="breadcrumb">
            <span>首页</span>
            <Icon name="chevron" />
            <span>{currentSectionLabel}</span>
          </div>
        </div>
        <div className="header-right">
          <select className="role-select" value={user.role} disabled>
            <option value="admin">管理员</option>
            <option value="boss">老板</option>
            <option value="employee">普通员工</option>
          </select>
          <div className="user-avatar">{user.name.slice(0, 1).toUpperCase()}</div>
          <button className="logout-btn" onClick={onLogout}><Icon name="logout" />退出</button>
        </div>
      </header>

      <div className="body-wrapper">
        <nav className="sidebar">
          <div className="sidebar-logo"><Icon name="shield" />账号资产</div>
          <div className="sidebar-nav">
            {navItems.map((item) => (
              <button key={item.id} className={`nav-item ${section === item.id ? 'active' : ''}`} onClick={() => setSection(item.id)}>
                <Icon name={item.icon} />
                {item.label}
              </button>
            ))}
            <button className="nav-item disabled"><Icon name="users" />员工使用 <span className="badge-v2">V2</span></button>
            <button className="nav-item disabled"><Icon name="check" />申请审批 <span className="badge-v2">V2</span></button>
            <button className="nav-item disabled"><Icon name="transfer" />离职交接 <span className="badge-v2">V3</span></button>
          </div>
        </nav>

        <main className="main-content">
          {section === 'assets' && (
            <div className="page-section active">
              <div className="asset-top-bar">
                <div className="search-row">
                  <div className="search-box">
                    <Icon name="search" />
                    <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="搜索设备名称、IMEI、手机号、账号名称…" />
                    {search && <button className="search-clear visible" onClick={() => setSearch('')}><Icon name="close" /></button>}
                  </div>
                  <div className="search-actions">
                    {canWrite && <button className="btn btn-primary" onClick={() => setModalEntity(null)}><Icon name="plus" />新增{view === 'devices' ? '设备' : view === 'phones' ? '手机号' : '账号'}</button>}
                  </div>
                </div>

                <KpiBar stats={stats} onStatusFilter={setStatusFilter} onRiskFilter={setRiskFilter} />

                <div className="view-tabs">
                  {tabs.map((tab) => (
                    <button key={tab.id} className={`view-tab ${view === tab.id ? 'active' : ''}`} onClick={() => { setView(tab.id); setSelected(null); }}>
                      {tab.label}
                    </button>
                  ))}
                </div>

                <div className="filter-bar">
                  <div className="filter-item"><select className="select" value="" onChange={() => undefined}><option value="">SIM类型</option><option>单卡</option><option>双卡</option></select></div>
                  <div className="filter-item"><select className="select" value="" onChange={() => undefined}><option value="">平台类型</option><option>微信</option><option>抖音</option><option>小红书</option><option>Google</option></select></div>
                  <div className="filter-item"><select className="select" value="" onChange={() => undefined}><option value="">所属部门</option>{meta?.departments.map((item) => <option key={item.id}>{item.name}</option>)}</select></div>
                  <div className="filter-item"><select className="select" value="" onChange={() => undefined}><option value="">负责人</option>{meta?.users.map((item) => <option key={item.id}>{item.name}</option>)}</select></div>
                  <div className="filter-item">
                    <select className="select" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
                      <option value="">状态</option>
                      <option value="使用中">使用中</option>
                      <option value="闲置">闲置</option>
                      <option value="异常">异常</option>
                      <option value="已注销">已注销</option>
                    </select>
                  </div>
                  <div className="filter-item">
                    <select className="select" value={riskFilter} onChange={(event) => setRiskFilter(event.target.value)}>
                      <option value="">风险等级</option>
                      <option value="high">高</option>
                      <option value="medium">中</option>
                      <option value="low">低</option>
                      <option value="none">无</option>
                    </select>
                  </div>
                </div>

                <div className={`batch-bar ${checkedIds.size ? 'visible' : ''}`}>
                  <span className="batch-count">已选 <strong>{checkedIds.size}</strong> 项</span>
                  <button className="btn btn-secondary btn-sm"><Icon name="lock" />收回权限</button>
                  <button className="btn btn-secondary btn-sm"><Icon name="users" />移交负责人</button>
                  <button className="btn btn-secondary btn-sm"><Icon name="alert" />标记高风险</button>
                  <button className="btn btn-secondary btn-sm"><Icon name="download" />导出所选</button>
                </div>
              </div>

              {error && <div className="error-banner">{error}</div>}
              <section className="table-wrapper">
                <div className="table-scroll">
                  {loading ? <div className="empty-state">加载中...</div> : <AssetTable view={view} items={items} selected={selected} checkedIds={checkedIds} onSelect={setSelected} onToggle={toggleChecked} onToggleAll={toggleAll} />}
                </div>
              </section>
              <div className="table-pagination">
                <span>共 {total} 条，第 {page} / {pageCount} 页</span>
                <div>
                  <select className="select" value={pageSize} onChange={(event) => { setPageSize(Number(event.target.value)); setPage(1); }}>
                    {pageSizeOptions.map((size) => <option key={size} value={size}>{size} 条/页</option>)}
                  </select>
                  <button className="btn btn-secondary btn-sm" disabled={page <= 1 || loading} onClick={() => setPage((current) => Math.max(1, current - 1))}><Icon name="left" /></button>
                  <button className="btn btn-secondary btn-sm" disabled={page >= pageCount || loading} onClick={() => setPage((current) => Math.min(pageCount, current + 1))}><Icon name="right" /></button>
                </div>
              </div>
            </div>
          )}

          {section === 'logs' && <LogPanel logs={logs} total={logTotal} />}
          {section === 'risks' && <RiskPanel risks={risks} total={riskTotal} />}
          {section === 'settings' && <SettingsPanel meta={meta} users={adminUsers} departments={adminDepartments} canWrite={canWrite} onRefresh={loadSecondary} />}
        </main>

        <aside className="right-panel">
          {section === 'assets' ? (
            <DetailPanel entity={selected} view={view} canWrite={canWrite} onEdit={() => selected && setModalEntity(selected)} onDelete={removeSelected} />
          ) : (
            <div className="panel-body detail-empty">详情面板会跟随资产列表展示</div>
          )}
        </aside>
      </div>

      {modalEntity !== undefined && <AssetModal view={view} entity={modalEntity} meta={meta} onClose={() => setModalEntity(undefined)} onSubmit={submitModal} />}
    </div>
  );
}

function KpiBar({ stats, onStatusFilter, onRiskFilter }: { stats: Stats | null; onStatusFilter: (value: string) => void; onRiskFilter: (value: string) => void }) {
  const cards = [
    { label: '设备总数', value: stats?.devices ?? '-', tone: 'primary', action: () => { onStatusFilter(''); onRiskFilter(''); } },
    { label: '手机号', value: stats?.phones ?? '-', tone: 'success', action: () => { onStatusFilter('使用中'); onRiskFilter(''); } },
    { label: '互联网账号', value: stats?.accounts ?? '-', tone: 'idle', action: () => undefined },
    { label: '高风险', value: stats?.highRisk ?? '-', tone: 'danger', action: () => onRiskFilter('high') },
    { label: '无负责人', value: stats?.noOwner ?? '-', tone: 'warning', action: () => undefined },
  ];
  return (
    <div className="kpi-bar">
      {cards.map((card) => (
        <button key={card.label} className="kpi-card" onClick={card.action}>
          <span className={`kpi-bar-indicator ${card.tone}`} />
          <span className="kpi-info">
            <span className={`kpi-number ${card.tone === 'danger' ? 'danger-text' : ''}`}>{card.value}</span>
            <span className="kpi-label">{card.label}</span>
          </span>
        </button>
      ))}
    </div>
  );
}

function AssetTable({
  view,
  items,
  selected,
  checkedIds,
  onSelect,
  onToggle,
  onToggleAll,
}: {
  view: ViewType;
  items: AssetEntity[];
  selected: AssetEntity | null;
  checkedIds: Set<number>;
  onSelect: (entity: AssetEntity) => void;
  onToggle: (id: number, checked: boolean) => void;
  onToggleAll: (checked: boolean) => void;
}) {
  if (items.length === 0) {
    return (
      <div className="empty-state">
        <Icon name={view === 'devices' ? 'phone' : view === 'phones' ? 'call' : 'globe'} />
        <p>暂无数据</p>
      </div>
    );
  }

  const allChecked = items.length > 0 && items.every((item) => checkedIds.has(item.id));

  if (view === 'devices') {
    return (
      <table className="data-table">
        <thead><tr><th className="col-checkbox"><input type="checkbox" checked={allChecked} onChange={(event) => onToggleAll(event.target.checked)} /></th><th>设备编号</th><th>设备名称</th><th>品牌型号</th><th>IMEI</th><th>SIM类型</th><th>绑定账号数</th><th>所属部门</th><th>负责人</th><th>当前使用人</th><th>设备状态</th><th>风险等级</th><th>更新时间</th></tr></thead>
        <tbody>{(items as Device[]).map((item) => (
          <tr key={item.id} className={`clickable ${selected?.id === item.id ? 'selected' : ''}`} onClick={() => onSelect(item)}>
            <td className="col-checkbox" onClick={(event) => event.stopPropagation()}><input type="checkbox" checked={checkedIds.has(item.id)} onChange={(event) => onToggle(item.id, event.target.checked)} /></td>
            <td className="link-cell">{item.device_code}</td><td>{item.device_name}</td><td>{item.brand_model}</td><td>{item.imei}</td><td>{item.sim_type === 'dual' ? '双卡' : '单卡'}</td><td>{item.phone_numbers?.reduce((sum, phone) => sum + (phone.internet_accounts?.length ?? 0), 0) ?? 0}</td><td>{item.department_name ?? '-'}</td><td>{item.owner_name ?? '-'}</td><td>{item.current_user_name ?? '-'}</td><td><StatusBadge value={item.status} /></td><td><RiskBadge value={item.risk_level} /></td><td>{formatDate(item.updated_at)}</td>
          </tr>
        ))}</tbody>
      </table>
    );
  }

  if (view === 'phones') {
    return (
      <table className="data-table">
        <thead><tr><th className="col-checkbox"><input type="checkbox" checked={allChecked} onChange={(event) => onToggleAll(event.target.checked)} /></th><th>手机号</th><th>运营商</th><th>所属设备</th><th>SIM卡槽</th><th>绑定账号数</th><th>负责人</th><th>月费用</th><th>状态</th><th>风险等级</th></tr></thead>
        <tbody>{(items as PhoneNumber[]).map((item) => (
          <tr key={item.id} className={`clickable ${selected?.id === item.id ? 'selected' : ''}`} onClick={() => onSelect(item)}>
            <td className="col-checkbox" onClick={(event) => event.stopPropagation()}><input type="checkbox" checked={checkedIds.has(item.id)} onChange={(event) => onToggle(item.id, event.target.checked)} /></td>
            <td className="masked-text">{item.phone_number_masked}</td><td>{item.carrier}</td><td>{item.device_name ?? '-'}</td><td>{item.slot_type}</td><td>{item.internet_accounts?.length ?? 0}</td><td>{item.owner_name ?? '-'}</td><td>{item.monthly_fee ? `¥${item.monthly_fee}` : '-'}</td><td><StatusBadge value={item.status} /></td><td><RiskBadge value={item.risk_level} /></td>
          </tr>
        ))}</tbody>
      </table>
    );
  }

  return (
    <table className="data-table">
      <thead><tr><th className="col-checkbox"><input type="checkbox" checked={allChecked} onChange={(event) => onToggleAll(event.target.checked)} /></th><th>账号编号</th><th>平台</th><th>账号名称</th><th>登录账号</th><th>绑定手机号</th><th>负责人</th><th>当前使用人</th><th>权限状态</th><th>账号状态</th><th>风险等级</th></tr></thead>
      <tbody>{(items as InternetAccount[]).map((item) => (
        <tr key={item.id} className={`clickable ${selected?.id === item.id ? 'selected' : ''}`} onClick={() => onSelect(item)}>
          <td className="col-checkbox" onClick={(event) => event.stopPropagation()}><input type="checkbox" checked={checkedIds.has(item.id)} onChange={(event) => onToggle(item.id, event.target.checked)} /></td>
          <td className="link-cell">{item.account_code}</td><td><StatusBadge value={item.platform} tone="primary" /></td><td>{item.account_name}</td><td className="masked-text">{item.login_account_masked}</td><td className="masked-text">{item.bind_phone_masked}</td><td>{item.owner_name ?? '-'}</td><td>{item.current_user_name ?? '-'}</td><td><StatusBadge value={item.permission_status} /></td><td><StatusBadge value={item.status} /></td><td><RiskBadge value={item.risk_level} /></td>
        </tr>
      ))}</tbody>
    </table>
  );
}

function DetailPanel({ entity, view, canWrite, onEdit, onDelete }: { entity: AssetEntity | null; view: ViewType; canWrite: boolean; onEdit: () => void; onDelete: () => void }) {
  if (!entity) {
    return (
      <>
        <div className="panel-header"><div className="panel-title-row"><h3>资产详情</h3></div></div>
        <div className="panel-body detail-empty">请选择资产查看详情</div>
      </>
    );
  }

  const title = view === 'devices' ? (entity as Device).device_name : view === 'accounts' ? (entity as InternetAccount).account_name : (entity as PhoneNumber).phone_number_masked;
  const rows = Object.entries(entity).filter(([key, value]) => typeof value !== 'object' && !key.endsWith('_at')).slice(0, 14);

  return (
    <>
      <div className="panel-header">
        <div className="panel-breadcrumb"><span className="crumb-current">{view === 'devices' ? '设备详情' : view === 'phones' ? '手机号详情' : '互联网账号详情'}</span></div>
        <div className="panel-title-row">
          <h3>{title}</h3>
          {canWrite && <button className="btn btn-ghost btn-sm" onClick={onEdit}><Icon name="edit" />编辑</button>}
        </div>
      </div>
      <div className="panel-body">
        <div className="detail-section">
          <h4>摘要</h4>
          {rows.slice(0, 7).map(([key, value]) => <DetailField key={key} label={fieldLabels[key] ?? key} value={String(value ?? '-')} masked={key.includes('masked')} />)}
        </div>
        <div className="detail-section">
          <h4>属性</h4>
          {rows.slice(7).map(([key, value]) => <DetailField key={key} label={fieldLabels[key] ?? key} value={String(value ?? '-')} masked={key.includes('masked')} />)}
        </div>
        <RelatedAssets entity={entity} view={view} />
        <div className="detail-section">
          <h4>风险摘要</h4>
          <div className={`risk-item risk-${(entity as { risk_level?: string }).risk_level === 'high' ? 'high' : (entity as { risk_level?: string }).risk_level === 'medium' ? 'mid' : 'low'}`}>
            <div className="risk-title"><RiskBadge value={(entity as { risk_level?: string }).risk_level ?? 'none'} /></div>
            <div className="risk-desc">系统根据负责人、绑定关系和状态自动计算基础风险。</div>
          </div>
        </div>
        <div className="detail-tabs">
          <button className="detail-tab active">使用记录</button>
          <button className="detail-tab">修改记录</button>
          <button className="detail-tab">操作日志</button>
        </div>
        <div className="detail-tab-content">暂无记录</div>
        {canWrite && <button className="btn btn-secondary btn-danger panel-danger" onClick={onDelete}><Icon name="trash" />注销资产</button>}
      </div>
    </>
  );
}

function DetailField({ label, value, masked }: { label: string; value: string; masked?: boolean }) {
  return <div className="detail-field"><span className="field-label">{label}</span><span className={`field-value ${masked ? 'masked' : ''}`}>{value}</span></div>;
}

function RelatedAssets({ entity, view }: { entity: AssetEntity; view: ViewType }) {
  if (view === 'devices') {
    const device = entity as Device;
    return (
      <div className="detail-section">
        <h4>绑定手机号</h4>
        {device.phone_numbers?.length ? device.phone_numbers.map((phone) => (
          <div className="detail-card-item" key={phone.id}>
            <div className="item-title">{phone.slot_type} · {phone.phone_number_masked}</div>
            <div className="item-sub">{phone.carrier} · 绑定 {phone.internet_accounts?.length ?? 0} 个账号</div>
          </div>
        )) : <div className="detail-muted">暂无绑定手机号</div>}
      </div>
    );
  }
  if (view === 'phones') {
    const phone = entity as PhoneNumber;
    return (
      <div className="detail-section">
        <h4>绑定的互联网账号</h4>
        {phone.internet_accounts?.length ? phone.internet_accounts.map((account) => (
          <div className="detail-card-item" key={account.id}>
            <div className="item-title"><StatusBadge value={account.platform} tone="primary" /> {account.account_name}</div>
            <div className="item-sub">{account.status} · {riskLabel(account.risk_level)}</div>
          </div>
        )) : <div className="detail-muted">暂无绑定互联网账号</div>}
      </div>
    );
  }
  return null;
}

function LogPanel({ logs, total }: { logs: OperationLog[]; total: number }) {
  const todayCount = logs.filter((log) => new Date(log.created_at).toDateString() === new Date().toDateString()).length;
  return (
    <div className="page-section active">
      <h2 className="page-title">操作日志</h2>
      <div className="inline-stats">
        <span className="inline-stat"><strong>{todayCount}</strong><small>条今日</small></span>
        <span className="inline-stat"><strong>{logs.length}</strong><small>条当前页</small></span>
        <span className="inline-stat"><strong>{total}</strong><small>条共</small></span>
      </div>
      <div className="log-filter-bar">
        <input className="input" placeholder="操作人" />
        <select className="select"><option>操作类型</option><option>新增</option><option>编辑</option><option>删除</option></select>
        <select className="select"><option>目标类型</option><option>设备</option><option>手机号</option><option>互联网账号</option></select>
        <input className="input" type="date" />
        <input className="input" type="date" />
        <button className="btn btn-primary btn-sm"><Icon name="search" />搜索</button>
      </div>
      <div className="table-wrapper"><div className="table-scroll"><table className="data-table"><thead><tr><th>操作时间</th><th>操作类型</th><th>目标类型</th><th>操作对象</th><th>操作人</th><th>操作详情</th></tr></thead><tbody>{logs.map((log) => <tr key={log.id}><td>{formatDate(log.created_at)}</td><td>{log.action_type}</td><td>{log.target_type}</td><td>{log.target_id ?? '-'}</td><td>{log.operator_name ?? '-'}</td><td><button className="btn btn-ghost btn-sm">查看</button></td></tr>)}</tbody></table>{logs.length === 0 && <div className="empty-state">暂无操作日志</div>}</div></div>
      <div className="table-pagination"><span>共 {total} 条</span></div>
    </div>
  );
}

function RiskPanel({ risks, total }: { risks: RiskItem[]; total: number }) {
  const high = risks.filter((risk) => risk.risk_level === 'high').length;
  return (
    <div className="page-section active">
      <h2 className="page-title">风险提醒</h2>
      <div className="risk-stats">
        <div className="risk-stat-card"><div className="stat-num danger">{high}</div><div className="stat-label">高风险</div></div>
        <div className="risk-stat-card"><div className="stat-num idle">{risks.length - high}</div><div className="stat-label">需关注</div></div>
        <div className="risk-stat-card"><div className="stat-num success">0</div><div className="stat-label">已解决</div></div>
      </div>
      <div className="log-filter-bar">
        <select className="select"><option>风险等级</option><option>高</option><option>中</option><option>低</option></select>
        <select className="select"><option>实体类型</option><option>设备</option><option>手机号</option><option>互联网账号</option></select>
        <button className="btn btn-primary btn-sm"><Icon name="search" />搜索</button>
      </div>
      <div className="table-wrapper"><div className="table-scroll"><table className="data-table"><thead><tr><th>等级</th><th>风险标题</th><th>关联资产</th><th>原因</th><th>建议</th><th>检测时间</th></tr></thead><tbody>{risks.map((risk) => <tr key={risk.id}><td><RiskBadge value={risk.risk_level} /></td><td>{risk.risk_title}</td><td>{risk.entity_name}</td><td>{risk.risk_reason}</td><td>{risk.suggestion}</td><td>{formatDate(risk.detected_at)}</td></tr>)}</tbody></table>{risks.length === 0 && <div className="empty-state">暂无风险提醒</div>}</div></div>
      <div className="table-pagination"><span>共 {total} 条</span></div>
    </div>
  );
}

function SettingsPanel({ meta, users, departments, canWrite, onRefresh }: { meta: AssetMeta | null; users: AdminUser[]; departments: AdminDepartment[]; canWrite: boolean; onRefresh: () => Promise<void> }) {
  const [mode, setMode] = useState<'users' | 'departments'>('users');
  const [editingUser, setEditingUser] = useState<AdminUser | null | undefined>(undefined);
  const [editingDepartment, setEditingDepartment] = useState<AdminDepartment | null | undefined>(undefined);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function submitUser(values: Record<string, unknown>) {
    setSaving(true);
    setError('');
    const cleaned = Object.fromEntries(Object.entries(values).filter(([, value]) => value !== ''));
    try {
      if (editingUser) await api.updateAdminUser(editingUser.id, cleaned);
      else await api.createAdminUser(cleaned);
      setEditingUser(undefined);
      await onRefresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : '保存失败');
    } finally {
      setSaving(false);
    }
  }

  async function submitDepartment(values: Record<string, unknown>) {
    setSaving(true);
    setError('');
    const cleaned = Object.fromEntries(Object.entries(values).filter(([, value]) => value !== ''));
    try {
      if (editingDepartment) await api.updateAdminDepartment(editingDepartment.id, cleaned);
      else await api.createAdminDepartment(cleaned);
      setEditingDepartment(undefined);
      await onRefresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : '保存失败');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="page-section active">
      <h2 className="page-title">系统设置</h2>
      <div className="settings-tabs">
        <button className={`settings-tab ${mode === 'users' ? 'active' : ''}`} onClick={() => setMode('users')}>用户管理</button>
        <button className="settings-tab">角色管理</button>
        <button className={`settings-tab ${mode === 'departments' ? 'active' : ''}`} onClick={() => setMode('departments')}>部门管理</button>
        <button className="settings-tab">字典管理</button>
      </div>
      <div className="settings-summary">
        <div><strong>{users.length || meta?.users.length || '-'}</strong><span>用户</span></div>
        <div><strong>{departments.length || meta?.departments.length || '-'}</strong><span>部门</span></div>
        <div><strong>3</strong><span>角色权限</span></div>
      </div>
      <div className="settings-action-row">
        <span>{mode === 'users' ? `共 ${users.length} 人` : `共 ${departments.length} 个部门`}</span>
        {canWrite && mode === 'users' && <button className="btn btn-primary btn-sm" onClick={() => setEditingUser(null)}><Icon name="plus" />新增用户</button>}
        {canWrite && mode === 'departments' && <button className="btn btn-primary btn-sm" onClick={() => setEditingDepartment(null)}><Icon name="plus" />新增部门</button>}
      </div>
      {error && <div className="error-banner">{error}</div>}
      <div className="table-wrapper"><div className="table-scroll">
        {mode === 'users' ? (
          <table className="data-table"><thead><tr><th>姓名</th><th>邮箱</th><th>部门</th><th>角色</th><th>状态</th><th>操作</th></tr></thead><tbody>{users.map((item) => <tr key={item.id}><td>{item.name}</td><td>{item.email ?? '-'}</td><td>{item.department_name ?? '-'}</td><td><StatusBadge value={item.role} tone="primary" /></td><td><StatusBadge value={item.status === 'active' ? '启用' : '禁用'} /></td><td>{canWrite ? <button className="btn btn-ghost btn-sm" onClick={() => setEditingUser(item)}><Icon name="edit" />编辑</button> : '-'}</td></tr>)}</tbody></table>
        ) : (
          <table className="data-table"><thead><tr><th>部门</th><th>用户数</th><th>负责人 ID</th><th>更新时间</th><th>操作</th></tr></thead><tbody>{departments.map((item) => <tr key={item.id}><td>{item.name}</td><td>{item.user_count}</td><td>{item.manager_user_id ?? '-'}</td><td>{formatDate(item.updated_at)}</td><td>{canWrite ? <button className="btn btn-ghost btn-sm" onClick={() => setEditingDepartment(item)}><Icon name="edit" />编辑</button> : '-'}</td></tr>)}</tbody></table>
        )}
      </div></div>
      {editingUser !== undefined && <UserAdminModal entity={editingUser} departments={departments} saving={saving} onClose={() => setEditingUser(undefined)} onSubmit={submitUser} />}
      {editingDepartment !== undefined && <DepartmentAdminModal entity={editingDepartment} users={users} saving={saving} onClose={() => setEditingDepartment(undefined)} onSubmit={submitDepartment} />}
    </div>
  );
}

function UserAdminModal({ entity, departments, saving, onClose, onSubmit }: { entity: AdminUser | null; departments: AdminDepartment[]; saving: boolean; onClose: () => void; onSubmit: (values: Record<string, unknown>) => void }) {
  return (
    <div className="modal-overlay open">
      <form className="modal compact-modal" onSubmit={(event) => { event.preventDefault(); onSubmit(Object.fromEntries(new FormData(event.currentTarget).entries())); }}>
        <div className="modal-header"><h3>{entity ? '编辑用户' : '新增用户'}</h3><button type="button" className="modal-close" onClick={onClose}>x</button></div>
        <div className="modal-body form-row-wrap">
          <label className="form-group"><span>姓名</span><input className="input" name="name" defaultValue={entity?.name ?? ''} /></label>
          <label className="form-group"><span>角色</span><select className="select" name="role" defaultValue={entity?.role ?? 'employee'}><option value="admin">管理员</option><option value="boss">老板</option><option value="employee">员工</option></select></label>
          <label className="form-group"><span>状态</span><select className="select" name="status" defaultValue={entity?.status ?? 'active'}><option value="active">启用</option><option value="disabled">禁用</option></select></label>
          <label className="form-group"><span>部门</span><select className="select" name="department_id" defaultValue={entity?.department_id ?? ''}><option value="">未选择</option>{departments.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
          <label className="form-group"><span>邮箱</span><input className="input" name="email" defaultValue={entity?.email ?? ''} /></label>
          <label className="form-group"><span>手机</span><input className="input" name="phone" defaultValue={entity?.phone ?? ''} /></label>
          <label className="form-group"><span>{entity ? '新密码' : '初始密码'}</span><input className="input" name="password" type="password" placeholder={entity ? '留空不修改' : '默认 123456'} /></label>
        </div>
        <div className="modal-footer"><button type="button" className="btn btn-secondary" onClick={onClose}>取消</button><button type="submit" className="btn btn-primary" disabled={saving}>{saving ? '保存中...' : '保存'}</button></div>
      </form>
    </div>
  );
}

function DepartmentAdminModal({ entity, users, saving, onClose, onSubmit }: { entity: AdminDepartment | null; users: AdminUser[]; saving: boolean; onClose: () => void; onSubmit: (values: Record<string, unknown>) => void }) {
  return (
    <div className="modal-overlay open">
      <form className="modal compact-modal" onSubmit={(event) => { event.preventDefault(); onSubmit(Object.fromEntries(new FormData(event.currentTarget).entries())); }}>
        <div className="modal-header"><h3>{entity ? '编辑部门' : '新增部门'}</h3><button type="button" className="modal-close" onClick={onClose}>x</button></div>
        <div className="modal-body form-row-wrap">
          <label className="form-group"><span>部门名称</span><input className="input" name="name" defaultValue={entity?.name ?? ''} /></label>
          <label className="form-group"><span>负责人</span><select className="select" name="manager_user_id" defaultValue={entity?.manager_user_id ?? ''}><option value="">未选择</option>{users.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
        </div>
        <div className="modal-footer"><button type="button" className="btn btn-secondary" onClick={onClose}>取消</button><button type="submit" className="btn btn-primary" disabled={saving}>{saving ? '保存中...' : '保存'}</button></div>
      </form>
    </div>
  );
}
