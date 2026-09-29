import { View } from 'react-native';

import { ChuaLam, ManHinh } from '@/components/man-hinh';

export default function CaNhan() {
  return (
    <ManHinh tieuDe="Cá nhân">
      <View className="gap-4">
        <ChuaLam viec="Nhập và sửa họ tên, ngày sinh, giới tính" />
        <ChuaLam viec="Chọn giờ nhận thông báo lá bài hôm nay" />
        <ChuaLam viec="Xoá toàn bộ dữ liệu của tôi, hỏi xác nhận hai lần" />
        <ChuaLam viec="Điều khoản và chính sách bảo mật" />
      </View>
    </ManHinh>
  );
}
