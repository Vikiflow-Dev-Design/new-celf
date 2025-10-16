import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { useThemeColors } from '@/hooks/useThemeColors';
import { IconSelector } from './IconSelector';
import { apiService } from '@/services/apiService';
import { Switch } from 'react-native';

interface SocialLinkFormProps {
  initialData?: {
    _id?: string;
    platform: string;
    url: string;
    icon: string;
    displayName: string;
    isActive: boolean;
    sortOrder: number;
  };
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const SocialLinkForm: React.FC<SocialLinkFormProps> = ({
  initialData,
  onSuccess,
  onCancel
}) => {
  const colors = useThemeColors();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showIconSelector, setShowIconSelector] = useState(false);
  
  const [formData, setFormData] = useState({
    platform: initialData?.platform || '',
    url: initialData?.url || '',
    icon: initialData?.icon || 'link-outline',
    displayName: initialData?.displayName || '',
    isActive: initialData?.isActive ?? true,
    sortOrder: initialData?.sortOrder ?? 0
  });

  const handleChange = (field: string, value: string | boolean | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSelectIcon = (icon: string) => {
    handleChange('icon', icon);
    setShowIconSelector(false);
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Validate form
      if (!formData.platform || !formData.url || !formData.displayName) {
        setError('Please fill in all required fields');
        return;
      }
      
      let response;
      
      if (initialData?._id) {
        // Update existing social link
        response = await apiService.updateSocialLink(initialData._id, formData);
      } else {
        // Create new social link
        response = await apiService.createSocialLink(formData);
      }
      
      if (response.success) {
        onSuccess?.();
      } else {
        setError(response.message || 'Failed to save social link');
      }
    } catch (err) {
      console.error('Error saving social link:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      {showIconSelector ? (
        <View style={styles.iconSelectorContainer}>
          <IconSelector 
            onSelectIcon={handleSelectIcon} 
            initialIcon={formData.icon} 
          />
          <TouchableOpacity 
            style={[styles.backButton, { backgroundColor: colors.card }]}
            onPress={() => setShowIconSelector(false)}
          >
            <Text style={{ color: colors.text }}>Back to Form</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View>
          <Text style={[styles.title, { color: colors.text }]}>
            {initialData?._id ? 'Edit Social Link' : 'Add Social Link'}
          </Text>
          
          {error && (
            <View style={[styles.errorContainer, { backgroundColor: '#FFEBEE' }]}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}
          
          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Platform Name*</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.card, color: colors.text }]}
              placeholder="e.g. Facebook, Twitter, etc."
              placeholderTextColor={colors.text + '80'}
              value={formData.platform}
              onChangeText={(value) => handleChange('platform', value)}
            />
          </View>
          
          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Display Name*</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.card, color: colors.text }]}
              placeholder="e.g. Follow us on Facebook"
              placeholderTextColor={colors.text + '80'}
              value={formData.displayName}
              onChangeText={(value) => handleChange('displayName', value)}
            />
          </View>
          
          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: colors.text }]}>URL*</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.card, color: colors.text }]}
              placeholder="https://..."
              placeholderTextColor={colors.text + '80'}
              value={formData.url}
              onChangeText={(value) => handleChange('url', value)}
              autoCapitalize="none"
              keyboardType="url"
            />
          </View>
          
          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Icon</Text>
            <TouchableOpacity
              style={[styles.iconPreview, { backgroundColor: colors.card }]}
              onPress={() => setShowIconSelector(true)}
            >
              <View style={styles.iconPreviewContent}>
                <Text style={{ color: colors.text }}>{formData.icon}</Text>
              </View>
              <Text style={{ color: colors.primary }}>Change Icon</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Sort Order</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.card, color: colors.text }]}
              placeholder="0"
              placeholderTextColor={colors.text + '80'}
              value={String(formData.sortOrder)}
              onChangeText={(value) => handleChange('sortOrder', parseInt(value) || 0)}
              keyboardType="number-pad"
            />
          </View>
          
          <View style={styles.switchContainer}>
            <Text style={[styles.label, { color: colors.text }]}>Active</Text>
            <Switch
              value={formData.isActive}
              onValueChange={(value) => handleChange('isActive', value)}
              trackColor={{ false: '#767577', true: colors.primary }}
            />
          </View>
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton, { borderColor: colors.border }]}
              onPress={onCancel}
              disabled={loading}
            >
              <Text style={{ color: colors.text }}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.button, 
                styles.submitButton, 
                { backgroundColor: colors.primary },
                loading && styles.disabledButton
              ]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text style={{ color: '#ffffff' }}>Save</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
  },
  input: {
    height: 48,
    borderRadius: 8,
    paddingHorizontal: 16,
  },
  iconPreview: {
    height: 80,
    borderRadius: 8,
    padding: 16,
    justifyContent: 'space-between',
  },
  iconPreviewContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  button: {
    flex: 1,
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButton: {
    marginRight: 8,
    borderWidth: 1,
  },
  submitButton: {
    marginLeft: 8,
  },
  disabledButton: {
    opacity: 0.7,
  },
  errorContainer: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: '#B71C1C',
  },
  iconSelectorContainer: {
    flex: 1,
  },
  backButton: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
});