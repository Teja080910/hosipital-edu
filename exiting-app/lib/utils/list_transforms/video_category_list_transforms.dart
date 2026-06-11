import 'package:mdexam/models/video_category_model.dart';

List<String> videoCategoryListToStringList(List<VideoCategoryModel> list) {
  List<String> result = [];

  result.add("");

  for (int i = 0; i < list.length; i++) {
    result.add(list[i].title);
  }

  return result;
}

VideoCategoryModel videoCategoryStringTovideoCategoryModel(
    List<VideoCategoryModel> list, String key) {
  VideoCategoryModel result = list[0];

  for (int i = 0; i < list.length; i++) {
    if (list[i].title.compareTo(key) == 0) {
      return list[i];
    }
  }

  return result;
}

uniquedAdd(List<VideoCategoryModel> list, VideoCategoryModel newVideoCategory) {
  for (int i = 0; i < list.length; i++) {
    if (list[i].title.compareTo(newVideoCategory.title) == 0) {
      return;
    }
  }

  list.add(newVideoCategory);
}

List<VideoCategoryModel> videoCategorysStringToListvideoCategoryModel(
    List<VideoCategoryModel> list, String key) {
  List<VideoCategoryModel> result = [];

  for (String tKey in key.split(",")) {
    result.add(videoCategoryStringTovideoCategoryModel(list, tKey));
  }

  return result;
}
