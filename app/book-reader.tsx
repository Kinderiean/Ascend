import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StatusBar, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { useColors } from '../lib/theme';
import { Fonts, Spacing } from '../theme/tokens';
import { BOOKS } from '../lib/books';

export default function BookReaderScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const C = useColors();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const book = BOOKS.find(b => b.id === id);

  if (!book) {
    return (
      <View style={{ flex: 1, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: C.cardAltInk, fontFamily: Fonts.sans }}>Book not found.</Text>
        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 16 }}>
          <Text style={{ color: '#C9B8F5', fontFamily: Fonts.sansSemiBold }}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <StatusBar barStyle={C.bg === '#0D0E10' ? 'light-content' : 'dark-content'} />

      {/* Header */}
      <View style={{
        paddingTop: insets.top + 8,
        paddingBottom: 12,
        paddingHorizontal: Spacing['2xl'],
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: C.bg,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(245,244,239,0.06)',
      }}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ width: 44, height: 44, justifyContent: 'center' }}
        >
          <Text style={{ color: 'rgba(245,244,239,0.7)', fontSize: 22, fontFamily: Fonts.sans }}>‹</Text>
        </TouchableOpacity>
        <View style={{ flex: 1, marginRight: 44 }}>
          <Text
            style={{
              textAlign: 'center',
              fontFamily: Fonts.sansSemiBold,
              fontSize: 14,
              color: C.cardAltInk,
            }}
            numberOfLines={1}
          >{book.title}</Text>
          <Text style={{ textAlign: 'center', fontFamily: Fonts.mono, fontSize: 10, color: 'rgba(245,244,239,0.45)' }}>
            {book.author}
          </Text>
        </View>
      </View>

      {/* WebView */}
      <View style={{ flex: 1 }}>
        {/* Offline notice — shown before loading starts */}
        {!confirmed && (
          <View style={{
            flex: 1, alignItems: 'center', justifyContent: 'center',
            padding: 32, gap: 16,
          }}>
            <View style={{
              width: 52, height: 52, borderRadius: 26,
              backgroundColor: 'rgba(203,187,247,0.12)',
              alignItems: 'center', justifyContent: 'center',
              marginBottom: 4,
            }}>
              <Text style={{ fontSize: 24 }}>📶</Text>
            </View>
            <Text style={{ fontFamily: Fonts.serif, fontSize: 22, color: C.cardAltInk, textAlign: 'center' }}>
              Requires internet
            </Text>
            <Text style={{ fontFamily: Fonts.sans, fontSize: 14, color: 'rgba(245,244,239,0.5)', textAlign: 'center', lineHeight: 22 }}>
              Books are loaded from the web.{'\n'}Make sure you have a connection before opening.
            </Text>
            <View style={{ flexDirection: 'row', gap: 12, marginTop: 4 }}>
              <TouchableOpacity
                onPress={() => router.back()}
                style={{ paddingVertical: 11, paddingHorizontal: 20, borderRadius: 999, borderWidth: 1, borderColor: 'rgba(245,244,239,0.15)' }}
              >
                <Text style={{ fontFamily: Fonts.sansSemiBold, fontSize: 12, color: 'rgba(245,244,239,0.5)', textTransform: 'uppercase', letterSpacing: 0.8 }}>
                  Go back
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setConfirmed(true)}
                style={{ paddingVertical: 11, paddingHorizontal: 20, backgroundColor: '#C9B8F5', borderRadius: 999 }}
              >
                <Text style={{ fontFamily: Fonts.sansSemiBold, fontSize: 12, color: '#1D1146', textTransform: 'uppercase', letterSpacing: 0.8 }}>
                  Open anyway
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {confirmed && loading && (
          <View style={{
            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
            alignItems: 'center', justifyContent: 'center',
            backgroundColor: C.bg, zIndex: 10,
          }}>
            <ActivityIndicator color="#C9B8F5" size="large" />
            <Text style={{ color: 'rgba(245,244,239,0.5)', fontFamily: Fonts.mono, fontSize: 11, marginTop: 12, textTransform: 'uppercase', letterSpacing: 1 }}>
              Loading {book.title}
            </Text>
          </View>
        )}

        {confirmed && (error ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 16 }}>
            <Text style={{ fontFamily: Fonts.serif, fontSize: 22, color: C.cardAltInk, textAlign: 'center' }}>
              Could not load
            </Text>
            <Text style={{ fontFamily: Fonts.sans, fontSize: 14, color: 'rgba(245,244,239,0.5)', textAlign: 'center', lineHeight: 22 }}>
              Check your connection and try again.
            </Text>
            <TouchableOpacity
              onPress={() => { setError(false); setLoading(true); }}
              style={{ paddingVertical: 10, paddingHorizontal: 20, backgroundColor: '#C9B8F5', borderRadius: 999 }}
            >
              <Text style={{ fontFamily: Fonts.sansSemiBold, fontSize: 13, color: '#1D1146', textTransform: 'uppercase', letterSpacing: 0.8 }}>
                Retry
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <WebView
            source={{ uri: book.readerUrl }}
            style={{ flex: 1, backgroundColor: C.bg }}
            onLoadEnd={() => setLoading(false)}
            onError={() => { setLoading(false); setError(true); }}
            onHttpError={() => { setLoading(false); setError(true); }}
            allowsBackForwardNavigationGestures
            javaScriptEnabled
            domStorageEnabled
            startInLoadingState={false}
          />
        ))}
      </View>
    </View>
  );
}
