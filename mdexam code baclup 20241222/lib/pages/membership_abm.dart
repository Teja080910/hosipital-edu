// ignore_for_file: unnecessary_null_comparison

import 'package:mdexam/models/membership_model.dart';
import 'package:mdexam/pages/membership_list.dart';
import 'package:mdexam/utils/firebase/firebase_custom_membership.dart';
import 'package:mdexam/widgets/application_bar.dart';
import 'package:mdexam/utils/general/abm.dart';
import 'package:mdexam/utils/general/reference_Page_State.dart';
import 'package:flutter/material.dart';
import 'package:mdexam/variables/globalvar.dart';

// ignore: must_be_immutable
class MembershipABM extends StatefulWidget {
  MembershipListState membershipListState;
  final bool isNew;
  bool isModify;
  MembershipModel membershipModel;

  MembershipABM({
    Key? key,
    required this.membershipListState,
    required this.isNew,
    required this.isModify,
    required this.membershipModel,
  }) : super(key: key);

  @override
  State<MembershipABM> createState() => _MembershipABMState();
}

class _MembershipABMState extends State<MembershipABM> {
  final _titleController = TextEditingController();
  final _detailController = TextEditingController();
  final _priceController = TextEditingController();
  final _maxUsesController = TextEditingController();
  final _maxDaysController = TextEditingController();
  final _maxQuestionsController = TextEditingController();
  final _maxFlashcardsController = TextEditingController();
  final _maxVideosController = TextEditingController();
  final _maxUsesFlashcardsController = TextEditingController();
  final _orderController = TextEditingController();

  final _formKey = GlobalKey<FormState>();

  Future<bool> _onBackPressed() async {
    return abmOnBackPressed2(context, () {}, () {});
  }

