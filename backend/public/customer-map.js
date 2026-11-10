const urlParams = new URLSearchParams(window.location.search);
let currentMapLang = urlParams.get('lang') || localStorage.getItem('customer_map_lang') || 'vi';
if (!['vi', 'en', 'zh', 'ko', 'ja'].includes(currentMapLang)) currentMapLang = 'vi';

const I18N = {
  vi: {
    origin_chua_cau_default: "Chùa Cầu Hội An (Tâm phố cổ - Mặc định)",
    origin_my_real_gps: "Định vị GPS thực tế của tôi",
    user_location_real: "Vị trí GPS thực tế của bạn",
    gps_outside_hoian: "Đã nhận GPS thực tế của bạn (cách Hội An {dist}km). Để khám phá các quán ăn phố cổ, bạn hãy chọn điểm xuất phát tại Chùa Cầu Hội An.",
    gps_locating: "Đang dò tìm tọa độ GPS vệ tinh...",
    gps_permission_denied: "Ứng dụng không có quyền định vị. Vui lòng cấp quyền truy cập vị trí trong cài đặt trình duyệt để sử dụng tính năng này.",
    gps_permission_denied_status: "Không có quyền định vị",
    gps_timeout: "Quá thời gian chờ tín hiệu định vị GPS. Đang dùng tâm Phố cổ Hội An.",
    gps_failed: "Không thể lấy vị trí GPS hiện tại. Đang dùng tâm Phố cổ Hội An.",
    gps_not_supported: "Trình duyệt hoặc môi trường hiện tại không hỗ trợ định vị GPS.",
    gps_success: "Đã định vị thành công vị trí thực tế của bạn.",
    gps_locating_btn: "Đang định vị...",
    unit_mins: "~{n} phút",
    tour_stops_suffix: "quán - Tối ưu TSP",
    tour_stop_prefix: "Trạm",
    tour_del_tooltip: "Bỏ quán này",
    tour_total_distance: "Tổng quãng đường Food Tour:",
    tour_start_from_user: "(Bắt đầu từ vị trí của bạn)",
    brand_sub: "Khám Phá & Chỉ Đường GPS Quán Ăn Hội An",
    lang_title: "Ngôn ngữ bản đồ / Language:",
    origin_label: "Điểm xuất phát",
    origin_current: "Vị trí hiện tại của tôi",
    origin_nguyen_thi_minh_khai: "Nguyễn Thị Minh Khai, Hội An",
    origin_chua_cau: "Chùa Cầu Hội An",
    origin_cho_hoi_an: "Chợ Hội An (Trần Phú)",
    origin_ben_thuyen: "Bến thuyền Bạch Đằng",
    origin_an_bang: "Bãi biển An Bàng",
    dest_label: "Chọn quán muốn đến",
    dest_placeholder: "-- Chọn quán ăn trên bản đồ --",
    radius_label: "Bán kính tìm kiếm",
    radius_500: "Trong 500m",
    radius_1000: "Trong 1.0 km",
    radius_2000: "Trong 2.0 km",
    radius_5000: "Trong 5.0 km",
    btn_scan: "Quét tìm quán",
    btn_my_loc: "Vị trí hiện tại",
    travel_mode_title: "Phương tiện chỉ đường:",
    mode_walking: "Đường bộ (Đi bộ)",
    mode_motorbike: "Đường xe máy",
    mode_driving: "Đường ô tô",
    mode_walking_speed: "~4.5 km/h",
    mode_motorbike_speed: "~25 km/h",
    mode_driving_speed: "~35 km/h",
    note_walking: "Đi bộ thuận tiện qua các tuyến phố đi bộ (Trần Phú, Nguyễn Thái Học, Chùa Cầu).",
    note_motorbike: "Xe máy linh hoạt qua các ngõ hẻm phố cổ và trục đường ven sông.",
    note_driving: "Ô tô ưu tiên các trục đường chính (Trần Hưng Đạo, Phan Châu Trinh, Hai Bà Trưng, Lý Thường Kiệt).",
    metric_eta: "Thời gian dự kiến",
    metric_dist: "Độ dài thực tế",
    metric_straight: "Đường chim bay",
    btn_gmaps_direct: "Mở chỉ đường Google Maps",
    nearby_title: "Quán ăn quanh đây",
    places_suffix: "quán",
    btn_directions: "Chỉ đường",
    btn_tour: "+ Tour",
    btn_selected: "✓ Đã chọn",
    distance_label: "Khoảng cách:",
    tsp_title: "Lộ trình Food Tour tối ưu (TSP)",
    btn_clear_tour: "Xóa tour",
    btn_open_gmaps_tour: "Mở Food Tour Google Maps",
    tsp_summary_prefix: "Hệ thống tự động sắp xếp thứ tự các quán ngắn nhất để bạn di chuyển thuận tiện nhất.",
    loading_dishes: "Đang tải danh sách quán ăn Hội An...",
    no_dishes_found: "Không tìm thấy quán nào trong bán kính đã chọn.",
    max_tour_alert: "Chỉ có thể chọn tối đa 4 quán cho một lộ trình Food Tour.",
    user_location_title: "Vị trí của bạn"
  },
  en: {
    origin_chua_cau_default: "Chua Cau / Japanese Bridge (Ancient Town - Default)",
    origin_my_real_gps: "My Real GPS Location",
    user_location_real: "Your Real GPS Location",
    gps_outside_hoian: "Located your real GPS ({dist}km from Hoi An). To explore ancient town cuisine, select Chua Cau as your starting point.",
    gps_locating: "Detecting satellite GPS coordinates...",
    gps_permission_denied: "Location permission denied. Please allow location access in your browser settings to use GPS navigation.",
    gps_permission_denied_status: "Location permission denied",
    gps_timeout: "GPS location request timed out. Continuing with Hoi An Ancient Town center.",
    gps_failed: "Unable to retrieve current GPS location. Continuing with Hoi An Ancient Town center.",
    gps_not_supported: "Your browser does not support or allow GPS geolocation.",
    gps_success: "Successfully acquired your real GPS coordinates.",
    gps_locating_btn: "Locating...",
    unit_mins: "~{n} mins",
    tour_stops_suffix: "stops - TSP Optimized",
    tour_stop_prefix: "Stop",
    tour_del_tooltip: "Remove stop",
    tour_total_distance: "Total Food Tour distance:",
    tour_start_from_user: "(Starting from your location)",
    brand_sub: "Explore & GPS Navigation for Hoi An Cuisine",
    lang_title: "Map Language:",
    origin_label: "Starting point",
    origin_current: "My current location",
    origin_nguyen_thi_minh_khai: "Nguyen Thi Minh Khai, Hoi An",
    origin_chua_cau: "Japanese Covered Bridge (Chua Cau)",
    origin_cho_hoi_an: "Hoi An Central Market (Tran Phu)",
    origin_ben_thuyen: "Bach Dang Boat Pier",
    origin_an_bang: "An Bang Beach",
    dest_label: "Select destination",
    dest_placeholder: "-- Select a restaurant on map --",
    radius_label: "Search radius",
    radius_500: "Within 500m",
    radius_1000: "Within 1.0 km",
    radius_2000: "Within 2.0 km",
    radius_5000: "Within 5.0 km",
    btn_scan: "Search Nearby",
    btn_my_loc: "Current Location",
    travel_mode_title: "Travel mode:",
    mode_walking: "Walking",
    mode_motorbike: "Motorbike",
    mode_driving: "Car / Driving",
    mode_walking_speed: "~4.5 km/h",
    mode_motorbike_speed: "~25 km/h",
    mode_driving_speed: "~35 km/h",
    note_walking: "Convenient walking route through pedestrian streets (Tran Phu, Nguyen Thai Hoc, Chua Cau).",
    note_motorbike: "Flexible motorbike route through ancient alleyways and riverside boulevards.",
    note_driving: "Car route following main thoroughfares (Tran Hung Dao, Phan Chau Trinh, Hai Ba Trung).",
    metric_eta: "Estimated time",
    metric_dist: "Actual distance",
    metric_straight: "Straight line",
    btn_gmaps_direct: "Open Google Maps Directions",
    nearby_title: "Nearby Restaurants",
    places_suffix: "places",
    btn_directions: "Directions",
    btn_tour: "+ Tour",
    btn_selected: "✓ Selected",
    distance_label: "Distance:",
    tsp_title: "Optimized Food Tour Route (TSP)",
    btn_clear_tour: "Clear tour",
    btn_open_gmaps_tour: "Open Food Tour on Google Maps",
    tsp_summary_prefix: "The system automatically optimizes the shortest sequence of stops for your tour.",
    loading_dishes: "Loading Hoi An dishes...",
    no_dishes_found: "No food spots found within selected radius.",
    max_tour_alert: "You can select up to 4 places for a Food Tour itinerary.",
    user_location_title: "Your location"
  },
  zh: {
    origin_chua_cau_default: "来远桥/日本廊桥（古镇中心 - 默认）",
    origin_my_real_gps: "我的即时真实GPS定位",
    user_location_real: "您的即时真实GPS位置",
    gps_outside_hoian: "已获取您的真实GPS（距会安{dist}公里）。如需探索古镇美食，请选择来远桥作为出发点。",
    gps_locating: "正在探测卫星GPS坐标...",
    gps_permission_denied: "应用未获得定位权限。请在浏览器设置中开启位置权限以使用此功能。",
    gps_permission_denied_status: "无定位权限",
    gps_timeout: "GPS定位请求超时。系统继续使用会安古镇中心。",
    gps_failed: "无法获取当前GPS位置。系统继续使用会安古镇中心。",
    gps_not_supported: "当前浏览器不支持或未开启GPS定位。",
    gps_success: "成功获取您的即时GPS坐标。",
    gps_locating_btn: "定位中...",
    unit_mins: "约 {n} 分钟",
    tour_stops_suffix: "站 - TSP路线最佳",
    tour_stop_prefix: "第",
    tour_del_tooltip: "移除此站",
    tour_total_distance: "美食路线总距离：",
    tour_start_from_user: "（从您的当前位置出发）",
    brand_sub: "会安特色美食探索与GPS智能导航",
    lang_title: "地图语言 / Language:",
    origin_label: "出发地点",
    origin_current: "我的当前位置",
    origin_nguyen_thi_minh_khai: "阮氏明开街 (Nguyễn Thị Minh Khai)",
    origin_chua_cau: "来远桥 / 日本廊桥 (Chùa Cầu)",
    origin_cho_hoi_an: "会安中心市场 (Trần Phú)",
    origin_ben_thuyen: "白藤码头 (Bạch Đằng)",
    origin_an_bang: "安邦海滩 (An Bàng)",
    dest_label: "选择美食目的地",
    dest_placeholder: "-- 在地图上选择餐厅 --",
    radius_label: "搜索范围",
    radius_500: "500米以内",
    radius_1000: "1.0公里以内",
    radius_2000: "2.0公里以内",
    radius_5000: "5.0公里以内",
    btn_scan: "搜索周边美食",
    btn_my_loc: "当前位置",
    travel_mode_title: "出行导航方式:",
    mode_walking: "步行",
    mode_motorbike: "摩托车",
    mode_driving: "汽车 / 驾车",
    mode_walking_speed: "约4.5公里/时",
    mode_motorbike_speed: "约25公里/时",
    mode_driving_speed: "约35公里/时",
    note_walking: "步行游览会安古城步行街（陈富街、阮太学街、日本廊桥）的最优路线。",
    note_motorbike: "摩托车路线，便捷穿行古街小巷及河畔景观道路。",
    note_driving: "驾车路线，优先经由主干道（陈兴道、潘周桢、二征街）。",
    metric_eta: "预计用时",
    metric_dist: "实际路程",
    metric_straight: "直线距离",
    btn_gmaps_direct: "在谷歌地图中打开导航",
    nearby_title: "周边特色美食",
    places_suffix: "家餐厅",
    btn_directions: "路线导航",
    btn_tour: "+ 美食路线",
    btn_selected: "✓ 已加入",
    distance_label: "距离:",
    tsp_title: "优化美食路线 (TSP)",
    btn_clear_tour: "清空路线",
    btn_open_gmaps_tour: "在谷歌地图中打开美食路线",
    tsp_summary_prefix: "系统自动计算最短途经顺序，为您规划省时便捷的美食路线。",
    loading_dishes: "正在载入会安美食数据...",
    no_dishes_found: "在所选范围内未找到美食餐厅。",
    max_tour_alert: "每个美食路线最多只能选择4家餐厅。",
    user_location_title: "您的位置"
  },
  ko: {
    origin_chua_cau_default: "내원교 / 처우꺼우 (고대 도시 중심 - 기본)",
    origin_my_real_gps: "나의 실제 GPS 위치",
    user_location_real: "당신의 실제 GPS 위치",
    gps_outside_hoian: "실제 GPS가 확인되었습니다(호이안에서 {dist}km). 고대 도시 맛집을 둘러보시려면 내원교(Chua Cau)를 출발지로 선택하세요.",
    gps_locating: "위성 GPS 위치 감지 중...",
    gps_permission_denied: "애플리케이션에 위치 권한이 없습니다. 이 기능을 사용하려면 브라우저 설정에서 위치 권한을 허용해주세요.",
    gps_permission_denied_status: "위치 권한 없음",
    gps_timeout: "GPS 위치 요청 시간이 초과되었습니다. 호이안 구시가지 중심을 계속 사용합니다.",
    gps_failed: "현재 GPS 위치를 가져올 수 없습니다. 호이안 구시가지 중심을 계속 사용합니다.",
    gps_not_supported: "현재 브라우저에서 GPS 위치 서비스를 지원하지 않거나 허용되지 않았습니다.",
    gps_success: "실제 GPS 좌표를 성공적으로 가져왔습니다.",
    gps_locating_btn: "위치 확인 중...",
    unit_mins: "약 {n}분",
    tour_stops_suffix: "개소 - TSP 최적화",
    tour_stop_prefix: "경유지",
    tour_del_tooltip: "경유지 삭제",
    tour_total_distance: "총 맛집 투어 거리:",
    tour_start_from_user: "(현재 내 위치에서 출발)",
    brand_sub: "호이안 미식 탐방 및 GPS 스마트 길찾기",
    lang_title: "지도 언어 / Language:",
    origin_label: "출발 위치",
    origin_current: "내 현재 위치",
    origin_nguyen_thi_minh_khai: "응우옌티민카이 거리",
    origin_chua_cau: "내원교 / 일본다리 (Chùa Cầu)",
    origin_cho_hoi_an: "호이안 중앙시장 (Trần Phú)",
    origin_ben_thuyen: "박당 유람선 선착장",
    origin_an_bang: "안방 해변",
    dest_label: "도착지 맛집 선택",
    dest_placeholder: "-- 지도에서 맛집 선택 --",
    radius_label: "검색 반경",
    radius_500: "500m 이내",
    radius_1000: "1.0km 이내",
    radius_2000: "2.0km 이내",
    radius_5000: "5.0km 이내",
    btn_scan: "주변 맛집 검색",
    btn_my_loc: "현재 위치",
    travel_mode_title: "이동 수단:",
    mode_walking: "도보",
    mode_motorbike: "오토바이",
    mode_driving: "자동차 / 운전",
    mode_walking_speed: "약 4.5km/h",
    mode_motorbike_speed: "약 25km/h",
    mode_driving_speed: "약 35km/h",
    note_walking: "보행자 전용 거리(쩐푸, 응우옌타이학, 내원교)를 통과하는 최적 도보 코스입니다.",
    note_motorbike: "골목길과 강변 도로를 편리하게 오갈 수 있는 오토바이 코스입니다.",
    note_driving: "주요 간선도로(쩐흥다오, 판쩌우찐, 하이바쯩)를 경유하는 차량 경로입니다.",
    metric_eta: "예상 시간",
    metric_dist: "실제 거리",
    metric_straight: "직선 거리",
    btn_gmaps_direct: "구글 지도에서 길찾기 열기",
    nearby_title: "주변 인기 맛집",
    places_suffix: "곳",
    btn_directions: "길찾기",
    btn_tour: "+ 투어",
    btn_selected: "✓ 선택됨",
    distance_label: "거리:",
    tsp_title: "최적의 푸드 투어 코스 (TSP)",
    btn_clear_tour: "투어 삭제",
    btn_open_gmaps_tour: "구글 지도에서 푸드 투어 열기",
    tsp_summary_prefix: "시스템이 최단 순서를 자동으로 계산하여 둘러보시기 편리하게 안내합니다.",
    loading_dishes: "호이안 맛집 정보를 불러오는 중...",
    no_dishes_found: "선택한 반경 내에 등록된 맛집이 없습니다.",
    max_tour_alert: "푸드 투어 코스는 최대 4곳까지 선택할 수 있습니다.",
    user_location_title: "현재 내 위치"
  },
  ja: {
    origin_chua_cau_default: "来遠橋 / 日本橋（旧市街中心 - デフォルト）",
    origin_my_real_gps: "私の実際のGPS現在地",
    user_location_real: "あなたの実際のGPS現在地",
    gps_outside_hoian: "実際のGPSを取得しました（ホイアンから{dist}km）。旧市街のグルメを探索する場合は、来遠橋（Chua Cau）を出発地に選択してください。",
    gps_locating: "衛星GPS座標を測位中...",
    gps_permission_denied: "位置情報の利用権限がありません。ブラウザの設定で位置情報の利用を許可してください。",
    gps_permission_denied_status: "位置情報権限なし",
    gps_timeout: "GPS位置情報の取得がタイムアウトしました。ホイアン旧市街中心を引き続き使用します。",
    gps_failed: "現在のGPS位置情報を取得できませんでした。ホイアン旧市街中心を引き続き使用します。",
    gps_not_supported: "ご利用のブラウザはGPS位置情報に対応していないか、許可されていません。",
    gps_success: "実際のGPS座標を取得しました。",
    gps_locating_btn: "位置情報取得中...",
    unit_mins: "約 {n}分",
    tour_stops_suffix: "箇所 - TSP最適化",
    tour_stop_prefix: "経由地",
    tour_del_tooltip: "この地点を削除",
    tour_total_distance: "総ツアールート距離：",
    tour_start_from_user: "（現在地からスタート）",
    brand_sub: "ホイアングルメ探索＆GPSスマート道案内",
    lang_title: "地図言語 / Language:",
    origin_label: "出発地",
    origin_current: "現在地",
    origin_nguyen_thi_minh_khai: "グエンティミンカイ通り",
    origin_chua_cau: "日本橋 / 来遠橋 (Chùa Cầu)",
    origin_cho_hoi_an: "ホイアン中央市場 (Trần Phú)",
    origin_ben_thuyen: "バクダン船着場",
    origin_an_bang: "アンバンビーチ",
    dest_label: "目的地（店舗）を選択",
    dest_placeholder: "-- 地図から店舗を選択 --",
    radius_label: "検索範囲",
    radius_500: "500m以内",
    radius_1000: "1.0km以内",
    radius_2000: "2.0km以内",
    radius_5000: "5.0km以内",
    btn_scan: "周辺の店舗を検索",
    btn_my_loc: "現在地",
    travel_mode_title: "移動手段:",
    mode_walking: "徒歩",
    mode_motorbike: "バイク",
    mode_driving: "自動車 / ドライブ",
    mode_walking_speed: "約4.5km/h",
    mode_motorbike_speed: "約25km/h",
    mode_driving_speed: "約35km/h",
    note_walking: "旧市街の歩行者天国（チャンフー通り、グエンタイホック通り、日本橋）を通る最短徒歩ルートです。",
    note_motorbike: "路地や川沿いの通りをスピーディに移動できるバイク向けルートです。",
    note_driving: "幹線道路（チャンフンダオ通り、ファンチャウチン通りなど）を通る車向けルートです。",
    metric_eta: "所要時間（目安）",
    metric_dist: "実際の道のり",
    metric_straight: "直線距離",
    btn_gmaps_direct: "Googleマップで道案内を開く",
    nearby_title: "周辺のグルメ店舗",
    places_suffix: "件",
    btn_directions: "道案内",
    btn_tour: "+ ツアー",
    btn_selected: "✓ 選択済み",
    distance_label: "距離:",
    tsp_title: "最適化フードツアールート (TSP)",
    btn_clear_tour: "ツアーをクリア",
    btn_open_gmaps_tour: "Googleマップでフードツアーを開く",
    tsp_summary_prefix: "最短ルートで巡れるよう、訪問順序を自動で最適化します。",
    loading_dishes: "ホイアンのグルメ情報を読み込み中...",
    no_dishes_found: "指定の範囲内に店舗が見つかりませんでした。",
    max_tour_alert: "1つのフードツアーで選択できる店舗は最大4件です。",
    user_location_title: "あなたの現在地"
  }
};

