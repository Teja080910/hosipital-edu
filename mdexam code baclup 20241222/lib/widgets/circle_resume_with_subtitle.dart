import 'package:flutter/material.dart';
import 'package:mdexam/widgets/circle_resume_build.dart';

Widget circleResumeWithSubtitleBuild(String value, double fontSize, Color color,
    double diameter, String subTitle) {
  return Column(children: [
    circleResumeBuild(value, fontSize, color, diameter),
    Container(
      height: 10,
    ),
    Padding(
        padding: const EdgeInsets.all(5),
        child: SizedBox(
          width: diameter,
          child: Text(subTitle,
              maxLines: 4,
              textAlign: TextAlign.center,
              style: const TextStyle(
                  color: Colors.black,
                  fontSize: 12, //15
                  fontWeight: FontWeight.bold)),
        ))
  ]);
}
