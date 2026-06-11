import 'package:flutter/material.dart';

class ShowDialogWait {
  ShowDialogWait() : super();

  void show(BuildContext context, String title) async {
    await showDialog(
        barrierDismissible: false,
        context: context,
        builder: (BuildContext context) {
          return AlertDialog(
            backgroundColor: Colors.white70,
            shape: const RoundedRectangleBorder(
                borderRadius: BorderRadius.all(Radius.circular(50))),
            content: SizedBox(
              height: 200,
              width: 200,
              child: Column(
                children: <Widget>[
                  const SizedBox(
                    height: 50,
                  ),
                  const CircularProgressIndicator(),
                  const SizedBox(
                    height: 50,
                  ),
                  Text(title,
                      maxLines: 1,
                      style: const TextStyle(
                          color: Colors.black,
                          fontSize: 20,
                          fontWeight: FontWeight.w500))
                ],
              ),
            ),
          );
        });
  }

  void hide(BuildContext context) {
    Navigator.of(context).pop();
  }
}