const DEFAULT_DISHES = [
  {
        "id": 4,
        "lat": 15.8765,
        "lng": 108.3312,
        "image": "https://images.unsplash.com/photo-1555126634-323283e090fa?w=400",
        "translations": {
              "vi": {
                    "name": "Quán Cao lầu Bá Le",
                    "address": "26 Trần Quý Cáp, Old Town, Hội An, Đà Nẵng, Việt Nam"
              },
              "en": {
                    "name": "Traditional Hoi An Cao Lau Noodles",
                    "address": "26 Tran Quy Cap, Old Town, Hoi An, Da Nang, Vietnam"
              },
              "zh": {
                    "name": "会安传统高楼面 (Cao Lầu Bá Lễ)",
                    "address": "陈贵合街26号, 会安古镇, 越南"
              },
              "ko": {
                    "name": "호이안 전통 까오러우 (바레 까오러우)",
                    "address": "26 쩐꾸이깝, 호이안 고대도시, 베트남"
              },
              "ja": {
                    "name": "ホイアン伝統カオラウ（バーレー・カオラウ）",
                    "address": "チャンクイカップ通り26, ホイアン旧市街"
              }
        }
  },
  {
        "id": 6,
        "lat": 15.8795,
        "lng": 108.3301,
        "image": "https://images.unsplash.com/photo-1509722747041-616f39b57569?w=400",
        "translations": {
              "vi": {
                    "name": "Bánh Mì Phượng",
                    "address": "2B Phan Châu Trinh, Hội An"
              },
              "en": {
                    "name": "Hoi An Crispy Baguette (Banh Mi Phuong)",
                    "address": "2B Phan Chau Trinh, Hoi An"
              },
              "zh": {
                    "name": "会安炭烤法棍三明治 (Bánh Mì Phượng)",
                    "address": "潘周桢街2B号, 会安"
              },
              "ko": {
                    "name": "호이안 크리스피 반미 (반미 프엉)",
                    "address": "2B 판쩌우찐, 호이안"
              },
              "ja": {
                    "name": "ホイアン炭火焼きバインミー（バインミー・フオン）",
                    "address": "ファンチャウチン通り2B, ホイアン"
              }
        }
  },
  {
        "id": 7,
        "lat": 15.877057,
        "lng": 108.329936,
        "image": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400",
        "translations": {
              "vi": {
                    "name": "Bánh Bèo Bà Bảy",
                    "address": "2 Hoàng Văn Thụ, Old Town, Hội An, Đà Nẵng, Việt Nam"
              },
              "en": {
                    "name": "Crispy Roast Pork Vermicelli (Banh Beo Ba Bay)",
                    "address": "2 Hoang Van Thu, Old Town, Hoi An, Da Nang, Vietnam"
              },
              "zh": {
                    "name": "脆皮烧肉菠萝鱼露拌米粉 (Bánh Bèo Bà Bảy)",
                    "address": "黄文树街2号, 会安古镇, 越南"
              },
              "ko": {
                    "name": "바삭한 구운 삼겹살 비빔 쌀국수 (반베오 바베이)",
                    "address": "2 황반투, 호이안 고대도시, 베트남"
              },
              "ja": {
                    "name": "カリカリ焼き豚の発酵魚醤ビーフン（バンベオ・バーバイ）",
                    "address": "ホアンヴァンツー通り2, ホイアン旧市街"
              }
        }
  },
  {
        "id": 8,
        "lat": 15.87335,
        "lng": 108.33685,
        "image": "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400",
        "translations": {
              "vi": {
                    "name": "Bánh đập Ni Bà Già",
                    "address": "34 Nguyễn Tri Phương, Hội An, Đà Nẵng, Việt Nam"
              },
              "en": {
                    "name": "Cracked Rice Paper & Stir-Fried Baby Clams (Banh Dap Ba Gia)",
                    "address": "34 Nguyen Tri Phuong, Hoi An, Da Nang, Vietnam"
              },
              "zh": {
                    "name": "锦南香炒河蚬配脆拍米饼 (Bánh Đập Bà Già)",
                    "address": "阮知方街34号, 会安, 越南"
              },
              "ko": {
                    "name": "바삭한 반답 크래커와 깜남 재첩 볶음 (반답 바지아)",
                    "address": "34 응우옌찌프엉, 호이안, 베트남"
              },
              "ja": {
                    "name": "バインダップ（割れせんべい）とシジミ炒め（バインダップ・バージャー）",
                    "address": "グエンチーフオン通り34, ホイアン"
              }
        }
  },
  {
        "id": 9,
        "lat": 15.8765,
        "lng": 108.328,
        "image": "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400",
        "translations": {
              "vi": {
                    "name": "Bánh Ướt Ban Mê Giang Vương",
                    "address": "86/23 Vũ Huy Tấn, Gia Định, Hồ Chí Minh 72317, Việt Nam"
              },
              "en": {
                    "name": "Ban Me Wet Cake (Banh Uot Ban Me Giang Vuong)",
                    "address": "86/23 Vu Huy Tan, Gia Dinh, Ho Chi Minh 72317, Vietnam"
              },
              "zh": {
                    "name": "班迷蒸米卷皮 (Bánh Ướt Ban Mê Giang Vương)",
                    "address": "胡志明市嘉定武辉晋街86/23号"
              },
              "ko": {
                    "name": "반메 젖은 쌀전병 (반uot 반메 지앙브엉)",
                    "address": "86/23 부후이떤, 호치민, 베트남"
              },
              "ja": {
                    "name": "バンメ蒸し生春巻き皮（バンウオット・バンメ）",
                    "address": "ホーチミン市ヴーフィータン通り86/23"
              }
        }
  },
  {
        "id": 11,
        "lat": 15.877801,
        "lng": 108.332363,
        "image": "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=400",
        "translations": {
              "vi": {
                    "name": "Trà mót",
                    "address": "150 Trần Phú, Old Town, Hội An, Đà Nẵng 550000, Việt Nam"
              },
              "en": {
                    "name": "Mot Lotus Petal Herbal Lemongrass Tea",
                    "address": "150 Tran Phu, Old Town, Hoi An, Da Nang 550000, Vietnam"
              },
              "zh": {
                    "name": "会安荷花瓣九味草本柠檬香茅茶 (Trà Mót)",
                    "address": "陈富街150号, 会安古镇, 越南"
              },
              "ko": {
                    "name": "연꽃잎 레몬그라스 한방 허브티 (느억못 / 트라못)",
                    "address": "150 쩐푸, 호이안 고대도시, 베트남"
              },
              "ja": {
                    "name": "蓮の花びら添え・9種ハーブのレモングラス茶（モット茶）",
                    "address": "チャンフー通り150, ホイアン旧市街"
              }
        }
  }
];

    let allDishes = [];
