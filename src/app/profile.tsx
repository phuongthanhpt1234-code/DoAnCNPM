import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useGlobalSearchParams, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

type LangCode = 'vi' | 'en' | 'zh' | 'ko' | 'ja' | 'es' | 'ar';

function normalizeLang(raw?: string | null): LangCode {
  const code = (raw || '').split('-')[0].toLowerCase().trim();
  if (code === 'zh' || code === 'cn') return 'zh';
  if (code === 'ja' || code === 'jp') return 'ja';
  if (code === 'ko' || code === 'kr') return 'ko';
  if (code === 'en' || code === 'gb') return 'en';
  if (code === 'es') return 'es';
  if (code === 'ar') return 'ar';
  return 'vi';
}

const REGISTER_I18N: Record<LangCode, {
  brandTitle: string;
  welcomeText: string;
  nameLabel: string;
  namePlaceholder: string;
  emailLabel: string;
  emailPlaceholder: string;
  passwordLabel: string;
  passwordPlaceholder: string;
  confirmLabel: string;
  confirmPlaceholder: string;
  strengthPrefix: string;
  strengthNone: string;
  strengthWeak: string;
  strengthMedium: string;
  strengthStrong: string;
  registerBtn: string;
  hasAccountText: string;
  loginLink: string;
  errMissing: string;
  errEmail: string;
  errShortPass: string;
  errMismatch: string;
  errSystem: string;
  msgSuccess: string;
}> = {
  vi: {
    brandTitle: 'THEO DẤU VỊ HỘI',
    welcomeText: 'Lưu trữ huy hiệu Food-Trail & Thuyết minh đa ngôn ngữ',
    nameLabel: 'Họ và tên hiển thị',
    namePlaceholder: 'Ví dụ: Nguyễn Văn A',
    emailLabel: 'Địa chỉ Email',
    emailPlaceholder: 'Ví dụ: abc@gmail.com',
    passwordLabel: 'Mật khẩu bảo mật',
    passwordPlaceholder: 'Tối thiểu 6 ký tự',
    confirmLabel: 'Xác nhận mật khẩu',
    confirmPlaceholder: 'Nhập lại mật khẩu',
    strengthPrefix: 'Độ bảo mật:',
    strengthNone: 'Chưa nhập',
    strengthWeak: 'Yếu (Cần >= 6 ký tự)',
    strengthMedium: 'Khá an toàn',
    strengthStrong: 'Mạnh • Bảo mật cao',
    registerBtn: 'TẠO TÀI KHOẢN & VÀO NGAY',
    hasAccountText: 'Đã có tài khoản? ',
    loginLink: 'Đăng nhập ngay',
    errMissing: 'Vui lòng điền đầy đủ Họ tên, Email và Mật khẩu!',
    errEmail: 'Định dạng Email chưa hợp lệ!',
    errShortPass: 'Mật khẩu phải có ít nhất 6 ký tự!',
    errMismatch: 'Mật khẩu xác nhận không khớp!',
    errSystem: 'Lỗi hệ thống khi lưu tài khoản.',
    msgSuccess: 'Khởi tạo tài khoản thành công! Đang vào trang chủ...'
  },
  en: {
    brandTitle: 'THEO DẤU VỊ HỘI',
    welcomeText: 'Save Food-Trail badges & Multilingual audio guides',
    nameLabel: 'Display Name',
    namePlaceholder: 'e.g. Alex Nguyen',
    emailLabel: 'Email Address',
    emailPlaceholder: 'e.g. abc@gmail.com',
    passwordLabel: 'Security Password',
    passwordPlaceholder: 'Minimum 6 characters',
    confirmLabel: 'Confirm Password',
    confirmPlaceholder: 'Re-enter password',
    strengthPrefix: 'Security:',
    strengthNone: 'Not entered',
    strengthWeak: 'Weak (Need >= 6 chars)',
    strengthMedium: 'Good security',
    strengthStrong: 'Strong • High security',
    registerBtn: 'CREATE ACCOUNT & ENTER NOW',
    hasAccountText: 'Already have an account? ',
    loginLink: 'Sign in now',
    errMissing: 'Please fill in your Name, Email, and Password!',
    errEmail: 'Invalid email format!',
    errShortPass: 'Password must be at least 6 characters!',
    errMismatch: 'Confirmation password does not match!',
    errSystem: 'System error while saving account.',
    msgSuccess: 'Account created successfully! Redirecting...'
  },
  zh: {
    brandTitle: 'THEO DẤU VỊ HỘI',
    welcomeText: '保存美食寻宝徽章与多语言语音导览',
    nameLabel: '显示姓名',
    namePlaceholder: '例如：张伟 (Alex)',
    emailLabel: '电子邮箱地址',
    emailPlaceholder: '例如：abc@gmail.com',
    passwordLabel: '安全密码',
    passwordPlaceholder: '至少 6 个字符',
    confirmLabel: '确认密码',
    confirmPlaceholder: '请再次输入密码',
    strengthPrefix: '安全强度：',
    strengthNone: '未输入',
    strengthWeak: '较弱（需 >= 6 个字符）',
    strengthMedium: '中等安全',
    strengthStrong: '强 • 高安全性',
    registerBtn: '创建账号并立即进入',
    hasAccountText: '已有账号？ ',
    loginLink: '立即登录',
    errMissing: '请完整填写姓名、电子邮箱和密码！',
    errEmail: '电子邮箱格式无效！',
    errShortPass: '密码长度至少为 6 个字符！',
    errMismatch: '两次输入的密码不一致！',
    errSystem: '保存账号时发生系统错误。',
    msgSuccess: '账号创建成功！正在进入首页...'
  },
  ko: {
    brandTitle: 'THEO DẤU VỊ HỘI',
    welcomeText: '푸드트레일 배지 저장 및 다국어 음성 가이드',
    nameLabel: '표시 이름',
    namePlaceholder: '예: 홍길동',
    emailLabel: '이메일 주소',
    emailPlaceholder: '예: abc@gmail.com',
    passwordLabel: '보안 비밀번호',
    passwordPlaceholder: '최소 6자 이상',
    confirmLabel: '비밀번호 확인',
    confirmPlaceholder: '비밀번호 다시 입력',
    strengthPrefix: '보안 강도:',
    strengthNone: '미입력',
    strengthWeak: '약함 (6자 이상 필요)',
    strengthMedium: '양호함',
    strengthStrong: '강함 • 높은 보안',
    registerBtn: '계정 생성 및 바로 시작',
    hasAccountText: '이미 계정이 있으신가요? ',
    loginLink: '지금 로그인',
    errMissing: '이름, 이메일, 비밀번호를 모두 입력해 주세요!',
    errEmail: '유효하지 않은 이메일 형식입니다!',
    errShortPass: '비밀번호는 최소 6자 이상이어야 합니다!',
    errMismatch: '비밀번호 확인이 일치하지 않습니다!',
    errSystem: '계정 저장 중 시스템 오류가 발생했습니다.',
    msgSuccess: '계정 생성 완료! 홈으로 이동합니다...'
  },
  ja: {
    brandTitle: 'THEO DẤU VỊ HỘI',
    welcomeText: 'フードトレイルのバッジ保存＆多言語音声ガイド',
    nameLabel: '表示名（氏名）',
    namePlaceholder: '例：山田 太郎',
    emailLabel: 'メールアドレス',
    emailPlaceholder: '例：abc@gmail.com',
    passwordLabel: 'セキュリティパスワード',
    passwordPlaceholder: '6文字以上',
    confirmLabel: 'パスワード（確認）',
    confirmPlaceholder: 'パスワードを再入力',
    strengthPrefix: 'セキュリティ強度：',
    strengthNone: '未入力',
    strengthWeak: '弱い（6文字以上必要）',
    strengthMedium: 'やや安全',
    strengthStrong: '強い • 高セキュリティ',
    registerBtn: 'アカウントを作成して開始',
    hasAccountText: 'すでにアカウントをお持ちですか？ ',
    loginLink: '今すぐログイン',
    errMissing: '氏名、メールアドレス、パスワードをすべて入力してください！',
    errEmail: 'メールアドレスの形式が正しくありません！',
    errShortPass: 'パスワードは6文字以上で入力してください！',
    errMismatch: '確認用パスワードが一致しません！',
    errSystem: 'アカウント保存中にエラーが発生しました。',
    msgSuccess: 'アカウントを作成しました！ホームへ移動します...'
  },
  es: {
    brandTitle: 'THEO DẤU VỊ HỘI',
    welcomeText: 'Guarda insignias Food-Trail y guías de audio multilingües',
    nameLabel: 'Nombre para mostrar',
    namePlaceholder: 'ej. Juan Pérez',
    emailLabel: 'Correo Electrónico',
    emailPlaceholder: 'ej. abc@gmail.com',
    passwordLabel: 'Contraseña de seguridad',
    passwordPlaceholder: 'Mínimo 6 caracteres',
    confirmLabel: 'Confirmar contraseña',
    confirmPlaceholder: 'Vuelve a ingresar la contraseña',
    strengthPrefix: 'Seguridad:',
    strengthNone: 'Sin ingresar',
    strengthWeak: 'Débil (Mín. 6 caracteres)',
    strengthMedium: 'Seguridad media',
    strengthStrong: 'Fuerte • Alta seguridad',
    registerBtn: 'CREAR CUENTA Y ENTRAR',
    hasAccountText: '¿Ya tienes una cuenta? ',
    loginLink: 'Iniciar sesión',
    errMissing: '¡Por favor completa Nombre, Correo y Contraseña!',
    errEmail: '¡Formato de correo inválido!',
    errShortPass: '¡La contraseña debe tener al menos 6 caracteres!',
    errMismatch: '¡Las contraseñas no coinciden!',
    errSystem: 'Error del sistema al guardar la cuenta.',
    msgSuccess: '¡Cuenta creada con éxito!'
  },
  ar: {
    brandTitle: 'THEO DẤU VỊ HỘI',
    welcomeText: 'حفظ شارات مسار الطعام والدليل الصوتي متعدد اللغات',
    nameLabel: 'الاسم المعروض',
    namePlaceholder: 'مثال: أحمد محمد',
    emailLabel: 'البريد الإلكتروني',
    emailPlaceholder: 'مثال: abc@gmail.com',
    passwordLabel: 'كلمة المرور الأمنية',
    passwordPlaceholder: '6 أحرف على الأقل',
    confirmLabel: 'تأكيد كلمة المرور',
    confirmPlaceholder: 'أعد إدخال كلمة المرور',
    strengthPrefix: 'مستوى الأمان:',
    strengthNone: 'غير مدخل',
    strengthWeak: 'ضعيف (6 أحرف على الأقل)',
    strengthMedium: 'متوسط الأمان',
    strengthStrong: 'قوي • أمان عالٍ',
    registerBtn: 'إنشاء حساب والدخول الآن',
    hasAccountText: 'لديك حساب بالفعل؟ ',
    loginLink: 'تسجيل الدخول الآن',
    errMissing: 'يرجى ملء الاسم والبريد الإلكتروني وكلمة المرور!',
    errEmail: 'صيغة البريد الإلكتروني غير صالحة!',
    errShortPass: 'يجب أن تتكون كلمة المرور من 6 أحرف على الأقل!',
    errMismatch: 'كلمتا المرور غير متطابقتين!',
    errSystem: 'حدث خطأ أثناء حفظ الحساب.',
    msgSuccess: 'تم إنشاء الحساب بنجاح!'
  }
};

