import 'package:mdexam/models/flashcard_question_answer_model.dart';
import 'package:mdexam/models/user_flashcard_exam_model.dart';
import 'package:mdexam/utils/general/sizes_helpers.dart';
import 'package:mdexam/widgets/application_bar.dart';
import 'package:flutter/material.dart';
import 'package:mdexam/widgets/flashcard_question_answer_build.dart';

// ignore: must_be_immutable
class FlashcardQuestionReport extends StatefulWidget {
  UserFlashcardExamModel userExam;

  FlashcardQuestionReport({Key? key, required this.userExam}) : super(key: key);

  @override
  State<FlashcardQuestionReport> createState() => _FlashcardQuestionReportState();
}

class _FlashcardQuestionReportState extends State<FlashcardQuestionReport> {
  final TextEditingController _preSelectValueController =
      TextEditingController();

  void refreshList() {
    setState(() {});
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
        appBar: ApplicationBar(
          context: context,
          title: widget.userExam.title(),
          withShareButton: false,
        ),
        body: RefreshIndicator(
            key: const Key("refreshKey"),
            onRefresh: () async {
              refreshList();
            },
            child: ListView(children: [
              buildListView(context, widget.userExam.questionAnswers,
                  _preSelectValueController, factor(context))
            ])));
  }

  Widget buildListView(BuildContext context, List<FlashcardQuestionAnswerModel> list,
      TextEditingController preSelectValueController, double factor) {
    if (list.isNotEmpty) {
      return ListView.builder(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          scrollDirection: Axis.vertical,
          itemCount: list.length,
          itemBuilder: (BuildContext context, int widgetIndex) {
            return Padding(
              padding: const EdgeInsets.all(10),
              child: onlyItem(
                  context, list, widgetIndex, preSelectValueController, factor),
            );
          });
    } else {
      return Container();
    }
  }

  Widget onlyItem(BuildContext context, List<FlashcardQuestionAnswerModel> list,
      int widgetIndex, TextEditingController preSelectValueController, double factor) {
    final FlashcardQuestionAnswerModel questionAnswerModel = list[widgetIndex];

    return flashcardQuestionAnswerBuild(context, true, true, widgetIndex,
        questionAnswerModel, preSelectValueController,factor, () {}, () {});
  }
}
