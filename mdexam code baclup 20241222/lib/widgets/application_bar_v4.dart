// ignore: import_of_legacy_library_into_null_safe
import 'package:mdexam/pages/home.dart';
import 'package:mdexam/utils/general/sizes_helpers.dart';
import 'package:mdexam/variables/globalvar.dart';
import 'package:flutter/material.dart';
import 'package:share_plus/share_plus.dart';

// ignore: must_be_immutable
class ApplicationBarV4 extends AppBar {
  HomePageState? homePageState;

  ApplicationBarV4({
    Key? key,
    required BuildContext context,
    required String title,
    bool withShareButton = false,
    bool withRefreshWeb = false,
    backgroundColor = primaryColor,
    this.homePageState,
  }) : super(
            key: key,
            title: Text(title, style: const TextStyle(color: Colors.black)),
            centerTitle: true,
            leading: GestureDetector(
              child: const Icon(
                Icons.arrow_back_ios,
                color: Colors.black,
              ),
              onTap: () {
                Navigator.pop(context);
              },
            ),
            backgroundColor: Colors.grey,
            iconTheme: const IconThemeData(
                color: Colors.white, opacity: 100, size: 30),
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
            ]);
}

_onShare(BuildContext context) async {
  final RenderBox box = context.findRenderObject() as RenderBox;

  await Share.share(appName, subject: shareText);
}

_onRefresh(HomePageState homePageState, BuildContext context) async {
  homePageState.globalRefresh();
}
