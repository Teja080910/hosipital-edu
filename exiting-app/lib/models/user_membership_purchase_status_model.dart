class UserMembershipPurchaseStatusModel {
  bool exportKeyToId;
  String key;
  String title;

  UserMembershipPurchaseStatusModel(this.exportKeyToId, this.key, this.title);

  factory UserMembershipPurchaseStatusModel.fromJSON(
      bool exportKeyToId, String key, dynamic jsonData) {
    return UserMembershipPurchaseStatusModel(
        exportKeyToId, key, jsonData['title'] as String);
  }

  factory UserMembershipPurchaseStatusModel.fromJSONWithIdToKey(
      bool exportKeyToId, String key, dynamic jsonData) {
    return UserMembershipPurchaseStatusModel(
        exportKeyToId, jsonData['id'] as String, jsonData['title'] as String);
  }

  Map<String, dynamic> toJson() =>
      {if (exportKeyToId) 'id': key, 'title': title};

  Map<String, dynamic> toJsonWithExportKeyToId() => {'id': key, 'title': title};

  clone(UserMembershipPurchaseStatusModel deliveryStatusModel) {
    exportKeyToId = deliveryStatusModel.exportKeyToId;
    key = deliveryStatusModel.key;
    title = deliveryStatusModel.title;
  }
}
