import React from 'react';
import { useRouter } from 'expo-router';
import { useStore } from '../../lib/store';
import OnboardingShell from '../../components/OnboardingShell';
import QuestionList, { Question } from '../../components/QuestionList';

const BODY_QUESTIONS: Question[] = [
  {
    id: 'posture',
    title: 'How would you describe your posture?',
    options: ['Good', 'Slightly rounded', 'Forward head', 'Mixed issues'],
  },
  {
    id: 'energy',
    title: 'What is your typical daily energy level?',
    options: ['High', 'Moderate', 'Low', 'Very inconsistent'],
  },
  {
    id: 'training',
    title: 'What is your training experience?',
    options: ['None', 'Beginner (<1yr)', 'Intermediate', 'Advanced'],
  },
  {
    id: 'sleep',
    title: 'How many hours of sleep do you get?',
    options: ['Less than 6', '6–7 hrs', '7–8 hrs', '8+ hrs'],
  },
  {
    id: 'nutrition',
    title: 'How would you rate your current nutrition?',
    options: ['Clean eating', 'Moderate', 'Poor', 'Trying to improve'],
  },
];

export default function BodyQAScreen() {
  const router = useRouter();
  const { bodyAnswers, setBodyAnswer } = useStore();

  const answeredCount = Object.keys(bodyAnswers).length;

  return (
    <OnboardingShell
      step={3}
      eyebrow="Step 03 · Body"
      title="Describe your physical baseline."
      sub="Short-answer; skip anything that doesn't apply."
      onNext={() => router.push('/(onboarding)/metrics')}
      nextLabel="Continue"
      nextDisabled={answeredCount === 0}
    >
      <QuestionList
        questions={BODY_QUESTIONS}
        answers={bodyAnswers}
        onSet={setBodyAnswer}
      />
    </OnboardingShell>
  );
}
