import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function SecurityScreen() {
  const router = useRouter();
  
  const [oldPass, setOldPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [showPass, setShowPass] = useState(false);
  
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleChangePassword = async () => {
    setMessage('');
    if (!oldPass || !newPass || !confirmPass) {
      setIsSuccess(false);
      setMessage('⚠️ Vui lòng điền đủ thông tin!');
      return;
    }
    if (newPass !== confirmPass) {
      setIsSuccess(false);
      setMessage('❌ Mật khẩu xác nhận không khớp!');
      return;
    }

    try {
      const storedData = await AsyncStorage.getItem('userAccount');
      if (storedData) {
        const userData = JSON.parse(storedData);
        if (userData.password !== oldPass) {
          setIsSuccess(false);
          setMessage('❌ Mật khẩu cũ không chính xác!');
          return;
        }

        userData.password = newPass;
        await AsyncStorage.setItem('userAccount', JSON.stringify(userData));
        
        setIsSuccess(true);
        setMessage('🎉 Đổi mật khẩu thành công!');
        setTimeout(() => router.back(), 1500);
      }
    } catch (error) {
      setIsSuccess(false);
      setMessage('❌ Lỗi hệ thống!');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={24} color="#D4AF37" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Bảo mật & Mật khẩu</Text>
        <View style={{ width: 34 }} />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.content}>
        <View style={styles.formContainer}>
          
          <Text style={styles.label}>Mật khẩu hiện tại</Text>
          <View style={styles.inputBox}>
            <Ionicons name="lock-closed-outline" size={20} color="#888" style={styles.inputIcon} />
            <TextInput style={styles.input} placeholder="Nhập mật khẩu cũ" placeholderTextColor="#888" secureTextEntry={!showPass} value={oldPass} onChangeText={setOldPass} />
          </View>

          <Text style={styles.label}>Mật khẩu mới</Text>
          <View style={styles.inputBox}>
            <Ionicons name="shield-checkmark-outline" size={20} color="#D4AF37" style={styles.inputIcon} />
            <TextInput style={styles.input} placeholder="Nhập mật khẩu mới" placeholderTextColor="#888" secureTextEntry={!showPass} value={newPass} onChangeText={setNewPass} />
          </View>

          <Text style={styles.label}>Xác nhận mật khẩu mới</Text>
          <View style={styles.inputBox}>
            <Ionicons name="checkmark-circle-outline" size={20} color="#D4AF37" style={styles.inputIcon} />
            <TextInput style={styles.input} placeholder="Nhập lại mật khẩu mới" placeholderTextColor="#888" secureTextEntry={!showPass} value={confirmPass} onChangeText={setConfirmPass} />
            <TouchableOpacity onPress={() => setShowPass(!showPass)}>
              <Ionicons name={showPass ? "eye-outline" : "eye-off-outline"} size={20} color="#888" />
            </TouchableOpacity>
          </View>

          {message ? <Text style={[styles.messageText, { color: isSuccess ? '#4CAF50' : '#FF6B6B' }]}>{message}</Text> : null}

          <TouchableOpacity style={styles.saveBtn} onPress={handleChangePassword} activeOpacity={0.8}>
            <Text style={styles.saveBtnText}>CẬP NHẬT MẬT KHẨU</Text>
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
  inputIcon: { marginRight: 12 }, input: { flex: 1, color: '#FFF', fontSize: 16 },
  messageText: { textAlign: 'center', fontSize: 13, fontWeight: 'bold', marginBottom: 15 },
  saveBtn: { backgroundColor: '#D4AF37', height: 55, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  saveBtnText: { color: '#120F0D', fontSize: 16, fontWeight: 'bold', letterSpacing: 1 }
});