import { Stack } from 'expo-router';

export default function NhapHoSoLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#0B1220' },
        animation: 'fade',
        animationDuration: 220,
      }}
    />
  );
}
