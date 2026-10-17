import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function SupportScreen() {
  const router = useRouter();
  const [feedback, setFeedback] = useState('');
  const [isSent, setIsSent] = useState(false);

  const handleSendFeedback = () => {
    if (!feedback.trim()) {
      Platform.OS === 'web' ? window.alert('Vui lòng nhập nội dung!') : alert('Vui lòng nhập nội dung!');
      return;
    }
    
    setIsSent(true);
    setTimeout(() => {
      router.back();
    }, 2000);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={24} color="#D4AF37" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Hỗ trợ & Góp ý</Text>
        <View style={{ width: 34 }} />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.content}>
        
        {isSent ? (
          <View style={styles.successBox}>
            <Ionicons name="checkmark-circle" size={80} color="#4CAF50" style={{ marginBottom: 15 }} />
            <Text style={styles.successTitle}>Cảm ơn bạn!</Text>
            <Text style={styles.successText}>Góp ý của bạn đã được gửi đến nhóm phát triển.</Text>
          </View>
        ) : (
          <View style={styles.formContainer}>
            <Text style={styles.descText}>Bạn đang gặp lỗi hoặc muốn thêm món ăn nào vào ứng dụng? Hãy báo cho chúng mình biết nhé!</Text>
            
            <View style={styles.textAreaBox}>
              <TextInput 
                style={styles.textArea} 
                placeholder="Nhập nội dung góp ý của bạn..." 
                placeholderTextColor="#888" 
                multiline={true} 
                numberOfLines={6} 
                textAlignVertical="top"
                value={feedback} 
                onChangeText={setFeedback} 
              />
            </View>

            <TouchableOpacity style={styles.sendBtn} onPress={handleSendFeedback} activeOpacity={0.8}>
              <Ionicons name="paper-plane-outline" size={20} color="#120F0D" style={{ marginRight: 8 }} />
              <Text style={styles.sendBtnText}>GỬI GÓP Ý</Text>
            </TouchableOpacity>
          </View>
        )}

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#120F0D', maxWidth: 480, width: '100%', alignSelf: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 15, borderBottomWidth: 1, borderBottomColor: '#1E1A17' },
  backBtn: { padding: 5 }, headerTitle: { fontSize: 20, fontWeight: 'bold', fontFamily: 'serif', color: '#FFF' },
  content: { flex: 1, padding: 20, justifyContent: 'center' },
  
  formContainer: { backgroundColor: '#1E1A17', padding: 25, borderRadius: 24, borderWidth: 1, borderColor: '#332B25' },
  descText: { color: '#A9A9A9', fontSize: 14, lineHeight: 22, marginBottom: 20, fontStyle: 'italic' },
  textAreaBox: { backgroundColor: '#120F0D', borderWidth: 1, borderColor: '#332B25', borderRadius: 16, padding: 15, marginBottom: 20 },
  textArea: { color: '#FFF', fontSize: 16, height: 120 },
  
  sendBtn: { flexDirection: 'row', backgroundColor: '#D4AF37', height: 55, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  sendBtnText: { color: '#120F0D', fontSize: 16, fontWeight: 'bold', letterSpacing: 1 },

  successBox: { alignItems: 'center', padding: 30, backgroundColor: '#1E1A17', borderRadius: 24, borderWidth: 1, borderColor: '#332B25' },
  successTitle: { color: '#D4AF37', fontSize: 24, fontWeight: 'bold', fontFamily: 'serif', marginBottom: 10 },
  successText: { color: '#A9A9A9', fontSize: 15, textAlign: 'center', lineHeight: 24 }
});