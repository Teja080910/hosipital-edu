-- Deduplicate subscription plans on Hostinger
-- Keeps only Firestore-originated plans (FREE ACCESS, Plan de 1 mes, Plan ENURM 27, etc.)
-- Deletes seeded plans (Month, Quarterly, Annual)

BEGIN;

-- Reassign active subscriptions from seeded plans to Firestore plans
UPDATE user_subscriptions SET plan_id = (SELECT id FROM subscription_plans WHERE sort_order = 3) WHERE plan_id = (SELECT id FROM subscription_plans WHERE sort_order = 0);
UPDATE user_subscriptions SET plan_id = (SELECT id FROM subscription_plans WHERE sort_order = 6) WHERE plan_id = (SELECT id FROM subscription_plans WHERE sort_order = 2);

-- Delete canceled subscriptions referencing Annual so we can drop it
DELETE FROM user_subscriptions WHERE plan_id = (SELECT id FROM subscription_plans WHERE sort_order = 4);

-- Drop seeded plans (Month=0, Quarterly=2, Annual=4)
DELETE FROM subscription_plans WHERE sort_order IN (0, 2, 4);

-- Add max_exam_attempts column if missing
ALTER TABLE subscription_plans ADD COLUMN IF NOT EXISTS max_exam_attempts integer;
ALTER TABLE user_subscriptions ADD COLUMN IF NOT EXISTS remaining_exam_attempts integer;

-- Set max_exam_attempts on remaining Firestore plans
UPDATE subscription_plans SET max_exam_attempts = 50   WHERE name->>'en' = 'FREE ACCESS';
UPDATE subscription_plans SET max_exam_attempts = 999999 WHERE name->>'en' = 'Plan de 1 mes';
UPDATE subscription_plans SET max_exam_attempts = 10   WHERE name->>'en' LIKE 'Plan ENURM%' OR name->>'en' LIKE '%PREMIUM%';

-- Initialize remaining attempts for active subscriptions
UPDATE user_subscriptions us
SET remaining_exam_attempts = sp.max_exam_attempts
FROM subscription_plans sp
WHERE us.plan_id = sp.id AND us.status = 'active' AND us.remaining_exam_attempts IS NULL;

COMMIT;