let mapInstance = null;
let userCoords = { lat: 15.8773, lng: 108.3259 };    let userMarker = null;
let radiusCircle = null;
let dishMarkers = [];
let selectedDestDish = null;
let routePolyline = null;

function setMapLanguage(lang) {
  if (!I18N[lang]) lang = 'vi';
  currentMapLang = lang;
  localStorage.setItem('customer_map_lang', lang);

  document.querySelectorAll('.map-lang-pill').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === lang);
  });

  const t = I18N[lang];

  const subEl = document.querySelector('.brand-subtitle');
  if (subEl) subEl.textContent = t.brand_sub;

  const langTitleEl = document.getElementById('mapLangTitle');
  if (langTitleEl) langTitleEl.textContent = t.lang_title;

  const originLabel = document.querySelector('.form-group-origin .form-label');
  if (originLabel) originLabel.textContent = t.origin_label;

  const destLabel = document.querySelector('.form-group-dest .form-label');
  if (destLabel) destLabel.textContent = t.dest_label;

  const radiusLabel = document.querySelector('.form-group-radius .form-label');
  if (radiusLabel) radiusLabel.textContent = t.radius_label;

  const origSel = document.getElementById('cOriginSelect');
  if (origSel) {
    const gpsOpt = origSel.querySelector('option[value="gps"]');
    if (gpsOpt) {
      if (userCoords && userCoords.isRealGps) {
        gpsOpt.textContent = '' + (t.origin_current || 'Vị trí GPS của tôi') + ' (' + userCoords.lat.toFixed(4) + ', ' + userCoords.lng.toFixed(4) + ')';
      } else {
        gpsOpt.textContent = '' + (t.origin_current || 'Vị trí GPS của tôi');
      }
    }
    const optChuaCau = origSel.querySelector('option[value="15.8773,108.3259"]');
    if (optChuaCau) optChuaCau.textContent = t.origin_chua_cau || 'Chùa Cầu Hội An';

    const optMinhKhai = origSel.querySelector('option[value="15.8768,108.3248"]');
    if (optMinhKhai) optMinhKhai.textContent = t.origin_nguyen_thi_minh_khai || 'Nguyễn Thị Minh Khai, Hội An';

    const optCho = origSel.querySelector('option[value="15.8788,108.3325"]');
    if (optCho) optCho.textContent = t.origin_cho_hoi_an || 'Chợ Hội An (Trần Phú)';

    const optBenThuyen = origSel.querySelector('option[value="15.8762,108.3294"]');
    if (optBenThuyen) optBenThuyen.textContent = t.origin_ben_thuyen || 'Bến thuyền Bạch Đằng';

    const optAnBang = origSel.querySelector('option[value="15.9083,108.3364"]');
    if (optAnBang) optAnBang.textContent = t.origin_an_bang || 'Bãi biển An Bàng';
  }

  const radSel = document.getElementById('cRadiusSelect');
  if (radSel && radSel.options && radSel.options.length >= 4) {
    radSel.options[0].textContent = t.radius_500;
    radSel.options[1].textContent = t.radius_1000;
    radSel.options[2].textContent = t.radius_2000;
    radSel.options[3].textContent = t.radius_5000;
  }

  const btnScan = document.getElementById('btnRadarScan');
  if (btnScan) btnScan.textContent = t.btn_scan;

  const btnGps = document.getElementById('btnGetGps');
  if (btnGps) btnGps.textContent = t.btn_my_loc;

  const tmTitle = document.querySelector('.travel-modes-label');
  if (tmTitle) tmTitle.textContent = t.travel_mode_title;

  const btnWalk = document.getElementById('modeBtnWalking');
  if (btnWalk) {
    btnWalk.innerHTML = '<span>' + t.mode_walking + '</span><span class="mode-speed">' + t.mode_walking_speed + '</span>';
  }
  const btnMoto = document.getElementById('modeBtnMotorbike');
  if (btnMoto) {
    btnMoto.innerHTML = '<span>' + t.mode_motorbike + '</span><span class="mode-speed">' + t.mode_motorbike_speed + '</span>';
  }
  const btnDrive = document.getElementById('modeBtnDriving');
  if (btnDrive) {
    btnDrive.innerHTML = '<span>' + t.mode_driving + '</span><span class="mode-speed">' + t.mode_driving_speed + '</span>';
  }

  const etaLabel = document.querySelector('.eta-pill .metric-label');
  if (etaLabel) etaLabel.textContent = t.metric_eta;

  const distLabel = document.querySelector('.dist-pill .metric-label');
  if (distLabel) distLabel.textContent = t.metric_dist;

  const straightLabel = document.querySelector('.straight-pill .metric-label');
  if (straightLabel) straightLabel.textContent = t.metric_straight;

  const btnGmapsDirect = document.getElementById('btnGmapsDirect');
  if (btnGmapsDirect) btnGmapsDirect.textContent = t.btn_gmaps_direct;

  const nearbyTitleEl = document.querySelector('.dishes-panel-title');
  if (nearbyTitleEl) nearbyTitleEl.textContent = t.nearby_title;

  if (selectedDestDish) {
    selectDestinationById(selectedDestDish.id);
  }

  try {
    if (window.parent && window.parent !== window) {
      window.parent.postMessage({ type: 'MAP_LANG_CHANGED', lang }, '*');
    }
  } catch (e) {}

  loadDishesData();
}

