String listIntoOrReset(List<String> list, String key) {
  String result = list[0];

  for (int i = 0; i < list.length; i++) {
    if (list[i].compareTo(key) == 0) {
      return key;
    }
  }

  return result;
}
