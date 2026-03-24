import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { LAYOUT, constrainedWidth } from '@/constants/layout';
import { useRouter } from 'expo-router';
import {
  useFonts,
  Caladea_400Regular,
} from '@expo-google-fonts/caladea';
import * as Haptics from 'expo-haptics';
import { saveUsername } from '@/lib/username';

export default function UsernameScreen() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [fontsLoaded] = useFonts({
    'Caladea-Regular': Caladea_400Regular,
  });

  const generateUUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };

  const handleContinue = async () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    setIsLoading(true);
    setError(null);

    const tempUserId = generateUUID();

    const result = await saveUsername(tempUserId, username.trim());

    if (result.success) {
      router.push('/ONBOARDING/index');
    } else {
      setError(result.error || 'Failed to save username');
      if (Platform.OS === 'web') {
        Alert.alert('Error', result.error || 'Failed to save username');
      }
    }

    setIsLoading(false);
  };

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.outerWrapper}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={[styles.keyboardView, { maxWidth: constrainedWidth }]}
      >
        <View style={styles.content}>
          <View style={styles.inputSection}>
            <Text style={styles.title}>Create your username</Text>

            <TextInput
              style={styles.input}
              value={username}
              onChangeText={setUsername}
              placeholder=""
              placeholderTextColor="#666666"
              autoCapitalize="none"
              autoCorrect={false}
              autoFocus={true}
              selectionColor="#FFFFFF"
            />

            <Text style={styles.helperText}>
              Your username is unique.{'\n'}
              You can always change it later.
            </Text>

            {error && (
              <Text style={styles.errorText}>{error}</Text>
            )}
          </View>

          <TouchableOpacity
            style={[
              styles.continueButton,
              (username.length === 0 || isLoading) && styles.continueButtonDisabled
            ]}
            onPress={handleContinue}
            activeOpacity={0.8}
            disabled={username.length === 0 || isLoading}
          >
            <Text style={styles.continueButtonText}>
              {isLoading ? 'Saving...' : 'Continue'}
          </Text>
        </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    alignItems: 'center',
  },
  outerWrapper: {
    flex: 1,
    width: '100%',
    maxWidth: constrainedWidth,
    alignSelf: 'center',
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: LAYOUT.paddingHorizontal,
    paddingTop: 120,
    paddingBottom: 40,
  },
  inputSection: {
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontFamily: 'Caladea-Regular',
    color: '#C0D1FF',
    textAlign: 'center',
    marginBottom: 40,
    letterSpacing: 0.3,
  },
  input: {
    fontSize: 24,
    fontFamily: 'Caladea-Regular',
    color: '#FFFFFF',
    textAlign: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginBottom: 32,
    width: '100%',
  },
  helperText: {
    fontSize: 14,
    color: '#999999',
    textAlign: 'center',
    lineHeight: 20,
  },
  errorText: {
    fontSize: 14,
    color: '#FF6B6B',
    textAlign: 'center',
    marginTop: 16,
  },
  continueButton: {
    backgroundColor: '#A8B3FF',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  continueButtonDisabled: {
    opacity: 0.5,
  },
  continueButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000000',
    letterSpacing: 0.2,
  },
});
