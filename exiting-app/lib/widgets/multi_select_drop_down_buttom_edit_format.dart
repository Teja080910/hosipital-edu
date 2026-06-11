import 'package:mdexam/utils/list_transforms/list_transforms.dart';
import 'package:mdexam/utils/general/reference_Page_State.dart';
import 'package:flutter/material.dart';
import 'package:multi_dropdown/multiselect_dropdown.dart';

Widget multiSelectDropDownButtomEditFormat(
    ReferencePageState referencePageState,
    BuildContext context,
    String title,
    IconData icon,
    List<String> list,
    TextEditingController textEditingController) {
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
                    child: MultiSelectDropDown(
//              controller: _controller,
                      onOptionSelected: (options) {
//                        debugPrint(options.toString());

                        textEditingController.text = "";
                        for (ValueItem oneValueItem in options) {
                          if (textEditingController.text.isNotEmpty) {
                            textEditingController.text += ",";
                          }
                          textEditingController.text += oneValueItem.value
                              .toString()
                              .replaceAll(",", " ");
                        }
                      },

/*              
              options: const <ValueItem>[
                ValueItem(label: 'Option 1', value: '1'),
                ValueItem(label: 'Option 2', value: '2'),
                ValueItem(label: 'Option 3', value: '3'),
                ValueItem(label: 'Option 4', value: '4'),
                ValueItem(label: 'Option 5', value: '5'),
                ValueItem(label: 'Option 6', value: '6'),
              ],
*/

                      options: list.map<ValueItem>((String value) {
                        return ValueItem(label: value, value: value);
                      }).toList(),

//              maxItems: 2,
//              disabledOptions: const [ValueItem(label: 'Option 1', value: '1')],
                      selectionType: SelectionType.multi,
                      chipConfig: const ChipConfig(wrapType: WrapType.wrap),
                      dropdownHeight: 300,
                      optionTextStyle: const TextStyle(fontSize: 16),
                      selectedOptionIcon: const Icon(Icons.check_circle),
                    ),

/*                      
                      DropdownButton<String>(
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
                    },
                    items: list.map<DropdownMenuItem<String>>((String value) {
                      return DropdownMenuItem<String>(
                        value: value,
                        child: Text(value),
                      );
                    }).toList(),
                  )
*/
                  )
                ],
              )),
        )
      ]));
}


/*
MultiSelectDropDown(
              showClearIcon: true,
              controller: _controller,
              onOptionSelected: (options) {
                debugPrint(options.toString());
              },
              options: const <ValueItem>[
                ValueItem(label: 'Option 1', value: '1'),
                ValueItem(label: 'Option 2', value: '2'),
                ValueItem(label: 'Option 3', value: '3'),
                ValueItem(label: 'Option 4', value: '4'),
                ValueItem(label: 'Option 5', value: '5'),
                ValueItem(label: 'Option 6', value: '6'),
              ],
              maxItems: 2,
              disabledOptions: const [ValueItem(label: 'Option 1', value: '1')],
              selectionType: SelectionType.multi,
              chipConfig: const ChipConfig(wrapType: WrapType.wrap),
              dropdownHeight: 300,
              optionTextStyle: const TextStyle(fontSize: 16),
              selectedOptionIcon: const Icon(Icons.check_circle),
            ),
*/
