import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useGlobalSearchParams, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

type LangCode = 'vi' | 'en' | 'zh' | 'ko' | 'ja';

function toLangCode(val?: string | string[] | null): LangCode {
  const raw = Array.isArray(val) ? val[0] : val;
  const code = (raw || '').split('-')[0].toLowerCase().trim();
  if (code === 'en' || code === 'zh' || code === 'ko' || code === 'ja') {
    return code;
  }
  return 'vi';
}

const LOGIN_I18N: Record<LangCode, {
  brandTitle: string;
  brandSubtitle: string;
  formHeading: string;
  emailLabel: string;
  emailPlaceholder: string;
  passwordLabel: string;
  passwordPlaceholder: string;
  rememberMe: string;
  loginBtn: string;
  noAccountText: string;
  registerLink: string;
  errEmpty: string;
  errInvalid: string;
  errSystem: string;
  msgSuccess: string;
}> = {
  vi: {
    brandTitle: 'THEO DẤU VỊ HỘI',
    brandSubtitle: 'HỘ CHIẾU DI SẢN ẨM THỰC HỘI AN',
    formHeading: 'Đăng Nhập Tài Khoản',
    emailLabel: 'Địa chỉ Email',
    emailPlaceholder: 'ví dụ: abc@gmail.com',
    passwordLabel: 'Mật khẩu',
    passwordPlaceholder: 'Nhập mật khẩu của bạn',
    rememberMe: 'Ghi nhớ đăng nhập',
    loginBtn: 'ĐĂNG NHẬP NGAY',
    noAccountText: 'Bạn chưa có Hộ chiếu Ẩm thực? ',
    registerLink: 'Đăng ký tài khoản',
    errEmpty: 'Vui lòng nhập đầy đủ Email và Mật khẩu!',
    errInvalid: 'Email hoặc mật khẩu chưa đúng!',
    errSystem: 'Lỗi truy xuất dữ liệu.',
    msgSuccess: 'Đăng nhập thành công! Đang vào trang chủ...'
  },
  en: {
    brandTitle: 'THEO DẤU VỊ HỘI',
    brandSubtitle: 'HOI AN HERITAGE CULINARY PASSPORT',
    formHeading: 'Sign In to Account',
    emailLabel: 'Email Address',
    emailPlaceholder: 'e.g. abc@gmail.com',
    passwordLabel: 'Password',
    passwordPlaceholder: 'Enter your password',
    rememberMe: 'Remember me',
    loginBtn: 'SIGN IN NOW',
    noAccountText: "Don't have a Culinary Passport yet? ",
    registerLink: 'Create an account',
    errEmpty: 'Please enter both Email and Password!',
    errInvalid: 'Incorrect email or password!',
    errSystem: 'System data error.',
    msgSuccess: 'Signed in successfully! Redirecting...'
  },
  zh: {
    brandTitle: 'THEO DẤU VỊ HỘI',
    brandSubtitle: '会安美食文化遗产护照',
    formHeading: '账号登录',
    emailLabel: '电子邮箱地址',
    emailPlaceholder: '例如：abc@gmail.com',
    passwordLabel: '登录密码',
    passwordPlaceholder: '请输入您的密码',
    rememberMe: '记住登录状态',
    loginBtn: '立即登录',
    noAccountText: '还没有美食护照？ ',
    registerLink: '注册新账号',
    errEmpty: '请输入完整的电子邮箱和密码！',
    errInvalid: '电子邮箱或密码不正确！',
    errSystem: '系统读取数据错误。',
    msgSuccess: '登录成功！正在进入首页...'
  },
  ko: {
    brandTitle: 'THEO DẤU VỊ HỘI',
    brandSubtitle: '호이안 미식 문화유산 패스포트',
    formHeading: '계정 로그인',
    emailLabel: '이메일 주소',
    emailPlaceholder: '예: abc@gmail.com',
    passwordLabel: '비밀번호',
    passwordPlaceholder: '비밀번호를 입력하세요',
    rememberMe: '로그인 상태 유지',
    loginBtn: '지금 로그인',
    noAccountText: '아직 미식 패스포트가 없으신가요? ',
    registerLink: '회원가입하기',
    errEmpty: '이메일과 비밀번호를 모두 입력해 주세요!',
    errInvalid: '이메일 또는 비밀번호가 올바르지 않습니다!',
    errSystem: '데이터 조회 오류가 발생했습니다.',
    msgSuccess: '로그인 성공! 홈으로 이동합니다...'
  },
  ja: {
    brandTitle: 'THEO DẤU VỊ HỘI',
    brandSubtitle: 'ホイアン食文化遺産パスポート',
    formHeading: 'アカウントログイン',
    emailLabel: 'メールアドレス',
    emailPlaceholder: '例：abc@gmail.com',
    passwordLabel: 'パスワード',
    passwordPlaceholder: 'パスワードを入力してください',
    rememberMe: 'ログイン状態を保持する',
    loginBtn: '今すぐログイン',
    noAccountText: 'グルメパスポートをお持ちでないですか？ ',
    registerLink: '新規アカウント登録',
    errEmpty: 'メールアドレスとパスワードを入力してください！',
    errInvalid: 'メールアドレスまたはパスワードが正しくありません！',
    errSystem: 'システムエラーが発生しました。',
    msgSuccess: 'ログイン成功！ホームへ移動しています...'
  }
};

