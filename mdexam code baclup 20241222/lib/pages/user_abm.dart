import 'package:mdexam/models/user_model.dart';
import 'package:mdexam/pages/user_list.dart';
import 'package:mdexam/utils/general/abm.dart';
import 'package:mdexam/utils/firebase/firebase_custom_user.dart';
import 'package:mdexam/widgets/application_bar.dart';
import 'package:flutter/material.dart';
import 'package:mdexam/variables/globalvar.dart';

// ignore: must_be_immutable
class UserABM extends StatefulWidget {
  UserListState userListState;
  final bool isNew;
  bool isModify;
  UserModel userModel;

  UserABM(
      {Key? key,
      required this.userListState,
      required this.isNew,
      required this.isModify,
      required this.userModel})
      : super(key: key);

  @override
  State<UserABM> createState() => _UserABMState();
}

class _UserABMState extends State<UserABM> {
  final _newUsernameController = TextEditingController();
  final _newPasswordController = TextEditingController();

  final _formKey = GlobalKey<FormState>();

  Future<bool> _onBackPressed() async {
    return abmOnBackPressed2(context, (){}, (){});
  }

  void init() {}

  @override
  Widget build(BuildContext context) {
    return WillPopScope(
      onWillPop: _onBackPressed,
      child: Scaffold(
        appBar: ApplicationBar(
          context: context,
          title: userABMTitle,
          withShareButton: false,
        ),
        body: ListView(children: [
          Form(
              key: _formKey,
              child: Padding(
                  padding: const EdgeInsets.all(15.0),
                  child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
/* (New) Username */
                        widget.isNew
                            ? TextFormField(
                                decoration: const InputDecoration(
                                  icon: Icon(Icons.contact_mail_rounded),
                                  hintText: userLoginFieldUsernameHint,
                                  labelText: userLoginFieldUsernameLabel,
                                ),
                                controller: _newUsernameController,
                                validator: (value) {
                                  if (value == null || value.isEmpty) {
                                    return userLoginFieldUsernameError;
                                  }
                                  return null;
                                },
                              )
                            : Container(),

/* (New) Password */
                        widget.isNew
                            ? TextFormField(
                                obscureText: true,
                                maxLength: null,
                                maxLines: 1,
                                decoration: const InputDecoration(
                                  icon: Icon(Icons.password_rounded),
                                  hintText: userLoginFieldPasswordHint,
                                  labelText: userLoginFieldPasswordLabel,
                                ),
                                controller: _newPasswordController,
                                validator: (value) {
                                  if (value == null || value.isEmpty) {
                                    return userLoginFieldPasswordError;
                                  }
                                  return null;
                                },
                              )
                            : Container(),

/* (Modify) Username */
                        widget.isModify
                            ? Card(
                                child: ListTile(
                                  leading: const Icon(Icons.people_alt_rounded),
                                  title: Text(
                                    widget.userModel.username,
                                    style: const TextStyle(fontSize: 16),
                                  ),
                                ),
                              )
                            : Container(),

/* (Modify) Enabled */
                        widget.isModify
                            ? Row(
                                children: [
                                  Checkbox(
                                      value: widget.userModel.enabled,
                                      onChanged: (bool? value) {
                                        setState(() {
                                          widget.userModel.enabled = value!;
                                        });
                                      }),
                                  const Text(userABMFieldEnabledLabel),
                                ],
                              )
                            : Container(),

/* (Modify) CanListUsers */
                        widget.isModify
                            ? Row(
                                children: [
                                  Checkbox(
                                      value: widget.userModel.canListUsers,
                                      onChanged: (bool? value) {
                                        setState(() {
                                          widget.userModel.canListUsers =
                                              value!;
                                        });
                                      }),
                                  const Text(userABMFieldCanListUsersLabel),
                                ],
                              )
                            : Container(),

/* IsAdministrator */
                        widget.isNew
                            ? Row(children: [
                                Checkbox(
                                    value: widget.userModel.isAdministrator,
                                    onChanged: (bool? value) {
                                      setState(() {
                                        widget.userModel.isAdministrator = true;

                                        widget.userModel.isCustomer = false;
                                      });
                                    }),
                                const Text(userABMFieldIsAdministratorLabel),
                              ])
                            : widget.userModel.isAdministrator
                                ? const Text(userABMFieldIsAdministratorLabel)
                                : Container(),

/* IsCustomer */
                        widget.isNew
                            ? Row(children: [
                                Checkbox(
                                    value: widget.userModel.isCustomer,
                                    onChanged: (bool? value) {
                                      setState(() {
                                        widget.userModel.isAdministrator =
                                            false;

                                        widget.userModel.isCustomer = true;
                                      });
                                    }),
                                const Text(userABMFieldIsCustomerLabel),
                              ])
                            : widget.userModel.isCustomer
                                ? const Text(userABMFieldIsCustomerLabel)
                                : Container(),

/* (Modify) Name */
                        widget.isModify
                            ? Card(
                                child: ListTile(
                                  leading: const Icon(Icons.person_rounded),
                                  title: Text(
                                    widget.userModel.name,
                                    style: const TextStyle(fontSize: 16),
                                  ),
                                ),
                              )
                            : Container(),

                        /* (Modify) LastName */
                        widget.isModify
                            ? Card(
                                child: ListTile(
                                  leading: const Icon(Icons.people_rounded),
                                  title: Text(
                                    widget.userModel.lastName,
                                    style: const TextStyle(fontSize: 16),
                                  ),
                                ),
                              )
                            : Container(),

/* Finish */

                        Row(children: [
                          Padding(
                            padding: const EdgeInsets.symmetric(vertical: 16.0),
                            child: Center(
                              child: ElevatedButton(
                                style: ElevatedButton.styleFrom(
                                    backgroundColor: Colors.green,
                                    padding: const EdgeInsets.symmetric(
                                        horizontal: 20, vertical: 9),
                                    textStyle: const TextStyle(
                                        fontSize: 16,
                                        fontWeight: FontWeight.normal)),
                                onPressed: () async {
                                  if (_formKey.currentState!.validate()) {
                                    String error = "";

                                    if (!widget.userModel.isAdministrator &&
                                        !widget.userModel.isCustomer) {
                                      error = userABMNewNotSelectTypeError;
                                    }

                                    if (error.isEmpty) {
/* User New */
                                      if (widget.isNew) {
                                        FirebaseCustomUserHelper()
                                            .add(
                                          context: context,
                                          email: _newUsernameController.text,
                                          password: _newPasswordController.text,
                                          //referenceUsername: "",
                                          userModel: widget.userModel,
                                          memberships: []
                                        )
                                            .then((result) {
                                          if (result == null) {
                                            ScaffoldMessenger.of(context)
                                                .showSnackBar(const SnackBar(
                                              content: Text(
                                                userABMNewSaved,
                                                style: TextStyle(fontSize: 16),
                                              ),
                                            ));
                                            Navigator.pop(context);

                                            widget.userListState.refreshList();
                                          } else {
                                            ScaffoldMessenger.of(context)
                                                .showSnackBar(SnackBar(
                                              content: Text(
                                                result,
                                                style: const TextStyle(
                                                    fontSize: 16),
                                              ),
                                            ));
                                          }
                                        });
                                      }

/* User Modify */
                                      if (widget.isModify) {
                                        FirebaseCustomUserHelper()
                                            .modify(
                                                context: context,
                                                userModel: widget.userModel)
                                            .then((result) {
                                          if (result == null) {
                                            ScaffoldMessenger.of(context)
                                                .showSnackBar(const SnackBar(
                                              content: Text(
                                                userABMModifySaved,
                                                style: TextStyle(fontSize: 16),
                                              ),
                                            ));
                                            Navigator.pop(context);

                                            widget.userListState.refreshList();
                                          } else {
                                            ScaffoldMessenger.of(context)
                                                .showSnackBar(SnackBar(
                                              content: Text(
                                                result,
                                                style: const TextStyle(
                                                    fontSize: 16),
                                              ),
                                            ));
                                          }
                                        });
                                      }
                                    } else {
                                      ScaffoldMessenger.of(context)
                                          .showSnackBar(SnackBar(
                                        content: Text(
                                          error,
                                          style: const TextStyle(fontSize: 16),
                                        ),
                                      ));
                                    }
                                  }
                                },
                                child: const Text(userABMSaveTitle),
                              ),
                            ),
                          ),

/* User Delete */
                          Padding(
                            padding:
                                const EdgeInsets.symmetric(horizontal: 16.0),
                            child: widget.isModify
                                ? Padding(
                                    padding: const EdgeInsets.symmetric(
                                        vertical: 16.0),
                                    child: Center(
                                        child: ElevatedButton(
                                            style: ElevatedButton.styleFrom(
                                                backgroundColor: Colors.red,
                                                padding:
                                                    const EdgeInsets.symmetric(
                                                        horizontal: 20,
                                                        vertical: 9),
                                                textStyle: const TextStyle(
                                                    fontSize: 16,
                                                    fontWeight:
                                                        FontWeight.normal)),
                                            onPressed: () async {
                                              showDialog(
                                                context: context,
                                                builder: (context) =>
                                                    AlertDialog(
                                                  title: const Text(
                                                      abmDeleteAlertTitle),
                                                  content: const Text(
                                                      abmDeleteAlertContent),
                                                  actions: <Widget>[
                                                    Row(
                                                        mainAxisAlignment:
                                                            MainAxisAlignment
                                                                .spaceBetween,
                                                        children: <Widget>[
                                                          const SizedBox(
                                                              height: 50),
                                                          GestureDetector(
                                                            onTap: () {
                                                              Navigator.of(
                                                                      context)
                                                                  .pop(true);

                                                              FirebaseCustomUserHelper()
                                                                  .delete(
                                                                      context:
                                                                          context,
                                                                      userModel:
                                                                          widget
                                                                              .userModel)
                                                                  .then(
                                                                      (result) {
                                                                if (result ==
                                                                    null) {
                                                                  ScaffoldMessenger.of(
                                                                          context)
                                                                      .showSnackBar(
                                                                          const SnackBar(
                                                                    content:
                                                                        Text(
                                                                      userABMModifyDelete,
                                                                      style: TextStyle(
                                                                          fontSize:
                                                                              16),
                                                                    ),
                                                                  ));

                                                                  widget
                                                                      .userListState
                                                                      .refreshList();

                                                                  Navigator.of(
                                                                          context)
                                                                      .pop();
                                                                } else {
                                                                  ScaffoldMessenger.of(
                                                                          context)
                                                                      .showSnackBar(
                                                                          SnackBar(
                                                                    content:
                                                                        Text(
                                                                      result,
                                                                      style: const TextStyle(
                                                                          fontSize:
                                                                              16),
                                                                    ),
                                                                  ));
                                                                }
                                                              });
                                                            },
                                                            child: const Text(
                                                                abmDeleteAlertPressedYes),
                                                          ),
                                                          const SizedBox(
                                                              height: 50),
                                                          GestureDetector(
                                                            onTap: () =>
                                                                Navigator.of(
                                                                        context)
                                                                    .pop(false),
                                                            child: const Text(
                                                                abmDeleteAlertPressedNo),
                                                          ),
                                                          const SizedBox(
                                                              height: 50),
                                                        ])
                                                  ],
                                                ),
                                              ); /*??
                                        false;*/
                                            },
                                            child: const Text(
                                              abmDeleteTitle,
                                              style: TextStyle(
                                                  fontSize: 16,
                                                  color: Colors.white),
                                            ))))
                                : Container(),
                          ),
                         
                        ])
                      ])))
        ]),
      ),
    );
  }
}
