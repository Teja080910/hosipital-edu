import 'package:flutter/material.dart';

Widget textEditFormat(BuildContext context, String title, IconData icon,
    String text, String hintText, TextEditingController textEditingController) {
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
            padding:
                const EdgeInsets.only(top: 5, bottom: 5, left: 0, right: 10),
            child: Row(
              children: [
                Expanded(
                    child: TextField(
                        controller: textEditingController,
                        onChanged: (String value) {
//                          textEditingController.text = value;
                        },
                        decoration: InputDecoration(
                            prefixIcon: Icon(icon, size: 30),
                            hintText: hintText,
                            labelText: "",
                            filled: true,
                            fillColor: Colors.grey[200],
                            enabledBorder: const OutlineInputBorder(
                                borderSide: BorderSide(
                                    width: 0,
                                    color: Colors.white,
                                    style: BorderStyle.none),
                                borderRadius:
                                    BorderRadius.all(Radius.circular(40))),
                            focusedBorder: const OutlineInputBorder(
                                borderSide: BorderSide(
                                    width: 0,
                                    color: Colors.white,
                                    style: BorderStyle.none),
                                borderRadius:
                                    BorderRadius.all(Radius.circular(40)))))
                    //)
                    //)
                    )
              ],
            )),
      ]));
}
