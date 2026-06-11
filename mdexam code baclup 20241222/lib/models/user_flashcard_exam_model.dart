import 'package:mdexam/models/flashcard_category_model.dart';
import 'package:mdexam/models/flashcard_question_answer_model.dart';

class UserFlashcardExamModel {
  bool exportKeyToId;
  String key;

  String username;
  String customTitle;
  List<FlashcardCategoryModel> categorys;
  bool isOpen;
  bool isShowTimeCounter;
  int maxQuestions;
  int maxTime;

  List<FlashcardQuestionAnswerModel> questionAnswers;

  DateTime creationTime;
  DateTime endTime;

  UserFlashcardExamModel(
    this.exportKeyToId,
    this.key,
    this.username,
    this.customTitle,
    this.categorys,
    this.isOpen,
    this.isShowTimeCounter,
    this.maxQuestions,
    this.maxTime,
    this.questionAnswers,
    this.creationTime,
    this.endTime,
  );

  factory UserFlashcardExamModel.fromJSON(
      bool exportKeyToId, String key, dynamic jsonData) {
    List<FlashcardQuestionAnswerModel> newQuestionAnswers;
    List<FlashcardCategoryModel> newCategorys;

    if (jsonData["questionAnswers"] == null) {
      newQuestionAnswers = [];
    } else {
      newQuestionAnswers = List<FlashcardQuestionAnswerModel>.from(
          jsonData["questionAnswers"]
              .map((x) => FlashcardQuestionAnswerModel.fromJSON(x)));
    }

    if (jsonData["categorys"] == null) {
      newCategorys = [];
      newCategorys.add(
          FlashcardCategoryModel.fromJSON(exportKeyToId, key, jsonData['category']));
    } else {
      newCategorys = List<FlashcardCategoryModel>.from(jsonData["categorys"]
          .map((x) => FlashcardCategoryModel.fromJSON(exportKeyToId, key, x)));
    }

    return UserFlashcardExamModel(
        exportKeyToId,
        key,
        jsonData['username'] as String,
        jsonData['customTitle'] != null
            ? jsonData['customTitle'] as String
            : "",
        newCategorys,
        jsonData['isOpen'] as bool,
        jsonData['isShowTimeCounter'] as bool,
        jsonData['maxQuestions'] as int,
        jsonData['maxTime'] as int,
        newQuestionAnswers,
        DateTime.fromMicrosecondsSinceEpoch(
            jsonData['creationTime'].microsecondsSinceEpoch),
        DateTime.fromMicrosecondsSinceEpoch(
            jsonData['endTime'].microsecondsSinceEpoch));
  }

  factory UserFlashcardExamModel.fromJSONWithIdToKey(
      bool exportKeyToId, String key, dynamic jsonData) {
    List<FlashcardQuestionAnswerModel> newQuestionAnswers;
    List<FlashcardCategoryModel> newCategorys;

    if (jsonData["questionAnswers"] == null) {
      newQuestionAnswers = [];
    } else {
      newQuestionAnswers = List<FlashcardQuestionAnswerModel>.from(
          jsonData["questionAnswers"]
              .map((x) => FlashcardQuestionAnswerModel.fromJSON(x)));
    }

    if (jsonData["categorys"] == null) {
      newCategorys = [];
      newCategorys.add(
          FlashcardCategoryModel.fromJSON(exportKeyToId, key, jsonData['category']));
    } else {
      newCategorys = List<FlashcardCategoryModel>.from(jsonData["categorys"]
          .map((x) => FlashcardCategoryModel.fromJSON(exportKeyToId, key, x)));
    }

    return UserFlashcardExamModel(
        exportKeyToId,
        jsonData['id'] as String,
        jsonData['username'] as String,
        jsonData['customTitle'] != null
            ? jsonData['customTitle'] as String
            : "",
        newCategorys,
        jsonData['isOpen'] as bool,
        jsonData['isShowTimeCounter'] as bool,
        jsonData['maxQuestions'] as int,
        jsonData['maxTime'] as int,
        newQuestionAnswers,
        DateTime.fromMicrosecondsSinceEpoch(
            jsonData['creationTime'].microsecondsSinceEpoch),
        DateTime.fromMicrosecondsSinceEpoch(
            jsonData['endTime'].microsecondsSinceEpoch));
  }

  Map<String, dynamic> toJson() => {
        if (exportKeyToId) 'id': key,
        'username': username,
        'customTitle': customTitle,
        'categorys': List<dynamic>.from(categorys.map((x) => x.toJson())),
        'isOpen': isOpen,
        'isShowTimeCounter': isShowTimeCounter,
        'maxQuestions': maxQuestions,
        'maxTime': maxTime,
        'questionAnswers':
            List<dynamic>.from(questionAnswers.map((x) => x.toJson())),
        'creationTime': creationTime,
        'endTime': endTime,
      };

  Map<String, dynamic> toJsonWithExportKeyToId() => {
        'id': key,
        'username': username,
        'customTitle': customTitle,
        'categorys': List<dynamic>.from(categorys.map((x) => x.toJson())),
        'isOpen': isOpen,
        'isShowTimeCounter': isShowTimeCounter,
        'maxQuestions': maxQuestions,
        'maxTime': maxTime,
        'questionAnswers':
            List<dynamic>.from(questionAnswers.map((x) => x.toJson())),
        'creationTime': creationTime,
        'endTime': endTime,
      };

  static String getKey(String loginUsername) {
    DateTime tNow = DateTime.now();

    return loginUsername
            .replaceAll(".", "_")
            .replaceAll(",", "_")
            .replaceAll("@", "_") +
        "_" +
        tNow.year.toString() +
        "_" +
        tNow.month.toString() +
        "_" +
        tNow.day.toString() +
        "_" +
        tNow.hour.toString() +
        "_" +
        tNow.minute.toString() +
        "_" +
        tNow.second.toString();
  }

  bool isFinished() {
    int i = 0;
    for (FlashcardQuestionAnswerModel questionAnswer in questionAnswers) {
      if (questionAnswer.isFinished()) {
        i++;
      }
    }

    if (i == questionAnswers.length) {
      return true;
    }

    if (DateTime.now().toUtc().isAfter(endTime.toUtc())) {
      return true;
    }

    return false;
  }

  int nextQuestion() {
    int i = -1;
    for (FlashcardQuestionAnswerModel questionAnswer in questionAnswers) {
      i++;
      if (!questionAnswer.isFinished()) {
        return i;
      }
    }

    return -1;
  }

  void setAnwser(FlashcardQuestionAnswerModel questionAnswer, int position) {
    questionAnswers[position] = questionAnswer;
  }

  String title() {
    if (customTitle.isEmpty) {
      return 
          " (" +
          creationTime.day.toString() +
          "/" +
          creationTime.month.toString() +
          "/" +
          creationTime.year.toString() +
          ")";
    } else {
      return customTitle;
    }
  }


  String categoryTitles() {
    String result = "";

    for (FlashcardCategoryModel oneCategory in categorys) {
      if (result.isNotEmpty) {
        result += " - ";
      }
      result += oneCategory.title;
    }

    return result;
  }
}
