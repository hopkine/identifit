import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft } from 'lucide-react-native';
import { useRouter, type Href } from 'expo-router';
import { onboardingScreenStyles as os } from '@/constants/onboardingScreens';
import { appStorage } from '@/lib/appStorage';
import { signInWithUsernamePassword } from '@/lib/authUsername';
import { supabase } from '@/lib/supabase';
import { CLOUD_USER_ID_STORAGE_KEY } from '@/lib/userCloudSync';
import { useOOTD } from '@/hooks/useOOTD';

export default function Login() {
  const router = useRouter();
  const { refreshCloudProfile } = useOOTD();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      const result = await signInWithUsernamePassword(username, password);
      if (result.error) {
        setError(result.error);
        return;
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();

      const uid = session?.user?.id;
      if (!uid) {
        setError('Signed in but no session. Check Supabase Auth settings.');
        return;
      }

      await appStorage.setItem(CLOUD_USER_ID_STORAGE_KEY, uid);
      await refreshCloudProfile();
      router.replace('/NAV' as Href);
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = () => {
    router.push({
      pathname: '/ONBOARDING/username',
      params: { signup: '1' },
    });
  };

  const handleContinueWithoutSignIn = () => {
    router.replace('/NAV' as Href);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.innerContainer}>
            <View style={styles.headerRow}>
              <TouchableOpacity
                onPress={() => router.back()}
                style={os.backButton}
                activeOpacity={0.6}
              >
                <ChevronLeft size={24} color="#FFFFFF" />
              </TouchableOpacity>

              <Text style={styles.headerTitle}>Sign In</Text>

              <View style={styles.headerRightSpacer} />
            </View>

            <View style={styles.centerContent}>
              <View style={styles.logoContainer}>
                <Image
                  style={styles.logo}
                  source={require('@/assets/images/onboarding-assets/Group 121075715.png')}
                  resizeMode="contain"
                />
              </View>

              <View style={styles.form}>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Username</Text>
                  <TextInput
                    style={styles.input}
                    value={username}
                    onChangeText={setUsername}
                    placeholder="Enter your username"
                    placeholderTextColor="#9CA3AF"
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={!loading}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Password</Text>
                  <TextInput
                    style={styles.input}
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Enter your password"
                    placeholderTextColor="#9CA3AF"
                    secureTextEntry
                    autoCapitalize="none"
                    editable={!loading}
                  />
                </View>

                {error ? <Text style={styles.errorText}>{error}</Text> : null}

                <TouchableOpacity
                  onPress={handleLogin}
                  style={[styles.signInButton, loading && styles.signInButtonDisabled]}
                  activeOpacity={0.8}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#000000" />
                  ) : (
                    <Text style={styles.signInButtonText}>Sign In</Text>
                  )}
                </TouchableOpacity>

                <View style={styles.signUpContainer}>
                  <TouchableOpacity
                    onPress={handleSignUp}
                    activeOpacity={0.7}
                    disabled={loading}
                  >
                    <Text style={styles.signUpText}>
                      Don&apos;t have an account? Sign up
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={handleContinueWithoutSignIn}
                    activeOpacity={0.7}
                    disabled={loading}
                    style={styles.guestLink}
                    accessibilityRole="button"
                    accessibilityLabel="Try the app without signing in"
                  >
                    <Text style={styles.guestLinkText}>
                      Try without signing in
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  innerContainer: {
    flex: 1,
    paddingHorizontal: 24,
    maxWidth: 448,
    width: '100%',
    alignSelf: 'center',
    paddingTop: 12,
  },
  headerRow: {
    ...os.headerBarInFlow,
    marginTop: 0,
    marginBottom: 22,
    paddingHorizontal: 0,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    color: '#FFFFFF',
    fontSize: 16,
    letterSpacing: 0.2,
  },
  headerRightSpacer: {
    width: 40,
    height: 40,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logo: {
    width: 180,
    height: 75,
  },
  form: {
    gap: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Default',
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#1F2937',
    borderWidth: 1,
    borderColor: '#4B5563',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#FFFFFF',
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 14,
    marginTop: -8,
    marginBottom: 4,
  },
  signInButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 24,
    height: 48,
    justifyContent: 'center',
  },
  signInButtonDisabled: {
    opacity: 0.7,
  },
  signInButtonText: {
    color: '#000000',
    fontSize: 16,
  },
  signUpContainer: {
    alignItems: 'center',
    marginTop: 8,
    gap: 20,
  },
  signUpText: {
    color: '#9CA3AF',
    fontSize: 14,
  },
  guestLink: {
    paddingVertical: 4,
  },
  guestLinkText: {
    color: '#C0D1FF',
    fontSize: 15,
    fontWeight: '500',
  },
});
