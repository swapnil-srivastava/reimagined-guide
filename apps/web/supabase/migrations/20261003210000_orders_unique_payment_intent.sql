-- One order per payment. Stripe can deliver the same webhook event twice at
-- the same time; the select-then-insert check in pages/api/webhook.ts can't
-- stop both, but this index makes the second insert fail with 23505, which
-- the webhook treats as "already saved".
drop index if exists public.idx_orders_payment_intent_id;
create unique index if not exists orders_payment_intent_id_key
  on public.orders (payment_intent_id)
  where payment_intent_id is not null;
