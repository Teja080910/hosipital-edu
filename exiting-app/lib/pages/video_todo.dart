import 'dart:async';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:mdexam/models/video_category_model.dart';
import 'package:mdexam/models/video_model.dart';
import 'package:mdexam/pages/custom_web_view.dart';
import 'package:mdexam/pages/home.dart';
import 'package:mdexam/utils/general/abm.dart';
import 'package:mdexam/utils/general/reference_Page_State.dart';
import 'package:mdexam/widgets/application_bar.dart';
import 'package:flutter/material.dart';
import 'package:mdexam/variables/globalvar.dart';
import 'package:mdexam/utils/list_transforms/video_category_list_transforms.dart'
    // ignore: library_prefixes
    as videoCategoryTransforms;
import 'package:mdexam/utils/list_transforms/video_list_transforms.dart'
    // ignore: library_prefixes
    as videoTransforms;
import 'package:mdexam/widgets/drop_down_buttom_edit_format_value_change.dart';

// ignore: must_be_immutable
class VideoTodo extends StatefulWidget {
  HomePageState homePageState;
  bool isOpen;

  VideoTodo({Key? key, required this.homePageState, required this.isOpen})
      : super(key: key);

  @override
  State<VideoTodo> createState() => _VideoTodoState();
}

class _VideoTodoState extends State<VideoTodo> {
//  final _customTitleController = TextEditingController();
  final _categoryController = TextEditingController();
  final _maxVideoController = TextEditingController();
  final _maxTimeController = TextEditingController();

  final _formKey = GlobalKey<FormState>();

  // List<CategoryModel> selectCategorys = [];
//      CategoryModel(false, "", "", 0, DateTime.now());
  List<VideoCategoryModel> videoCategoryLists = [];
  List<VideoModel> videoLists = [];

  Future<bool> _onBackPressed() async {
    return abmOnBackPressed2(context, () {}, () {});
  }

  @override
  void initState() {
    _maxVideoController.text = "20";
    _maxTimeController.text = "25";

    loadVideoCategorys();

    super.initState();
  }

  void loadVideoCategorys() {
    try {
      final firestoreInstance = FirebaseFirestore.instance;

      // Customer Category
      videoCategoryLists.clear();

      CollectionReference categorys =
          firestoreInstance.collection(firebaseCustomVideoCategoryKey);

      categorys
          .limit(100)
          .orderBy("title", descending: false)
          .get()
          .then((querySnapshot) {
        for (var result in querySnapshot.docs) {
          setState(() {
            videoCategoryTransforms.uniquedAdd(videoCategoryLists,
                VideoCategoryModel.fromJSON(false, result.id, result.data()));
          });
        }
      });

      setState(() {});
    } on FirebaseAuthException catch (e) {
      e.stackTrace;
    }
  }

  void loadVideos(String categoryKey) {
    try {
      final firestoreInstance = FirebaseFirestore.instance;

      // Video
      videoLists.clear();

      CollectionReference videos =
          firestoreInstance.collection(firebaseCustomVideoKey);

      videos
          .where('category.id', isEqualTo: categoryKey)
          .limit(100)
          .orderBy("creationTime", descending: false)
          .get()
          .then((querySnapshot) {
        for (var result in querySnapshot.docs) {
          setState(() {
            videoTransforms.uniquedAdd(videoLists,
                VideoModel.fromJSON(false, result.id, result.data()));
          });
        }
      });

      setState(() {});
    } on FirebaseAuthException catch (e) {
      e.stackTrace;
    }
  }

  @override
  Widget build(BuildContext context) {
    return WillPopScope(
        onWillPop: _onBackPressed,
        child: Scaffold(
            appBar: ApplicationBar(
              context: context,
              title: widget.isOpen ? videoNewOpenTitle : videoNewClosedTitle,
              withShareButton: false,
            ),
            body: ListView(children: [
              Form(
                key: _formKey,
                child: Padding(
                  padding: const EdgeInsets.all(35.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
/* Video Categorys */
                      dropDownButtomEditFormatValueChanged(
                          QuestionTodoReferenceState(this),
                          context,
                          videoABMFieldCategoryTitle,
                          Icons.play_arrow_outlined,
                          videoCategoryTransforms.videoCategoryListToStringList(
                              videoCategoryLists),
                          _categoryController, (String value) {
                        VideoCategoryModel selectVideoCategoryModel =
                            videoCategoryTransforms
                                .videoCategoryStringTovideoCategoryModel(
                                    videoCategoryLists, value);
                        loadVideos(selectVideoCategoryModel.key);
                      }),

/* Video View */
                      buildListView(context, videoLists),
                    ],
                  ),
                ),
              ),
            ])));
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

    return GestureDetector(
      onTap: () {
        Navigator.push<void>(
            context,
            MaterialPageRoute<void>(
                builder: (BuildContext context) => CustomWebView(
                      title: videoModel.title,
                      url: videoModel.url,
                    )));
      },
      child: Column(
        children: [
          const SizedBox(
            height: 5,
          ),
          Container(
            margin: const EdgeInsets.all(5),
            width: 250, // Establece un ancho fijo del contenedor
            height: 150, // Establece una altura fija  del contenedor
            child: Stack(
              alignment: Alignment.center,
              children: [
                ClipRRect(
                  borderRadius: BorderRadius.circular(17),
                  child: CachedNetworkImage(
                    imageUrl: videoModel.urlPreview,
                    width: 250, // Establece un ancho fijo de la imagen
                    height: 150, // Establece una altura fija de la imagen
                    placeholder: (context, url) =>
                        const CircularProgressIndicator(),
                    errorWidget: (context, url, error) =>
                        const Icon(Icons.error),
                    fit: BoxFit.cover,
                  ),
                ),
                const Icon(
                  Icons.play_arrow,
                  color: Colors.white,
                  size: 50,
                ),
              ],
            ),
          ),
          Align(
            alignment: Alignment.center,
            child: Padding(
              padding: const EdgeInsets.only(left: 10.0),
              child: Text(
                videoModel.title,
                style: const TextStyle(
                  fontSize: 16,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class QuestionTodoReferenceState extends ReferencePageState {
  _VideoTodoState videoTodoState;

  QuestionTodoReferenceState(this.videoTodoState);

  @override
  void setStates() {
    // ignore: invalid_use_of_protected_member
    videoTodoState.setState(() {});
  }
}
