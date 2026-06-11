import 'package:mdexam/models/flashcard_category_model.dart';
import 'package:mdexam/pages/flashcard_category_abm.dart';
import 'package:mdexam/variables/globalvar.dart';
import 'package:mdexam/widgets/application_bar.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
// ignore: import_of_legacy_library_into_null_safe
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';

// ignore: must_be_immutable
class FlashcardCategoryList extends StatefulWidget {
  const FlashcardCategoryList({Key? key}) : super(key: key);

  @override
  State<FlashcardCategoryList> createState() => FlashcardCategoryListState();
}

class FlashcardCategoryListState extends State<FlashcardCategoryList> {
  List<FlashcardCategoryModel> list = [];

  @override
  void initState() {
    super.initState();

    loadFlashcardCategorysListView();
  }

  Future<void> loadFlashcardCategorysListView() async {
    try {
      list.clear();

      final firestoreInstance = FirebaseFirestore.instance;
      CollectionReference categorys =
          firestoreInstance.collection(firebaseCustomFlashcardCategoryKey);

      categorys.orderBy("title", descending: true).get().then((querySnapshot) {
        for (var result in querySnapshot.docs) {
          setState(() {
            list.add(FlashcardCategoryModel.fromJSON(false, result.id, result.data()));
          });
        }
      });

      setState(() {});
    } on FirebaseAuthException catch (e) {
      e.stackTrace;
    }
  }

  void refreshList() {
    loadFlashcardCategorysListView();

    setState(() {});
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
        appBar: ApplicationBar(
          context: context,
          title: flashcardCategoryListTitle,
          withShareButton: false,
        ),
        body: RefreshIndicator(
            key: const Key("refreshKey"),
            onRefresh: () async {
              refreshList();
            },
            child: ListView(children: [
              buildAddButtom(),
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
                Navigator.push<void>(
                  context,
                  MaterialPageRoute<void>(
                    builder: (BuildContext context) => FlashcardCategoryABM(
                      categoryListState: this,
                      isNew: true,
                      isModify: false,
                      categoryModel:
                          FlashcardCategoryModel(false, "", "", 0, DateTime.now()),
                    ),
                  ),
                );
              },
            ),
          )),
    ]);
  }

  Widget buildListView(BuildContext context, List<FlashcardCategoryModel> list) {
    return ListView.builder(
        shrinkWrap: true,
           physics: const NeverScrollableScrollPhysics(),
        scrollDirection: Axis.vertical,
        itemCount: list.length,
        itemBuilder: (BuildContext context, int widgetIndex) {
          return oneItem(context, list, widgetIndex);
        });
  }

  Widget oneItem(BuildContext context, List<FlashcardCategoryModel> list, int index) {
    final FlashcardCategoryModel categoryModel = list[index];

    return Container(
      margin: const EdgeInsets.all(5),
      width: MediaQuery.of(context).size.width,
      child: Card(
        child: ListTile(
          onTap: () {
            Navigator.push<void>(
              context,
              MaterialPageRoute<void>(
                builder: (BuildContext context) => FlashcardCategoryABM(
                    categoryListState: this,
                    isNew: false,
                    isModify: true,
                    categoryModel: categoryModel),
              ),
            );
          },
          leading: const Icon(Icons.flash_on_outlined),
          title: Text(
            categoryModel.title,
            style: const TextStyle(fontSize: 16),
          ),
        ),
      ),
    );
  }
}
