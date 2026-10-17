import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { SafeAreaView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';

export default function NotificationsScreen() {
  const router = useRouter();
  
  const [notifyCheckIn, setNotifyCheckIn] = useState(true);
  const [notifyVoucher, setNotifyVoucher] = useState(true);
  const [notifySystem, setNotifySystem] = useState(false);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={24} color="#D4AF37" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Cài đặt thông báo</Text>
        <View style={{ width: 34 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.settingCard}>
          <View style={styles.settingRow}>
            <View>
              <Text style={styles.settingTitle}>Nhắc nhở Check-in GPS</Text>
              <Text style={styles.settingDesc}>Khi đến gần quán ăn dưới 30m</Text>
            </View>
            <Switch value={notifyCheckIn} onValueChange={setNotifyCheckIn} trackColor={{ false: '#332B25', true: '#D4AF37' }} thumbColor={notifyCheckIn ? '#FFF' : '#888'} />
          </View>
          
          <View style={styles.settingRow}>
            <View>
              <Text style={styles.settingTitle}>Ưu đãi & Voucher mới</Text>
              <Text style={styles.settingDesc}>Nhận thông báo khi có E-Voucher giảm giá</Text>
            </View>
            <Switch value={notifyVoucher} onValueChange={setNotifyVoucher} trackColor={{ false: '#332B25', true: '#D4AF37' }} thumbColor={notifyVoucher ? '#FFF' : '#888'} />
          </View>

          <View style={[styles.settingRow, { borderBottomWidth: 0 }]}>
            <View>
              <Text style={styles.settingTitle}>Thông báo hệ thống</Text>
              <Text style={styles.settingDesc}>Cập nhật phiên bản, điều khoản dịch vụ</Text>
            </View>
            <Switch value={notifySystem} onValueChange={setNotifySystem} trackColor={{ false: '#332B25', true: '#D4AF37' }} thumbColor={notifySystem ? '#FFF' : '#888'} />
          </View>
        </View>

        <TouchableOpacity style={styles.saveBtn} onPress={() => router.back()} activeOpacity={0.8}>
          <Text style={styles.saveBtnText}>LƯU CÀI ĐẶT</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#120F0D', maxWidth: 480, width: '100%', alignSelf: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 15, borderBottomWidth: 1, borderBottomColor: '#1E1A17' },
  backBtn: { padding: 5 }, headerTitle: { fontSize: 20, fontWeight: 'bold', fontFamily: 'serif', color: '#FFF' },
  content: { flex: 1, padding: 20 },
  settingCard: { backgroundColor: '#1E1A17', paddingHorizontal: 20, borderRadius: 24, borderWidth: 1, borderColor: '#332B25', marginBottom: 30 },
  settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 20, borderBottomWidth: 1, borderBottomColor: '#332B25' },
  settingTitle: { color: '#FFF', fontSize: 16, fontWeight: '500', marginBottom: 4 },
  settingDesc: { color: '#888', fontSize: 13, maxWidth: 220 },
  saveBtn: { backgroundColor: '#D4AF37', height: 55, borderRadius: 16, justifyContent: 'center', alignItems: 'center', shadowColor: '#D4AF37', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
  saveBtnText: { color: '#120F0D', fontSize: 16, fontWeight: 'bold', letterSpacing: 1 }
});