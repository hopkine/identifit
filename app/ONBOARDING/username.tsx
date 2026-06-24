import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { LAYOUT, constrainedWidth } from '@/constants/layout';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useFonts, Caladea_400Regular } from '@expo-google-fonts/caladea';
import * as Haptics from 'expo-haptics';
import { appStorage } from '@/lib/appStorage';
import {
  normalizeUsernameForAuth,
  signUpWithUsernamePassword,
  USERNAME_RULES_HINT,
  validatePasswordForAuth,
  validateUsernameFormat,
} from '@/lib/authUsername';
import { checkUsernameAvailability, saveUsername } from '@/lib/username';
import { CLOUD_USER_ID_STORAGE_KEY } from '@/lib/userCloudSync';
import { useOOTD } from '@/hooks/useOOTD';

export default function UsernameScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ signup?: string }>();
  const isSignup =
    params.signup === '1' ||
    params.signup === 'true';

  const { refreshCloudProfile } = useOOTD();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isSignup) {
      router.replace('/ONBOARDING/login');
    }
  }, [isSignup, router]);

  const [fontsLoaded] = useFonts({
    'Caladea-Regular': Caladea_400Regular,
  });

  const handleContinue = async () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    setIsLoading(true);
    setError(null);

    const normalized = normalizeUsernameForAuth(username);
    const nameErr = validateUsernameFormat(normalized);
    if (nameErr) {
      setError(nameErr);
      setIsLoading(false);
      return;
    }

    const pwdErr = validatePasswordForAuth(password);
    if (pwdErr) {
      setError(pwdErr);
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      setIsLoading(false);
      return;
    }

    const { available, error: availQueryErr } =
      await checkUsernameAvailability(normalized);
    if (availQueryErr) {
      setError(availQueryErr);
      setIsLoading(false);
      return;
    }
    if (!available) {
      setError('That username is already taken.');
      setIsLoading(false);
      return;
    }

    const signResult = await signUpWithUsernamePassword(normalized, password);
    if (signResult.error || !signResult.userId) {
      setError(signResult.error || 'Could not create account.');
      setIsLoading(false);
      return;
    }

    const saveResult = await saveUsername(signResult.userId, normalized);
    if (!saveResult.success) {
      setError(
        saveResult.error ||
          'Account created but profile save failed. Try signing in.'
      );
      setIsLoading(false);
      return;
    }

    await appStorage.setItem(CLOUD_USER_ID_STORAGE_KEY, signResult.userId);
    await refreshCloudProfile();
    router.replace('/ONBOARDING/body-type');
  };

  const canContinue =
    username.trim().length > 0 &&
    password.length > 0 &&
    confirmPassword.length > 0 &&
    !isLoading;

  if (!fontsLoaded || !isSignup) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.outerWrapper}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={[styles.keyboardView, { maxWidth: constrainedWidth }]}
        >
          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
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
                  editable={!isLoading}
                />

                <Text style={styles.rulesHint}>{USERNAME_RULES_HINT}</Text>

                <Text style={styles.fieldLabel}>Password</Text>
                <TextInput
                  style={styles.passwordInput}
                  value={password}
                  onChangeText={setPassword}
                  placeholder=""
                  placeholderTextColor="#666666"
                  secureTextEntry
                  autoCapitalize="none"
                  editable={!isLoading}
                />

                <Text style={styles.fieldLabel}>Confirm password</Text>
                <TextInput
                  style={styles.passwordInput}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder=""
                  placeholderTextColor="#666666"
                  secureTextEntry
                  autoCapitalize="none"
                  editable={!isLoading}
                />

                <Text style={styles.helperText}>
                  Your username is unique.{'\n'}
                  You can always change it later.
                </Text>

                {error && <Text style={styles.errorText}>{error}</Text>}
              </View>

              <TouchableOpacity
                style={[
                  styles.continueButton,
                  (!canContinue || isLoading) && styles.continueButtonDisabled,
                ]}
                onPress={handleContinue}
                activeOpacity={0.8}
                disabled={!canContinue || isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#000000" />
                ) : (
                  <Text style={styles.continueButtonText}>Continue</Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
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
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: LAYOUT.paddingHorizontal,
    paddingTop: 80,
    paddingBottom: 40,
    minHeight: 520,
  },
  inputSection: {
    alignItems: 'center',
    width: '100%',
  },
  title: {
    fontSize: 22,
    fontFamily: 'Caladea-Regular',
    color: '#C0D1FF',
    textAlign: 'center',
    marginBottom: 28,
    letterSpacing: 0.3,
  },
  input: {
    fontSize: 24,
    fontFamily: 'Caladea-Regular',
    color: '#FFFFFF',
    textAlign: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginBottom: 8,
    width: '100%',
  },
  rulesHint: {
    fontSize: 12,
    color: '#777777',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  fieldLabel: {
    alignSelf: 'flex-start',
    fontSize: 13,
    color: '#999999',
    marginBottom: 8,
    width: '100%',
  },
  passwordInput: {
    fontSize: 17,
    fontFamily: 'Caladea-Regular',
    color: '#FFFFFF',
    textAlign: 'left',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  helperText: {
    fontSize: 14,
    color: '#999999',
    textAlign: 'center',
    lineHeight: 20,
    marginTop: 8,
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
    marginTop: 24,
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
