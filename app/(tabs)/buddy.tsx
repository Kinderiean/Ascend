import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  View, Text, ScrollView, TextInput, TouchableOpacity,
  StatusBar, KeyboardAvoidingView, Platform, Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Circle } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { useStore } from '../../lib/store';
import { useColors } from '../../lib/theme';
import { Colors, Fonts, FontSize, Spacing, Radii } from '../../theme/tokens';
import Companion from '../../components/Companion';
import { petChatMessageSchema, sanitizeText, validate, RateLimiter } from '../../lib/validation';

// ──────────────────────────────────────────
// Types
// ──────────────────────────────────────────

type Mood = 'wandering' | 'zoomies' | 'napping' | 'eating';

// ──────────────────────────────────────────
// Constants
// ──────────────────────────────────────────

const MOOD_EMOJI: Record<Mood, string> = {
  wandering: '🌿',
  zoomies: '🌟',
  napping: '😴',
  eating: '🍖',
};

const ACTION_TILES = [
  { label: 'Pet', glyph: '❤', color: '#F2A7B0', mood: 'wandering' as Mood },
  { label: 'Feed', glyph: '🍖', color: '#C98A3A', mood: 'eating' as Mood },
  { label: 'Play', glyph: '✦', color: '#C9B8F5', mood: 'zoomies' as Mood },
  { label: 'Nap', glyph: '☾', color: '#8FB8E0', mood: 'napping' as Mood },
] as const;

const PET_TAPS = [
  "Hey! 👋", "Let's go!", "Feed me? 🍖",
  "Keep going!", "I believe in you.", "Do the task!",
  "No excuses.", "You've got this.", "Stay focused.",
];

const MOTIVATIONS = [
  "Discipline is just remembering what you want.",
  "You don't rise to goals. You fall to systems.",
  "Every rep, every task — compound interest.",
  "The pain of discipline weighs ounces. Regret weighs tons.",
  "Your future self is watching you right now.",
  "The workout you avoid is the one you need most.",
  "Consistency beats intensity. Always.",
  "No one is coming to save you. Build yourself.",
  "Show up. That's half of it.",
  "Hard choices, easy life. Easy choices, hard life.",
  "The mirror doesn't lie. Neither does your calendar.",
  "Average is a choice. So is excellence.",
  "One more rep. One more task. One more day of not quitting.",
  "What you do in private shows up in public.",
  "The man who shows up every day beats the man who shows up inspired.",
  "Comfort is the enemy of growth. Get uncomfortable.",
  "Don't count the days. Make the days count.",
  "You haven't failed. You've found what doesn't work.",
  "Your excuses won't show when results are counted.",
  "The version of you in six months will thank today's you.",
];

// Pseudo-random but stable star positions
const STARS = Array.from({ length: 14 }, (_, i) => ({
  x: 10 + ((i * 73 + 17) % 280),
  y: 8 + ((i * 41 + 11) % 75),
  opacity: 0.3 + ((i * 37) % 100) / 300,
  size: 4 + ((i * 19) % 4),
}));

// ──────────────────────────────────────────
// Smart reply engine
// ──────────────────────────────────────────

interface Ctx {
  name: string; aspects: string[]; xp: number; streakDays: number;
  goalText: string; bodyAnswers: Record<string, string>; looksAnswers: Record<string, string>;
}

function getDayWorkout(): string {
  // Aligned with workoutPlan.ts: Sun=Push A, Mon=Pull A, Tue=Legs A, Wed=Push B, Thu=Pull B, Fri=Legs B, Sat=REST
  const map: Record<number, string> = {
    0: 'Push A — Chest · Shoulders · Triceps',
    1: 'Pull A — Back Width · Biceps',
    2: 'Legs A — Quads · Core · Waist',
    3: 'Push B — Shoulders · Chest · Triceps',
    4: 'Pull B — Back Thickness · Rear Delts',
    5: 'Legs B — Hamstrings · Glutes · Core',
    6: 'REST — walk 10k steps, swim 30 min',
  };
  return map[new Date().getDay()];
}

const DAY_NAMES_BUDDY = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function rand<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }

// ─── Gen-Z pattern pools ──────────────────────────────────────────────────────

const SLACKING_REPLIES = [
  "bro you've been ghost mode today 💀 the tasks aren't gonna do themselves king",
  "ngl you're giving NPC energy rn. main characters don't skip.",
  "bestie where have you been. the grind doesn't pause for vibes.",
  "ok real talk — even 10 minutes is better than zero. start one thing.",
  "the version of you in 3 months is watching. don't disappoint them.",
  "L + ratio + skipped the workout. cope harder, now go train.",
];

const JOKING_REPLIES = [
  "ok that was actually funny ngl. now go do your tasks bestie 💀",
  "i'm crying 😭 but also open the app and tick something off king",
  "bro is built for comedy not consistency. fix the second one.",
  "lmaooo but fr tho, which task are we doing first?",
  "funny + unproductive = NPC arc. funny + productive = sigma arc. choose.",
];

const GRINDING_REPLIES = [
  "we are SO built different rn 🔥 keep stacking.",
  "sigma behavior detected. this is the glow-up arc fr.",
  "you're not the main character for nothing. let's gooo.",
  "no cap you're eating today. what's next on the list?",
  "this is what separates the top 1%. keep going.",
  "actual W behavior. the streak stays alive.",
];

