-- ============================================================
-- Cleanup: Keep only the 5 Firebase catalog plans in subscription_plans
-- Remap all user_subscriptions to the correct catalog plan, then delete extras
-- ============================================================

-- Step 1: Identify the 5 catalog plans (from Firebase memberships.json)
-- These are the ones we keep.

-- Step 2: Remap user_subscriptions from extra plans to catalog plans
-- Mapping logic: match by name similarity and interval

-- 1 MES ($5, month, 200 subs) → Plan de 1 mes ($1, month)
UPDATE user_subscriptions
SET plan_id = (SELECT id FROM subscription_plans WHERE name->>'en' = 'Plan de 1 mes' LIMIT 1)
WHERE plan_id = (SELECT id FROM subscription_plans WHERE name->>'en' = '1 MES' LIMIT 1);

-- 3 MESES ($14, quarter, 39 subs) → Plan ENURM 27 3 cuotas ($1, quarter)
UPDATE user_subscriptions
SET plan_id = (SELECT id FROM subscription_plans WHERE name->>'en' = 'Plan ENURM 27 3 cuotas' LIMIT 1)
WHERE plan_id = (SELECT id FROM subscription_plans WHERE name->>'en' = '3 MESES' LIMIT 1);

-- 6 MESES ($57, quarter, 59 subs) → Plan ENURM 27 3 cuotas
UPDATE user_subscriptions
SET plan_id = (SELECT id FROM subscription_plans WHERE name->>'en' = 'Plan ENURM 27 3 cuotas' LIMIT 1)
WHERE plan_id = (SELECT id FROM subscription_plans WHERE name->>'en' = '6 MESES' LIMIT 1);

-- 6 MESES (with trailing space, 38 subs) → Plan ENURM 27 3 cuotas
UPDATE user_subscriptions
SET plan_id = (SELECT id FROM subscription_plans WHERE name->>'en' = 'Plan ENURM 27 3 cuotas' LIMIT 1)
WHERE plan_id = (SELECT id FROM subscription_plans WHERE name->>'en' LIKE '6 MESES %' LIMIT 1);

-- Plan de 3 meses ($47.15, quarter, 61 subs) → Plan ENURM 27 3 cuotas
UPDATE user_subscriptions
SET plan_id = (SELECT id FROM subscription_plans WHERE name->>'en' = 'Plan ENURM 27 3 cuotas' LIMIT 1)
WHERE plan_id = (SELECT id FROM subscription_plans WHERE name->>'en' = 'Plan de 3 meses' LIMIT 1);

-- Plan de 6 meses ($58, year, 11 subs) → Plan PREMIUM ENURM ($65, quarter)
UPDATE user_subscriptions
SET plan_id = (SELECT id FROM subscription_plans WHERE name->>'en' = 'Plan PREMIUM ENURM' LIMIT 1)
WHERE plan_id = (SELECT id FROM subscription_plans WHERE name->>'en' = 'Plan de 6 meses' LIMIT 1);

-- Plan de 9 meses ($67, quarter, 6 subs) → Plan PREMIUM ENURM
UPDATE user_subscriptions
SET plan_id = (SELECT id FROM subscription_plans WHERE name->>'en' = 'Plan PREMIUM ENURM' LIMIT 1)
WHERE plan_id = (SELECT id FROM subscription_plans WHERE name->>'en' = 'Plan de 9 meses' LIMIT 1);

-- 1 AÑO ($110, year, 23 subs) → Plan PREMIUM ENURM
UPDATE user_subscriptions
SET plan_id = (SELECT id FROM subscription_plans WHERE name->>'en' = 'Plan PREMIUM ENURM' LIMIT 1)
WHERE plan_id = (SELECT id FROM subscription_plans WHERE name->>'en' = '1 AÑO' LIMIT 1);

-- Plan de 1 año ($79, year, 2 subs) → Plan PREMIUM ENURM
UPDATE user_subscriptions
SET plan_id = (SELECT id FROM subscription_plans WHERE name->>'en' = 'Plan PREMIUM ENURM' LIMIT 1)
WHERE plan_id = (SELECT id FROM subscription_plans WHERE name->>'en' = 'Plan de 1 año' LIMIT 1);

-- Plan de 1 año (Clave del éxito) ($79, year, 50 subs) → Plan PREMIUM ENURM
UPDATE user_subscriptions
SET plan_id = (SELECT id FROM subscription_plans WHERE name->>'en' = 'Plan PREMIUM ENURM' LIMIT 1)
WHERE plan_id = (SELECT id FROM subscription_plans WHERE name->>'en' = 'Plan de 1 año (Clave del éxito)' LIMIT 1);

-- Intensivo ENURM ($29, quarter, 158 subs) → Plan ENURM 27 ($40.65, quarter)
UPDATE user_subscriptions
SET plan_id = (SELECT id FROM subscription_plans WHERE name->>'en' = 'Plan ENURM 27' LIMIT 1)
WHERE plan_id = (SELECT id FROM subscription_plans WHERE name->>'en' = 'Intensivo ENURM' LIMIT 1);

