/**
 * Generates daily tasks personalized to what the user told us in onboarding.
 */

export interface Task {
  id: string;
  time: string;
  title: string;
  detail?: string;
  duration: string;
  category?: string;
}

// ─── FACIAL ───────────────────────────────────────────────────────────────────

function facialTasks(answers: Record<string, string>): Task[] {
  const skin = answers.skin || 'Normal';
  const jawline = answers.jawline || 'Undefined / soft';
  const mewing = answers.mewing || 'Never heard of it';
  const symmetry = answers.symmetry || 'Minor differences';
  const chewing = answers.chewing || 'Yes, always one side';
  const eyeArea = answers.eyeArea || 'Average';

  const isBeginnerMewer = mewing === 'Never heard of it' || mewing === "Know about it but haven't started";
  const hasSymmetryIssue = symmetry === 'Noticeably asymmetric' || symmetry === 'Minor differences';
  const chewsOneSide = chewing === 'Yes, always one side';
  const eyePuffy = eyeArea === 'Soft / puffy' || eyeArea === 'Average';

  const dow = new Date().getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
  const tasks: Task[] = [];

  // ── AM SKINCARE ────────────────────────────────────────────────────────────

  const cleanserTitle = skin === 'Oily' ? 'Salicylic acid cleanser (2%)' : skin === 'Sensitive' ? 'Fragrance-free micellar water' : 'Gentle hydrating cleanser';
  const cleanserDetail = skin === 'Oily' ? 'Clears excess sebum without stripping barrier.' : skin === 'Sensitive' ? 'Press and lift — no rubbing.' : 'Lukewarm water only, never hot.';

  tasks.push({
    id: 'facial-am-cleanse',
    time: '7 AM',
    title: `AM cleanse — ${cleanserTitle}`,
    detail: cleanserDetail,
    duration: '1 min',
    category: 'AM Skincare',
  });

  const serumDetail = skin === 'Oily' ? 'Niacinamide 10% (regulates sebum, tightens pores) OR Vitamin C 15%. Apply on damp skin.'
    : skin === 'Dry' ? 'Hyaluronic acid on damp skin first, then Vitamin C. Locks in moisture + collagen boost.'
    : skin === 'Sensitive' ? 'Centella (Cica) serum first to calm skin, then light Vitamin C. No strong actives yet.'
    : 'Vitamin C serum 15-20% on damp skin. #1 for brightening, evening tone, collagen. Wait 1 min.';

  tasks.push({
    id: 'facial-am-vitc',
    time: '7 AM',
    title: 'Vitamin C serum — apply on damp skin',
    detail: serumDetail,
    duration: '2 min',
    category: 'AM Skincare',
  });

  const moisturiserDetail = skin === 'Oily' ? 'Oil-free gel formula — lightweight. Never skip; dehydrated oily skin overproduces sebum.'
    : skin === 'Dry' ? 'Rich cream moisturizer, seal in the serum.'
    : 'Lightweight moisturizer, then SPF 50 last. Even indoors — UV is the #1 cause of aging and hyperpigmentation.';

  tasks.push({
    id: 'facial-am-moisturiser',
    time: '7 AM',
    title: 'Moisturizer + SPF 50 — non-negotiable',
    detail: moisturiserDetail,
    duration: '2 min',
    category: 'AM Skincare',
  });

  // ── MORNING FACE EXERCISES ─────────────────────────────────────────────────

  tasks.push({
    id: 'facial-mew',
    time: '7 AM',
    title: 'Mewing + posture check',
    detail: isBeginnerMewer
      ? 'Whole tongue pressed flat on roof of mouth (not just tip). Lips together, teeth lightly touching, breathe through nose. Set hourly reminders until automatic.'
      : 'Hard mewing: 10 min conscious full-tongue-to-palate pressure. Then maintain passively all day.',
    duration: '5 min',
    category: 'Jaw Training',
  });

  if (jawline === 'Undefined / soft' || jawline === 'Slightly defined') {
    tasks.push({
      id: 'facial-jaw-clench',
      time: '7 AM',
      title: 'Jaw clenches — 3×15 reps, 5s hold',
      detail: 'Clench molars hard for 5s, release 2s. Isometric masseter work = sharper jaw width. No pain, just tension.',
      duration: '5 min',
      category: 'Jaw Training',
    });
  } else {
    tasks.push({
      id: 'facial-jaw-clench-adv',
      time: '7 AM',
      title: 'Jaw clenches — 4×20 reps, 5s hold',
      detail: 'Progressive overload on the masseter. Combine with chewing gum for full masseter session.',
      duration: '7 min',
      category: 'Jaw Training',
    });
  }

  tasks.push({
    id: 'facial-chin-tuck',
    time: '7 AM',
    title: 'Chin tucks + chin lifts — 3×10 each',
    detail: 'Chin tuck: pull chin straight back, hold 2s. Chin lift: tilt head back, push lower jaw forward, hold 10s. Sharpens neck-chin angle.',
    duration: '4 min',
    category: 'Neck & Chin',
  });

  tasks.push({
    id: 'facial-neck-curl',
    time: '7 AM',
    title: 'Neck curls (supine) — 3×20',
    detail: 'Lie face-up, lift only head (chin to chest). Builds sternocleidomastoid = masculine neck-jaw transition. No swinging.',
    duration: '4 min',
    category: 'Neck & Chin',
  });

  if (!isBeginnerMewer) {
    tasks.push({
      id: 'facial-cheek',
      time: '7 AM',
      title: 'Cheekbone lifts — 3×10 + fish face hold',
      detail: 'Cheek lift: smile wide (teeth apart), lift cheeks max height, hold 2s. Fish face: suck cheeks in, hold 10s × 3 sets. Reduces buccal fat appearance.',
      duration: '4 min',
      category: 'Cheekbones',
    });
  }

  if (eyePuffy) {
    tasks.push({
      id: 'facial-eye-resist',
      time: '7 AM',
      title: 'Eye area — cold compress + resistance training',
      detail: 'Cold compress (damp cloth, 30s) on under-eyes to reduce puffiness. Then finger-resisted brow raises: press brow down, raise against resistance, 3×10.',
      duration: '4 min',
      category: 'Eye Area',
    });
  }

  // ── DAYTIME ────────────────────────────────────────────────────────────────

  tasks.push({
    id: 'facial-gum',
    time: '12 PM',
    title: 'Mastic or Falim gum — 20 min chewing',
    detail: isBeginnerMewer
      ? 'Start with 10 min. Alternate sides every 5 min — both sides equally to avoid asymmetry. Hard chewing > jaw exercisers (full ROM).'
      : 'Full 20-30 min. Also eat hard foods today (raw carrots, nuts) for bonus masseter work.',
    duration: '20 min',
    category: 'Jaw Training',
  });

  tasks.push({
    id: 'facial-posture',
    time: '12 PM',
    title: 'Posture check — chin tuck, ears over shoulders',
    detail: 'Forward head posture kills jawline definition. Every hour: chin tuck, shoulders back, tongue on palate. 10 second reset.',
    duration: '1 min',
    category: 'Facial Foundation',
  });

  if (hasSymmetryIssue || chewsOneSide) {
    tasks.push({
      id: 'facial-symmetry',
      time: '2 PM',
      title: 'Symmetry drill — weaker side only',
      detail: 'Jaw clenches on weaker side only — 3×15. Chew meals on that side consciously today. Over time this corrects asymmetry.',
      duration: '5 min',
      category: 'Symmetry',
    });
  }

  // ── PM SKINCARE + RECOVERY ─────────────────────────────────────────────────

  tasks.push({
    id: 'facial-pm-cleanse',
    time: '9 PM',
    title: 'Double cleanse — remove sunscreen + grime',
    detail: 'Step 1: cleansing oil or coconut oil to dissolve SPF (30s massage). Step 2: gentle cleanser + rinse. Never skip this — sleeping in sunscreen clogs pores.',
    duration: '3 min',
    category: 'PM Skincare',
  });

  // Retinol only 3-4 nights/week (not exfoliation nights)
  const isRetinolNight = dow === 1 || dow === 3 || dow === 5 || dow === 0;
  const isExfoliationNight = dow === 2; // Tuesday = chemical exfoliation
  const isMaskNight = dow === 4 || dow === 6; // Thursday + Saturday = mask

  if (isExfoliationNight) {
    tasks.push({
      id: 'facial-pm-exfoliate',
      time: '9 PM',
      title: 'Chemical exfoliation — AHA/BHA (weekly)',
      detail: 'Salicylic acid 2% or AHA. Apply after cleanse, wait 10 min, then moisturize. NO retinol tonight. Do not use physical scrubs — they create micro-tears.',
      duration: '5 min',
      category: 'PM Skincare',
    });
  } else if (isMaskNight) {
    tasks.push({
      id: 'facial-pm-mask',
      time: '9 PM',
      title: 'Turmeric + yogurt face mask — 15 min',
      detail: 'Mix: 1 tsp turmeric + 2 tbsp yogurt + 1 tsp honey. Apply, leave 15 min, rinse. Curcumin reduces hyperpigmentation. Anti-inflammatory + brightening.',
      duration: '20 min',
      category: 'PM Skincare',
    });
  } else if (isRetinolNight) {
    const retinolDetail = skin === 'Sensitive'
      ? 'Start with retinol 0.1% only 2× per week. Sandwich method: thin moisturizer → retinol → moisturizer on top. Build very slowly.'
      : skin === 'Dry'
      ? 'Retinol 0.1% (start 3×/week). Sandwich technique: moisturizer → retinol → moisturizer. Less irritation, better barrier.'
      : 'Retinol 0.3% (build from 2-3×/week to nightly over 8 weeks). Skin will purge weeks 1-4 — that\'s normal, push through. Gold standard for texture + collagen.';

    tasks.push({
      id: 'facial-pm-retinol',
      time: '9 PM',
      title: 'Retinol — apply after cleanse',
      detail: retinolDetail,
      duration: '2 min',
      category: 'PM Skincare',
    });
  }

  tasks.push({
    id: 'facial-pm-moisturiser',
    time: '9 PM',
    title: 'Night moisturizer + rosehip/jojoba oil',
    detail: '2-3 drops of rosehip or jojoba oil mixed into your moisturizer. Heavier than AM formula. Skin repairs overnight — give it what it needs.',
    duration: '1 min',
    category: 'PM Skincare',
  });

  tasks.push({
    id: 'facial-guasha',
    time: '9 PM',
    title: 'Gua sha — jaw, cheeks, neck (5 min)',
    detail: 'Upward strokes: jawline → cheekbones → forehead. Then neck downward for lymphatic drainage. Reduces puffiness, improves blood flow, temporarily sculpts contours.',
    duration: '5 min',
    category: 'Recovery',
  });

  if (eyePuffy) {
    tasks.push({
      id: 'facial-eye-cream',
      time: '9 PM',
      title: 'Under-eye care — Vitamin C or Vitamin K cream',
      detail: 'Dab (never rub) Vitamin C serum or Vitamin K cream under eyes. Targets periorbital hyperpigmentation and dark circles. Consistent nightly use = gradual improvement.',
      duration: '1 min',
      category: 'Eye Area',
    });
  }

  return tasks;
}