const STRUGGLING_REPLIES = [
  "real ones get back up. one task. just one.",
  "it's giving resilience era fr. bad days build the foundation.",
  "every legend has a rock bottom chapter. you're still writing yours.",
  "don't quit on a hard day. the habit is forming right now.",
  "acknowledged. low bar today — do the ONE easiest task. that's it.",
];

const SLANG_REPLIES = [
  "no cap i see you 👀 now channel that energy into the grind",
  "bussin behavior detected. slay first, then go complete a task.",
  "sigma grindset activated. what are we doing first?",
  "the rizz means nothing without the discipline. you know what to do.",
  "based. now open the tasks tab and let's get it.",
  "goated response fr. now show up for the workout too.",
];

const QUESTION_REPLIES: (ctx: Ctx) => string[] = (ctx) => [
  `${ctx.name.split(' ')[0] || 'bro'}, check your aspect for the full breakdown. I'll give you the short version: just start.`,
  `good question. the answer is always: do the next thing on the list. no overthinking.`,
  `ask me specifics — workout, nutrition, money, facial routine, anything. I got you.`,
  `the real answer is in your tasks. but since you asked: ${getDayWorkout()}.`,
];

type InputPattern = 'slacking' | 'joking' | 'grinding' | 'struggling' | 'slang' | 'question' | 'general';

