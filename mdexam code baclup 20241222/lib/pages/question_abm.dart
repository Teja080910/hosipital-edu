// ignore_for_file: deprecated_member_use, duplicate_ignore, unnecessary_null_comparison

import 'package:cached_network_image/cached_network_image.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:image_picker/image_picker.dart';
import 'package:mdexam/models/answer_model.dart';
import 'package:mdexam/models/category_model.dart';
import 'package:mdexam/models/question_model.dart';
import 'package:mdexam/pages/question_list.dart';
import 'package:mdexam/utils/firebase/firebase_custom_question.dart';
import 'package:mdexam/utils/general/sizes_helpers.dart';
import 'package:mdexam/utils/list_transforms/category_list_transforms.dart'
    // ignore: library_prefixes
    as categoryTransforms;

import 'package:mdexam/widgets/application_bar.dart';
import 'package:mdexam/utils/general/abm.dart';
import 'package:mdexam/utils/general/reference_Page_State.dart';
import 'package:flutter/material.dart';
import 'package:mdexam/variables/globalvar.dart';
import 'package:mdexam/widgets/drop_down_buttom_edit_format.dart';

// ignore: must_be_immutable
class QuestionABM extends StatefulWidget {
  QuestionListState questionListState;
  final bool isNew;
  bool isModify;
  QuestionModel questionModel;

  QuestionABM({
    Key? key,
    required this.questionListState,
    required this.isNew,
    required this.isModify,
    required this.questionModel,
  }) : super(key: key);

  @override
  State<QuestionABM> createState() => _QuestionABMState();
}

class _QuestionABMState extends State<QuestionABM> {
  final _categoryController = TextEditingController();
  final _titleController = TextEditingController();
  final _explanationController = TextEditingController();
  final _referenceController = TextEditingController();

  final _answer1TitleController = TextEditingController();
  final _answer2TitleController = TextEditingController();
  final _answer3TitleController = TextEditingController();
  final _answer4TitleController = TextEditingController();
  final _answer5TitleController = TextEditingController();

  final _formKey = GlobalKey<FormState>();

  List<CategoryModel> categoryLists = [];

  Future<bool> _onBackPressed() async {
    return abmOnBackPressed2(context, () {}, () {});
  }