window.addEventListener('message', (event) => {
  if (event.data && (event.data.type === 'CHANGE_LANG' || event.data.type === 'SET_LANG') && event.data.lang) {
    setMapLanguage(event.data.lang);
  }
});

function calcHaversine(lat1, lon1, lat2, lon2) {
  const R = 6371000;      const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return Math.round(R * c);
}

function formatDistance(meters) {
  if (!meters || isNaN(meters)) return "--";
  if (meters < 1000) return meters + " m";
  return (meters / 1000).toFixed(2) + " km";
}

function initMap() {
  mapInstance = L.map('customerLeafletMap', {
    zoomControl: true,
    scrollWheelZoom: true
  }).setView([userCoords.lat, userCoords.lng], 16);

  const googleRoadmap = L.tileLayer('https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
    maxZoom: 20,
    attribution: '© Google Maps | Hội An'
  });

  const googleSatellite = L.tileLayer('https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}', {
    maxZoom: 20,
    attribution: '© Google Maps Vệ Tinh'
  });

  googleRoadmap.addTo(mapInstance);

  L.control.layers({
    "Bản đồ đường phố": googleRoadmap,
    "Ảnh vệ tinh": googleSatellite
  }, null, { position: 'topright' }).addTo(mapInstance);

  updateUserMarker(userCoords.lat, userCoords.lng, 'Vị trí của bạn');
}

