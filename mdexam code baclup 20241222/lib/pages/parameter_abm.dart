import 'package:mdexam/models/parameter_model.dart';
import 'package:mdexam/pages/parameter_list.dart';
import 'package:mdexam/utils/firebase/firebase_custom_parameter.dart';
import 'package:mdexam/utils/general/abm.dart';
import 'package:mdexam/widgets/application_bar.dart';
import 'package:flutter/material.dart';
import 'package:mdexam/variables/globalvar.dart';

// ignore: must_be_immutable
class ParameterABM extends StatefulWidget {
  ParameterListState parameterListState;
  final bool isNew;
  bool isModify;
  ParameterModel parameterModel;

  ParameterABM(
      {Key? key,
      required this.parameterListState,
      required this.isNew,
      required this.isModify,
      required this.parameterModel})
      : super(key: key);

  @override
  State<ParameterABM> createState() => _ParameterABMState();
}

class _ParameterABMState extends State<ParameterABM> {
  final _key2Controller = TextEditingController();
  final _titleController = TextEditingController();
  final _additionalController = TextEditingController();

  final _formKey = GlobalKey<FormState>();

  Future<bool> _onBackPressed() async {
    return abmOnBackPressed2(context, (){}, (){});
  }

  @override
  void initState() {
    if (widget.isModify) {
      _key2Controller.text = widget.parameterModel.key2;
      _titleController.text = widget.parameterModel.title;
      _additionalController.text = widget.parameterModel.additional;
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
              title: parameterABMTitle,
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
/* Key2 */
                            widget.isNew
                                ? TextFormField(
                                    decoration: const InputDecoration(
                                      icon: Icon(Icons.title_rounded),
                                      hintText: parameterABMFieldKey2Hint,
                                      labelText: parameterABMFieldKey2Label,
                                    ),
                                    controller: _key2Controller,
                                    validator: (value) {
                                      if (value == null || value.isEmpty) {
                                        return parameterABMFieldKey2Error;
                                      }
                                      return null;
                                    },
                                    onChanged: (value) {
                                      widget.parameterModel.key2 = value;
                                    },
                                  )
                                : Text(_key2Controller.text,
                                    style: const TextStyle(
                                        fontSize: 16,
                                        fontWeight: FontWeight.bold)),
/* Title */
                            TextFormField(
                              decoration: const InputDecoration(
                                icon: Icon(Icons.title_rounded),
                                hintText: parameterABMFieldTitleHint,
                                labelText: parameterABMFieldTitleLabel,
                              ),
                              controller: _titleController,
                              validator: (value) {
                                if (value == null || value.isEmpty) {
                                  return parameterABMFieldTitleError;
                                }
                                return null;
                              },
                              onChanged: (value) {
                                widget.parameterModel.title = value;
                              },
                            ),
/* Additional */
                            TextFormField(
                              decoration: const InputDecoration(
                                icon: Icon(Icons.title_rounded),
                                hintText: parameterABMFieldAdditionalHint,
                                labelText: parameterABMFieldAdditionalLabel,
                              ),
                              keyboardType: TextInputType.multiline,
                              maxLines: null,
                              controller: _additionalController,
                              validator: (value) {
                                if (value == null || value.isEmpty) {
                                  return parameterABMFieldAdditionalError;
                                }
                                return null;
                              },
                              onChanged: (value) {
                                widget.parameterModel.additional = value;
                              },
                            ),
/* Finish */
                            Row(children: [
                              Padding(
                                padding:
                                    const EdgeInsets.symmetric(vertical: 16.0),
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
/* Parameter New */
                                        if (widget.isNew) {
                                          FirebaseCustomParameterHelper()
                                              .add(
                                                  context: context,
                                                  key2: _key2Controller.text,
                                                  title: _titleController.text,
                                                  additional:
                                                      _additionalController
                                                          .text)
                                              .then((result) {
                                            if (result == null) {
                                              ScaffoldMessenger.of(context)
                                                  .showSnackBar(const SnackBar(
                                                content: Text(
                                                  parameterABMNewSaved,
                                                  style:
                                                      TextStyle(fontSize: 16),
                                                ),
                                              ));
                                              Navigator.pop(context);
                                              widget.parameterListState
                                                  .refreshList();
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
                                        }

/* Parameter Modify */
                                        if (widget.isModify) {
                                          FirebaseCustomParameterHelper()
                                              .modify(
                                                  context: context,
                                                  parameterModel:
                                                      widget.parameterModel)
                                              .then((result) {
                                            if (result == null) {
                                              ScaffoldMessenger.of(context)
                                                  .showSnackBar(const SnackBar(
                                                content: Text(
                                                  parameterABMModifySaved,
                                                  style:
                                                      TextStyle(fontSize: 16),
                                                ),
                                              ));
                                              Navigator.pop(context);

                                              widget.parameterListState
                                                  .refreshList();
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
                                        }
                                      }
                                    },
                                    child: const Text(parameterABMSaveTitle),
                                  ),
                                ),
                              ),

/* Parameter Delete */
                              Padding(
                                padding: const EdgeInsets.symmetric(
                                    horizontal: 16.0),
                                child: widget.isModify
                                    ? Padding(
                                        padding: const EdgeInsets.symmetric(
                                            vertical: 16.0),
                                        child: Center(
                                            child: ElevatedButton(
                                                style: ElevatedButton.styleFrom(
                                                    backgroundColor: Colors.red,
                                                    padding: const EdgeInsets
                                                            .symmetric(
                                                        horizontal: 20,
                                                        vertical: 9),
                                                    textStyle: const TextStyle(
                                                        fontSize: 16,
                                                        fontWeight:
                                                            FontWeight.normal)),
                                                onPressed: () async {
                                                  showDialog(
                                                    context: context,
                                                    builder: (context) =>
                                                        AlertDialog(
                                                      title: const Text(
                                                          abmDeleteAlertTitle),
                                                      content: const Text(
                                                          abmDeleteAlertContent),
                                                      actions: <Widget>[
                                                        Row(
                                                            mainAxisAlignment:
                                                                MainAxisAlignment
                                                                    .spaceBetween,
                                                            children: <Widget>[
                                                              const SizedBox(
                                                                  height: 50),
                                                              GestureDetector(
                                                                onTap: () {
                                                                  Navigator.of(
                                                                          context)
                                                                      .pop(
                                                                          true);

                                                                  FirebaseCustomParameterHelper()
                                                                      .delete(
                                                                          context:
                                                                              context,
                                                                          parameterModel: widget
                                                                              .parameterModel)
                                                                      .then(
                                                                          (result) {
                                                                    if (result ==
                                                                        null) {
                                                                      ScaffoldMessenger.of(
                                                                              context)
                                                                          .showSnackBar(
                                                                              const SnackBar(
                                                                        content:
                                                                            Text(
                                                                          parameterABMModifyDelete,
                                                                          style:
                                                                              TextStyle(fontSize: 16),
                                                                        ),
                                                                      ));

                                                                      widget
                                                                          .parameterListState
                                                                          .refreshList();

                                                                      Navigator.of(
                                                                              context)
                                                                          .pop();
                                                                    } else {
                                                                      ScaffoldMessenger.of(
                                                                              context)
                                                                          .showSnackBar(
                                                                              SnackBar(
                                                                        content:
                                                                            Text(
                                                                          result,
                                                                          style:
                                                                              const TextStyle(fontSize: 16),
                                                                        ),
                                                                      ));
                                                                    }
                                                                  });
                                                                },
                                                                child: const Text(
                                                                    abmDeleteAlertPressedYes),
                                                              ),
                                                              const SizedBox(
                                                                  height: 50),
                                                              GestureDetector(
                                                                onTap: () =>
                                                                    Navigator.of(
                                                                            context)
                                                                        .pop(
                                                                            false),
                                                                child: const Text(
                                                                    abmDeleteAlertPressedNo),
                                                              ),
                                                              const SizedBox(
                                                                  height: 50),
                                                            ])
                                                      ],
                                                    ),
                                                  ); /*??
                                        false;*/
                                                },
                                                child: const Text(
                                                  abmDeleteTitle,
                                                  style: TextStyle(
                                                      fontSize: 16,
                                                      color: Colors.white),
                                                ))))
                                    : Container(),
                              )
                            ])
                          ])))
            ])));
  }
}
