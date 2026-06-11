import 'package:mdexam/models/membership_model.dart';
import 'package:mdexam/models/user_membership_purchase_status_model.dart';

class UserMembershipPurchaseModel {
  bool exportKeyToId;
  String key;

  String username;

  MembershipModel currentMembership;
  MembershipModel toMembership;
  String paymentNumber;
  UserMembershipPurchaseStatusModel userMembershipPurchaseStatusModel;

  DateTime creationTime;

  UserMembershipPurchaseModel(
    this.exportKeyToId,
    this.key,
    this.username,
    this.currentMembership,
    this.toMembership,
    this.paymentNumber,
    this.userMembershipPurchaseStatusModel,
    this.creationTime,
  );

  factory UserMembershipPurchaseModel.fromJSON(
      bool exportKeyToId, String key, dynamic jsonData) {
    return UserMembershipPurchaseModel(
        exportKeyToId,
        key,
        jsonData['username'] as String,
        MembershipModel.fromJSON(
            exportKeyToId,
            jsonData['currentMembership']['key'],
            jsonData['currentMembership']),
        MembershipModel.fromJSON(exportKeyToId, jsonData['toMembership']['key'],
            jsonData['toMembership']),
        jsonData['paymentNumber'] as String,
        UserMembershipPurchaseStatusModel.fromJSON(
            exportKeyToId, key, jsonData['userMembershipPurchaseStatusModel']),
        DateTime.fromMicrosecondsSinceEpoch(
            jsonData['creationTime'].microsecondsSinceEpoch));
  }

  factory UserMembershipPurchaseModel.fromJSONWithIdToKey(
      bool exportKeyToId, String key, dynamic jsonData) {
    return UserMembershipPurchaseModel(
        exportKeyToId,
        jsonData['id'] as String,
        jsonData['username'] as String,
        MembershipModel.fromJSONWithIdToKey(exportKeyToId,
            jsonData['currentMembership']['id'], jsonData['currentMembership']),
        MembershipModel.fromJSONWithIdToKey(exportKeyToId,
            jsonData['toMembership']['id'], jsonData['toMembership']),
        jsonData['paymentNumber'] as String,
        UserMembershipPurchaseStatusModel.fromJSONWithIdToKey(
            exportKeyToId,
            jsonData['userMembershipPurchaseStatusModel']['id'],
            jsonData['userMembershipPurchaseStatusModel']),
        DateTime.fromMicrosecondsSinceEpoch(
            jsonData['creationTime'].microsecondsSinceEpoch));
  }

  Map<String, dynamic> toJson() => {
        if (exportKeyToId) 'id': key,
        'username': username,
        'currentMembership': currentMembership.toJson(),
        'toMembership': toMembership.toJson(),
        'paymentNumber': paymentNumber,
        'userMembershipPurchaseStatusModel':
            userMembershipPurchaseStatusModel.toJson(),
        'creationTime': creationTime,
      };

  Map<String, dynamic> toJsonWithExportKeyToId() => {
        'id': key,
        'username': username,
        'currentMembership': currentMembership.toJsonWithExportKeyToId(),
        'toMembership': toMembership.toJsonWithExportKeyToId(),
        'paymentNumber': paymentNumber,
        'userMembershipPurchaseStatusModel':
            userMembershipPurchaseStatusModel.toJsonWithExportKeyToId(),
        'creationTime': creationTime,
      };

  static String unityID(String loginUsername) {
    DateTime now = DateTime.now().toUtc();

    return now.year.toString() +
        '_' +
        now.month.toString() +
        '_' +
        now.day.toString() +
        '_' +
        now.hour.toString() +
        '_' +
        now.minute.toString() +
        '_' +
        now.second.toString() +
        '_' +
        now.millisecond.toString() +
        '_' +
        loginUsername
            .replaceAll("@", "_")
            .replaceAll(".", "_")
            .replaceAll(",", "_")
            .replaceAll(";", "_");
  }
}
