import 'package:mdexam/models/question_answer_model.dart';
import 'package:mdexam/models/user_exam_model.dart';
import 'package:mdexam/utils/general/sizes_helpers.dart';
import 'package:mdexam/widgets/application_bar.dart';
import 'package:flutter/material.dart';
import 'package:mdexam/widgets/question_answer_build.dart';

// ignore: must_be_immutable
class QuestionReport extends StatefulWidget {
  UserExamModel userExam;

  QuestionReport({Key? key, required this.userExam}) : super(key: key);

  @override
  State<QuestionReport> createState() => _QuestionReportState();
}

class _QuestionReportState extends State<QuestionReport> {
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
              Padding(
                  padding: const EdgeInsets.all(20),
                  child: Text(
                    widget.userExam.qualificationTitle(),
                    maxLines: 1,
                    textAlign: TextAlign.left,
                    style: const TextStyle(
                        color: Colors.black87,
                        fontSize: 15,
                        fontWeight: FontWeight.w500),
                  )),
              const SizedBox(
                height: 20,
              ),
              buildListView(context, widget.userExam.questionAnswers,
                  _preSelectValueController, factor(context))
            ])));
  }

  Widget buildListView(BuildContext context, List<QuestionAnswerModel> list,
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

  Widget onlyItem(BuildContext context, List<QuestionAnswerModel> list,
      int widgetIndex, TextEditingController preSelectValueController, double factor) {
    final QuestionAnswerModel questionAnswerModel = list[widgetIndex];

    return questionAnswerBuild(context, true, true, widgetIndex,
        questionAnswerModel, preSelectValueController,factor, () {}, () {});
  }
}
