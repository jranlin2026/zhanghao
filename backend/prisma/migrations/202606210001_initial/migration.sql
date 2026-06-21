CREATE TABLE "Department" (
  "id" SERIAL PRIMARY KEY,
  "name" TEXT NOT NULL UNIQUE,
  "manager_user_id" INTEGER,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL
);

CREATE TABLE "User" (
  "id" SERIAL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "email" TEXT UNIQUE,
  "phone" TEXT,
  "password_hash" TEXT NOT NULL,
  "role" TEXT NOT NULL DEFAULT 'employee',
  "department_id" INTEGER REFERENCES "Department"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  "status" TEXT NOT NULL DEFAULT 'active',
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL
);

CREATE TABLE "Device" (
  "id" SERIAL PRIMARY KEY,
  "device_code" TEXT NOT NULL UNIQUE,
  "device_name" TEXT NOT NULL,
  "brand_model" TEXT NOT NULL,
  "imei" TEXT NOT NULL UNIQUE,
  "sim_type" TEXT NOT NULL,
  "owner_subject" TEXT NOT NULL,
  "department_id" INTEGER REFERENCES "Department"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  "owner_user_id" INTEGER REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  "current_user_id" INTEGER REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  "status" TEXT NOT NULL DEFAULT '使用中',
  "risk_level" TEXT NOT NULL DEFAULT 'none',
  "remark" TEXT,
  "deleted_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL
);

CREATE TABLE "PhoneNumber" (
  "id" SERIAL PRIMARY KEY,
  "device_id" INTEGER NOT NULL REFERENCES "Device"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  "slot_type" TEXT NOT NULL,
  "phone_number" TEXT NOT NULL,
  "carrier" TEXT NOT NULL,
  "is_primary" BOOLEAN NOT NULL DEFAULT false,
  "monthly_fee" DECIMAL(10,2),
  "plan_type" TEXT,
  "owner_user_id" INTEGER REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  "status" TEXT NOT NULL DEFAULT '使用中',
  "risk_level" TEXT NOT NULL DEFAULT 'none',
  "remark" TEXT,
  "deleted_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL
);

CREATE TABLE "InternetAccount" (
  "id" SERIAL PRIMARY KEY,
  "phone_number_id" INTEGER NOT NULL REFERENCES "PhoneNumber"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  "account_code" TEXT NOT NULL UNIQUE,
  "platform" TEXT NOT NULL,
  "account_name" TEXT NOT NULL,
  "login_account" TEXT NOT NULL,
  "bind_email" TEXT,
  "owner_subject" TEXT NOT NULL,
  "purpose" TEXT,
  "service_provider" TEXT,
  "monthly_fee" DECIMAL(10,2),
  "expire_at" TIMESTAMP(3),
  "department_id" INTEGER REFERENCES "Department"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  "owner_user_id" INTEGER REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  "current_user_id" INTEGER REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  "permission_status" TEXT NOT NULL DEFAULT '正常',
  "status" TEXT NOT NULL DEFAULT '使用中',
  "risk_level" TEXT NOT NULL DEFAULT 'none',
  "remark" TEXT,
  "deleted_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL
);

CREATE TABLE "OperationLog" (
  "id" SERIAL PRIMARY KEY,
  "operator_id" INTEGER REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  "action_type" TEXT NOT NULL,
  "target_type" TEXT NOT NULL,
  "target_id" INTEGER,
  "before_data" JSONB,
  "after_data" JSONB,
  "ip_address" TEXT,
  "device_info" TEXT,
  "remark" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