// ─── PHYSICAL ─────────────────────────────────────────────────────────────────

function physicalTasks(bodyAnswers: Record<string, string>, goalText: string): Task[] {
  const posture = bodyAnswers.posture || 'Good';
  const energy = bodyAnswers.energy || 'Moderate';
  const sleep = bodyAnswers.sleep || '7–8 hrs';
  const nutrition = bodyAnswers.nutrition || 'Moderate';
  const training = bodyAnswers.training || 'None';
  const lower = goalText.toLowerCase();

  const tasks: Task[] = [];

  // Morning mobility — everyone gets this
  tasks.push({
    id: 'phys-mobility',
    time: '7 AM',
    title: '6-min morning mobility flow',
    detail: 'Hip circles, thoracic rotations, shoulder dislocates. Before anything else.',
    duration: '6 min',
    category: 'Mobility',
  });

  // Posture-specific
  if (posture === 'Slightly rounded' || posture === 'Forward head' || posture === 'Mixed issues') {
    tasks.push({
      id: 'phys-posture',
      time: '12 PM',
      title: 'Posture reset (wall angels + chin tucks)',
      detail: '10 reps each. Counter sitting posture.',
      duration: '3 min',
      category: 'Posture',
    });
  }

  // Energy — low energy = hydration + walk
  if (energy === 'Low' || energy === 'Very inconsistent') {
    tasks.push({
      id: 'phys-walk',
      time: '12 PM',
      title: '20-min walk — midday energy reset',
      detail: 'Sunlight on face, no headphones optional. Natural cortisol regulator.',
      duration: '20 min',
      category: 'Movement',
    });
    tasks.push({
      id: 'phys-hydration',
      time: '7 AM',
      title: 'Drink 1L water before noon',
      detail: 'Track it. Dehydration = energy loss.',
      duration: '—',
      category: 'Nutrition',
    });
  }

  // Nutrition
  if (nutrition === 'Poor' || nutrition === 'Moderate') {
    tasks.push({
      id: 'phys-protein',
      time: '8 AM',
      title: 'Hit protein target at breakfast',
      detail: 'Eggs, Greek yogurt, or protein shake. Aim: 30–40g per meal.',
      duration: '—',
      category: 'Nutrition',
    });
  }

  if (lower.includes('lean') || lower.includes('fat') || lower.includes('weight') || lower.includes('bulk')) {
    tasks.push({
      id: 'phys-calories',
      time: '9 PM',
      title: "Log today's meals (rough estimate)",
      detail: lower.includes('lean') || lower.includes('cut')
        ? 'Stay ~300–500 cal below maintenance.'
        : 'Stay ~300 cal above maintenance.',
      duration: '3 min',
      category: 'Nutrition',
    });
  }

  // Sleep
  if (sleep === 'Less than 6' || sleep === '6–7 hrs') {
    tasks.push({
      id: 'phys-sleep',
      time: '10 PM',
      title: 'Phone in another room — wind down',
      detail: 'Blue light blocks melatonin. Dim lights 1hr before sleep.',
      duration: '—',
      category: 'Sleep',
    });
  }

  // Stretching — tiered by training level
  if (training === 'None' || training === 'Beginner') {
    tasks.push({
      id: 'phys-stretch',
      time: '9 PM',
      title: 'Post-workout full-body stretch — 10 min',
      detail: 'Hip flexors, hamstrings, chest opener, shoulder cross, quad stretch, spinal twist. Hold each 30–45s.',
      duration: '10 min',
      category: 'Stretching',
    });
  } else if (training === 'Intermediate') {
    tasks.push({
      id: 'phys-mobility-flow',
      time: '9 PM',
      title: 'Mobility flow — 15 min',
      detail: 'Deep hip rotations, thoracic spine, pigeon pose, couch stretch, world\'s greatest stretch. Loaded holds.',
      duration: '15 min',
      category: 'Stretching',
    });
  } else {
    tasks.push({
      id: 'phys-athlete-mobility',
      time: '9 PM',
      title: 'Athlete mobility protocol — 20 min',
      detail: 'PNF stretching, loaded stretching for splits, shoulder dislocates, Jefferson curls. Full ROM work.',
      duration: '20 min',
      category: 'Stretching',
    });
  }

  // Workout reminder
  if (training !== 'None') {
    tasks.push({
      id: 'phys-workout',
      time: '6 PM',
      title: "Complete today's workout session",
      detail: training === 'Beginner'
        ? 'Full body 3×/week. Check Physical aspect for today\'s session.'
        : 'Check today\'s PPL day in your Physical aspect. Sets, reps, rest times are all there.',
      duration: '60 min',
      category: 'Workout',
    });
  }

  return tasks;
}

