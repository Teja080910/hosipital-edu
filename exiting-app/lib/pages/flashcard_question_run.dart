import 'dart:async';
import 'package:flutter/material.dart';
import 'package:mdexam/models/user_flashcard_exam_model.dart';
import 'package:mdexam/pages/home.dart';
import 'package:mdexam/pages/flashcard_question_report.dart';
import 'package:mdexam/utils/firebase/firebase_custom_user_flashcard_exam.dart';
import 'package:mdexam/utils/general/abm.dart';
import 'package:mdexam/utils/general/clock_timer.dart';
import 'package:mdexam/utils/general/sizes_helpers.dart';
import 'package:mdexam/variables/globalvar.dart';
import 'package:mdexam/widgets/application_bar.dart';
import 'package:mdexam/widgets/flashcard_question_answer_build.dart';

// ignore: must_be_immutable
class FlashcardQuestionRun extends StatefulWidget {
  HomePageState homePageState;
  String keyUserExam;
  UserFlashcardExamModel userExam;

  FlashcardQuestionRun(
      {Key? key,
      required this.homePageState,
      required this.keyUserExam,
      required this.userExam})
      : super(key: key);

  @override
  State<FlashcardQuestionRun> createState() => _FlashcardQuestionRunState();
}

class _FlashcardQuestionRunState extends State<FlashcardQuestionRun> {
  final _formKey = GlobalKey<FormState>();

  int currentQuestion = -1;

  late ClockTimer clockTimer;

  final List<TextEditingController> _preSelectValueController =
      List.generate(1000, (i) => TextEditingController());

  Future<bool> _onBackPressed() async {
    return abmOnBackPressed2(context, () {
      clockTimer.stop();
    }, () {});
  }

  @override
  void initState() {
    clockTimer = ClockTimer(1, true, () {
      setStates();
    });

    if (!widget.userExam.isFinished()) {
      currentQuestion = widget.userExam.nextQuestion();
    }

    clockTimer.start();

    super.initState();
  }

  void setStates() {
    setState(() {});
  }

  @override
  Widget build(BuildContext context) {
    return WillPopScope(
        onWillPop: _onBackPressed,
        child: Scaffold(
            appBar: ApplicationBar(
              context: context,
              title: widget.userExam.title(),
              withShareButton: false,
            ),
            body: ListView(children: [
              Form(
                key: _formKey,
                child: Padding(
                  padding: const EdgeInsets.all(20.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
/* Flashcard Categorys */
                          Text(widget.userExam.categoryTitles(),
                              maxLines: 1,
                              style: const TextStyle(
                                color: Colors.black,
                                fontSize: 15,
                                fontWeight: FontWeight.normal,
                              )),
                          const SizedBox(
                            height: 15,
                          ),

/* Question */
                          currentQuestion >= 0
                              ? Text(
                                  (currentQuestion + 1).toString() +
                                      "/" +
                                      widget.userExam.maxQuestions.toString(),
                                  maxLines: 1,
                                  style: const TextStyle(
                                    fontStyle: FontStyle.italic,
                                    color: Colors.black,
                                    fontSize: 15,
                                    fontWeight: FontWeight.w800,
                                  ))
                              : Container(),
                          const SizedBox(
                            height: 5,
                          ),

/* Time */
                          widget.userExam.isShowTimeCounter
                              ? Row(
                                  children: [
                                    const Text(questionRunTimeTitle,
                                        maxLines: 1,
                                        style: TextStyle(
                                          color: Colors.black,
                                          fontSize: 15,
                                          fontWeight: FontWeight.normal,
                                        )),
                                    const SizedBox(
                                      height: 5,
                                    ),
                                    hourMinutesSecondRounder()
                                  ],
                                )
                              : Container(),

/* Flashcard Question Answer */
                          currentQuestion >= 0
                              ? flashcardQuestionAnswerBuild(
                                  context,
                                  widget.userExam.isOpen,
                                  false,
                                  -1,
                                  widget.userExam.questionAnswers[
                                      currentQuestion >= 0
                                          ? currentQuestion
                                          : 0],
                                  _preSelectValueController[currentQuestion >= 0
                                      ? currentQuestion
                                      : 0],
                                  factor(context), () {
                                  currentQuestion =
                                      widget.userExam.nextQuestion();

                                  save();
                                }, () {
                                  setStates();
                                })
                              : Container()
                        ],
                      )
                    ],
                  ),
                ),
              ),
            ])));
  }

  String getHourMinutesSecond(DateTime datetime) {
    if (DateTime.now().toUtc().isAfter(datetime)) {
      return "--:--:--";
    } else {
      Duration duration = datetime.difference(DateTime.now().toUtc());

      int seconds = duration.inSeconds + 1;

      double hour = (seconds / (60 * 60)).truncateToDouble();
      seconds -= (int.parse(hour.toString()).toInt() * (60 * 60));

      double minutes = (seconds / 60).truncateToDouble();
      seconds -= (int.parse(minutes.toString()).toInt() * 60);

      return getHourMinuteSecondFormat(int.parse(hour.toString())) +
          ":" +
          getHourMinuteSecondFormat(int.parse(minutes.toString())) +
          ":" +
          getHourMinuteSecondFormat(seconds);
    }
  }

  String getHourMinuteSecondFormat(int value) {
    if (value < 10) {
      return "0" + value.toString();
    } else {
      return value.toString();
    }
  }

  Widget hourMinutesSecondRounder() {
    return Container(
        margin: const EdgeInsets.all(10),
        decoration: const BoxDecoration(
          borderRadius: BorderRadius.all(
            Radius.circular(10),
          ),
          color: Colors.blue,
        ),
        child: Container(
            margin: const EdgeInsets.all(1),
            decoration: const BoxDecoration(
              borderRadius: BorderRadius.all(
                Radius.circular(10),
              ),
              color: Colors.blue,
            ),
            child: Container(
                color: Colors.blue,
                margin:
                    const EdgeInsets.only(left: 5, right: 5, top: 2, bottom: 2),
                child: SizedBox(
                    height: 25,
                    width: 80,
                    child: Column(
                        crossAxisAlignment: CrossAxisAlignment.center,
                        mainAxisAlignment: MainAxisAlignment.center,
                        mainAxisSize: MainAxisSize.max,
                        children: [
                          Text(
                            getHourMinutesSecond(widget.userExam.endTime),
                            textAlign: TextAlign.center,
                            style: const TextStyle(
                                color: Colors.white,
                                fontSize: 15,
                                fontWeight: FontWeight.w500),
                          )
                        ])))));
  }

  void save() async {
    try {
      if (widget.userExam.key.isNotEmpty) {
        FirebaseCustomUserFlashcardExamHelper()
            .update(context: context, userExamModel: widget.userExam)
            .then((result) {
          if (result == null) {
            if (widget.userExam.isFinished()) {
              clockTimer.stop();

              Navigator.pop(context);

              Navigator.push<void>(
                context,
                MaterialPageRoute<void>(
                  builder: (BuildContext context) =>
                      FlashcardQuestionReport(userExam: widget.userExam),
                ),
              );
            }
          } else {
            ScaffoldMessenger.of(context).showSnackBar(SnackBar(
              content: Text(
                result,
                style: const TextStyle(fontSize: 16),
              ),
            ));
          }
        });
      }
    } catch (errorValue) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(
        content: Text(
          errorValue.toString(),
          style: const TextStyle(fontSize: 16),
        ),
      ));
    }
  }
}
