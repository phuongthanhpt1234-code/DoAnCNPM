import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Image, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// Dữ liệu giả lập cho Sổ tay yêu thích
const favoriteDishes = [
  { id: '1', name: 'Cao Lầu Hội An', category: 'Món Chính Cổ Truyền', isCheckIn: true, image: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?q=80' },
  { id: '3', name: 'Bánh Mì Phượng', category: 'Ăn Vặt & Streetfood', isCheckIn: false, image: 'https://images.unsplash.com/photo-1509722747041-616f39b57569?q=80' },
];

export default function FavoriteScreen() {
  const router = useRouter();
  const [favorites, setFavorites] = useState(favoriteDishes);

  const removeFavorite = (id: string) => setFavorites(favorites.filter(item => item.id !== id));

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={24} color="#D4AF37" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Sổ Tay Ẩm Thực</Text>
        <TouchableOpacity style={styles.searchBtn}><Ionicons name="search" size={22} color="#A9A9A9" /></TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.listContainer}>
        <Text style={styles.subTitle}>Các món đã lưu ({favorites.length})</Text>

        {favorites.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="book-outline" size={60} color="#332B25" />
            <Text style={styles.emptyText}>Sổ tay của bạn đang trống.</Text>
          </View>
        ) : (
          favorites.map((item) => (
            <TouchableOpacity key={item.id} style={styles.foodCard} activeOpacity={0.9} onPress={() => router.push({ pathname: '/map', params: { name: item.name }})}>
              <Image source={{ uri: item.image }} style={styles.cardImage} />
              
              <View style={styles.cardInfo}>
                <View>
                  <Text style={styles.cardCategory}>{item.category}</Text>
                  <Text style={styles.cardTitle}>{item.name}</Text>
                </View>
                
                <View style={styles.cardFooter}>
                  {item.isCheckIn ? (
                    <View style={styles.checkInBadge}>
                      <Ionicons name="checkmark-circle" size={14} color="#4CAF50" />
                      <Text style={styles.checkInText}>Đã Check-in</Text>
                    </View>
                  ) : (
                    <View style={styles.lockedBadge}>
                      <Ionicons name="lock-closed" size={14} color="#888" />
                      <Text style={styles.lockedText}>Chưa Check-in</Text>
                    </View>
                  )}
                </View>
              </View>

              <TouchableOpacity style={styles.heartBtn} onPress={() => removeFavorite(item.id)} activeOpacity={0.7}>
                <Ionicons name="heart" size={22} color="#8B2E2E" />
              </TouchableOpacity>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#120F0D', maxWidth: 480, width: '100%', alignSelf: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 15, borderBottomWidth: 1, borderBottomColor: '#1E1A17' },
  backBtn: { padding: 5 }, headerTitle: { fontSize: 20, fontWeight: 'bold', fontFamily: 'serif', color: '#D4AF37' }, searchBtn: { padding: 5 },
  listContainer: { paddingHorizontal: 20, paddingTop: 20 },
  subTitle: { color: '#A9A9A9', fontSize: 14, marginBottom: 15, fontStyle: 'italic' },
  emptyState: { alignItems: 'center', justifyContent: 'center', marginTop: 100 },
  emptyText: { color: '#A9A9A9', fontSize: 16, marginTop: 15 },
  foodCard: { flexDirection: 'row', backgroundColor: '#1E1A17', borderRadius: 16, marginBottom: 15, borderWidth: 1, borderColor: '#332B25', overflow: 'hidden', height: 110 },
  cardImage: { width: 110, height: '100%' },
  cardInfo: { flex: 1, padding: 15, justifyContent: 'space-between' },
  cardCategory: { fontSize: 10, color: '#D4AF37', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 },
  cardTitle: { fontSize: 17, fontWeight: 'bold', fontFamily: 'serif', color: '#FFF' },
  cardFooter: { flexDirection: 'row', alignItems: 'center' },
  checkInBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(76, 175, 80, 0.1)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  checkInText: { color: '#4CAF50', fontSize: 11, marginLeft: 4, fontWeight: 'bold' },
  lockedBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(136, 136, 136, 0.1)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  lockedText: { color: '#888', fontSize: 11, marginLeft: 4, fontWeight: 'bold' },
  heartBtn: { position: 'absolute', top: 10, right: 10, backgroundColor: 'rgba(30, 26, 23, 0.8)', borderRadius: 15, padding: 5 }
});