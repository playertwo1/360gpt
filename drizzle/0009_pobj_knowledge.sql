CREATE TABLE `pobj_knowledge_items` (
	`id` text PRIMARY KEY NOT NULL,
	`owner_id` text NOT NULL,
	`indicator_key` text NOT NULL,
	`indicator_name` text NOT NULL,
	`layout_signature` text NOT NULL,
	`knowledge_type` text NOT NULL,
	`version` integer DEFAULT 1 NOT NULL,
	`status` text DEFAULT 'CANDIDATE' NOT NULL,
	`content_json` text NOT NULL,
	`content_hash` text NOT NULL,
	`source_document_id` text,
	`source_job_id` text,
	`source_evidence_json` text DEFAULT '[]' NOT NULL,
	`approved_by` text,
	`approved_at` integer,
	`valid_from` integer,
	`superseded_by` text,
	`revoked_at` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`source_document_id`) REFERENCES `documents`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`source_job_id`) REFERENCES `agent_runs`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `uq_pobj_knowledge_version` ON `pobj_knowledge_items` (`owner_id`,`indicator_key`,`layout_signature`,`knowledge_type`,`version`);
--> statement-breakpoint
CREATE INDEX `idx_pobj_knowledge_owner_status_layout` ON `pobj_knowledge_items` (`owner_id`,`status`,`layout_signature`);
--> statement-breakpoint
CREATE INDEX `idx_pobj_knowledge_indicator_status` ON `pobj_knowledge_items` (`indicator_key`,`status`);
--> statement-breakpoint
CREATE TABLE `pobj_knowledge_applications` (
	`id` text PRIMARY KEY NOT NULL,
	`knowledge_id` text NOT NULL,
	`knowledge_version` integer NOT NULL,
	`owner_id` text NOT NULL,
	`document_id` text NOT NULL,
	`job_id` text NOT NULL,
	`result` text NOT NULL,
	`details_json` text DEFAULT '{}' NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`knowledge_id`) REFERENCES `pobj_knowledge_items`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`document_id`) REFERENCES `documents`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`job_id`) REFERENCES `agent_runs`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `uq_pobj_knowledge_application` ON `pobj_knowledge_applications` (`knowledge_id`,`document_id`,`job_id`);
--> statement-breakpoint
CREATE INDEX `idx_pobj_knowledge_application_owner` ON `pobj_knowledge_applications` (`owner_id`,`created_at`);
