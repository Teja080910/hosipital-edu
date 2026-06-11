import 'package:flutter/material.dart';
import 'package:mdexam/models/flashcard_answer_model.dart';
import 'package:mdexam/models/flashcard_question_answer_model.dart';
import 'package:mdexam/utils/general/custom_button.dart';
import 'package:mdexam/utils/general/horizontal_line.dart';
import 'package:mdexam/utils/general/sizes_helpers.dart';
import 'package:mdexam/variables/globalvar.dart';
import 'package:styled_text/styled_text.dart';

Widget flashcardQuestionAnswerBuild(
    BuildContext context,
    bool isOpen,
    bool isReadonly,
    int currentQuestion,
    FlashcardQuestionAnswerModel questionAnswer,
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

                        horizontalLine(Colors.grey, displayWidth(context) - 80),
                        const SizedBox(
                          height: 20,
                        ),

/*
// Questions
                        !isReadonly && !questionAnswer.isFinished()
                            ? Column(children: [
                                questionAnswer.question.answers.isNotEmpty
                                    ? questionAnswer.question.answers[0].title
                                            .isNotEmpty
                                        ? flashcardQuestionAnswerOneAnswer(
                                            context,
                                            0,
                                            questionAnswer.question.answers[0],
                                            "",
                                            "",
                                            preSelectValueController, () {
                                            flashcardQuestionAnswerOneAnswerPreSelect(
                                                0, preSelectValueController,
                                                () {
                                              onRefresh();
                                            });
                                          })
                                        : Container()
                                    : Container(),
                              ])
                            : Container(),
*/

// Validate Button
                        !isReadonly &&
                                !questionAnswer.isFinished() &&
                                preSelectValueController.text.isEmpty
                            ? CustomButton(
                                flashcardQuestionRunButtonValidateTitle,
                                Icons.arrow_right_alt_rounded,
                                true,
                                Colors.white,
                                Colors.green, () {
                                String actualSelect =
                                    preSelectValueController.text;
                                if (actualSelect.isEmpty) {
                                  actualSelect = "0";
                                }

                                flashcardQuestionAnswerOneAnswerSelect(
                                    isOpen,
                                    questionAnswer,
                                    int.parse(actualSelect), () {
                                  onTap();
                                }, () {
                                  onRefresh();
                                });
                              })
                            : Container(),

// Results
                        questionAnswer.isFinished() && isOpen
                            ? Column(children: [
                                questionAnswer.question.answers.isNotEmpty
                                    ? questionAnswer.question.answers[0].title
                                            .isNotEmpty
                                        ? flashcardQuestionAnswerOneAnswer(
                                            context,
                                            -1,
                                            questionAnswer.question.answers[0],
                                            "",
                                            questionAnswer.answer.title,
                                            preSelectValueController,
                                            () {})
                                        : Container()
                                    : Container(),

                                const SizedBox(
                                  height: 10,
                                ),

// Next Button
                                !isReadonly &&
                                        questionAnswer.isFinished() &&
                                        isOpen
                                    ? CustomButton(
                                        flashcardQuestionRunButtonNextTitle,
                                        Icons.arrow_right_alt_rounded,
                                        true,
                                        Colors.white,
                                        Colors.green, () {
                                        onTap();
                                        onRefresh();
                                      })
                                    : Container()
                              ])
                            : Container(),
                      ])))));
}

void flashcardQuestionAnswerOneAnswerPreSelect(int position,
    TextEditingController preSelectValueController, VoidCallback onRefresh) {
  preSelectValueController.text = position.toString();

  onRefresh();
}

void flashcardQuestionAnswerOneAnswerSelect(
    bool isOpen,
    FlashcardQuestionAnswerModel questionAnswer,
    int position,
    VoidCallback onTap,
    VoidCallback onRefresh) {
  FlashcardAnswerModel answer = questionAnswer.question.answers[position];

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

Widget flashcardQuestionAnswerOneAnswer(
    BuildContext context,
    int position,
    FlashcardAnswerModel answer,
    String label,
    String selectValue,
    TextEditingController preSelectValueController,
    VoidCallback onTap) {
  Color resultColor = Colors.blue;
  Color preSelectColor = Colors.transparent;

/*
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
 
*/

  resultColor = Colors.green;

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
