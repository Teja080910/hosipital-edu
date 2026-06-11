import 'dart:math';
import 'package:mdexam/models/flashcard_answer_model.dart';
import 'package:mdexam/models/flashcard_category_model.dart';
import 'package:mdexam/models/flashcard_question_answer_model.dart';
import 'package:mdexam/models/flashcard_question_model.dart';
import 'package:mdexam/models/user_flashcard_exam_model.dart';
import 'package:mdexam/utils/general/show_dialog_wait.dart';
import 'package:mdexam/variables/globalvar.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';

class FirebaseCustomUserFlashcardExamHelper {
  Future add({
    required BuildContext context,
    required UserFlashcardExamModel userExamModel,
  }) async {
    ShowDialogWait showDialogWait = ShowDialogWait();
    showDialogWait.show(context, userFlashcardExamABMSaving);

    try {
      final firestoreInstance = FirebaseFirestore.instance;
      CollectionReference userExams =
          firestoreInstance.collection(firebaseCustomUserFlashcardExamKey);

      CollectionReference questions =
          firestoreInstance.collection(firebaseCustomFlashcardQuestionKey);

      List<String> resultIds = [];
      List<String> newIds = generateCategorysIds(userExamModel.categorys);

      do {
        String newId = newIds[_getRandomInt(0, newIds.length - 1)];

        if (!resultIds.contains(newId)) {
          DocumentSnapshot questionDocumentSnapshot =
              await questions.doc(newId).get();

          if (questionDocumentSnapshot.exists) {
            FlashcardQuestionModel questionModel =
                FlashcardQuestionModel.fromJSON(
                    false,
                    questionDocumentSnapshot.id,
                    questionDocumentSnapshot.data());

            FlashcardQuestionAnswerModel newQuestionAnswer =
                FlashcardQuestionAnswerModel(
                    questionModel, FlashcardAnswerModel("", false));

            userExamModel.questionAnswers.add(newQuestionAnswer);

            resultIds.add(newId);
          }
        }
      } while (
          userExamModel.questionAnswers.length < userExamModel.maxQuestions);

      await userExams
          .doc(userExamModel.key)
          .set(userExamModel.toJsonWithExportKeyToId());

      showDialogWait.hide(context);

      return null;
    } on FirebaseAuthException catch (e) {
      showDialogWait.hide(context);
      return e.message;
    }
  }

  Future update({
    required BuildContext context,
    required UserFlashcardExamModel userExamModel,
  }) async {
    try {
      final firestoreInstance = FirebaseFirestore.instance;
      CollectionReference userExams =
          firestoreInstance.collection(firebaseCustomUserFlashcardExamKey);

      await userExams
          .doc(userExamModel.key)
          .set(userExamModel.toJsonWithExportKeyToId());

      return null;
    } on FirebaseAuthException catch (e) {
      return e.message;
    }
  }

  List<String> generateCategorysIds(List<FlashcardCategoryModel> categorys) {
    List<String> result = [];

    for (FlashcardCategoryModel oneCategory in categorys) {
      for (int i = 1; i <= oneCategory.maxQuestions; i++) {
        result.add(FlashcardQuestionModel.getKey(oneCategory, i));
      }
    }

    return result;
  }

  int _getRandomInt(int min, int max) {
    final random = Random();
    return min + random.nextInt(max - min + 1);
  }
}
