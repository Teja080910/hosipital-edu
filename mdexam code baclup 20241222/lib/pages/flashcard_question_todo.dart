import 'dart:async';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:mdexam/models/flashcard_category_model.dart';
import 'package:mdexam/models/user_flashcard_exam_model.dart';
import 'package:mdexam/pages/home.dart';
import 'package:mdexam/pages/flashcard_question_run.dart';
import 'package:mdexam/utils/firebase/firebase_custom_user_flashcard_exam.dart';
import 'package:mdexam/utils/general/abm.dart';
import 'package:mdexam/utils/general/reference_Page_State.dart';
import 'package:mdexam/widgets/application_bar.dart';
import 'package:flutter/material.dart';
import 'package:mdexam/variables/globalvar.dart';
import 'package:mdexam/utils/list_transforms/flashcard_category_list_transforms.dart'
    // ignore: library_prefixes
    as flashcardCategoryTransforms;
import 'package:mdexam/widgets/multi_select_drop_down_buttom_edit_format.dart';

// ignore: must_be_immutable
class FlashcardQuestionTodo extends StatefulWidget {
  HomePageState homePageState;
  bool isOpen;

  FlashcardQuestionTodo(
      {Key? key, required this.homePageState, required this.isOpen})
      : super(key: key);

  @override
  State<FlashcardQuestionTodo> createState() => _FlashcardQuestionTodoState();
}

class _FlashcardQuestionTodoState extends State<FlashcardQuestionTodo> {
  final _customTitleController = TextEditingController();
  final _categoryController = TextEditingController();
  final _maxQuestionsController = TextEditingController();
  final _maxTimeController = TextEditingController();

  final _formKey = GlobalKey<FormState>();

  List<FlashcardCategoryModel> selectCategorys = [];
//      CategoryModel(false, "", "", 0, DateTime.now());
  List<FlashcardCategoryModel> categoryLists = [];

  Future<bool> _onBackPressed() async {
    return abmOnBackPressed2(context, () {}, () {});
  }

