import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:mdexam/models/answer_model.dart';
import 'package:mdexam/models/question_answer_model.dart';
import 'package:mdexam/pages/image_view.dart';
import 'package:mdexam/utils/general/custom_button.dart';
import 'package:mdexam/utils/general/horizontal_line.dart';
import 'package:mdexam/utils/general/sizes_helpers.dart';
import 'package:mdexam/variables/globalvar.dart';
import 'package:styled_text/styled_text.dart';

Widget questionAnswerBuild(
    BuildContext context,
    bool isOpen,
    bool isReadonly,
    int currentQuestion,
    QuestionAnswerModel questionAnswer,
    TextEditingController preSelectValueController,
    double factor,
    VoidCallback onTap,
    VoidCallback onRefresh) {
  return Container(
      margin: const EdgeInsets.all(10),
      decoration: const BoxDecoration(
        borderRadius: BorderRadius.all(
          Radius.circular(10),
        ),
        color: Colors.grey,
      ),
      child: Container(
          margin: const EdgeInsets.all(1),
          decoration: const BoxDecoration(
            borderRadius: BorderRadius.all(
              Radius.circular(10),
            ),
            color: Colors.white,
          ),
          child: Container(
              color: Colors.white,
              margin: const EdgeInsets.only(
                  left: 10, right: 10, top: 20, bottom: 20),
              child: SizedBox(
//                  width: 300,
                  width: displayWidth(context) - 20,
                  child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisAlignment: MainAxisAlignment.start,
                      mainAxisSize: MainAxisSize.max,
                      children: [
                        getStyledText(
                          (currentQuestion >= 0
                                  ? (currentQuestion + 1).toString() + " - "
                                  : "") +
                              questionAnswer.question.title,
                          500,
                          TextAlign.left,
                          const TextStyle(
                              color: Colors.black87,
                              fontSize: 15,
                              fontWeight: FontWeight.w500),
                        ),
                        const SizedBox(
                          height: 10,
                        ),

// Title Images
                        Column(children: [
                          Row(
                              crossAxisAlignment: CrossAxisAlignment.center,
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                getImage(context,
                                    questionAnswer.question.urlTitle01, factor),
                                const SizedBox(
                                  width: 10,
                                ),
                                getImage(context,
                                    questionAnswer.question.urlTitle02, factor),
                                const SizedBox(
                                  width: 10,
                                ),
                                getImage(context,
                                    questionAnswer.question.urlTitle03, factor),
                              ])
                        ]),

                        const SizedBox(
                          height: 10,
                        ),

                        horizontalLine(Colors.grey, displayWidth(context) - 80),
                        const SizedBox(
                          height: 20,
                        ),

// Questions
                        !isReadonly && !questionAnswer.isFinished()
                            ? Column(children: [
                                questionAnswer.question.answers.isNotEmpty
                                    ? questionAnswer.question.answers[0].title
                                            .isNotEmpty
                                        ? questionAnswerOneAnswer(
                                            context,
                                            0,
                                            questionAnswer.question.answers[0],
                                            "A",
                                            "",
                                            preSelectValueController, () {
                                            questionAnswerOneAnswerPreSelect(
                                                0, preSelectValueController,
                                                () {
                                              onRefresh();
                                            });
                                          })
                                        : Container()
                                    : Container(),
                                questionAnswer.question.answers.length > 1
                                    ? questionAnswer.question.answers[1].title
                                            .isNotEmpty
                                        ? questionAnswerOneAnswer(
                                            context,
                                            1,
                                            questionAnswer.question.answers[1],
                                            "B",
                                            "",
                                            preSelectValueController, () {
                                            questionAnswerOneAnswerPreSelect(
                                                1, preSelectValueController,
                                                () {
                                              onRefresh();
                                            });
                                          })
                                        : Container()
                                    : Container(),
                                questionAnswer.question.answers.length > 2
                                    ? questionAnswer.question.answers[2].title
                                            .isNotEmpty
                                        ? questionAnswerOneAnswer(
                                            context,
                                            2,
                                            questionAnswer.question.answers[2],
                                            "C",
                                            "",
                                            preSelectValueController, () {
                                            questionAnswerOneAnswerPreSelect(
                                                2, preSelectValueController,
                                                () {
                                              onRefresh();
                                            });
                                          })
                                        : Container()
                                    : Container(),
                                questionAnswer.question.answers.length > 3
                                    ? questionAnswer.question.answers[3].title
                                            .isNotEmpty
                                        ? questionAnswerOneAnswer(
                                            context,
                                            3,
                                            questionAnswer.question.answers[3],
                                            "D",
                                            "",
                                            preSelectValueController, () {
                                            questionAnswerOneAnswerPreSelect(
                                                3, preSelectValueController,
                                                () {
                                              onRefresh();
                                            });
                                          })
                                        : Container()
                                    : Container(),
                                questionAnswer.question.answers.length > 4
                                    ? questionAnswer.question.answers[4].title
                                            .isNotEmpty
                                        ? questionAnswerOneAnswer(
                                            context,
                                            4,
                                            questionAnswer.question.answers[4],
                                            "E",
                                            "",
                                            preSelectValueController, () {
                                            questionAnswerOneAnswerPreSelect(
                                                4, preSelectValueController,
                                                () {
                                              onRefresh();
                                            });
                                          })
                                        : Container()
                                    : Container(),
                              ])
                            : Container(),

// Results
                        questionAnswer.isFinished() && isOpen
                            ? Column(children: [
                                questionAnswer.question.answers.isNotEmpty
                                    ? questionAnswer.question.answers[0].title
                                            .isNotEmpty
                                        ? questionAnswerOneAnswer(
                                            context,
                                            -1,
                                            questionAnswer.question.answers[0],
                                            "A",
                                            questionAnswer.answer.title,
                                            preSelectValueController,
                                            () {})
                                        : Container()
                                    : Container(),
                                questionAnswer.question.answers.length > 1
                                    ? questionAnswer.question.answers[1].title
                                            .isNotEmpty
                                        ? questionAnswerOneAnswer(
                                            context,
                                            -1,
                                            questionAnswer.question.answers[1],
                                            "B",
                                            questionAnswer.answer.title,
                                            preSelectValueController,
                                            () {})
                                        : Container()
                                    : Container(),
                                questionAnswer.question.answers.length > 2
                                    ? questionAnswer.question.answers[2].title
                                            .isNotEmpty
                                        ? questionAnswerOneAnswer(
                                            context,
                                            -1,
                                            questionAnswer.question.answers[2],
                                            "C",
                                            questionAnswer.answer.title,
                                            preSelectValueController,
                                            () {})
                                        : Container()
                                    : Container(),
                                questionAnswer.question.answers.length > 3
                                    ? questionAnswer.question.answers[3].title
                                            .isNotEmpty
                                        ? questionAnswerOneAnswer(
                                            context,
                                            -1,
                                            questionAnswer.question.answers[3],
                                            "D",
                                            questionAnswer.answer.title,
                                            preSelectValueController,
                                            () {})
                                        : Container()
                                    : Container(),
                                questionAnswer.question.answers.length > 4
                                    ? questionAnswer.question.answers[4].title
                                            .isNotEmpty
                                        ? questionAnswerOneAnswer(
                                            context,
                                            -1,
                                            questionAnswer.question.answers[4],
                                            "E",
                                            questionAnswer.answer.title,
                                            preSelectValueController,
                                            () {})
                                        : Container()
                                    : Container(),
                                const SizedBox(
                                  height: 10,
                                ),
// Explanation
                                questionAnswer.isFinished() &&
                                        isOpen &
                                            questionAnswer
                                                .question.explanation.isNotEmpty
                                    ? Column(
                                        mainAxisAlignment:
                                            MainAxisAlignment.start,
                                        crossAxisAlignment:
                                            CrossAxisAlignment.start,
                                        children: [
                                            const Text(
                                              questionRunExplanationTitle,
                                              textAlign: TextAlign.left,
                                              style: TextStyle(
                                                  color: Colors.black87,
                                                  fontSize: 15,
                                                  fontWeight: FontWeight.bold),
                                            ),
                                            getStyledText(
                                              questionAnswer
                                                  .question.explanation,
                                              500,
                                              TextAlign.left,
                                              const TextStyle(
                                                  color: Colors.black87,
                                                  fontSize: 15,
                                                  fontWeight: FontWeight.w500),
                                            ),

                                            const SizedBox(
                                              height: 10,
                                            ),

// Explanation Images
                                            Column(children: [
                                              Row(
                                                  crossAxisAlignment:
                                                      CrossAxisAlignment.center,
                                                  mainAxisAlignment:
                                                      MainAxisAlignment.center,
                                                  children: [
                                                    getImage(
                                                        context,
                                                        questionAnswer.question
                                                            .urlExplanation01,
                                                        factor),
                                                    const SizedBox(
                                                      width: 10,
                                                    ),
                                                    getImage(
                                                        context,
                                                        questionAnswer.question
                                                            .urlExplanation02,
                                                        factor),
                                                    const SizedBox(
                                                      width: 10,
                                                    ),
                                                    getImage(
                                                        context,
                                                        questionAnswer.question
                                                            .urlExplanation03,
                                                        factor),
                                                  ])
                                            ]),

                                            const SizedBox(
                                              height: 10,
                                            ),
                                          ])
                                    : Container(),
// Reference
                                questionAnswer.isFinished() &&
                                        isOpen &
                                            questionAnswer
                                                .question.reference.isNotEmpty
                                    ? Column(
                                        mainAxisAlignment:
                                            MainAxisAlignment.start,
                                        crossAxisAlignment:
                                            CrossAxisAlignment.start,
                                        children: [
                                            const Text(
                                              questionRunReferenceTitle,
                                              textAlign: TextAlign.left,
                                              style: TextStyle(
                                                  color: Colors.black87,
                                                  fontSize: 15,
                                                  fontWeight: FontWeight.bold),
                                            ),
                                            getStyledText(
                                              questionAnswer.question.reference,
                                              500,
                                              TextAlign.left,
                                              const TextStyle(
                                                  color: Colors.black87,
                                                  fontSize: 15,
                                                  fontWeight: FontWeight.w500),
                                            ),

                                            const SizedBox(
                                              height: 10,
                                            ),

// Reference Images
                                            Column(children: [
                                              Row(
                                                  crossAxisAlignment:
                                                      CrossAxisAlignment.center,
                                                  mainAxisAlignment:
                                                      MainAxisAlignment.center,
                                                  children: [
                                                    getImage(
                                                        context,
                                                        questionAnswer.question
                                                            .urlReference01,
                                                        factor),
                                                    const SizedBox(
                                                      width: 10,
                                                    ),
                                                    getImage(
                                                        context,
                                                        questionAnswer.question
                                                            .urlReference02,
                                                        factor),
                                                    const SizedBox(
                                                      width: 10,
                                                    ),
                                                    getImage(
                                                        context,
                                                        questionAnswer.question
                                                            .urlReference03,
                                                        factor),
                                                  ])
                                            ]),
                                          ])
                                    : Container(),
                              ])
                            : Container(),

// Validate Button
                        !isReadonly &&
                                !questionAnswer.isFinished() &&
                                preSelectValueController.text.isNotEmpty
                            ? CustomButton(
                                questionRunButtonValidateTitle,
                                Icons.arrow_right_alt_rounded,
                                true,
                                Colors.white,
                                Colors.green, () {
                                String actualSelect =
                                    preSelectValueController.text;
                                if (actualSelect.isEmpty) {
                                  actualSelect = "0";
                                }

                                questionAnswerOneAnswerSelect(
                                    isOpen,
                                    questionAnswer,
                                    int.parse(actualSelect), () {
                                  onTap();
                                }, () {
                                  onRefresh();
                                });
                              })
                            : Container(),

// Next Button
                        !isReadonly && questionAnswer.isFinished() && isOpen
                            ? CustomButton(
                                questionRunButtonNextTitle,
                                Icons.arrow_right_alt_rounded,
                                true,
                                Colors.white,
                                Colors.green, () {
                                onTap();
                                onRefresh();
                              })
                            : Container()
                      ])))));
}

