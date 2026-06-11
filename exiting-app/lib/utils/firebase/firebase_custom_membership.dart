import 'package:mdexam/models/membership_model.dart';
import 'package:mdexam/models/parameter_model.dart';
import 'package:mdexam/models/user_membership_purchase_model.dart';
import 'package:mdexam/utils/fixvalues/user_membership_purchase_status_values.dart';
import 'package:mdexam/utils/general/show_dialog_wait.dart';
import 'package:mdexam/utils/general/sizes_helpers.dart';
import 'package:mdexam/variables/globalvar.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';

typedef ErrorCallback = void Function(String error);

class FirebaseCustomMembershipHelper {
  Future add({
    required BuildContext context,
    required MembershipModel membershipModel,
  }) async {
    ShowDialogWait showDialogWait = ShowDialogWait();
    showDialogWait.show(context, membershipSaving);

    try {
      addFinish(context, showDialogWait, membershipModel, true);

      return null;
    } on FirebaseAuthException catch (e) {
      showDialogWait.hide(context);
      return e.message;
    }
  }

  Future addFinish(BuildContext context, ShowDialogWait showDialogWait,
      MembershipModel membershipModel, bool isFinishNewImage01) async {
    try {
      if (isFinishNewImage01) {
        final firestoreInstance = FirebaseFirestore.instance;
        CollectionReference membership =
            firestoreInstance.collection(firebaseCustomMembershipKey);
        await membership.doc().set(membershipModel.toJsonWithExportKeyToId());

        showDialogWait.hide(context);
      }
    } on FirebaseAuthException catch (e) {
      return e.message;
    }
  }

  Future modify({
    required BuildContext context,
    required MembershipModel membershipModel,
  }) async {
    ShowDialogWait showDialogWait = ShowDialogWait();
    showDialogWait.show(context, membershipSaving);

    try {
      modifyFinish(context, showDialogWait, membershipModel, true);

      return null;
    } on FirebaseAuthException catch (e) {
      showDialogWait.hide(context);
      return e.message;
    }
  }

  Future modifyFinish(BuildContext context, ShowDialogWait showDialogWait,
      MembershipModel membershipModel, bool isFinishModifyImage01) async {
    try {
      if (isFinishModifyImage01) {
        final firestoreInstance = FirebaseFirestore.instance;

        firestoreInstance
            .collection(firebaseCustomMembershipKey)
            .doc(membershipModel.key)
            .update(membershipModel.toJsonWithExportKeyToId());

        showDialogWait.hide(context);
      }
    } on FirebaseAuthException catch (e) {
      return e.message;
    }
  }

  Future delete(
      {required BuildContext context,
      required MembershipModel membershipModel}) async {
    try {
      final firestoreInstance = FirebaseFirestore.instance;
      firestoreInstance
          .collection(firebaseCustomMembershipKey)
          .doc(membershipModel.key)
          .delete();

      return null;
    } on FirebaseAuthException catch (e) {
      return e.message;
    }
  }

  Future stripePrePurchase(
      {required BuildContext context,
      required UserMembershipPurchaseModel userMembershipPurchaseModel,
      required List<ParameterModel> listParameters,
      required VoidCallback onFinished,
      required ErrorCallback onError}) async {
    ShowDialogWait showDialogWait = ShowDialogWait();
    if (!isMobile()) {
      showDialogWait.show(context, membershipPurchaseSaving);
    }

    try {
      final firestoreInstance = FirebaseFirestore.instance;

      CollectionReference userMembershipPurchases =
          firestoreInstance.collection(firebaseCustomUserMembershipPurchaseKey);
      await userMembershipPurchases
          .doc(userMembershipPurchaseModel.paymentNumber)
          .set(userMembershipPurchaseModel.toJsonWithExportKeyToId());

      if (!isMobile()) {
        showDialogWait.hide(context);
      }

      onFinished();
    } on FirebaseAuthException catch (e) {
      if (!isMobile()) {
        showDialogWait.hide(context);
      }

      onError(e.message.toString());
    }
  }

  Future paypalPrePurchase(
      {required BuildContext context,
      required UserMembershipPurchaseModel userMembershipPurchaseModel,
      required List<ParameterModel> listParameters,
      required VoidCallback onFinished,
      required ErrorCallback onError}) async {
    ShowDialogWait showDialogWait = ShowDialogWait();
    if (!isMobile()) {
      showDialogWait.show(context, membershipPurchaseSaving);
    }

    try {
      final firestoreInstance = FirebaseFirestore.instance;

      CollectionReference userMembershipPurchases =
          firestoreInstance.collection(firebaseCustomUserMembershipPurchaseKey);
      await userMembershipPurchases
          .doc(userMembershipPurchaseModel.paymentNumber)
          .set(userMembershipPurchaseModel.toJsonWithExportKeyToId());

      if (!isMobile()) {
        showDialogWait.hide(context);
      }

      onFinished();
    } on FirebaseAuthException catch (e) {
      if (!isMobile()) {
        showDialogWait.hide(context);
      }

      onError(e.message.toString());
    }
  }

