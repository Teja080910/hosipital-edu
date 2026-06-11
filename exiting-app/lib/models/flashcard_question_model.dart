// ignore_for_file: prefer_if_null_operators

import 'package:mdexam/models/flashcard_answer_model.dart';
import 'package:mdexam/models/flashcard_category_model.dart';
import 'package:mdexam/utils/general/array_search.dart';

class FlashcardQuestionModel {
  static int minCicles = 1;

  bool exportKeyToId;
  String key;

  FlashcardCategoryModel category;
  String title;
  String explanation;
  String reference;
  List<FlashcardAnswerModel> answers;
  bool isEnabled;

  DateTime creationTime;

  FlashcardQuestionModel(
      this.exportKeyToId,
      this.key,
      this.category,
      this.title,
      this.explanation,
      this.reference,
      this.answers,
      this.isEnabled,
      this.creationTime);

  factory FlashcardQuestionModel.fromJSON(
      bool exportKeyToId, String key, dynamic jsonData) {
    List<FlashcardAnswerModel> newAnswers;

    if (jsonData["answers"] == null) {
      newAnswers = [];
    } else {
      newAnswers = List<FlashcardAnswerModel>.from(
          jsonData["answers"].map((x) => FlashcardAnswerModel.fromJSON(x)));
    }

    completeAnswersDefault(newAnswers);

    return FlashcardQuestionModel(
        exportKeyToId,
        key,
        FlashcardCategoryModel.fromJSON(
            false,
            jsonData['category']['id'] != null
                ? jsonData['category']['id']
                : "",
            jsonData['category']),
        jsonData['title'] as String,
        jsonData['explanation'] as String,
        jsonData['reference'] != null ? jsonData['reference'] as String : "",
        newAnswers,
        jsonData['isEnabled'] as bool,
        DateTime.fromMicrosecondsSinceEpoch(
            jsonData['creationTime'].microsecondsSinceEpoch));
  }

  factory FlashcardQuestionModel.fromJSONWithIdToKey(
      bool exportKeyToId, String key, dynamic jsonData) {
    List<FlashcardAnswerModel> newAnswers;

    if (jsonData["answers"] == null) {
      newAnswers = [];
    } else {
      newAnswers = List<FlashcardAnswerModel>.from(
          jsonData["answers"].map((x) => FlashcardAnswerModel.fromJSON(x)));
    }

    completeAnswersDefault(newAnswers);

    return FlashcardQuestionModel(
        exportKeyToId,
        jsonData['id'] as String,
        FlashcardCategoryModel.fromJSON(
            false,
            jsonData['category']['id'] != null
                ? jsonData['category']['id']
                : "",
            jsonData['category']),
        jsonData['title'] as String,
        jsonData['explanation'] as String,
        jsonData['reference'] != null ? jsonData['reference'] as String : "",
        newAnswers,
        jsonData['isEnabled'] as bool,
        DateTime.fromMicrosecondsSinceEpoch(
            jsonData['creationTime'].microsecondsSinceEpoch));
  }

  Map<String, dynamic> toJson(bool withArraySearch) => {
        if (exportKeyToId) 'id': key,
        'category': category.toJson(),
        'title': title,
        'explanation': explanation,
        'reference': reference,
        'answers': List<dynamic>.from(answers.map((x) => x.toJson())),
        'isEnabled': isEnabled,
        'creationTime': creationTime,
        'arraySearch': getArraySearch((title).toLowerCase(), withArraySearch),
      };

  Map<String, dynamic> toJsonWithExportKeyToId(bool withArraySearch) => {
        'id': key,
        'category': category.toJsonWithExportKeyToId(),
        'title': title,
        'explanation': explanation,
        'reference': reference,
        'answers': List<dynamic>.from(answers.map((x) => x.toJson())),
        'isEnabled': isEnabled,
        'creationTime': creationTime,
        'arraySearch': getArraySearch((title).toLowerCase(), withArraySearch),
      };

  static void completeAnswersDefault(List<FlashcardAnswerModel> answers) {
    if (answers.length < minCicles) {
      for (int i = answers.length; i < minCicles; i++) {
        answers.add(FlashcardAnswerModel("", false));
      }
    }
  }

  static String getKey(FlashcardCategoryModel categoryModel, int id) {
    String tId = id.toString();

    tId = tId.padLeft(7 - tId.length, "0");

    return "C_" + categoryModel.key + "_I_" + tId;
  }
}
