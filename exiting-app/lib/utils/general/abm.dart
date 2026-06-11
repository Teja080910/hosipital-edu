import 'package:mdexam/variables/globalvar.dart';
import 'package:flutter/material.dart';

Future<bool> abmOnBackPressed2(
    BuildContext context, VoidCallback onYesTap, VoidCallback onNoTap) async {
  return await showDialog(
        context: context,
        builder: (context) => AlertDialog(
          title: const Text(abmBackPressedTitle),
          content: const Text(abmBackPressedContent),
          actions: <Widget>[
            Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: <Widget>[
                  const SizedBox(height: 50),
                  ElevatedButton(
                      style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.green,
                          padding: const EdgeInsets.symmetric(
                              horizontal: 20, vertical: 9),
                          textStyle: const TextStyle(
                              fontSize: 16, fontWeight: FontWeight.normal)),
                      onPressed: () async {
                        Navigator.of(context).pop(true);
                        onYesTap();
                      },
                      child: const Text(abmBackPressedYes)),
                  const SizedBox(height: 50),
                  ElevatedButton(
                      style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.red,
                          padding: const EdgeInsets.symmetric(
                              horizontal: 20, vertical: 9),
                          textStyle: const TextStyle(
                              fontSize: 16, fontWeight: FontWeight.normal)),
                      onPressed: () async {
                        Navigator.of(context).pop(false);
                        onNoTap();
                      },
                      child: const Text(abmBackPressedNo)),
                  const SizedBox(height: 50),
                ])
          ],
        ),
      ) ??
      false;
}
