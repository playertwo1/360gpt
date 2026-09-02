CREATE TABLE IF NOT EXISTS `owner_protocol_counters` (`owner_id` text PRIMARY KEY NOT NULL, `next_value` integer NOT NULL DEFAULT 0);
ALTER TABLE `documents` ADD `short_protocol` integer;
CREATE UNIQUE INDEX IF NOT EXISTS `uq_documents_owner_short_protocol` ON `documents` (`owner_id`,`short_protocol`);
