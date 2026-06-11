// ignore: import_of_legacy_library_into_null_safe
import 'package:mdexam/models/user_model.dart';
import 'package:mdexam/pages/home.dart';
import 'package:mdexam/pages/user_simple_add.dart';
import 'package:mdexam/utils/firebase/firebase_auth.dart';
import 'package:mdexam/utils/general/custom_button.dart';
import 'package:mdexam/widgets/application_bar.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';
import 'package:mdexam/variables/globalvar.dart';
import 'package:mdexam/widgets/menu.dart';
import 'package:shared_preferences/shared_preferences.dart';

// ignore: must_be_immutable
class UserLogin extends StatefulWidget {
  HomePageState homePageState;
  bool dobleClosed;

  UserLogin({Key? key, required this.homePageState, required this.dobleClosed})
      : super(key: key);

  @override
  State<UserLogin> createState() => _UserLoginState();
}

class _UserLoginState extends State<UserLogin> {
  final _usernameController = TextEditingController();
  final _passwordController = TextEditingController();

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
              title: userLoginTitle,
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
                          hintText: userLoginFieldUsernameHint,
                          labelText: userLoginFieldUsernameLabel,
                        ),
                        controller: _usernameController,
                        validator: (value) {
                          if (value == null || value.isEmpty) {
                            return userLoginFieldUsernameError;
                          }
                          return null;
                        },
                      ),

/* Password */
                      TextFormField(
                        obscureText: true,
                        maxLength: null,
                        maxLines: 1,
                        decoration: const InputDecoration(
                          icon: Icon(Icons.password_rounded),
                          hintText: userLoginFieldPasswordHint,
                          labelText: userLoginFieldPasswordLabel,
                        ),
                        controller: _passwordController,
                        validator: (value) {
                          if (value == null || value.isEmpty) {
                            return userLoginFieldPasswordError;
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
                                    .signIn(
                                        email: _usernameController.text,
                                        password: _passwordController.text)
                                    .then((result) async {
                                  if (result == null) {
                                    final FirebaseAuth auth =
                                        FirebaseAuth.instance;
                                    String? username = auth.currentUser?.email;

                                    SharedPreferences prefs =
                                        await SharedPreferences.getInstance();
                                    prefs.setBool(preferenceIsLogin, true);
                                    prefs.setString(
                                        preferenceLoginUsername, username!);

                                    widget.homePageState.setIsLogin(true);
                                    widget.homePageState
                                        .setLoginUsername(username);

                                    Navigator.pop(context);
                                    if (widget.dobleClosed) {
                                      Navigator.pop(context);
                                    }

                                    widget.homePageState.refresh();
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
                            child: const Text(userLoginTitle),
                          ),
                        ),
                      ),

/* Add User */

                      const SizedBox(
                        height: 30,
                      ),
                      Center(
                          child: SizedBox(
                              width: 200,
                              child: CustomButton(
                                  menuCPanelUserAddTitle,
                                  Icons.add_rounded,
                                  true,
                                  Colors.white,
                                  Colors.green, () {
                                Navigator.push<void>(
                                  context,
                                  MaterialPageRoute<void>(
                                    builder: (BuildContext context) =>
                                        UserSimpleAdd(
                                            homePageState: widget.homePageState,
                                            referencePageState:
                                                MenuReferencePageState(
                                                    widget.homePageState),
                                            isNew: true,
                                            isModify: false,
                                            userModel: UserModel("", "", true,
                                                false, false, true, "", ""),
                                            isOriginSelectAdd: true,
                                            memberships: widget
                                                .homePageState.membershipLists),
                                  ),
                                );
                              })))
                    ],
                  ),
                ),
              ),
            ])));
  }
}
