String right(String value, String leftChar, int length) {
  String result = "";

  int valueLength = value.length;

  if (length > valueLength) {
    for (int i = 0; i < (length - valueLength); i++) {
      result = result + leftChar;
    }
  }

  return result + value;
}