  @override
  void initState() {
    if (widget.isModify) {
      _titleController.text = widget.questionModel.title;

      _explanationController.text = widget.questionModel.explanation;
      _referenceController.text = widget.questionModel.reference;

// ignore: prefer_is_empty
      if (widget.questionModel.answers.length > 0) {
        _answer1TitleController.text = widget.questionModel.answers[0].title;
      }

      if (widget.questionModel.answers.length > 1) {
        _answer2TitleController.text = widget.questionModel.answers[1].title;
      }

      if (widget.questionModel.answers.length > 2) {
        _answer3TitleController.text = widget.questionModel.answers[2].title;
      }

      if (widget.questionModel.answers.length > 3) {
        _answer4TitleController.text = widget.questionModel.answers[3].title;
      }

      if (widget.questionModel.answers.length > 4) {
        _answer5TitleController.text = widget.questionModel.answers[4].title;
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
          firestoreInstance.collection(firebaseCustomCategoryKey);

      categorys
          .limit(100)
          .orderBy("title", descending: false)
          .get()
          .then((querySnapshot) {
        for (var result in querySnapshot.docs) {
          setState(() {
            categoryTransforms.uniquedAdd(categoryLists,
                CategoryModel.fromJSON(false, result.id, result.data()));
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
              title: questionABMTitle,
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
/* Category */
                            widget.isNew
                                ? dropDownButtomEditFormat(
                                    QuestionABMReferenceState(this),
                                    context,
                                    questionABMFieldCategoryTitle,
                                    Icons.category_outlined,
                                    categoryTransforms.categoryListToStringList(
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
                                hintText: questionABMFieldTitleHint,
                                labelText: questionABMFieldTitleLabel,
                              ),
                              keyboardType: TextInputType.multiline,
                              maxLines: null,
                              controller: _titleController,
                              validator: (value) {
                                if (value == null || value.isEmpty) {
                                  return questionABMFieldTitleError;
                                }
                                return null;
                              },
                              onChanged: (value) {
                                widget.questionModel.title = value;
                              },
                            ),

                            Row(
                              children: [
/* Title Image 01 */
                                Column(children: [
                                  const Padding(
                                      padding:
                                          EdgeInsets.only(left: 20, top: 20),
                                      child: Align(
                                          alignment: Alignment.centerLeft,
                                          child: Text(questionABMPhoto01Title,
                                              maxLines: 1,
                                              style: TextStyle(
                                                  color: Colors.black,
                                                  fontSize: 15,
                                                  fontWeight:
                                                      FontWeight.bold)))),
                                  Padding(
                                      padding: const EdgeInsets.all(5),
                                      child: ClipRRect(
                                          borderRadius:
                                              BorderRadius.circular(100),
                                          child: SizedBox(
                                            width: 100,
                                            height: 100,
                                            child: isNewImage01Title
                                                ? Image(
                                                    image: imageToStore01Title
                                                        .image,
                                                    fit: BoxFit.cover,
                                                  )
                                                : CachedNetworkImage(
                                                    imageUrl: widget
                                                        .questionModel
                                                        .urlTitle01,
                                                    placeholder: (context,
                                                            url) =>
                                                        const CircularProgressIndicator(),
                                                    errorWidget: (context, url,
                                                            error) =>
                                                        const Icon(Icons.error),
                                                    fit: BoxFit.cover,
                                                  ),
                                          ))),
                                  Padding(
                                    padding: const EdgeInsets.all(5),
                                    child: FloatingActionButton(
                                      onPressed: () {
                                        onCaptureImage01Title(
                                            ImageSource.gallery, context);
                                      },
                                      heroTag: captureImageGalleryHeroTag01,
                                      tooltip: captureImageGalleryTooltip01,
                                      mini: true,
                                      child: const Icon(Icons.photo, size: 20),
                                    ),
                                  ),
                                ]),

/* Title Image 02 */
                                Column(children: [
                                  const Padding(
                                      padding:
                                          EdgeInsets.only(left: 20, top: 20),
                                      child: Align(
                                          alignment: Alignment.centerLeft,
                                          child: Text(questionABMPhoto02Title,
                                              maxLines: 1,
                                              style: TextStyle(
                                                  color: Colors.black,
                                                  fontSize: 15,
                                                  fontWeight:
                                                      FontWeight.bold)))),
                                  Padding(
                                      padding: const EdgeInsets.all(5),
                                      child: ClipRRect(
                                          borderRadius:
                                              BorderRadius.circular(100),
                                          child: SizedBox(
                                            width: 100,
                                            height: 100,
                                            child: isNewImage02Title
                                                ? Image(
                                                    image: imageToStore02Title
                                                        .image,
                                                    fit: BoxFit.cover,
                                                  )
                                                : CachedNetworkImage(
                                                    imageUrl: widget
                                                        .questionModel
                                                        .urlTitle02,
                                                    placeholder: (context,
                                                            url) =>
                                                        const CircularProgressIndicator(),
                                                    errorWidget: (context, url,
                                                            error) =>
                                                        const Icon(Icons.error),
                                                    fit: BoxFit.cover,
                                                  ),
                                          ))),
                                  Padding(
                                    padding: const EdgeInsets.all(5),
                                    child: FloatingActionButton(
                                      onPressed: () {
                                        onCaptureImage02Title(
                                            ImageSource.gallery, context);
                                      },
                                      heroTag: captureImageGalleryHeroTag02,
                                      tooltip: captureImageGalleryTooltip02,
                                      mini: true,
                                      child: const Icon(Icons.photo, size: 20),
                                    ),
                                  ),
                                ]),

/* Title Image 03 */
                                Column(
                                  children: [
                                    const Padding(
                                        padding:
                                            EdgeInsets.only(left: 20, top: 20),
                                        child: Align(
                                            alignment: Alignment.centerLeft,
                                            child: Text(questionABMPhoto03Title,
                                                maxLines: 1,
                                                style: TextStyle(
                                                    color: Colors.black,
                                                    fontSize: 15,
                                                    fontWeight:
                                                        FontWeight.bold)))),
                                    Padding(
                                        padding: const EdgeInsets.all(5),
                                        child: ClipRRect(
                                            borderRadius:
                                                BorderRadius.circular(100),
                                            child: SizedBox(
                                              width: 100,
                                              height: 100,
                                              child: isNewImage03Title
                                                  ? Image(
                                                      image: imageToStore03Title
                                                          .image,
                                                      fit: BoxFit.cover,
                                                    )
                                                  : CachedNetworkImage(
                                                      imageUrl: widget
                                                          .questionModel
                                                          .urlTitle01,
                                                      placeholder: (context,
                                                              url) =>
                                                          const CircularProgressIndicator(),
                                                      errorWidget: (context,
                                                              url, error) =>
                                                          const Icon(
                                                              Icons.error),
                                                      fit: BoxFit.cover,
                                                    ),
                                            ))),
                                    Padding(
                                      padding: const EdgeInsets.all(5),
                                      child: FloatingActionButton(
                                        onPressed: () {
                                          onCaptureImage03Title(
                                              ImageSource.gallery, context);
                                        },
                                        heroTag: captureImageGalleryHeroTag03,
                                        tooltip: captureImageGalleryTooltip03,
                                        mini: true,
                                        child:
                                            const Icon(Icons.photo, size: 20),
                                      ),
                                    ),
                                  ],
                                ),
                              ],
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
                                const Text(questionABMFieldIsEnabledLabel),
                              ],
                            ),

// Answer 1
                            const Padding(
                                padding: EdgeInsets.all(20),
                                child: Text(questionABMFieldAnswer1Caption,
                                    style: TextStyle(
                                        color: Colors.black, fontSize: 20))),

                            Column(
                              children: [
/* Answer 1 IsCorrect */
                                Row(
                                  children: [
                                    Checkbox(
                                        value: widget
                                            .questionModel.answers[0].isCorrect,
                                        onChanged: (bool? value) {
                                          setState(() {
                                            widget.questionModel.answers[0]
                                                .isCorrect = value!;
                                          });
                                        }),
                                    const Text(
                                        questionABMFieldAnswerXIsCorrectLabel),
                                  ],
                                ),

/* Answer 1 Title */
                                TextFormField(
                                  decoration: const InputDecoration(
                                    icon: Icon(Icons.reply_rounded),
                                    hintText: questionABMFieldAnswerXTitleHint,
                                    labelText:
                                        questionABMFieldAnswerXTitleLabel,
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

// Answer 2
                            const Padding(
                                padding: EdgeInsets.all(20),
                                child: Text(questionABMFieldAnswer2Caption,
                                    style: TextStyle(
                                        color: Colors.black, fontSize: 20))),

                            Column(
                              children: [
/* Answer 2 IsCorrect */
                                Row(
                                  children: [
                                    Checkbox(
                                        value: widget
                                            .questionModel.answers[1].isCorrect,
                                        onChanged: (bool? value) {
                                          setState(() {
                                            widget.questionModel.answers[1]
                                                .isCorrect = value!;
                                          });
                                        }),
                                    const Text(
                                        questionABMFieldAnswerXIsCorrectLabel),
                                  ],
                                ),

/* Answer 2 Title */
                                TextFormField(
                                  decoration: const InputDecoration(
                                    icon: Icon(Icons.reply_rounded),
                                    hintText: questionABMFieldAnswerXTitleHint,
                                    labelText:
                                        questionABMFieldAnswerXTitleLabel,
                                  ),
                                  keyboardType: TextInputType.multiline,
                                  maxLines: null,
                                  controller: _answer2TitleController,
                                  onChanged: (value) {
                                    widget.questionModel.answers[1].title =
                                        value;
                                  },
                                ),
                              ],
                            ),

// Answer 3
                            const Padding(
                                padding: EdgeInsets.all(20),
                                child: Text(questionABMFieldAnswer3Caption,
                                    style: TextStyle(
                                        color: Colors.black, fontSize: 20))),

                            Column(
                              children: [
/* Answer 3 IsCorrect */
                                Row(
                                  children: [
                                    Checkbox(
                                        value: widget
                                            .questionModel.answers[2].isCorrect,
                                        onChanged: (bool? value) {
                                          setState(() {
                                            widget.questionModel.answers[2]
                                                .isCorrect = value!;
                                          });
                                        }),
                                    const Text(
                                        questionABMFieldAnswerXIsCorrectLabel),
                                  ],
                                ),

/* Answer 3 Title */
                                TextFormField(
                                  decoration: const InputDecoration(
                                    icon: Icon(Icons.reply_rounded),
                                    hintText: questionABMFieldAnswerXTitleHint,
                                    labelText:
                                        questionABMFieldAnswerXTitleLabel,
                                  ),
                                  keyboardType: TextInputType.multiline,
                                  maxLines: null,
                                  controller: _answer3TitleController,
                                  onChanged: (value) {
                                    widget.questionModel.answers[2].title =
                                        value;
                                  },
                                ),
                              ],
                            ),

// Answer 4
                            const Padding(
                                padding: EdgeInsets.all(20),
                                child: Text(questionABMFieldAnswer4Caption,
                                    style: TextStyle(
                                        color: Colors.black, fontSize: 20))),

                            Column(
                              children: [
/* Answer 4 IsCorrect */
                                Row(
                                  children: [
                                    Checkbox(
                                        value: widget
                                            .questionModel.answers[3].isCorrect,
                                        onChanged: (bool? value) {
                                          setState(() {
                                            widget.questionModel.answers[3]
                                                .isCorrect = value!;
                                          });
                                        }),
                                    const Text(
                                        questionABMFieldAnswerXIsCorrectLabel),
                                  ],
                                ),

/* Answer 4 Title */
                                TextFormField(
                                  decoration: const InputDecoration(
                                    icon: Icon(Icons.reply_rounded),
                                    hintText: questionABMFieldAnswerXTitleHint,
                                    labelText:
                                        questionABMFieldAnswerXTitleLabel,
                                  ),
                                  keyboardType: TextInputType.multiline,
                                  maxLines: null,
                                  controller: _answer4TitleController,
                                  onChanged: (value) {
                                    widget.questionModel.answers[3].title =
                                        value;
                                  },
                                ),
                              ],
                            ),

// Answer 5
                            const Padding(
                                padding: EdgeInsets.all(20),
                                child: Text(questionABMFieldAnswer5Caption,
                                    style: TextStyle(
                                        color: Colors.black, fontSize: 20))),

                            Column(
                              children: [
/* Answer 5 IsCorrect */
                                Row(
                                  children: [
                                    Checkbox(
                                        value: widget
                                            .questionModel.answers[4].isCorrect,
                                        onChanged: (bool? value) {
                                          setState(() {
                                            widget.questionModel.answers[4]
                                                .isCorrect = value!;
                                          });
                                        }),
                                    const Text(
                                        questionABMFieldAnswerXIsCorrectLabel),
                                  ],
                                ),

/* Answer 5 Title */
                                TextFormField(
                                  decoration: const InputDecoration(
                                    icon: Icon(Icons.reply_rounded),
                                    hintText: questionABMFieldAnswerXTitleHint,
                                    labelText:
                                        questionABMFieldAnswerXTitleLabel,
                                  ),
                                  keyboardType: TextInputType.multiline,
                                  maxLines: null,
                                  controller: _answer5TitleController,
                                  onChanged: (value) {
                                    widget.questionModel.answers[4].title =
                                        value;
                                  },
                                ),
                              ],
                            ),

                            const SizedBox(
                              height: 20,
                            ),

/* Explanation */
                            TextFormField(
                              decoration: const InputDecoration(
                                icon: Icon(Icons.title_rounded),
                                hintText: questionABMFieldExplanationHint,
                                labelText: questionABMFieldExplanationLabel,
                              ),
                              keyboardType: TextInputType.multiline,
                              maxLines: null,
                              controller: _explanationController,
                              validator: (value) {
                                if (value == null || value.isEmpty) {
                                  return questionABMFieldExplanationError;
                                }
                                return null;
                              },
                              onChanged: (value) {
                                widget.questionModel.explanation = value;
                              },
                            ),

                            Row(
                              children: [
/* Explanation Image 01 */
                                Column(children: [
                                  const Padding(
                                      padding:
                                          EdgeInsets.only(left: 20, top: 20),
                                      child: Align(
                                          alignment: Alignment.centerLeft,
                                          child: Text(questionABMPhoto01Title,
                                              maxLines: 1,
                                              style: TextStyle(
                                                  color: Colors.black,
                                                  fontSize: 15,
                                                  fontWeight:
                                                      FontWeight.bold)))),
                                  Padding(
                                      padding: const EdgeInsets.all(5),
                                      child: ClipRRect(
                                          borderRadius:
                                              BorderRadius.circular(100),
                                          child: SizedBox(
                                            width: 100,
                                            height: 100,
                                            child: isNewImage01Explanation
                                                ? Image(
                                                    image:
                                                        imageToStore01Explanation
                                                            .image,
                                                    fit: BoxFit.cover,
                                                  )
                                                : CachedNetworkImage(
                                                    imageUrl: widget
                                                        .questionModel
                                                        .urlExplanation01,
                                                    placeholder: (context,
                                                            url) =>
                                                        const CircularProgressIndicator(),
                                                    errorWidget: (context, url,
                                                            error) =>
                                                        const Icon(Icons.error),
                                                    fit: BoxFit.cover,
                                                  ),
                                          ))),
                                  Padding(
                                    padding: const EdgeInsets.all(5),
                                    child: FloatingActionButton(
                                      onPressed: () {
                                        onCaptureImage01Explanation(
                                            ImageSource.gallery, context);
                                      },
                                      heroTag: captureImageGalleryHeroTag01,
                                      tooltip: captureImageGalleryTooltip01,
                                      mini: true,
                                      child: const Icon(Icons.photo, size: 20),
                                    ),
                                  ),
                                ]),
/* Explanation Image 02 */
                                Column(children: [
                                  const Padding(
                                      padding:
                                          EdgeInsets.only(left: 20, top: 20),
                                      child: Align(
                                          alignment: Alignment.centerLeft,
                                          child: Text(questionABMPhoto02Title,
                                              maxLines: 1,
                                              style: TextStyle(
                                                  color: Colors.black,
                                                  fontSize: 15,
                                                  fontWeight:
                                                      FontWeight.bold)))),
                                  Padding(
                                      padding: const EdgeInsets.all(5),
                                      child: ClipRRect(
                                          borderRadius:
                                              BorderRadius.circular(100),
                                          child: SizedBox(
                                            width: 100,
                                            height: 100,
                                            child: isNewImage02Explanation
                                                ? Image(
                                                    image:
                                                        imageToStore02Explanation
                                                            .image,
                                                    fit: BoxFit.cover,
                                                  )
                                                : CachedNetworkImage(
                                                    imageUrl: widget
                                                        .questionModel
                                                        .urlExplanation02,
                                                    placeholder: (context,
                                                            url) =>
                                                        const CircularProgressIndicator(),
                                                    errorWidget: (context, url,
                                                            error) =>
                                                        const Icon(Icons.error),
                                                    fit: BoxFit.cover,
                                                  ),
                                          ))),
                                  Padding(
                                    padding: const EdgeInsets.all(5),
                                    child: FloatingActionButton(
                                      onPressed: () {
                                        onCaptureImage02Explanation(
                                            ImageSource.gallery, context);
                                      },
                                      heroTag: captureImageGalleryHeroTag02,
                                      tooltip: captureImageGalleryTooltip02,
                                      mini: true,
                                      child: const Icon(Icons.photo, size: 20),
                                    ),
                                  ),
                                ]),

/* Explanation Image 03 */
                                Column(
                                  children: [
                                    const Padding(
                                        padding:
                                            EdgeInsets.only(left: 20, top: 20),
                                        child: Align(
                                            alignment: Alignment.centerLeft,
                                            child: Text(questionABMPhoto03Title,
                                                maxLines: 1,
                                                style: TextStyle(
                                                    color: Colors.black,
                                                    fontSize: 15,
                                                    fontWeight:
                                                        FontWeight.bold)))),
                                    Padding(
                                        padding: const EdgeInsets.all(5),
                                        child: ClipRRect(
                                            borderRadius:
                                                BorderRadius.circular(100),
                                            child: SizedBox(
                                              width: 100,
                                              height: 100,
                                              child: isNewImage03Explanation
                                                  ? Image(
                                                      image:
                                                          imageToStore03Explanation
                                                              .image,
                                                      fit: BoxFit.cover,
                                                    )
                                                  : CachedNetworkImage(
                                                      imageUrl: widget
                                                          .questionModel
                                                          .urlExplanation01,
                                                      placeholder: (context,
                                                              url) =>
                                                          const CircularProgressIndicator(),
                                                      errorWidget: (context,
                                                              url, error) =>
                                                          const Icon(
                                                              Icons.error),
                                                      fit: BoxFit.cover,
                                                    ),
                                            ))),
                                    Padding(
                                      padding: const EdgeInsets.all(5),
                                      child: FloatingActionButton(
                                        onPressed: () {
                                          onCaptureImage03Explanation(
                                              ImageSource.gallery, context);
                                        },
                                        heroTag: captureImageGalleryHeroTag03,
                                        tooltip: captureImageGalleryTooltip03,
                                        mini: true,
                                        child:
                                            const Icon(Icons.photo, size: 20),
                                      ),
                                    ),
                                  ],
                                ),
                              ],
                            ),

                            const SizedBox(
                              height: 20,
                            ),
/* Reference */
                            TextFormField(
                              decoration: const InputDecoration(
                                icon: Icon(Icons.title_rounded),
                                hintText: questionABMFieldReferenceHint,
                                labelText: questionABMFieldReferenceLabel,
                              ),
                              keyboardType: TextInputType.multiline,
                              maxLines: null,
                              controller: _referenceController,
                              validator: (value) {
                                return null;
                              },
                              onChanged: (value) {
                                widget.questionModel.reference = value;
                              },
                            ),

                            Row(
                              children: [
/* Reference Image 01 */
                                Column(children: [
                                  const Padding(
                                      padding:
                                          EdgeInsets.only(left: 20, top: 20),
                                      child: Align(
                                          alignment: Alignment.centerLeft,
                                          child: Text(questionABMPhoto01Title,
                                              maxLines: 1,
                                              style: TextStyle(
                                                  color: Colors.black,
                                                  fontSize: 15,
                                                  fontWeight:
                                                      FontWeight.bold)))),
                                  Padding(
                                      padding: const EdgeInsets.all(5),
                                      child: ClipRRect(
                                          borderRadius:
                                              BorderRadius.circular(100),
                                          child: SizedBox(
                                            width: 100,
                                            height: 100,
                                            child: isNewImage01Reference
                                                ? Image(
                                                    image:
                                                        imageToStore01Reference
                                                            .image,
                                                    fit: BoxFit.cover,
                                                  )
                                                : CachedNetworkImage(
                                                    imageUrl: widget
                                                        .questionModel
                                                        .urlReference01,
                                                    placeholder: (context,
                                                            url) =>
                                                        const CircularProgressIndicator(),
                                                    errorWidget: (context, url,
                                                            error) =>
                                                        const Icon(Icons.error),
                                                    fit: BoxFit.cover,
                                                  ),
                                          ))),
                                  Padding(
                                    padding: const EdgeInsets.all(5),
                                    child: FloatingActionButton(
                                      onPressed: () {
                                        onCaptureImage01Reference(
                                            ImageSource.gallery, context);
                                      },
                                      heroTag: captureImageGalleryHeroTag01,
                                      tooltip: captureImageGalleryTooltip01,
                                      mini: true,
                                      child: const Icon(Icons.photo, size: 20),
                                    ),
                                  ),
                                ]),

/* Reference Image 02 */
                                Column(children: [
                                  const Padding(
                                      padding:
                                          EdgeInsets.only(left: 20, top: 20),
                                      child: Align(
                                          alignment: Alignment.centerLeft,
                                          child: Text(questionABMPhoto02Title,
                                              maxLines: 1,
                                              style: TextStyle(
                                                  color: Colors.black,
                                                  fontSize: 15,
                                                  fontWeight:
                                                      FontWeight.bold)))),
                                  Padding(
                                      padding: const EdgeInsets.all(5),
                                      child: ClipRRect(
                                          borderRadius:
                                              BorderRadius.circular(100),
                                          child: SizedBox(
                                            width: 100,
                                            height: 100,
                                            child: isNewImage02Reference
                                                ? Image(
                                                    image:
                                                        imageToStore02Reference
                                                            .image,
                                                    fit: BoxFit.cover,
                                                  )
                                                : CachedNetworkImage(
                                                    imageUrl: widget
                                                        .questionModel
                                                        .urlReference02,
                                                    placeholder: (context,
                                                            url) =>
                                                        const CircularProgressIndicator(),
                                                    errorWidget: (context, url,
                                                            error) =>
                                                        const Icon(Icons.error),
                                                    fit: BoxFit.cover,
                                                  ),
                                          ))),
                                  Padding(
                                    padding: const EdgeInsets.all(5),
                                    child: FloatingActionButton(
                                      onPressed: () {
                                        onCaptureImage02Reference(
                                            ImageSource.gallery, context);
                                      },
                                      heroTag: captureImageGalleryHeroTag02,
                                      tooltip: captureImageGalleryTooltip02,
                                      mini: true,
                                      child: const Icon(Icons.photo, size: 20),
                                    ),
                                  ),
                                ]),

/* Reference Image 03 */
                                Column(
                                  children: [
                                    const Padding(
                                        padding:
                                            EdgeInsets.only(left: 20, top: 20),
                                        child: Align(
                                            alignment: Alignment.centerLeft,
                                            child: Text(questionABMPhoto03Title,
                                                maxLines: 1,
                                                style: TextStyle(
                                                    color: Colors.black,
                                                    fontSize: 15,
                                                    fontWeight:
                                                        FontWeight.bold)))),
                                    Padding(
                                        padding: const EdgeInsets.all(5),
                                        child: ClipRRect(
                                            borderRadius:
                                                BorderRadius.circular(100),
                                            child: SizedBox(
                                              width: 100,
                                              height: 100,
                                              child: isNewImage03Reference
                                                  ? Image(
                                                      image:
                                                          imageToStore03Reference
                                                              .image,
                                                      fit: BoxFit.cover,
                                                    )
                                                  : CachedNetworkImage(
                                                      imageUrl: widget
                                                          .questionModel
                                                          .urlReference03,
                                                      placeholder: (context,
                                                              url) =>
                                                          const CircularProgressIndicator(),
                                                      errorWidget: (context,
                                                              url, error) =>
                                                          const Icon(
                                                              Icons.error),
                                                      fit: BoxFit.cover,
                                                    ),
                                            ))),
                                    Padding(
                                      padding: const EdgeInsets.all(5),
                                      child: FloatingActionButton(
                                        onPressed: () {
                                          onCaptureImage03Reference(
                                              ImageSource.gallery, context);
                                        },
                                        heroTag: captureImageGalleryHeroTag03,
                                        tooltip: captureImageGalleryTooltip03,
                                        mini: true,
                                        child:
                                            const Icon(Icons.photo, size: 20),
                                      ),
                                    ),
                                  ],
                                ),
                              ],
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
/* Question New */
                                        if (widget.isNew) {
                                          try {
                                            String error = "";

                                            if (_categoryController
                                                .text.isEmpty) {
                                              error =
                                                  questionABMFieldCategoryError;
                                            }

                                            if (_titleController.text.isEmpty) {
                                              error =
                                                  questionABMFieldTitleError;
                                            }

                                            if (_explanationController
                                                .text.isEmpty) {
                                              error =
                                                  questionABMFieldExplanationError;
                                            }

                                            int countAnswersIsCorrect = 0;
                                            for (AnswerModel oneAnswer in widget
                                                .questionModel.answers) {
                                              if (oneAnswer.isCorrect) {
                                                countAnswersIsCorrect++;
                                              }
                                            }

                                            if (countAnswersIsCorrect == 0) {
                                              error =
                                                  questionABMFieldAnswer1Error;
                                            }

//                                            if (countAnswersIsCorrect > 1) {
//                                              error =
//                                                  questionABMFieldAnswer2Error;
//                                            }

                                            int i = 0;
                                            for (AnswerModel oneAnswer in widget
                                                .questionModel.answers) {
                                              i++;
                                              if (oneAnswer.isCorrect &&
                                                  oneAnswer.title.isEmpty) {
                                                error =
                                                    questionABMFieldAnswerWithoutTitleError +
                                                        i.toString();
                                              }
                                            }
/*
                                            if (widget.isNew && !isNewImage01) {
                                              error =
                                                  questionABMFieldImage01Error;
                                            }
*/
                                            if (error.isEmpty) {
                                              widget.questionModel.category =
                                                  categoryTransforms
                                                      .categoryStringToCategoryModel(
                                                          categoryLists,
                                                          _categoryController
                                                              .text);

                                              FirebaseCustomQuestionHelper()
                                                  .add(
                                                      context: context,
                                                      questionModel:
                                                          widget.questionModel,
                                                      pickedFile01Title:
                                                          pickedFileToStore01Title,
                                                      isNewImage01Title:
                                                          isNewImage01Title,
                                                      pickedFile02Title:
                                                          pickedFileToStore02Title,
                                                      isNewImage02Title:
                                                          isNewImage02Title,
                                                      pickedFile03Title:
                                                          pickedFileToStore03Title,
                                                      isNewImage03Title:
                                                          isNewImage03Title,
                                                      pickedFile01Explanation:
                                                          pickedFileToStore01Explanation,
                                                      isNewImage01Explanation:
                                                          isNewImage01Explanation,
                                                      pickedFile02Explanation:
                                                          pickedFileToStore02Explanation,
                                                      isNewImage02Explanation:
                                                          isNewImage02Explanation,
                                                      pickedFile03Explanation:
                                                          pickedFileToStore03Explanation,
                                                      isNewImage03Explanation:
                                                          isNewImage03Explanation,
                                                      pickedFile01Reference:
                                                          pickedFileToStore01Reference,
                                                      isNewImage01Reference:
                                                          isNewImage01Reference,
                                                      pickedFile02Reference:
                                                          pickedFileToStore02Reference,
                                                      isNewImage02Reference:
                                                          isNewImage02Reference,
                                                      pickedFile03Reference:
                                                          pickedFileToStore03Reference,
                                                      isNewImage03Reference:
                                                          isNewImage03Reference,
                                                      onFinish: () {
                                                        ScaffoldMessenger.of(
                                                                context)
                                                            .showSnackBar(
                                                                const SnackBar(
                                                          content: Text(
                                                            questionABMNewSaved,
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

/* Question Modify */
                                        if (widget.isModify) {
                                          try {
                                            String error = "";

                                            if (_titleController.text.isEmpty) {
                                              error =
                                                  questionABMFieldTitleError;
                                            }

                                            if (_explanationController
                                                .text.isEmpty) {
                                              error =
                                                  questionABMFieldExplanationError;
                                            }

                                            int countAnswersIsCorrect = 0;
                                            for (AnswerModel oneAnswer in widget
                                                .questionModel.answers) {
                                              if (oneAnswer.isCorrect) {
                                                countAnswersIsCorrect++;
                                              }
                                            }

                                            if (countAnswersIsCorrect == 0) {
                                              error =
                                                  questionABMFieldAnswer1Error;
                                            }

//                                            if (countAnswersIsCorrect > 1) {
//                                              error =
//                                                  questionABMFieldAnswer2Error;
//                                            }

                                            int i = 0;
                                            for (AnswerModel oneAnswer in widget
                                                .questionModel.answers) {
                                              i++;
                                              if (oneAnswer.isCorrect &&
                                                  oneAnswer.title.isEmpty) {
                                                error =
                                                    questionABMFieldAnswerWithoutTitleError +
                                                        i.toString();
                                              }
                                            }

                                            if (error.isEmpty) {
                                              FirebaseCustomQuestionHelper()
                                                  .modify(
                                                      context: context,
                                                      questionModel:
                                                          widget.questionModel,
                                                      pickedFile01Title:
                                                          pickedFileToStore01Title,
                                                      isNewImage01Title:
                                                          isNewImage01Title,
                                                      pickedFile02Title:
                                                          pickedFileToStore02Title,
                                                      isNewImage02Title:
                                                          isNewImage02Title,
                                                      pickedFile03Title:
                                                          pickedFileToStore03Title,
                                                      isNewImage03Title:
                                                          isNewImage03Title,
                                                      pickedFile01Explanation:
                                                          pickedFileToStore01Explanation,
                                                      isNewImage01Explanation:
                                                          isNewImage01Explanation,
                                                      pickedFile02Explanation:
                                                          pickedFileToStore02Explanation,
                                                      isNewImage02Explanation:
                                                          isNewImage02Explanation,
                                                      pickedFile03Explanation:
                                                          pickedFileToStore03Explanation,
                                                      isNewImage03Explanation:
                                                          isNewImage03Explanation,
                                                      pickedFile01Reference:
                                                          pickedFileToStore01Reference,
                                                      isNewImage01Reference:
                                                          isNewImage01Reference,
                                                      pickedFile02Reference:
                                                          pickedFileToStore02Reference,
                                                      isNewImage02Reference:
                                                          isNewImage02Reference,
                                                      pickedFile03Reference:
                                                          pickedFileToStore03Reference,
                                                      isNewImage03Reference:
                                                          isNewImage03Reference,
                                                      onFinish: () {
                                                        ScaffoldMessenger.of(
                                                                context)
                                                            .showSnackBar(
                                                                const SnackBar(
                                                          content: Text(
                                                            questionABMModifySaved,
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
                                    child: const Text(questionABMSaveTitle),
                                  ),
                                ),
                              ),

/* Question Delete */

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

                                                                  FirebaseCustomQuestionHelper()
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
                                                                          questionABMModifyDelete,
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

// Title Photo 01
  Image imageToStore01Title = Image.asset("assets/mdexam.png");
  XFile pickedFileToStore01Title = XFile("");
  bool isNewImage01Title = false;

  void onCaptureImage01Title(ImageSource source, BuildContext context) async {
    try {
      if (isWeb()) {
        XFile? pickedFile = await ImagePicker().pickImage(source: source);

        if (pickedFile != null) {
          pickedFileToStore01Title = pickedFile;
          imageToStore01Title = Image.memory(await pickedFile.readAsBytes());
          isNewImage01Title = true;
        }

        setState(() {});
      }

      if (isMobile()) {
        XFile? pickedFile = await ImagePicker().pickImage(source: source);

        if (pickedFile != null) {
          pickedFileToStore01Title = pickedFile;
          imageToStore01Title = Image.memory(await pickedFile.readAsBytes());
          isNewImage01Title = true;
        }

        setState(() {});
      }
    } catch (e) {
      e.toString();
    }
  }

// Title Photo 02
  Image imageToStore02Title = Image.asset("assets/mdexam.png");
  XFile pickedFileToStore02Title = XFile("");
  bool isNewImage02Title = false;

  void onCaptureImage02Title(ImageSource source, BuildContext context) async {
    try {
      if (isWeb()) {
        XFile? pickedFile = await ImagePicker().pickImage(source: source);

        if (pickedFile != null) {
          pickedFileToStore02Title = pickedFile;
          imageToStore02Title = Image.memory(await pickedFile.readAsBytes());
          isNewImage02Title = true;
        }

        setState(() {});
      }

      if (isMobile()) {
        XFile? pickedFile = await ImagePicker().pickImage(source: source);

        if (pickedFile != null) {
          pickedFileToStore02Title = pickedFile;
          imageToStore02Title = Image.memory(await pickedFile.readAsBytes());
          isNewImage02Title = true;
        }

        setState(() {});
      }
    } catch (e) {
      e.toString();
    }
  }

// Title Photo 03
  Image imageToStore03Title = Image.asset("assets/mdexam.png");
  XFile pickedFileToStore03Title = XFile("");
  bool isNewImage03Title = false;

  void onCaptureImage03Title(ImageSource source, BuildContext context) async {
    try {
      if (isWeb()) {
        XFile? pickedFile = await ImagePicker().pickImage(source: source);

        if (pickedFile != null) {
          pickedFileToStore03Title = pickedFile;
          imageToStore03Title = Image.memory(await pickedFile.readAsBytes());
          isNewImage03Title = true;
        }

        setState(() {});
      }

      if (isMobile()) {
        XFile? pickedFile = await ImagePicker().pickImage(source: source);

        if (pickedFile != null) {
          pickedFileToStore03Title = pickedFile;
          imageToStore03Title = Image.memory(await pickedFile.readAsBytes());
          isNewImage03Title = true;
        }

        setState(() {});
      }
    } catch (e) {
      e.toString();
    }
  }

// Explanation Photo 01
  Image imageToStore01Explanation = Image.asset("assets/mdexam.png");
  XFile pickedFileToStore01Explanation = XFile("");
  bool isNewImage01Explanation = false;

  void onCaptureImage01Explanation(
      ImageSource source, BuildContext context) async {
    try {
      if (isWeb()) {
        XFile? pickedFile = await ImagePicker().pickImage(source: source);

        if (pickedFile != null) {
          pickedFileToStore01Explanation = pickedFile;
          imageToStore01Explanation =
              Image.memory(await pickedFile.readAsBytes());
          isNewImage01Explanation = true;
        }

        setState(() {});
      }

      if (isMobile()) {
        XFile? pickedFile = await ImagePicker().pickImage(source: source);

        if (pickedFile != null) {
          pickedFileToStore01Explanation = pickedFile;
          imageToStore01Explanation =
              Image.memory(await pickedFile.readAsBytes());
          isNewImage01Explanation = true;
        }

        setState(() {});
      }
    } catch (e) {
      e.toString();
    }
  }

// Explanation Photo 02
  Image imageToStore02Explanation = Image.asset("assets/mdexam.png");
  XFile pickedFileToStore02Explanation = XFile("");
  bool isNewImage02Explanation = false;

  void onCaptureImage02Explanation(
      ImageSource source, BuildContext context) async {
    try {
      if (isWeb()) {
        XFile? pickedFile = await ImagePicker().pickImage(source: source);

        if (pickedFile != null) {
          pickedFileToStore02Explanation = pickedFile;
          imageToStore02Explanation =
              Image.memory(await pickedFile.readAsBytes());
          isNewImage02Explanation = true;
        }

        setState(() {});
      }

      if (isMobile()) {
        XFile? pickedFile = await ImagePicker().pickImage(source: source);

        if (pickedFile != null) {
          pickedFileToStore02Explanation = pickedFile;
          imageToStore02Explanation =
              Image.memory(await pickedFile.readAsBytes());
          isNewImage02Explanation = true;
        }

        setState(() {});
      }
    } catch (e) {
      e.toString();
    }
  }

// Explanation Photo 03
  Image imageToStore03Explanation = Image.asset("assets/mdexam.png");
  XFile pickedFileToStore03Explanation = XFile("");
  bool isNewImage03Explanation = false;

  void onCaptureImage03Explanation(
      ImageSource source, BuildContext context) async {
    try {
      if (isWeb()) {
        XFile? pickedFile = await ImagePicker().pickImage(source: source);

        if (pickedFile != null) {
          pickedFileToStore03Explanation = pickedFile;
          imageToStore03Explanation =
              Image.memory(await pickedFile.readAsBytes());
          isNewImage03Explanation = true;
        }

        setState(() {});
      }

      if (isMobile()) {
        XFile? pickedFile = await ImagePicker().pickImage(source: source);

        if (pickedFile != null) {
          pickedFileToStore03Explanation = pickedFile;
          imageToStore03Explanation =
              Image.memory(await pickedFile.readAsBytes());
          isNewImage03Explanation = true;
        }

        setState(() {});
      }
    } catch (e) {
      e.toString();
    }
  }

// Reference Photo 01
  Image imageToStore01Reference = Image.asset("assets/mdexam.png");
  XFile pickedFileToStore01Reference = XFile("");
  bool isNewImage01Reference = false;

  void onCaptureImage01Reference(
      ImageSource source, BuildContext context) async {
    try {
      if (isWeb()) {
        XFile? pickedFile = await ImagePicker().pickImage(source: source);

        if (pickedFile != null) {
          pickedFileToStore01Reference = pickedFile;
          imageToStore01Reference =
              Image.memory(await pickedFile.readAsBytes());
          isNewImage01Reference = true;
        }

        setState(() {});
      }

      if (isMobile()) {
        XFile? pickedFile = await ImagePicker().pickImage(source: source);

        if (pickedFile != null) {
          pickedFileToStore01Reference = pickedFile;
          imageToStore01Reference =
              Image.memory(await pickedFile.readAsBytes());
          isNewImage01Reference = true;
        }

        setState(() {});
      }
    } catch (e) {
      e.toString();
    }
  }

// Reference Photo 02
  Image imageToStore02Reference = Image.asset("assets/mdexam.png");
  XFile pickedFileToStore02Reference = XFile("");
  bool isNewImage02Reference = false;

  void onCaptureImage02Reference(
      ImageSource source, BuildContext context) async {
    try {
      if (isWeb()) {
        XFile? pickedFile = await ImagePicker().pickImage(source: source);

        if (pickedFile != null) {
          pickedFileToStore02Reference = pickedFile;
          imageToStore02Reference =
              Image.memory(await pickedFile.readAsBytes());
          isNewImage02Reference = true;
        }

        setState(() {});
      }

      if (isMobile()) {
        XFile? pickedFile = await ImagePicker().pickImage(source: source);

        if (pickedFile != null) {
          pickedFileToStore02Reference = pickedFile;
          imageToStore02Reference =
              Image.memory(await pickedFile.readAsBytes());
          isNewImage02Reference = true;
        }

        setState(() {});
      }
    } catch (e) {
      e.toString();
    }
  }

// Reference Photo 03
  Image imageToStore03Reference = Image.asset("assets/mdexam.png");
  XFile pickedFileToStore03Reference = XFile("");
  bool isNewImage03Reference = false;

  void onCaptureImage03Reference(
      ImageSource source, BuildContext context) async {
    try {
      if (isWeb()) {
        XFile? pickedFile = await ImagePicker().pickImage(source: source);

        if (pickedFile != null) {
          pickedFileToStore03Reference = pickedFile;
          imageToStore03Reference =
              Image.memory(await pickedFile.readAsBytes());
          isNewImage03Reference = true;
        }

        setState(() {});
      }

      if (isMobile()) {
        XFile? pickedFile = await ImagePicker().pickImage(source: source);

        if (pickedFile != null) {
          pickedFileToStore03Reference = pickedFile;
          imageToStore03Reference =
              Image.memory(await pickedFile.readAsBytes());
          isNewImage03Reference = true;
        }

        setState(() {});
      }
    } catch (e) {
      e.toString();
    }
  }
}

class QuestionABMReferenceState extends ReferencePageState {
  _QuestionABMState questionABMState;

  QuestionABMReferenceState(this.questionABMState);

  @override
  void setStates() {
    // ignore: invalid_use_of_protected_member
    questionABMState.setState(() {});
  }
}
