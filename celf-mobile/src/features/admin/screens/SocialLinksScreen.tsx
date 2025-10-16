import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '@/hooks/useThemeColors';
import { apiService } from '@/services/apiService';
import { SocialLinkForm } from '@/src/components/ui/SocialLinkForm';
import { useFocusEffect } from '@react-navigation/native';

interface SocialLink {
  _id: string;
  platform: string;
  url: string;
  icon: string;
  displayName: string;
  isActive: boolean;
  sortOrder: number;
}

export const SocialLinksScreen: React.FC = () => {
  const colors = useThemeColors();
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedLink, setSelectedLink] = useState<SocialLink | null>(null);

  const fetchSocialLinks = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiService.getSocialLinks();
      
      if (response.success && response.data) {
        setSocialLinks(response.data);
      } else {
        setError(response.message || 'Failed to fetch social links');
      }
    } catch (err) {
      console.error('Error fetching social links:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchSocialLinks();
    }, [])
  );

  const handleAddNew = () => {
    setSelectedLink(null);
    setShowForm(true);
  };

  const handleEdit = (link: SocialLink) => {
    setSelectedLink(link);
    setShowForm(true);
  };

  const handleDelete = (link: SocialLink) => {
    Alert.alert(
      'Delete Social Link',
      `Are you sure you want to delete ${link.displayName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              const response = await apiService.deleteSocialLink(link._id);
              
              if (response.success) {
                fetchSocialLinks();
              } else {
                Alert.alert('Error', response.message || 'Failed to delete social link');
              }
            } catch (err) {
              console.error('Error deleting social link:', err);
              Alert.alert('Error', 'An error occurred while deleting the social link');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    fetchSocialLinks();
  };

  const handleFormCancel = () => {
    setShowForm(false);
  };

  if (showForm) {
    return (
      <SocialLinkForm
        initialData={selectedLink || undefined}
        onSuccess={handleFormSuccess}
        onCancel={handleFormCancel}
      />
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Social Links</Text>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: colors.primary }]}
          onPress={handleAddNew}
        >
          <Ionicons name="add" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {error && (
        <View style={[styles.errorContainer, { backgroundColor: '#FFEBEE' }]}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={fetchSocialLinks}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {loading && socialLinks.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.text }]}>Loading social links...</Text>
        </View>
      ) : socialLinks.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="link-outline" size={48} color={colors.text + '80'} />
          <Text style={[styles.emptyText, { color: colors.text }]}>No social links found</Text>
          <Text style={[styles.emptySubtext, { color: colors.text + '80' }]}>
            Add your first social link to get started
          </Text>
        </View>
      ) : (
        <FlatList
          data={socialLinks}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <View style={[styles.linkItem, { backgroundColor: colors.card }]}>
              <View style={styles.linkIconContainer}>
                <Ionicons 
                  name={item.icon as any || 'link-outline'} 
                  size={24} 
                  color={item.isActive ? colors.text : colors.text + '50'} 
                />
              </View>
              <View style={styles.linkDetails}>
                <Text 
                  style={[
                    styles.linkName, 
                    { color: colors.text },
                    !item.isActive && styles.inactiveText
                  ]}
                >
                  {item.displayName}
                </Text>
                <Text 
                  style={[
                    styles.linkUrl, 
                    { color: colors.text + '80' },
                    !item.isActive && styles.inactiveText
                  ]}
                  numberOfLines={1}
                >
                  {item.url}
                </Text>
              </View>
              <View style={styles.linkActions}>
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={() => handleEdit(item)}
                >
                  <Ionicons name="pencil" size={20} color={colors.primary} />
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={() => handleDelete(item)}
                >
                  <Ionicons name="trash" size={20} color="#F44336" />
                </TouchableOpacity>
              </View>
            </View>
          )}
          contentContainerStyle={styles.listContent}
          refreshing={loading}
          onRefresh={fetchSocialLinks}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  errorText: {
    color: '#B71C1C',
    flex: 1,
  },
  retryText: {
    color: '#1976D2',
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  listContent: {
    paddingBottom: 16,
  },
  linkItem: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    alignItems: 'center',
  },
  linkIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  linkDetails: {
    flex: 1,
    marginLeft: 12,
  },
  linkName: {
    fontSize: 16,
    fontWeight: '500',
  },
  linkUrl: {
    fontSize: 14,
    marginTop: 4,
  },
  inactiveText: {
    opacity: 0.5,
  },
  linkActions: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
  },
});