  @override
  void initState() {
    if (widget.isModify) {
      _titleController.text = widget.membershipModel.title;
      _detailController.text = widget.membershipModel.detail;
      _priceController.text = widget.membershipModel.price.toString();

      _maxUsesController.text = widget.membershipModel.maxUses.toString();
      _maxDaysController.text = widget.membershipModel.maxDays.toString();
      _maxQuestionsController.text =
          widget.membershipModel.maxQuestions.toString();
      _maxFlashcardsController.text =
          widget.membershipModel.maxFlashcards.toString();
      _maxVideosController.text = widget.membershipModel.maxVideos.toString();
      _maxUsesFlashcardsController.text =
          widget.membershipModel.maxUsesFlashcards.toString();

      _orderController.text = widget.membershipModel.order.toString();
    }

    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    return WillPopScope(
        onWillPop: _onBackPressed,
        child: Scaffold(
            appBar: ApplicationBar(
              context: context,
              title: membershipABMTitle,
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
/* Title */
                            TextFormField(
                              decoration: const InputDecoration(
                                icon: Icon(Icons.title_rounded),
                                hintText: membershipABMFieldTitleHint,
                                labelText: membershipABMFieldTitleLabel,
                              ),
                              controller: _titleController,
                              validator: (value) {
                                if (value == null || value.isEmpty) {
                                  return membershipABMFieldTitleError;
                                }
                                return null;
                              },
                              onChanged: (value) {
                                widget.membershipModel.title = value;
                              },
                            ),

/* Detail */
                            TextFormField(
                              decoration: const InputDecoration(
                                icon: Icon(Icons.title_rounded),
                                hintText: membershipABMFieldDetailHint,
                                labelText: membershipABMFieldDetailLabel,
                              ),
                              keyboardType: TextInputType.multiline,
                              maxLines: null,
                              controller: _detailController,
                              validator: (value) {
                                if (value == null || value.isEmpty) {
                                  return membershipABMFieldDetailError;
                                }
                                return null;
                              },
                              onChanged: (value) {
                                widget.membershipModel.detail = value;
                              },
                            ),

/* Price */
                            TextFormField(
                              decoration: const InputDecoration(
                                icon: Icon(Icons.money_rounded),
                                hintText: membershipABMFieldPriceHint,
                                labelText: membershipABMFieldPriceLabel,
                              ),
                              controller: _priceController,
                              validator: (value) {
                                if (value == null || value.isEmpty) {
                                  return membershipABMFieldPriceError;
                                }
                                return null;
                              },
                              onChanged: (value) {
                                widget.membershipModel.price =
                                    double.parse(value);
                              },
                            ),

/* MaxUses */
                            TextFormField(
                              decoration: const InputDecoration(
                                icon: Icon(Icons.numbers_rounded),
                                hintText: membershipABMFieldMaxUsesHint,
                                labelText: membershipABMFieldMaxUsesLabel,
                              ),
                              controller: _maxUsesController,
                              validator: (value) {
                                if (value == null || value.isEmpty) {
                                  return membershipABMFieldMaxUsesError;
                                }
                                return null;
                              },
                              onChanged: (value) {
                                widget.membershipModel.maxUses =
                                    int.parse(value);
                              },
                            ),

/* MaxDays */
                            TextFormField(
                              decoration: const InputDecoration(
                                icon: Icon(Icons.numbers_rounded),
                                hintText: membershipABMFieldMaxDaysHint,
                                labelText: membershipABMFieldMaxDaysLabel,
                              ),
                              controller: _maxDaysController,
                              validator: (value) {
                                if (value == null || value.isEmpty) {
                                  return membershipABMFieldMaxDaysError;
                                }
                                return null;
                              },
                              onChanged: (value) {
                                widget.membershipModel.maxDays =
                                    int.parse(value);
                              },
                            ),

/* MaxQuestions */
                            TextFormField(
                              decoration: const InputDecoration(
                                icon: Icon(Icons.numbers_rounded),
                                hintText: membershipABMFieldMaxQuestionsHint,
                                labelText: membershipABMFieldMaxQuestionsLabel,
                              ),
                              controller: _maxQuestionsController,
                              validator: (value) {
                                if (value == null || value.isEmpty) {
                                  return membershipABMFieldMaxQuestionsError;
                                }
                                return null;
                              },
                              onChanged: (value) {
                                widget.membershipModel.maxQuestions =
                                    int.parse(value);
                              },
                            ),

/* MaxFlashcards */
                            TextFormField(
                              decoration: const InputDecoration(
                                icon: Icon(Icons.numbers_rounded),
                                hintText: membershipABMFieldMaxFlashcardsHint,
                                labelText: membershipABMFieldMaxFlashcardsLabel,
                              ),
                              controller: _maxFlashcardsController,
                              validator: (value) {
                                if (value == null || value.isEmpty) {
                                  return membershipABMFieldMaxFlashcardsError;
                                }
                                return null;
                              },
                              onChanged: (value) {
                                widget.membershipModel.maxFlashcards =
                                    int.parse(value);
                              },
                            ),

/* MaxUsesFlashcards */
                            TextFormField(
                              decoration: const InputDecoration(
                                icon: Icon(Icons.numbers_rounded),
                                hintText:
                                    membershipABMFieldMaxUsesFlashcardsHint,
                                labelText:
                                    membershipABMFieldMaxUsesFlashcardsLabel,
                              ),
                              controller: _maxUsesFlashcardsController,
                              validator: (value) {
                                if (value == null || value.isEmpty) {
                                  return membershipABMFieldMaxUsesFlashcardsError;
                                }
                                return null;
                              },
                              onChanged: (value) {
                                widget.membershipModel.maxUsesFlashcards =
                                    int.parse(value);
                              },
                            ),

/* MaxVideos */
                            TextFormField(
                              decoration: const InputDecoration(
                                icon: Icon(Icons.numbers_rounded),
                                hintText: membershipABMFieldMaxVideosHint,
                                labelText: membershipABMFieldMaxVideosLabel,
                              ),
                              controller: _maxFlashcardsController,
                              validator: (value) {
                                if (value == null || value.isEmpty) {
                                  return membershipABMFieldMaxVideosError;
                                }
                                return null;
                              },
                              onChanged: (value) {
                                widget.membershipModel.maxVideos =
                                    int.parse(value);
                              },
                            ),

/* IsVisible */
                            Row(
                              children: [
                                Checkbox(
                                    value: widget.membershipModel.isVisible,
                                    onChanged: (bool? value) {
                                      setState(() {
                                        widget.membershipModel.isVisible =
                                            value!;
                                      });
                                    }),
                                const Text(membershipABMFieldIsVisibleLabel),
                              ],
                            ),
                            Row(
                              children: [
                                Checkbox(
                                    value: widget.membershipModel.isDefault,
                                    onChanged: (bool? value) {
                                      setState(() {
                                        widget.membershipModel.isDefault =
                                            value!;
                                      });
                                    }),
                                const Text(membershipABMFieldIsDefaultLabel),
                              ],
                            ),

/* Order */
                            TextFormField(
                              decoration: const InputDecoration(
                                icon: Icon(Icons.numbers_rounded),
                                hintText: membershipABMFieldOrderHint,
                                labelText: membershipABMFieldOrderLabel,
                              ),
                              controller: _orderController,
                              validator: (value) {
                                if (value == null || value.isEmpty) {
                                  return membershipABMFieldOrderError;
                                }
                                return null;
                              },
                              onChanged: (value) {
                                widget.membershipModel.order = int.parse(value);
                              },
                            ),

/* Finish */
                            Row(children: [
                              Padding(
                                padding: const EdgeInsets.only(
                                    left: 16, top: 40, bottom: 20),
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
/* Membership New */
                                        if (widget.isNew) {
                                          try {
                                            String error = "";

                                            if (_titleController.text.isEmpty) {
                                              error =
                                                  membershipABMFieldTitleError;
                                            }

                                            if (_detailController
                                                .text.isEmpty) {
                                              error =
                                                  membershipABMFieldDetailError;
                                            }

                                            try {
                                              double.parse(
                                                  _priceController.text);
                                            } catch (errorValue) {
                                              error =
                                                  membershipABMFieldPriceError;
                                            }

                                            try {
                                              double tValuePrice = double.parse(
                                                  _priceController.text);

                                              if (tValuePrice < 0) {
                                                error =
                                                    membershipABMFieldPriceError;
                                              }
                                            } catch (errorValue) {
                                              error =
                                                  membershipABMFieldPriceError;
                                            }

                                            try {
                                              double.parse(
                                                  _maxUsesController.text);
                                            } catch (errorValue) {
                                              error =
                                                  membershipABMFieldMaxUsesError;
                                            }
                                            try {
                                              int tValueMaxUses = int.parse(
                                                  _maxUsesController.text);

                                              if (tValueMaxUses < 1) {
                                                error =
                                                    membershipABMFieldMaxUsesError;
                                              }
                                            } catch (errorValue) {
                                              error =
                                                  membershipABMFieldMaxUsesError;
                                            }

                                            try {
                                              double.parse(
                                                  _maxDaysController.text);
                                            } catch (errorValue) {
                                              error =
                                                  membershipABMFieldMaxDaysError;
                                            }
                                            try {
                                              int tValueMaxDays = int.parse(
                                                  _maxDaysController.text);

                                              if (tValueMaxDays < 1) {
                                                error =
                                                    membershipABMFieldMaxDaysError;
                                              }
                                            } catch (errorValue) {
                                              error =
                                                  membershipABMFieldMaxDaysError;
                                            }

                                            try {
                                              double.parse(
                                                  _maxQuestionsController.text);
                                            } catch (errorValue) {
                                              error =
                                                  membershipABMFieldMaxQuestionsError;
                                            }
                                            try {
                                              int tValueMaxQuestions =
                                                  int.parse(
                                                      _maxQuestionsController
                                                          .text);

                                              if (tValueMaxQuestions < 1) {
                                                error =
                                                    membershipABMFieldMaxQuestionsError;
                                              }
                                            } catch (errorValue) {
                                              error =
                                                  membershipABMFieldMaxQuestionsError;
                                            }

                                            try {
                                              double.parse(
                                                  _maxFlashcardsController
                                                      .text);
                                            } catch (errorValue) {
                                              error =
                                                  membershipABMFieldMaxFlashcardsError;
                                            }
                                            try {
                                              int tValueMaxFlashcards =
                                                  int.parse(
                                                      _maxFlashcardsController
                                                          .text);

                                              if (tValueMaxFlashcards < 1) {
                                                error =
                                                    membershipABMFieldMaxFlashcardsError;
                                              }
                                            } catch (errorValue) {
                                              error =
                                                  membershipABMFieldMaxFlashcardsError;
                                            }

                                            try {
                                              int.parse(_orderController.text);
                                            } catch (errorValue) {
                                              error =
                                                  membershipABMFieldOrderError;
                                            }

                                            if (error.isEmpty) {
                                              FirebaseCustomMembershipHelper()
                                                  .add(
                                                context: context,
                                                membershipModel:
                                                    widget.membershipModel,
                                              )
                                                  .then((result) {
                                                if (result == null) {
                                                  ScaffoldMessenger.of(context)
                                                      .showSnackBar(
                                                          const SnackBar(
                                                    content: Text(
                                                      membershipABMNewSaved,
                                                      style: TextStyle(
                                                          fontSize: 16),
                                                    ),
                                                  ));
                                                  Navigator.pop(context);

                                                  if (widget
                                                          .membershipListState !=
                                                      null) {
                                                    widget.membershipListState
                                                        .refreshList();
                                                  }
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
                                            } else {
                                              ScaffoldMessenger.of(context)
                                                  .showSnackBar(SnackBar(
                                                content: Text(
                                                  error,
                                                  style: const TextStyle(
                                                      fontSize: 16),
                                                ),
                                              ));
                                            }
                                          } catch (errorValue) {
                                            ScaffoldMessenger.of(context)
                                                .showSnackBar(SnackBar(
                                              content: Text(
                                                errorValue.toString(),
                                                style: const TextStyle(
                                                    fontSize: 16),
                                              ),
                                            ));
                                          }
                                        }

/* Membership Modify */
                                        if (widget.isModify) {
                                          try {
                                            String error = "";

                                            if (_titleController.text.isEmpty) {
                                              error =
                                                  membershipABMFieldTitleError;
                                            }

                                            if (_detailController
                                                .text.isEmpty) {
                                              error =
                                                  membershipABMFieldDetailError;
                                            }

                                            try {
                                              double.parse(
                                                  _priceController.text);
                                            } catch (errorValue) {
                                              error =
                                                  membershipABMFieldPriceError;
                                            }

                                            try {
                                              double tValuePrice = double.parse(
                                                  _priceController.text);

                                              if (tValuePrice < 0) {
                                                error =
                                                    membershipABMFieldPriceError;
                                              }
                                            } catch (errorValue) {
                                              error =
                                                  membershipABMFieldPriceError;
                                            }

                                            try {
                                              double.parse(
                                                  _maxUsesController.text);
                                            } catch (errorValue) {
                                              error =
                                                  membershipABMFieldMaxUsesError;
                                            }
                                            try {
                                              int tValueMaxUses = int.parse(
                                                  _maxUsesController.text);

                                              if (tValueMaxUses < 1) {
                                                error =
                                                    membershipABMFieldMaxUsesError;
                                              }
                                            } catch (errorValue) {
                                              error =
                                                  membershipABMFieldMaxUsesError;
                                            }

                                            try {
                                              double.parse(
                                                  _maxDaysController.text);
                                            } catch (errorValue) {
                                              error =
                                                  membershipABMFieldMaxDaysError;
                                            }
                                            try {
                                              int tValueMaxDays = int.parse(
                                                  _maxDaysController.text);

                                              if (tValueMaxDays < 1) {
                                                error =
                                                    membershipABMFieldMaxDaysError;
                                              }
                                            } catch (errorValue) {
                                              error =
                                                  membershipABMFieldMaxDaysError;
                                            }

                                            try {
                                              double.parse(
                                                  _maxQuestionsController.text);
                                            } catch (errorValue) {
                                              error =
                                                  membershipABMFieldMaxQuestionsError;
                                            }
                                            try {
                                              int tValueMaxQuestions =
                                                  int.parse(
                                                      _maxQuestionsController
                                                          .text);

                                              if (tValueMaxQuestions < 1) {
                                                error =
                                                    membershipABMFieldMaxQuestionsError;
                                              }
                                            } catch (errorValue) {
                                              error =
                                                  membershipABMFieldMaxQuestionsError;
                                            }

                                            try {
                                              double.parse(
                                                  _maxFlashcardsController
                                                      .text);
                                            } catch (errorValue) {
                                              error =
                                                  membershipABMFieldMaxFlashcardsError;
                                            }
                                            try {
                                              int tValueMaxFlashcards =
                                                  int.parse(
                                                      _maxFlashcardsController
                                                          .text);

                                              if (tValueMaxFlashcards < 1) {
                                                error =
                                                    membershipABMFieldMaxFlashcardsError;
                                              }
                                            } catch (errorValue) {
                                              error =
                                                  membershipABMFieldMaxFlashcardsError;
                                            }

                                            try {
                                              int.parse(_orderController.text);
                                            } catch (errorValue) {
                                              error =
                                                  membershipABMFieldOrderError;
                                            }

                                            if (error.isEmpty) {
                                              FirebaseCustomMembershipHelper()
                                                  .modify(
                                                context: context,
                                                membershipModel:
                                                    widget.membershipModel,
                                              )
                                                  .then((result) {
                                                if (result == null) {
                                                  ScaffoldMessenger.of(context)
                                                      .showSnackBar(
                                                          const SnackBar(
                                                    content: Text(
                                                      membershipABMModifySaved,
                                                      style: TextStyle(
                                                          fontSize: 16),
                                                    ),
                                                  ));
                                                  Navigator.pop(context);

                                                  if (widget
                                                          .membershipListState !=
                                                      null) {
                                                    widget.membershipListState
                                                        .refreshList();
                                                  }
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
                                            } else {
                                              ScaffoldMessenger.of(context)
                                                  .showSnackBar(SnackBar(
                                                content: Text(
                                                  error,
                                                  style: const TextStyle(
                                                      fontSize: 16),
                                                ),
                                              ));
                                            }
                                          } catch (errorValue) {
                                            ScaffoldMessenger.of(context)
                                                .showSnackBar(SnackBar(
                                              content: Text(
                                                errorValue.toString(),
                                                style: const TextStyle(
                                                    fontSize: 16),
                                              ),
                                            ));
                                          }
                                        }
                                      }
                                    },
                                    child: const Text(membershipABMSaveTitle),
                                  ),
                                ),
                              ),

/* Membership Delete */
                              Padding(
                                padding: const EdgeInsets.only(
                                    left: 16, top: 40, bottom: 20),
                                child: widget.isModify
                                    ? Padding(
                                        padding: const EdgeInsets.symmetric(
                                            vertical: 16.0),
                                        child: Center(
                                            child: ElevatedButton(
                                                style: ElevatedButton.styleFrom(
                                                    backgroundColor: Colors.red,
                                                    padding: const EdgeInsets
                                                        .symmetric(
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
                                                                      .pop(
                                                                          true);

                                                                  FirebaseCustomMembershipHelper()
                                                                      .delete(
                                                                          context:
                                                                              context,
                                                                          membershipModel: widget
                                                                              .membershipModel)
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
                                                                          membershipABMModifyDelete,
                                                                          style:
                                                                              TextStyle(fontSize: 16),
                                                                        ),
                                                                      ));
/*
                                                                      if (widget
                                                                              .membershipListState !=null) {
                                                                        widget
                                                                            .membershipListState?.refreshList();
                                                                      }
*/
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
                                                                          style:
                                                                              const TextStyle(fontSize: 16),
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
                                                                        .pop(
                                                                            false),
                                                                child: const Text(
                                                                    abmDeleteAlertPressedNo),
                                                              ),
                                                              const SizedBox(
                                                                  height: 50),
                                                            ])
                                                      ],
                                                    ),
                                                  );
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
            ])));
  }
}

class MembershipABMReferenceState extends ReferencePageState {
  _MembershipABMState membershipABMState;

  MembershipABMReferenceState(this.membershipABMState);

  @override
  void setStates() {
    // ignore: invalid_use_of_protected_member
    membershipABMState.setState(() {});
  }
}
