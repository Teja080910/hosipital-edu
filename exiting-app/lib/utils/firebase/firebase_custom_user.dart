import 'package:mdexam/models/membership_model.dart';
import 'package:mdexam/models/user_model.dart';
import 'package:mdexam/utils/general/show_dialog_wait.dart';
import 'package:mdexam/variables/globalvar.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';

class FirebaseCustomUserHelper {
  Future add(
      {required BuildContext context,
      required String email,
      required String password,
//    required String referenceUsername,
      required UserModel userModel,
      required List<MembershipModel> memberships}) async {
    ShowDialogWait showDialogWait = ShowDialogWait();
    showDialogWait.show(context, userSimpleAddNewSaving);

    try {
      final FirebaseAuth auth = FirebaseAuth.instance;

      email = email.toLowerCase();

      await auth.createUserWithEmailAndPassword(
        email: email,
        password: password,
      );

      final firestoreInstance = FirebaseFirestore.instance;
      CollectionReference appUsers =
          firestoreInstance.collection(firebaseCustomUserKey);
      await appUsers.doc(email).set(UserModel(
            "",
            email,
            true,
            false,
            userModel.isAdministrator,
            userModel.isCustomer,
            userModel.name,
            userModel.lastName,
          ).toJson());

/* Customer Membership Default */
      if (userModel.isCustomer) {
        MembershipModel defaultMembership = MembershipModel(false, "", "", "",
            0, 0, 0, 0, 0, 0, 0, false, false, 0, DateTime.now());
        for (MembershipModel oneMembership in memberships) {
          if (oneMembership.isDefault) {
            defaultMembership = oneMembership;
            defaultMembership.creationTime =
                DateTime.now().add(Duration(days: oneMembership.maxDays));
          }
        }

        CollectionReference appUserMemberships =
            firestoreInstance.collection(firebaseCustomUserMembershipKey);
        await appUserMemberships.doc(email).set(defaultMembership.toJson());
      }

/*
/* Customer Reference User */
      if (userModel.isCustomer && referenceUsername.isNotEmpty) {
        List<FormAddKeyValueModel> formAddKeyValueModel = [];

        formAddKeyValueModel.add(FormAddKeyValueModel("Email", email));

        formAddKeyValueModel
            .add(FormAddKeyValueModel("Reference Username", referenceUsername));

        FormAddModel formAddModel = FormAddModel(
            false,
            "",
            DateTime.now(),
            "Reference Username",
            email + " " + referenceUsername,
            formAddKeyValueModel);

        CollectionReference formAdd =
            firestoreInstance.collection(firebaseCustomFormAddKey);
        await formAdd.doc().set(formAddModel.toJson());
      }
*/

      showDialogWait.hide(context);
      return null;
    } on FirebaseAuthException catch (e) {
      showDialogWait.hide(context);
      return e.message;
    }
  }

/*
  Future addDeliveryFinish(
      BuildContext context,
      ShowDialogWait showDialogWait,
      DeliveryProfilerModel deliveryProfilerModel,
      bool isFinishNewImageDeliveryDriversLicense,
      bool isFinishNewImageDeliveryVehicleInsurance,
      bool isFinishNewImageDeliveryVehicleWithPlates) async {
    try {
      if (isFinishNewImageDeliveryDriversLicense &&
          isFinishNewImageDeliveryVehicleInsurance &&
          isFinishNewImageDeliveryVehicleWithPlates) {
        final firestoreInstance = FirebaseFirestore.instance;

        CollectionReference deliveryProfiler =
            firestoreInstance.collection(firebaseCustomDeliveryProfilerKey);
        await deliveryProfiler
            .doc(deliveryProfilerModel.email)
            .set(deliveryProfilerModel.toJsonWithExportKeyToId());

        showDialogWait.hide(context);
      }
    } on FirebaseAuthException catch (e) {
      return e.message;
    }
  }
*/
  Future modify(
      {required BuildContext context, required UserModel userModel}) async {
    try {
      final firestoreInstance = FirebaseFirestore.instance;
      await firestoreInstance
          .collection(firebaseCustomUserKey)
          .doc(userModel.key)
          .update(userModel.toJson());

      return null;
    } on FirebaseAuthException catch (e) {
      return e.message;
    }
  }

  Future delete(
      {required BuildContext context, required UserModel userModel}) async {
    try {
      final firestoreInstance = FirebaseFirestore.instance;
      await firestoreInstance
          .collection(firebaseCustomUserKey)
          .doc(userModel.key)
          .delete();

      return null;
    } on FirebaseAuthException catch (e) {
      return e.message;
    }
  }
}
