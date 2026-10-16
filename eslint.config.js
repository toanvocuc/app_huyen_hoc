// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require("eslint-config-expo/flat");

module.exports = defineConfig([
  expoConfig,
  {
    // dist-web là thư mục build của bản web. Thiếu nó ở đây thì `expo lint`
    // quét luôn mã đã đóng gói và báo hơn mười nghìn lỗi vô nghĩa, chôn
    // mất mưọi mấy lỗi thật trong mã nguồn.
    ignores: ["dist/*", "dist-web/*"],
  }
]);
