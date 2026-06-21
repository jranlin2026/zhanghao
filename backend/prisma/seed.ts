import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const [management, ops] = await Promise.all([
    prisma.department.upsert({
      where: { name: '管理部' },
      update: {},
      create: { name: '管理部' },
    }),
    prisma.department.upsert({
      where: { name: '运营部' },
      update: {},
      create: { name: '运营部' },
    }),
  ]);

  const password = await bcrypt.hash('admin123', 10);
  const bossPassword = await bcrypt.hash('boss123', 10);
  const employeePassword = await bcrypt.hash('employee123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@company.local' },
    update: {},
    create: {
      name: 'admin',
      email: 'admin@company.local',
      phone: '13800000001',
      password_hash: password,
      role: 'admin',
      department_id: management.id,
    },
  });

  await prisma.user.upsert({
    where: { email: 'boss@company.local' },
    update: {},
    create: {
      name: '老板',
      email: 'boss@company.local',
      phone: '13800000002',
      password_hash: bossPassword,
      role: 'boss',
      department_id: management.id,
    },
  });

  const employee = await prisma.user.upsert({
    where: { email: 'employee@company.local' },
    update: {},
    create: {
      name: '王伟',
      email: 'employee@company.local',
      phone: '13800000003',
      password_hash: employeePassword,
      role: 'employee',
      department_id: ops.id,
    },
  });

  const device = await prisma.device.upsert({
    where: { device_code: 'DEV-20260601-00001' },
    update: {},
    create: {
      device_code: 'DEV-20260601-00001',
      device_name: '王伟工作机',
      brand_model: 'iPhone 14 Pro',
      imei: '356789012345671',
      sim_type: 'dual',
      owner_subject: '公司',
      department_id: ops.id,
      owner_user_id: admin.id,
      current_user_id: employee.id,
      status: '使用中',
      risk_level: 'none',
    },
  });

  const phone = await prisma.phoneNumber.upsert({
    where: { phone_number: '13912345678' },
    update: {},
    create: {
      device_id: device.id,
      slot_type: 'sim1',
      phone_number: '13912345678',
      carrier: '中国移动',
      is_primary: true,
      monthly_fee: 99,
      owner_user_id: employee.id,
      status: '使用中',
      risk_level: 'none',
    },
  });

  await prisma.internetAccount.upsert({
    where: { account_code: 'ACC-20260601-00001' },
    update: {},
    create: {
      phone_number_id: phone.id,
      account_code: 'ACC-20260601-00001',
      platform: '微信',
      account_name: '公司服务号',
      login_account: 'service@example.com',
      owner_subject: '公司',
      department_id: ops.id,
      owner_user_id: admin.id,
      current_user_id: employee.id,
      permission_status: '正常',
      status: '使用中',
      risk_level: 'none',
    },
  });
}

main()
  .finally(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
