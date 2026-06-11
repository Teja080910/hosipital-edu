import 'package:mdexam/models/category_model.dart';
import 'package:mdexam/utils/general/show_dialog_wait.dart';
import 'package:mdexam/variables/globalvar.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';

class FirebaseCustomCategoryHelper {
  Future add({
    required BuildContext context,
    required CategoryModel categoryModel,
  }) async {
    ShowDialogWait showDialogWait = ShowDialogWait();
    showDialogWait.show(context, categorySaving);

    try {
      addFinish(context, showDialogWait, categoryModel,true);

      return null;
    } on FirebaseAuthException catch (e) {
      showDialogWait.hide(context);
      return e.message;
    }
  }

  Future addFinish(BuildContext context, ShowDialogWait showDialogWait,
      CategoryModel categoryModel, bool isFinishNewImage01) async {
    try {
      if (isFinishNewImage01) {
        final firestoreInstance = FirebaseFirestore.instance;
        CollectionReference category =
            firestoreInstance.collection(firebaseCustomCategoryKey);
        await category.doc().set(categoryModel.toJsonWithExportKeyToId());

        showDialogWait.hide(context);
      }
    } on FirebaseAuthException catch (e) {
      return e.message;
    }
  }

  Future modify({
    required BuildContext context,
    required CategoryModel categoryModel,
  }) async {
    ShowDialogWait showDialogWait = ShowDialogWait();
    showDialogWait.show(context, categorySaving);

    try {
      modifyFinish(context, showDialogWait, categoryModel, true);

      return null;
    } on FirebaseAuthException catch (e) {
      showDialogWait.hide(context);
      return e.message;
    }
  }

  Future modifyFinish(BuildContext context, ShowDialogWait showDialogWait,
      CategoryModel categoryModel, bool isFinishModifyImage01) async {
    try {
      if (isFinishModifyImage01) {
        final firestoreInstance = FirebaseFirestore.instance;

        firestoreInstance
            .collection(firebaseCustomCategoryKey)
            .doc(categoryModel.key)
            .update(categoryModel.toJsonWithExportKeyToId());

        showDialogWait.hide(context);
      }
    } on FirebaseAuthException catch (e) {
      return e.message;
    }
  }

}
