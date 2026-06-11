import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';
import 'package:mdexam/models/parameter_model.dart';
import 'package:mdexam/pages/content_view.dart';
import 'package:mdexam/variables/globalvar.dart';

// ignore: must_be_immutable
class Tos extends StatefulWidget {
  const Tos({Key? key}) : super(key: key);

  @override
  State<Tos> createState() => TosState();
}

class TosState extends State<Tos> {
  @override
  void initState() {
    super.initState();

    loadCommons();
  }

  Future<void> loadCommons() async {
    try {
      String key = "CustomerFrequentQuestions";

      final firestoreInstance = FirebaseFirestore.instance;

      CollectionReference parameters =
          firestoreInstance.collection(firebaseCustomParameterKey);

      parameters.where("key2", isEqualTo: key).get().then((querySnapshot) {
        for (var result in querySnapshot.docs) {
          ParameterModel parameterModel =
              ParameterModel.fromJSON(false, result.id, result.data());

          Navigator.push<void>(
            context,
            MaterialPageRoute<void>(
              builder: (BuildContext context) => ContentView(
                  title: parameterModel.title,
                  body: parameterModel.additional,
                  isFooterPayment: false),
            ),
          );
        }
      });
    } on FirebaseAuthException catch (e) {
      e.stackTrace;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container();
  }
}
