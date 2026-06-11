// ignore_for_file: prefer_if_null_operators
import 'package:mdexam/models/video_category_model.dart';
import 'package:mdexam/utils/general/array_search.dart';

class VideoModel {
  bool exportKeyToId;
  String key;

  VideoCategoryModel category;
  String title;
  String storagePreview;
  String urlPreview;
  String url;
  bool isEnabled;

  DateTime creationTime;

  VideoModel(
      this.exportKeyToId,
      this.key,
      this.category,
      this.title,
      this.storagePreview,
      this.urlPreview,
      this.url,
      this.isEnabled,
      this.creationTime);

  factory VideoModel.fromJSON(
      bool exportKeyToId, String key, dynamic jsonData) {
    return VideoModel(
        exportKeyToId,
        key,
        VideoCategoryModel.fromJSON(
            false,
            jsonData['category']['id'] != null
                ? jsonData['category']['id']
                : "",
            jsonData['category']),
        jsonData['title'] as String,
        jsonData['storagePreview'] as String,
        jsonData['urlPreview'] as String,
        jsonData['url'] as String,
        jsonData['isEnabled'] as bool,
        DateTime.fromMicrosecondsSinceEpoch(
            jsonData['creationTime'].microsecondsSinceEpoch));
  }

  factory VideoModel.fromJSONWithIdToKey(
      bool exportKeyToId, String key, dynamic jsonData) {
    return VideoModel(
        exportKeyToId,
        jsonData['id'] as String,
        VideoCategoryModel.fromJSON(
            false,
            jsonData['category']['id'] != null
                ? jsonData['category']['id']
                : "",
            jsonData['category']),
        jsonData['title'] as String,
        jsonData['storagePreview'] as String,
        jsonData['urlPreview'] as String,
        jsonData['url'] as String,
        jsonData['isEnabled'] as bool,
        DateTime.fromMicrosecondsSinceEpoch(
            jsonData['creationTime'].microsecondsSinceEpoch));
  }

  Map<String, dynamic> toJson(bool withArraySearch) => {
        if (exportKeyToId) 'id': key,
        'category': category.toJson(),
        'title': title,
        'storagePreview': storagePreview,
        'urlPreview': urlPreview,
        'url': url,
        'isEnabled': isEnabled,
        'creationTime': creationTime,
        'arraySearch': getArraySearch((title).toLowerCase(), withArraySearch),
      };

  Map<String, dynamic> toJsonWithExportKeyToId(bool withArraySearch) => {
        'id': key,
        'category': category.toJsonWithExportKeyToId(),
        'title': title,
        'storagePreview': storagePreview,
        'urlPreview': urlPreview,
        'url': url,
        'isEnabled': isEnabled,
        'creationTime': creationTime,
        'arraySearch': getArraySearch((title).toLowerCase(), withArraySearch),
      };
}