void questionAnswerOneAnswerPreSelect(int position,
    TextEditingController preSelectValueController, VoidCallback onRefresh) {
  preSelectValueController.text = position.toString();

  onRefresh();
}

void questionAnswerOneAnswerSelect(
    bool isOpen,
    QuestionAnswerModel questionAnswer,
    int position,
    VoidCallback onTap,
    VoidCallback onRefresh) {
  AnswerModel answer = questionAnswer.question.answers[position];

  questionAnswer.answer
    ..title = answer.title
    ..isCorrect = answer.isCorrect;

  if (!isOpen) {
    onTap();
    onRefresh();
  } else {
    onRefresh();
  }
}

Widget questionAnswerOneAnswer(
    BuildContext context,
    int position,
    AnswerModel answer,
    String label,
    String selectValue,
    TextEditingController preSelectValueController,
    VoidCallback onTap) {
  Color resultColor = Colors.blue;
  Color preSelectColor = Colors.transparent;

  if (selectValue.isNotEmpty) {
    if (answer.title.compareTo(selectValue) == 0) {
      if (answer.isCorrect) {
        resultColor = Colors.green;
      } else {
        resultColor = Colors.red;
      }
    } else {
      if (answer.isCorrect) {
        resultColor = Colors.green;
      }
    }
  }

  if (preSelectValueController.text.compareTo(position.toString()) == 0) {
    preSelectColor = Colors.grey[300]!;
  }

  return GestureDetector(
      onTap: onTap,
      child: Container(
          margin: const EdgeInsets.all(1),
          decoration: BoxDecoration(
            borderRadius: const BorderRadius.all(
              Radius.circular(25),
            ),
            color: preSelectColor,
          ),
          child: Padding(
              padding: const EdgeInsets.all(5),
              child: Column(
                children: [
                  const SizedBox(
                    height: 10,
                  ),
                  Row(
                    children: [
                      labelBuild(resultColor, label),
                      const SizedBox(
                        width: 10,
                      ),
                      SizedBox(
//                      width: 220,
                          width: displayWidth(context) - 150,
                          child: getStyledText(
                            answer.title,
                            500,
                            TextAlign.left,
                            const TextStyle(
                                color: Colors.black87,
                                fontSize: 15,
                                fontWeight: FontWeight.w500),
                          )),
                    ],
                  ),
                  const SizedBox(
                    height: 10,
                  )
                ],
              ))));
}