// ─── MENTAL ───────────────────────────────────────────────────────────────────

function mentalTasks(): Task[] {
  return [
    { id: 'mental-breath', time: '7 AM', title: 'Box breathing × 5 rounds', detail: '4s in, 4s hold, 4s out, 4s hold. Sets the tone.', duration: '3 min', category: 'Focus' },
    { id: 'mental-focus', time: '12 PM', title: 'Deep focus block — phone in drawer', detail: 'Single task only. No notifications.', duration: '90 min', category: 'Focus' },
    { id: 'mental-journal', time: '9 PM', title: 'Journal: 3 wins today', detail: 'What went right? What would you repeat?', duration: '5 min', category: 'Reflection' },
  ];
}

// ─── SPIRITUAL ────────────────────────────────────────────────────────────────

function spiritualTasks(): Task[] {
  return [
    { id: 'spirit-silence', time: '6 AM', title: 'Sit in silence — no phone', detail: 'Just breathe. 10 minutes, no agenda.', duration: '10 min', category: 'Practice' },
    { id: 'spirit-gratitude', time: '9 PM', title: "Say 3 things you're grateful for — aloud", detail: 'Spoken, not typed. Makes it land differently.', duration: '2 min', category: 'Practice' },
  ];
}

// ─── MONEY ────────────────────────────────────────────────────────────────────

