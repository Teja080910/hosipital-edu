// ignore: import_of_legacy_library_into_null_safe
import 'package:mdexam/pages/home.dart';
import 'package:mdexam/utils/general/sizes_helpers.dart';
import 'package:mdexam/variables/globalvar.dart';
import 'package:flutter/material.dart';
import 'package:share_plus/share_plus.dart';

// ignore: must_be_immutable
class ApplicationBarCustomer extends AppBar {
  HomePageState? homePageState;

  ApplicationBarCustomer(
      {Key? key,
      required BuildContext context,
      required String title,
      bool withShareButton = false,
      bool withRefreshWeb = false,
      backgroundColor = primaryColor,
      this.homePageState})
      : super(
            elevation: 0,
            key: key,
            title: const Text("", style: TextStyle(color: Colors.black)),
            centerTitle: true,
            backgroundColor: customBackcolor,
            iconTheme: const IconThemeData(
                color: Colors.black, opacity: 100, size: 30),
            actions: <Widget>[
              withShareButton
                  ? Padding(
                      padding: const EdgeInsets.only(right: 20.0),
                      child: GestureDetector(
                        onTap: () => _onShare(context),
                        child: const Icon(Icons.share_rounded),
                      ))
                  : Container(),
              (withRefreshWeb && isWeb())
                  ? Padding(
                      padding: const EdgeInsets.only(right: 20.0),
                      child: GestureDetector(
                        onTap: () => _onRefresh(homePageState!, context),
                        child: const Icon(Icons.refresh_rounded),
                      ))
                  : Container(),
/*
              Container(
                  padding: const EdgeInsets.all(2),
                  child: Image.asset('assets/go.png')),
*/
            ]);
}

_onShare(BuildContext context) async {
  final RenderBox box = context.findRenderObject() as RenderBox;

  await Share.share(appName, subject: shareText);
}

_onRefresh(HomePageState homePageState, BuildContext context) async {
  homePageState.globalRefresh();
}
