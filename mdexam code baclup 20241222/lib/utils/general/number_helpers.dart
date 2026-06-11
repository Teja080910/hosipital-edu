bool numberValidate(String number, bool allowNegatives, bool allowZero) {
  try {
    double.parse(number);
  } catch (e) {
    return false;
  }

  double value = double.parse(number);

  if (!allowNegatives && value < 0) {
    return false;
  }

  if (!allowZero && value == 0) {
    return false;
  }

  return true;
}
