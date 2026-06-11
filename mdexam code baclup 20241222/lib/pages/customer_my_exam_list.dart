import 'package:mdexam/models/user_exam_model.dart';
import 'package:mdexam/pages/question_report.dart';
import 'package:mdexam/variables/globalvar.dart';
import 'package:mdexam/widgets/application_bar.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';

// ignore: must_be_immutable
class CustomerMyExamList extends StatefulWidget {
  String loginUsername;

  CustomerMyExamList({Key? key, required this.loginUsername}) : super(key: key);

  @override
  State<CustomerMyExamList> createState() => CustomerMyExamListState();
}

class CustomerMyExamListState extends State<CustomerMyExamList> {
  List<UserExamModel> list = [];

  bool isFinishLoad = false;

  @override
  void initState() {
    super.initState();

    loadMyExamListView();
  }

  Future<void> loadMyExamListView() async {
    try {
      list.clear();

      final firestoreInstance = FirebaseFirestore.instance;
      CollectionReference myExams =
          firestoreInstance.collection(firebaseCustomUserExamKey);

      myExams
          .where("username", isEqualTo: widget.loginUsername)
          .orderBy("creationTime", descending: true)
          .limit(30)
          .get()
          .then((querySnapshot) {
        for (var result in querySnapshot.docs) {
          setState(() {
            list.add(UserExamModel.fromJSON(false, result.id, result.data()));
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
    loadMyExamListView();

    setState(() {});
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
        appBar: ApplicationBar(
          context: context,
          title: menuProfilerCustomerMyExamsTitle,
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

  Widget buildListView(BuildContext context, List<UserExamModel> list) {
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

  Widget onlyItem(
      BuildContext context, List<UserExamModel> list, int widgetIndex) {
    final UserExamModel userExamModel = list[widgetIndex];

    return GestureDetector(
        onTap: () {
//          Navigator.pop(context);

          Navigator.push<void>(
            context,
            MaterialPageRoute<void>(
              builder: (BuildContext context) =>
                  QuestionReport(userExam: userExamModel),
            ),
          );
        },
        child: Column(
          children: [
            Row(
              children: [
                const Icon(Icons.history_edu_outlined, size: 30),
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
