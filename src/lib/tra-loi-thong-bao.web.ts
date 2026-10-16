/**
 * Bản dành cho web: luôn trả null, và không có gì để xoá.
 *
 * Trình duyệt không có thông báo đẩy kiểu hệ điều hành, nên không có gì để đọc.
 * Xem phần giải thích đầy đủ ở `tra-loi-thong-bao.ts`.
 */

export function useTraLoiThongBao(): null {
  return null;
}

/** Không làm gì. Bên web không có lần bấm nào được giữ lại. */
export function xoaTraLoiThongBao(): void {}

/** Không làm gì. Bên web không có thông báo đẩy để mà nghe. */
export function ngheThongBaoToi(_khiToi: () => void): () => void {
  return () => {};
}
