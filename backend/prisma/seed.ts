import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 开始填充种子数据...\n');

  // ── 0. 清理旧数据（按依赖顺序） ──
  await prisma.entityRisk.deleteMany();
  await prisma.operationLog.deleteMany();
  await prisma.accountSensitiveInfo.deleteMany();
  await prisma.internetAccount.deleteMany();
  await prisma.phoneNumber.deleteMany();
  await prisma.device.deleteMany();
  await prisma.userRole.deleteMany();
  await prisma.user.deleteMany();
  await prisma.role.deleteMany();
  await prisma.department.deleteMany();

  // ── 1. 创建 5 个角色 ──
  const roles = await Promise.all([
    prisma.role.create({ data: { code: 'super_admin', name: '超级管理员' } }),
    prisma.role.create({ data: { code: 'boss', name: '老板' } }),
    prisma.role.create({ data: { code: 'account_admin', name: '账号管理员' } }),
    prisma.role.create({ data: { code: 'dept_manager', name: '部门负责人' } }),
    prisma.role.create({ data: { code: 'employee', name: '普通员工' } }),
  ]);
  console.log(`✅ 创建了 ${roles.length} 个角色`);

  const [roleSuperAdmin, roleBoss, roleAccountAdmin, roleDeptManager, roleEmployee] = roles;

  // ── 2. 创建 3 个部门 ──
  const departments = await Promise.all([
    prisma.department.create({ data: { name: '技术部' } }),
    prisma.department.create({ data: { name: '市场部' } }),
    prisma.department.create({ data: { name: '运营部' } }),
  ]);
  console.log(`✅ 创建了 ${departments.length} 个部门`);

  const [deptTech, deptMarket, deptOps] = departments;

  // ── 3. 创建 5 个用户（每个角色至少一个） ──
  const passwordHash = await bcrypt.hash('admin123', 10);

  const admin = await prisma.user.create({
    data: {
      name: '管理员',
      email: 'admin@company.com',
      phone: '13800000001',
      department_id: deptTech.id,
      password_hash: passwordHash,
      status: 'active',
    },
  });

  const boss = await prisma.user.create({
    data: {
      name: '张总',
      email: 'boss@company.com',
      phone: '13800000002',
      department_id: deptTech.id,
      password_hash: passwordHash,
      status: 'active',
    },
  });

  const accountAdmin = await prisma.user.create({
    data: {
      name: '李管理',
      email: 'admin2@company.com',
      phone: '13800000003',
      department_id: deptOps.id,
      password_hash: passwordHash,
      status: 'active',
    },
  });

  const deptManager = await prisma.user.create({
    data: {
      name: '王主管',
      email: 'manager@company.com',
      phone: '13800000004',
      department_id: deptTech.id,
      password_hash: passwordHash,
      status: 'active',
    },
  });

  const employee = await prisma.user.create({
    data: {
      name: '赵员工',
      email: 'employee@company.com',
      phone: '13800000005',
      department_id: deptMarket.id,
      password_hash: passwordHash,
      status: 'active',
    },
  });

  // 更新部门负责人
  await prisma.department.update({ where: { id: deptTech.id }, data: { manager_user_id: deptManager.id } });

  console.log(`✅ 创建了 5 个用户（密码均为 admin123）`);

  // ── 4. 关联用户角色 ──
  await Promise.all([
    prisma.userRole.create({ data: { user_id: admin.id, role_id: roleSuperAdmin.id } }),
    prisma.userRole.create({ data: { user_id: boss.id, role_id: roleBoss.id } }),
    prisma.userRole.create({ data: { user_id: accountAdmin.id, role_id: roleAccountAdmin.id } }),
    prisma.userRole.create({ data: { user_id: deptManager.id, role_id: roleDeptManager.id } }),
    prisma.userRole.create({ data: { user_id: employee.id, role_id: roleEmployee.id } }),
  ]);
  // 给管理员额外加一个 account_admin 角色
  await prisma.userRole.create({ data: { user_id: admin.id, role_id: roleAccountAdmin.id } });
  console.log(`✅ 创建了 6 条用户-角色关联`);

  // ── 5. 创建 3 个示例设备 ──
  const device1 = await prisma.device.create({
    data: {
      device_code: 'DEV-20241201-00001',
      device_name: 'iPhone 15 Pro Max',
      brand_model: 'Apple A3101',
      imei: '358123456789012',
      sim_type: 'dual',
      owner_subject: '公司',
      department_id: deptTech.id,
      owner_user_id: admin.id,
      current_user_id: admin.id,
      status: '启用中',
      risk_level: 'none',
      created_by: admin.id,
    },
  });

  const device2 = await prisma.device.create({
    data: {
      device_code: 'DEV-20241201-00002',
      device_name: '华为 Mate 60',
      brand_model: 'HUAWEI ALN-AL00',
      imei: '861234567890123',
      sim_type: 'single',
      owner_subject: '公司',
      department_id: deptMarket.id,
      owner_user_id: employee.id,
      current_user_id: employee.id,
      status: '启用中',
      risk_level: 'none',
      created_by: admin.id,
    },
  });

  const device3 = await prisma.device.create({
    data: {
      device_code: 'DEV-20241201-00003',
      device_name: 'Redmi Note 13 Pro+',
      brand_model: 'Xiaomi 23090RA98C',
      imei: '864509876543210',
      sim_type: 'dual',
      owner_subject: '公司',
      department_id: deptOps.id,
      owner_user_id: accountAdmin.id,
      current_user_id: accountAdmin.id,
      status: '启用中',
      risk_level: 'none',
      created_by: admin.id,
    },
  });

  console.log(`✅ 创建了 3 个设备`);

  // ── 6. 创建 5 个手机号 ──
  const phones = await Promise.all([
    prisma.phoneNumber.create({
      data: {
        device_id: device1.id,
        slot_type: 'sim1',
        phone_number: '13912345678',
        carrier: '中国移动',
        is_primary: true,
        monthly_fee: 199,
        plan_type: '5G畅享套餐',
        owner_user_id: admin.id,
        status: '启用中',
      },
    }),
    prisma.phoneNumber.create({
      data: {
        device_id: device1.id,
        slot_type: 'sim2',
        phone_number: '13698765432',
        carrier: '中国联通',
        is_primary: false,
        monthly_fee: 89,
        plan_type: '冰激凌套餐',
        owner_user_id: admin.id,
        status: '启用中',
      },
    }),
    prisma.phoneNumber.create({
      data: {
        device_id: device2.id,
        slot_type: 'sim1',
        phone_number: '15811223344',
        carrier: '中国电信',
        is_primary: true,
        monthly_fee: 129,
        plan_type: '天翼畅享套餐',
        owner_user_id: employee.id,
        status: '启用中',
      },
    }),
    prisma.phoneNumber.create({
      data: {
        device_id: device3.id,
        slot_type: 'sim1',
        phone_number: '17655667788',
        carrier: '中国移动',
        is_primary: true,
        monthly_fee: 59,
        plan_type: '移动大王卡',
        owner_user_id: accountAdmin.id,
        status: '启用中',
      },
    }),
    prisma.phoneNumber.create({
      data: {
        device_id: device3.id,
        slot_type: 'sim2',
        phone_number: '18599001122',
        carrier: '中国联通',
        is_primary: false,
        monthly_fee: 39,
        plan_type: '流量王卡',
        owner_user_id: null,
        status: '闲置',
      },
    }),
  ]);

  console.log(`✅ 创建了 ${phones.length} 个手机号`);

  // ── 7. 创建 10 个互联网账号 ──
  const accounts = await Promise.all([
    prisma.internetAccount.create({
      data: {
        phone_number_id: phones[0].id,
        account_code: 'ACC-20241201-00001',
        platform: '微信',
        account_name: '公司官方号',
        login_account: 'company_wechat@company.com',
        bind_phone: '13912345678',
        bind_email: 'wechat@company.com',
        owner_subject: '公司',
        purpose: '客户联系与官方公告',
        department_id: deptMarket.id,
        owner_user_id: employee.id,
        current_user_id: employee.id,
        permission_status: '已授权',
        status: '启用中',
        risk_level: 'none',
        created_by: admin.id,
      },
    }),
    prisma.internetAccount.create({
      data: {
        phone_number_id: phones[0].id,
        account_code: 'ACC-20241201-00002',
        platform: '抖音',
        account_name: '品牌宣传号',
        login_account: 'douyin_company',
        bind_phone: '13912345678',
        owner_subject: '公司',
        purpose: '品牌宣传与短视频营销',
        department_id: deptMarket.id,
        owner_user_id: employee.id,
        current_user_id: employee.id,
        permission_status: '已授权',
        status: '启用中',
        risk_level: 'none',
        created_by: admin.id,
      },
    }),
    prisma.internetAccount.create({
      data: {
        phone_number_id: phones[0].id,
        account_code: 'ACC-20241201-00003',
        platform: '小红书',
        account_name: '运营推广号',
        login_account: 'xiaohongshu_corp',
        bind_phone: '13912345678',
        owner_subject: '公司',
        purpose: '种草营销与品牌推广',
        department_id: deptMarket.id,
        owner_user_id: employee.id,
        current_user_id: employee.id,
        permission_status: '已授权',
        status: '启用中',
        risk_level: 'medium',
        created_by: admin.id,
      },
    }),
    prisma.internetAccount.create({
      data: {
        phone_number_id: phones[0].id,
        account_code: 'ACC-20241201-00004',
        platform: '哔哩哔哩',
        account_name: '技术部官方号',
        login_account: 'bilibili_tech',
        bind_phone: '13912345678',
        owner_subject: '公司',
        purpose: '技术分享与招聘宣传',
        department_id: deptTech.id,
        owner_user_id: admin.id,
        current_user_id: admin.id,
        permission_status: '已授权',
        status: '启用中',
        risk_level: 'none',
        created_by: admin.id,
      },
    }),
    prisma.internetAccount.create({
      data: {
        phone_number_id: phones[1].id,
        account_code: 'ACC-20241201-00005',
        platform: '淘宝',
        account_name: '企业店铺',
        login_account: 'taobao_shop@company.com',
        bind_phone: '13698765432',
        owner_subject: '公司',
        purpose: '电商运营',
        department_id: deptMarket.id,
        owner_user_id: employee.id,
        current_user_id: employee.id,
        permission_status: '已授权',
        status: '启用中',
        risk_level: 'none',
        created_by: admin.id,
      },
    }),
    prisma.internetAccount.create({
      data: {
        phone_number_id: phones[1].id,
        account_code: 'ACC-20241201-00006',
        platform: '京东',
        account_name: '京东企业购',
        login_account: 'jd_company',
        bind_phone: '13698765432',
        owner_subject: '公司',
        purpose: '企业采购',
        department_id: deptTech.id,
        owner_user_id: admin.id,
        current_user_id: admin.id,
        permission_status: '已授权',
        status: '启用中',
        risk_level: 'none',
        created_by: admin.id,
      },
    }),
    prisma.internetAccount.create({
      data: {
        phone_number_id: phones[1].id,
        account_code: 'ACC-20241201-00007',
        platform: '美团',
        account_name: '企业团购号',
        login_account: 'meituan_corp',
        bind_phone: '13698765432',
        owner_subject: '公司',
        purpose: '员工福利与团购',
        department_id: deptOps.id,
        owner_user_id: accountAdmin.id,
        current_user_id: accountAdmin.id,
        permission_status: '已授权',
        status: '启用中',
        risk_level: 'none',
        created_by: admin.id,
      },
    }),
    prisma.internetAccount.create({
      data: {
        phone_number_id: phones[2].id,
        account_code: 'ACC-20241201-00008',
        platform: '微博',
        account_name: '官方微博',
        login_account: 'weibo_official',
        bind_phone: '15811223344',
        owner_subject: '公司',
        purpose: '品牌宣传与公关',
        department_id: deptMarket.id,
        owner_user_id: employee.id,
        current_user_id: null,
        permission_status: '待授权',
        status: '启用中',
        risk_level: 'high',
        created_by: admin.id,
      },
    }),
    prisma.internetAccount.create({
      data: {
        phone_number_id: phones[3].id,
        account_code: 'ACC-20241201-00009',
        platform: '知乎',
        account_name: '技术运营号',
        login_account: 'zhihu_tech',
        bind_phone: '17655667788',
        owner_subject: '公司',
        purpose: '技术问答与品牌建设',
        department_id: deptTech.id,
        owner_user_id: deptManager.id,
        current_user_id: deptManager.id,
        permission_status: '已授权',
        status: '启用中',
        risk_level: 'none',
        created_by: admin.id,
      },
    }),
    prisma.internetAccount.create({
      data: {
        phone_number_id: phones[3].id,
        account_code: 'ACC-20241201-00010',
        platform: '钉钉',
        account_name: '公司管理号',
        login_account: 'dingtalk_admin@company.com',
        bind_phone: '17655667788',
        bind_email: 'admin@company.com',
        owner_subject: '公司',
        purpose: '内部办公协同',
        department_id: deptTech.id,
        owner_user_id: admin.id,
        current_user_id: admin.id,
        permission_status: '已授权',
        status: '启用中',
        risk_level: 'none',
        created_by: admin.id,
      },
    }),
  ]);

  // 给几个账号添加敏感信息
  const encrypt = (await import('../src/config/crypto')).encrypt;

  await prisma.accountSensitiveInfo.createMany({
    data: [
      { account_id: accounts[0].id, login_password_encrypted: encrypt('WeChat@2024!'), real_name_info_encrypted: encrypt('张三/110101199001011234') },
      { account_id: accounts[1].id, login_password_encrypted: encrypt('DouYin@2024!') },
      { account_id: accounts[4].id, login_password_encrypted: encrypt('TaoBao@Shop!'), real_name_info_encrypted: encrypt('李四/110101199002022345') },
      { account_id: accounts[7].id, login_password_encrypted: encrypt('WeiBo@2024!') },
      { account_id: accounts[9].id, login_password_encrypted: encrypt('DingTalk@2024!'), real_name_info_encrypted: encrypt('管理员/110101199003033456'), backup_info_encrypted: encrypt('备用邮箱: admin.backup@company.com') },
    ],
  });

  console.log(`✅ 创建了 ${accounts.length} 个互联网账号`);
  console.log(`✅ 创建了 5 条敏感信息记录`);

  // ── 8. 创建几条示例风险记录 ──
  const risks = await Promise.all([
    prisma.entityRisk.create({
      data: {
        entity_type: 'internet_accounts',
        entity_id: accounts[7].id,
        risk_code: 'ACC_USING_NO_USER',
        risk_title: '微博账号当前无使用人',
        risk_level: 'high',
        risk_reason: '账号 current_user_id 为空，可能存在安全隐患',
        suggestion: '请尽快为微博账号指定使用人',
        status: 'open',
      },
    }),
    prisma.entityRisk.create({
      data: {
        entity_type: 'internet_accounts',
        entity_id: accounts[2].id,
        risk_code: 'ACC_HIGH_RISK_MARKED',
        risk_title: '小红书账号被标记为中风险',
        risk_level: 'medium',
        risk_reason: '该账号存在异常登录行为',
        suggestion: '建议检查近期登录记录并修改密码',
        status: 'open',
      },
    }),
    prisma.entityRisk.create({
      data: {
        entity_type: 'devices',
        entity_id: device3.id,
        risk_code: 'DEVICE_USING_NO_USER',
        risk_title: 'Redmi Note 13 当前使用人未设置',
        risk_level: 'low',
        risk_reason: '设备 current_user_id 为空',
        suggestion: '请为设备指定当前使用人',
        status: 'open',
      },
    }),
    prisma.entityRisk.create({
      data: {
        entity_type: 'phone_numbers',
        entity_id: phones[4].id,
        risk_code: 'PHONE_NO_OWNER',
        risk_title: '手机号 18599001122 无负责人',
        risk_level: 'medium',
        risk_reason: '闲置手机号没有指定负责人，可能被遗忘',
        suggestion: '请为手机号指定负责人或考虑注销',
        status: 'open',
      },
    }),
  ]);

  console.log(`✅ 创建了 ${risks.length} 条风险记录`);

  // ── 9. 创建几条操作日志 ──
  const logs = await Promise.all([
    prisma.operationLog.create({
      data: {
        operator_id: admin.id,
        action_type: 'CREATE_DEVICE',
        target_type: 'devices',
        target_id: device1.id,
        target_name: 'iPhone 15 Pro Max',
        after_data: { device_name: 'iPhone 15 Pro Max', imei: '358123456789012' },
        ip_address: '192.168.1.100',
      },
    }),
    prisma.operationLog.create({
      data: {
        operator_id: admin.id,
        action_type: 'CREATE_DEVICE',
        target_type: 'devices',
        target_id: device2.id,
        target_name: '华为 Mate 60',
        after_data: { device_name: '华为 Mate 60', imei: '861234567890123' },
        ip_address: '192.168.1.100',
      },
    }),
    prisma.operationLog.create({
      data: {
        operator_id: admin.id,
        action_type: 'CREATE_ACCOUNT',
        target_type: 'internet_accounts',
        target_id: accounts[0].id,
        target_name: '公司官方号',
        after_data: { platform: '微信', account_name: '公司官方号' },
        ip_address: '192.168.1.100',
      },
    }),
    prisma.operationLog.create({
      data: {
        operator_id: admin.id,
        action_type: 'VIEW_SENSITIVE',
        target_type: 'internet_accounts',
        target_id: accounts[0].id,
        target_name: '公司官方号',
        ip_address: '192.168.1.100',
      },
    }),
    prisma.operationLog.create({
      data: {
        operator_id: accountAdmin.id,
        action_type: 'IMPORT_DATA',
        target_type: 'internet_accounts',
        after_data: { count: 5, source: '批量导入' },
        ip_address: '192.168.1.101',
      },
    }),
  ]);

  console.log(`✅ 创建了 ${logs.length} 条操作日志`);

  // ── 10. 更新部门负责人 ──
  await prisma.department.update({ where: { id: deptTech.id }, data: { manager_user_id: deptManager.id } });
  await prisma.department.update({ where: { id: deptMarket.id }, data: { manager_user_id: employee.id } });
  await prisma.department.update({ where: { id: deptOps.id }, data: { manager_user_id: accountAdmin.id } });
  console.log(`✅ 更新了 3 个部门的负责人`);

  console.log('\n🎉 种子数据填充完成！');
  console.log('📧 管理员账号: admin / admin123');
}

main()
  .catch((e) => {
    console.error('❌ 种子数据填充失败:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
