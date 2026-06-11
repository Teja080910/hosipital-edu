import 'package:mdexam/models/flashcard_category_model.dart';
import 'package:mdexam/models/flashcard_question_model.dart';
import 'package:mdexam/utils/general/show_dialog_wait.dart';
import 'package:mdexam/variables/globalvar.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';

typedef VoidCallbackSavePhotoFinish = void Function(String storage, String url);
typedef VoidCallbackString = void Function(String string);

class FirebaseCustomFlashcardQuestionHelper {
  Future add(
      {required BuildContext context,
      required FlashcardQuestionModel questionModel,
      required VoidCallback onFinish,
      required VoidCallbackString onError}) async {
    ShowDialogWait showDialogWait = ShowDialogWait();
    showDialogWait.show(context, flashcardQuestionSaving);

    try {
      addFinish(context, showDialogWait, questionModel, () {
        onFinish();
      }, (String error) {
        onError(error);
      });
    } on FirebaseAuthException catch (e) {
      showDialogWait.hide(context);
      onError(e.message.toString());
    }
  }

  Future addFinish(
      BuildContext context,
      ShowDialogWait showDialogWait,
      FlashcardQuestionModel questionModel,
      VoidCallback onFinish,
      VoidCallbackString onError) async {
    try {
      final firestoreInstance = FirebaseFirestore.instance;

      CollectionReference category =
          firestoreInstance.collection(firebaseCustomFlashcardCategoryKey);

      DocumentSnapshot categoryDocumentSnapshot =
          await category.doc(questionModel.category.key).get();

      FlashcardCategoryModel categoryModel = FlashcardCategoryModel.fromJSON(
          true, categoryDocumentSnapshot.id, categoryDocumentSnapshot.data());

      categoryModel.maxQuestions += 1;

      CollectionReference question =
          firestoreInstance.collection(firebaseCustomFlashcardQuestionKey);
      await question
          .doc(FlashcardQuestionModel.getKey(
              categoryModel, categoryModel.maxQuestions))
          .set(questionModel.toJsonWithExportKeyToId(true));

      await category.doc(categoryModel.key).update(categoryModel.toJson());

      showDialogWait.hide(context);

      onFinish();
    } on FirebaseAuthException catch (e) {
      onError(e.message.toString());
    }
  }

  Future modify(
      {required BuildContext context,
      required FlashcardQuestionModel questionModel,
      required VoidCallback onFinish,
      required VoidCallbackString onError}) async {
    ShowDialogWait showDialogWait = ShowDialogWait();
    showDialogWait.show(context, flashcardQuestionSaving);

    try {
      modifyFinish(context, showDialogWait, questionModel, () {
        onFinish();
      }, (String error) {
        onError(error);
      });
    } on FirebaseAuthException catch (e) {
      showDialogWait.hide(context);
      onError(e.message.toString());
    }
  }

  Future modifyFinish(
      BuildContext context,
      ShowDialogWait showDialogWait,
      FlashcardQuestionModel questionModel,
      VoidCallback onFinish,
      VoidCallbackString onError) async {
    try {
      final firestoreInstance = FirebaseFirestore.instance;

      firestoreInstance
          .collection(firebaseCustomFlashcardQuestionKey)
          .doc(questionModel.key)
          .update(questionModel.toJsonWithExportKeyToId(true));

      showDialogWait.hide(context);

      onFinish();
    } on FirebaseAuthException catch (e) {
      onError(e.message.toString());
    }
  }

  Future setDelete(
      {required BuildContext context,
      required FlashcardQuestionModel questionModel}) async {
    try {
      ShowDialogWait showDialogWait = ShowDialogWait();
      showDialogWait.show(context, flashcardQuestionDeleting);

      final firestoreInstance = FirebaseFirestore.instance;
      firestoreInstance
          .collection(firebaseCustomFlashcardQuestionKey)
          .doc(questionModel.key)
          .delete();

      showDialogWait.hide(context);

      return null;
    } on FirebaseAuthException catch (e) {
      return e.message;
    }
  }

}
