class FlashcardAnswerModel {
  String title;
  bool isCorrect;

  FlashcardAnswerModel(
    this.title,
    this.isCorrect,
  );

  factory FlashcardAnswerModel.fromJSON(dynamic jsonData) {
    return FlashcardAnswerModel(
      jsonData['title'] as String,
      jsonData['isCorrect'] as bool,
    );
  }

  Map<String, dynamic> toJson() => {
        'title': title,
        'isCorrect': isCorrect,
      };
}
