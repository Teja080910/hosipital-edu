import 'package:mdexam/models/user_model.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:mdexam/pages/user_abm.dart';
import 'package:mdexam/widgets/application_bar.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';
import 'package:mdexam/variables/globalvar.dart';

class UserList extends StatefulWidget {
  const UserList({Key? key}) : super(key: key);

  @override
  State<UserList> createState() => UserListState();
}

class UserListState extends State<UserList> {
  List<UserModel> list = [];

  @override
  void initState() {
    super.initState();

    loadUsersListView();
  }

  Future<void> loadUsersListView() async {
    try {
      list.clear();

      final firestoreInstance = FirebaseFirestore.instance;
      CollectionReference appUsers =
          firestoreInstance.collection(firebaseCustomUserKey);

      appUsers.get().then((querySnapshot) {
        for (var result in querySnapshot.docs) {
          setState(() {
            list.add(UserModel.fromJSON(result.id, result.data()));
          });
        }
      });

      setState(() {});
    } on FirebaseAuthException catch (e) {
      e.stackTrace;
    }
  }

  void refreshList() {
    loadUsersListView();

    setState(() {});
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
        appBar: ApplicationBar(
          context: context,
          title: userListTitle,
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
                    builder: (BuildContext context) => UserABM(
                        userListState: this,
                        isNew: true,
                        isModify: false,
                        userModel: UserModel(
                            "", "", true, false, false, false, "", "")),
                  ),
                );
              },
            ),
          )),
    ]);
  }

  Widget buildListView(BuildContext context, List<UserModel> list) {
    return ListView.builder(
        shrinkWrap: true,
        physics: const NeverScrollableScrollPhysics(),
        scrollDirection: Axis.vertical,
        itemCount: list.length,
        itemBuilder: (BuildContext context, int widgetIndex) {
          return oneItem(context, list, widgetIndex);
        });
  }

  Widget oneItem(BuildContext context, List<UserModel> list, int index) {
    final UserModel userModel = list[index];

    return Container(
      margin: const EdgeInsets.all(5),
      width: MediaQuery.of(context).size.width,
      child: Card(
        child: ListTile(
          onTap: () {
            Navigator.push<void>(
              context,
              MaterialPageRoute<void>(
                builder: (BuildContext context) => UserABM(
                    userListState: this,
                    isNew: false,
                    isModify: true,
                    userModel: userModel),
              ),
            );
          },
          leading: const Icon(Icons.people_alt_rounded),
          title: Text(
            userModel.username,
            style: const TextStyle(fontSize: 16),
          ),
        ),
      ),
    );
  }
}
