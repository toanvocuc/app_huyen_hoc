import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CAO_THANH_TAB, CHU, MAU } from '@/constants/giao-dien';

/**
 * Bốn thẻ tab. Thứ tự ở đây chính là thứ tự khách — và người duyệt app của
 * Apple — nhìn thấy, nên nó không phải chuyện bày biện.
 *
 * Trước đây mở app ra là "Lá bài hôm nay". Apple từ chối theo điều 4.3(b): app
 * chủ yếu là tarot và chiêm tinh, một danh mục họ coi là đã bão hoà. Giờ thẻ đầu
 * là DANH SÁCH CHUYÊN GIA, và việc đặt lịch tư vấn với người thật mới là chức
 * năng chính. Tarot với tử vi lùi hết vào thẻ Khám phá.
 *
 * `index` là danh sách chuyên gia chứ không phải một màn riêng tên /chuyen-gia:
 * nhờ vậy đường dẫn gốc "/" mở ra đúng thứ muốn khoe, và mấy chỗ đang gọi
 * router.replace('/') sau khi đăng nhập hay nhập hồ sơ xong vẫn chạy nguyên.
 */
export default function TabsLayout() {
  // Android vẽ tràn xuống dưới thanh điều hướng của máy. Đặt height cố định là
  // bỏ qua lề này, nên ba nút điều hướng của hệ thống đè lên đúng chỗ bấm của
  // bốn mục. Phải cộng le.bottom vào cả chiều cao lẫn đệm dưới.
  const le = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: MAU.vang,
        tabBarInactiveTintColor: MAU.chuMo,
        tabBarStyle: {
          backgroundColor: MAU.nenNhat,
          borderTopColor: MAU.vien,
          height: CAO_THANH_TAB + le.bottom,
          paddingBottom: 10 + le.bottom,
          paddingTop: 6,
        },
        // lineHeight đặt thẳng tay: để trống thì mỗi nền một kiểu suy ra từ
        // thước phông, và thước của Be Vietnam Pro cao hơn hẳn mức thường gặp.
        tabBarLabelStyle: { fontFamily: CHU.thanVua, fontSize: 11, lineHeight: 15, marginTop: 2 },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Chuyên gia',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people-outline" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="lich-cua-toi"
        options={{
          title: 'Lịch của tôi',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar-outline" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="kham-pha"
        options={{
          title: 'Khám phá',
          tabBarIcon: ({ color, size }) => <Ionicons name="planet-outline" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="ca-nhan"
        options={{
          title: 'Cá nhân',
          tabBarIcon: ({ color, size }) => <Ionicons name="person-outline" color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
