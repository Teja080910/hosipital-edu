// ignore: import_of_legacy_library_into_null_safe
import 'package:mdexam/pages/home.dart';
import 'package:mdexam/variables/globalvar.dart';
import 'package:mdexam/widgets/circle_resume_with_subtitle.dart';
import 'package:flutter/material.dart';

Widget administratorHomeBuild(
    HomePageState homePageState,
    BuildContext context,
    double administratorHomeArtistActivesCount,
    double administratorHomeStreamingPlatformUpdatesCount,
    double administratorHomePaymentPendientsCount) {
  return Padding(
      padding: const EdgeInsets.symmetric(vertical: 16.0),
      child: ListView(
        children: [
          const Row(
            children: [
              Expanded(
                flex: 1,
                child: Padding(
                    padding: EdgeInsets.all(15),
                    child: Align(
                        alignment: Alignment.topCenter,
                        child: Text(administratorHomeTitle,
                            maxLines: 1,
                            style: TextStyle(
                                color: Colors.black,
                                fontSize: 35,
                                fontWeight: FontWeight.bold)))),
              ),
            ],
          ),
          Padding(
              padding: const EdgeInsets.all(30.0),
              child: Column(children: [
                Row(children: [
                  Expanded(
                    flex: 1,
                    child: Container(),
                  ),
                  Expanded(
                    flex: 1,
                    child: Column(children: [
                      circleResumeWithSubtitleBuild(
                          administratorHomeArtistActivesCount.toString(),
                          70,
                          Colors.black,
                          130,
                          administratorHomeArtistActives),
                    ]),
                  ),
                  Expanded(
                      flex: 1,
                      child: Column(children: [
                        circleResumeWithSubtitleBuild(
                            administratorHomeStreamingPlatformUpdatesCount
                                .toString(),
                            70,
                            Colors.green,
                            130,
                            administratorHomeStreamingPlatformUpdates),
                      ])),
                  Expanded(
                      flex: 1,
                      child: Column(children: [
                        circleResumeWithSubtitleBuild(
                            administratorHomePaymentPendientsCount.toString(),
                            60,
                            primaryColor,
                            100,
                            administratorHomePaymentPendients),
                      ])),
                  Expanded(
                    flex: 1,
                    child: Container(),
                  ),
                ])
              ])),
          Container(
            height: 60,
          )
        ],
      ));
}