-- Intensivo ENURM (trailing space, 149 subs) → Plan ENURM 27
UPDATE user_subscriptions
SET plan_id = (SELECT id FROM subscription_plans WHERE name->>'en' = 'Plan ENURM 27' LIMIT 1)
WHERE plan_id = (SELECT id FROM subscription_plans WHERE name->>'en' LIKE 'Intensivo ENURM %' LIMIT 1);

-- Intensivo ENURM 2025 ($29, quarter, 36 subs) → Plan ENURM 27
UPDATE user_subscriptions
SET plan_id = (SELECT id FROM subscription_plans WHERE name->>'en' = 'Plan ENURM 27' LIMIT 1)
WHERE plan_id = (SELECT id FROM subscription_plans WHERE name->>'en' = 'Intensivo ENURM 2025' LIMIT 1);

-- Plan ENURM 26 ($1, quarter, 466 subs) → Plan ENURM 27 ($40.65, quarter)
UPDATE user_subscriptions
SET plan_id = (SELECT id FROM subscription_plans WHERE name->>'en' = 'Plan ENURM 27' LIMIT 1)
WHERE plan_id = (SELECT id FROM subscription_plans WHERE name->>'en' = 'Plan ENURM 26' LIMIT 1);

-- MIR 2028 ($49.99, quarter, 1 sub) → Plan PREMIUM ENURM ($65, quarter)
UPDATE user_subscriptions
SET plan_id = (SELECT id FROM subscription_plans WHERE name->>'en' = 'Plan PREMIUM ENURM' LIMIT 1)
WHERE plan_id = (SELECT id FROM subscription_plans WHERE name->>'en' = 'MIR 2028' LIMIT 1);

-- Plan ENARM 2025 ($89.90, quarter, 1 sub) → Plan PREMIUM ENURM
UPDATE user_subscriptions
SET plan_id = (SELECT id FROM subscription_plans WHERE name->>'en' = 'Plan PREMIUM ENURM' LIMIT 1)
WHERE plan_id = (SELECT id FROM subscription_plans WHERE name->>'en' = 'Plan ENARM 2025' LIMIT 1);

-- Step 3: Delete extra plans (no user_subscriptions should reference them now)
DELETE FROM subscription_plans WHERE name->>'en' IN (
  '1 MES',
  '3 MESES',
  '6 MESES',
  '6 MESES ',
  'Plan de 3 meses',
  'Plan de 6 meses',
  'Plan de 9 meses',
  '1 AÑO',
  'Plan de 1 año',
  'Plan de 1 año (Clave del éxito)',
  'Intensivo ENURM',
  'Intensivo ENURM ',
  'Intensivo ENURM 2025',
  'Plan ENURM 26',
  'MIR 2028',
  'Plan ENARM 2025'
);

-- Step 4: Update the 5 catalog plans with correct data from Firebase
UPDATE subscription_plans SET
  price = '0.00',
  interval = 'month',
  max_exam_attempts = 2,
  max_flashcard_attempts = 2,
  max_uses = 2,
  is_default = true,
  is_visible = true,
  sort_order = 1,
  description = '{"en": "Create an account and get a preview of the entire platform", "es": "Crea un usuario y echa un vistazo de toda la plataforma"}'
WHERE name->>'en' = 'FREE ACCESS';

UPDATE subscription_plans SET
  price = '1.00',
  interval = 'month',
  max_exam_attempts = 10000,
  max_flashcard_attempts = 50000,
  max_uses = 10000,
  is_default = false,
  is_visible = true,
  sort_order = 2,
  description = '{"en": "Full access for 1 month", "es": "Acceso completo por 1 mes"}'
WHERE name->>'en' = 'Plan de 1 mes';

UPDATE subscription_plans SET
  price = '1.00',
  interval = 'quarter',
  max_exam_attempts = 10000,
  max_flashcard_attempts = 50000,
  max_uses = 10000,
  is_default = false,
  is_visible = true,
  sort_order = 3,
  description = '{"en": "Full access for 3 months", "es": "Acceso completo por 3 meses"}'
WHERE name->>'en' = 'Plan ENURM 27 3 cuotas';

UPDATE subscription_plans SET
  price = '40.65',
  interval = 'quarter',
  max_exam_attempts = 100000,
  max_flashcard_attempts = 100000,
  max_uses = 100000,
  is_default = false,
  is_visible = true,
  sort_order = 4,
  description = '{"en": "ENURM 27 full preparation plan", "es": "Plan completo de preparación ENURM 27"}'
WHERE name->>'en' = 'Plan ENURM 27';

UPDATE subscription_plans SET
  price = '65.00',
  interval = 'quarter',
  max_exam_attempts = 10000,
  max_flashcard_attempts = 50000,
  max_uses = 10000,
  is_default = false,
  is_visible = true,
  sort_order = 5,
  description = '{"en": "Premium ENURM plan with all features", "es": "Plan PREMIUM ENURM con todas las funciones"}'
WHERE name->>'en' = 'Plan PREMIUM ENURM';
