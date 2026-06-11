import 'package:mdexam/models/video_model.dart';

List<String> videoListToStringList(List<VideoModel> list) {
  List<String> result = [];

  result.add("");

  for (int i = 0; i < list.length; i++) {
    result.add(list[i].title);
  }

  return result;
}

VideoModel videocardStringTovideocardModel(List<VideoModel> list, String key) {
  VideoModel result = list[0];

  for (int i = 0; i < list.length; i++) {
    if (list[i].title.compareTo(key) == 0) {
      return list[i];
    }
  }

  return result;
}

uniquedAdd(List<VideoModel> list, VideoModel newVideo) {
  for (int i = 0; i < list.length; i++) {
    if (list[i].title.compareTo(newVideo.title) == 0) {
      return;
    }
  }

  list.add(newVideo);
}

List<VideoModel> videocardsStringToListvideocardModel(
    List<VideoModel> list, String key) {
  List<VideoModel> result = [];

  for (String tKey in key.split(",")) {
    result.add(videocardStringTovideocardModel(list, tKey));
  }

  return result;
}
