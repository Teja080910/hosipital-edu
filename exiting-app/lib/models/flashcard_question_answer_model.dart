import 'package:mdexam/models/flashcard_answer_model.dart';
import 'package:mdexam/models/flashcard_question_model.dart';

class FlashcardQuestionAnswerModel {
  FlashcardQuestionModel question;
  FlashcardAnswerModel answer;

  FlashcardQuestionAnswerModel(
    this.question,
    this.answer,
  );

  factory FlashcardQuestionAnswerModel.fromJSON(dynamic jsonData) {
    return FlashcardQuestionAnswerModel(
      FlashcardQuestionModel.fromJSON(false, "", jsonData['question']),
      FlashcardAnswerModel.fromJSON(jsonData['answer']),
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
