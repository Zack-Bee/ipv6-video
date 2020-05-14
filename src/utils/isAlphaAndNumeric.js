const a = 'a'.charCodeAt(0);
const z = 'z'.charCodeAt(0);
const A = 'A'.charCodeAt(0);
const Z = 'Z'.charCodeAt(0);
const zero = '0'.charCodeAt(0);
const nine = '9'.charCodeAt(0);

const isAlphaAndNumericSequence = str =>
  [...str].every(char => {
    const charCode = char.charCodeAt(0);
    return (
      ((charCode >= a && charCode <= z) ||
        (charCode >= A && charCode <= Z) ||
        (charCode >= zero && charCode <= nine)) &&
      char.length === 1
    );
  });

export default isAlphaAndNumericSequence;
