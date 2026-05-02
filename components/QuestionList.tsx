import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Colors, Fonts, FontSize, Spacing, Radii } from '../theme/tokens';

export interface Question {
  id: string;
  title: string;
  options: string[];
}

interface QuestionListProps {
  questions: Question[];
  answers: Record<string, string>;
  onSet: (qId: string, option: string) => void;
}

export default function QuestionList({ questions, answers, onSet }: QuestionListProps) {
  return (
    <View style={{ gap: Spacing.xl }}>
      {questions.map(q => (
        <View key={q.id}>
          <Text style={{
            fontFamily: Fonts.sansSemiBold,
            fontSize: FontSize.bodyMd,
            color: Colors.cardAltInk,
            marginBottom: Spacing.sm,
          }}>
            {q.title}
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm }}>
            {q.options.map(opt => {
              const selected = answers[q.id] === opt;
              return (
                <TouchableOpacity
                  key={opt}
                  onPress={() => onSet(q.id, opt)}
                  activeOpacity={0.75}
                  style={{
                    borderRadius: Radii.chip,
                    paddingVertical: Spacing.sm,
                    paddingHorizontal: Spacing.md,
                    backgroundColor: selected ? Colors.card : 'rgba(245,244,239,0.1)',
                    borderWidth: selected ? 0 : 1,
                    borderColor: 'rgba(245,244,239,0.2)',
                  }}
                >
                  <Text style={{
                    fontFamily: Fonts.sansSemiBold,
                    fontSize: FontSize.label,
                    letterSpacing: 0.5,
                    color: selected ? Colors.cardInk : 'rgba(245,244,239,0.7)',
                  }}>
                    {opt}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      ))}
    </View>
  );
}
