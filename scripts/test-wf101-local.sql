\set ON_ERROR_STOP on
BEGIN;
SET ROLE visao360_app;

INSERT INTO channel_updates (channel, external_update_id, tenant_id, owner_id, chat_id, message_id, payload, payload_hash, status)
VALUES ('TELEGRAM', 'wf101-synthetic-1', 'rafael-360', 'rafael', '5281600644', '1', '{}'::jsonb, 'sha256:test', 'QUEUED');

INSERT INTO channel_inbound_events (inbound_event_id, channel, external_update_id, tenant_id, owner_id, chat_id, event_kind, text_content)
VALUES ('00000000-0000-0000-0000-000000000101', 'TELEGRAM', 'wf101-synthetic-1', 'rafael-360', 'rafael', '5281600644', 'COMMAND', '/comandos');

WITH candidate AS (
  SELECT inbound_event_id FROM channel_inbound_events
  WHERE status='QUEUED' AND available_at<=now() AND external_update_id='wf101-synthetic-1'
  FOR UPDATE SKIP LOCKED LIMIT 1
)
UPDATE channel_inbound_events e
SET status='PROCESSING', lease_token=gen_random_uuid(), lease_expires_at=now()+interval '2 minutes', attempt_count=attempt_count+1
FROM candidate c WHERE e.inbound_event_id=c.inbound_event_id;

INSERT INTO conversation_threads (thread_id, tenant_id, owner_id, channel, chat_id)
VALUES ('00000000-0000-0000-0000-000000000111', 'rafael-360', 'rafael', 'TELEGRAM', '5281600644');

INSERT INTO conversation_messages (conversation_message_id, thread_id, direction, actor_role, external_message_id, content, content_hash)
VALUES ('00000000-0000-0000-0000-000000000112', '00000000-0000-0000-0000-000000000111', 'INBOUND', 'OWNER', 'wf101-synthetic-1', '/comandos', 'sha256:test');

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM channel_inbound_events WHERE external_update_id='wf101-synthetic-1' AND status='PROCESSING' AND lease_token IS NOT NULL AND attempt_count=1) THEN
    RAISE EXCEPTION 'WF101_CLAIM_ASSERTION_FAILED';
  END IF;
  IF (SELECT count(*) FROM conversation_messages WHERE external_message_id='wf101-synthetic-1') <> 1 THEN
    RAISE EXCEPTION 'WF101_CONVERSATION_ASSERTION_FAILED';
  END IF;
END $$;

ROLLBACK;
SELECT 'WF101_LOCAL_DB_PASS' AS result;
