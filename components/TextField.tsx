import React from 'react';
import { View, Text, TextInput, TextInputProps, ViewStyle } from 'react-native';
import { Colors, Radii, Fonts, FontSize, Spacing } from '../theme/tokens';

interface TextFieldProps {
  label?: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  suffix?: string;
  tone?: 'cream' | 'dark';
  style?: ViewStyle;
  keyboardType?: TextInputProps['keyboardType'];
  returnKeyType?: TextInputProps['returnKeyType'];
  onSubmitEditing?: TextInputProps['onSubmitEditing'];
  autoFocus?: boolean;
  autoCapitalize?: TextInputProps['autoCapitalize'];
  multiline?: boolean;
  numberOfLines?: number;
}

export default function TextField({
  label, value, onChangeText, placeholder, suffix, tone = 'cream',
  style, keyboardType, returnKeyType, onSubmitEditing, autoFocus,
  autoCapitalize, multiline, numberOfLines,
}: TextFieldProps) {
  const bg = tone === 'dark' ? Colors.cardAlt : Colors.card;
  const ink = tone === 'dark' ? Colors.cardAltInk : Colors.cardInk;
  const mutedColor = tone === 'dark' ? 'rgba(245,244,239,0.55)' : 'rgba(13,14,16,0.55)';

  return (
    <View style={style}>
      {label ? (
        <Text style={{
          fontFamily: Fonts.sansSemiBold,
          fontSize: FontSize.label,
          letterSpacing: 0.08 * FontSize.label,
          textTransform: 'uppercase',
          color: mutedColor,
          marginBottom: Spacing.xs,
        }}>
          {label}
        </Text>
      ) : null}
      <View style={{
        height: multiline ? undefined : 52,
        minHeight: multiline ? 52 : undefined,
        borderRadius: Radii.input,
        backgroundColor: bg,
        flexDirection: 'row',
        alignItems: multiline ? 'flex-start' : 'center',
        paddingHorizontal: Spacing.base,
        paddingVertical: multiline ? Spacing.base : 0,
      }}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={mutedColor}
          selectionColor={Colors.accent}
          keyboardType={keyboardType}
          returnKeyType={returnKeyType}
          onSubmitEditing={onSubmitEditing}
          autoFocus={autoFocus}
          autoCapitalize={autoCapitalize}
          multiline={multiline}
          numberOfLines={numberOfLines}
          textAlignVertical={multiline ? 'top' : 'center'}
          style={{
            flex: 1,
            fontFamily: Fonts.sans,
            fontSize: FontSize.bodyLg,
            color: ink,
            height: multiline ? undefined : '100%',
          }}
        />
        {suffix ? (
          <Text style={{
            fontFamily: Fonts.sans,
            fontSize: FontSize.bodyMd,
            color: mutedColor,
            marginLeft: Spacing.xs,
          }}>
            {suffix}
          </Text>
        ) : null}
      </View>
    </View>
  );
}
