import 'package:mdexam/models/user_flashcard_exam_model.dart';
import 'package:mdexam/pages/flashcard_question_report.dart';
import 'package:mdexam/variables/globalvar.dart';
import 'package:mdexam/widgets/application_bar.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';

// ignore: must_be_immutable
class CustomerFlashcardMyExamList extends StatefulWidget {
  String loginUsername;

  CustomerFlashcardMyExamList({Key? key, required this.loginUsername})
      : super(key: key);

  @override
  State<CustomerFlashcardMyExamList> createState() => CustomerMyExamListState();
}

class CustomerMyExamListState extends State<CustomerFlashcardMyExamList> {
  List<UserFlashcardExamModel> list = [];

  bool isFinishLoad = false;

  @override
  void initState() {
    super.initState();

    loadFlashcardMyExamListView();
  }

  Future<void> loadFlashcardMyExamListView() async {
    try {
      list.clear();

      final firestoreInstance = FirebaseFirestore.instance;
      CollectionReference flashcardMyExams =
          firestoreInstance.collection(firebaseCustomUserFlashcardExamKey);

      flashcardMyExams
          .where("username", isEqualTo: widget.loginUsername)
          .orderBy("creationTime", descending: true)
          .limit(30)
          .get()
          .then((querySnapshot) {
        for (var result in querySnapshot.docs) {
          setState(() {
            list.add(UserFlashcardExamModel.fromJSON(
                false, result.id, result.data()));
          });
        }

        isFinishLoad = true;
      });

      setState(() {});
    } on FirebaseAuthException catch (e) {
      e.stackTrace;
    }
  }

  void refreshList() {
    loadFlashcardMyExamListView();

    setState(() {});
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
        appBar: ApplicationBar(
          context: context,
          title: menuProfilerCustomerFlashcardMyExamsTitle,
          withShareButton: false,
        ),
        body: RefreshIndicator(
            key: const Key("refreshKey"),
            onRefresh: () async {
              refreshList();
            },
            child: ListView(children: [
              const SizedBox(
                height: 20,
              ),
              buildListView(context, list)
            ])));
  }

  Widget buildListView(
      BuildContext context, List<UserFlashcardExamModel> list) {
    if (list.isNotEmpty) {
      return ListView.builder(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          scrollDirection: Axis.vertical,
          itemCount: list.length,
          itemBuilder: (BuildContext context, int widgetIndex) {
            return Padding(
              padding: const EdgeInsets.all(10),
              child: onlyItem(context, list, widgetIndex),
            );
          });
    } else {
      return Container();
    }
  }

  Widget onlyItem(BuildContext context, List<UserFlashcardExamModel> list,
      int widgetIndex) {
    final UserFlashcardExamModel userExamModel = list[widgetIndex];

    return GestureDetector(
        onTap: () {
//          Navigator.pop(context);

          Navigator.push<void>(
            context,
            MaterialPageRoute<void>(
              builder: (BuildContext context) =>
                  FlashcardQuestionReport(userExam: userExamModel),
            ),
          );
        },
        child: Column(
          children: [
            Row(
              children: [
                const Icon(Icons.flash_on_outlined, size: 30),
                Text(userExamModel.title(),
                    style: const TextStyle(
                        fontSize: 20, fontWeight: FontWeight.bold)),
                const SizedBox(
                  width: 15,
                ),
              ],
            ),
          ],
        ));
  }
}
