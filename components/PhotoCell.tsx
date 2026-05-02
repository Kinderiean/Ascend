import React from 'react';
import { TouchableOpacity, View, Text, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Colors, Radii, Fonts, FontSize } from '../theme/tokens';

interface PhotoCellProps {
  label: string;
  uri?: string;
  onCapture: (uri: string) => void;
}

export default function PhotoCell({ label, uri, onCapture }: PhotoCellProps) {
  const handlePress = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      // Try library fallback
      const lib = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (lib.status !== 'granted') return;
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.85,
        allowsEditing: false,
      });
      if (!result.canceled) onCapture(result.assets[0].uri);
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      quality: 0.85,
      allowsEditing: false,
    });
    if (!result.canceled) onCapture(result.assets[0].uri);
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.8}
      style={{
        aspectRatio: 3 / 4,
        borderRadius: Radii.tile,
        overflow: 'hidden',
        backgroundColor: uri ? Colors.cardAlt : 'transparent',
        borderWidth: uri ? 0 : 1.5,
        borderColor: 'rgba(245,244,239,0.25)',
        borderStyle: 'dashed',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {uri ? (
        <>
          <Image source={{ uri }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
          <View style={{
            position: 'absolute', bottom: 8, left: 0, right: 0,
            alignItems: 'center',
          }}>
            <View style={{
              backgroundColor: Colors.accent,
              borderRadius: Radii.chip,
              paddingVertical: 4,
              paddingHorizontal: 10,
            }}>
              <Text style={{
                fontFamily: Fonts.sansSemiBold,
                fontSize: FontSize.label,
                color: Colors.accentInk,
                textTransform: 'uppercase',
              }}>Retake</Text>
            </View>
          </View>
        </>
      ) : (
        <>
          {/* Camera icon */}
          <View style={{ marginBottom: 8 }}>
            <CameraIcon />
          </View>
          <Text style={{
            fontFamily: Fonts.sansSemiBold,
            fontSize: FontSize.label,
            color: 'rgba(245,244,239,0.55)',
            textTransform: 'uppercase',
            letterSpacing: 1,
          }}>{label}</Text>
        </>
      )}
    </TouchableOpacity>
  );
}

function CameraIcon() {
  return (
    <View style={{ width: 24, height: 24, alignItems: 'center', justifyContent: 'center' }}>
      <View style={{
        width: 18, height: 14, borderRadius: 3,
        borderWidth: 1.8, borderColor: 'rgba(245,244,239,0.5)',
      }} />
      <View style={{
        position: 'absolute', width: 6, height: 6,
        borderRadius: 3, borderWidth: 1.8,
        borderColor: 'rgba(245,244,239,0.5)',
      }} />
    </View>
  );
}
