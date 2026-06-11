import 'package:mdexam/models/flashcard_answer_model.dart';
import 'package:mdexam/models/flashcard_category_model.dart';
import 'package:mdexam/models/flashcard_question_model.dart';
import 'package:mdexam/pages/flashcard_question_abm.dart';
import 'package:mdexam/variables/globalvar.dart';
import 'package:mdexam/widgets/application_bar.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
// ignore: import_of_legacy_library_into_null_safe
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';

// ignore: must_be_immutable
class FlashcardQuestionList extends StatefulWidget {
  const FlashcardQuestionList({Key? key}) : super(key: key);

  @override
  State<FlashcardQuestionList> createState() => FlashcardQuestionListState();
}

class FlashcardQuestionListState extends State<FlashcardQuestionList> {
  List<FlashcardQuestionModel> list = [];

  final _searchTextController = TextEditingController();

  @override
  void initState() {
    super.initState();

    loadFlashcardQuestionsListView();
  }

  Future<void> loadFlashcardQuestionsListView() async {
    try {
      list.clear();

      final firestoreInstance = FirebaseFirestore.instance;
      CollectionReference questions =
          firestoreInstance.collection(firebaseCustomFlashcardQuestionKey);

      if (_searchTextController.text.isEmpty) {
        questions
            .orderBy("creationTime", descending: true)
            .limit(30)
            .get()
            .then((querySnapshot) {
          for (var result in querySnapshot.docs) {
            setState(() {
              list.add(FlashcardQuestionModel.fromJSON(false, result.id, result.data()));
            });
          }
        });
      } else {
        questions
            .where("arraySearch",
                arrayContains: _searchTextController.text.toLowerCase())
            .orderBy("creationTime", descending: true)
            .limit(30)
            .get()
            .then((querySnapshot) {
          for (var result in querySnapshot.docs) {
            setState(() {
              list.add(FlashcardQuestionModel.fromJSON(false, result.id, result.data()));
            });
          }
        });
      }

      setState(() {});
    } on FirebaseAuthException catch (e) {
      e.stackTrace;
    }
  }

  void refreshList() {
    loadFlashcardQuestionsListView();

    setState(() {});
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
        appBar: ApplicationBar(
          context: context,
          title: flashcardQuestionListTitle,
          withShareButton: false,
        ),
        body: RefreshIndicator(
            key: const Key("refreshKey"),
            onRefresh: () async {
              refreshList();
            },
            child: ListView(children: [
              buildAddButtom(),
              Padding(
                  padding: const EdgeInsets.all(5),
                  child: TextField(
                      controller: _searchTextController,
                      textInputAction: TextInputAction.go,
                      onSubmitted: (String value) {
                        loadFlashcardQuestionsListView();
                      },
                      decoration: const InputDecoration(
                          contentPadding: EdgeInsets.all(5),
                          prefixIconConstraints:
                              BoxConstraints(maxWidth: 60, minWidth: 60),
                          prefixIcon: Icon(Icons.search_rounded, size: 30),
                          suffixIconConstraints:
                              BoxConstraints(maxWidth: 60, minWidth: 60),
                          hintText: filterSearchTextHintText,
                          labelText: filterSearchTextHintText,
                          alignLabelWithHint: true,
                          labelStyle: TextStyle(fontSize: 18),
                          filled: true,
                          enabledBorder: OutlineInputBorder(
                              borderSide: BorderSide(
                                  width: 1,
                                  color: Colors.grey,
                                  style: BorderStyle.solid),
                              borderRadius:
                                  BorderRadius.all(Radius.circular(30))),
                          focusedBorder: OutlineInputBorder(
                              borderSide: BorderSide(
                                  width: 1,
                                  color: Colors.grey,
                                  style: BorderStyle.solid),
                              borderRadius:
                                  BorderRadius.all(Radius.circular(40)))))),
              buildListView(context, list),
            ])));
  }

  Widget buildAddButtom() {
    return Column(children: <Widget>[
      Container(
          width: MediaQuery.of(context).size.width,
          alignment: Alignment.topRight,
          child: Padding(
            padding: const EdgeInsets.all(16.0),
            child: FloatingActionButton(
              child: const Icon(Icons.add),
              onPressed: () {
                FlashcardAnswerModel answer1 = FlashcardAnswerModel("", true);

                Navigator.push<void>(
                  context,
                  MaterialPageRoute<void>(
                    builder: (BuildContext context) => FlashcardQuestionABM(
                      questionListState: this,
                      isNew: true,
                      isModify: false,
                      questionModel: FlashcardQuestionModel(
                          false,
                          "",
                          FlashcardCategoryModel(
                              false, "", "", 0, DateTime.now().toUtc()),
                          "",
                          "",
                          "",
                          [answer1],
                          true,
                          DateTime.now()),
                    ),
                  ),
                );
              },
            ),
          )),
    ]);
  }

  Widget buildListView(BuildContext context, List<FlashcardQuestionModel> list) {
    return ListView.builder(
        shrinkWrap: true,
        physics: const NeverScrollableScrollPhysics(),
        scrollDirection: Axis.vertical,
        itemCount: list.length,
        itemBuilder: (BuildContext context, int widgetIndex) {
          return oneItem(context, list, widgetIndex);
        });
  }

  Widget oneItem(BuildContext context, List<FlashcardQuestionModel> list, int index) {
    final FlashcardQuestionModel questionModel = list[index];

    return Container(
      margin: const EdgeInsets.all(5),
      width: MediaQuery.of(context).size.width,
      child: Card(
        child: ListTile(
          onTap: () {
            Navigator.push<void>(
              context,
              MaterialPageRoute<void>(
                builder: (BuildContext context) => FlashcardQuestionABM(
                    questionListState: this,
                    isNew: false,
                    isModify: true,
                    questionModel: questionModel),
              ),
            );
          },
          leading: const Icon(Icons.flash_on_outlined),
          title: Text(
            questionModel.title,
            style: const TextStyle(fontSize: 16),
          ),
        ),
      ),
    );
  }
}

/*
void callDelete_old(BuildContext context, FlashcardQuestionListState questionListState,
    FlashcardQuestionModel questionModel) {
  showDialog(
    context: context,
    builder: (context) => AlertDialog(
      title: const Text(abmDeleteAlertTitle),
      content: const Text(abmDeleteAlertContent),
      actions: <Widget>[
        Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: <Widget>[
              const SizedBox(height: 50),
              GestureDetector(
                onTap: () {
                  Navigator.of(context).pop(true);

                  FirebaseCustomFlashcardQuestionHelper()
                      .setDelete(context: context, questionModel: questionModel)
                      .then((result) {
                    if (result == null) {
                      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
                        content: Text(
                          flashcardQuestionABMModifyDelete,
                          style: TextStyle(fontSize: 16),
                        ),
                      ));

                      // ignore: unnecessary_null_comparison
                      if (questionListState != null) {
                        questionListState.refreshList();
                      }
//                      Navigator.of(context).pop();
                    } else {
                      ScaffoldMessenger.of(context).showSnackBar(SnackBar(
                        content: Text(
                          result,
                          style: const TextStyle(fontSize: 16),
                        ),
                      ));
                    }
                  });
                },
                child: const Text(abmDeleteAlertPressedYes),
              ),
              const SizedBox(height: 50),
              GestureDetector(
                onTap: () => Navigator.of(context).pop(false),
                child: const Text(abmDeleteAlertPressedNo),
              ),
              const SizedBox(height: 50),
            ])
      ],
    ),
  );
}
*/