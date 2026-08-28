CREATE TABLE `shadow_observations` (
	`id` text PRIMARY KEY NOT NULL,
	`release_id` text NOT NULL,
	`observed_at` integer NOT NULL,
	`duration_ms` integer NOT NULL,
	`total_cases` integer NOT NULL,
	`completed_cases` integer NOT NULL,
	`errors` integer NOT NULL,
	`equivalence_rate_bps` integer NOT NULL,
	`divergence_rate_bps` integer NOT NULL,
	`state_mutation_count` integer NOT NULL,
	`external_effect_count` integer NOT NULL,
	`pause_required` integer NOT NULL,
	`data_scope` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `uq_shadow_observations_release_time` ON `shadow_observations` (`release_id`,`observed_at`);--> statement-breakpoint
CREATE INDEX `idx_shadow_observations_release_time` ON `shadow_observations` (`release_id`,`observed_at`);