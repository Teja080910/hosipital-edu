// ignore_for_file: unnecessary_null_comparison

import 'package:mdexam/models/video_category_model.dart';
import 'package:mdexam/pages/video_category_list.dart';
import 'package:mdexam/utils/firebase/firebase_custom_video_category.dart';
import 'package:mdexam/widgets/application_bar.dart';
import 'package:mdexam/utils/general/abm.dart';
import 'package:mdexam/utils/general/reference_Page_State.dart';
import 'package:flutter/material.dart';
import 'package:mdexam/variables/globalvar.dart';

// ignore: must_be_immutable
class VideoCategoryABM extends StatefulWidget {
  VideoCategoryListState categoryListState;
  final bool isNew;
  bool isModify;
  VideoCategoryModel categoryModel;

  VideoCategoryABM({
    Key? key,
    required this.categoryListState,
    required this.isNew,
    required this.isModify,
    required this.categoryModel,
  }) : super(key: key);

  @override
  State<VideoCategoryABM> createState() => _VideoCategoryABMState();
}

class _VideoCategoryABMState extends State<VideoCategoryABM> {
  final _titleController = TextEditingController();

  final _formKey = GlobalKey<FormState>();

  Future<bool> _onBackPressed() async {
    return abmOnBackPressed2(context, () {}, () {});
  }

  @override
  void initState() {
    if (widget.isModify) {
      _titleController.text = widget.categoryModel.title;
    }

    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    return WillPopScope(
        onWillPop: _onBackPressed,
        child: Scaffold(
            appBar: ApplicationBar(
              context: context,
              title: videoCategoryABMTitle,
              withShareButton: false,
            ),
            body: ListView(children: [
              Form(
                  key: _formKey,
                  child: Padding(
                      padding: const EdgeInsets.all(15.0),
                      child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
/* Title */
                            TextFormField(
                              decoration: const InputDecoration(
                                icon: Icon(Icons.title_rounded),
                                hintText: videoCategoryABMFieldTitleHint,
                                labelText: videoCategoryABMFieldTitleLabel,
                              ),
                              controller: _titleController,
                              validator: (value) {
                                if (value == null || value.isEmpty) {
                                  return videoCategoryABMFieldTitleError;
                                }
                                return null;
                              },
                              onChanged: (value) {
                                widget.categoryModel.title = value;
                              },
                            ),
                            const SizedBox(
                              height: 20,
                            ),
/* Finish */
                            Row(children: [
                              Padding(
                                padding: const EdgeInsets.only(
                                    left: 16, top: 40, bottom: 20),
                                child: Center(
                                  child: ElevatedButton(
                                    style: ElevatedButton.styleFrom(
                                        backgroundColor: Colors.green,
                                        padding: const EdgeInsets.symmetric(
                                            horizontal: 20, vertical: 9),
                                        textStyle: const TextStyle(
                                            fontSize: 16,
                                            fontWeight: FontWeight.normal)),
                                    onPressed: () async {
                                      if (_formKey.currentState!.validate()) {
/* Video Category New */
                                        if (widget.isNew) {
                                          try {
                                            String error = "";

                                            if (_titleController.text.isEmpty) {
                                              error =
                                                  vehicleTypeABMFieldTitleError;
                                            }

                                            if (error.isEmpty) {
                                              FirebaseCustomVideoCategoryHelper()
                                                  .add(
                                                context: context,
                                                categoryModel:
                                                    widget.categoryModel,
                                              )
                                                  .then((result) {
                                                if (result == null) {
                                                  ScaffoldMessenger.of(context)
                                                      .showSnackBar(
                                                          const SnackBar(
                                                    content: Text(
                                                      videoCategoryABMNewSaved,
                                                      style: TextStyle(
                                                          fontSize: 16),
                                                    ),
                                                  ));
                                                  Navigator.pop(context);

                                                  if (widget
                                                          .categoryListState !=
                                                      null) {
                                                    widget.categoryListState
                                                        .refreshList();
                                                  }
                                                } else {
                                                  ScaffoldMessenger.of(context)
                                                      .showSnackBar(SnackBar(
                                                    content: Text(
                                                      result,
                                                      style: const TextStyle(
                                                          fontSize: 16),
                                                    ),
                                                  ));
                                                }
                                              });
                                            } else {
                                              ScaffoldMessenger.of(context)
                                                  .showSnackBar(SnackBar(
                                                content: Text(
                                                  error,
                                                  style: const TextStyle(
                                                      fontSize: 16),
                                                ),
                                              ));
                                            }
                                          } catch (errorValue) {
                                            ScaffoldMessenger.of(context)
                                                .showSnackBar(SnackBar(
                                              content: Text(
                                                errorValue.toString(),
                                                style: const TextStyle(
                                                    fontSize: 16),
                                              ),
                                            ));
                                          }
                                        }

/* Video Category Modify */
                                        if (widget.isModify) {
                                          try {
                                            String error = "";

                                            if (_titleController.text.isEmpty) {
                                              error =
                                                  videoCategoryABMFieldTitleError;
                                            }

                                            if (error.isEmpty) {
                                              FirebaseCustomVideoCategoryHelper()
                                                  .modify(
                                                context: context,
                                                categoryModel:
                                                    widget.categoryModel,
                                              )
                                                  .then((result) {
                                                if (result == null) {
                                                  ScaffoldMessenger.of(context)
                                                      .showSnackBar(
                                                          const SnackBar(
                                                    content: Text(
                                                      videoCategoryABMModifySaved,
                                                      style: TextStyle(
                                                          fontSize: 16),
                                                    ),
                                                  ));
                                                  Navigator.pop(context);

                                                  if (widget
                                                          .categoryListState !=
                                                      null) {
                                                    widget.categoryListState
                                                        .refreshList();
                                                  }
                                                } else {
                                                  ScaffoldMessenger.of(context)
                                                      .showSnackBar(SnackBar(
                                                    content: Text(
                                                      result,
                                                      style: const TextStyle(
                                                          fontSize: 16),
                                                    ),
                                                  ));
                                                }
                                              });
                                            } else {
                                              ScaffoldMessenger.of(context)
                                                  .showSnackBar(SnackBar(
                                                content: Text(
                                                  error,
                                                  style: const TextStyle(
                                                      fontSize: 16),
                                                ),
                                              ));
                                            }
                                          } catch (errorValue) {
                                            ScaffoldMessenger.of(context)
                                                .showSnackBar(SnackBar(
                                              content: Text(
                                                errorValue.toString(),
                                                style: const TextStyle(
                                                    fontSize: 16),
                                              ),
                                            ));
                                          }
                                        }
                                      }
                                    },
                                    child:
                                        const Text(videoCategoryABMSaveTitle),
                                  ),
                                ),
                              ),
                            ])
                          ])))
            ])));
  }
}

class VideoCategoryABMReferenceState extends ReferencePageState {
  _VideoCategoryABMState videoCategoryABMState;

  VideoCategoryABMReferenceState(this.videoCategoryABMState);

  @override
  void setStates() {
    // ignore: invalid_use_of_protected_member
    videoCategoryABMState.setState(() {});
  }
}
