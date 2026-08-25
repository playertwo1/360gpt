CREATE TABLE `agent_runs` (
	`id` text PRIMARY KEY NOT NULL,
	`document_id` text,
	`parent_run_id` text,
	`agent_role` text NOT NULL,
	`status` text DEFAULT 'queued' NOT NULL,
	`input_summary` text,
	`output_json` text,
	`started_at` integer,
	`completed_at` integer,
	FOREIGN KEY (`document_id`) REFERENCES `documents`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_agent_runs_status_role` ON `agent_runs` (`status`,`agent_role`);--> statement-breakpoint
CREATE TABLE `audit_log` (
	`id` text PRIMARY KEY NOT NULL,
	`owner_id` text NOT NULL,
	`actor` text NOT NULL,
	`action` text NOT NULL,
	`entity_type` text NOT NULL,
	`entity_id` text NOT NULL,
	`details_json` text DEFAULT '{}' NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_audit_owner_created` ON `audit_log` (`owner_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `companies` (
	`id` text PRIMARY KEY NOT NULL,
	`owner_id` text NOT NULL,
	`name` text NOT NULL,
	`document_hash` text,
	`segment` text,
	`health_score` integer,
	`status` text DEFAULT 'monitoring' NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_companies_owner_status` ON `companies` (`owner_id`,`status`);--> statement-breakpoint
CREATE TABLE `decisions` (
	`id` text PRIMARY KEY NOT NULL,
	`owner_id` text NOT NULL,
	`insight_id` text,
	`action` text NOT NULL,
	`rationale` text,
	`decided_at` integer NOT NULL,
	FOREIGN KEY (`insight_id`) REFERENCES `insights`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `documents` (
	`id` text PRIMARY KEY NOT NULL,
	`owner_id` text NOT NULL,
	`company_id` text,
	`source` text NOT NULL,
	`source_message_id` text,
	`original_name` text,
	`mime_type` text,
	`storage_key` text,
	`raw_text` text,
	`status` text DEFAULT 'received' NOT NULL,
	`received_at` integer NOT NULL,
	FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_documents_owner_status` ON `documents` (`owner_id`,`status`);--> statement-breakpoint
CREATE INDEX `idx_documents_company` ON `documents` (`company_id`);--> statement-breakpoint
CREATE TABLE `insights` (
	`id` text PRIMARY KEY NOT NULL,
	`owner_id` text NOT NULL,
	`company_id` text,
	`agent_run_id` text,
	`kind` text NOT NULL,
	`title` text NOT NULL,
	`summary` text NOT NULL,
	`evidence_json` text DEFAULT '[]' NOT NULL,
	`confidence` integer,
	`severity` integer DEFAULT 1 NOT NULL,
	`status` text DEFAULT 'open' NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`agent_run_id`) REFERENCES `agent_runs`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_insights_owner_status_severity` ON `insights` (`owner_id`,`status`,`severity`);
--> statement-breakpoint
PRAGMA optimize;
