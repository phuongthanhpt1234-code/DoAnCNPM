import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Animated, Dimensions, Image, Modal, Platform, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { ALL_DISHES_DATA, DishItem, getDishInLang, getFullUiText, getGemInLang, HIDDEN_ALLEY_GEMS } from '../locales';

const { width } = Dimensions.get('window');
const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=800&auto=format&fit=crop';

const SMART_ITINERARIES = [
  { id: 'morning', timeRange: '07:00 - 10:30', dishIds: ['2', '6', '18'], calories: '~580 kcal', walkTime: '12 min' },
  { id: 'noon', timeRange: '11:00 - 15:00', dishIds: ['1', '5', '17'], calories: '~720 kcal', walkTime: '10 min' },
  { id: 'night', timeRange: '17:00 - 22:00', dishIds: ['14', '4', '10'], calories: '~540 kcal', walkTime: '15 min' }
];

const DIETARY_PREFS = [
  { id: 'no_peanut', icon: '🥜', vi: 'Dị ứng đậu phộng (Không lạc)', en: 'No Peanuts / Peanut Allergy', zh: '花生过敏（请勿放花生）', ko: '땅콩 알레르기 (땅콩 빼주세요)', ja: 'ピーナッツアレルギー（抜きで）', es: 'Alergia al maní (Sin cacahuetes)', ar: 'حساسية الفول السوداني (بدون فول سوداني)', voiceVi: 'Xin vui lòng không cho đậu phộng vì tôi bị dị ứng.' },
  { id: 'no_spicy', icon: '🌶️', vi: 'Không ăn cay (Không ớt)', en: 'No Spicy / No Chili', zh: '不吃辣（请勿放辣椒）', ko: '안 맵게 해주세요 (고추 제외)', ja: '辛くしないでください（唐辛子抜き）', es: 'Sin picante / Sin chile', ar: 'بدون فلفل حار (غير حار)', voiceVi: 'Xin vui lòng làm món ăn không cay, không cho ớt.' },
  { id: 'vegan', icon: '🥬', vi: 'Ăn thuần chay (Không thịt cá, nước mắm)', en: 'Strict Vegan / No Fish Sauce', zh: '纯素食（不放肉类和鱼露）', ko: '비건 채식 (육류·피쉬소스 제외)', ja: '完全菜食（肉・魚醤抜き）', es: 'Vegano estricto / Sin salsa de pescado', ar: 'نباتي صرف (بدون لحوم أو صلصة سمك)', voiceVi: 'Tôi ăn chay, xin vui lòng dùng nước chấm chay, không thịt cá.' },
  { id: 'no_msg', icon: '🧂', vi: 'Không bột ngọt (Mì chính)', en: 'No MSG Added', zh: '请勿添加味精', ko: 'MSG(조미료) 빼주세요', ja: 'うま味調味料（MSG）抜きで', es: 'Sin glutamato monosódico', ar: 'بدون ملح صيني (MSG)', voiceVi: 'Xin vui lòng không nêm bột ngọt vào món ăn.' },
  { id: 'no_coriander', icon: '🌿', vi: 'Không hành ngò / Rau mùi', en: 'No Cilantro / Scallions', zh: '不要香菜和葱花', ko: '고수와 파 빼주세요', ja: 'パクチー・ネギ抜きで', es: 'Sin cilantro ni cebolla verde', ar: 'بدون كزبرة أو بصل أخضر', voiceVi: 'Xin vui lòng không bỏ hành lá và rau mùi.' },
  { id: 'less_sweet', icon: '🧊', vi: 'Ít đường / Giảm ngọt', en: 'Less Sugar / Less Sweet', zh: '少糖 / 微甜', ko: '설탕 적게 (덜 달게)', ja: '甘さ控えめ（少糖）', es: 'Menos azúcar / Poco dulce', ar: 'سكر أقل / حلاوة خفيفة', voiceVi: 'Xin vui lòng pha chế ít đường, giảm độ ngọt.' },
];

const categoryKeys = ['all', 'specialty', 'noodle', 'vegan', 'snack', 'drink'] as const;

function getDistanceInMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3;
  const p1 = (lat1 * Math.PI) / 180;
  const p2 = (lat2 * Math.PI) / 180;
  const dp = ((lat2 - lat1) * Math.PI) / 180;
  const dl = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(dp / 2) * Math.sin(dp / 2) + Math.cos(p1) * Math.cos(p2) * Math.sin(dl / 2) * Math.sin(dl / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

export default function HomeScreen() {
  const router = useRouter();
  const { t, i18n } = useTranslation(); 
  const currentLang = (i18n.language || 'vi').split('-')[0].toLowerCase();
  const ui = getFullUiText(currentLang);
  
  const [activeCategoryKey, setActiveCategoryKey] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [onlyWithin20m, setOnlyWithin20m] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});
  const [routeStops, setRouteStops] = useState<DishItem[]>([]);
  
  // TÁCH RIÊNG 2 CHẾ ĐỘ GPS: 'vn_remote' (Check-in mọi nơi tại VN) | 'hoian_onsite' (Giả lập tại Hội An <=20m nhận đặc quyền X2)
  const [gpsCheckInMode, setGpsCheckInMode] = useState<'vn_remote' | 'hoian_onsite'>('hoian_onsite');
  const [checkedInIds, setCheckedInIds] = useState<string[]>(['1', '5', '17']);
  const [bonusXp, setBonusXp] = useState<number>(600);
  const [toastBanner, setToastBanner] = useState<string>('');

  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('morning');
  const [selectedDietary, setSelectedDietary] = useState<string[]>(['no_peanut', 'no_spicy']);
  const [showChefCardModal, setShowChefCardModal] = useState<boolean>(false);

  const [gpsCoords, setGpsCoords] = useState<{ lat: number; lng: number }>({ lat: 15.87812, lng: 108.32645 });
  const [simulatedTargetId, setSimulatedTargetId] = useState<string>('1');

  const pulseAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1, duration: 850, useNativeDriver: false }),
        Animated.timing(pulseAnim, { toValue: 0, duration: 850, useNativeDriver: false }),
      ])
    ).start();
  }, [pulseAnim]);

  useEffect(() => {
    const syncAll = async () => {
      const savedTheme = await AsyncStorage.getItem('appThemeMode');
      if (savedTheme !== null) setIsDarkMode(savedTheme === 'dark');

      const savedLang = await AsyncStorage.getItem('appLanguage');
      if (savedLang && savedLang !== i18n.language) {
        await i18n.changeLanguage(savedLang);
      }

      const savedMode = await AsyncStorage.getItem('gpsCheckInMode');
      if (savedMode === 'vn_remote' || savedMode === 'hoian_onsite') {
        setGpsCheckInMode(savedMode);
      }

      const savedCheckIns = await AsyncStorage.getItem('checkedInDishIds');
      if (savedCheckIns) setCheckedInIds(JSON.parse(savedCheckIns));

      const savedXp = await AsyncStorage.getItem('userTotalXp');
      if (savedXp) setBonusXp(parseInt(savedXp, 10));
    };
    syncAll();
    const interval = setInterval(syncAll, 900);
    return () => clearInterval(interval);
  }, []);

  const handleSwitchGpsMode = async (mode: 'vn_remote' | 'hoian_onsite') => {
    setGpsCheckInMode(mode);
    await AsyncStorage.setItem('gpsCheckInMode', mode);
    if (mode === 'hoian_onsite') {
      setToastBanner('🏮 Đã bật GPS Thực Địa Hội An: Nhận X2 điểm (+300 XP) & Mở khóa Hẻm Sâu!');
    } else {
      setToastBanner('🇻🇳 Đã bật GPS Toàn Quốc: Check-in từ xa tại bất kỳ đâu ở Việt Nam (+150 XP)!');
    }
    setTimeout(() => setToastBanner(''), 2800);
  };

  // CHECK-IN THEO 2 CHẾ ĐỘ GPS (CÓ ĐẶC QUYỀN TẠI HỘI AN)
  const handleCheckInDish = async (dish: DishItem) => {
    const loc = getDishInLang(dish, currentLang);
    const earnedXp = gpsCheckInMode === 'hoian_onsite' ? 300 : 150;

    if (!checkedInIds.includes(dish.id)) {
      const updated = [...checkedInIds, dish.id];
      const nextXp = bonusXp + earnedXp;
      setCheckedInIds(updated);
      setBonusXp(nextXp);
      await AsyncStorage.setItem('checkedInDishIds', JSON.stringify(updated));
      await AsyncStorage.setItem('userTotalXp', String(nextXp));
    }

    if (gpsCheckInMode === 'hoian_onsite') {
      setToastBanner(`🏮 Check-in Thực Địa Hội An: "${loc.name}" (+300 XP X2 + Mở khóa Voucher -30%)!`);
    } else {
      setToastBanner(`🇻🇳 Check-in Từ Xa Toàn Quốc: "${loc.name}" (+150 XP vào Sổ Tay)!`);
    }
    setTimeout(() => setToastBanner(''), 3000);
  };

  const simulateStandNearDish = (dish: DishItem) => {
    setSimulatedTargetId(dish.id);
    setGpsCheckInMode('hoian_onsite');
    setGpsCoords({ lat: dish.lat - 0.00008, lng: dish.lng - 0.00007 });
  };

  const toggleTheme = async () => {
    const nextMode = !isDarkMode;
    setIsDarkMode(nextMode);
    await AsyncStorage.setItem('appThemeMode', nextMode ? 'dark' : 'light');
  };

  const toggleStopInRoute = (dish: DishItem) => {
    const exists = routeStops.some(item => item.id === dish.id);
    if (exists) setRouteStops(routeStops.filter(item => item.id !== dish.id));
    else setRouteStops([...routeStops, dish]);
  };

  const handleOpenDishDetail = (item: DishItem, distMeters: number) => {
    const loc = getDishInLang(item, currentLang);
    router.push({
      pathname: '/map' as any,
      params: {
        id: item.id,
        name: loc.name,
        shopVi: item.shopVi,
        lat: item.lat,
        lng: item.lng,
        initialDistance: distMeters,
        gpsMode: gpsCheckInMode,
        autoSpeak: '1'
      }
    });
  };

  // ĐÃ CẬP NHẬT: Dẫn đường đi bộ qua tất cả các trạm đã chọn (không bị nhảy về Cơm Gà Bà Buội)
  const handleStartMultiStopWalk = (customStops?: DishItem[]) => {
    const list = customStops || routeStops;
    if (!list || list.length === 0) return;
    if (list.length === 1) {
      const first = list[0];
      const dist = getDistanceInMeters(gpsCoords.lat, gpsCoords.lng, first.lat, first.lng);
      handleOpenDishDetail(first, dist);
      return;
    }
    const routeNames = list.map((d, idx) => `${idx + 1}. ${getDishInLang(d, currentLang).name}`).join(' ➔ ');
    router.push({
      pathname: '/map' as any,
      params: {
        isMultiStop: '1',
        stopsJson: JSON.stringify(list.map(d => String(d.id))),
        routeNames,
        lat: list[list.length - 1].lat,
        lng: list[list.length - 1].lng,
        gpsMode: gpsCheckInMode,
        autoWalk: '1',
        autoSpeak: '1'
      }
    });
  };

  const speakChefCardVietnamese = () => {
    const activePrefs = DIETARY_PREFS.filter(p => selectedDietary.includes(p.id));
    const speechText = activePrefs.length > 0
      ? `Xin chào cô chú chủ quán! Tôi đang dùng ứng dụng Theo Dấu Vị Hội. Khi chế biến món ăn, xin vui lòng giúp tôi: ${activePrefs.map(p => p.voiceVi).join(' ')} Xin cảm ơn rất nhiều!`
      : 'Xin chào cô chú chủ quán! Tôi có thể thưởng thức tất cả các nguyên liệu truyền thống của quán.';

    if (Platform.OS === 'web' && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(speechText);
      utterance.lang = 'vi-VN';
      utterance.rate = 0.95;
      window.speechSynthesis.speak(utterance);
    }
  };

  const getPrefLabel = (pref: typeof DIETARY_PREFS[0]) => {
    return (pref as any)[currentLang] || pref.vi;
  };

  const dishesWithDistance = ALL_DISHES_DATA.map(dish => {
    const distMeters = getDistanceInMeters(gpsCoords.lat, gpsCoords.lng, dish.lat, dish.lng);
    return {
      ...dish,
      distMeters,
      isWithin20m: gpsCheckInMode === 'hoian_onsite' && distMeters <= 20
    };
  });

  const displayedDishes = dishesWithDistance.filter(dish => {
    const loc = getDishInLang(dish, currentLang);
    const matchCategory = activeCategoryKey === 'all' ? true : dish.categoryKey === activeCategoryKey;
    const matchSearch = loc.name.toLowerCase().includes(searchQuery.toLowerCase()) || dish.shopVi.toLowerCase().includes(searchQuery.toLowerCase());
    const matchNear = onlyWithin20m ? dish.isWithin20m : true;
    return matchCategory && matchSearch && matchNear;
  });

  const nearbyCount = dishesWithDistance.filter(d => d.isWithin20m).length;
  const activeItinerary = SMART_ITINERARIES.find(it => it.id === selectedTimeSlot) || SMART_ITINERARIES[0];
  const itineraryDishes = ALL_DISHES_DATA.filter(d => activeItinerary.dishIds.includes(d.id));

  const theme = {
    bg: isDarkMode ? '#120F0D' : '#F6F3EC',
    cardBg: isDarkMode ? '#1C1815' : '#FFFFFF',
    subBg: isDarkMode ? '#25201C' : '#EFECE4',
    textMain: isDarkMode ? '#F9FAFB' : '#18181B',
    textSub: isDarkMode ? '#B8B0A8' : '#4B5563',
    accent: isDarkMode ? '#D4AF37' : '#8C5E0A',
    greenPrimary: isDarkMode ? '#10B981' : '#047857',
    greenBg: isDarkMode ? 'rgba(16, 185, 129, 0.14)' : '#ECFDF5',
    border: isDarkMode ? '#302924' : '#E2DCD0',
  };

  const blinkingCardBg = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: isDarkMode ? ['#162920', '#1E4631'] : ['#ECFDF5', '#A7F3D0']
  });

  const blinkingBorderColor = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: isDarkMode ? ['#10B981', '#34D399'] : ['#059669', '#047857']
  });

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      {toastBanner ? (
        <View style={styles.toastBanner}>
          <Ionicons name="sparkles" size={18} color="#120F0D" />
          <Text style={styles.toastBannerText}>{toastBanner}</Text>
        </View>
      ) : null}

      <ScrollView showsVerticalScrollIndicator={false}>
        
        {/* HEADER */}
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.logoTitle, { color: theme.accent }]}>{ui.brandName}</Text>
            <Text style={[styles.logoSubtitle, { color: theme.textSub }]}>{ui.brandSub}</Text>
          </View>
          <View style={styles.headerIcons}>
            <TouchableOpacity style={[styles.iconCircle, { backgroundColor: theme.cardBg, borderColor: theme.border }]} onPress={toggleTheme}>
              <Ionicons name={isDarkMode ? "sunny" : "moon"} size={19} color={theme.accent} />
            </TouchableOpacity>
            
            <TouchableOpacity style={[styles.langBtn, { backgroundColor: theme.cardBg, borderColor: theme.border }]} onPress={() => router.push('/language' as any)}>
              <Ionicons name="globe-outline" size={15} color={theme.accent} style={{marginRight: 4}} />
              <Text style={[styles.langText, { color: theme.textMain }]}>{currentLang.toUpperCase()}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={[styles.iconCircle, { backgroundColor: theme.cardBg, borderColor: theme.border }]} onPress={() => router.push('/favorite' as any)}>
              <Ionicons name="heart-outline" size={19} color="#991B1B" />
            </TouchableOpacity>
            
            <TouchableOpacity onPress={() => router.push('/profile' as any)} style={styles.profileBtn}>
              <Ionicons name="person-circle" size={34} color={theme.accent} />
            </TouchableOpacity>
          </View>
        </View>

        {/* BỘ CHỌN TÁCH RIÊNG 2 CHẾ ĐỘ GPS (TOÀN QUỐC TỪ XA vs TẠI HỘI AN <=20M CÓ ĐẶC QUYỀN) */}
        <View style={[styles.dualGpsCard, { backgroundColor: theme.cardBg, borderColor: gpsCheckInMode === 'hoian_onsite' ? theme.greenPrimary : theme.accent }]}>
          <View style={styles.dualGpsHeader}>
            <Text style={[styles.dualGpsLabel, { color: theme.accent }]}>{ui.gpsSelectorTitle}</Text>
            <TouchableOpacity onPress={() => router.push('/profile' as any)}>
              <Text style={{ color: theme.greenPrimary, fontSize: 11, fontWeight: 'bold' }}>
                📖 {checkedInIds.length}/25 • {bonusXp} XP ➔
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.dualGpsRow}>
            <TouchableOpacity
              style={[
                styles.gpsOptionBox,
                {
                  backgroundColor: gpsCheckInMode === 'vn_remote' ? theme.accent : theme.subBg,
                  borderColor: gpsCheckInMode === 'vn_remote' ? theme.accent : theme.border
                }
              ]}
              onPress={() => handleSwitchGpsMode('vn_remote')}
            >
              <Text style={{ color: gpsCheckInMode === 'vn_remote' ? '#FFFFFF' : theme.textMain, fontSize: 12, fontWeight: 'bold' }}>
                {ui.gpsModeVnTitle}
              </Text>
              <Text style={{ color: gpsCheckInMode === 'vn_remote' ? '#FEF3C7' : theme.textSub, fontSize: 10, marginTop: 2 }}>
                {ui.gpsModeVnSub}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.gpsOptionBox,
                {
                  backgroundColor: gpsCheckInMode === 'hoian_onsite' ? theme.greenPrimary : theme.subBg,
                  borderColor: gpsCheckInMode === 'hoian_onsite' ? theme.greenPrimary : theme.border
                }
              ]}
              onPress={() => handleSwitchGpsMode('hoian_onsite')}
            >
              <Text style={{ color: gpsCheckInMode === 'hoian_onsite' ? '#FFFFFF' : theme.textMain, fontSize: 12, fontWeight: 'bold' }}>
                {ui.gpsModeHoiAnTitle}
              </Text>
              <Text style={{ color: gpsCheckInMode === 'hoian_onsite' ? '#D1FAE5' : theme.textSub, fontSize: 10, marginTop: 2 }}>
                {ui.gpsModeHoiAnSub}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.privilegeStrip, { backgroundColor: gpsCheckInMode === 'hoian_onsite' ? theme.greenBg : theme.subBg }]}>
            <Text style={{ color: gpsCheckInMode === 'hoian_onsite' ? theme.greenPrimary : theme.textMain, fontSize: 11, fontWeight: 'bold', lineHeight: 16 }}>
              {gpsCheckInMode === 'hoian_onsite' ? ui.hoiAnPrivilegeBanner : ui.vnModeBanner}
            </Text>
          </View>

          {gpsCheckInMode === 'hoian_onsite' && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 8 }}>
              {ALL_DISHES_DATA.slice(0, 8).map((d) => {
                const isSelected = simulatedTargetId === d.id;
                const loc = getDishInLang(d, currentLang);
                return (
                  <TouchableOpacity
                    key={d.id}
                    style={[styles.simChip, { backgroundColor: isSelected ? theme.greenPrimary : theme.subBg, borderColor: theme.greenPrimary }]}
                    onPress={() => simulateStandNearDish(d)}
                  >
                    <Ionicons name="locate" size={12} color={isSelected ? "#FFFFFF" : theme.greenPrimary} />
                    <Text style={{ color: isSelected ? "#FFFFFF" : theme.textMain, fontSize: 11, fontWeight: '600', marginLeft: 4 }}>
                      {loc.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          )}
        </View>

        {/* TÌM KIẾM & BỘ LỌC 25 MÓN */}
        <View style={styles.searchSection}>
          <View style={[styles.searchBar, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
            <Ionicons name="search-outline" size={20} color={theme.textSub} />
            <TextInput 
              style={[styles.searchInput, { color: theme.textMain }]} 
              placeholder={ui.searchPlaceholder} 
              placeholderTextColor={theme.textSub} 
              value={searchQuery}
              onChangeText={setSearchQuery} 
            />
            <TouchableOpacity 
              style={[styles.filter20mBtn, { backgroundColor: onlyWithin20m ? theme.greenPrimary : 'transparent', borderColor: theme.greenPrimary }]}
              onPress={() => setOnlyWithin20m(!onlyWithin20m)}
            >
              <Text style={{ color: onlyWithin20m ? '#FFFFFF' : theme.greenPrimary, fontSize: 11, fontWeight: 'bold' }}>
                {onlyWithin20m ? ui.showAllBtn : `${ui.filter20mBtn} (${nearbyCount})`}
              </Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll} contentContainerStyle={{ paddingRight: 20 }}>
            {categoryKeys.map((catKey) => {
              const isActive = activeCategoryKey === catKey;
              return (
                <TouchableOpacity 
                  key={catKey} 
                  style={[styles.filterChip, { backgroundColor: isActive ? '#8B2E2E' : theme.cardBg, borderColor: isActive ? '#8B2E2E' : theme.border }]} 
                  onPress={() => setActiveCategoryKey(catKey)} 
                >
                  <Text style={{ color: isActive ? '#FFFFFF' : theme.textMain, fontSize: 13, fontWeight: isActive ? 'bold' : '600' }}>
                    {t(`categories.${catKey}`)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* 1. DANH SÁCH 25 MÓN ĂN HỘI AN */}
        <View style={styles.popularSection}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.textMain }]}>
              {activeCategoryKey === 'all' ? ui.popularDishes : t(`categories.${activeCategoryKey}`)}
            </Text>
            <Text style={[styles.countText, { color: theme.accent }]}>{displayedDishes.length} {ui.dishesUnit}</Text>
          </View>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.cardsScroll} contentContainerStyle={{ paddingRight: 20 }}>
            {displayedDishes.map((item) => {
              const isSelectedInRoute = routeStops.some(s => s.id === item.id);
              const isChecked = checkedInIds.includes(item.id);
              const loc = getDishInLang(item, currentLang);

              return (
                <Animated.View 
                  key={item.id} 
                  style={[
                    styles.foodCard, 
                    { 
                      backgroundColor: item.isWithin20m ? blinkingCardBg : theme.cardBg, 
                      borderColor: item.isWithin20m ? blinkingBorderColor : (isChecked ? theme.greenPrimary : theme.border),
                      borderWidth: item.isWithin20m ? 2.5 : 1.2,
                    }
                  ]}
                >
                  <TouchableOpacity activeOpacity={0.9} onPress={() => handleOpenDishDetail(item, item.distMeters)}>
                    <View style={styles.imageWrapper}>
                      <Image 
                        source={{ uri: failedImages[item.id] ? FALLBACK_IMAGE : item.image }} 
                        style={styles.cardImage} 
                        onError={() => setFailedImages(prev => ({ ...prev, [item.id]: true }))}
                      />
                      <View style={[styles.distanceBadge, item.isWithin20m && { backgroundColor: '#047857' }]}>
                        <Ionicons name={item.isWithin20m ? "radio" : "walk"} size={12} color="#FFFFFF" />
                        <Text style={styles.distanceText}>
                          {item.distMeters}m {item.isWithin20m ? '• <=20m (X2 XP)' : ''}
                        </Text>
                      </View>
                      <View style={styles.ratingBadge}>
                        <Ionicons name="star" size={12} color="#FBBF24" />
                        <Text style={styles.ratingBadgeText}>{item.rating}</Text>
                      </View>
                    </View>

                    <View style={styles.cardInfo}>
                      <View style={styles.cardMetaRow}>
                        <Text style={[styles.cardCategory, { color: item.isWithin20m ? theme.greenPrimary : theme.accent }]}>
                          {t(`categories.${item.categoryKey}`)}
                        </Text>
                        <Text style={[styles.shopSubText, { color: theme.textSub }]} numberOfLines={1}>
                          📍 {item.shopVi}
                        </Text>
                      </View>

                      <Text style={[styles.cardTitle, { color: theme.textMain }]} numberOfLines={1}>{loc.name}</Text>
                      <Text style={[styles.dishTagText, { color: theme.textSub }]} numberOfLines={1}>✨ {loc.tag}</Text>

                      <View style={[styles.aiListenBar, { backgroundColor: item.isWithin20m ? theme.greenPrimary : theme.subBg }]}>
                        <Ionicons name="volume-high" size={15} color={item.isWithin20m ? "#FFFFFF" : theme.accent} />
                        <Text style={{ color: item.isWithin20m ? "#FFFFFF" : theme.textMain, fontSize: 11, fontWeight: 'bold', marginLeft: 6 }} numberOfLines={1}>
                          {item.isWithin20m ? ui.in20mListenBtn : ui.normalListenBtn}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>

                  <View style={[styles.cardFooter, { borderTopColor: theme.border }]}>
                    <TouchableOpacity 
                      style={[styles.universalCheckInBtn, { backgroundColor: isChecked ? theme.greenPrimary : theme.accent }]} 
                      onPress={() => handleCheckInDish(item)}
                    >
                      <Ionicons name={isChecked ? "checkmark-circle" : "location"} size={14} color="#FFFFFF" />
                      <Text style={{ color: '#FFFFFF', fontSize: 11, fontWeight: 'bold', marginLeft: 4 }}>
                        {isChecked ? ui.checkedInBtn : `${ui.checkInNowBtn} (${gpsCheckInMode === 'hoian_onsite' ? '+300' : '+150'} XP)`}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                      style={[styles.addRouteBtn, { borderColor: theme.accent, backgroundColor: isSelectedInRoute ? theme.accent : 'transparent' }]} 
                      onPress={() => toggleStopInRoute(item)}
                    >
                      <Text style={{ color: isSelectedInRoute ? "#FFFFFF" : theme.textMain, fontSize: 11, fontWeight: 'bold' }}>
                        {isSelectedInRoute ? ui.addedRoute : ui.addRoute}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </Animated.View>
              );
            })}
          </ScrollView>
        </View>

        {/* 2. AGENT AI: HỘP THƯ MẬT & BÍ MẬT HẺM SÂU (BẤM VÀO MỞ ĐÚNG TỌA ĐỘ HẺM TRÊN MAP HOẶC EXPLORE) */}
        <View style={styles.secretSection}>
          <View style={styles.sectionHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
              <Ionicons name="mail-unread" size={22} color={theme.accent} />
              <Text style={[styles.sectionTitle, { marginLeft: 8, color: theme.textMain }]} numberOfLines={1}>
                {ui.secretAlleyTitle}
              </Text>
            </View>
          </View>
          <Text style={[styles.descText, { color: theme.textSub }]}>{ui.secretAlleySub}</Text>

          <View style={[styles.secretPreviewCard, { backgroundColor: theme.cardBg, borderColor: theme.accent }]}>
            {HIDDEN_ALLEY_GEMS.map((gem, idx) => {
              const gLoc = getGemInLang(gem, currentLang);
              const clueKey = `c${idx + 1}`;
              return (
                <TouchableOpacity
                  key={gem.id}
                  activeOpacity={0.85}
                  style={[styles.gemMiniRow, idx < 2 && { borderBottomWidth: 1, borderBottomColor: theme.border }]}
                  onPress={() => router.push({
                    pathname: '/map' as any,
                    params: {
                      clueId: clueKey,
                      name: gLoc.name,
                      desc: gLoc.aiRiddlePoem,
                      lat: gem.lat,
                      lng: gem.lng,
                      autoWalk: '1',
                      autoSpeak: '1'
                    }
                  })}
                >
                  <View style={[styles.gemNumberBadge, { backgroundColor: theme.accent }]}>
                    <Text style={{ color: '#FFFFFF', fontSize: 11, fontWeight: 'bold' }}>#{idx + 1}</Text>
                  </View>
                  <View style={{ flex: 1, marginHorizontal: 10 }}>
                    <Text style={{ color: theme.textMain, fontSize: 13, fontWeight: 'bold' }}>{gLoc.name}</Text>
                    <Text style={{ color: theme.textSub, fontSize: 11, fontStyle: 'italic' }} numberOfLines={1}>
                      {gLoc.aiRiddlePoem}
                    </Text>
                  </View>
                  <Text style={{ color: theme.greenPrimary, fontSize: 11, fontWeight: 'bold' }}>{gem.distanceHint}</Text>
                </TouchableOpacity>
              );
            })}

            <TouchableOpacity 
              style={[styles.openEnvelopeBtn, { backgroundColor: '#8B2E2E' }]}
              onPress={() => router.push('/explore' as any)}
            >
              <Ionicons name="sparkles" size={16} color="#FDE68A" />
              <Text style={{ color: '#FFFFFF', fontSize: 12, fontWeight: 'bold', marginLeft: 8 }}>
                {ui.openSecretEnvelopeBtn}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 3. TRỢ LÝ LỊCH TRÌNH THEO GIỜ & THẺ KHẨU VỊ (ĐỒNG BỘ 100% NGÔN NGỮ) */}
        <View style={styles.smartAssistantSection}>
          <View style={styles.sectionHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
              <Ionicons name="calendar" size={22} color={theme.accent} />
              <Text style={[styles.sectionTitle, { marginLeft: 8, color: theme.textMain }]} numberOfLines={1}>
                {ui.assistantTitle}
              </Text>
            </View>
            <View style={[styles.newFeatureBadge, { backgroundColor: theme.greenPrimary }]}>
              <Text style={styles.newFeatureBadgeText}>{ui.newBadge}</Text>
            </View>
          </View>

          <Text style={[styles.descText, { color: theme.textSub }]}>{ui.assistantDesc}</Text>

          <View style={[styles.itineraryCard, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
            <View style={styles.timeTabsRow}>
              {SMART_ITINERARIES.map((slot) => {
                const active = selectedTimeSlot === slot.id;
                const tabTitle = slot.id === 'morning' ? ui.morningTab : slot.id === 'noon' ? ui.noonTab : ui.nightTab;
                return (
                  <TouchableOpacity
                    key={slot.id}
                    style={[styles.timeTabBtn, { backgroundColor: active ? '#8B2E2E' : theme.subBg }]}
                    onPress={() => setSelectedTimeSlot(slot.id)}
                  >
                    <Text style={{ color: active ? '#FFFFFF' : theme.textMain, fontSize: 12, fontWeight: 'bold' }}>
                      {tabTitle}
                    </Text>
                    <Text style={{ color: active ? '#FDE68A' : theme.textSub, fontSize: 10, marginTop: 2 }}>
                      {slot.timeRange}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={{ marginTop: 12 }}>
              {itineraryDishes.map((dish, idx) => {
                const loc = getDishInLang(dish, currentLang);
                const isDone = checkedInIds.includes(dish.id);
                return (
                  <View key={dish.id} style={[styles.itineraryStopRow, { backgroundColor: theme.subBg, borderColor: theme.border }]}>
                    <View style={[styles.stepCircle, { backgroundColor: isDone ? theme.greenPrimary : theme.accent }]}>
                      <Text style={{ color: '#FFFFFF', fontSize: 11, fontWeight: 'bold' }}>{idx + 1}</Text>
                    </View>
                    <TouchableOpacity
                      style={{ flex: 1, marginHorizontal: 10 }}
                      onPress={() => {
                        const dist = getDistanceInMeters(gpsCoords.lat, gpsCoords.lng, dish.lat, dish.lng);
                        handleOpenDishDetail(dish, dist);
                      }}
                    >
                      <Text style={{ color: theme.textMain, fontSize: 13, fontWeight: 'bold' }}>{loc.name}</Text>
                      <Text style={{ color: theme.textSub, fontSize: 11 }}>📍 {dish.shopVi} • {dish.hours}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.miniCheckBtn, { backgroundColor: isDone ? theme.greenPrimary : theme.cardBg, borderColor: theme.accent }]}
                      onPress={() => handleCheckInDish(dish)}
                    >
                      <Text style={{ color: isDone ? '#FFFFFF' : theme.accent, fontSize: 11, fontWeight: 'bold' }}>
                        {isDone ? ui.checkedInBtn : ui.checkInNowBtn}
                      </Text>
                    </TouchableOpacity>
                  </View>
                );
              })}

              <TouchableOpacity 
                style={[styles.startItineraryBtn, { backgroundColor: theme.accent }]}
                onPress={() => handleStartMultiStopWalk(itineraryDishes)}
              >
                <Ionicons name="map" size={16} color="#FFFFFF" />
                <Text style={{ color: '#FFFFFF', fontSize: 12, fontWeight: 'bold', marginLeft: 6 }}>
                  {ui.walkRouteAllBtn}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* THẺ KHẨU VỊ ĐỒNG BỘ 7 NGÔN NGỮ */}
          <View style={[styles.dietaryCard, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
              <Ionicons name="medkit-outline" size={18} color={theme.greenPrimary} />
              <Text style={{ color: theme.textMain, fontSize: 15, fontWeight: 'bold', marginLeft: 6 }}>
                {ui.dietaryTitle}
              </Text>
            </View>
            <Text style={{ color: theme.textSub, fontSize: 12, marginBottom: 12 }}>{ui.dietaryDesc}</Text>

            <View style={styles.dietaryGrid}>
              {DIETARY_PREFS.map((pref) => {
                const active = selectedDietary.includes(pref.id);
                return (
                  <TouchableOpacity
                    key={pref.id}
                    style={[
                      styles.dietaryChip,
                      { backgroundColor: active ? theme.greenBg : theme.subBg, borderColor: active ? theme.greenPrimary : theme.border }
                    ]}
                    onPress={() => {
                      if (active) setSelectedDietary(selectedDietary.filter(i => i !== pref.id));
                      else setSelectedDietary([...selectedDietary, pref.id]);
                    }}
                  >
                    <Text style={{ fontSize: 14, marginRight: 6 }}>{pref.icon}</Text>
                    <Text style={{ color: active ? theme.greenPrimary : theme.textMain, fontSize: 12, fontWeight: active ? 'bold' : '500', flex: 1 }}>
                      {getPrefLabel(pref)}
                    </Text>
                    <Ionicons name={active ? "checkmark-circle" : "ellipse-outline"} size={16} color={active ? theme.greenPrimary : theme.textSub} />
                  </TouchableOpacity>
                );
              })}
            </View>

            <TouchableOpacity 
              style={[styles.openChefModalBtn, { backgroundColor: theme.greenPrimary }]}
              onPress={() => { setShowChefCardModal(true); speakChefCardVietnamese(); }}
            >
              <Ionicons name="volume-high" size={18} color="#FFFFFF" />
              <Text style={{ color: '#FFFFFF', fontSize: 12, fontWeight: 'bold', marginLeft: 8 }}>
                {ui.openChefCardBtn}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: routeStops.length > 0 ? 120 : 40 }} />
      </ScrollView>

      {routeStops.length > 0 && (
        <View style={styles.floatingPlanner}>
          <View style={styles.plannerTopRow}>
            <Text style={styles.plannerTitle} numberOfLines={1}>
              🚶 {routeStops.map((s, idx) => `${idx + 1}. ${getDishInLang(s, currentLang).name}`).join(' ➔ ')}
            </Text>
            <TouchableOpacity onPress={() => setRouteStops([])}>
              <Ionicons name="close-circle" size={22} color="#FF8A80" />
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.startWalkBtn} onPress={() => handleStartMultiStopWalk()}>
            <Ionicons name="navigate" size={18} color="#120F0D" />
            <Text style={styles.startWalkBtnText}>{ui.walkRouteAllBtn} ({routeStops.length})</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* MODAL THẺ KHẨU VỊ ĐƯA CHỦ QUÁN XEM */}
      <Modal visible={showChefCardModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.chefModalBox, { backgroundColor: theme.cardBg, borderColor: theme.greenPrimary }]}>
            <View style={styles.chefModalHeader}>
              <Text style={{ color: theme.greenPrimary, fontSize: 12, fontWeight: '900' }}>
                🇻🇳 {ui.dietaryTitle}
              </Text>
              <TouchableOpacity onPress={() => setShowChefCardModal(false)}>
                <Ionicons name="close" size={24} color={theme.textMain} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.chefGreetingTitle, { color: theme.textMain }]}>
              "Xin chào Cô/Chú chủ quán! Khi chế biến món ăn xin vui lòng giúp tôi:"
            </Text>

            <View style={{ width: '100%', marginVertical: 12 }}>
              {DIETARY_PREFS.filter(p => selectedDietary.includes(p.id)).map((pref) => (
                <View key={pref.id} style={[styles.chefAlertItem, { backgroundColor: theme.subBg, borderColor: theme.greenPrimary }]}>
                  <Text style={{ fontSize: 22, marginRight: 10 }}>{pref.icon}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: theme.textMain, fontSize: 15, fontWeight: 'bold' }}>{pref.vi}</Text>
                    <Text style={{ color: theme.textSub, fontSize: 12 }}>{getPrefLabel(pref)}</Text>
                  </View>
                </View>
              ))}
            </View>

            <TouchableOpacity style={[styles.replayVoiceBtn, { backgroundColor: theme.greenPrimary }]} onPress={speakChefCardVietnamese}>
              <Ionicons name="volume-high" size={20} color="#FFFFFF" />
              <Text style={{ color: '#FFFFFF', fontSize: 13, fontWeight: 'bold', marginLeft: 8 }}>
                🔊 Phát Giọng Đọc AI Tiếng Việt Cho Chủ Quán
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, maxWidth: 480, width: '100%', alignSelf: 'center' },
  toastBanner: { position: 'absolute', top: 15, left: 16, right: 16, zIndex: 99, backgroundColor: '#10B981', paddingVertical: 12, paddingHorizontal: 14, borderRadius: 14, flexDirection: 'row', alignItems: 'center', elevation: 12 },
  toastBannerText: { color: '#120F0D', fontSize: 12, fontWeight: 'bold', marginLeft: 8, flex: 1 },

  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 18, paddingBottom: 10 },
  logoTitle: { fontSize: 21, fontWeight: '900', fontFamily: 'serif', letterSpacing: 1 },
  logoSubtitle: { fontSize: 9, letterSpacing: 1, fontWeight: 'bold', marginTop: 2 },
  headerIcons: { flexDirection: 'row', alignItems: 'center' },
  iconCircle: { width: 35, height: 35, borderRadius: 18, borderWidth: 1, justifyContent: 'center', alignItems: 'center', marginLeft: 6 },
  langBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 9, height: 35, borderRadius: 18, borderWidth: 1, marginLeft: 6 },
  langText: { fontSize: 11, fontWeight: 'bold' }, 
  profileBtn: { marginLeft: 6 }, 

  dualGpsCard: { marginHorizontal: 20, marginTop: 6, padding: 12, borderRadius: 18, borderWidth: 1.5 },
  dualGpsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  dualGpsLabel: { fontSize: 11, fontWeight: '900', letterSpacing: 0.4 },
  dualGpsRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  gpsOptionBox: { flex: 1, padding: 10, borderRadius: 12, borderWidth: 1 },
  privilegeStrip: { padding: 9, borderRadius: 10 },
  simChip: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12, marginRight: 8 },
  
  searchSection: { marginTop: 14 }, 
  searchBar: { flexDirection: 'row', marginHorizontal: 20, paddingHorizontal: 12, height: 46, borderRadius: 14, alignItems: 'center', borderWidth: 1 }, 
  searchInput: { flex: 1, marginLeft: 8, fontSize: 13 },
  filter20mBtn: { paddingHorizontal: 9, paddingVertical: 5, borderRadius: 9, borderWidth: 1, marginLeft: 6 },
  filterScroll: { marginTop: 12, paddingLeft: 20 }, 
  filterChip: { paddingVertical: 8, paddingHorizontal: 15, borderRadius: 18, marginRight: 8, borderWidth: 1 }, 
  
  popularSection: { marginTop: 20, paddingBottom: 10 }, 
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 10 }, 
  sectionTitle: { fontSize: 17, fontWeight: 'bold', fontFamily: 'serif' }, 
  countText: { fontSize: 13, fontWeight: 'bold' }, 
  cardsScroll: { paddingLeft: 20 },
  foodCard: { width: width > 480 ? 270 : width * 0.74, borderRadius: 20, marginRight: 16, overflow: 'hidden' }, 
  imageWrapper: { width: '100%', height: 145 }, 
  cardImage: { width: '100%', height: '100%' }, 
  distanceBadge: { position: 'absolute', top: 10, left: 10, flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(18, 15, 13, 0.85)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 }, 
  distanceText: { color: '#FFFFFF', fontSize: 11, marginLeft: 4, fontWeight: 'bold' }, 
  ratingBadge: { position: 'absolute', top: 10, right: 10, flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(18, 15, 13, 0.85)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10 },
  ratingBadgeText: { color: '#FFFFFF', fontSize: 11, fontWeight: 'bold', marginLeft: 3 },

  cardInfo: { padding: 14 }, 
  cardMetaRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  cardCategory: { fontSize: 11, fontWeight: 'bold', textTransform: 'uppercase' }, 
  shopSubText: { fontSize: 11, fontWeight: '600', maxWidth: 130 },
  cardTitle: { fontSize: 16, fontWeight: 'bold', fontFamily: 'serif', marginBottom: 4 }, 
  dishTagText: { fontSize: 12, marginBottom: 10 },
  aiListenBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 8, paddingHorizontal: 10, borderRadius: 10 },

  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 10, borderTopWidth: 1 }, 
  universalCheckInBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 7, borderRadius: 10 },
  addRouteBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10, borderWidth: 1 },

  secretSection: { marginTop: 14, paddingBottom: 6 },
  secretPreviewCard: { marginHorizontal: 20, padding: 14, borderRadius: 18, borderWidth: 1.5 },
  gemMiniRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
  gemNumberBadge: { width: 26, height: 26, borderRadius: 13, justifyContent: 'center', alignItems: 'center' },
  openEnvelopeBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRadius: 12, marginTop: 10 },

  smartAssistantSection: { marginTop: 18, paddingBottom: 10 },
  newFeatureBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  newFeatureBadgeText: { color: '#FFFFFF', fontSize: 10, fontWeight: '900' },
  descText: { paddingHorizontal: 20, fontSize: 12, lineHeight: 18, marginBottom: 12 },
  itineraryCard: { marginHorizontal: 20, padding: 15, borderRadius: 18, borderWidth: 1, marginBottom: 14 },
  timeTabsRow: { flexDirection: 'row', gap: 8 },
  timeTabBtn: { flex: 1, alignItems: 'center', paddingVertical: 8, borderRadius: 12 },
  itineraryStopRow: { flexDirection: 'row', alignItems: 'center', padding: 10, borderRadius: 12, borderWidth: 1, marginBottom: 8 },
  stepCircle: { width: 24, height: 24, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  miniCheckBtn: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, borderWidth: 1 },
  startItineraryBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRadius: 12, marginTop: 6 },

  dietaryCard: { marginHorizontal: 20, padding: 15, borderRadius: 18, borderWidth: 1 },
  dietaryGrid: { gap: 8, marginBottom: 12 },
  dietaryChip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 10, borderRadius: 12, borderWidth: 1 },
  openChefModalBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 13, borderRadius: 12 },

  floatingPlanner: { position: 'absolute', bottom: 15, left: 15, right: 15, backgroundColor: '#1E1A17', borderRadius: 18, padding: 14, borderWidth: 1.5, borderColor: '#D4AF37', elevation: 15 },
  plannerTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  plannerTitle: { color: '#FFFFFF', fontSize: 13, fontWeight: 'bold', flex: 1, marginRight: 8 },
  startWalkBtn: { flexDirection: 'row', backgroundColor: '#D4AF37', paddingVertical: 11, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  startWalkBtnText: { color: '#120F0D', fontSize: 13, fontWeight: 'bold', marginLeft: 6 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.82)', justifyContent: 'center', alignItems: 'center', padding: 18 },
  chefModalBox: { width: '100%', maxWidth: 420, borderRadius: 24, padding: 20, borderWidth: 2 },
  chefModalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  chefGreetingTitle: { fontSize: 16, fontWeight: 'bold', fontFamily: 'serif', lineHeight: 23 },
  chefAlertItem: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 14, borderWidth: 1.5, marginBottom: 8 },
  replayVoiceBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderRadius: 14, marginTop: 6 }
});