import 'package:flutter/material.dart';

class ShowDialogYesNo {
  VoidCallback onClickYes;
  VoidCallback onClickNo;

  ShowDialogYesNo({required this.onClickYes(), required this.onClickNo()})
      : super();

  void show(BuildContext context, String title, String question,
      String yesCaption, String noCaption) async {
    await showDialog(
        context: context,
        builder: (BuildContext context) {
          return AlertDialog(
            title: Text(title),
            content: SizedBox(
              height: 150,
              width: 200,
              child: Column(
                children: <Widget>[
                  Text(question),
                ],
              ),
            ),
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
                          Navigator.of(context).pop();

                          onClickYes();
                        },
                        child: Text(yesCaption)),
                    const SizedBox(height: 50),
                    ElevatedButton(
                        style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.red,
                            padding: const EdgeInsets.symmetric(
                                horizontal: 20, vertical: 9),
                            textStyle: const TextStyle(
                                fontSize: 16, fontWeight: FontWeight.normal)),
                        onPressed: () async {
                          Navigator.of(context).pop();

                          onClickNo();
                        },
                        child: Text(noCaption)),
                    const SizedBox(height: 50),
                  ])
            ],
          );
        });
  }
}
