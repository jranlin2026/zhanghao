CREATE INDEX "devices_deleted_at_idx" ON "devices"("deleted_at");
CREATE INDEX "devices_department_id_idx" ON "devices"("department_id");
CREATE INDEX "devices_owner_user_id_idx" ON "devices"("owner_user_id");
CREATE INDEX "devices_current_user_id_idx" ON "devices"("current_user_id");
CREATE INDEX "devices_status_idx" ON "devices"("status");
CREATE INDEX "devices_risk_level_idx" ON "devices"("risk_level");

CREATE INDEX "phone_numbers_deleted_at_idx" ON "phone_numbers"("deleted_at");
CREATE INDEX "phone_numbers_device_id_idx" ON "phone_numbers"("device_id");
CREATE INDEX "phone_numbers_owner_user_id_idx" ON "phone_numbers"("owner_user_id");
CREATE INDEX "phone_numbers_status_idx" ON "phone_numbers"("status");
CREATE INDEX "phone_numbers_risk_level_idx" ON "phone_numbers"("risk_level");

CREATE INDEX "internet_accounts_deleted_at_idx" ON "internet_accounts"("deleted_at");
CREATE INDEX "internet_accounts_phone_number_id_idx" ON "internet_accounts"("phone_number_id");
CREATE INDEX "internet_accounts_department_id_idx" ON "internet_accounts"("department_id");
CREATE INDEX "internet_accounts_owner_user_id_idx" ON "internet_accounts"("owner_user_id");
CREATE INDEX "internet_accounts_current_user_id_idx" ON "internet_accounts"("current_user_id");
CREATE INDEX "internet_accounts_status_idx" ON "internet_accounts"("status");
CREATE INDEX "internet_accounts_risk_level_idx" ON "internet_accounts"("risk_level");

CREATE INDEX "operation_logs_operator_id_idx" ON "operation_logs"("operator_id");
CREATE INDEX "operation_logs_created_at_idx" ON "operation_logs"("created_at");
