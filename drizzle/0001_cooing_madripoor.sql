CREATE TABLE `telegram_updates` (
	`update_id` text PRIMARY KEY NOT NULL,
	`chat_id` text NOT NULL,
	`message_id` text NOT NULL,
	`document_id` text NOT NULL,
	`status` text NOT NULL,
	`error_code` text,
	`received_at` integer NOT NULL,
	`completed_at` integer
);
--> statement-breakpoint
CREATE INDEX `idx_telegram_updates_chat_status` ON `telegram_updates` (`chat_id`,`status`);--> statement-breakpoint
ALTER TABLE `documents` ADD `content_hash` text;--> statement-breakpoint
CREATE UNIQUE INDEX `uq_documents_source_message` ON `documents` (`source`,`source_message_id`);