  @override
  void initState() {
    _maxQuestionsController.text = "20";
    _maxTimeController.text = "25";

    loadCategorys();

    super.initState();
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
            flashcardCategoryTransforms.uniquedAdd(
                categoryLists,
                FlashcardCategoryModel.fromJSON(
                    false, result.id, result.data()));
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
              title: flashcardQuestionNewTitle,
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
/* Detail */
                      const Text(flashcardQuestionTodoDetail,
                          maxLines: 1,
                          style: TextStyle(
                            color: Colors.black,
                            fontSize: 15,
                            fontWeight: FontWeight.normal,
                          )),
                      TextFormField(
                        decoration: const InputDecoration(
                          icon: Icon(Icons.title_outlined),
                          hintText: flashcardQuestionTodoFieldCustomTitleHint,
                          labelText: flashcardQuestionTodoFieldCustomTitleLabel,
                        ),
                        controller: _customTitleController,
                        validator: (value) {
                          return null;
                        },
                      ),

/* Flashcard Categorys */
                      multiSelectDropDownButtomEditFormat(
                          FlashcardQuestionTodoReferenceState(this),
                          context,
                          flashcardQuestionABMFieldCategoryTitle,
                          Icons.flash_on_outlined,
                          flashcardCategoryTransforms
                              .flashcardCategoryListToStringList(categoryLists),
                          _categoryController),

/* Max Questions */
                      TextFormField(
                        decoration: const InputDecoration(
                          icon: Icon(Icons.question_mark_rounded),
                          hintText: flashcardQuestionTodoFieldMaxQuestionsHint,
                          labelText:
                              flashcardQuestionTodoFieldMaxQuestionsLabel,
                        ),
                        controller: _maxQuestionsController,
                        validator: (value) {
                          if (value == null || value.isEmpty) {
                            return flashcardQuestionTodoFieldMaxQuestionsError;
                          }
                          return null;
                        },
                      ),

/* Max Time */
                      !widget.isOpen
                          ? TextFormField(
                              decoration: const InputDecoration(
                                icon: Icon(Icons.timer_outlined),
                                hintText: flashcardQuestionTodoFieldMaxTimeHint,
                                labelText:
                                    flashcardQuestionTodoFieldMaxTimeLabel,
                              ),
                              controller: _maxTimeController,
                              validator: (value) {
                                if (value == null || value.isEmpty) {
                                  return flashcardQuestionTodoFieldMaxTimeError;
                                }
                                return null;
                              },
                            )
                          : Container(),

/* Finish */
                      Padding(
                        padding: const EdgeInsets.symmetric(vertical: 16.0),
                        child: Center(
                          child: ElevatedButton(
                            onPressed: () async {
                              if (_formKey.currentState!.validate()) {
                                try {
                                  if (_categoryController.text.isNotEmpty) {
                                    selectCategorys = flashcardCategoryTransforms
                                        .flashcardCategorysStringToListFlashcardCategoryModel(
                                            categoryLists,
                                            _categoryController.text);
                                  }

                                  String error = "";

                                  if (_maxQuestionsController.text.isEmpty) {
                                    error =
                                        flashcardQuestionTodoFieldMaxQuestionsError;
                                  }

                                  try {
                                    int tMaxQuestions =
                                        int.parse(_maxQuestionsController.text);

                                    if (tMaxQuestions < 0) {
                                      error =
                                          flashcardQuestionTodoFieldMaxQuestionsError;
                                    }
                                  } catch (errorValue) {
                                    error =
                                        flashcardQuestionTodoFieldMaxQuestionsError;
                                  }

                                  if (_maxTimeController.text.isEmpty) {
                                    error =
                                        flashcardQuestionTodoFieldMaxTimeError;
                                  }

                                  try {
                                    int tMaxTime =
                                        int.parse(_maxTimeController.text);

                                    if (tMaxTime < 0) {
                                      error =
                                          flashcardQuestionTodoFieldMaxTimeError;
                                    }
                                  } catch (errorValue) {
                                    error =
                                        flashcardQuestionTodoFieldMaxTimeError;
                                  }

                                  if (_categoryController.text.isEmpty) {
                                    error =
                                        flashcardQuestionTodoFieldCategoryError;
                                  }

                                  if (error.isEmpty) {
                                    int tMaxQuestions = 0;
                                    for (FlashcardCategoryModel oneCategory
                                        in selectCategorys) {
                                      tMaxQuestions += oneCategory.maxQuestions;
                                    }

                                    if (int.parse(
                                            _maxQuestionsController.text) >
                                        tMaxQuestions) {
                                      error =
                                          flashcardQuestionTodoCategoryQuestionMaxError;
                                    }
                                  }

                                  if (error.isEmpty) {
                                    if (int.parse(
                                            _maxQuestionsController.text) >
                                        widget
                                            .homePageState
                                            .customerMembershipCurrent
                                            .maxFlashcards) {
                                      error =
                                          flashcardQuestionTodoCategoryMembershipError;
                                    }
                                  }

                                  if (error.isEmpty) {
                                    String key = UserFlashcardExamModel.getKey(
                                        widget.homePageState.loginUsername);
                                    UserFlashcardExamModel newUserExam =
                                        UserFlashcardExamModel(
                                            false,
                                            key,
                                            widget.homePageState.loginUsername,
                                            _customTitleController.text,
                                            selectCategorys,
                                            widget.isOpen,
                                            !widget.isOpen,
                                            int.parse(
                                                _maxQuestionsController.text),
                                            int.parse(_maxTimeController.text),
                                            [],
                                            DateTime.now().toUtc(),
                                            DateTime.now().toUtc().add(Duration(
                                                minutes: !widget.isOpen
                                                    ? int.parse(
                                                        _maxTimeController.text)
                                                    : 99)));

                                    FirebaseCustomUserFlashcardExamHelper()
                                        .add(
                                            context: context,
                                            userExamModel: newUserExam)
                                        .then((result) {
                                      if (result == null) {
                                        Navigator.pop(context);

                                        Navigator.push<void>(
                                          context,
                                          MaterialPageRoute<void>(
                                            builder: (BuildContext context) =>
                                                FlashcardQuestionRun(
                                                    homePageState:
                                                        widget.homePageState,
                                                    keyUserExam:
                                                        newUserExam.key,
                                                    userExam: newUserExam),
                                          ),
                                        );
                                      } else {
                                        ScaffoldMessenger.of(context)
                                            .showSnackBar(SnackBar(
                                          content: Text(
                                            result,
                                            style:
                                                const TextStyle(fontSize: 16),
                                          ),
                                        ));
                                      }
                                    });
                                  } else {
                                    ScaffoldMessenger.of(context)
                                        .showSnackBar(SnackBar(
                                      content: Text(
                                        error,
                                        style: const TextStyle(fontSize: 16),
                                      ),
                                    ));
                                  }
                                } catch (errorValue) {
                                  ScaffoldMessenger.of(context)
                                      .showSnackBar(SnackBar(
                                    content: Text(
                                      errorValue.toString(),
                                      style: const TextStyle(fontSize: 16),
                                    ),
                                  ));
                                }
                              }
                            },
                            child: const Text(flashcardQuestionTodoSendTitle),
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

class FlashcardQuestionTodoReferenceState extends ReferencePageState {
  _FlashcardQuestionTodoState questionTodoState;

  FlashcardQuestionTodoReferenceState(this.questionTodoState);

  @override
  void setStates() {
    // ignore: invalid_use_of_protected_member
    questionTodoState.setState(() {});
  }
}
