import 'package:flutter/material.dart';

Widget textViewFormat(String title, IconData icon, String text) {
  return Padding(
      padding: const EdgeInsets.only(left: 5, right: 5, top: 15, bottom: 5),
      child: Column(children: [
        title.isNotEmpty
            ? Padding(
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
                ))
            : Container(),
        Container(
            decoration: BoxDecoration(
                color: Colors.grey[200],
                borderRadius: const BorderRadius.all(Radius.circular(40))),
            child: Row(children: [
              Padding(
                  padding: const EdgeInsets.only(
                      top: 5, bottom: 5, left: 20, right: 10),
                  child: Icon(icon, size: 30)),
              Padding(
                padding: const EdgeInsets.all(5),
                child: Text(
                  text,
                  maxLines: 1,
                  style: const TextStyle(
                      color: Colors.black,
                      fontSize: 15,
                      fontWeight: FontWeight.w500),
                ),
              )
            ])),
      ]));
}
