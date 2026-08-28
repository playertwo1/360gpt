CREATE TABLE `canary_review_decisions` (
	`id` text PRIMARY KEY NOT NULL,
	`run_id` text NOT NULL,
	`tenant_id` text NOT NULL,
	`decision` text NOT NULL,
	`reviewer_id` text NOT NULL,
	`reviewer_email` text NOT NULL,
	`rationale` text NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`run_id`) REFERENCES `canary_review_runs`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `uq_canary_review_decisions_run` ON `canary_review_decisions` (`run_id`);--> statement-breakpoint
CREATE INDEX `idx_canary_review_decisions_tenant_created` ON `canary_review_decisions` (`tenant_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `canary_review_runs` (
	`id` text PRIMARY KEY NOT NULL,
	`tenant_id` text NOT NULL,
	`domain` text NOT NULL,
	`capability` text NOT NULL,
	`data_scope` text NOT NULL,
	`case_count` integer NOT NULL,
	`status` text DEFAULT 'PENDING_REVIEW' NOT NULL,
	`payload_json` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_canary_review_runs_tenant_status` ON `canary_review_runs` (`tenant_id`,`status`);