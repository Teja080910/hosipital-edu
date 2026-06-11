import 'package:mdexam/utils/general/reference_Page_State.dart';
import 'package:mdexam/utils/list_transforms/list_transforms.dart';
import 'package:flutter/material.dart';

Widget dropDownButtomEditFormatValueChanged(
    ReferencePageState referencePageState,
    BuildContext context,
    String title,
    IconData icon,
    List<String> list,
    TextEditingController textEditingController,
    ValueChanged<String> valueChanged) {
  if (list.isEmpty) {
    list.add("");
  }

  String inputText = textEditingController.text;
  if (inputText.isEmpty) {
    inputText = list[0];
  }

  inputText = listIntoOrReset(list, inputText);

  return Padding(
      padding: const EdgeInsets.only(left: 5, right: 5, top: 15, bottom: 5),
      child: Column(children: [
        Padding(
            padding: const EdgeInsets.all(5),
            child: Align(
              alignment: Alignment.centerLeft,
              child: Text(title,
                  maxLines: 1,
                  style: const TextStyle(
                    color: Colors.black,
                    fontSize: 15,
                    fontWeight: FontWeight.bold,
                  )),
            )),
        Padding(
          padding: const EdgeInsets.only(top: 5, bottom: 5, left: 0, right: 10),
          child: Container(
              decoration: BoxDecoration(
                  color: Colors.grey[200],
                  borderRadius: const BorderRadius.all(Radius.circular(40))),
              child: Row(
                children: [
                  Padding(
                      padding: const EdgeInsets.only(
                          top: 5, bottom: 5, left: 5, right: 10),
                      child: Icon(icon, size: 30)),
                  Expanded(
                      child: DropdownButton<String>(
                    value: inputText,
                    icon: const Icon(Icons.arrow_downward),
                    iconSize: 30,
                    elevation: 16,
                    style: const TextStyle(color: Colors.black),
                    underline: Container(
                      height: 2,
                      color: Colors.transparent,
                    ),
                    onChanged: (String? newValue) {
                      textEditingController.text = newValue!;
                      referencePageState.setStates();

                      valueChanged.call(textEditingController.text);
                    },
                    items: list.map<DropdownMenuItem<String>>((String value) {
                      return DropdownMenuItem<String>(
                        value: value,
                        child: Text(value),
                      );
                    }).toList(),
                  ))
                ],
              )),
        )
      ]));
}
