CREATE TABLE `clarification_requests` (
	`id` text PRIMARY KEY NOT NULL,
	`job_id` text NOT NULL,
	`document_id` text NOT NULL,
	`owner_id` text NOT NULL,
	`chat_id` text NOT NULL,
	`telegram_message_id` text,
	`status` text DEFAULT 'PENDING' NOT NULL,
	`questions_json` text NOT NULL,
	`evidence_json` text DEFAULT '[]' NOT NULL,
	`answer_text` text,
	`answer_message_id` text,
	`interpretation_json` text,
	`attempt_count` integer DEFAULT 0 NOT NULL,
	`due_at` integer NOT NULL,
	`created_at` integer NOT NULL,
	`resolved_at` integer,
	FOREIGN KEY (`job_id`) REFERENCES `agent_runs`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`document_id`) REFERENCES `documents`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_clarifications_chat_status` ON `clarification_requests` (`chat_id`,`status`,`created_at`);--> statement-breakpoint
CREATE INDEX `idx_clarifications_job_status` ON `clarification_requests` (`job_id`,`status`);--> statement-breakpoint
CREATE INDEX `idx_clarifications_due` ON `clarification_requests` (`status`,`due_at`);--> statement-breakpoint
CREATE TABLE `command_confirmations` (
	`id` text PRIMARY KEY NOT NULL,
	`owner_id` text NOT NULL,
	`chat_id` text NOT NULL,
	`command` text NOT NULL,
	`arguments_json` text DEFAULT '{}' NOT NULL,
	`status` text DEFAULT 'PENDING' NOT NULL,
	`expires_at` integer NOT NULL,
	`created_at` integer NOT NULL,
	`confirmed_at` integer
);
--> statement-breakpoint
CREATE INDEX `idx_command_confirmations_chat_status` ON `command_confirmations` (`chat_id`,`status`,`expires_at`);--> statement-breakpoint
CREATE TABLE `telegram_deliveries` (
	`id` text PRIMARY KEY NOT NULL,
	`job_id` text NOT NULL,
	`state_id` text NOT NULL,
	`chat_id` text NOT NULL,
	`part_index` integer NOT NULL,
	`part_count` integer NOT NULL,
	`content_hash` text NOT NULL,
	`status` text DEFAULT 'PENDING' NOT NULL,
	`telegram_message_id` text,
	`created_at` integer NOT NULL,
	`sent_at` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `uq_telegram_delivery_part` ON `telegram_deliveries` (`job_id`,`state_id`,`part_index`);--> statement-breakpoint
CREATE INDEX `idx_telegram_deliveries_status` ON `telegram_deliveries` (`status`,`created_at`);
--> statement-breakpoint
UPDATE `documents` SET `company_id` = NULL WHERE `company_id` IN (
	SELECT `id` FROM `companies` WHERE lower(`name`) LIKE '%santa rita%' OR lower(`name`) LIKE '%agro vale%'
		OR lower(`name`) LIKE '%supermercado central%' OR lower(`name`) LIKE '%bebidas paraíso%'
		OR lower(`name`) LIKE '%bebidas paraiso%' OR lower(`name`) LIKE '%transvale%'
		OR lower(`id`) LIKE '%demo%' OR lower(`id`) LIKE '%synthetic%'
);
--> statement-breakpoint
UPDATE `insights` SET `company_id` = NULL WHERE `company_id` IN (
	SELECT `id` FROM `companies` WHERE lower(`name`) LIKE '%santa rita%' OR lower(`name`) LIKE '%agro vale%'
		OR lower(`name`) LIKE '%supermercado central%' OR lower(`name`) LIKE '%bebidas paraíso%'
		OR lower(`name`) LIKE '%bebidas paraiso%' OR lower(`name`) LIKE '%transvale%'
		OR lower(`id`) LIKE '%demo%' OR lower(`id`) LIKE '%synthetic%'
);
--> statement-breakpoint
DELETE FROM `companies` WHERE lower(`name`) LIKE '%santa rita%' OR lower(`name`) LIKE '%agro vale%'
	OR lower(`name`) LIKE '%supermercado central%' OR lower(`name`) LIKE '%bebidas paraíso%'
	OR lower(`name`) LIKE '%bebidas paraiso%' OR lower(`name`) LIKE '%transvale%'
	OR lower(`id`) LIKE '%demo%' OR lower(`id`) LIKE '%synthetic%';
--> statement-breakpoint
DELETE FROM `evidence_edges` WHERE `tenant_id` = 'tenant-demo';
--> statement-breakpoint
DELETE FROM `evidence_nodes` WHERE `tenant_id` = 'tenant-demo';
--> statement-breakpoint
DELETE FROM `manual_review_resolutions` WHERE `tenant_id` = 'tenant-demo';
--> statement-breakpoint
DELETE FROM `manual_review_requests` WHERE `tenant_id` = 'tenant-demo';
--> statement-breakpoint
DELETE FROM `state_snapshots` WHERE `tenant_id` = 'tenant-demo' OR lower(`subject_ref`) LIKE '%demo%' OR lower(`subject_ref`) LIKE '%synthetic%';
