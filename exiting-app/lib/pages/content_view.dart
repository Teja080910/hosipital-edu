// ignore: import_of_legacy_library_into_null_safe
// ignore_for_file: deprecated_member_use

import 'package:mdexam/variables/globalvar.dart';
import 'package:mdexam/widgets/application_bar.dart';
import 'package:mdexam/widgets/create_click_item.dart';
import 'package:flutter/material.dart';
import 'package:mdexam/utils/general/sizes_helpers.dart';
import 'package:share_plus/share_plus.dart';
import 'package:styled_text/styled_text.dart';
import 'package:url_launcher/url_launcher.dart';

// ignore: must_be_immutable
class ContentView extends StatefulWidget {
  String title;
  String body;
  bool isFooterPayment;
  bool isReferAFriend;
  String referAFriendTitle;
  String referAFriendSubTitle;
  String referAFriendUrl;

  String phone;
  String email;

  ContentView(
      {Key? key,
      required this.title,
      required this.body,
      required this.isFooterPayment,
      this.isReferAFriend = false,
      this.referAFriendTitle = "",
      this.referAFriendSubTitle = "",
      this.referAFriendUrl = "",
      this.phone = "",
      this.email = ""})
      : super(key: key);

  @override
  State<ContentView> createState() => _ContentViewState();
}

class _ContentViewState extends State<ContentView> {
  final _formKey = GlobalKey<FormState>();

  Future<bool> _onBackPressed() async {
    return true;
  }

  void init() {}

  @override
  Widget build(BuildContext context) {
//    List<String> listBody = widget.body.split('\n');

    return WillPopScope(
      onWillPop: _onBackPressed,
      child: Scaffold(
        appBar: ApplicationBar(
          context: context,
          title: widget.title,
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
                        Column(children: [
/*                          
                          ...Iterable.generate(
                              listBody.length - 1,
                              (i) => Text(
                                    listBody.elementAt(i),
                                    textAlign: TextAlign.left,
                                    style: const TextStyle(
                                        color: Colors.black87,
                                        fontSize: 15,
                                        fontWeight: FontWeight.w500),
                                  )),
*/
/*
                          Text(
                            widget.body,
                            textAlign: TextAlign.left,
                            style: const TextStyle(
                                color: Colors.black87,
                                fontSize: 15,
                                fontWeight: FontWeight.w500),
                          ),
*/

                          StyledText(
                            text: widget.body,
                            tags: {
                              'b': StyledTextTag(
                                  style: const TextStyle(
                                      fontWeight: FontWeight.bold)),
                              'i': StyledTextTag(
                                  style: const TextStyle(
                                      fontStyle: FontStyle.italic)),
                              'color_red': StyledTextTag(
                                  style: const TextStyle(color: Colors.red)),
                              'color_blue': StyledTextTag(
                                  style: const TextStyle(color: Colors.blue)),
                              'color_yellow': StyledTextTag(
                                  style: const TextStyle(color: Colors.yellow)),
                              'color_green': StyledTextTag(
                                  style: const TextStyle(color: primaryColor)),
                              'icon_alarm': StyledTextIconTag(Icons.alarm),
                              'h1': StyledTextTag(
                                  style: const TextStyle(fontSize: 30)),
                              'h2': StyledTextTag(
                                  style: const TextStyle(fontSize: 25)),
                              'h3': StyledTextTag(
                                  style: const TextStyle(fontSize: 20)),
                              'h4': StyledTextTag(
                                  style: const TextStyle(fontSize: 15)),
                              'h5': StyledTextTag(
                                  style: const TextStyle(fontSize: 10)),
                            },
                          ),
                          widget.phone.isNotEmpty
                              ? getWhatsapp(widget.phone)
                              : Container(),
                          widget.phone.isNotEmpty
                              ? const SizedBox(
                                  height: 10,
                                )
                              : Container(),
                          widget.email.isNotEmpty
                              ? getEmail(widget.email)
                              : Container(),
                          widget.email.isNotEmpty
                              ? const SizedBox(
                                  height: 10,
                                )
                              : Container(),
                          widget.isReferAFriend
                              ? createClickItem(
                                  icon: Icons.beenhere_rounded,
                                  title: widget.referAFriendTitle,
                                  subTitle: widget.referAFriendSubTitle,
                                  textColor: Colors.black,
                                  onTap: () async {
                                    if (isMobile()) {
                                      await Share.share(appName,
                                          subject: widget.referAFriendUrl);
                                    } else {
                                      try {
                                        String url = widget.referAFriendUrl;

                                        if (await canLaunch(url)) {
                                          await launch(url);
                                        } else {
                                          throw 'Could not launch $url';
                                        }
                                      } on Exception catch (e) {
                                        e.toString();
                                      }
                                    }
                                  })
                              : Container(),
                        ]),
                      ])))
        ]),
      ),
    );
  }

  Widget getWhatsapp(String phone) {
    return GestureDetector(
        onTap: () async {
          try {
            String url;

            if (isMobile()) {
              //url = "https://wa.me/" + phone + "";
              url = "tel:" + phone + "";
            } else {
              url = "https://api.whatsapp.com/send/?phone=" +
                  phone +
                  "&text&app_absent=0";
            }

            if (await canLaunch(url)) {
              await launch(url);
            } else {
              throw 'Could not launch $url';
            }
          } on Exception catch (e) {
            e.toString();
          }
        },
        child: Padding(
            padding: const EdgeInsets.all(5),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.center,
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Icon(
                  Icons.phone,
                  color: Colors.green,
                  size: 40,
                ),
                const SizedBox(
                  width: 10,
                ),
                Text(
                  phone,
                  style: const TextStyle(fontSize: 20),
                )
              ],
            )));
  }

  Widget getEmail(String email) {
    return GestureDetector(
        onTap: () async {
          try {
            final Uri emailLaunchUri = Uri(
                scheme: 'mailto',
                path: email,
                queryParameters: {'subject': ''});

            if (await canLaunch(emailLaunchUri.toString())) {
              await launch(emailLaunchUri.toString());
            } else {
              throw 'Could not launch $emailLaunchUri';
            }
          } on Exception catch (e) {
            e.toString();
          }
        },
        child: Padding(
            padding: const EdgeInsets.all(5),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.center,
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Icon(
                  Icons.email_outlined,
                  color: Colors.black,
                  size: 40,
                ),
                const SizedBox(
                  width: 10,
                ),
                Text(
                  email,
                  style: const TextStyle(fontSize: 20),
                )
              ],
            )));
  }
}
