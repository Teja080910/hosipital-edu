import 'package:mdexam/models/membership_model.dart';
import 'package:mdexam/pages/membership_abm.dart';
import 'package:mdexam/utils/firebase/firebase_custom_membership.dart';
import 'package:mdexam/widgets/application_bar.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
// ignore: import_of_legacy_library_into_null_safe
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';
import 'package:mdexam/variables/globalvar.dart';

// ignore: must_be_immutable
class MembershipList extends StatefulWidget {
  const MembershipList({Key? key}) : super(key: key);

  @override
  State<MembershipList> createState() => MembershipListState();
}

class MembershipListState extends State<MembershipList> {
  List<MembershipModel> list = [];

  @override
  void initState() {
    super.initState();

    loadMembershipsListView();
  }

  Future<void> loadMembershipsListView() async {
    try {
      list.clear();

      final firestoreInstance = FirebaseFirestore.instance;
      CollectionReference memberships =
          firestoreInstance.collection(firebaseCustomMembershipKey);

      memberships
          .orderBy("title", descending: true)
          .get()
          .then((querySnapshot) {
        for (var result in querySnapshot.docs) {
          setState(() {
            list.add(MembershipModel.fromJSON(false, result.id, result.data()));
          });
        }
      });

      setState(() {});
    } on FirebaseAuthException catch (e) {
      e.stackTrace;
    }
  }

  void refreshList() {
    loadMembershipsListView();

    setState(() {});
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
        appBar: ApplicationBar(
          context: context,
          title: membershipListTitle,
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
                    builder: (BuildContext context) => MembershipABM(
                      membershipListState: this,
                      isNew: true,
                      isModify: false,
                      membershipModel: MembershipModel(false, "", "", "", 1, 0,
                          0, 0, 0, 0, 0, false, false, 0, DateTime.now()),
                    ),
                  ),
                );
              },
            ),
          )),
    ]);
  }

  Widget buildListView(BuildContext context, List<MembershipModel> list) {
    return ListView.builder(
        shrinkWrap: true,
        physics: const NeverScrollableScrollPhysics(),
        scrollDirection: Axis.vertical,
        itemCount: list.length,
        itemBuilder: (BuildContext context, int widgetIndex) {
          return oneItem(context, list, widgetIndex);
        });
  }

  Widget oneItem(BuildContext context, List<MembershipModel> list, int index) {
    final MembershipModel membershipModel = list[index];

    return Container(
      margin: const EdgeInsets.all(5),
      width: MediaQuery.of(context).size.width,
      child: Card(
        child: ListTile(
          onTap: () {
            Navigator.push<void>(
              context,
              MaterialPageRoute<void>(
                builder: (BuildContext context) => MembershipABM(
                    membershipListState: this,
                    isNew: false,
                    isModify: true,
                    membershipModel: membershipModel),
              ),
            );
          },
          leading: const Icon(Icons.card_membership_outlined),
          title: Text(
            membershipModel.title,
            style: const TextStyle(fontSize: 16),
          ),
        ),
      ),
    );
  }
}

void callDelete(BuildContext context, MembershipListState membershipListState,
    MembershipModel membershipModel) {
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

                  FirebaseCustomMembershipHelper()
                      .delete(
                          context: context, membershipModel: membershipModel)
                      .then((result) {
                    if (result == null) {
                      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
                        content: Text(
                          membershipABMModifyDelete,
                          style: TextStyle(fontSize: 16),
                        ),
                      ));

                      // ignore: unnecessary_null_comparison
                      if (membershipListState != null) {
                        membershipListState.refreshList();
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
