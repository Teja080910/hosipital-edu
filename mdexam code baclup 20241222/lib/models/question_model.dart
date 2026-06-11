// ignore_for_file: prefer_if_null_operators

import 'package:mdexam/models/answer_model.dart';
import 'package:mdexam/models/category_model.dart';
import 'package:mdexam/utils/general/array_search.dart';

class QuestionModel {
  static int minCicles = 5;

  bool exportKeyToId;
  String key;

  CategoryModel category;
  String title;
  String explanation;
  String reference;
  List<AnswerModel> answers;
  bool isEnabled;

  String storageTitle01;
  String urlTitle01;

  String storageTitle02;
  String urlTitle02;

  String storageTitle03;
  String urlTitle03;

  String storageExplanation01;
  String urlExplanation01;

  String storageExplanation02;
  String urlExplanation02;

  String storageExplanation03;
  String urlExplanation03;

  String storageReference01;
  String urlReference01;

  String storageReference02;
  String urlReference02;

  String storageReference03;
  String urlReference03;

  DateTime creationTime;

  QuestionModel(
      this.exportKeyToId,
      this.key,
      this.category,
      this.title,
      this.explanation,
      this.reference,
      this.answers,
      this.isEnabled,
      this.storageTitle01,
      this.urlTitle01,
      this.storageTitle02,
      this.urlTitle02,
      this.storageTitle03,
      this.urlTitle03,
      this.storageExplanation01,
      this.urlExplanation01,
      this.storageExplanation02,
      this.urlExplanation02,
      this.storageExplanation03,
      this.urlExplanation03,
      this.storageReference01,
      this.urlReference01,
      this.storageReference02,
      this.urlReference02,
      this.storageReference03,
      this.urlReference03,
      this.creationTime);

