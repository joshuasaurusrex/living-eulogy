import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
} from 'react-native';
import { router } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import { brand } from '@/constants/Colors';
import { spacing, radius, shadows } from '@/constants/Theme';

type Visibility = 'private' | 'friends' | 'public';

const WRITING_PROMPTS = [
  "What's something you've never told them?",
  "How have they changed your life?",
  "What do you admire most about them?",
  "What's a memory you'll always treasure?",
];

export default function WriteScreen() {
  const { user } = useAuth();
  const [recipientName, setRecipientName] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [content, setContent] = useState('');
  const [visibility, setVisibility] = useState<Visibility>('private');
  const [loading, setLoading] = useState(false);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  const getBaseUrl = () => {
    if (typeof window !== 'undefined') {
      return window.location.origin;
    }
    return 'https://livingeulogy.io';
  };

  const copyToClipboard = async (text: string) => {
    await Clipboard.setStringAsync(text);
  };

  const sendNotificationEmail = async (
    email: string,
    name: string,
    shareToken: string
  ) => {
    try {
      const baseUrl = getBaseUrl();
      const shareUrl = `${baseUrl}/view/${shareToken}`;
      const senderName = user?.user_metadata?.display_name || 'Someone';

      await fetch('/.netlify/functions/send-eulogy-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientEmail: email,
          recipientName: name,
          senderName,
          shareUrl,
        }),
      });
    } catch (err) {
      console.error('Failed to send email:', err);
    }
  };

  const handleSubmit = async () => {
    if (!recipientName.trim()) {
      Alert.alert('Missing info', 'Please enter who this eulogy is for');
      return;
    }
    if (!content.trim()) {
      Alert.alert('Missing info', 'Please write your eulogy');
      return;
    }
    if (content.trim().length < 50) {
      Alert.alert('Too short', 'Please write at least 50 characters to create a meaningful eulogy');
      return;
    }

    setLoading(true);

    const { data, error } = await supabase
      .from('eulogies')
      .insert({
        author_id: user?.id,
        recipient_name: recipientName.trim(),
        recipient_email: recipientEmail.trim() || null,
        content: content.trim(),
        visibility,
      })
      .select('share_token')
      .single();

    if (error) {
      setLoading(false);
      Alert.alert('Error', error.message);
      return;
    }

    // Send email notification if recipient email provided
    if (recipientEmail.trim() && data?.share_token) {
      await sendNotificationEmail(
        recipientEmail.trim(),
        recipientName.trim(),
        data.share_token
      );
    }

    setLoading(false);

    const baseUrl = getBaseUrl();
    const shareUrl = `${baseUrl}/view/${data?.share_token}`;

    // Copy to clipboard
    if (data?.share_token) {
      await copyToClipboard(shareUrl);
    }

    if (recipientEmail && data?.share_token) {
      Alert.alert(
        'Sent!',
        `Your eulogy has been sent to ${recipientName}.\n\nThe share link has been copied to your clipboard.`,
        [
          { text: 'View My Eulogies', onPress: () => router.push('/(tabs)/my-eulogies') },
        ]
      );
    } else if (data?.share_token) {
      Alert.alert(
        'Saved!',
        `Your eulogy has been saved.\n\nThe share link has been copied to your clipboard:\n${shareUrl}`,
        [
          { text: 'View My Eulogies', onPress: () => router.push('/(tabs)/my-eulogies') },
        ]
      );
    }

    // Reset form
    setRecipientName('');
    setRecipientEmail('');
    setContent('');
    setVisibility('private');
  };

  const VisibilityOption = ({
    value,
    label,
    icon,
    description,
    disabled = false,
  }: {
    value: Visibility;
    label: string;
    icon: string;
    description: string;
    disabled?: boolean;
  }) => (
    <TouchableOpacity
      style={[
        styles.visibilityOption,
        visibility === value && styles.visibilitySelected,
        disabled && styles.visibilityDisabled,
      ]}
      onPress={() => !disabled && setVisibility(value)}
      activeOpacity={disabled ? 1 : 0.7}
    >
      <Text style={[styles.visibilityIcon, disabled && styles.visibilityIconDisabled]}>{icon}</Text>
      <Text
        style={[
          styles.visibilityLabel,
          visibility === value && styles.visibilityLabelSelected,
          disabled && styles.visibilityLabelDisabled,
        ]}
      >
        {label}
      </Text>
      <Text style={[styles.visibilityDesc, disabled && styles.visibilityDescDisabled]}>{description}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Write a Living Eulogy</Text>
            <Text style={styles.subtitle}>
              Share your appreciation while they can still hear it
            </Text>
          </View>

          {/* Writing Prompts */}
          <View style={styles.promptsSection}>
            <Text style={styles.promptsTitle}>Need inspiration?</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.promptsScroll}
            >
              {WRITING_PROMPTS.map((prompt, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.promptChip}
                  onPress={() => setContent(content ? `${content}\n\n${prompt}` : prompt)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.promptText}>{prompt}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Who is this for?</Text>
              <TextInput
                style={[
                  styles.input,
                  focusedInput === 'name' && styles.inputFocused,
                ]}
                placeholder="Their name"
                placeholderTextColor={brand.textMuted}
                value={recipientName}
                onChangeText={setRecipientName}
                onFocus={() => setFocusedInput('name')}
                onBlur={() => setFocusedInput(null)}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Their email (optional)</Text>
              <TextInput
                style={[
                  styles.input,
                  focusedInput === 'email' && styles.inputFocused,
                ]}
                placeholder="email@example.com"
                placeholderTextColor={brand.textMuted}
                value={recipientEmail}
                onChangeText={setRecipientEmail}
                onFocus={() => setFocusedInput('email')}
                onBlur={() => setFocusedInput(null)}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <Text style={styles.hint}>
                We'll notify them and send a private link
              </Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Your eulogy</Text>
              <TextInput
                style={[
                  styles.input,
                  styles.textArea,
                  focusedInput === 'content' && styles.inputFocused,
                ]}
                placeholder="What do you want them to know? What impact have they had on your life? What do you appreciate about them?"
                placeholderTextColor={brand.textMuted}
                value={content}
                onChangeText={setContent}
                onFocus={() => setFocusedInput('content')}
                onBlur={() => setFocusedInput(null)}
                multiline
                textAlignVertical="top"
              />
              <Text style={[styles.hint, content.length < 50 && content.length > 0 && styles.hintWarning]}>
                {content.length}/50 minimum characters
              </Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Visibility</Text>
              <View style={styles.visibilityContainer}>
                <VisibilityOption
                  value="private"
                  label="Private"
                  icon="🔒"
                  description="Only via link"
                />
                <VisibilityOption
                  value="friends"
                  label="Friends"
                  icon="👥"
                  description="Coming soon"
                  disabled
                />
                <VisibilityOption
                  value="public"
                  label="Public"
                  icon="🌍"
                  description="Anyone can see"
                />
              </View>
            </View>

            <TouchableOpacity
              style={[styles.submitButton, loading && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitButtonText}>
                  {recipientEmail ? 'Save & Send' : 'Save Eulogy'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: brand.backgroundAlt,
  },
  container: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  header: {
    marginBottom: spacing.lg,
  },
  title: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 28,
    color: brand.text,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    color: brand.textSecondary,
    lineHeight: 22,
  },
  promptsSection: {
    marginBottom: spacing.lg,
  },
  promptsTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    color: brand.textMuted,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  promptsScroll: {
    gap: spacing.sm,
  },
  promptChip: {
    backgroundColor: brand.background,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: brand.border,
    ...shadows.sm,
  },
  promptText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    color: brand.text,
  },
  form: {
    gap: spacing.md,
  },
  inputGroup: {
    gap: spacing.xs,
  },
  label: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: brand.text,
    marginLeft: spacing.xs,
  },
  input: {
    backgroundColor: brand.background,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    color: brand.text,
    borderWidth: 2,
    borderColor: brand.border,
  },
  inputFocused: {
    borderColor: brand.primary,
  },
  textArea: {
    height: 180,
    paddingTop: spacing.md,
  },
  hint: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: brand.textMuted,
    marginLeft: spacing.xs,
  },
  hintWarning: {
    color: brand.warning,
  },
  visibilityContainer: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  visibilityOption: {
    flex: 1,
    backgroundColor: brand.background,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 2,
    borderColor: brand.border,
    alignItems: 'center',
    ...shadows.sm,
  },
  visibilitySelected: {
    borderColor: brand.primary,
    backgroundColor: '#EEF2FF', // indigo-50
  },
  visibilityIcon: {
    fontSize: 20,
    marginBottom: spacing.xs,
  },
  visibilityLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: brand.text,
  },
  visibilityLabelSelected: {
    color: brand.primary,
  },
  visibilityDesc: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: brand.textMuted,
    marginTop: 2,
    textAlign: 'center',
  },
  visibilityDisabled: {
    opacity: 0.5,
    backgroundColor: brand.backgroundAlt,
  },
  visibilityIconDisabled: {
    opacity: 0.6,
  },
  visibilityLabelDisabled: {
    color: brand.textMuted,
  },
  visibilityDescDisabled: {
    fontStyle: 'italic',
  },
  submitButton: {
    backgroundColor: brand.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.md + 4,
    alignItems: 'center',
    marginTop: spacing.lg,
    shadowColor: brand.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    fontFamily: 'Inter_700Bold',
    color: '#fff',
    fontSize: 18,
  },
});
