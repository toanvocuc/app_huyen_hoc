import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CAO_THANH_TAB, CHU, MAU } from '@/constants/giao-dien';

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
          paddingBottom: 8 + le.bottom,
          paddingTop: 6,
        },
        tabBarLabelStyle: { fontFamily: CHU.thanVua, fontSize: 11 },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Hôm nay',
          tabBarIcon: ({ color, size }) => <Ionicons name="sunny-outline" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="tarot"
        options={{
          title: 'Rút bài',
          tabBarIcon: ({ color, size }) => <Ionicons name="albums-outline" color={color} size={size} />,
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
