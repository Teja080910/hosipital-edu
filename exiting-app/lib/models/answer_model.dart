class AnswerModel {
  String title;
  bool isCorrect;

  AnswerModel(
    this.title,
    this.isCorrect,
  );

  factory AnswerModel.fromJSON(dynamic jsonData) {
    return AnswerModel(
      jsonData['title'] as String,
      jsonData['isCorrect'] as bool,
    );
  }

  Map<String, dynamic> toJson() => {
        'title': title,
        'isCorrect': isCorrect,
      };
}
