import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Dimensions, KeyboardAvoidingView, Platform, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');

export default function EditProfileScreen() {
  const router = useRouter();
  
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [email, setEmail] = useState('');
  
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  // Lấy dữ liệu cũ hiển thị lên form
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const storedData = await AsyncStorage.getItem('userAccount');
        if (storedData) {
          const parsedData = JSON.parse(storedData);
          setName(parsedData.name || '');
          setBio(parsedData.bio || 'Khoa CNTT - Đại học Sài Gòn');
          setEmail(parsedData.email || '');
        }
      } catch (error) {
        console.log("Lỗi tải dữ liệu", error);
      }
    };
    loadUserData();
  }, []);

  // Hàm lưu thông tin mới
  const handleSave = async () => {
    setMessage('');
    if (!name.trim()) {
      setIsSuccess(false);
      setMessage('⚠️ Tên không được để trống!');
      return;
    }

    try {
      const storedData = await AsyncStorage.getItem('userAccount');
      const currentUser = storedData ? JSON.parse(storedData) : {};
      
      const updatedUser = {
        ...currentUser,
        name: name,
        bio: bio,
        email: email
      };
      
      await AsyncStorage.setItem('userAccount', JSON.stringify(updatedUser));
      
      setIsSuccess(true);
      setMessage('🎉 Đã cập nhật thành công!');
      
      setTimeout(() => {
        router.back();
      }, 1000);
      
    } catch (error) {
      setIsSuccess(false);
      setMessage('❌ Lỗi hệ thống khi lưu dữ liệu.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={24} color="#D4AF37" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chỉnh sửa thông tin</Text>
        <View style={{ width: 34 }} />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.content}>
        
        <View style={styles.formContainer}>
          <Text style={styles.label}>Họ và tên hiển thị</Text>
          <View style={styles.inputBox}>
            <Ionicons name="person-outline" size={20} color="#D4AF37" style={styles.inputIcon} />
            <TextInput style={styles.input} placeholder="Ví dụ: Trương Trí Trung" placeholderTextColor="#888" value={name} onChangeText={setName} />
          </View>

          <Text style={styles.label}>Chữ ký / Tiểu sử</Text>
          <View style={styles.inputBox}>
            <Ionicons name="information-circle-outline" size={20} color="#D4AF37" style={styles.inputIcon} />
            <TextInput style={styles.input} placeholder="Ví dụ: Khoa CNTT..." placeholderTextColor="#888" value={bio} onChangeText={setBio} />
          </View>

          <Text style={styles.label}>Email liên hệ (Không đổi mật khẩu)</Text>
          <View style={[styles.inputBox, { backgroundColor: '#181512' }]}>
            <Ionicons name="mail-outline" size={20} color="#888" style={styles.inputIcon} />
            <TextInput style={[styles.input, { color: '#A9A9A9' }]} value={email} editable={false} />
          </View>

          {message ? (
            <Text style={[styles.messageText, { color: isSuccess ? '#4CAF50' : '#FF6B6B' }]}>{message}</Text>
          ) : null}

          <TouchableOpacity style={styles.saveBtn} onPress={handleSave} activeOpacity={0.8}>
            <Text style={styles.saveBtnText}>LƯU THAY ĐỔI</Text>
          </TouchableOpacity>
        </View>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#120F0D', maxWidth: 480, width: '100%', alignSelf: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 15, borderBottomWidth: 1, borderBottomColor: '#1E1A17' },
  backBtn: { padding: 5 }, headerTitle: { fontSize: 20, fontWeight: 'bold', fontFamily: 'serif', color: '#FFF' },
  content: { flex: 1, padding: 20, justifyContent: 'center' },
  formContainer: { backgroundColor: '#1E1A17', padding: 25, borderRadius: 24, borderWidth: 1, borderColor: '#332B25', shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 15, elevation: 10 },
  label: { color: '#A9A9A9', fontSize: 13, marginBottom: 8, marginLeft: 5, fontWeight: 'bold' },
  inputBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#120F0D', borderWidth: 1, borderColor: '#332B25', borderRadius: 16, paddingHorizontal: 15, marginBottom: 20, height: 55 },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, color: '#FFF', fontSize: 16 },
  messageText: { textAlign: 'center', fontSize: 13, fontWeight: 'bold', marginBottom: 15 },
  saveBtn: { backgroundColor: '#D4AF37', height: 55, borderRadius: 16, justifyContent: 'center', alignItems: 'center', shadowColor: '#D4AF37', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
  saveBtnText: { color: '#120F0D', fontSize: 16, fontWeight: 'bold', letterSpacing: 1 }
});