  Future confirmPurchase(
      {required BuildContext context, required String paymentNumber}) async {
    ShowDialogWait showDialogWait = ShowDialogWait();
    showDialogWait.show(context, membershipPurchaseSaving);

    try {
      final firestoreInstance = FirebaseFirestore.instance;

      CollectionReference userMembershipPurchases =
          firestoreInstance.collection(firebaseCustomUserMembershipPurchaseKey);

      DocumentSnapshot userMembershipPurchaseDocumentSnapshot =
          await userMembershipPurchases.doc(paymentNumber).get();

      UserMembershipPurchaseModel userMembershipPurchaseModel =
          UserMembershipPurchaseModel.fromJSONWithIdToKey(
              true,
              userMembershipPurchaseDocumentSnapshot.id,
              userMembershipPurchaseDocumentSnapshot.data());

      if (userMembershipPurchaseModel.userMembershipPurchaseStatusModel.key
              .compareTo("Pending") !=
          0) {
        return userMembershipPurchasePendingError;
      }

      userMembershipPurchaseModel.userMembershipPurchaseStatusModel =
          UserMembershipPurchaseStatusValues()
              .userMembershipPurchaseStatusModelEnd;

      await userMembershipPurchases
          .doc(userMembershipPurchaseModel.paymentNumber)
          .set(userMembershipPurchaseModel.toJsonWithExportKeyToId());

      userMembershipPurchaseModel.currentMembership
          .updateFrom(userMembershipPurchaseModel.toMembership);

      CollectionReference appUserMemberships =
          firestoreInstance.collection(firebaseCustomUserMembershipKey);
      await appUserMemberships
          .doc(userMembershipPurchaseModel.username)
          .set(userMembershipPurchaseModel.currentMembership.toJson());

      showDialogWait.hide(context);

      return null;
    } on FirebaseAuthException catch (e) {
      showDialogWait.hide(context);
      return e.message;
    }
  }

  Future cancelPurchase(
      {required BuildContext context, required String paymentNumber}) async {
    ShowDialogWait showDialogWait = ShowDialogWait();
    showDialogWait.show(context, membershipPurchaseSaving);

    try {
      final firestoreInstance = FirebaseFirestore.instance;

      CollectionReference userMembershipPurchases =
          firestoreInstance.collection(firebaseCustomUserMembershipPurchaseKey);

      DocumentSnapshot userMembershipPurchaseDocumentSnapshot =
          await userMembershipPurchases.doc(paymentNumber).get();

      UserMembershipPurchaseModel userMembershipPurchaseModel =
          UserMembershipPurchaseModel.fromJSON(
              true,
              userMembershipPurchaseDocumentSnapshot.id,
              userMembershipPurchaseDocumentSnapshot.data());

      if (userMembershipPurchaseModel.userMembershipPurchaseStatusModel.key
              .compareTo("Pending") !=
          0) {
        return userMembershipPurchasePendingError;
      }

      userMembershipPurchaseModel.userMembershipPurchaseStatusModel =
          UserMembershipPurchaseStatusValues()
              .userMembershipPurchaseStatusModelCancel;

      await userMembershipPurchases
          .doc(userMembershipPurchaseModel.paymentNumber)
          .set(userMembershipPurchaseModel.toJsonWithExportKeyToId());

      showDialogWait.hide(context);

      return null;
    } on FirebaseAuthException catch (e) {
      showDialogWait.hide(context);
      return e.message;
    }
  }

  Future use(
      {required BuildContext context,
      required String loginUsername,
      required MembershipModel membershipCurrent}) async {
    ShowDialogWait showDialogWait = ShowDialogWait();
    showDialogWait.show(context, questionTodoSaving);

    try {
      final firestoreInstance = FirebaseFirestore.instance;

      CollectionReference appUserMemberships =
          firestoreInstance.collection(firebaseCustomUserMembershipKey);
      await appUserMemberships
          .doc(loginUsername)
          .set(membershipCurrent.toJson());

      showDialogWait.hide(context);

      return null;
    } on FirebaseAuthException catch (e) {
      showDialogWait.hide(context);
      return e.message;
    }
  }
}
