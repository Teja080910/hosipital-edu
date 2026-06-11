// ignore_for_file: unnecessary_null_comparison

import 'package:mdexam/models/category_model.dart';
import 'package:mdexam/pages/category_list.dart';
import 'package:mdexam/utils/firebase/firebase_custom_category.dart';
import 'package:mdexam/widgets/application_bar.dart';
import 'package:mdexam/utils/general/abm.dart';
import 'package:mdexam/utils/general/reference_Page_State.dart';
import 'package:flutter/material.dart';
import 'package:mdexam/variables/globalvar.dart';

// ignore: must_be_immutable
class CategoryABM extends StatefulWidget {
  CategoryListState categoryListState;
  final bool isNew;
  bool isModify;
  CategoryModel categoryModel;

  CategoryABM({
    Key? key,
    required this.categoryListState,
    required this.isNew,
    required this.isModify,
    required this.categoryModel,
  }) : super(key: key);

  @override
  State<CategoryABM> createState() => _CategoryABMState();
}

class _CategoryABMState extends State<CategoryABM> {
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
              title: categoryABMTitle,
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
                                hintText: categoryABMFieldTitleHint,
                                labelText: categoryABMFieldTitleLabel,
                              ),
                              controller: _titleController,
                              validator: (value) {
                                if (value == null || value.isEmpty) {
                                  return categoryABMFieldTitleError;
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

/* maxQuestions */
                            widget.isModify
                                ? Text(
                                    menuProfilerAdministratorQuestionListTitle +
                                        ": " +
                                        widget.categoryModel.maxQuestions
                                            .toString())
                                : Container(),

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
/* Category New */
                                        if (widget.isNew) {
                                          try {
                                            String error = "";

                                            if (_titleController.text.isEmpty) {
                                              error =
                                                  categoryABMFieldTitleError;
                                            }

                                            if (error.isEmpty) {
                                              FirebaseCustomCategoryHelper()
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
                                                      categoryABMNewSaved,
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

/* Category Modify */
                                        if (widget.isModify) {
                                          try {
                                            String error = "";

                                            if (_titleController.text.isEmpty) {
                                              error =
                                                  categoryABMFieldTitleError;
                                            }

                                            if (error.isEmpty) {
                                              FirebaseCustomCategoryHelper()
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
                                                      categoryABMModifySaved,
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
                                    child: const Text(categoryABMSaveTitle),
                                  ),
                                ),
                              ),
                            ])
                          ])))
            ])));
  }
}

class CategoryABMReferenceState extends ReferencePageState {
  _CategoryABMState categoryABMState;

  CategoryABMReferenceState(this.categoryABMState);

  @override
  void setStates() {
    // ignore: invalid_use_of_protected_member
    categoryABMState.setState(() {});
  }
}