function moneyTasks(): Task[] {
  const tasks: Task[] = [];

  // Daily spend log — everyone
  tasks.push({
    id: 'money-log',
    time: '8 AM',
    title: "Log yesterday's spend",
    detail: 'Just look. Awareness is the foundation of all financial progress.',
    duration: '2 min',
    category: 'Tracking',
  });

  // Weekly audit on Sunday
  if (new Date().getDay() === 0) {
    tasks.push({
      id: 'money-audit',
      time: '10 AM',
      title: 'Weekly 15-min money audit',
      detail: 'Total in vs out. Any category over budget? Net worth update.',
      duration: '15 min',
      category: 'Review',
    });
  }

  tasks.push({
    id: 'money-budget',
    time: '8 PM',
    title: '50/30/20 budget check',
    detail: '50% needs, 30% wants, 20% savings/debt. Are you on track this month?',
    duration: '5 min',
    category: 'Foundation',
  });

  tasks.push({
    id: 'money-skill',
    time: '7 PM',
    title: '30-min high-income skill block',
    detail: 'Pick one: copywriting, coding, video editing, design, sales, social media. Daily reps compound fast.',
    duration: '30 min',
    category: 'Income',
  });

  tasks.push({
    id: 'money-emergency',
    time: '9 PM',
    title: 'Transfer to savings/emergency fund',
    detail: 'Even a small amount counts. Goal: 3 months of expenses. Automate the transfer if possible.',
    duration: '2 min',
    category: 'Savings',
  });

  return tasks;
}

// ─── KNOWLEDGE ────────────────────────────────────────────────────────────────

function knowledgeTasks(): Task[] {
  return [
    { id: 'know-read', time: '8 PM', title: '20-min focused reading', detail: "One book only. Underline anything you'd tell someone tomorrow.", duration: '20 min', category: 'Reading' },
    { id: 'know-write', time: '9 PM', title: 'Write one sentence of what you learned', detail: 'In your own words. Forces encoding.', duration: '2 min', category: 'Reflection' },
  ];
}

// ─── PUBLIC API ────────────────────────────────────────────────────────────────

export interface PersonalisedTasks {
  tasks: Task[];
  workoutLabel?: string;
}

export function generateTasksForAspect(
  aspectId: string,
  looksAnswers: Record<string, string>,
  bodyAnswers: Record<string, string>,
  goalText: string,
): Task[] {
  switch (aspectId) {
    case 'facial':
      return facialTasks(looksAnswers);
    case 'physical':
      return physicalTasks(bodyAnswers, goalText);
    case 'mental':
      return mentalTasks();
    case 'spiritual':
      return spiritualTasks();
    case 'money':
      return moneyTasks();
    case 'knowledge':
      return knowledgeTasks();
    default:
      return [];
  }
}