Widget labelBuild(Color color, String label) {
  return Container(
      margin: const EdgeInsets.all(1),
      decoration: BoxDecoration(
        borderRadius: const BorderRadius.all(
          Radius.circular(55),
        ),
        color: color,
      ),
      child: Container(
          color: color,
          margin: const EdgeInsets.all(10),
          child: SizedBox(
              height: 20,
              width: 20,
              child: Column(
                  crossAxisAlignment: CrossAxisAlignment.center,
                  mainAxisAlignment: MainAxisAlignment.center,
                  mainAxisSize: MainAxisSize.max,
                  children: [
                    Text(
                      label,
                      textAlign: TextAlign.center,
                      style: const TextStyle(
                          color: Colors.white,
                          fontSize: 15,
                          fontWeight: FontWeight.bold),
                    )
                  ]))));
}

Widget getStyledText(
    String data, int maxLines, TextAlign textAlign, TextStyle textStyle) {
  return StyledText(
    maxLines: maxLines,
    textAlign: textAlign,
    style: textStyle,
    text: data,
    tags: {
      'b': StyledTextTag(style: const TextStyle(fontWeight: FontWeight.bold)),
      'i': StyledTextTag(style: const TextStyle(fontStyle: FontStyle.italic)),
      'color_red': StyledTextTag(style: const TextStyle(color: Colors.red)),
      'color_blue': StyledTextTag(style: const TextStyle(color: Colors.blue)),
      'color_yellow':
          StyledTextTag(style: const TextStyle(color: Colors.yellow)),
      'color_green': StyledTextTag(style: const TextStyle(color: primaryColor)),
      'icon_alarm': StyledTextIconTag(Icons.alarm),
      'h1': StyledTextTag(style: const TextStyle(fontSize: 30)),
      'h2': StyledTextTag(style: const TextStyle(fontSize: 25)),
      'h3': StyledTextTag(style: const TextStyle(fontSize: 20)),
      'h4': StyledTextTag(style: const TextStyle(fontSize: 15)),
      'h5': StyledTextTag(style: const TextStyle(fontSize: 10)),
    },
  );
}

Widget getImage(BuildContext context, String url, double factor) {
  return url.isNotEmpty
      ? GestureDetector(
          onTap: () {
            Navigator.push<void>(
              context,
              MaterialPageRoute<void>(
                builder: (BuildContext context) => ImageFullView(url: url),
              ),
            );
          },
          child: ClipRRect(
              borderRadius: BorderRadius.circular(10),
              child: SizedBox(
                width: 130 * factor,
                height: 87 * factor,
                child: CachedNetworkImage(
                  imageUrl: url,
                  placeholder: (context, url) =>
                      const CircularProgressIndicator(),
                  errorWidget: (context, url, error) => const Icon(Icons.error),
                  fit: BoxFit.cover,
                ),
              )))
      : Container();
}