  factory QuestionModel.fromJSON(
      bool exportKeyToId, String key, dynamic jsonData) {
    List<AnswerModel> newAnswers;

    if (jsonData["answers"] == null) {
      newAnswers = [];
    } else {
      newAnswers = List<AnswerModel>.from(
          jsonData["answers"].map((x) => AnswerModel.fromJSON(x)));
    }

    completeAnswersDefault(newAnswers);

    return QuestionModel(
        exportKeyToId,
        key,
        CategoryModel.fromJSON(
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
        jsonData['storageTitle01'] != null
            ? jsonData['storageTitle01'] as String
            : "",
        jsonData['urlTitle01'] != null ? jsonData['urlTitle01'] as String : "",
        jsonData['storageTitle02'] != null
            ? jsonData['storageTitle02'] as String
            : "",
        jsonData['urlTitle02'] != null ? jsonData['urlTitle02'] as String : "",
        jsonData['storageTitle03'] != null
            ? jsonData['storageTitle03'] as String
            : "",
        jsonData['urlTitle03'] != null ? jsonData['urlTitle03'] as String : "",
        jsonData['storageExplanation01'] != null
            ? jsonData['storageExplanation01'] as String
            : "",
        jsonData['urlExplanation01'] != null
            ? jsonData['urlExplanation01'] as String
            : "",
        jsonData['storageExplanation02'] != null
            ? jsonData['storageExplanation02'] as String
            : "",
        jsonData['urlExplanation02'] != null
            ? jsonData['urlExplanation02'] as String
            : "",
        jsonData['storageExplanation03'] != null
            ? jsonData['storageExplanation03'] as String
            : "",
        jsonData['urlExplanation03'] != null
            ? jsonData['urlExplanation03'] as String
            : "",
        jsonData['storageReference01'] != null
            ? jsonData['storageReference01'] as String
            : "",
        jsonData['urlReference01'] != null
            ? jsonData['urlReference01'] as String
            : "",
        jsonData['storageReference02'] != null
            ? jsonData['storageReference02'] as String
            : "",
        jsonData['urlReference02'] != null
            ? jsonData['urlReference02'] as String
            : "",
        jsonData['storageReference03'] != null
            ? jsonData['storageReference03'] as String
            : "",
        jsonData['urlReference03'] != null
            ? jsonData['urlReference03'] as String
            : "",
        DateTime.fromMicrosecondsSinceEpoch(
            jsonData['creationTime'].microsecondsSinceEpoch));
  }

  factory QuestionModel.fromJSONWithIdToKey(
      bool exportKeyToId, String key, dynamic jsonData) {
    List<AnswerModel> newAnswers;

    if (jsonData["answers"] == null) {
      newAnswers = [];
    } else {
      newAnswers = List<AnswerModel>.from(
          jsonData["answers"].map((x) => AnswerModel.fromJSON(x)));
    }

    completeAnswersDefault(newAnswers);

    return QuestionModel(
        exportKeyToId,
        jsonData['id'] as String,
        CategoryModel.fromJSON(
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
        jsonData['storageTitle01'] != null
            ? jsonData['storageTitle01'] as String
            : "",
        jsonData['urlTitle01'] != null ? jsonData['urlTitle01'] as String : "",
        jsonData['storageTitle02'] != null
            ? jsonData['storageTitle02'] as String
            : "",
        jsonData['urlTitle02'] != null ? jsonData['urlTitle02'] as String : "",
        jsonData['storageTitle03'] != null
            ? jsonData['storageTitle03'] as String
            : "",
        jsonData['urlTitle03'] != null ? jsonData['urlTitle03'] as String : "",
        jsonData['storageExplanation01'] != null
            ? jsonData['storageExplanation01'] as String
            : "",
        jsonData['urlExplanation01'] != null
            ? jsonData['urlExplanation01'] as String
            : "",
        jsonData['storageExplanation02'] != null
            ? jsonData['storageExplanation02'] as String
            : "",
        jsonData['urlExplanation02'] != null
            ? jsonData['urlExplanation02'] as String
            : "",
        jsonData['storageExplanation03'] != null
            ? jsonData['storageExplanation03'] as String
            : "",
        jsonData['urlExplanation03'] != null
            ? jsonData['urlExplanation03'] as String
            : "",
        jsonData['storageReference01'] != null
            ? jsonData['storageReference01'] as String
            : "",
        jsonData['urlReference01'] != null
            ? jsonData['urlReference01'] as String
            : "",
        jsonData['storageReference02'] != null
            ? jsonData['storageReference02'] as String
            : "",
        jsonData['urlReference02'] != null
            ? jsonData['urlReference02'] as String
            : "",
        jsonData['storageReference03'] != null
            ? jsonData['storageReference03'] as String
            : "",
        jsonData['urlReference03'] != null
            ? jsonData['urlReference03'] as String
            : "",
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
        'storageTitle01': storageTitle01,
        'urlTitle01': urlTitle01,
        'storageTitle02': storageTitle02,
        'urlTitle02': urlTitle02,
        'storageTitle03': storageTitle03,
        'urlTitle03': urlTitle03,
        'storageExplanation01': storageExplanation01,
        'urlExplanation01': urlExplanation01,
        'storageExplanation02': storageExplanation02,
        'urlExplanation02': urlExplanation02,
        'storageExplanation03': storageExplanation03,
        'urlExplanation03': urlExplanation03,
        'storageReference01': storageReference01,
        'urlReference01': urlReference01,
        'storageReference02': storageReference02,
        'urlReference02': urlReference02,
        'storageReference03': storageReference03,
        'urlReference03': urlReference03,
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
        'storageTitle01': storageTitle01,
        'urlTitle01': urlTitle01,
        'storageTitle02': storageTitle02,
        'urlTitle02': urlTitle02,
        'storageTitle03': storageTitle03,
        'urlTitle03': urlTitle03,
        'storageExplanation01': storageExplanation01,
        'urlExplanation01': urlExplanation01,
        'storageExplanation02': storageExplanation02,
        'urlExplanation02': urlExplanation02,
        'storageExplanation03': storageExplanation03,
        'urlExplanation03': urlExplanation03,
        'storageReference01': storageReference01,
        'urlReference01': urlReference01,
        'storageReference02': storageReference02,
        'urlReference02': urlReference02,
        'storageReference03': storageReference03,
        'urlReference03': urlReference03,
        'creationTime': creationTime,
        'arraySearch': getArraySearch((title).toLowerCase(), withArraySearch),
      };

  static void completeAnswersDefault(List<AnswerModel> answers) {
    if (answers.length < minCicles) {
      for (int i = answers.length; i < minCicles; i++) {
        answers.add(AnswerModel("", false));
      }
    }
  }

  static String getKey(CategoryModel categoryModel, int id) {
    String tId = id.toString();

    tId = tId.padLeft(7 - tId.length, "0");

    return "C_" + categoryModel.key + "_I_" + tId;
  }
}
