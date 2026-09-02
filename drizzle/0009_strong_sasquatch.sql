CREATE TABLE `bot_directive_applications` (
	`id` text PRIMARY KEY NOT NULL,
	`directive_id` text NOT NULL,
	`directive_version` integer NOT NULL,
	`owner_id` text NOT NULL,
	`execution_ref` text NOT NULL,
	`protocol` text,
	`outcome` text DEFAULT 'APPLIED' NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`directive_id`) REFERENCES `bot_directives`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `uq_bot_directive_application` ON `bot_directive_applications` (`directive_id`,`execution_ref`);--> statement-breakpoint
CREATE INDEX `idx_bot_directive_app_owner` ON `bot_directive_applications` (`owner_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `bot_directives` (
	`id` text PRIMARY KEY NOT NULL,
	`owner_id` text NOT NULL,
	`source_feedback_id` text,
	`directive` text NOT NULL,
	`scope` text NOT NULL,
	`failure_type` text NOT NULL,
	`confidence_bps` integer NOT NULL,
	`evidence_refs_json` text DEFAULT '[]' NOT NULL,
	`content_hash` text NOT NULL,
	`version` integer DEFAULT 1 NOT NULL,
	`status` text DEFAULT 'CANDIDATE' NOT NULL,
	`approved_by` text,
	`approved_at` integer,
	`superseded_by` text,
	`revoked_at` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`source_feedback_id`) REFERENCES `bot_feedback_events`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `uq_bot_directive_version` ON `bot_directives` (`owner_id`,`content_hash`,`version`);--> statement-breakpoint
CREATE INDEX `idx_bot_directives_owner_status` ON `bot_directives` (`owner_id`,`status`,`updated_at`);--> statement-breakpoint
CREATE TABLE `bot_feedback_events` (
	`id` text PRIMARY KEY NOT NULL,
	`owner_id` text NOT NULL,
	`chat_id` text NOT NULL,
	`protocol` text,
	`user_message_id` text NOT NULL,
	`bot_message_id` text,
	`bot_text` text,
	`feedback_text` text NOT NULL,
	`original_question_json` text DEFAULT '[]' NOT NULL,
	`failure_type` text,
	`status` text DEFAULT 'QUEUED' NOT NULL,
	`content_hash` text NOT NULL,
	`created_at` integer NOT NULL,
	`processed_at` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `uq_bot_feedback_hash` ON `bot_feedback_events` (`owner_id`,`content_hash`);--> statement-breakpoint
CREATE INDEX `idx_bot_feedback_status` ON `bot_feedback_events` (`status`,`created_at`);--> statement-breakpoint
CREATE TABLE `execution_error_audits` (
	`id` text PRIMARY KEY NOT NULL,
	`owner_id` text NOT NULL,
	`workflow_id` text NOT NULL,
	`execution_id` text,
	`job_id` text,
	`protocol` text,
	`chat_id` text,
	`error_class` text NOT NULL,
	`retryable` integer NOT NULL,
	`sanitized_details_json` text DEFAULT '{}' NOT NULL,
	`notification_status` text DEFAULT 'NOT_REQUIRED' NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `uq_execution_error_execution` ON `execution_error_audits` (`workflow_id`,`execution_id`);--> statement-breakpoint
CREATE INDEX `idx_execution_error_job` ON `execution_error_audits` (`job_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `telegram_inbound_events` (
	`id` text PRIMARY KEY NOT NULL,
	`update_id` text NOT NULL,
	`owner_id` text NOT NULL,
	`chat_id` text NOT NULL,
	`message_id` text NOT NULL,
	`reply_to_message_id` text,
	`event_kind` text NOT NULL,
	`text` text DEFAULT '' NOT NULL,
	`payload_json` text DEFAULT '{}' NOT NULL,
	`batch_id` text,
	`status` text DEFAULT 'QUEUED' NOT NULL,
	`available_at` integer NOT NULL,
	`lease_token` text,
	`lease_expires_at` integer,
	`attempt_count` integer DEFAULT 0 NOT NULL,
	`last_error_code` text,
	`created_at` integer NOT NULL,
	`completed_at` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `uq_telegram_inbound_update` ON `telegram_inbound_events` (`update_id`);--> statement-breakpoint
CREATE INDEX `idx_telegram_inbound_claim` ON `telegram_inbound_events` (`status`,`available_at`,`lease_expires_at`);--> statement-breakpoint
CREATE INDEX `idx_telegram_inbound_chat` ON `telegram_inbound_events` (`chat_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `telegram_message_batches` (
	`id` text PRIMARY KEY NOT NULL,
	`owner_id` text NOT NULL,
	`chat_id` text NOT NULL,
	`status` text DEFAULT 'OPEN' NOT NULL,
	`message_count` integer DEFAULT 1 NOT NULL,
	`combined_text` text DEFAULT '' NOT NULL,
	`first_message_at` integer NOT NULL,
	`last_message_at` integer NOT NULL,
	`due_at` integer NOT NULL,
	`created_at` integer NOT NULL,
	`sealed_at` integer,
	`completed_at` integer
);
--> statement-breakpoint
CREATE INDEX `idx_telegram_batches_chat_open` ON `telegram_message_batches` (`chat_id`,`status`,`due_at`);