function updateUserMarker(lat, lng, label) {
  userCoords = { lat, lng };
  if (!mapInstance) return;

  if (userMarker) {
    userMarker.setLatLng([lat, lng]);
  } else {
    const userIcon = L.divIcon({
      className: 'custom-user-marker',
      html: '<div class="user-marker-pin"><div class="user-marker-pulse"></div><div class="user-marker-core"></div></div>',
      iconSize: [34, 34],
      iconAnchor: [17, 17]
    });
    userMarker = L.marker([lat, lng], { icon: userIcon, zIndexOffset: 1000 }).addTo(mapInstance);
  }
  userMarker.bindTooltip(label || 'Vị trí của bạn', { permanent: false, direction: 'top' });

  const radiusMeters = parseInt(document.getElementById('cRadiusSelect').value) || 1000;
  if (radiusCircle) {
    radiusCircle.setLatLng([lat, lng]);
    radiusCircle.setRadius(radiusMeters);
  } else {
    radiusCircle = L.circle([lat, lng], {
      radius: radiusMeters,
      color: '#8b1d24',
      weight: 1.5,
      fillColor: '#8b1d24',
      fillOpacity: 0.08,
      dashArray: '4, 4'
    }).addTo(mapInstance);
  }
}

function showGpsNotice(msg, type = 'warning', alsoAlert = true) {
  const banner = document.getElementById('gpsNoticeBanner');
  const msgEl = document.getElementById('gpsNoticeMsg');
  const iconEl = document.getElementById('gpsNoticeIcon');
  if (banner && msgEl) {
    banner.className = 'gps-notice-banner ' + type;
    msgEl.textContent = msg;
    if (iconEl) {
      iconEl.textContent = '';
    }
    banner.style.display = 'flex';
  }
  if (alsoAlert) {
    try {
      alert(msg);
    } catch (e) {
      console.warn('Alert suppressed:', e);
    }
  }
}

