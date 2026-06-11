getArraySearch(String text, bool withArraySearch) {
  String textFull = text;

  if (text.length > 80) {
    text = text.substring(0, 79);
  }

  List<String> resultList = [];

  if (withArraySearch) {
    for (int i = 0; i < text.length - 1; i++) {
      privGetArraySearch(resultList, text, i);
    }

    privGetArraySearch2(resultList, textFull);
  }

  return resultList;
}

privGetArraySearch(List<String> list, String text, int posInit) {
  String content = "";

  for (int i = posInit; i < text.length; i++) {
    content = content + text[i];
    if (!exists(list, content)) {
      list.add(content);
    }
  }

  return list;
}

privGetArraySearch2(List<String> list, String text) {
  for (String content
      in text.replaceAll(".", " ").replaceAll(",", " ").split(" ")) {
    if (!exists(list, content)) {
      list.add(content);
    }
  }
}

exists(List<String> list, String content) {
  for (int i = 0; i < list.length; i++) {
    if (list[i].compareTo(content) == 0) {
      return true;
    }
  }

  return false;
}
