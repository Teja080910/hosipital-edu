class FlashcardCategoryModel {
  bool exportKeyToId;
  String key;

  String title;

  int maxQuestions;

  DateTime creationTime;

  FlashcardCategoryModel(this.exportKeyToId, this.key, this.title,
      this.maxQuestions, this.creationTime);

  factory FlashcardCategoryModel.fromJSON(
      bool exportKeyToId, String key, dynamic jsonData) {
    return FlashcardCategoryModel(
        exportKeyToId,
        key,
        jsonData['title'] as String,
        jsonData['maxQuestions'] as int,
        DateTime.fromMicrosecondsSinceEpoch(
            jsonData['creationTime'].microsecondsSinceEpoch));
  }

  factory FlashcardCategoryModel.fromJSONWithIdToKey(
      bool exportKeyToId, String key, dynamic jsonData) {
    return FlashcardCategoryModel(
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
