class MembershipModel {
  bool exportKeyToId;
  String key;

  String title;
  String detail;
  double price;

  int maxUses;
  int maxDays;
  int maxQuestions;
  int maxFlashcards;
  int maxUsesFlashcards;
  int maxVideos;

  bool isVisible;
  bool isDefault;
  int order;

  DateTime creationTime;

  MembershipModel(
      this.exportKeyToId,
      this.key,
      this.title,
      this.detail,
      this.price,
      this.maxUses,
      this.maxDays,
      this.maxQuestions,
      this.maxFlashcards,
      this.maxUsesFlashcards,
      this.maxVideos,
      this.isVisible,
      this.isDefault,
      this.order,
      this.creationTime);

  factory MembershipModel.fromJSON(
      bool exportKeyToId, String key, dynamic jsonData) {
    return MembershipModel(
        exportKeyToId,
        key,
        jsonData['title'] as String,
        jsonData['detail'] as String,
        jsonData['price'] is double
            ? jsonData['price'] as double
            : double.parse(jsonData['price'].toString()),
        jsonData['maxUses'] as int,
        jsonData['maxDays'] as int,
        jsonData['maxQuestions'] as int,
        jsonData['maxFlashcards'] != null
            ? jsonData['maxFlashcards'] as int
            : 100,
        jsonData['maxUsesFlashcards'] != null
            ? jsonData['maxUsesFlashcards'] as int
            : 50,
        jsonData['maxVideos'] != null ? jsonData['maxVideos'] as int : 100,
        jsonData['isVisible'] as bool,
        jsonData['isDefault'] as bool,
        jsonData['order'] as int,
        DateTime.fromMicrosecondsSinceEpoch(
            jsonData['creationTime'].microsecondsSinceEpoch));
  }

  factory MembershipModel.fromJSONWithIdToKey(
      bool exportKeyToId, String key, dynamic jsonData) {
    return MembershipModel(
        exportKeyToId,
        jsonData['id'] as String,
        jsonData['title'] as String,
        jsonData['detail'] as String,
        jsonData['price'] is double
            ? jsonData['price'] as double
            : double.parse(jsonData['price'].toString()),
        jsonData['maxUses'] as int,
        jsonData['maxDays'] as int,
        jsonData['maxQuestions'] as int,
        jsonData['maxFlashcards'] != null
            ? jsonData['maxFlashcards'] as int
            : 100,
        jsonData['maxUsesFlashcards'] != null
            ? jsonData['maxUsesFlashcards'] as int
            : 50,
        jsonData['maxVideos'] != null ? jsonData['maxVideos'] as int : 100,
        jsonData['isVisible'] as bool,
        jsonData['isDefault'] as bool,
        jsonData['order'] as int,
        DateTime.fromMicrosecondsSinceEpoch(
            jsonData['creationTime'].microsecondsSinceEpoch));
  }

  Map<String, dynamic> toJson() => {
        if (exportKeyToId) 'id': key,
        'title': title,
        'detail': detail,
        'price': price,
        'maxUses': maxUses,
        'maxDays': maxDays,
        'maxQuestions': maxQuestions,
        'maxFlashcards': maxFlashcards,
        'maxUsesFlashcards': maxUsesFlashcards,
        'maxVideos': maxVideos,
        'isVisible': isVisible,
        'isDefault': isDefault,
        'order': order,
        'creationTime': creationTime,
      };

  Map<String, dynamic> toJsonWithExportKeyToId() => {
        'id': key,
        'title': title,
        'detail': detail,
        'price': price,
        'maxUses': maxUses,
        'maxDays': maxDays,
        'maxQuestions': maxQuestions,
        'maxFlashcards': maxFlashcards,
        'maxUsesFlashcards': maxUsesFlashcards,
        'maxVideos': maxVideos,
        'isVisible': isVisible,
        'isDefault': isDefault,
        'order': order,
        'creationTime': creationTime,
      };

  void updateFrom(MembershipModel fromMembership) {
    exportKeyToId = fromMembership.exportKeyToId;
    key = fromMembership.key;

    title = fromMembership.title;
    detail = fromMembership.detail;
    price = fromMembership.price;

    maxUses = fromMembership.maxUses;
    maxDays = fromMembership.maxDays;
    maxQuestions = fromMembership.maxQuestions;
    maxFlashcards = fromMembership.maxFlashcards;
    maxUsesFlashcards = fromMembership.maxUsesFlashcards;
    maxVideos = fromMembership.maxVideos;

    isVisible = fromMembership.isVisible;
    isDefault = fromMembership.isDefault;
    order = fromMembership.order;

    creationTime = DateTime.now().add(Duration(days: fromMembership.maxDays));
  }
}
