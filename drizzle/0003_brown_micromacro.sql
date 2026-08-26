PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_state_snapshots` (
	`state_id` text NOT NULL,
	`tenant_id` text NOT NULL,
	`subject_ref` text NOT NULL,
	`state_version` integer NOT NULL,
	`event_id` text NOT NULL,
	`correlation_id` text NOT NULL,
	`state_hash` text NOT NULL,
	`overall_status` text NOT NULL,
	`snapshot_json` text NOT NULL,
	`executive_assessment_json` text,
	`generated_at` integer NOT NULL,
	`published_at` integer NOT NULL,
	PRIMARY KEY(`state_id`, `state_version`)
);
--> statement-breakpoint
INSERT INTO `__new_state_snapshots`("state_id", "tenant_id", "subject_ref", "state_version", "event_id", "correlation_id", "state_hash", "overall_status", "snapshot_json", "executive_assessment_json", "generated_at", "published_at") SELECT "state_id", "tenant_id", "subject_ref", "state_version", "event_id", "correlation_id", "state_hash", "overall_status", "snapshot_json", "executive_assessment_json", "generated_at", "published_at" FROM `state_snapshots`;--> statement-breakpoint
DROP TABLE `state_snapshots`;--> statement-breakpoint
ALTER TABLE `__new_state_snapshots` RENAME TO `state_snapshots`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `uq_state_snapshots_event` ON `state_snapshots` (`event_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `uq_state_snapshots_scope_version` ON `state_snapshots` (`tenant_id`,`subject_ref`,`state_version`);--> statement-breakpoint
CREATE INDEX `idx_state_snapshots_latest` ON `state_snapshots` (`tenant_id`,`subject_ref`,`state_version`);