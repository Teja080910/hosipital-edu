class VideoCategoryModel {
  bool exportKeyToId;
  String key;

  String title;

  int maxWatching;

  DateTime creationTime;

  VideoCategoryModel(this.exportKeyToId, this.key, this.title,
      this.maxWatching,this.creationTime);

  factory VideoCategoryModel.fromJSON(
      bool exportKeyToId, String key, dynamic jsonData) {
    return VideoCategoryModel(
        exportKeyToId,
        key,
        jsonData['title'] as String,
        jsonData['maxWatching'] as int,
        DateTime.fromMicrosecondsSinceEpoch(
            jsonData['creationTime'].microsecondsSinceEpoch));
  }

  factory VideoCategoryModel.fromJSONWithIdToKey(
      bool exportKeyToId, String key, dynamic jsonData) {
    return VideoCategoryModel(
        exportKeyToId,
        jsonData['id'] as String,
        jsonData['title'] as String,
        jsonData['maxWatching'] as int,
        DateTime.fromMicrosecondsSinceEpoch(
            jsonData['creationTime'].microsecondsSinceEpoch));
  }

  Map<String, dynamic> toJson() => {
        if (exportKeyToId) 'id': key,
        'title': title,
        'maxWatching': maxWatching,
        'creationTime': creationTime,
      };

  Map<String, dynamic> toJsonWithExportKeyToId() => {
        'id': key,
        'title': title,
        'maxWatching': maxWatching,
        'creationTime': creationTime,
      };
}
