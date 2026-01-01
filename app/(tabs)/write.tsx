import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
} from 'react-native';
import { router } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import { X, ChevronDown, Lock, Globe, Mail, User, UserX } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/components/ui/Toast';
import { brand } from '@/constants/Colors';
import { spacing, radius } from '@/constants/Theme';
import { Avatar } from '@/components/ui/Avatar';
import { getBaseUrl, validateEmail } from '@/lib/utils';

type Visibility = 'private' | 'public';

export default function WriteScreen() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [recipientName, setRecipientName] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [content, setContent] = useState('');
  const [visibility, setVisibility] = useState<Visibility>('private');
  const [loading, setLoading] = useState(false);
  const [showEmailInput, setShowEmailInput] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);

  const displayName = user?.user_metadata?.display_name || 'You';
  const minChars = 50;
  const canPost = recipientName.trim().length > 0 && content.trim().length >= minChars;

  const sendNotificationEmail = async (
    email: string,
    name: string,
    shareToken: string
  ): Promise<boolean> => {
    try {
      const baseUrl = getBaseUrl();
      const shareUrl = `${baseUrl}/view/${shareToken}`;
      const senderName = isAnonymous ? 'Someone' : (user?.user_metadata?.display_name || 'Someone');

      const response = await fetch('/.netlify/functions/send-eulogy-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientEmail: email,
          recipientName: name,
          senderName,
          shareUrl,
        }),
      });

      return response.ok;
    } catch (err) {
      console.error('Failed to send email:', err);
      return false;
    }
  };

  const handlePost = async () => {
    if (!canPost) return;

    const trimmedEmail = recipientEmail.trim();

    // Validate email format if provided
    if (trimmedEmail && !validateEmail(trimmedEmail)) {
      showToast('Please enter a valid email address.', 'error');
      return;
    }

    setLoading(true);

    const { data, error } = await supabase
      .from('eulogies')
      .insert({
        author_id: user?.id,
        recipient_name: recipientName.trim(),
        recipient_email: trimmedEmail || null,
        content: content.trim(),
        visibility,
        is_anonymous: isAnonymous,
      })
      .select('share_token')
      .single();

    if (error) {
      setLoading(false);
      showToast('Failed to create eulogy. Please try again.', 'error');
      return;
    }

    // Send email notification if recipient email provided
    let emailSent = false;
    if (trimmedEmail && data?.share_token) {
      emailSent = await sendNotificationEmail(
        trimmedEmail,
        recipientName.trim(),
        data.share_token
      );
    }

    // Copy share link to clipboard
    const baseUrl = getBaseUrl();
    const shareUrl = `${baseUrl}/view/${data?.share_token}`;
    let clipboardSuccess = false;
    try {
      await Clipboard.setStringAsync(shareUrl);
      clipboardSuccess = true;
    } catch {
      // Clipboard failed silently
    }

    setLoading(false);

    // Show appropriate success message
    if (!clipboardSuccess) {
      showToast('Eulogy created! Could not copy link.', 'success');
    } else if (trimmedEmail && !emailSent) {
      showToast('Eulogy created! Link copied. Email failed to send.', 'success');
    } else {
      showToast('Eulogy created! Link copied to clipboard.', 'success');
    }

    // Reset form
    setRecipientName('');
    setRecipientEmail('');
    setContent('');
    setVisibility('private');
    setShowEmailInput(false);
    setIsAnonymous(false);

    // Navigate to my eulogies
    router.push('/(tabs)/my-eulogies');
  };

  const handleClose = () => {
    router.back();
  };

  const toggleVisibility = () => {
    setVisibility(visibility === 'private' ? 'public' : 'private');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={handleClose}
            style={styles.closeButton}
            accessibilityLabel="Close"
            accessibilityRole="button"
          >
            <X size={24} color={brand.text} strokeWidth={2} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.postButton, !canPost && styles.postButtonDisabled]}
            onPress={handlePost}
            disabled={!canPost || loading}
            accessibilityRole="button"
            accessibilityLabel={loading ? 'Posting' : 'Post eulogy'}
            accessibilityState={{ disabled: !canPost || loading }}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.postButtonText}>Post</Text>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Compose Area */}
          <View style={styles.composeArea}>
            <Avatar name={displayName} size="md" />
            <View style={styles.composeContent}>
              {/* Recipient Input */}
              <View style={styles.recipientRow}>
                <Text style={styles.toLabel}>To</Text>
                <TextInput
                  style={styles.recipientInput}
                  placeholder="Who is this for?"
                  placeholderTextColor={brand.textMuted}
                  value={recipientName}
                  onChangeText={setRecipientName}
                  accessibilityLabel="Recipient name"
                />
              </View>

              {/* Main Content */}
              <TextInput
                style={styles.contentInput}
                placeholder="What do you want them to know?"
                placeholderTextColor={brand.textMuted}
                value={content}
                onChangeText={setContent}
                multiline
                textAlignVertical="top"
                accessibilityLabel="Eulogy content"
              />

              {/* Character hint */}
              {content.length === 0 && (
                <Text style={styles.charHint}>Minimum 50 characters</Text>
              )}
            </View>
          </View>

          {/* Writing Prompts */}
          {content.length === 0 && (
            <View style={styles.promptsSection}>
              <Text style={styles.promptsLabel}>Try starting with...</Text>
              <View style={styles.prompts}>
                {[
                  "What I've never told you is...",
                  "You changed my life when...",
                  "I admire how you...",
                ].map((prompt, i) => (
                  <TouchableOpacity
                    key={i}
                    style={styles.promptChip}
                    onPress={() => setContent(prompt)}
                    accessibilityRole="button"
                    accessibilityLabel={`Use prompt: ${prompt}`}
                  >
                    <Text style={styles.promptText}>{prompt}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </ScrollView>

        {/* Bottom Bar */}
        <View style={styles.bottomBar}>
          <View style={styles.bottomActions}>
            {/* Email Toggle */}
            <TouchableOpacity
              style={[styles.toggleButton, showEmailInput && styles.toggleButtonActive]}
              onPress={() => setShowEmailInput(!showEmailInput)}
              accessibilityRole="switch"
              accessibilityState={{ checked: showEmailInput }}
              accessibilityLabel="Send email notification"
            >
              <Mail size={16} color={showEmailInput ? brand.primary : brand.textSecondary} strokeWidth={2} />
              <Text style={[styles.toggleText, showEmailInput && styles.toggleTextActive]}>
                {showEmailInput ? 'Email on' : 'Email'}
              </Text>
            </TouchableOpacity>

            {/* Anonymous Toggle */}
            <TouchableOpacity
              style={styles.visibilityToggle}
              onPress={() => setIsAnonymous(!isAnonymous)}
              accessibilityRole="switch"
              accessibilityState={{ checked: isAnonymous }}
              accessibilityLabel="Post anonymously"
            >
              {isAnonymous ? (
                <UserX size={16} color={brand.primary} strokeWidth={2} />
              ) : (
                <User size={16} color={brand.textSecondary} strokeWidth={2} />
              )}
              <Text style={[styles.visibilityText, isAnonymous && styles.visibilityTextPublic]}>
                {isAnonymous ? 'Anonymous' : 'Signed'}
              </Text>
            </TouchableOpacity>

            {/* Visibility Toggle */}
            <TouchableOpacity
              style={styles.visibilityToggle}
              onPress={toggleVisibility}
              accessibilityRole="button"
              accessibilityLabel={`Visibility: ${visibility === 'private' ? 'Only via link' : 'Public'}`}
            >
              {visibility === 'private' ? (
                <Lock size={16} color={brand.textSecondary} strokeWidth={2} />
              ) : (
                <Globe size={16} color={brand.primary} strokeWidth={2} />
              )}
              <Text style={[styles.visibilityText, visibility === 'public' && styles.visibilityTextPublic]}>
                {visibility === 'private' ? 'Only via link' : 'Public'}
              </Text>
              <ChevronDown size={14} color={brand.textMuted} strokeWidth={2} />
            </TouchableOpacity>
          </View>

          {/* Character Count */}
          <Text style={[styles.charCount, content.length >= minChars && styles.charCountGood]}>
            {content.length < minChars ? `${minChars - content.length} chars left` : '✓'}
          </Text>
        </View>

        {/* Email Input (collapsible) */}
        {showEmailInput && (
          <View style={styles.emailSection}>
            <Mail size={18} color={brand.textMuted} strokeWidth={2} />
            <TextInput
              style={styles.emailInput}
              placeholder="Their email (we'll send them a link)"
              placeholderTextColor={brand.textMuted}
              value={recipientEmail}
              onChangeText={setRecipientEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoFocus
              accessibilityLabel="Recipient email address"
            />
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: brand.background,
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: brand.border,
  },
  closeButton: {
    padding: spacing.xs,
  },
  postButton: {
    backgroundColor: brand.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
  },
  postButtonDisabled: {
    opacity: 0.5,
  },
  postButtonText: {
    fontFamily: 'Inter_600SemiBold',
    color: '#fff',
    fontSize: 15,
  },
  scrollContent: {
    flexGrow: 1,
  },
  composeArea: {
    flexDirection: 'row',
    padding: spacing.md,
    gap: spacing.md,
  },
  composeContent: {
    flex: 1,
  },
  recipientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: brand.border,
  },
  toLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 15,
    color: brand.textMuted,
  },
  recipientInput: {
    flex: 1,
    fontFamily: 'Inter_600SemiBold',
    fontSize: 15,
    color: brand.primary,
    padding: 0,
  },
  contentInput: {
    fontFamily: 'Inter_400Regular',
    fontSize: 17,
    color: brand.text,
    lineHeight: 24,
    minHeight: 150,
    padding: 0,
  },
  charHint: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: brand.textMuted,
    marginTop: spacing.sm,
  },
  promptsSection: {
    paddingHorizontal: spacing.md,
    paddingLeft: spacing.md + 40 + spacing.md, // Align with compose content
  },
  promptsLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    color: brand.textMuted,
    marginBottom: spacing.sm,
  },
  prompts: {
    gap: spacing.sm,
  },
  promptChip: {
    backgroundColor: brand.backgroundAlt,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    alignSelf: 'flex-start',
  },
  promptText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: brand.textSecondary,
  },
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: brand.border,
  },
  bottomActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    backgroundColor: brand.backgroundAlt,
    borderRadius: radius.full,
  },
  toggleButtonActive: {
    backgroundColor: '#EEF2FF',
  },
  toggleText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    color: brand.textSecondary,
  },
  toggleTextActive: {
    color: brand.primary,
  },
  visibilityToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    backgroundColor: brand.backgroundAlt,
    borderRadius: radius.full,
  },
  visibilityText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    color: brand.textSecondary,
  },
  visibilityTextPublic: {
    color: brand.primary,
  },
  charCount: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    color: brand.textMuted,
  },
  charCountGood: {
    color: brand.success,
  },
  emailSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: brand.border,
    backgroundColor: brand.backgroundAlt,
  },
  emailInput: {
    flex: 1,
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    color: brand.text,
    padding: 0,
  },
});
