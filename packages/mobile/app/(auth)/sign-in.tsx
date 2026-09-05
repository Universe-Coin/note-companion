import React, { Suspense, lazy } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useSignIn } from '@clerk/react/legacy';
import { useRouter } from 'expo-router';
import { navigateToSessionHandoff } from '@/utils/auth-session';

const OAuthContinueButtons = lazy(() =>
  import('@/components/oauth-continue-buttons').then((module) => ({
    default: module.OAuthContinueButtons,
  })),
);

export default function SignInScreen() {
  const router = useRouter();
  const { signIn, isLoaded } = useSignIn();

  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const onSignInWithEmail = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      console.log('[SignIn] Attempting sign in with email');
      
      if (!isLoaded || !signIn) {
        console.error('[SignIn] Clerk not loaded or signIn unavailable');
        Alert.alert('Error', 'Sign in service is not ready. Please try again.');
        setLoading(false);
        return;
      }

      const result = await signIn.create({
        identifier: email,
        password,
      });

      console.log('[SignIn] Sign in result status:', result.status);
      
      if (result.status === 'complete' && result.createdSessionId) {
        console.log('[SignIn] Sign in complete, handing off session activation');
        navigateToSessionHandoff(router, result.createdSessionId);
        return;
      } else {
        console.log('[SignIn] Sign in requires additional steps:', result.status);
        // Handle additional verification if needed
      }
    } catch (err: unknown) {
      console.error('[SignIn] Sign in error:', err);
      // More generic error checking for Clerk
      let errorMessage = 'Failed to sign in. Please check your credentials.';
      if (typeof err === 'object' && err !== null && 'errors' in err) {
        const clerkError = err as { errors: { message: string }[] };
        if (Array.isArray(clerkError.errors) && clerkError.errors.length > 0 && clerkError.errors[0].message) {
          errorMessage = clerkError.errors[0].message;
        }
      } else if (err instanceof Error) {
        errorMessage = err.message; // Fallback to general error message
      }
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!isLoaded) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#8a65ed" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.title}>Welcome to Note Companion</Text>
          <Text style={styles.subtitle}>Sign in to access your account</Text>
        </View>

        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoComplete="password"
            returnKeyType="go"
            onSubmitEditing={onSignInWithEmail}
            blurOnSubmit
          />
          <TouchableOpacity
            style={[styles.button, styles.emailButton]}
            onPress={onSignInWithEmail}
            disabled={loading}
          >
            <Text style={styles.emailButtonText}>
              {loading ? 'Signing in...' : 'Sign in with Email'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or continue with</Text>
          <View style={styles.dividerLine} />
        </View>

        <Suspense fallback={<ActivityIndicator color="#8a65ed" />}>
          <OAuthContinueButtons disabled={loading} />
        </Suspense>

        <View style={styles.footer}>
          <View style={styles.footerLinks}>
            <TouchableOpacity onPress={() => router.push('/(auth)/sign-up')}>
              <Text style={styles.footerLink}>Create Account</Text>
            </TouchableOpacity>
            <Text style={styles.footerDot}>•</Text>
            <TouchableOpacity>
              <Text style={styles.footerLink}>Forgot Password?</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.footerText}>
            By continuing, you agree to our{' '}
            <Text 
              style={[styles.footerLink, styles.inlineLink]}
              onPress={() => { 
                if (Platform.OS === 'web') {
                  window.open('/docs/terms-of-service.md', '_blank');
                } else {
                  router.push('/docs/terms-of-service');
                }
              }}
            >
              Terms of Service
            </Text>{' '}
            and{' '}
            <Text 
              style={[styles.footerLink, styles.inlineLink]}
              onPress={() => {
                if (Platform.OS === 'web') {
                  window.open('/docs/privacy-policy.md', '_blank');
                } else {
                  router.push('/docs/privacy-policy');
                }
              }}
            >
              Privacy Policy
            </Text>
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    justifyContent: 'space-between',
  },
  header: {
    marginTop: 60,
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#1a1a1a',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  form: {
    width: '100%',
    gap: 16,
    marginBottom: 24,
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#f8f8f8',
  },
  buttonContainer: {
    width: '100%',
    gap: 16,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    width: '100%',
    gap: 12,
    borderWidth: 1,
  },
  emailButton: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  emailButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  googleButton: {
    backgroundColor: '#fff',
    borderColor: '#ddd',
  },
  appleButton: {
    backgroundColor: '#fff',
    borderColor: '#ddd',
  },
  appleLogoContainer: {
    // Remove this style - no longer needed
    // justifyContent: 'center',
    // alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  appleButtonText: {
    // Remove this style - using buttonText now
    // color: '#fff',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#ddd',
  },
  dividerText: {
    color: '#666',
    paddingHorizontal: 16,
    fontSize: 14,
  },
  footer: {
    marginTop: 24,
  },
  footerLinks: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  footerLink: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600',
  },
  inlineLink: {
    textDecorationLine: 'underline',
  },
  footerDot: {
    color: '#666',
    marginHorizontal: 8,
    fontSize: 14,
  },
  footerText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 12,
  },
}); 