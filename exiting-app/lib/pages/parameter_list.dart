import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:mdexam/pages/parameter_abm.dart';
import 'package:mdexam/widgets/application_bar.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';
import 'package:mdexam/variables/globalvar.dart';
import 'package:mdexam/models/parameter_model.dart';

class ParameterList extends StatefulWidget {
  const ParameterList({Key? key}) : super(key: key);

  @override
  State<ParameterList> createState() => ParameterListState();
}

class ParameterListState extends State<ParameterList> {
  List<ParameterModel> list = [];

  @override
  void initState() {
    super.initState();

    loadParametersListView();
  }

  Future<void> loadParametersListView() async {
    try {
      list.clear();

      final firestoreInstance = FirebaseFirestore.instance;
      CollectionReference parameters =
          firestoreInstance.collection(firebaseCustomParameterKey);

      parameters.orderBy("title").get().then((querySnapshot) {
        for (var result in querySnapshot.docs) {
          setState(() {
            list.add(ParameterModel.fromJSON(false, result.id, result.data()));
          });
        }
      });

      setState(() {});
    } on FirebaseAuthException catch (e) {
      e.stackTrace;
    }
  }

  void refreshList() {
    loadParametersListView();

    setState(() {});
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
        appBar: ApplicationBar(
          context: context,
          title: parameterListTitle,
          withShareButton: false,
        ),
        body: (list.isNotEmpty)
            ? RefreshIndicator(
                key: const Key("refreshKey"),
                onRefresh: () async {
                  refreshList();
                },
                child: ListView(children: [
                  buildAddButtom(),
                  buildListView(context, list),
                ]))
            : ListView(children: [
                buildAddButtom(),
                const Center(child: CircularProgressIndicator())
              ]));
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
                    builder: (BuildContext context) => ParameterABM(
                        parameterListState: this,
                        isNew: true,
                        isModify: false,
                        parameterModel: ParameterModel(
                            false, "", "", "", "", DateTime.now())),
                  ),
                );
              },
            ),
          )),
    ]);
  }

  Widget buildListView(BuildContext context, List<ParameterModel> list) {
    return ListView.builder(
        shrinkWrap: true,
        physics: const NeverScrollableScrollPhysics(),
        scrollDirection: Axis.vertical,
        itemCount: list.length,
        itemBuilder: (BuildContext context, int widgetIndex) {
          return oneItem(context, list, widgetIndex);
        });
  }

  Widget oneItem(BuildContext context, List<ParameterModel> list, int index) {
    final ParameterModel parameterModel = list[index];

    return Container(
      margin: const EdgeInsets.all(5),
      width: MediaQuery.of(context).size.width,
      child: Card(
        child: ListTile(
          onTap: () {
            Navigator.push<void>(
              context,
              MaterialPageRoute<void>(
                builder: (BuildContext context) => ParameterABM(
                    parameterListState: this,
                    isNew: false,
                    isModify: true,
                    parameterModel: parameterModel),
              ),
            );
          },
          leading: const Icon(Icons.panorama_horizontal_select_outlined),
          title: Text(
            parameterModel.title + " (" + parameterModel.key2 + ")",
            style: const TextStyle(fontSize: 16),
          ),
        ),
      ),
    );
  }
}
