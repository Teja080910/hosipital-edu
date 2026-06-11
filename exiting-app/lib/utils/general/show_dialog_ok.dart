import 'package:flutter/material.dart';
import 'package:mdexam/variables/globalvar.dart';

class ShowDialogOk {
  ShowDialogOk() : super();

  void show(BuildContext context, String title, String body) async {
    showDoubleClose(context, title, body, false);
  }

  void showDoubleClose(
      BuildContext context, String title, String body, bool doubleClose) async {
    await showDialog(
        context: context,
        builder: (BuildContext context) {
          return AlertDialog(
            title: Text(title),
            content: SizedBox(
              height: 100,
              width: 200,
              child: Column(
                children: <Widget>[
                  Text(body),
                ],
              ),
            ),
            actions: <Widget>[
              Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: <Widget>[
                    ElevatedButton(
                        style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.green,
                            padding: const EdgeInsets.symmetric(
                                horizontal: 20, vertical: 9),
                            textStyle: const TextStyle(
                                fontSize: 16, fontWeight: FontWeight.normal)),
                        onPressed: () async {
                          Navigator.of(context).pop();
                          if (doubleClose) {
                            Navigator.of(context).pop();
                          }
                        },
                        child: const Text(showDialogOkCaption)),
                  ])
            ],
          );
        });
  }


}
