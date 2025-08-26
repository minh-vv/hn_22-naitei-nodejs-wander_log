const bcrypt = require('bcryptjs');

// Mật khẩu bạn muốn băm
const password = 'admin1';

async function hashPassword() {
  try {
    // băm mật khẩu với salt factor là 10. Số càng lớn, băm càng an toàn nhưng tốn thời gian hơn.
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('Mật khẩu đã được băm:');
    console.log(hashedPassword);
  } catch (err) {
    console.error('Có lỗi xảy ra:', err);
  }
}

hashPassword();
