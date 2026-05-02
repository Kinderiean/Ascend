import { SkincareRoutine } from './types';
import { SkinProfile, AgeBand } from '../profile';

const oily_acne: SkincareRoutine = {
  am: [
    { order: 1, name: 'Gentle gel cleanser', notes: 'Low-foaming, sulfate-free' },
    { order: 2, name: 'Niacinamide 5%', active: 'niacinamide', citationId: 'niacinamide_barrier' },
    { order: 3, name: 'Oil-free moisturizer', notes: 'Non-comedogenic' },
    { order: 4, name: 'Broad-spectrum SPF 50', citationId: 'spf_aging' },
  ],
  pm: [
    { order: 1, name: 'Gentle gel cleanser' },
    { order: 2, name: 'BHA 2%', active: 'salicylic acid', citationId: 'bha_acne', notes: '3-4 nights/week, not with retinol' },
    { order: 3, name: 'Light moisturizer', notes: 'Skip if BHA was applied tonight' },
  ],
  weekly: [
    { order: 1, name: 'Clay mask', notes: '1x/week, 10 min' },
  ],
  cautions: [
    'Do not stack BHA + retinol on the same night',
    'Always wear SPF the morning after BHA use',
    'Patch-test new actives on inner forearm for 48 hours',
  ],
  citationIds: ['niacinamide_barrier', 'bha_acne', 'spf_aging'],
};

const dry_sensitive: SkincareRoutine = {
  am: [
    { order: 1, name: 'Cream cleanser', notes: 'No-foam, fragrance-free' },
    { order: 2, name: 'Hyaluronic acid serum on damp skin' },
    { order: 3, name: 'Ceramide moisturizer', citationId: 'ceramides_dry' },
    { order: 4, name: 'Mineral SPF 30+', citationId: 'spf_aging', notes: 'Zinc oxide tolerated by sensitive skin' },
  ],
  pm: [
    { order: 1, name: 'Cream cleanser' },
    { order: 2, name: 'Niacinamide 4%', active: 'niacinamide', citationId: 'niacinamide_barrier' },
    { order: 3, name: 'Rich ceramide moisturizer', citationId: 'ceramides_dry' },
    { order: 4, name: 'Squalane oil', notes: 'Optional, locks in moisture' },
  ],
  weekly: [
    { order: 1, name: 'Cream-based hydrating mask', notes: '1-2x/week' },
  ],
  cautions: [
    'Avoid foaming or sulfate cleansers',
    'Introduce one new active every 2 weeks',
    'Skip alcohol-based toners',
  ],
  citationIds: ['ceramides_dry', 'niacinamide_barrier', 'spf_aging'],
};

const combo: SkincareRoutine = {
  am: [
    { order: 1, name: 'Gentle low-foam cleanser' },
    { order: 2, name: 'Vitamin C serum 10%', active: 'L-ascorbic acid', citationId: 'vitamin_c_antioxidant' },
    { order: 3, name: 'Lightweight gel-cream moisturizer' },
    { order: 4, name: 'Broad-spectrum SPF 50', citationId: 'spf_aging' },
  ],
  pm: [
    { order: 1, name: 'Oil cleanse if wearing SPF/makeup', notes: 'Optional first step' },
    { order: 2, name: 'Gentle cleanser' },
    { order: 3, name: 'Retinol 0.25-0.5%', active: 'retinol', citationId: 'retinol_efficacy', notes: 'Start 2x/week, build to nightly' },
    { order: 4, name: 'Ceramide moisturizer', citationId: 'ceramides_dry' },
  ],
  weekly: [
    { order: 1, name: 'AHA 5-8% (PM)', notes: '1x/week, opposite night to retinol' },
  ],
  cautions: [
    'Layer thinner products under thicker',
    'SPF every morning, even when retinol was used the previous night',
    'Avoid retinol + AHA on the same evening',
  ],
  citationIds: ['vitamin_c_antioxidant', 'retinol_efficacy', 'ceramides_dry', 'spf_aging'],
};

const mature: SkincareRoutine = {
  am: [
    { order: 1, name: 'Cream cleanser' },
    { order: 2, name: 'Vitamin C serum 15%', active: 'L-ascorbic acid', citationId: 'vitamin_c_antioxidant' },
    { order: 3, name: 'Peptide serum', notes: 'Supports collagen synthesis' },
    { order: 4, name: 'Rich ceramide moisturizer', citationId: 'ceramides_dry' },
    { order: 5, name: 'Mineral SPF 50', citationId: 'spf_aging' },
  ],
  pm: [
    { order: 1, name: 'Oil cleanse + cream cleanse' },
    { order: 2, name: 'Retinol 0.5-1.0%', active: 'retinol', citationId: 'retinol_efficacy', notes: 'Buffer with moisturizer if irritated' },
    { order: 3, name: 'Peptide + niacinamide layer', citationId: 'niacinamide_barrier' },
    { order: 4, name: 'Rich night cream' },
    { order: 5, name: 'Facial oil seal (rosehip, squalane)' },
  ],
  weekly: [
    { order: 1, name: 'Lactic acid 5-10% (PM)', notes: '1x/week, opposite night to retinol' },
    { order: 2, name: 'Hydrating mask', notes: '1-2x/week' },
  ],
  cautions: [
    'Daily SPF is the single largest impact factor for visible aging',
    'Start retinol slowly to avoid barrier disruption',
    'Avoid using multiple acids on the same evening',
  ],
  citationIds: ['vitamin_c_antioxidant', 'retinol_efficacy', 'niacinamide_barrier', 'ceramides_dry', 'spf_aging'],
};

const normal: SkincareRoutine = {
  am: [
    { order: 1, name: 'Gentle cleanser' },
    { order: 2, name: 'Vitamin C serum 10%', active: 'L-ascorbic acid', citationId: 'vitamin_c_antioxidant' },
    { order: 3, name: 'Light moisturizer' },
    { order: 4, name: 'Broad-spectrum SPF 30+', citationId: 'spf_aging' },
  ],
  pm: [
    { order: 1, name: 'Gentle cleanser' },
    { order: 2, name: 'Retinol 0.25%', active: 'retinol', citationId: 'retinol_efficacy', notes: '2-3x/week' },
    { order: 3, name: 'Ceramide moisturizer', citationId: 'ceramides_dry' },
  ],
  weekly: [
    { order: 1, name: 'Gentle exfoliating mask', notes: '1x/week' },
  ],
  cautions: [
    'Wear SPF daily',
    'Patch-test new products',
  ],
  citationIds: ['vitamin_c_antioxidant', 'retinol_efficacy', 'ceramides_dry', 'spf_aging'],
};

const SKINCARE_BUNDLES: Record<SkinProfile, SkincareRoutine> = {
  oily_acne,
  dry_sensitive,
  combo,
  mature,
  normal,
};

export function getSkincareRoutine(skinProfile: SkinProfile, _ageBand: AgeBand): SkincareRoutine {
  return SKINCARE_BUNDLES[skinProfile] ?? normal;
}
