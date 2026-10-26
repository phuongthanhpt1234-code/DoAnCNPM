import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import '../locales';

interface Language { id: string; name: string; subtitle: string; flag: string; }
const languages: Language[] = [
  { id: 'vi', name: 'Tiếng Việt', subtitle: 'Vietnamese', flag: '🇻🇳' },
  { id: 'en', name: 'English', subtitle: 'English (International)', flag: '🇬🇧' },
  { id: 'zh', name: '中文', subtitle: 'Chinese (Simplified)', flag: '🇨🇳' },
  { id: 'ko', name: '한국어', subtitle: 'Korean', flag: '🇰🇷' },
  { id: 'ja', name: '日本語', subtitle: 'Japanese', flag: '🇯🇵' },
  { id: 'es', name: 'Español', subtitle: 'Spanish', flag: '🇪🇸' },
  { id: 'ar', name: 'العربية', subtitle: 'Arabic', flag: '🇸🇦' },
];

export default function LanguageScreen() {
  const router = useRouter();
  const { i18n } = useTranslation();
  const [selectedLang, setSelectedLang] = useState<string>(i18n.language || 'vi');

  const handleApplyLanguage = async () => {
    await i18n.changeLanguage(selectedLang);
    await AsyncStorage.setItem('appLanguage', selectedLang);
    router.replace('/' as any);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.push('/' as any)} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={24} color="#D4AF37" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ngôn ngữ / Language</Text>
        <View style={{ width: 34 }} />
      </View>
      
      <ScrollView style={styles.listContainer} showsVerticalScrollIndicator={false}>
        {languages.map((lang) => (
          <TouchableOpacity 
            key={lang.id} 
            style={[styles.langCard, selectedLang === lang.id && styles.activeLangCard]} 
            activeOpacity={0.8} 
            onPress={() => setSelectedLang(lang.id)}
          >
            <View style={styles.langInfo}>
              <Text style={styles.flagIcon}>{lang.flag}</Text>
              <View>
                <Text style={styles.langName}>{lang.name}</Text>
                <Text style={styles.langSubtitle}>{lang.subtitle}</Text>
              </View>
            </View>
            <Ionicons 
              name={selectedLang === lang.id ? "checkmark-circle" : "ellipse-outline"} 
              size={24} 
              color={selectedLang === lang.id ? "#D4AF37" : "#555"} 
            />
          </TouchableOpacity>
        ))}
        <View style={{ height: 40 }} />
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.saveBtn} onPress={handleApplyLanguage} activeOpacity={0.8}>
          <Text style={styles.saveBtnText}>Áp dụng / Apply ({selectedLang.toUpperCase()})</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#120F0D', maxWidth: 480, width: '100%', alignSelf: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 15, borderBottomWidth: 1, borderBottomColor: '#1E1A17' },
  backBtn: { padding: 5 }, 
  headerTitle: { fontSize: 18, fontWeight: 'bold', fontFamily: 'serif', color: '#D4AF37' }, 
  listContainer: { paddingHorizontal: 20, paddingTop: 25, flex: 1 }, 
  langCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#1E1A17', padding: 15, borderRadius: 16, marginBottom: 14, borderWidth: 1, borderColor: '#332B25' }, 
  activeLangCard: { borderColor: '#D4AF37', backgroundColor: 'rgba(212, 175, 55, 0.12)' }, 
  langInfo: { flexDirection: 'row', alignItems: 'center' }, 
  flagIcon: { fontSize: 28, marginRight: 15 }, 
  langName: { fontSize: 16, fontWeight: 'bold', color: '#FFF', marginBottom: 3 }, 
  langSubtitle: { fontSize: 13, color: '#C2B8B0' }, 
  footer: { padding: 20, paddingBottom: 35 }, 
  saveBtn: { backgroundColor: '#D4AF37', paddingVertical: 15, borderRadius: 16, alignItems: 'center' }, 
  saveBtnText: { color: '#120F0D', fontSize: 16, fontWeight: 'bold', letterSpacing: 1 }
});