import 'package:auto_size_text/auto_size_text.dart';
import 'package:flutter/material.dart';

Widget circleResumeBuild(
    String value, double fontSize, Color color, double diameter) {
  return Container(
      margin: const EdgeInsets.all(2),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.all(
          Radius.circular(diameter),
        ),
        color: color,
      ),
      child: Container(
        margin: const EdgeInsets.all(2),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.all(
            Radius.circular(diameter),
          ),
          color: Colors.white,
        ),
        child: Container(
          decoration: BoxDecoration(
            borderRadius: BorderRadius.all(
              Radius.circular(diameter),
            ),
            color: color,
          ),
          margin: const EdgeInsets.all(5),
          padding: const EdgeInsets.all(10),
          width: diameter,
          height: diameter,
          child: Center(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.center,
              mainAxisAlignment: MainAxisAlignment.center,
              children: <Widget>[
                AutoSizeText(
                  value,
                  maxLines: 1,
                  style: TextStyle(
                      fontSize: (fontSize - 1),
                      color: Colors.white,
                      fontStyle: FontStyle.normal,
                      fontWeight: FontWeight.bold),
                  textAlign: TextAlign.center,
                ),
              ],
            ),
          ),
        ),
      ));
}
