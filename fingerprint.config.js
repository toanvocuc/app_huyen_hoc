/**
 * Bớt mấy file không liên quan ra khỏi phép tính vân tay.
 *
 * Vân tay quyết định một bản cập nhật từ xa có tới được máy khách hay không.
 * Mặc định nó băm cả `.gitignore`, mà file đó chẳng ảnh hưởng gì tới phần
 * native. Thêm một dòng vào đó là vân tay đổi, và mọi bản cập nhật sau đều rơi
 * vào khoảng không: không máy nào nhận, mà cũng không báo lỗi gì.
 *
 * Đã sập đúng một lần: thêm `credentials.json` vào .gitignore lúc làm iOS là
 * bản Android trên chợ mất đường nhận cập nhật.
 *
 * KHÔNG bỏ eas.json ra, dù nó cũng hay gây chuyện. Trong đó có `env` và
 * `channel`, hai thứ đổi thật sự thì bản cũ không chạy được nữa.
 */
module.exports = {
  ignorePaths: ['.gitignore'],
};
