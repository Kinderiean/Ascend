import React from 'react';
import { useRouter } from 'expo-router';
import { useStore } from '../../lib/store';
import OnboardingShell from '../../components/OnboardingShell';
import QuestionList, { Question } from '../../components/QuestionList';

const FACIAL_QUESTIONS: Question[] = [
  {
    id: 'skin',
    title: 'What is your skin type?',
    options: ['Oily', 'Dry', 'Combination', 'Normal', 'Sensitive'],
  },
  {
    id: 'jawline',
    title: 'How would you describe your current jawline definition?',
    options: ['Undefined / soft', 'Slightly defined', 'Moderately defined', 'Sharp and angular'],
  },
  {
    id: 'mewing',
    title: 'Do you practice mewing or any facial exercises?',
    options: ['Never heard of it', "Know about it but haven't started", 'Occasionally', 'Daily practice'],
  },
  {
    id: 'symmetry',
    title: 'How symmetrical is your face? (self-assessment)',
    options: ['Noticeably asymmetric', 'Minor differences', 'Fairly symmetric', 'Very symmetric'],
  },
  {
    id: 'chewing',
    title: 'Do you chew on one side predominantly?',
    options: ['Yes, always one side', 'Sometimes', 'No, both sides equally'],
  },
  {
    id: 'eyeArea',
    title: 'How would you rate your eye area?',
    options: ['Soft / puffy', 'Average', 'Defined brow ridge', 'Sharp and angular'],
  },
  {
    id: 'skinRoutine',
    title: 'How consistent is your current skincare routine?',
    options: ['No routine at all', 'Just washing my face', 'Basic (cleanser + moisturizer)', 'Full routine (serums, SPF, actives)'],
  },
];

export default function LooksScreen() {
  const router = useRouter();
  const { looksAnswers, setLooksAnswer } = useStore();

  const answeredCount = Object.keys(looksAnswers).length;

  return (
    <OnboardingShell
      step={2}
      eyebrow="Step 02 · Facial"
      title="Tell us about your face."
      sub="We'll build your facial muscle training routine around your current baseline — no guesswork."
      onNext={() => router.push('/(onboarding)/bodyqa')}
      nextLabel="Continue"
      nextDisabled={answeredCount === 0}
    >
      <QuestionList
        questions={FACIAL_QUESTIONS}
        answers={looksAnswers}
        onSet={setLooksAnswer}
      />
    </OnboardingShell>
  );
}
