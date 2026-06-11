

import 'package:mdexam/models/membership_model.dart';

List<String> membershipListToStringList(List<MembershipModel> list) {
  List<String> result = [];

  result.add("");

  for (int i = 0; i < list.length; i++) {
    result.add(list[i].title);
  }

  return result;
}

MembershipModel membershipStringToMembershipModel(
    List<MembershipModel> list, String key) {
  MembershipModel result = list[0];

  for (int i = 0; i < list.length; i++) {
    if (list[i].title.compareTo(key) == 0) {
      return list[i];
    }
  }

  return result;
}

uniquedAdd(List<MembershipModel> list, MembershipModel newMembership) {
  for (int i = 0; i < list.length; i++) {
    if (list[i].title.compareTo(newMembership.title) == 0) {
      return;
    }
  }

  list.add(newMembership);
}