function detectPattern(t: string): InputPattern {
  if (/\?$|^(what|how|why|when|where|who|can you|should i|is it|do i|tell me)/.test(t)) return 'question';
  if (/tired|lazy|can't be bothered|skipping|skip|later|tomorrow|procrastinating|nah bro|i'll do it/.test(t)) return 'slacking';
  if (/lol|lmao|lmfao|haha|hehe|😂|💀|joke|meme|funny|bruh/.test(t)) return 'joking';
  if (/done|finished|completed|crushed|just did|nailed|checked off|let's go|let's gooo|i did it/.test(t)) return 'grinding';
  if (/hard|struggling|can't do|giving up|failing|stressed|overwhelmed|too much|breaking down/.test(t)) return 'struggling';
  if (/no cap|ngl|fr fr|slay|rizz|bussin|sigma|npc|based|goated|bestie|bro bro|lowkey|highkey|it's giving|understood the assignment/.test(t)) return 'slang';
  return 'general';
}

function smartReply(msg: string, ctx: Ctx): string {
  const t = msg.toLowerCase().trim();
  const first = ctx.name.split(' ')[0] || 'you';
  const { xp, streakDays, goalText, bodyAnswers, looksAnswers, aspects } = ctx;

  // Gen-Z pattern detection first (runs before keyword matching)
  const pattern = detectPattern(t);
  if (pattern === 'slacking') return rand(SLACKING_REPLIES);
  if (pattern === 'joking') return rand(JOKING_REPLIES);
  if (pattern === 'grinding') return rand(GRINDING_REPLIES);
  if (pattern === 'struggling') return rand(STRUGGLING_REPLIES);
  if (pattern === 'slang') return rand(SLANG_REPLIES);
  if (pattern === 'question') return rand(QUESTION_REPLIES(ctx));

  if (/^(hey|hi|hello|sup|yo|hola|what'?s up|morning|evening|night)/.test(t)) {
    return rand([
      `${first}. Streak is at ${streakDays} day${streakDays !== 1 ? 's' : ''}. Let's not break it.`,
      `${xp} XP and counting. What do you need today?`,
      `Today: ${getDayWorkout()}. You ready?`,
      `Back again. That's the habit forming. What do you need?`,
    ]);
  }

  if (/motiv|inspir|pump|hype|fire me|get me going|push me/.test(t)) {
    return rand(MOTIVATIONS);
  }

  if (/workout|gym|train|lift|exercise|sets|reps|push|pull|legs|chest|back|shoulder|bicep|tricep/.test(t)) {
    const training = bodyAnswers.training ?? '';
    if (training === 'None') return 'Your plan is Full Body 3x/week. Start today — Mon, Wed, Fri. Physical aspect has the full breakdown.';
    return `Today: ${getDayWorkout()}. Full exercise list is in your Physical aspect — sets, reps, rest times all there.`;
  }

  if (/tired|exhaust|no energy|drained|burnout|fatigue|sluggish|slow/.test(t)) {
    const energy = bodyAnswers.energy ?? '';
    if (energy === 'Low' || energy === 'Very inconsistent')
      return `You flagged "${energy}" energy in your profile. Movement creates the energy you're waiting to feel. Walk first. Five minutes.`;
    return "Rest is data, not failure. But if it's resistance — the cure is starting. You'll find energy once you move.";
  }

  if (/sleep|insomnia|can't sleep|wake up|rest|recovery/.test(t)) {
    const sleep = bodyAnswers.sleep ?? '';
    if (sleep === 'Less than 6') return "Under 6 hours -- that's your top bottleneck. Phone down by 10pm, dark room, same wake time. This outranks any workout.";
    return 'Sleep is when muscles grow and the brain resets. Protect it like a training session. 7–9 hours, consistent timing.';
  }

  if (/food|eat|diet|nutrition|protein|meal|calorie|macro|bulk|cut|lean|fat loss/.test(t)) {
    const goal = goalText.toLowerCase();
    if (/bulk|mass|muscle|size/.test(goal)) return 'For muscle: bodyweight × 2.2g protein daily. 300–500 cal surplus. Four meals, 30–40g protein each. Track for 2 weeks.';
    if (/lean|cut|fat|shred/.test(goal)) return "For fat loss: keep protein at bodyweight x 2g. Cut 300-500 cals from carbs/fats. Don't drop intensity in the gym.";
    const nutrition = bodyAnswers.nutrition ?? '';
    if (nutrition === 'Poor') return 'Start with one change: protein at breakfast. 30g minimum — eggs, Greek yogurt, or a shake. One change, 21 days.';
    return 'Protein is the foundation. 30–40g per meal, 3–4 meals. Everything else is secondary.';
  }

  if (/skin|glow|acne|pimple|complexion|pore|face glow|glass skin|hyperpigment/.test(t)) {
    return 'Facial aspect has the full skincare protocol: AM — cleanser → Vitamin C serum → moisturizer → SPF 50. PM — double cleanse → retinol (3-4×/week) → moisturizer + rosehip oil. Weekly: AHA/BHA exfoliation + turmeric-yogurt mask. All in your Facial tasks.';
  }

  if (/retinol|vitamin c|sunscreen|spf|serum|moisturizer|cleanser/.test(t)) {
    return "Skincare order: AM = cleanser → Vitamin C → moisturizer → SPF 50. PM = oil cleanse → cleanser → retinol (not every night) → heavier moisturizer + rosehip oil. Don't mix retinol with AHA/BHA on the same night. Full routine is in your Facial aspect.";
  }

  if (/jaw|mew|jawline|chin|chew|tongue|face exercise|facial|symmetry|cheekbone|masseter/.test(t)) {
    return 'Facial aspect has the full protocol: AM face session (mewing, jaw clenches 3×15, chin tucks, neck curls, cheekbone lifts) + 20 min gum chewing midday + PM gua sha. Fat loss reveals structure — 80% of jawline improvement comes from dropping body fat. Check Facial aspect.';
  }

  if (/confident|confidence|attractive|better look|how to look|presence|charisma|glow up/.test(t)) {
    return "Glow-up stack: get lean (face fat = #1 priority), skincare daily (Vitamin C + SPF AM, retinol PM), facial muscle work, posture, sleep, hydration. None of it is complex — it's execution. Check Facial and Physical.";
  }

  if (/streak|consistent|every day|habit|routine|schedule/.test(t)) {
    if (streakDays === 0) return "Streak starts today. One completed task = one day. That's the bar.";
    if (streakDays < 7) return `${streakDays} days. First week is all resistance. Day 14 is when it starts feeling automatic.`;
    if (streakDays >= 21) return `${streakDays} days. Past the 21-day mark. This is who you are now.`;
    return `${streakDays}-day streak. Real progress. Don't let tonight be the night it breaks.`;
  }

  if (/goal|why|purpose|what am i doing|vision|reason/.test(t)) {
    if (goalText) return `Your goal: "${goalText.slice(0, 120)}". When you don't feel like doing the task — read that again.`;
    return 'Set your goal in the onboarding. A written goal creates focus. Without one, every distraction wins.';
  }

  if (/which aspect|what should i focus|where start|priority/.test(t)) {
    if (aspects.length === 0) return "You haven't picked any aspects. Go to the Aspects tab and choose what matters.";
    return `You're training: ${aspects.join(', ')}. Focus on the one with the fewest tasks completed today.`;
  }

  if (/book|read|learn|study|knowledge|summary/.test(t)) {
    return "Knowledge aspect has 10 curated books with summaries and key lessons. Start with Atomic Habits or Can't Hurt Me.";
  }

  if (/progress|how am i|stats|xp|level|score/.test(t)) {
    return `${first}: ${xp} XP · ${streakDays} day streak · ${aspects.length} aspects active. The numbers don't lie. Keep stacking.`;
  }

  if (/quit|give up|pointless|not working|failing|useless|hopeless/.test(t)) {
    return "The moment you want to quit is when the habit is forming. Your brain hates discomfort because change is real. Don't quit on a bad day.";
  }

  if (/thank|good advice|helpful|nice|great|love|appreciate/.test(t)) {
    return "That's what I'm here for. Now go do the task.";
  }

  if (/meditation|mindful|breathe|calm|stress|anxiety|mental|focus/.test(t)) {
    return 'Mental aspect has the full meditation protocol. Start with 10 minutes breath-focused. The benefit is cumulative — show up daily.';
  }

  if (/supplement|vitamin|creatine|protein powder|omega|zinc/.test(t)) {
    return 'Supplement stack: creatine 5g daily, omega-3, vitamin D3+K2, zinc + magnesium at night. Everything else is optional. Consistency > quantity.';
  }

  // ── Conversational patterns ──────────────────────────────────────────────

  if (/how are you|how('?s| is) it going|you good|you okay|you alright|how do you feel/.test(t)) {
    return rand([
      `I'm good — watching your streak and hoping you don't break it. ${streakDays > 0 ? `${streakDays} days strong.` : 'Start yours today.'}`,
      `Running well. ${xp} XP logged, ${streakDays} day streak. The real question is how YOU are doing.`,
      `I don't sleep, I don't eat, I just wait for you to open tasks. I'm good. You?`,
      `Better when you're consistent. Today looking like a full task day?`,
    ]);
  }

  if (/what do you want|what do you feel like|what are you thinking|what('?s| is) on your mind/.test(t)) {
    return rand([
      `Honestly? I want you to open the Physical aspect and tick off today's workout.`,
      `I want to see that streak number go up. That's all I care about.`,
      `I'm thinking about your ${goalText ? `goal: "${goalText.slice(0, 60)}"` : 'goals'}. Are you?`,
      `I want you to do the one task you've been avoiding. You know which one.`,
    ]);
  }

  if (/what should i do|what should i focus|give me a plan|tell me what to do|what('?s| is) next|where do i start|guide me/.test(t)) {
    const today = DAY_NAMES_BUDDY[new Date().getDay()];
    const workout = getDayWorkout();
    return rand([
      `${today}: ${workout}. That's first. After that, open your top aspect and do one task. One.`,
      `Step 1: ${workout}. Step 2: pick the aspect you've been neglecting. Step 3: tick ONE task. That's your whole plan.`,
      `You have ${aspects.length} active aspects. Open the one with the least tasks done today and do the first thing on the list.`,
      `Today's workout: ${workout}. After that, whatever's in your morning slot. Don't overthink it.`,
    ]);
  }

  if (/i'?m bored|nothing to do|no motivation|can'?t be bothered|don'?t feel like it/.test(t)) {
    return rand([
      `Boredom is the gap between where you are and what you should be doing. Open an aspect.`,
      `Nothing to do? You have ${aspects.length} aspects with tasks waiting. Pick one.`,
      `That feeling is Resistance. It peaks right before you do your most important work. Move anyway.`,
      `Bored people become boring people. Go do the thing.`,
    ]);
  }

  if (/good morning|morning routine|just woke|woke up/.test(t)) {
    return rand([
      `Morning. Sunlight, water, move your body. In that order. Then open your tasks.`,
      `Morning. ${getDayWorkout()} is on the board today. How's the sleep?`,
      `Up early. Good. The first hour sets the tone. No phone, sunlight first.`,
      `Morning ${first}. ${streakDays > 0 ? `${streakDays} day streak on the line.` : 'Day 1 starts now.'} What's the first task?`,
    ]);
  }

  if (/good (evening|night)|evening|night time|going to (sleep|bed)|bedtime/.test(t)) {
    return rand([
      `Good evening. Phone down by 10. Dark room. Same wake time. Sleep is training.`,
      `Evening wind-down: review what you did today, prep for tomorrow, and cut screens an hour before bed.`,
      `How many tasks did you get done today? Honest answer. Tomorrow you can do better.`,
      `Night. Magnesium + zinc before bed. Dark room. No phone in bed. Sleep is when the work pays off.`,
    ]);
  }

  if (/who are you|what are you|nice to meet|introduce yourself/.test(t)) {
    return `I'm ${ctx.name ? `${ctx.name}'s` : 'your'} companion. I know your goals, your habits, and your weak spots. I'm not here to be nice. I'm here to make sure you don't waste the day.`;
  }

  if (/i did it|i completed|i finished|just done|all done|crushed it|nailed it/.test(t)) {
    return rand([
      `Good. That's one. How many left today?`,
      `Noted. Streak stays alive. What's next?`,
      `${xp} XP and counting. Don't stop there.`,
      `That's the compound effect in action. Keep stacking.`,
    ]);
  }

  if (/i missed|i skipped|i failed|i broke|broke streak|didn'?t do/.test(t)) {
    return rand([
      `One miss doesn't make a habit. Two misses starts a new one. Don't miss tomorrow.`,
      `Missed days happen. The pros don't miss twice in a row. That's the only rule.`,
      `Streak reset doesn't mean start over. Your muscle memory, your knowledge — that stays. Show up today.`,
      `What happened? Identify it, fix it, move on. No guilt, just data.`,
    ]);
  }

  if (/^help$|what can you do|what do you know|commands|topics/.test(t)) {
    return `Ask me about: workout, nutrition, sleep, skincare, hair, supplements, motivation, goals, streak, progress, books, meditation, or just talk. I respond to how you're doing, what you need, and what to do next.`;
  }

  if (/what('?s| is) today|what day|which day|today'?s date/.test(t)) {
    const today = DAY_NAMES_BUDDY[new Date().getDay()];
    return `${today}. ${getDayWorkout()}. Your streak is at ${streakDays} day${streakDays !== 1 ? 's' : ''}. Make it count.`;
  }

  if (/feeling (good|great|amazing|strong|solid|on fire|unstoppable)|crushing it|killing it|on a roll/.test(t)) {
    return rand([
      `Good. Channel that energy into a harder set, an extra task, or starting something you've been avoiding.`,
      `That feeling is earned. Don't let it go to waste. Do something hard right now while you have it.`,
      `Momentum is real. Stack on top of it — what's the next task?`,
    ]);
  }

  if (/feeling (bad|terrible|awful|low|sad|depressed|down|hopeless)|i'?m sad|i'?m low/.test(t)) {
    return rand([
      `Rough day. That's okay. The bar is low: do one task. Just one. Movement shifts state.`,
      `Acknowledged. Don't make permanent decisions in a temporary state. Do the next small thing.`,
      `Bad days are data. What's actually wrong? Sleep? Nutrition? Missing a workout streak? Let's figure it out.`,
      `Even one completed task today means tomorrow starts on a better footing. Low bar. One task.`,
    ]);
  }

  if (/challenge|fast|cold shower|dare|hard challenge|difficult/.test(t)) {
    return rand([
      `The hardest challenge worth doing: 3-day water fast. Resets insulin, sharpens focus, builds extreme discipline. Only attempt if you've done 24h before.`,
      `7-day cold showers. Not comfortable-cold. Full cold, every day. The discomfort is the point.`,
      `75 Hard: 2 workouts/day, strict diet, 10 pages reading, progress photo, no alcohol. 75 days. Non-negotiable.`,
      `No-phone mornings for 7 days. First 2 hours after waking — no screen. See what your mind does when it has space.`,
    ]);
  }

  // Default
  return rand([
    `${first}, tell me one thing you'll do in the next 10 minutes.`,
    `${xp} XP. The work compounds. Keep showing up.`,
    `One task. That's it. Which one?`,
    `You're ${streakDays > 0 ? `${streakDays} days in` : 'starting today'}. Every rep counts.`,
    `Physical has your workout. Facial has your symmetry protocol. Which are you opening?`,
    `What's the one thing that would move the needle today?`,
  ]);
}

// ──────────────────────────────────────────
// SVG Stars
// ──────────────────────────────────────────

function SparkleStars() {
  return (
    <Svg
      width="100%"
      height={90}
      style={{ position: 'absolute', top: 0, left: 0 }}
      viewBox="0 0 300 90"
    >
      {STARS.map((s, i) => {
        const r = s.size;
        const d = `M${s.x},${s.y - r} L${s.x + 1.5},${s.y - 1.5} L${s.x + r},${s.y} L${s.x + 1.5},${s.y + 1.5} L${s.x},${s.y + r} L${s.x - 1.5},${s.y + 1.5} L${s.x - r},${s.y} L${s.x - 1.5},${s.y - 1.5} Z`;
        return (
          <React.Fragment key={i}>
            <Path d={d} fill="#C9B8F5" opacity={s.opacity} />
            <Circle cx={s.x} cy={s.y} r={1} fill="#F5F4EF" opacity={s.opacity * 0.8} />
          </React.Fragment>
        );
      })}
    </Svg>
  );
}

// ──────────────────────────────────────────
// Hero Stage with walking buddy
// ──────────────────────────────────────────

function BuddyStage({ companion, companionKind, mood, onDoubleTap }: {
  companion: string; companionKind: any; mood: Mood; onDoubleTap?: () => void;
}) {
  const [pos, setPos] = useState(16);
  const [dir, setDir] = useState(1);
  const [bounce, setBounce] = useState(0);
  const [bubbleMsg, setBubbleMsg] = useState<string | null>(null);
  const tickRef = useRef(0);
  const lastTapRef = useRef(0);

  function handleStagePress() {
    const now = Date.now();
    if (now - lastTapRef.current < 300) {
      onDoubleTap?.();
    } else {
      setDir(d => -d);
      const msg = PET_TAPS[Math.floor(Math.random() * PET_TAPS.length)];
      setBubbleMsg(msg);
      setTimeout(() => setBubbleMsg(null), 2000);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    lastTapRef.current = now;
  }

  useEffect(() => {
    if (mood === 'napping') return;
    const speed = mood === 'zoomies' ? 2 : 1;
    const interval = setInterval(() => {
      tickRef.current += 1;

      setPos(prev => {
        let next = prev + dir * speed * 3;
        if (next >= 240) { next = 240; setDir(-1); }
        else if (next <= 16) { next = 16; setDir(1); }
        return next;
      });

      if (tickRef.current % 4 === 0) {
        setBounce(b => b === 0 ? -3 : 0);
      }
    }, 60);
    return () => clearInterval(interval);
  }, [mood, dir]);

  return (
    <TouchableOpacity activeOpacity={1} onPress={handleStagePress} style={{ borderRadius: 22 }}>
    <View style={{
      height: 170,
      borderRadius: 22,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: 'rgba(245,244,239,0.08)',
      position: 'relative',
    }}>
      {/* Sky gradient */}
      <LinearGradient
        colors={['#1D1146', '#2A1E5E', '#141517']}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
      />

      {/* Stars */}
      <SparkleStars />

      {/* Moon */}
      <View style={{
        position: 'absolute', top: 14, right: 18,
        width: 20, height: 20, borderRadius: 10,
        backgroundColor: '#EDE8D0',
        shadowColor: '#EDE8D0', shadowOpacity: 0.6, shadowRadius: 8,
      }} />

      {/* Ground strip */}
      <View style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: 24,
        backgroundColor: '#0A1810',
      }}>
        {/* Grass blades */}
        {[20, 65, 110, 160, 210, 255].map((x, i) => (
          <View key={i} style={{
            position: 'absolute', bottom: 18, left: x,
            width: 6, height: 10, borderRadius: 3,
            backgroundColor: '#1A3A22',
          }} />
        ))}
      </View>

      {/* Mood badge */}
      <View style={{
        position: 'absolute', top: 12, left: 12, zIndex: 10,
        paddingVertical: 4, paddingHorizontal: 10, borderRadius: 999,
        backgroundColor: 'rgba(13,14,16,0.5)',
        borderWidth: 1, borderColor: 'rgba(245,244,239,0.1)',
      }}>
        <Text style={{
          fontFamily: Fonts.monoMedium, fontSize: 10, color: 'rgba(245,244,239,0.8)',
          textTransform: 'uppercase', letterSpacing: 1,
        }}>{mood}</Text>
      </View>

      {/* Buddy sprite */}
      <View style={{
        position: 'absolute',
        bottom: 24 + bounce,
        left: pos,
        transform: [{ scaleX: dir }],
      }}>
        <Companion kind={companionKind} size={84} mood="idle" />
      </View>

      {/* Nap Z */}
      {mood === 'napping' && (
        <View style={{ position: 'absolute', bottom: 84, left: pos + 60, zIndex: 20 }}>
          <Text style={{ fontFamily: Fonts.sansSemiBold, fontSize: 18, color: '#C9B8F5' }}>z</Text>
        </View>
      )}

      {/* Play star */}
      {mood === 'zoomies' && (
        <View style={{ position: 'absolute', bottom: 114, left: pos + 30, zIndex: 20 }}>
          <Text style={{ fontSize: 14, color: '#C9B8F5' }}>✦</Text>
        </View>
      )}

      {/* Eating dot */}
      {mood === 'eating' && (
        <View style={{
          position: 'absolute', bottom: 24 + bounce, left: pos + 60, zIndex: 20,
          width: 8, height: 8, borderRadius: 4, backgroundColor: '#C98A3A',
        }} />
      )}

      {/* Speech bubble */}
      {bubbleMsg && (
        <View style={{
          position: 'absolute',
          bottom: 24 + 84 + 10,
          left: Math.max(8, Math.min(pos - 10, 190)),
          backgroundColor: '#F5F4EF',
          borderRadius: 12,
          paddingVertical: 6,
          paddingHorizontal: 10,
          zIndex: 30,
          maxWidth: 140,
        }}>
          <Text style={{ fontFamily: Fonts.sansSemiBold, fontSize: 12, color: '#0D0E10' }}>{bubbleMsg}</Text>
          <View style={{
            position: 'absolute', bottom: -6, left: 14,
            width: 0, height: 0,
            borderLeftWidth: 6, borderLeftColor: 'transparent',
            borderRightWidth: 6, borderRightColor: 'transparent',
            borderTopWidth: 6, borderTopColor: '#F5F4EF',
          }} />
        </View>
      )}
    </View>
    </TouchableOpacity>
  );
}

// ──────────────────────────────────────────
// Main screen
// ──────────────────────────────────────────

export default function BuddyScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const C = useColors();
  const scrollRef = useRef<ScrollView>(null);

  const {
    companion, companionName, name, xp, streakDays,
    goalText, bodyAnswers, looksAnswers, aspects,
  } = useStore();

  const [mood, setMood] = useState<Mood>('wandering');
  const [fullscreen, setFullscreen] = useState(false);
  const fullscreenLastTapRef = useRef(0);
  const [messages, setMessages] = useState<{ from: 'user' | 'buddy'; text: string }[]>([
    { from: 'buddy', text: `Hey${name ? ', ' + name.split(' ')[0] : ''}. I know your goals and your habits. What do you need?` },
  ]);
  const [chatInput, setChatInput] = useState('');
  const chatLimiterRef = useRef(new RateLimiter(60, 60_000, 800));

  function handleFullscreenBackdrop() {
    const now = Date.now();
    if (now - fullscreenLastTapRef.current < 300) setFullscreen(false);
    fullscreenLastTapRef.current = now;
  }

  const ctx: Ctx = useMemo(
    () => ({ name, aspects, xp, streakDays, goalText, bodyAnswers, looksAnswers }),
    [name, aspects, xp, streakDays, goalText, bodyAnswers, looksAnswers],
  );

  const bond = Math.min(100, Math.floor((xp || 0) / 40));

  function triggerMood(m: Mood) {
    setMood(m);
    setTimeout(() => setMood('wandering'), 3000);
  }

  function addMessages(userText: string, buddyText: string) {
    setMessages(prev => {
      const next = userText
        ? [...prev, { from: 'user' as const, text: userText }, { from: 'buddy' as const, text: buddyText }]
        : [...prev, { from: 'buddy' as const, text: buddyText }];
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 80);
      return next;
    });
  }

  function handleAction(tile: typeof ACTION_TILES[number]) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    triggerMood(tile.mood);
    const replies: Record<string, string> = {
      Pet: rand(MOTIVATIONS),
      Feed: "Snack time. You're feeding me, which means you have 2 seconds to think about what YOU'RE eating today. Protein first.",
      Play: "Let's go! Energy up. Now channel this into the workout.",
      Nap: "Rest is productive. Make it intentional — 20 min max. Set an alarm.",
    };
    addMessages('', replies[tile.label] ?? rand(MOTIVATIONS));
  }

  function sendMessage() {
    const trimmed = chatInput.trim();
    if (!trimmed) return;
    if (!chatLimiterRef.current.tryAcquire()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }
    const result = validate(petChatMessageSchema, trimmed);
    if (!result.success) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      setChatInput('');
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const userMsg = result.value;
    setChatInput('');
    triggerMood('wandering');
    addMessages(userMsg, smartReply(userMsg, ctx));
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={{ flex: 1, backgroundColor: C.bg }}>
        <StatusBar barStyle={C.bg === "#0D0E10" ? "light-content" : "dark-content"} backgroundColor={C.bg} />

        {/* Sky gradient + stars (full screen top portion) */}
        <LinearGradient
          colors={['#1D1146', '#3C2D6E', '#141517']}
          locations={[0, 0.45, 1]}
          style={{
            position: 'absolute',
            top: 0, left: 0, right: 0,
            height: insets.top + 320,
          }}
        >
          <SparkleStars />
        </LinearGradient>

        {/* App header row */}
        <View style={{
          paddingTop: insets.top + 12,
          paddingHorizontal: Spacing['2xl'],
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          zIndex: 10,
        }}>
          <Text style={{
            fontFamily: Fonts.monoMedium, fontSize: 11,
            color: 'rgba(245,244,239,0.6)',
            textTransform: 'uppercase', letterSpacing: 2,
          }}>Buddy</Text>

          <TouchableOpacity
            onPress={() => router.push('/settings' as any)}
            style={{
              width: 36, height: 36, borderRadius: 18,
              backgroundColor: 'rgba(245,244,239,0.12)',
              borderWidth: 1, borderColor: 'rgba(245,244,239,0.15)',
              alignItems: 'center', justifyContent: 'center',
            }}
          >
            <GearSVG />
          </TouchableOpacity>
        </View>

        <ScrollView
          ref={scrollRef}
          contentContainerStyle={{
            paddingTop: 16,
            paddingBottom: 120,
            paddingHorizontal: Spacing['2xl'],
            gap: 10,
          }}
          showsVerticalScrollIndicator={false}
        >
          {/* Hero stage card */}
          <View style={{
            backgroundColor: '#141517',
            borderRadius: 22,
            overflow: 'hidden',
          }}>
            {/* Stage */}
            <View style={{ padding: 16, paddingBottom: 0 }}>
              <BuddyStage companion={companionName} companionKind={companion} mood={mood} onDoubleTap={() => setFullscreen(true)} />
            </View>

            {/* Stat rail */}
            <View style={{
              flexDirection: 'row',
              borderTopWidth: 1,
              borderTopColor: 'rgba(245,244,239,0.06)',
              marginTop: 12,
            }}>
              {[
                { label: 'Bond', value: `${bond}`, unit: '%' },
                { label: 'Days', value: `${streakDays}`, unit: 'together' },
                { label: 'Mood', value: MOOD_EMOJI[mood], unit: '' },
              ].map((cell, i) => (
                <View
                  key={cell.label}
                  style={{
                    flex: 1,
                    padding: 14,
                    paddingHorizontal: 16,
                    borderLeftWidth: i > 0 ? 1 : 0,
                    borderLeftColor: 'rgba(245,244,239,0.08)',
                  }}
                >
                  <Text style={{
                    fontFamily: Fonts.sansSemiBold,
                    fontSize: 24,
                    color: C.cardAltInk,
                    letterSpacing: -0.02 * 24,
                    fontVariant: ['tabular-nums'],
                  }}>{cell.value}</Text>
                  <Text style={{
                    fontFamily: Fonts.sans,
                    fontSize: 13,
                    color: 'rgba(245,244,239,0.45)',
                    marginTop: 2,
                  }}>
                    {cell.unit ? `${cell.unit} · ` : ''}{cell.label}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Action grid */}
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {ACTION_TILES.map(tile => (
              <TouchableOpacity
                key={tile.label}
                onPress={() => handleAction(tile)}
                activeOpacity={0.82}
                style={{
                  flex: 1,
                  paddingVertical: 14,
                  paddingHorizontal: 8,
                  borderRadius: 18,
                  backgroundColor: C.card,
                  borderWidth: 1,
                  borderColor: 'rgba(13,14,16,0.06)',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <View style={{
                  width: 36, height: 36, borderRadius: 18,
                  backgroundColor: tile.color,
                  alignItems: 'center', justifyContent: 'center',
                }}>
                  <Text style={{
                    fontFamily: Fonts.serif,
                    fontSize: 16,
                    color: C.cardInk,
                    lineHeight: 20,
                  }}>{tile.glyph}</Text>
                </View>
                <Text style={{
                  fontFamily: Fonts.sansSemiBold,
                  fontSize: 10,
                  textTransform: 'uppercase',
                  letterSpacing: 0.8,
                  color: C.cardInk,
                }}>{tile.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Chat card */}
          <View style={{
            backgroundColor: C.card,
            borderRadius: 22,
            padding: 16,
            gap: 12,
          }}>
            {/* Chat header */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{
                fontFamily: Fonts.monoMedium, fontSize: 11,
                color: 'rgba(13,14,16,0.4)',
                textTransform: 'uppercase', letterSpacing: 0.8,
              }}>Chat with {companionName}</Text>
              <Text style={{
                fontFamily: Fonts.mono, fontSize: 9,
                color: 'rgba(13,14,16,0.4)',
                textTransform: 'uppercase', letterSpacing: 0.6,
              }}>Private</Text>
            </View>

            {/* Messages */}
            <ScrollView
              style={{ maxHeight: 200 }}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ gap: 8 }}
            >
              {messages.map((msg, i) => (
                msg.from === 'buddy' ? (
                  <LinearGradient
                    key={i}
                    colors={['#C9B8F5', '#E5D9FF']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{
                      borderRadius: 14,
                      borderBottomLeftRadius: 4,
                      paddingVertical: 8,
                      paddingHorizontal: 12,
                      maxWidth: '84%',
                      alignSelf: 'flex-start',
                    }}
                  >
                    <Text style={{
                      fontFamily: Fonts.sans,
                      fontSize: 12,
                      color: '#1D1146',
                      lineHeight: 12 * 1.4,
                    }}>{msg.text}</Text>
                  </LinearGradient>
                ) : (
                  <View
                    key={i}
                    style={{
                      borderRadius: 14,
                      borderBottomRightRadius: 4,
                      paddingVertical: 8,
                      paddingHorizontal: 12,
                      maxWidth: '84%',
                      alignSelf: 'flex-end',
                      backgroundColor: C.cardInk,
                    }}
                  >
                    <Text style={{
                      fontFamily: Fonts.sans,
                      fontSize: 12,
                      color: C.card,
                      lineHeight: 12 * 1.4,
                    }}>{msg.text}</Text>
                  </View>
                )
              ))}
            </ScrollView>

            {/* Input */}
            <View style={{ flexDirection: 'row', gap: 8, alignItems: 'flex-end' }}>
              <TextInput
                value={chatInput}
                onChangeText={(t) => setChatInput(sanitizeText(t).slice(0, 500))}
                maxLength={500}
                placeholder={`Say something to ${companionName}…`}
                placeholderTextColor="rgba(13,14,16,0.4)"
                style={{
                  flex: 1,
                  height: 40,
                  borderRadius: 999,
                  paddingVertical: 0,
                  paddingHorizontal: 16,
                  fontFamily: Fonts.sans,
                  fontSize: 13,
                  color: C.cardInk,
                  backgroundColor: 'rgba(13,14,16,0.06)',
                  borderWidth: 1,
                  borderColor: 'rgba(13,14,16,0.1)',
                }}
                returnKeyType="send"
                onSubmitEditing={sendMessage}
              />
              <TouchableOpacity
                onPress={sendMessage}
                activeOpacity={0.8}
                style={{
                  width: 40, height: 40,
                  borderRadius: 20,
                  backgroundColor: C.cardInk,
                  alignItems: 'center', justifyContent: 'center',
                }}
              >
                <Text style={{ color: C.card, fontSize: 16, marginTop: -1 }}>↑</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>

        {/* Fullscreen pet modal */}
        <Modal visible={fullscreen} animationType="fade" statusBarTranslucent transparent={false}>
          <View style={{ flex: 1, backgroundColor: '#0D0E10' }}>
            <LinearGradient
              colors={['#1D1146', '#2A1E5E', '#141517']}
              style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
            />
            <SparkleStars />

            {/* Close button */}
            <TouchableOpacity
              onPress={() => setFullscreen(false)}
              style={{
                position: 'absolute', top: insets.top + 16, right: 20, zIndex: 20,
                width: 36, height: 36, borderRadius: 18,
                backgroundColor: 'rgba(245,244,239,0.15)',
                alignItems: 'center', justifyContent: 'center',
              }}
            >
              <Text style={{ color: '#F5F4EF', fontSize: 16 }}>✕</Text>
            </TouchableOpacity>

            {/* Pet centered */}
            <TouchableOpacity
              activeOpacity={1}
              onPress={handleFullscreenBackdrop}
              style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
            >
              <Companion kind={companion} size={140} mood="idle" />
              <Text style={{
                fontFamily: Fonts.mono, fontSize: 10,
                color: 'rgba(245,244,239,0.3)',
                marginTop: 24, letterSpacing: 1, textTransform: 'uppercase',
              }}>Double-tap to close</Text>
            </TouchableOpacity>

            {/* Action tiles */}
            <View style={{
              flexDirection: 'row', gap: 8,
              paddingHorizontal: 16, paddingBottom: insets.bottom + 20, paddingTop: 8,
            }}>
              {ACTION_TILES.map(tile => (
                <TouchableOpacity
                  key={tile.label}
                  onPress={() => { handleAction(tile); setFullscreen(false); }}
                  activeOpacity={0.82}
                  style={{
                    flex: 1, paddingVertical: 14, paddingHorizontal: 8,
                    borderRadius: 18, backgroundColor: 'rgba(245,244,239,0.08)',
                    borderWidth: 1, borderColor: 'rgba(245,244,239,0.12)',
                    alignItems: 'center', gap: 8,
                  }}
                >
                  <View style={{
                    width: 36, height: 36, borderRadius: 18,
                    backgroundColor: tile.color, alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Text style={{ fontFamily: Fonts.serif, fontSize: 16, color: '#0D0E10', lineHeight: 20 }}>{tile.glyph}</Text>
                  </View>
                  <Text style={{
                    fontFamily: Fonts.sansSemiBold, fontSize: 10,
                    textTransform: 'uppercase', letterSpacing: 0.8, color: '#F5F4EF',
                  }}>{tile.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </Modal>
      </View>
    </KeyboardAvoidingView>
  );
}

function GearSVG() {
  return (
    <Svg width={18} height={18} viewBox="0 0 18 18" fill="none">
      <Path
        d="M9 11.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z"
        stroke="rgba(245,244,239,0.7)"
        strokeWidth={1.6}
        strokeLinecap="round"
      />
      <Path
        d="M14.7 11a1.2 1.2 0 00.24 1.32l.04.04a1.45 1.45 0 010 2.06 1.45 1.45 0 01-2.06 0l-.04-.04a1.2 1.2 0 00-1.32-.24 1.2 1.2 0 00-.73 1.1v.12a1.45 1.45 0 11-2.9 0v-.06a1.2 1.2 0 00-.79-1.1 1.2 1.2 0 00-1.32.24l-.04.04a1.45 1.45 0 01-2.06-2.06l.04-.04A1.2 1.2 0 003.52 11a1.2 1.2 0 00-1.1-.73H2.3a1.45 1.45 0 110-2.9h.06a1.2 1.2 0 001.1-.79 1.2 1.2 0 00-.24-1.32l-.04-.04a1.45 1.45 0 012.06-2.06l.04.04A1.2 1.2 0 006.6 3.52a1.2 1.2 0 00.73-1.1V2.3a1.45 1.45 0 112.9 0v.06a1.2 1.2 0 00.73 1.1 1.2 1.2 0 001.32-.24l.04-.04a1.45 1.45 0 012.06 2.06l-.04.04A1.2 1.2 0 0014.1 6.6a1.2 1.2 0 001.1.73h.12a1.45 1.45 0 110 2.9h-.06A1.2 1.2 0 0014.7 11z"
        stroke="rgba(245,244,239,0.7)"
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
