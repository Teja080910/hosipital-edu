// ignore_for_file: deprecated_member_use, duplicate_ignore, unnecessary_null_comparison

import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:mdexam/models/flashcard_answer_model.dart';
import 'package:mdexam/models/flashcard_category_model.dart';
import 'package:mdexam/models/flashcard_question_model.dart';
import 'package:mdexam/pages/flashcard_question_list.dart';
import 'package:mdexam/utils/firebase/firebase_custom_flashcard_question.dart';
import 'package:mdexam/utils/list_transforms/flashcard_category_list_transforms.dart'
    // ignore: library_prefixes
    as flashcardCategoryTransforms;

import 'package:mdexam/widgets/application_bar.dart';
import 'package:mdexam/utils/general/abm.dart';
import 'package:mdexam/utils/general/reference_Page_State.dart';
import 'package:flutter/material.dart';
import 'package:mdexam/variables/globalvar.dart';
import 'package:mdexam/widgets/drop_down_buttom_edit_format.dart';

// ignore: must_be_immutable
class FlashcardQuestionABM extends StatefulWidget {
  FlashcardQuestionListState questionListState;
  final bool isNew;
  bool isModify;
  FlashcardQuestionModel questionModel;

  FlashcardQuestionABM({
    Key? key,
    required this.questionListState,
    required this.isNew,
    required this.isModify,
    required this.questionModel,
  }) : super(key: key);

  @override
  State<FlashcardQuestionABM> createState() => _FlashcardQuestionABMState();
}

class _FlashcardQuestionABMState extends State<FlashcardQuestionABM> {
  final _categoryController = TextEditingController();
  final _titleController = TextEditingController();

  final _answer1TitleController = TextEditingController();

  final _formKey = GlobalKey<FormState>();

  List<FlashcardCategoryModel> categoryLists = [];

  Future<bool> _onBackPressed() async {
    return abmOnBackPressed2(context, () {}, () {});
  }

  @override
  void initState() {
    if (widget.isModify) {
      _titleController.text = widget.questionModel.title;


// ignore: prefer_is_empty
      if (widget.questionModel.answers.length > 0) {
        _answer1TitleController.text = widget.questionModel.answers[0].title;
      }

      super.initState();
    }

    loadCategorys();
  }

  void loadCategorys() {
    try {
      final firestoreInstance = FirebaseFirestore.instance;

      // Customer Category
      categoryLists.clear();

      CollectionReference categorys =
          firestoreInstance.collection(firebaseCustomFlashcardCategoryKey);

      categorys
          .limit(100)
          .orderBy("title", descending: false)
          .get()
          .then((querySnapshot) {
        for (var result in querySnapshot.docs) {
          setState(() {
            flashcardCategoryTransforms.uniquedAdd(categoryLists,
                FlashcardCategoryModel.fromJSON(false, result.id, result.data()));
          });
        }
      });

      setState(() {});
    } on FirebaseAuthException catch (e) {
      e.stackTrace;
    }
  }

