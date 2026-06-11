import 'package:flutter/material.dart';

errorDialog(BuildContext context, String errorMsg) {
  //May have a bug
  showDialog<String>(
      context: context,
      builder: (BuildContext context) => AlertDialog(
            title: const Text('Error!'),
            content: Text(errorMsg),
            actions: <Widget>[
              Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  TextButton(
                      onPressed: () => Navigator.pop(context, 'OK'),
                      child: const Text('Okay'))
                ],
              )
            ],
          ));
}
