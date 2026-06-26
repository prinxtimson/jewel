export const generatePassword = (len) => {
  const lowercase = "abcdefghijklmnopqrstuvwxyz";
  const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const numbers = "0123456789";

  let characterPool = lowercase;
  characterPool += uppercase;
  characterPool += numbers;

  const randomBytes = new Uint32Array(len);
  window.crypto.getRandomValues(randomBytes);

  let password = "";
  for (let i = 0; i < len; i++) {
    password += characterPool[randomBytes[i] % characterPool.length];
  }

  return password;
};
