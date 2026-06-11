import 'package:flutter/material.dart';
import 'package:mdexam/utils/general/custom_button.dart';

Widget optionBuild(String title, IconData icon, Color iconColor,
    String buttonTitle, double factor, VoidCallback onClick) {
  return Container(
      margin: const EdgeInsets.all(10),
      decoration: const BoxDecoration(
        borderRadius: BorderRadius.all(
          Radius.circular(10),
        ),
        color: Colors.grey,
      ),
      child: Container(
          margin: const EdgeInsets.all(1),
          decoration: const BoxDecoration(
            borderRadius: BorderRadius.all(
              Radius.circular(10),
            ),
            color: Colors.white,
          ),
          child: Container(
              color: Colors.white,
              margin: const EdgeInsets.only(
                  left: 10, right: 10, top: 20, bottom: 20),
              child: SizedBox(
                  height: 300,
                  width: 200 * factor,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.center,
                    mainAxisAlignment: MainAxisAlignment.center,
                    mainAxisSize: MainAxisSize.max,
                    children: [
                      Icon(
                        icon,
                        color: iconColor,
                        size: 110 * factor,
                      ),
                      const SizedBox(
                        height: 10,
                      ),
                      Text(
                        title,
                        textAlign: TextAlign.center,
                        style: TextStyle(
                            color: Colors.black87,
                            fontSize: 25.0 * factor,
                            fontWeight: FontWeight.w500),
                      ),
                      const SizedBox(
                        height: 10,
                      ),
                      CustomButton(
                          buttonTitle,
                          Icons.arrow_circle_right_outlined,
                          true,
                          Colors.white,
                          Colors.green, () {
                        onClick();
                      })
                    ],
                  )))));
}
