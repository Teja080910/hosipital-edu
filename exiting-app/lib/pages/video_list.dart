import 'package:mdexam/models/video_category_model.dart';
import 'package:mdexam/pages/video_abm.dart';
import 'package:mdexam/models/video_model.dart';
import 'package:mdexam/variables/globalvar.dart';
import 'package:mdexam/widgets/application_bar.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
// ignore: import_of_legacy_library_into_null_safe
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';

// ignore: must_be_immutable
class VideoList extends StatefulWidget {
  const VideoList({Key? key}) : super(key: key);

  @override
  State<VideoList> createState() => VideoListState();
}

class VideoListState extends State<VideoList> {
  List<VideoModel> list = [];

  final _searchTextController = TextEditingController();

  @override
  void initState() {
    super.initState();

    loadVideosListView();
  }

  Future<void> loadVideosListView() async {
    try {
      list.clear();

      final firestoreInstance = FirebaseFirestore.instance;
      CollectionReference questions =
          firestoreInstance.collection(firebaseCustomVideoKey);

      if (_searchTextController.text.isEmpty) {
        questions
            .orderBy("creationTime", descending: true)
            .limit(30)
            .get()
            .then((querySnapshot) {
          for (var result in querySnapshot.docs) {
            setState(() {
              list.add(VideoModel.fromJSON(false, result.id, result.data()));
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
              list.add(VideoModel.fromJSON(false, result.id, result.data()));
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
    loadVideosListView();

    setState(() {});
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
        appBar: ApplicationBar(
          context: context,
          title: videoListTitle,
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
                        loadVideosListView();
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
               // VideoModel answer1 = VideoModel("", true);

                Navigator.push<void>(
                  context,
                  MaterialPageRoute<void>(
                    builder: (BuildContext context) => VideoABM(
                      videoListState: this,
                      isNew: true,
                      isModify: false,
                      videoModel: VideoModel(
                          false,
                          "",
                          VideoCategoryModel(
                              false, "", "", 0, DateTime.now().toUtc()),
                          "",
                          "",
                          "",
                          "",
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

  Widget buildListView(BuildContext context, List<VideoModel> list) {
    return ListView.builder(
        shrinkWrap: true,
        physics: const NeverScrollableScrollPhysics(),
        scrollDirection: Axis.vertical,
        itemCount: list.length,
        itemBuilder: (BuildContext context, int widgetIndex) {
          return oneItem(context, list, widgetIndex);
        });
  }

  Widget oneItem(BuildContext context, List<VideoModel> list, int index) {
    final VideoModel videoModel = list[index];

    return Container(
      margin: const EdgeInsets.all(5),
      width: MediaQuery.of(context).size.width,
      child: Card(
        child: ListTile(
          onTap: () {
            Navigator.push<void>(
              context,
              MaterialPageRoute<void>(
                builder: (BuildContext context) => VideoABM(
                    videoListState: this,
                    isNew: false,
                    isModify: true,
                    videoModel: videoModel),
              ),
            );
          },
          leading: const Icon(Icons.play_arrow),
          title: Text(
            videoModel.title,
            style: const TextStyle(fontSize: 16),
          ),
        ),
      ),
    );
  }
}

/*
void callDelete_old(BuildContext context, VideoListState questionListState,
    VideoModel questionModel) {
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

                  FirebaseCustomVideoHelper()
                      .setDelete(context: context, questionModel: questionModel)
                      .then((result) {
                    if (result == null) {
                      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
                        content: Text(
                          VideoABMModifyDelete,
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