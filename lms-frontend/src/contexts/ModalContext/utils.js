export const uid = (len = 8) => {
  const buf = [];
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charlen = chars.length;

  for (let i = 0; i < len; i++) {
    buf[i] = chars.charAt(Math.floor(Math.random() * charlen));
  }

  return buf.join('');
};