export default function RegisterScreen() {
  const router = useRouter();
  const localParams = useLocalSearchParams<{ lang?: string }>();
  const globalParams = useGlobalSearchParams<{ lang?: string }>();

  const [lang, setLang] = useState<LangCode>('vi');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const syncLanguage = useCallback(async () => {
    try {
      // 1. Ưu tiên đọc trực tiếp từ thanh URL trên Web (?lang=zh)
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        const urlLang = new URLSearchParams(window.location.search).get('lang');
        if (urlLang) {
          const norm = normalizeLang(urlLang);
          setLang(norm);
          await AsyncStorage.setItem('appLanguage', norm);
          return;
        }
      }
      // 2. Đọc từ params của Expo Router
      const paramLang = localParams.lang || globalParams.lang;
      if (paramLang) {
        const norm = normalizeLang(String(paramLang));
        setLang(norm);
        await AsyncStorage.setItem('appLanguage', norm);
        return;
      }
      // 3. Đọc từ bộ nhớ AsyncStorage
      const savedLang = await AsyncStorage.getItem('appLanguage');
      if (savedLang) {
        setLang(normalizeLang(savedLang));
      }
    } catch (e) {}
  }, [localParams.lang, globalParams.lang]);

  useFocusEffect(
    useCallback(() => {
      syncLanguage();
    }, [syncLanguage])
  );

  useEffect(() => {
    syncLanguage();
  }, [syncLanguage]);

  const ui = REGISTER_I18N[lang] || REGISTER_I18N.vi;

  const getPasswordStrength = () => {
    if (!password) return { label: ui.strengthNone, color: '#555', width: '0%' };
    if (password.length < 6) return { label: ui.strengthWeak, color: '#EF4444', width: '33%' };
    if (password.length < 9) return { label: ui.strengthMedium, color: '#F59E0B', width: '66%' };
    return { label: ui.strengthStrong, color: '#10B981', width: '100%' };
  };

  const handleRegister = async () => {
    setMessage('');
    if (!name.trim() || !email.trim() || !password) {
      setIsSuccess(false);
      setMessage(ui.errMissing);
      return;
    }
    if (!email.includes('@')) {
      setIsSuccess(false);
      setMessage(ui.errEmail);
      return;
    }
    if (password.length < 6) {
      setIsSuccess(false);
      setMessage(ui.errShortPass);
      return;
    }
    if (confirmPassword && password !== confirmPassword) {
      setIsSuccess(false);
      setMessage(ui.errMismatch);
      return;
    }
    
    try {
      const userData = { name: name.trim(), email: email.trim(), password };
      await AsyncStorage.setItem('userAccount', JSON.stringify(userData));
      
      setIsSuccess(true);
      setMessage(ui.msgSuccess);
      
      setTimeout(() => {
        router.replace({ pathname: '/' as any, params: { lang } });
      }, 900);
    } catch (error) {
      setIsSuccess(false);
      setMessage(ui.errSystem);
    }
  };

  const strength = getPasswordStrength();

  return (
    <SafeAreaView style={styles.screen}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.container}>

            <View style={styles.headerContainer}>
              <Text style={styles.logoTitle}>{ui.brandTitle}</Text>
              <Text style={styles.welcomeText}>{ui.welcomeText}</Text>
            </View>

            <View style={styles.formContainer}>
              <Text style={styles.inputLabel}>{ui.nameLabel}</Text>
              <View style={styles.inputBox}>
                <Ionicons name="person-outline" size={18} color="#D4AF37" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder={ui.namePlaceholder}
                  placeholderTextColor="#777"
                  value={name}
                  onChangeText={setName}
                />
              </View>

              <Text style={styles.inputLabel}>{ui.emailLabel}</Text>
              <View style={styles.inputBox}>
                <Ionicons name="mail-outline" size={18} color="#D4AF37" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder={ui.emailPlaceholder}
                  placeholderTextColor="#777"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                />
              </View>

              <Text style={styles.inputLabel}>{ui.passwordLabel}</Text>
              <View style={styles.inputBox}>
                <Ionicons name="lock-closed-outline" size={18} color="#D4AF37" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder={ui.passwordPlaceholder}
                  placeholderTextColor="#777"
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  value={password}
                  onChangeText={setPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Ionicons name={showPassword ? "eye-outline" : "eye-off-outline"} size={18} color="#D4AF37" />
                </TouchableOpacity>
              </View>

              {password.length > 0 && (
                <View style={styles.strengthBox}>
                  <View style={styles.strengthBarBg}>
                    <View style={[styles.strengthBarFill, { width: strength.width as any, backgroundColor: strength.color }]} />
                  </View>
                  <Text style={{ color: strength.color, fontSize: 11, fontWeight: 'bold', marginTop: 4 }}>
                    {ui.strengthPrefix} {strength.label}
                  </Text>
                </View>
              )}

              <Text style={styles.inputLabel}>{ui.confirmLabel}</Text>
              <View style={styles.inputBox}>
                <Ionicons name="shield-checkmark-outline" size={18} color="#D4AF37" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder={ui.confirmPlaceholder}
                  placeholderTextColor="#777"
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                />
              </View>

              {message ? (
                <View style={[styles.msgBox, { borderColor: isSuccess ? '#10B981' : '#F87171' }]}>
                  <Text style={{ color: isSuccess ? '#34D399' : '#F87171', fontSize: 13, fontWeight: 'bold', textAlign: 'center' }}>
                    {message}
                  </Text>
                </View>
              ) : null}

              <TouchableOpacity style={styles.registerBtn} onPress={handleRegister} activeOpacity={0.85}>
                <Text style={styles.registerBtnText}>{ui.registerBtn}</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.footer}>
              <Text style={styles.footerText}>{ui.hasAccountText}</Text>
              <TouchableOpacity onPress={() => router.push({ pathname: '/login' as any, params: { lang } })}>
                <Text style={styles.loginText}>{ui.loginLink}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#120F0D' },
  scrollContent: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 20, paddingVertical: 24 },
  container: { maxWidth: 440, width: '100%', alignSelf: 'center' },
  
  headerContainer: { alignItems: 'center', marginBottom: 20 },
  logoTitle: { fontSize: 28, fontWeight: '900', fontFamily: 'serif', color: '#D4AF37', letterSpacing: 2, textAlign: 'center' },
  welcomeText: { color: '#C2B8B0', marginTop: 6, fontSize: 13, textAlign: 'center' },

  formContainer: { width: '100%', backgroundColor: '#1C1815', padding: 24, borderRadius: 22, borderWidth: 1, borderColor: '#332B25' },
  inputLabel: { color: '#C2B8B0', fontSize: 12, fontWeight: 'bold', marginBottom: 6, marginLeft: 2 },
  inputBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#120F0D', borderWidth: 1, borderColor: '#332B25', borderRadius: 12, paddingHorizontal: 14, marginBottom: 14, height: 48 },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, color: '#FFF', fontSize: 14 },
  
  strengthBox: { marginBottom: 14, paddingHorizontal: 2 },
  strengthBarBg: { height: 5, backgroundColor: '#332B25', borderRadius: 3, overflow: 'hidden' },
  strengthBarFill: { height: '100%', borderRadius: 3 },

  msgBox: { padding: 10, borderRadius: 10, borderWidth: 1, backgroundColor: 'rgba(0,0,0,0.3)', marginBottom: 14 },
  registerBtn: { flexDirection: 'row', backgroundColor: '#D4AF37', height: 50, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginTop: 4 },
  registerBtnText: { color: '#120F0D', fontSize: 14, fontWeight: '900', letterSpacing: 0.6 },

  footer: { flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap', marginTop: 22 },
  footerText: { color: '#C2B8B0', fontSize: 13 },
  loginText: { color: '#D4AF37', fontSize: 13, fontWeight: 'bold', textDecorationLine: 'underline' }
});