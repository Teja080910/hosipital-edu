import 'package:mdexam/models/answer_model.dart';
import 'package:mdexam/models/question_model.dart';

class QuestionAnswerModel {
  QuestionModel question;
  AnswerModel answer;

  QuestionAnswerModel(
    this.question,
    this.answer,
  );

  factory QuestionAnswerModel.fromJSON(dynamic jsonData) {
    return QuestionAnswerModel(
      QuestionModel.fromJSON(false, "", jsonData['question']),
      AnswerModel.fromJSON(jsonData['answer']),
    );
  }

  Map<String, dynamic> toJson() => {
        'question': question.toJson(false),
        'answer': answer.toJson(),
      };

  bool isFinished() {
    return answer.title.isNotEmpty;
  }
}
