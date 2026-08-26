CREATE TABLE `evidence_nodes` (
	`node_id` text PRIMARY KEY NOT NULL,
	`tenant_id` text NOT NULL,
	`node_type` text NOT NULL CHECK (`node_type` IN ('SOURCE_ARTIFACT','OBSERVATION','TRANSFORMATION','FINDING','RECOMMENDATION','MANUAL_REVIEW_REQUEST','REVIEW_RESOLUTION','STATE_SNAPSHOT','ACTOR')),
	`entity_id` text NOT NULL,
	`entity_version` integer DEFAULT 1 NOT NULL CHECK (`entity_version` >= 1),
	`content_hash` text NOT NULL CHECK (length(`content_hash`) = 71 AND substr(`content_hash`, 1, 7) = 'sha256:' AND substr(`content_hash`, 8) NOT GLOB '*[^0-9a-f]*'),
	`payload_json` text DEFAULT '{}' NOT NULL CHECK (json_valid(`payload_json`)),
	`valid_from` integer,
	`valid_to` integer,
	`observed_at` integer,
	`recorded_at` integer NOT NULL,
	`superseded_at` integer,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `uq_evidence_node_entity_version` ON `evidence_nodes` (`tenant_id`,`node_type`,`entity_id`,`entity_version`);
--> statement-breakpoint
CREATE INDEX `idx_evidence_nodes_tenant_type` ON `evidence_nodes` (`tenant_id`,`node_type`);
--> statement-breakpoint
CREATE INDEX `idx_evidence_nodes_entity` ON `evidence_nodes` (`tenant_id`,`entity_id`);
--> statement-breakpoint
CREATE INDEX `idx_evidence_nodes_recorded` ON `evidence_nodes` (`tenant_id`,`recorded_at`);
--> statement-breakpoint
CREATE TABLE `evidence_edges` (
	`edge_id` text PRIMARY KEY NOT NULL,
	`tenant_id` text NOT NULL,
	`relationship_type` text NOT NULL CHECK (`relationship_type` IN ('DERIVED_FROM','GENERATED_BY','USED','ATTRIBUTED_TO','SUPPORTED_BY','CONTRADICTS','SUPERSEDES','INVALIDATES','INCLUDED_IN_STATE')),
	`from_node_id` text NOT NULL,
	`to_node_id` text NOT NULL,
	`content_hash` text NOT NULL CHECK (length(`content_hash`) = 71 AND substr(`content_hash`, 1, 7) = 'sha256:' AND substr(`content_hash`, 8) NOT GLOB '*[^0-9a-f]*'),
	`payload_json` text DEFAULT '{}' NOT NULL CHECK (json_valid(`payload_json`)),
	`created_at` integer NOT NULL,
	FOREIGN KEY (`from_node_id`) REFERENCES `evidence_nodes`(`node_id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`to_node_id`) REFERENCES `evidence_nodes`(`node_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `uq_evidence_edge_relation` ON `evidence_edges` (`tenant_id`,`relationship_type`,`from_node_id`,`to_node_id`);
--> statement-breakpoint
CREATE INDEX `idx_evidence_edges_from` ON `evidence_edges` (`tenant_id`,`from_node_id`);
--> statement-breakpoint
CREATE INDEX `idx_evidence_edges_to` ON `evidence_edges` (`tenant_id`,`to_node_id`);
--> statement-breakpoint
CREATE TRIGGER `evidence_nodes_no_update` BEFORE UPDATE ON `evidence_nodes` BEGIN SELECT RAISE(ABORT, 'evidence_nodes_append_only'); END;
--> statement-breakpoint
CREATE TRIGGER `evidence_nodes_no_delete` BEFORE DELETE ON `evidence_nodes` BEGIN SELECT RAISE(ABORT, 'evidence_nodes_append_only'); END;
--> statement-breakpoint
CREATE TRIGGER `evidence_edges_no_update` BEFORE UPDATE ON `evidence_edges` BEGIN SELECT RAISE(ABORT, 'evidence_edges_append_only'); END;
--> statement-breakpoint
CREATE TRIGGER `evidence_edges_no_delete` BEFORE DELETE ON `evidence_edges` BEGIN SELECT RAISE(ABORT, 'evidence_edges_append_only'); END;
--> statement-breakpoint
PRAGMA optimize;
