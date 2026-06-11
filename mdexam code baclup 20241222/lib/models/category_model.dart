class CategoryModel {
  bool exportKeyToId;
  String key;

  String title;

  int maxQuestions;

  DateTime creationTime;

  CategoryModel(this.exportKeyToId, this.key, this.title, this.maxQuestions,
      this.creationTime);

  factory CategoryModel.fromJSON(
      bool exportKeyToId, String key, dynamic jsonData) {

    return CategoryModel(
        exportKeyToId,
        key,
        jsonData['title'] as String,
        jsonData['maxQuestions'] as int,
        DateTime.fromMicrosecondsSinceEpoch(
            jsonData['creationTime'].microsecondsSinceEpoch));
  }

  factory CategoryModel.fromJSONWithIdToKey(
      bool exportKeyToId, String key, dynamic jsonData) {

    return CategoryModel(
        exportKeyToId,
        jsonData['id'] as String,
        jsonData['title'] as String,
        jsonData['maxQuestions'] as int,
        DateTime.fromMicrosecondsSinceEpoch(
            jsonData['creationTime'].microsecondsSinceEpoch));
  }

  Map<String, dynamic> toJson() => {
        if (exportKeyToId) 'id': key,
        'title': title,
        'maxQuestions': maxQuestions,
        'creationTime': creationTime,
      };

  Map<String, dynamic> toJsonWithExportKeyToId() => {
        'id': key,
        'title': title,
        'maxQuestions': maxQuestions,
        'creationTime': creationTime,
      };
}