function getInstantGps() {
  const statusEl = document.getElementById('gpsLiveStatus');
  const origSel = document.getElementById('cOriginSelect');
  const btnGps = document.getElementById('btnGetGps');
  const t = I18N[currentMapLang] || I18N.vi;

  if (!navigator.geolocation) {
    const notSupportedMsg = t.gps_not_supported || 'Trình duyệt không hỗ trợ hoặc không cho phép định vị GPS.';
    showGpsNotice(notSupportedMsg, 'warning', true);
    return;
  }
  if (btnGps) {
    btnGps.textContent = t.gps_locating_btn || 'Đang định vị...';
  }
  if (statusEl) statusEl.textContent = t.gps_locating || 'Đang dò tìm tọa độ GPS vệ tinh...';

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;
      userCoords = { lat, lng, isRealGps: true };

      if (btnGps) {
        btnGps.textContent = t.btn_my_loc || 'Vị trí hiện tại';
      }

      updateUserMarker(lat, lng, t.user_location_real || 'Vị trí GPS thực tế của bạn');
      mapInstance.setView([lat, lng], 16);
      if (statusEl) statusEl.textContent = 'GPS chính xác (±' + Math.round(pos.coords.accuracy) + 'm)';

      if (origSel) {
        let gpsOpt = origSel.querySelector('option[value="gps"]');
        if (!gpsOpt) {
          gpsOpt = document.createElement('option');
          gpsOpt.value = 'gps';
          origSel.insertBefore(gpsOpt, origSel.firstChild);
        }
        gpsOpt.textContent = (t.btn_my_loc || 'Vị trí hiện tại') + ' (' + lat.toFixed(4) + ', ' + lng.toFixed(4) + ')';
        origSel.value = 'gps';
      }

      const distToHoiAn = calcHaversine(lat, lng, 15.8773, 108.3259);
      if (distToHoiAn > 20000) {
        const distKm = Math.round(distToHoiAn / 1000);
        if (statusEl) statusEl.textContent = 'GPS: ' + distKm + 'km từ Hội An';
        showGpsNotice(t.gps_outside_hoian ? t.gps_outside_hoian.replace('{dist}', distKm) : ('Đã nhận GPS thực tế (' + distKm + 'km từ Hội An).'), 'info', false);
      } else {
        showGpsNotice((t.gps_success || 'Đã định vị thành công vị trí thực tế của bạn.') + ' (' + lat.toFixed(4) + ', ' + lng.toFixed(4) + ')', 'success', false);
      }

      runRadarScan();
      if (selectedDestDish) selectDestinationById(selectedDestDish.id);        },
    (err) => {
      console.warn('GPS error handled safely, avoiding app crash:', err);
      if (btnGps) {
        btnGps.textContent = t.btn_my_loc || 'Vị trí hiện tại';
      }

      let errMsg = '';
      if (err && err.code === 1) {
        errMsg = t.gps_permission_denied || 'Ứng dụng không có quyền định vị. Vui lòng cấp quyền truy cập vị trí trong cài đặt trình duyệt để sử dụng tính năng này.';
        if (statusEl) statusEl.textContent = t.gps_permission_denied_status || 'Không có quyền định vị';
      } else if (err && err.code === 3) {
        errMsg = t.gps_timeout || 'Quá thời gian chờ tín hiệu định vị GPS. Đang dùng tâm Phố cổ Hội An.';
        if (statusEl) statusEl.textContent = 'Hết thời gian chờ GPS';
      } else {
        errMsg = t.gps_failed || 'Không thể lấy vị trí GPS hiện tại. Đang dùng tâm Phố cổ Hội An.';
        if (statusEl) statusEl.textContent = 'Không lấy được GPS';
      }

      showGpsNotice(errMsg, 'warning', true);

      try {
        if (!userCoords) {
          userCoords = { lat: 15.8773, lng: 108.3259, isRealGps: false };
        }
        runRadarScan();
      } catch (safeErr) {
        console.error('Safe fallback error suppressed:', safeErr);
      }
    },
    { enableHighAccuracy: true, timeout: 10000, maximumAge: 10000 }
  );
}