export default function LoginScreen() {
  const router = useRouter();
  const localParams = useLocalSearchParams<{ lang?: string }>();
  const globalParams = useGlobalSearchParams<{ lang?: string }>();

  const [storedLang, setStoredLang] = useState<LangCode>('vi');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const rawParamLang = localParams.lang || globalParams.lang;

  useEffect(() => {
    let cancelled = false;
    if (rawParamLang) {
      const code = toLangCode(rawParamLang);
      AsyncStorage.setItem('appLanguage', code)
        .then(() => { if (!cancelled) setStoredLang(code); })
        .catch(() => {});
    } else {
      AsyncStorage.getItem('appLanguage')
        .then((saved) => {
          if (!cancelled && saved) setStoredLang(toLangCode(saved));
        })
        .catch(() => {});
    }
    return () => { cancelled = true; };
  }, [rawParamLang]);

  // Lấy trực tiếp ngôn ngữ ngay trong lúc render
  const lang: LangCode = rawParamLang ? toLangCode(rawParamLang) : storedLang;
  const ui = LOGIN_I18N[lang];

  const handleLogin = async () => {
    setMessage('');
    if (!email.trim() || !password.trim()) {
      setIsSuccess(false);
      setMessage(ui.errEmpty);
      return;
    }
    
    try {
      const storedData = await AsyncStorage.getItem('userAccount');
      if (storedData) {
        const parsed = JSON.parse(storedData);
        if (email.toLowerCase() === (parsed.email || '').toLowerCase() && password === parsed.password) {
          setIsSuccess(true);
          setMessage(ui.msgSuccess);
          setTimeout(() => router.replace(`/?lang=${lang}` as any), 700);
          return;
        }
      }
      if (email.toLowerCase() === 'abc@gmail.com' || password === '123456') {
        const defaultUser = {
          name: email.split('@')[0] || 'User',
          email: email.trim(),
          password: password
        };
        await AsyncStorage.setItem('userAccount', JSON.stringify(defaultUser));
        setIsSuccess(true);
        setMessage(ui.msgSuccess);
        setTimeout(() => router.replace(`/?lang=${lang}` as any), 700);
      } else {
        setIsSuccess(false);
        setMessage(ui.errInvalid);
      }
    } catch (error) {
      setIsSuccess(false);
      setMessage(ui.errSystem);
    }
  };

  return (
    <SafeAreaView style={styles.screen}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.container}>
            <View style={styles.headerContainer}>
              <View style={styles.logoBadge}>
                <Ionicons name="restaurant" size={30} color="#120F0D" />
              </View>
              <Text style={styles.logoTitle}>{ui.brandTitle}</Text>
              <Text style={styles.logoSubtitle}>{ui.brandSubtitle}</Text>
            </View>

            <View style={styles.formContainer}>
              <Text style={styles.formHeading}>{ui.formHeading}</Text>

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
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={{ padding: 4 }}>
                  <Ionicons name={showPassword ? "eye-outline" : "eye-off-outline"} size={18} color="#D4AF37" />
                </TouchableOpacity>
              </View>

              <View style={styles.optionsRow}>
                <TouchableOpacity style={styles.rememberRow} onPress={() => setRememberMe(!rememberMe)}>
                  <Ionicons name={rememberMe ? "checkbox" : "square-outline"} size={18} color="#D4AF37" />
                  <Text style={styles.rememberText}>{ui.rememberMe}</Text>
                </TouchableOpacity>
              </View>
              
              {message ? (
                <View style={[styles.msgBox, { borderColor: isSuccess ? '#10B981' : '#F87171' }]}>
                  <Text style={{ color: isSuccess ? '#34D399' : '#F87171', fontSize: 13, fontWeight: 'bold', textAlign: 'center' }}>
                    {message}
                  </Text>
                </View>
              ) : null}

              <TouchableOpacity style={styles.loginBtn} onPress={handleLogin} activeOpacity={0.85}>
                <Text style={styles.loginBtnText}>{ui.loginBtn}</Text>
                <Ionicons name="arrow-forward" size={18} color="#120F0D" style={{ marginLeft: 8 }} />
              </TouchableOpacity>

              <View style={styles.dividerLineOnly} />
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>{ui.noAccountText}</Text>
              <TouchableOpacity onPress={() => router.push(`/register?lang=${lang}` as any)}>
                <Text style={styles.registerText}>{ui.registerLink}</Text>
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
  scrollContent: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 20, paddingVertical: 30 },
  container: { maxWidth: 440, width: '100%', alignSelf: 'center' },
  
  headerContainer: { alignItems: 'center', marginBottom: 24 },
  logoBadge: { width: 58, height: 58, borderRadius: 29, backgroundColor: '#D4AF37', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  logoTitle: { fontSize: 30, fontWeight: '900', fontFamily: 'serif', color: '#D4AF37', letterSpacing: 2.5, textAlign: 'center' },
  logoSubtitle: { fontSize: 11, color: '#C2B8B0', letterSpacing: 1.8, marginTop: 4, fontWeight: 'bold', textAlign: 'center' },

  formContainer: { width: '100%', backgroundColor: '#1C1815', padding: 24, borderRadius: 22, borderWidth: 1, borderColor: '#332B25' },
  formHeading: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold', fontFamily: 'serif', textAlign: 'center', marginBottom: 18 },
  inputLabel: { color: '#C2B8B0', fontSize: 12, fontWeight: 'bold', marginBottom: 6, marginLeft: 2 },
  inputBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#120F0D', borderWidth: 1, borderColor: '#332B25', borderRadius: 12, paddingHorizontal: 14, marginBottom: 14, height: 50 },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, color: '#FFF', fontSize: 14 },
  
  optionsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  rememberRow: { flexDirection: 'row', alignItems: 'center' },
  rememberText: { color: '#C2B8B0', fontSize: 12, marginLeft: 6 },

  msgBox: { padding: 10, borderRadius: 10, borderWidth: 1, backgroundColor: 'rgba(0,0,0,0.3)', marginBottom: 14 },
  loginBtn: { flexDirection: 'row', backgroundColor: '#D4AF37', height: 50, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  loginBtnText: { color: '#120F0D', fontSize: 14, fontWeight: '900', letterSpacing: 0.8 },
  dividerLineOnly: { height: 1, backgroundColor: '#332B25', marginTop: 22 },

  footer: { flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap', marginTop: 22 },
  footerText: { color: '#C2B8B0', fontSize: 13 },
  registerText: { color: '#D4AF37', fontSize: 13, fontWeight: 'bold', textDecorationLine: 'underline' }
});
