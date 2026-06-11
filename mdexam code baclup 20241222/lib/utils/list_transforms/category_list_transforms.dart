import 'package:mdexam/models/category_model.dart';

List<String> categoryListToStringList(List<CategoryModel> list) {
  List<String> result = [];

  result.add("");

  for (int i = 0; i < list.length; i++) {
    result.add(list[i].title);
  }

  return result;
}

CategoryModel categoryStringToCategoryModel(
    List<CategoryModel> list, String key) {
  CategoryModel result = list[0];

  for (int i = 0; i < list.length; i++) {
    if (list[i].title.compareTo(key) == 0) {
      return list[i];
    }
  }

  return result;
}

uniquedAdd(List<CategoryModel> list, CategoryModel newCategory) {
  for (int i = 0; i < list.length; i++) {
    if (list[i].title.compareTo(newCategory.title) == 0) {
      return;
    }
  }

  list.add(newCategory);
}

List<CategoryModel> categorysStringToListCategoryModel(
    List<CategoryModel> list, String key) {
  List<CategoryModel> result = [];

  for (String tKey in key.split(",")) {
    result.add(categoryStringToCategoryModel(list, tKey));
  }

  return result;
}
