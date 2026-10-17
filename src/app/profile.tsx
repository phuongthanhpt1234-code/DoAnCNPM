import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Image, Modal, Platform, SafeAreaView, ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=400&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1527980965255-d3b416303d12?q=80&w=400&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=400&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=400&auto=format&fit=crop',
];

export default function ProfileScreen() {
  const router = useRouter();
  const { i18n } = useTranslation();

  const [isDarkMode, setIsDarkMode] = useState(true);
  const [activeTab, setActiveTab] = useState<'main' | 'edit' | 'notifications' | 'security' | 'support'>('main');
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  const [user, setUser] = useState({
    name: "Trương Trí Trung",
    bio: "Khoa CNTT - Đại học Sài Gòn",
    avatar: AVATAR_PRESETS[0],
    email: "tritrungbaclieu@gmail.com"
  });

  const [checkedInCount, setCheckedInCount] = useState<number>(3);
  const [solvedCluesCount, setSolvedCluesCount] = useState<number>(1);

  // State cho Chỉnh sửa hồ sơ
  const [editName, setEditName] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editAvatar, setEditAvatar] = useState(AVATAR_PRESETS[0]);
  const [statusMsg, setStatusMsg] = useState('');

  // State cho Cài đặt thông báo chuyên sâu
  const [notifyRadar20m, setNotifyRadar20m] = useState(true);
  const [notifyAgentLetter, setNotifyAgentLetter] = useState(true);
  const [notifyAutoAiVoice, setNotifyAutoAiVoice] = useState(true);
  const [notifyPedestrianHours, setNotifyPedestrianHours] = useState(false);

  // State cho Bảo mật mật khẩu
  const [oldPass, setOldPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');

  // State cho Hỗ trợ & Đóng góp quán ngon
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    const loadProfileData = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem('appThemeMode');
        if (savedTheme !== null) setIsDarkMode(savedTheme === 'dark');

        const storedData = await AsyncStorage.getItem('userAccount');
        if (storedData) {
          const parsed = JSON.parse(storedData);
          const loadedName = parsed.name || "Trương Trí Trung";
          const loadedBio = parsed.bio || "Thực Khách Sành Ăn • Hội An";
          const loadedAvatar = parsed.avatar || AVATAR_PRESETS[0];
          setUser({
            name: loadedName,
            bio: loadedBio,
            avatar: loadedAvatar,
            email: parsed.email || "tritrungbaclieu@gmail.com"
          });
          setEditName(loadedName);
          setEditBio(loadedBio);
          setEditAvatar(loadedAvatar);
        } else {
          setEditName(user.name);
          setEditBio(user.bio);
        }

        const savedCheckIns = await AsyncStorage.getItem('checkedInDishIds');
        if (savedCheckIns) {
          const arr = JSON.parse(savedCheckIns);
          setCheckedInCount(Array.isArray(arr) ? arr.length : 3);
        }

        const savedClues = await AsyncStorage.getItem('solvedSecretClues');
        if (savedClues) {
          const arr = JSON.parse(savedClues);
          setSolvedCluesCount(Array.isArray(arr) ? arr.length : 1);
        }
      } catch (e) {}
    };
    loadProfileData();
  }, []);

  const toggleTheme = async () => {
    const nextMode = !isDarkMode;
    setIsDarkMode(nextMode);
    await AsyncStorage.setItem('appThemeMode', nextMode ? 'dark' : 'light');
  };

  const handleSaveProfile = async () => {
    if (!editName.trim()) {
      setStatusMsg('⚠️ Họ và tên không được để trống!');
      return;
    }
    const storedData = await AsyncStorage.getItem('userAccount');
    const current = storedData ? JSON.parse(storedData) : {};
    const updated = { ...current, name: editName.trim(), bio: editBio.trim(), avatar: editAvatar, email: user.email };
    await AsyncStorage.setItem('userAccount', JSON.stringify(updated));
    setUser(prev => ({ ...prev, name: editName.trim(), bio: editBio.trim(), avatar: editAvatar }));
    setStatusMsg('🎉 Đã cập nhật Hồ sơ Di sản thành công!');
    setTimeout(() => { setStatusMsg(''); setActiveTab('main'); }, 900);
  };

  const handleSavePassword = async () => {
    if (!oldPass || !newPass || !confirmPass) {
      setStatusMsg('⚠️ Vui lòng điền đầy đủ các trường mật khẩu!');
      return;
    }
    if (newPass.length < 6) {
      setStatusMsg('⚠️ Mật khẩu mới cần ít nhất 6 ký tự!');
      return;
    }
    if (newPass !== confirmPass) {
      setStatusMsg('❌ Mật khẩu xác nhận không khớp!');
      return;
    }
    const storedData = await AsyncStorage.getItem('userAccount');
    const current = storedData ? JSON.parse(storedData) : {};
    current.password = newPass;
    await AsyncStorage.setItem('userAccount', JSON.stringify(current));
    setOldPass(''); setNewPass(''); setConfirmPass('');
    setStatusMsg('🎉 Đổi mật khẩu bảo mật thành công!');
    setTimeout(() => { setStatusMsg(''); setActiveTab('main'); }, 900);
  };

  const handleSendSupport = () => {
    if (!feedback.trim()) {
      setStatusMsg('⚠️ Vui lòng nhập nội dung góp ý hoặc tọa độ quán!');
      return;
    }
    setFeedback('');
    setStatusMsg('🎉 Cảm ơn bạn! Đóng góp đã được gửi tới đội ngũ Theo Dấu Vị Hội.');
    setTimeout(() => { setStatusMsg(''); setActiveTab('main'); }, 1100);
  };

  const handleLogout = async () => {
    if (Platform.OS === 'web') {
      if (window.confirm("Bạn có chắc chắn muốn đăng xuất khỏi Hộ chiếu Ẩm thực?")) {
        await AsyncStorage.removeItem('userAccount');
        router.replace('/login' as any);
      }
    } else {
      Alert.alert('Đăng xuất', 'Bạn có chắc chắn muốn đăng xuất?', [
        { text: 'Hủy', style: 'cancel' },
        { text: 'Đồng ý', onPress: async () => { await AsyncStorage.removeItem('userAccount'); router.replace('/login' as any); } }
      ]);
    }
  };

  const totalXp = checkedInCount * 200 + solvedCluesCount * 250 + 400;

  const theme = {
    bg: isDarkMode ? '#120F0D' : '#F6F3EC',
    cardBg: isDarkMode ? '#1C1815' : '#FFFFFF',
    subBg: isDarkMode ? '#14110F' : '#EFECE4',
    textMain: isDarkMode ? '#FFFFFF' : '#18181B',
    textSub: isDarkMode ? '#B8B0A8' : '#4B5563',
    accent: isDarkMode ? '#D4AF37' : '#8C5E0A',
    green: isDarkMode ? '#10B981' : '#047857',
    greenBg: isDarkMode ? 'rgba(16, 185, 129, 0.14)' : '#ECFDF5',
    border: isDarkMode ? '#302924' : '#E2DCD0',
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      
      {/* HEADER ĐỒNG BỘ THƯƠNG HIỆU THEO DẤU VỊ HỘI */}
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <TouchableOpacity 
          style={[styles.iconCircle, { backgroundColor: theme.cardBg, borderColor: theme.border }]} 
          onPress={() => activeTab === 'main' ? router.push('/' as any) : (setStatusMsg(''), setActiveTab('main'))}
        >
          <Ionicons name="chevron-back" size={20} color={theme.accent} />
        </TouchableOpacity>
        
        <View style={{ alignItems: 'center' }}>
          <Text style={[styles.brandMiniTitle, { color: theme.accent }]}>THEO DẤU VỊ HỘI</Text>
          <Text style={[styles.headerTitle, { color: theme.textMain }]}>
            {activeTab === 'main' ? 'Hộ Chiếu Cá Nhân' : 
             activeTab === 'edit' ? 'Chỉnh Sửa Hồ Sơ' :
             activeTab === 'notifications' ? 'Cài Đặt Thông Báo' :
             activeTab === 'security' ? 'Bảo Mật & Mật Khẩu' : 'Hỗ Trợ & Đóng Góp'}
          </Text>
        </View>
        
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity style={[styles.iconCircle, { backgroundColor: theme.cardBg, borderColor: theme.border }]} onPress={toggleTheme}>
            <Ionicons name={isDarkMode ? "sunny" : "moon"} size={19} color={theme.accent} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.iconCircle, { backgroundColor: theme.cardBg, borderColor: theme.border, marginLeft: 6 }]} onPress={() => setShowSettingsModal(true)}>
            <Ionicons name="settings-outline" size={19} color={theme.textMain} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
        {activeTab === 'main' && (
          <>
            {/* THẺ HỘ CHIẾU DI SẢN CÁ NHÂN ĐỒNG BỘ VỚI TRANG CHÍNH */}
            <View style={[styles.passportHeroCard, { backgroundColor: theme.cardBg, borderColor: theme.accent }]}>
              <View style={styles.passportTopBadgeRow}>
                <View style={[styles.gpsStatusPill, { backgroundColor: theme.greenBg, borderColor: theme.green }]}>
                  <Ionicons name="radio" size={12} color={theme.green} />
                  <Text style={{ color: theme.green, fontSize: 10, fontWeight: '900', marginLeft: 4 }}>
                    ĐỒNG BỘ GPS TOÀN QUỐC & HỘI AN (20M)
                  </Text>
                </View>
                <Text style={{ color: theme.accent, fontSize: 11, fontWeight: 'bold' }}>ID #HA-2026</Text>
              </View>

              <View style={styles.profileRow}>
                <View style={styles.avatarContainer}>
                  <Image source={{ uri: user.avatar }} style={[styles.avatar, { borderColor: theme.accent }]} />
                  <TouchableOpacity style={styles.editAvatarBadge} onPress={() => setActiveTab('edit')}>
                    <Ionicons name="camera" size={13} color="#FFF" />
                  </TouchableOpacity>
                </View>

                <View style={{ flex: 1, marginLeft: 16 }}>
                  <Text style={[styles.userName, { color: theme.textMain }]} numberOfLines={1}>{user.name}</Text>
                  <Text style={[styles.userBio, { color: theme.textSub }]} numberOfLines={1}>{user.bio}</Text>
                  <Text style={[styles.userEmail, { color: theme.textSub }]} numberOfLines={1}>{user.email}</Text>

                  <View style={styles.levelBadge}>
                    <Ionicons name="medal" size={14} color="#120F0D" />
                    <Text style={styles.levelText}>Đại Sứ Thực Khách Sành Ăn</Text>
                  </View>
                </View>
              </View>

              {/* THỐNG KÊ ĐỒNG BỘ 25 MÓN & HỘP THƯ MẬT */}
              <View style={[styles.statsContainer, { backgroundColor: theme.subBg, borderColor: theme.border }]}>
                <View style={styles.statBox}>
                  <Text style={[styles.statNumber, { color: theme.accent }]}>{totalXp}</Text>
                  <Text style={[styles.statLabel, { color: theme.textSub }]}>Điểm XP (X2)</Text>
                </View>
                <View style={[styles.statDivider, { backgroundColor: theme.border }]} />
                <View style={styles.statBox}>
                  <Text style={[styles.statNumber, { color: theme.green }]}>{checkedInCount}/25</Text>
                  <Text style={[styles.statLabel, { color: theme.textSub }]}>Món Check-in</Text>
                </View>
                <View style={[styles.statDivider, { backgroundColor: theme.border }]} />
                <View style={styles.statBox}>
                  <Text style={[styles.statNumber, { color: theme.accent }]}>{solvedCluesCount}/3</Text>
                  <Text style={[styles.statLabel, { color: theme.textSub }]}>Mật thư AI</Text>
                </View>
              </View>
            </View>

            {/* BỘ SƯU TẬP HUY HIỆU & ĐẶC QUYỀN HỘI AN */}
            <View style={styles.sectionBlock}>
              <View style={styles.sectionHeaderRow}>
                <Text style={[styles.menuSectionTitle, { color: theme.textSub }]}>HUY HIỆU & ĐẶC QUYỀN ĐÃ MỞ</Text>
                <TouchableOpacity onPress={() => router.push('/explore' as any)}>
                  <Text style={{ color: theme.accent, fontSize: 12, fontWeight: 'bold' }}>Mở Food-Trail ➔</Text>
                </TouchableOpacity>
              </View>

              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {[
                  { icon: '🏅', name: 'Nghệ Nhân Giếng Cổ', sub: '+450 XP • Đã mở' },
                  { icon: '🏮', name: 'Thực Thần Phố Đêm', sub: 'X2 Điểm Hội An' },
                  { icon: '✉️', name: 'Thợ Săn Hẻm Sâu', sub: 'Giải mật thư Agent AI' },
                  { icon: '🎫', name: 'Voucher HOIANVIP', sub: 'Giảm 30% Đối tác' },
                ].map((b, i) => (
                  <TouchableOpacity 
                    key={i} 
                    style={[styles.badgeMiniCard, { backgroundColor: theme.cardBg, borderColor: theme.border }]}
                    onPress={() => router.push('/explore' as any)}
                  >
                    <Text style={{ fontSize: 22, marginBottom: 4 }}>{b.icon}</Text>
                    <Text style={{ color: theme.textMain, fontSize: 12, fontWeight: 'bold' }}>{b.name}</Text>
                    <Text style={{ color: theme.green, fontSize: 10, fontWeight: 'bold', marginTop: 2 }}>{b.sub}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* QUẢN LÝ TÀI KHOẢN & CẤU HÌNH HỆ THỐNG */}
            <View style={styles.menuContainer}>
              <Text style={[styles.menuSectionTitle, { color: theme.textSub, marginBottom: 10 }]}>QUẢN LÝ TÀI KHOẢN & ĐỊNH VỊ</Text>
              
              <TouchableOpacity style={[styles.menuItem, { backgroundColor: theme.cardBg, borderColor: theme.border }]} onPress={() => setActiveTab('edit')}>
                <View style={styles.menuItemLeft}>
                  <View style={styles.menuIconBox}><Ionicons name="person-outline" size={20} color="#D4AF37" /></View>
                  <View>
                    <Text style={[styles.menuItemTitle, { color: theme.textMain }]}>Chỉnh sửa thông tin & Ảnh đại diện</Text>
                    <Text style={{ color: theme.textSub, fontSize: 11 }}>Cập nhật họ tên, danh hiệu và ảnh Hộ chiếu</Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color={theme.textSub} />
              </TouchableOpacity>

              <TouchableOpacity style={[styles.menuItem, { backgroundColor: theme.cardBg, borderColor: theme.border }]} onPress={() => setActiveTab('notifications')}>
                <View style={styles.menuItemLeft}>
                  <View style={styles.menuIconBox}><Ionicons name="notifications-outline" size={20} color="#10B981" /></View>
                  <View>
                    <Text style={[styles.menuItemTitle, { color: theme.textMain }]}>Cài đặt thông báo Radar & Agent AI</Text>
                    <Text style={{ color: theme.textSub, fontSize: 11 }}>Báo hiệu vùng 20m, tự phát thuyết minh & mật thư</Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color={theme.textSub} />
              </TouchableOpacity>

              <TouchableOpacity style={[styles.menuItem, { backgroundColor: theme.cardBg, borderColor: theme.border }]} onPress={() => setActiveTab('security')}>
                <View style={styles.menuItemLeft}>
                  <View style={styles.menuIconBox}><Ionicons name="shield-checkmark-outline" size={20} color="#D4AF37" /></View>
                  <View>
                    <Text style={[styles.menuItemTitle, { color: theme.textMain }]}>Bảo mật & Đổi mật khẩu</Text>
                    <Text style={{ color: theme.textSub, fontSize: 11 }}>Quản lý mật khẩu và phiên đăng nhập</Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color={theme.textSub} />
              </TouchableOpacity>

              <TouchableOpacity style={[styles.menuItem, { backgroundColor: theme.cardBg, borderColor: theme.border }]} onPress={() => setActiveTab('support')}>
                <View style={styles.menuItemLeft}>
                  <View style={styles.menuIconBox}><Ionicons name="help-buoy-outline" size={20} color="#10B981" /></View>
                  <View>
                    <Text style={[styles.menuItemTitle, { color: theme.textMain }]}>Hỗ trợ & Đóng góp quán ngon Hẻm Sâu</Text>
                    <Text style={{ color: theme.textSub, fontSize: 11 }}>Gửi tọa độ quán mới cho đội ngũ phát triển</Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color={theme.textSub} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
              <Ionicons name="log-out-outline" size={20} color="#EF4444" />
              <Text style={styles.logoutText}>Đăng xuất tài khoản</Text>
            </TouchableOpacity>
          </>
        )}

        {/* TAB 1: CHỈNH SỬA HỒ SƠ & CHỌN AVATAR */}
        {activeTab === 'edit' && (
          <View style={[styles.subCard, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
            <Text style={[styles.inputLabel, { color: theme.textSub }]}>Chọn ảnh đại diện Hộ chiếu</Text>
            <View style={styles.avatarPresetRow}>
              {AVATAR_PRESETS.map((url, idx) => (
                <TouchableOpacity key={idx} onPress={() => setEditAvatar(url)} style={[styles.avatarChoiceWrap, editAvatar === url && { borderColor: theme.green, borderWidth: 3 }]}>
                  <Image source={{ uri: url }} style={styles.avatarChoiceImg} />
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.inputLabel, { color: theme.textSub }]}>Họ và tên hiển thị</Text>
            <TextInput style={[styles.inputBox, { color: theme.textMain, borderColor: theme.border, backgroundColor: theme.subBg }]} value={editName} onChangeText={setEditName} placeholder="Nhập họ tên" placeholderTextColor={theme.textSub} />

            <Text style={[styles.inputLabel, { color: theme.textSub }]}>Danh hiệu / Đơn vị</Text>
            <TextInput style={[styles.inputBox, { color: theme.textMain, borderColor: theme.border, backgroundColor: theme.subBg }]} value={editBio} onChangeText={setEditBio} placeholder="Nhập tiểu sử" placeholderTextColor={theme.textSub} />

            {statusMsg ? <Text style={[styles.statusText, { color: theme.green }]}>{statusMsg}</Text> : null}

            <TouchableOpacity style={styles.primaryBtn} onPress={handleSaveProfile}>
              <Text style={styles.primaryBtnText}>LƯU HỒ SƠ DI SẢN</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* TAB 2: CÀI ĐẶT THÔNG BÁO RADAR 20M & HỘP THƯ MẬT AGENT AI */}
        {activeTab === 'notifications' && (
          <View style={[styles.subCard, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
            <View style={[styles.switchRow, { borderBottomColor: theme.border }]}>
              <View style={{ flex: 1, paddingRight: 10 }}>
                <Text style={[styles.switchTitle, { color: theme.textMain }]}>Radar nhấp nháy xanh lá {'(<= 20m)'}</Text>
                <Text style={[styles.switchDesc, { color: theme.textSub }]}>Tự động phát sáng thẻ món ăn và nhân đôi +300 XP khi vào vùng 20m</Text>
              </View>
              <Switch value={notifyRadar20m} onValueChange={setNotifyRadar20m} trackColor={{ false: '#555', true: '#10B981' }} />
            </View>

            <View style={[styles.switchRow, { borderBottomColor: theme.border }]}>
              <View style={{ flex: 1, paddingRight: 10 }}>
                <Text style={[styles.switchTitle, { color: theme.textMain }]}>Hộp thư mật Agent AI (Bí mật hẻm sâu)</Text>
                <Text style={[styles.switchDesc, { color: theme.textSub }]}>Gửi câu đố thơ/văn khi phát hiện gánh hàng cổ truyền trong hẻm</Text>
              </View>
              <Switch value={notifyAgentLetter} onValueChange={setNotifyAgentLetter} trackColor={{ false: '#555', true: '#D4AF37' }} />
            </View>

            <View style={[styles.switchRow, { borderBottomColor: theme.border }]}>
              <View style={{ flex: 1, paddingRight: 10 }}>
                <Text style={[styles.switchTitle, { color: theme.textMain }]}>Tự động đọc Thuyết minh AI đa ngôn ngữ</Text>
                <Text style={[styles.switchDesc, { color: theme.textSub }]}>Tự phát giọng đọc văn hóa món ăn theo ngôn ngữ đã chọn</Text>
              </View>
              <Switch value={notifyAutoAiVoice} onValueChange={setNotifyAutoAiVoice} trackColor={{ false: '#555', true: '#10B981' }} />
            </View>

            <View style={[styles.switchRow, { borderBottomWidth: 0 }]}>
              <View style={{ flex: 1, paddingRight: 10 }}>
                <Text style={[styles.switchTitle, { color: theme.textMain }]}>Nhắc giờ Phố đi bộ & Bãi đỗ xe</Text>
                <Text style={[styles.switchDesc, { color: theme.textSub }]}>Cảnh báo khung giờ cấm xe máy tại khu vực Phố cổ Hội An</Text>
              </View>
              <Switch value={notifyPedestrianHours} onValueChange={setNotifyPedestrianHours} trackColor={{ false: '#555', true: '#D4AF37' }} />
            </View>

            <TouchableOpacity style={styles.primaryBtn} onPress={() => setActiveTab('main')}>
              <Text style={styles.primaryBtnText}>LƯU CẤU HÌNH THÔNG BÁO</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* TAB 3: BẢO MẬT & MẬT KHẨU */}
        {activeTab === 'security' && (
          <View style={[styles.subCard, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
            <Text style={[styles.inputLabel, { color: theme.textSub }]}>Mật khẩu hiện tại</Text>
            <TextInput style={[styles.inputBox, { color: theme.textMain, borderColor: theme.border, backgroundColor: theme.subBg }]} secureTextEntry value={oldPass} onChangeText={setOldPass} placeholder="Nhập mật khẩu hiện tại" placeholderTextColor={theme.textSub} />

            <Text style={[styles.inputLabel, { color: theme.textSub }]}>Mật khẩu mới</Text>
            <TextInput style={[styles.inputBox, { color: theme.textMain, borderColor: theme.border, backgroundColor: theme.subBg }]} secureTextEntry value={newPass} onChangeText={setNewPass} placeholder="Tối thiểu 6 ký tự" placeholderTextColor={theme.textSub} />

            <Text style={[styles.inputLabel, { color: theme.textSub }]}>Xác nhận mật khẩu mới</Text>
            <TextInput style={[styles.inputBox, { color: theme.textMain, borderColor: theme.border, backgroundColor: theme.subBg }]} secureTextEntry value={confirmPass} onChangeText={setConfirmPass} placeholder="Nhập lại mật khẩu mới" placeholderTextColor={theme.textSub} />

            {statusMsg ? <Text style={[styles.statusText, { color: theme.green }]}>{statusMsg}</Text> : null}

            <TouchableOpacity style={styles.primaryBtn} onPress={handleSavePassword}>
              <Text style={styles.primaryBtnText}>CẬP NHẬT MẬT KHẨU</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* TAB 4: HỖ TRỢ & ĐÓNG GÓP QUÁN NGON HẺM SÂU */}
        {activeTab === 'support' && (
          <View style={[styles.subCard, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
            <Text style={[styles.switchDesc, { color: theme.textSub, marginBottom: 14 }]}>
              Bạn biết thêm một gánh hàng lâu năm trong hẻm nhỏ Hội An hoặc muốn góp ý cải thiện tính năng? Hãy gửi cho nhóm phát triển nhé!
            </Text>
            <TextInput 
              style={[styles.inputBox, { height: 120, textAlignVertical: 'top', color: theme.textMain, borderColor: theme.border, backgroundColor: theme.subBg }]} 
              multiline 
              value={feedback} 
              onChangeText={setFeedback} 
              placeholder="Nhập tên món ăn, vị trí hẻm hoặc nội dung góp ý..." 
              placeholderTextColor={theme.textSub} 
            />

            {statusMsg ? <Text style={[styles.statusText, { color: theme.green }]}>{statusMsg}</Text> : null}

            <TouchableOpacity style={styles.primaryBtn} onPress={handleSendSupport}>
              <Text style={styles.primaryBtnText}>GỬI ĐÓNG GÓP CHO ĐỘI NGŨ</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* MODAL BÁNH RĂNG CÀI ĐẶT NHANH */}
      <Modal visible={showSettingsModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
            <View style={[styles.modalHeader, { borderBottomColor: theme.border }]}>
              <Text style={[styles.modalTitle, { color: theme.textMain }]}>Cài đặt hệ thống</Text>
              <TouchableOpacity onPress={() => setShowSettingsModal(false)}>
                <Ionicons name="close" size={26} color={theme.textSub} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={[styles.modalOption, { borderBottomColor: theme.border }]} onPress={() => { setShowSettingsModal(false); router.push('/language' as any); }}>
              <Text style={[styles.modalOptionText, { color: theme.textMain }]}>🌐 Ngôn ngữ thuyết minh ({(i18n?.language || 'vi').toUpperCase()})</Text>
              <Ionicons name="chevron-forward" size={20} color={theme.textSub} />
            </TouchableOpacity>

            <TouchableOpacity style={[styles.modalOption, { borderBottomColor: theme.border }]} onPress={toggleTheme}>
              <Text style={[styles.modalOptionText, { color: theme.textMain }]}>
                {isDarkMode ? '☀️ Chuyển sang Giao diện Sáng' : '🌙 Chuyển sang Giao diện Tối'}
              </Text>
              <Ionicons name="swap-horizontal" size={20} color={theme.accent} />
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.modalOption, { borderBottomWidth: 0 }]} 
              onPress={async () => {
                await AsyncStorage.removeItem('checkedInDishIds');
                await AsyncStorage.removeItem('solvedSecretClues');
                setCheckedInCount(0);
                setSolvedCluesCount(0);
                setShowSettingsModal(false);
              }}
            >
              <Text style={[styles.modalOptionText, { color: '#EF4444', fontWeight: 'bold' }]}>🔄 Đặt lại tiến độ Check-in & Mật thư</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, maxWidth: 480, width: '100%', alignSelf: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 18, paddingTop: 16, paddingBottom: 12, borderBottomWidth: 1 },
  brandMiniTitle: { fontSize: 10, fontWeight: '900', letterSpacing: 1.5 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', fontFamily: 'serif' },
  iconCircle: { width: 36, height: 36, borderRadius: 18, borderWidth: 1, justifyContent: 'center', alignItems: 'center' },
  content: { flex: 1, paddingTop: 16 },
  
  passportHeroCard: { marginHorizontal: 18, padding: 16, borderRadius: 22, borderWidth: 1.5, marginBottom: 20 },
  passportTopBadgeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  gpsStatusPill: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, borderWidth: 1 },
  profileRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  avatarContainer: { position: 'relative' },
  avatar: { width: 82, height: 82, borderRadius: 41, borderWidth: 2.5 },
  editAvatarBadge: { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#8B2E2E', width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#120F0D' },
  userName: { fontSize: 20, fontWeight: 'bold', fontFamily: 'serif', marginBottom: 2 },
  userBio: { fontSize: 13, fontWeight: '600', marginBottom: 2 },
  userEmail: { fontSize: 11, marginBottom: 8 },
  levelBadge: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', backgroundColor: '#D4AF37', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 14 },
  levelText: { color: '#120F0D', fontWeight: 'bold', fontSize: 11, marginLeft: 5 },
  
  statsContainer: { flexDirection: 'row', borderRadius: 16, paddingVertical: 14, borderWidth: 1 },
  statBox: { flex: 1, alignItems: 'center' },
  statNumber: { fontSize: 19, fontWeight: '900', marginBottom: 3 },
  statLabel: { fontSize: 11, fontWeight: '600' },
  statDivider: { width: 1, height: '80%', alignSelf: 'center' },

  sectionBlock: { paddingLeft: 18, marginBottom: 20 },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingRight: 18, marginBottom: 10 },
  badgeMiniCard: { width: 138, padding: 12, borderRadius: 16, borderWidth: 1, marginRight: 10 },
  
  menuContainer: { paddingHorizontal: 18, marginBottom: 20 },
  menuSectionTitle: { fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, fontWeight: '900' },
  menuItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14, borderRadius: 16, marginBottom: 10, borderWidth: 1 },
  menuItemLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, paddingRight: 8 },
  menuIconBox: { backgroundColor: 'rgba(212, 175, 55, 0.12)', padding: 9, borderRadius: 12, marginRight: 12 },
  menuItemTitle: { fontSize: 14, fontWeight: 'bold', marginBottom: 2 },
  
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(239, 68, 68, 0.1)', marginHorizontal: 18, paddingVertical: 15, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(239, 68, 68, 0.35)' },
  logoutText: { color: '#EF4444', fontSize: 15, fontWeight: 'bold', marginLeft: 8 },

  subCard: { marginHorizontal: 18, padding: 20, borderRadius: 20, borderWidth: 1 },
  avatarPresetRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 18 },
  avatarChoiceWrap: { borderRadius: 32, padding: 2 },
  avatarChoiceImg: { width: 56, height: 56, borderRadius: 28 },
  inputLabel: { fontSize: 12, fontWeight: 'bold', marginBottom: 6 },
  inputBox: { borderWidth: 1, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 11, fontSize: 14, marginBottom: 16 },
  statusText: { fontWeight: 'bold', textAlign: 'center', marginBottom: 14, fontSize: 13 },
  primaryBtn: { backgroundColor: '#D4AF37', paddingVertical: 14, borderRadius: 14, alignItems: 'center', marginTop: 6 },
  primaryBtnText: { color: '#120F0D', fontSize: 14, fontWeight: '900', letterSpacing: 0.8 },

  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1 },
  switchTitle: { fontSize: 14, fontWeight: 'bold', marginBottom: 3 },
  switchDesc: { fontSize: 12, lineHeight: 17 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'flex-end', alignItems: 'center' },
  modalContent: { width: '100%', maxWidth: 480, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 22, borderWidth: 1 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 14, marginBottom: 8, borderBottomWidth: 1 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', fontFamily: 'serif' },
  modalOption: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1 },
  modalOptionText: { fontSize: 14, fontWeight: '600' }
});