function renderDishes(dishesToRender) {
  const t = I18N[currentMapLang] || I18N.vi;

  dishMarkers.forEach(m => mapInstance.removeLayer(m));
  dishMarkers = [];

  const listContainer = document.getElementById('nearbyDishesList');
  const badge = document.getElementById('dishesCountBadge');
  if (badge) {
    badge.textContent = dishesToRender.length + ' ' + (t.places_suffix || 'quán');
  }

  if (dishesToRender.length === 0) {
    listContainer.innerHTML = '<div style="text-align:center; padding:30px; color:#9ca3af; font-size:13px;">' + (t.no_dishes_found || 'Không tìm thấy quán nào trong bán kính đã chọn.') + '</div>';
    return;
  }

  listContainer.innerHTML = '';

  dishesToRender.forEach(d => {
    const dist = calcHaversine(userCoords.lat, userCoords.lng, d.lat, d.lng);
    d._dist = dist;

    const dishIcon = L.divIcon({
      className: 'custom-dish-marker',
      html: '<div class="dish-marker-pin"><div class="dish-marker-bubble"></div><div class="dish-marker-tip"></div></div>',
      iconSize: [32, 38],
      iconAnchor: [16, 38],
      popupAnchor: [0, -36]
    });

    const marker = L.marker([d.lat, d.lng], { icon: dishIcon }).addTo(mapInstance);
    
    marker.bindTooltip(d.name, {
      permanent: true,
      direction: 'bottom',
      className: 'dish-marker-label',
      offset: [0, 4]
    });
    
    const popupHtml = `
      <div class="popup-box">
        <img class="popup-img" src="${d.image || 'https://images.unsplash.com/photo-1555126634-323283e090fa?w=400'}" alt="${d.name}" />
        <div class="popup-body">
          <h4 class="popup-title">${d.name}</h4>
          <p class="popup-addr">${d.address || 'Hội An, Quảng Nam'}</p>
          <p class="popup-dist">${t.distance_label || 'Khoảng cách:'} ${formatDistance(dist)}</p>
          <div class="popup-mode-chips">
            <button type="button" class="popup-mode-chip ${currentTravelMode === 'walking' ? 'active' : ''}" data-mode="walking" onclick="setTravelModeAndRoute('walking', ${d.id})">${t.mode_walking}</button>
            <button type="button" class="popup-mode-chip ${currentTravelMode === 'motorbike' ? 'active' : ''}" data-mode="motorbike" onclick="setTravelModeAndRoute('motorbike', ${d.id})">${t.mode_motorbike}</button>
            <button type="button" class="popup-mode-chip ${currentTravelMode === 'driving' ? 'active' : ''}" data-mode="driving" onclick="setTravelModeAndRoute('driving', ${d.id})">${t.mode_driving}</button>
          </div>
          <div class="popup-btns">
            <button class="popup-btn popup-btn-route" onclick="selectDestinationById(${d.id})">${t.btn_directions}</button>
            <a class="popup-btn popup-btn-gmap" id="popupGmapsBtn_${d.id}" href="https://www.google.com/maps/dir/?api=1&destination=${d.lat},${d.lng}&travelmode=${TRAVEL_MODES[currentTravelMode].gmapsMode}" target="_blank">Google Maps</a>
          </div>
        </div>
      </div>
    `;
    marker.bindPopup(popupHtml, { maxWidth: 260 });
    dishMarkers.push(marker);

    const card = document.createElement('div');
    card.className = 'dish-card';
    card.innerHTML = `
      <img class="dish-img" src="${d.image || 'https://images.unsplash.com/photo-1555126634-323283e090fa?w=400'}" alt="${d.name}" />
      <div class="dish-info">
        <h4 class="dish-title">${d.name}</h4>
        <p class="dish-addr">${d.address || 'Hội An'}</p>
        <div class="dish-actions">
          <button class="dish-btn-sm" onclick="selectDestinationById(${d.id}); event.stopPropagation();">
            ${t.btn_directions}
          </button>
          <span class="dish-dist">${formatDistance(dist)}</span>
        </div>
      </div>
    `;
    card.onclick = () => {
      mapInstance.setView([d.lat, d.lng], 16);
      marker.openPopup();
    };
    listContainer.appendChild(card);
  });
}

function runRadarScan() {
  const radiusMeters = parseInt(document.getElementById('cRadiusSelect').value) || 1000;
  const origSel = document.getElementById('cOriginSelect');
  const originLabel = (origSel && origSel.options[origSel.selectedIndex]?.textContent) || 'Điểm xuất phát';
  updateUserMarker(userCoords.lat, userCoords.lng, originLabel);

  const filtered = allDishes.filter(d => {
    if (!d.lat || !d.lng) return false;
    const dist = calcHaversine(userCoords.lat, userCoords.lng, d.lat, d.lng);
    return dist <= radiusMeters;
  });

  filtered.sort((a, b) => {
    const da = calcHaversine(userCoords.lat, userCoords.lng, a.lat, a.lng);
    const db = calcHaversine(userCoords.lat, userCoords.lng, b.lat, b.lng);
    return da - db;
  });

  renderDishes(filtered);

  if (radiusCircle) {
    mapInstance.fitBounds(radiusCircle.getBounds(), { padding: [30, 30] });
  }
}

let currentTravelMode = 'walking';
const TRAVEL_MODES = {
  walking: {
    label: 'Đường bộ (Đi bộ)',
    icon: '',
    osrmProfile: 'foot',
    gmapsMode: 'walking',
    speedKmH: 4.5,
    color: '#059669',        weight: 6,
    note: 'Đi bộ thuận tiện qua các tuyến phố đi bộ (Trần Phú, Nguyễn Thái Học, Chùa Cầu).'
  },
  motorbike: {
    label: 'Đường xe máy',
    icon: '',
    osrmProfile: 'driving',
    gmapsMode: 'two_wheeler',
    speedKmH: 25,
    color: '#ea580c',        weight: 6,
    note: 'Xe máy linh hoạt qua các ngõ hẻm phố cổ và trục đường ven sông.'
  },
  driving: {
    label: 'Đường ô tô',
    icon: '',
    osrmProfile: 'driving',
    gmapsMode: 'driving',
    speedKmH: 35,
    color: '#8b1d24',        weight: 7,
    note: 'Ô tô ưu tiên các trục đường chính (Trần Hưng Đạo, Phan Châu Trinh, Hai Bà Trưng, Lý Thường Kiệt).'
  }
};

function setTravelMode(mode) {
  if (!TRAVEL_MODES[mode]) return;
  currentTravelMode = mode;

  document.querySelectorAll('.travel-mode-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.mode === mode);
  });

  document.querySelectorAll('.popup-mode-chip').forEach(chip => {
    chip.classList.toggle('active', chip.dataset.mode === mode);
  });

  if (selectedDestDish) {
    selectDestinationById(selectedDestDish.id);
  }
}

window.setTravelModeAndRoute = function(mode, dishId) {
  setTravelMode(mode);
  selectDestinationById(dishId);
};

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.travel-mode-btn').forEach(btn => {
    btn.addEventListener('click', () => setTravelMode(btn.dataset.mode));
  });
});


function getRouterUrlsForPoints(coordsStr, travelMode) {
  if (travelMode === 'walking') {
    return [
      `https://routing.openstreetmap.de/routed-foot/route/v1/foot/${coordsStr}?overview=full&geometries=geojson`,
      `https://router.project-osrm.org/route/v1/foot/${coordsStr}?overview=full&geometries=geojson`,
      `https://router.project-osrm.org/route/v1/driving/${coordsStr}?overview=full&geometries=geojson`
    ];
  } else if (travelMode === 'motorbike') {
    return [
      `https://routing.openstreetmap.de/routed-bike/route/v1/driving/${coordsStr}?overview=full&geometries=geojson`,
      `https://router.project-osrm.org/route/v1/driving/${coordsStr}?overview=full&geometries=geojson`
    ];
  } else {
    return [
      `https://routing.openstreetmap.de/routed-car/route/v1/driving/${coordsStr}?overview=full&geometries=geojson`,
      `https://router.project-osrm.org/route/v1/driving/${coordsStr}?overview=full&geometries=geojson`
    ];
  }
}

