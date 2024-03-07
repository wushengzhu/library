type MakeBaseDecoder = (baseAlphabet: string) => {
  decode: (input: string) => Uint8Array;
};

export const makeBaseDecoder: MakeBaseDecoder = (baseAlphabet) => {
  const n = baseAlphabet.length;
  if (n === 0 || n > 255) {
    throw new Error('Invalid base alphabet length: ' + n);
  }

  const map = new Map(Array.from(baseAlphabet, (char, i) => [char, i]));

  return {
    decode: (input) => {
      // encoding_flag:
      //  - 0: counting leading zeros
      //  - 1: processing
      let flag = 0;
      let leadingZeros = 0;
      const decoding: number[] = [];

      for (const char of input) {
        let carry = map.get(char);
        if (carry == null) {
          throw new Error('Invalid character: ' + char);
        }
        if (!(flag || carry)) {
          leadingZeros++;
        } else {
          flag = 1;
        }

        for (let i = 0; carry || i < decoding.length; i++) {
          carry += (decoding[i] * n) >>> 0;
          decoding[i] = carry % 256;
          carry = (carry / 256) | 0;
        }
      }

      const len = leadingZeros + decoding.length;
      const values = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        values[i] = i < leadingZeros ? 0 : decoding[len - i - 1];
      }

      return values;
    },
  };
};