  @override
  Widget build(BuildContext context) {
    return WillPopScope(
        onWillPop: _onBackPressed,
        child: Scaffold(
            appBar: ApplicationBar(
              context: context,
              title: flashcardQuestionABMTitle,
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
/* Flashcard Category */
                            widget.isNew
                                ? dropDownButtomEditFormat(
                                    FlashcardQuestionABMReferenceState(this),
                                    context,
                                    flashcardQuestionABMFieldCategoryTitle,
                                    Icons.flash_on_outlined,
                                    flashcardCategoryTransforms.flashcardCategoryListToStringList(
                                        categoryLists),
                                    _categoryController)
                                : Text(widget.questionModel.category.title,
                                    maxLines: 1,
                                    style: const TextStyle(
                                      color: Colors.black,
                                      fontSize: 15,
                                      fontWeight: FontWeight.bold,
                                    )),

/* Title */
                            TextFormField(
                              decoration: const InputDecoration(
                                icon: Icon(Icons.title_rounded),
                                hintText: flashcardQuestionABMFieldTitleHint,
                                labelText: flashcardQuestionABMFieldTitleLabel,
                              ),
                              keyboardType: TextInputType.multiline,
                              maxLines: null,
                              controller: _titleController,
                              validator: (value) {
                                if (value == null || value.isEmpty) {
                                  return flashcardQuestionABMFieldTitleError;
                                }
                                return null;
                              },
                              onChanged: (value) {
                                widget.questionModel.title = value;
                              },
                            ),


                            const SizedBox(
                              height: 20,
                            ),

/* IsEnabled */
                            Row(
                              children: [
                                Checkbox(
                                    value: widget.questionModel.isEnabled,
                                    onChanged: (bool? value) {
                                      setState(() {
                                        widget.questionModel.isEnabled = value!;
                                      });
                                    }),
                                const Text(flashcardQuestionABMFieldIsEnabledLabel),
                              ],
                            ),

// Answer 1
                            const Padding(
                                padding: EdgeInsets.all(20),
                                child: Text(flashcardQuestionABMFieldAnswer1Caption,
                                    style: TextStyle(
                                        color: Colors.black, fontSize: 20))),

                            Column(
                              children: [

/* Flashcard Answer 1 Title */
                                TextFormField(
                                  decoration: const InputDecoration(
                                    icon: Icon(Icons.reply_rounded),
                                    hintText: flashcardQuestionABMFieldAnswerXTitleHint,
                                    labelText:
                                        flashcardQuestionABMFieldAnswerXTitleLabel,
                                  ),
                                  keyboardType: TextInputType.multiline,
                                  maxLines: null,
                                  controller: _answer1TitleController,
                                  onChanged: (value) {
                                    widget.questionModel.answers[0].title =
                                        value;
                                  },
                                ),
                              ],
                            ),


                            const SizedBox(
                              height: 20,
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
/* Flashcard Question New */
                                        if (widget.isNew) {
                                          try {
                                            String error = "";

                                            if (_categoryController
                                                .text.isEmpty) {
                                              error =
                                                  flashcardQuestionABMFieldCategoryError;
                                            }

                                            if (_titleController.text.isEmpty) {
                                              error =
                                                  flashcardQuestionABMFieldTitleError;
                                            }

                                            int countAnswersIsCorrect = 0;
                                            for (FlashcardAnswerModel oneAnswer in widget
                                                .questionModel.answers) {
                                              if (oneAnswer.isCorrect) {
                                                countAnswersIsCorrect++;
                                              }
                                            }

                                            if (countAnswersIsCorrect == 0) {
                                              error =
                                                  flashcardQuestionABMFieldAnswer1Error;
                                            }

//                                            if (countAnswersIsCorrect > 1) {
//                                              error =
//                                                  questionABMFieldAnswer2Error;
//                                            }

//                                            int i = 0;
                                            for (FlashcardAnswerModel oneAnswer in widget
                                                .questionModel.answers) {
//                                              i++;
                                              if (oneAnswer.isCorrect &&
                                                  oneAnswer.title.isEmpty) {
                                                error =
                                                    flashcardQuestionABMFieldAnswerWithoutTitleError ;
                                              }
                                            }

                                            if (error.isEmpty) {
                                              widget.questionModel.category =
                                                  flashcardCategoryTransforms
                                                      .flashcardCategoryStringToFlashcardCategoryModel(
                                                          categoryLists,
                                                          _categoryController
                                                              .text);

                                              FirebaseCustomFlashcardQuestionHelper()
                                                  .add(
                                                      context: context,
                                                      questionModel:
                                                          widget.questionModel,
                                                      onFinish: () {
                                                        ScaffoldMessenger.of(
                                                                context)
                                                            .showSnackBar(
                                                                const SnackBar(
                                                          content: Text(
                                                            flashcardQuestionABMNewSaved,
                                                            style: TextStyle(
                                                                fontSize: 16),
                                                          ),
                                                        ));
                                                        Navigator.pop(context);

                                                        if (widget
                                                                .questionListState !=
                                                            null) {
                                                          widget
                                                              .questionListState
                                                              .refreshList();
                                                        }
                                                      },
                                                      onError: (String error) {
                                                        ScaffoldMessenger.of(
                                                                context)
                                                            .showSnackBar(
                                                                SnackBar(
                                                          content: Text(
                                                            error,
                                                            style:
                                                                const TextStyle(
                                                                    fontSize:
                                                                        16),
                                                          ),
                                                        ));
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

/* Flashcard Question Modify */
                                        if (widget.isModify) {
                                          try {
                                            String error = "";

                                            if (_titleController.text.isEmpty) {
                                              error =
                                                  flashcardQuestionABMFieldTitleError;
                                            }


                                            int countAnswersIsCorrect = 0;
                                            for (FlashcardAnswerModel oneAnswer in widget
                                                .questionModel.answers) {
                                              if (oneAnswer.isCorrect) {
                                                countAnswersIsCorrect++;
                                              }
                                            }

                                            if (countAnswersIsCorrect == 0) {
                                              error =
                                                  flashcardQuestionABMFieldAnswer1Error;
                                            }

//                                            int i = 0;
                                            for (FlashcardAnswerModel oneAnswer in widget
                                                .questionModel.answers) {
//                                              i++;
                                              if (oneAnswer.isCorrect &&
                                                  oneAnswer.title.isEmpty) {
                                                error =
                                                    flashcardQuestionABMFieldAnswerWithoutTitleError ;
                                              }
                                            }

                                            if (error.isEmpty) {
                                              FirebaseCustomFlashcardQuestionHelper()
                                                  .modify(
                                                      context: context,
                                                      questionModel:
                                                          widget.questionModel,
                                                      onFinish: () {
                                                        ScaffoldMessenger.of(
                                                                context)
                                                            .showSnackBar(
                                                                const SnackBar(
                                                          content: Text(
                                                            flashcardQuestionABMModifySaved,
                                                            style: TextStyle(
                                                                fontSize: 16),
                                                          ),
                                                        ));
                                                        Navigator.pop(context);

                                                        if (widget
                                                                .questionListState !=
                                                            null) {
                                                          widget
                                                              .questionListState
                                                              .refreshList();
                                                        }
                                                      },
                                                      onError: (String error) {
                                                        ScaffoldMessenger.of(
                                                                context)
                                                            .showSnackBar(
                                                                SnackBar(
                                                          content: Text(
                                                            error,
                                                            style:
                                                                const TextStyle(
                                                                    fontSize:
                                                                        16),
                                                          ),
                                                        ));
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
                                    child: const Text(flashcardQuestionABMSaveTitle),
                                  ),
                                ),
                              ),

/* Flashcard Question Delete */

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

                                                                  FirebaseCustomFlashcardQuestionHelper()
                                                                      .setDelete(
                                                                          context:
                                                                              context,
                                                                          questionModel: widget
                                                                              .questionModel)
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
                                                                          flashcardQuestionABMModifyDelete,
                                                                          style:
                                                                              TextStyle(fontSize: 16),
                                                                        ),
                                                                      ));
/*
                                                                      if (widget
                                                                              .questionListState !=null) {
                                                                        widget
                                                                            .questionListState?.refreshList();
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

class FlashcardQuestionABMReferenceState extends ReferencePageState {
  _FlashcardQuestionABMState flashcardQuestionABMState;

  FlashcardQuestionABMReferenceState(this.flashcardQuestionABMState);

  @override
  void setStates() {
    // ignore: invalid_use_of_protected_member
    flashcardQuestionABMState.setState(() {});
  }
}