async function getRouteSegment(fromPt, toPt, travelMode) {
  const coordsStr = `${fromPt.lng},${fromPt.lat};${toPt.lng},${toPt.lat}`;
  const urls = getRouterUrlsForPoints(coordsStr, travelMode);

  for (const u of urls) {
    try {
      const res = await fetch(u);
      if (res.ok) {
        const data = await res.json();
        if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
          const route = data.routes[0];
          return {
            coords: route.geometry.coordinates.map(pt => [pt[1], pt[0]]),
            distance: Math.round(route.distance)
          };
        }
      }
    } catch (e) {
    }
  }

  const directDist = calcHaversine(fromPt.lat, fromPt.lng, toPt.lat, toPt.lng);
  return {
    coords: [[fromPt.lat, fromPt.lng], [toPt.lat, toPt.lng]],
    distance: Math.round(directDist * 1.25)
  };
}

async function selectDestinationById(dishId) {
  const dish = allDishes.find(d => d.id === dishId);
  if (!dish) return;
  selectedDestDish = dish;

  document.getElementById('cDestSelect').value = dish.id;

  const modeInfo = TRAVEL_MODES[currentTravelMode] || TRAVEL_MODES.walking;

  const haversineMeters = calcHaversine(userCoords.lat, userCoords.lng, dish.lat, dish.lng);

  const gmapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${userCoords.lat},${userCoords.lng}&destination=${dish.lat},${dish.lng}&travelmode=${modeInfo.gmapsMode}`;

  const gmapsBtn = document.getElementById('btnOpenGoogleMaps');
  if (gmapsBtn) gmapsBtn.href = gmapsUrl;

  const gmapsDirectBtn = document.getElementById('btnGmapsDirect');
  if (gmapsDirectBtn) gmapsDirectBtn.href = gmapsUrl;

  const routeCard = document.getElementById('routeDetailCard');
  if (routeCard) routeCard.style.display = 'block';

  document.getElementById('routeModeIcon').textContent = modeInfo.icon;
  document.getElementById('routeDestName').textContent = dish.name + ' (' + modeInfo.label + ')';
  document.getElementById('routeDestAddr').textContent = dish.address || 'Hội An, Quảng Nam';
  document.getElementById('routeHaversineVal').textContent = formatDistance(haversineMeters);
  document.getElementById('routeModeNote').innerHTML = '<span>ℹ️</span> ' + modeInfo.note;

  let routeDistance = Math.round(haversineMeters * (currentTravelMode === 'walking' ? 1.2 : 1.35));
  let routeCoords = null;

  try {
    const seg = await getRouteSegment(userCoords, dish, currentTravelMode);
    if (seg && seg.coords) {
      routeDistance = seg.distance;
      routeCoords = seg.coords;
    }
  } catch (err) {
    console.warn('Route segment error, using road fallback:', err);
  }

  const speedMPerMin = (modeInfo.speedKmH * 1000) / 60;
  const etaMinutes = Math.max(1, Math.round(routeDistance / speedMPerMin));

  document.getElementById('routeEtaVal').textContent = '~' + etaMinutes + ' phút';
  document.getElementById('routeDistanceVal').textContent = formatDistance(routeDistance);

  if (routePolyline) mapInstance.removeLayer(routePolyline);

  if (routeCoords && routeCoords.length > 1) {
    routePolyline = L.polyline(routeCoords, {
      color: modeInfo.color,
      weight: modeInfo.weight,
      opacity: 0.92,
      lineJoin: 'round',
      lineCap: 'round'
    }).addTo(mapInstance);
  } else {
    routePolyline = L.polyline([[userCoords.lat, userCoords.lng], [dish.lat, dish.lng]], {
      color: modeInfo.color,
      dashArray: '8, 8',
      weight: 4,
      opacity: 0.85
    }).addTo(mapInstance);
  }

  mapInstance.fitBounds(routePolyline.getBounds(), { padding: [40, 40] });
}

async function loadDishesData() {
  const t = I18N[currentMapLang] || I18N.vi;
  try {
    const apiBase = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
      ? 'http://localhost:4000'
      : 'https://doancnpm-backend.onrender.com';
    const res = await fetch(`${apiBase}/api/dishes?lang=${currentMapLang}`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        allDishes = data.map(d => {
          const defaultDish = DEFAULT_DISHES.find(dd => dd.id === Number(d.id));
          const trans = defaultDish?.translations?.[currentMapLang] || defaultDish?.translations?.vi;
          const nameFromApi = (d.name_i18n && d.name_i18n[currentMapLang]) || d.translated_name || d.name;
          const finalName = trans?.name || nameFromApi;
          const finalAddr = d.address || trans?.address || 'Hội An, Quảng Nam';
          const finalLat = Number(d.lat) || defaultDish?.lat || 15.8778;
          const finalLng = Number(d.lng) || defaultDish?.lng || 108.3275;
          const finalImg = d.image || d.image_url || defaultDish?.image || 'https://images.unsplash.com/photo-1555126634-323283e090fa?w=400';

          return {
            id: Number(d.id),
            name: finalName,
            address: finalAddr,
            lat: finalLat,
            lng: finalLng,
            image: finalImg
          };
        });
      }
    }
  } catch (e) {
    console.warn('API /api/dishes unreachable, fallback to exact default dishes:', e);
  }

  if (!allDishes || allDishes.length === 0) {
    allDishes = DEFAULT_DISHES.map(d => {
      const trans = d.translations?.[currentMapLang] || d.translations?.vi || {};
      return {
        id: d.id,
        name: trans.name || d.name,
        address: trans.address || d.address || 'Hội An',
        lat: d.lat,
        lng: d.lng,
        image: d.image
      };
    });
  }

  const destSelect = document.getElementById('cDestSelect');
  if (destSelect) {
    const currentVal = destSelect.value;
    destSelect.innerHTML = `<option value="">${t.dest_placeholder}</option>`;
    allDishes.forEach(d => {
      const opt = document.createElement('option');
      opt.value = d.id;
      opt.textContent = `${d.name} (${d.address || 'Hội An'})`;
      destSelect.appendChild(opt);
    });
    if (currentVal) destSelect.value = currentVal;
  }

  runRadarScan();
}

document.addEventListener('DOMContentLoaded', () => {
  initMap();
  setMapLanguage(currentMapLang);


  document.getElementById('btnRadarScan').onclick = runRadarScan;
  document.getElementById('cRadiusSelect').onchange = runRadarScan;
  document.getElementById('btnGetGps').onclick = getInstantGps;

  document.querySelectorAll('.travel-mode-btn').forEach(btn => {
    btn.onclick = () => setTravelMode(btn.dataset.mode);
  });

  document.getElementById('cDestSelect').onchange = (e) => {
    const id = parseInt(e.target.value);
    if (id) selectDestinationById(id);
  };

  document.getElementById('cOriginSelect').onchange = (e) => {
    const val = e.target.value;
    if (val === 'gps') {
      getInstantGps();
    } else {
      const parts = val.split(',').map(s => parseFloat(s.trim()));
      if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
        const originText = e.target.options[e.target.selectedIndex]?.textContent || 'Điểm xuất phát';
        updateUserMarker(parts[0], parts[1], originText);
        runRadarScan();
        if (selectedDestDish) selectDestinationById(selectedDestDish.id);
      }
    }
  };
});
