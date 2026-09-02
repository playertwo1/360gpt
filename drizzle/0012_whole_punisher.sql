CREATE TABLE `owner_protocol_counters` (
	`owner_id` text PRIMARY KEY NOT NULL,
	`next_value` integer DEFAULT 0 NOT NULL
);
