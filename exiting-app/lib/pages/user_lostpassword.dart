import 'dart:async';

import 'package:mdexam/utils/firebase/firebase_auth.dart';
import 'package:mdexam/widgets/application_bar.dart';
import 'package:flutter/material.dart';
import 'package:mdexam/variables/globalvar.dart';

class UserLostPassword extends StatefulWidget {
  const UserLostPassword({Key? key}) : super(key: key);

  @override
  State<UserLostPassword> createState() => _UserLostPasswordState();
}

class _UserLostPasswordState extends State<UserLostPassword> {
  final _usernameController = TextEditingController();

  final _formKey = GlobalKey<FormState>();

  Future<bool> _onBackPressed() async {
    return true;
  }

  void init() {}

  @override
  Widget build(BuildContext context) {
    return WillPopScope(
        onWillPop: _onBackPressed,
        child: Scaffold(
            appBar: ApplicationBar(
              context: context,
              title: userLostPasswordTitle,
              withShareButton: false,
            ),
            body: ListView(children: [
              Form(
                key: _formKey,
                child: Padding(
                  padding: const EdgeInsets.all(35.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
/* Username */
                      TextFormField(
                        decoration: const InputDecoration(
                          icon: Icon(Icons.contact_mail_rounded),
                          hintText: userLostPasswordFieldUsernameHint,
                          labelText: userLostPasswordFieldUsernameLabel,
                        ),
                        controller: _usernameController,
                        validator: (value) {
                          if (value == null || value.isEmpty) {
                            return userLostPasswordFieldUsernameError;
                          }
                          return null;
                        },
                      ),

/* Finish */
                      Padding(
                        padding: const EdgeInsets.symmetric(vertical: 16.0),
                        child: Center(
                          child: ElevatedButton(
                            onPressed: () async {
                              if (_formKey.currentState!.validate()) {
                                FirebaseAuthenticationHelper()
                                    .lostPassword(
                                        email: _usernameController.text)
                                    .then((result) {
                                  if (result == null) {
                                    ScaffoldMessenger.of(context)
                                        .showSnackBar(const SnackBar(
                                      content: Text(
                                        userLostPasswordSendPassword,
                                        style: TextStyle(fontSize: 16),
                                      ),
                                    ));
                                    Navigator.pop(context);
                                    Navigator.pop(context);
                                  } else {
                                    ScaffoldMessenger.of(context)
                                        .showSnackBar(SnackBar(
                                      content: Text(
                                        result,
                                        style: const TextStyle(fontSize: 16),
                                      ),
                                    ));
                                  }
                                });
                              }
                            },
                            child: const Text(
                              userLostPasswordTitle

                              
                              ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ])));
  }
}
