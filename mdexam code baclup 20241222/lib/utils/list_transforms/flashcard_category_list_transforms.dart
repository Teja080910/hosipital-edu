import 'package:mdexam/models/flashcard_category_model.dart';

List<String> flashcardCategoryListToStringList(List<FlashcardCategoryModel> list) {
  List<String> result = [];

  result.add("");

  for (int i = 0; i < list.length; i++) {
    result.add(list[i].title);
  }

  return result;
}

FlashcardCategoryModel flashcardCategoryStringToFlashcardCategoryModel(
    List<FlashcardCategoryModel> list, String key) {
  FlashcardCategoryModel result = list[0];

  for (int i = 0; i < list.length; i++) {
    if (list[i].title.compareTo(key) == 0) {
      return list[i];
    }
  }

  return result;
}

uniquedAdd(List<FlashcardCategoryModel> list, FlashcardCategoryModel newCategory) {
  for (int i = 0; i < list.length; i++) {
    if (list[i].title.compareTo(newCategory.title) == 0) {
      return;
    }
  }

  list.add(newCategory);
}

List<FlashcardCategoryModel> flashcardCategorysStringToListFlashcardCategoryModel(
    List<FlashcardCategoryModel> list, String key) {
  List<FlashcardCategoryModel> result = [];

  for (String tKey in key.split(",")) {
    result.add(flashcardCategoryStringToFlashcardCategoryModel(list, tKey));
  }

  return result;
}
