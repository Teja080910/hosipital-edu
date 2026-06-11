import 'package:mdexam/models/parameter_model.dart';

List<String> parameterListToStringList(List<ParameterModel> list) {
  List<String> result = [];

  result.add("");

  for (int i = 0; i < list.length; i++) {
    result.add(list[i].title);
  }

  return result;
}

ParameterModel parameterStringToParameterModel(List<ParameterModel> list, String key) {
  ParameterModel result = list[0];

  for (int i = 0; i < list.length; i++) {
    if (list[i].title.compareTo(key) == 0) {
      return list[i];
    }
  }

  return result;
}

ParameterModel parameterStringFromKey2ToParameterModel(List<ParameterModel> list, String key2) {
  ParameterModel result = list[0];

  for (int i = 0; i < list.length; i++) {
    if (list[i].key2.compareTo(key2) == 0) {
      return list[i];
    }
  }

  return result;
}


uniquedAdd(List<ParameterModel> list, ParameterModel newParameter) {
  for (int i = 0; i < list.length; i++) {
    if (list[i].key2.compareTo(newParameter.key2) == 0) {
      return;
    }
  }

  list.add(newParameter);
}
