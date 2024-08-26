import * as crypto from "crypto";

export function generateSecureRandomNumberString() {
  let randomNumberString = '';
  while (randomNumberString.length < 5) {
    const randomBytes = crypto.randomBytes(4);
    const randomValue = randomBytes.readUInt32LE();
    const randomString = randomValue.toString().padStart(5, '0').slice(0, 5);
    if (randomString[0] !== '0') {
      randomNumberString = randomString;
    }
  }
  return randomNumberString;
}
export function filterObject(obj: object): object {
  return Object.fromEntries(Object.entries(obj).filter(([_, v]) => v != null));
}
