// ignore: import_of_legacy_library_into_null_safe
// ignore_for_file: deprecated_member_use

import 'package:mdexam/models/parameter_model.dart';
import 'package:mdexam/pages/category_list.dart';
import 'package:mdexam/pages/content_view.dart';
import 'package:mdexam/pages/customer_flashcard_my_exam_list.dart';
import 'package:mdexam/pages/customer_my_exam_list.dart';
import 'package:mdexam/pages/flashcard_category_list.dart';
import 'package:mdexam/pages/video_category_list.dart';
import 'package:mdexam/pages/flashcard_question_list.dart';
import 'package:mdexam/pages/video_list.dart';
// ignore: import_of_legacy_library_into_null_safe
import 'package:mdexam/pages/home.dart';
import 'package:mdexam/pages/membership_list.dart';
// ignore: import_of_legacy_library_into_null_safe
import 'package:mdexam/pages/question_list.dart';
import 'package:mdexam/pages/user_login.dart';
import 'package:mdexam/utils/general/reference_Page_State.dart';
import 'package:mdexam/utils/general/show_dialog_ok.dart';
import 'package:mdexam/utils/general/show_dialog_yes_no.dart';
import 'package:mdexam/utils/list_transforms/parameter_list_transforms.dart';
import 'package:mdexam/variables/globalvar.dart';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:url_launcher/url_launcher.dart';

// ignore: must_be_immutable
class Menu extends Drawer {
  Menu(
      {Key? key,
      required BuildContext context,
      required HomePageState homePageState})
      : super(
          key: key,
          elevation: 20,
          child: ListView(
            padding: EdgeInsets.zero,
            children: <Widget>[
              _createHeader(),

/* ABM List */
              homePageState.isLogin && homePageState.loginIsAdministrator
                  ? _createDrawerTitle(
                      text: menuABMListTitle, textColor: Colors.black54)
                  : Container(),

/* Question List */
              homePageState.isLogin && homePageState.loginIsAdministrator
                  ? createDrawerItem(
                      icon: Icons.question_answer_outlined,
                      text: menuProfilerAdministratorQuestionListTitle,
                      textColor: Colors.black,
                      onTap: () {
                        Navigator.push<void>(
                          context,
                          MaterialPageRoute<void>(
                            builder: (BuildContext context) =>
                                const QuestionList(),
                          ),
                        );
                      },
                    )
                  : Container(),

/* Category List */
              homePageState.isLogin && homePageState.loginIsAdministrator
                  ? createDrawerItem(
                      icon: Icons.category_outlined,
                      text: menuProfilerAdministratorCategoryListTitle,
                      textColor: Colors.black,
                      onTap: () {
                        Navigator.push<void>(
                          context,
                          MaterialPageRoute<void>(
                            builder: (BuildContext context) =>
                                const CategoryList(),
                          ),
                        );
                      },
                    )
                  : Container(),

/* Membership List */
              homePageState.isLogin && homePageState.loginIsAdministrator
                  ? createDrawerItem(
                      icon: Icons.card_membership_outlined,
                      text: menuProfilerAdministratorMembershipListTitle,
                      textColor: Colors.black,
                      onTap: () {
                        Navigator.push<void>(
                          context,
                          MaterialPageRoute<void>(
                            builder: (BuildContext context) =>
                                const MembershipList(),
                          ),
                        );
                      },
                    )
                  : Container(),

/* Flashcard Question List */
              homePageState.isLogin && homePageState.loginIsAdministrator
                  ? createDrawerItem(
                      icon: Icons.flash_on_outlined,
                      text: menuProfilerAdministratorFlashcardQuestionListTitle,
                      textColor: Colors.black,
                      onTap: () {
                        Navigator.push<void>(
                          context,
                          MaterialPageRoute<void>(
                            builder: (BuildContext context) =>
                                const FlashcardQuestionList(),
                          ),
                        );
                      },
                    )
                  : Container(),

/* Flashcard Category List */
              homePageState.isLogin && homePageState.loginIsAdministrator
                  ? createDrawerItem(
                      icon: Icons.flash_on_outlined,
                      text: menuProfilerAdministratorFlashcardCategoryListTitle,
                      textColor: Colors.black,
                      onTap: () {
                        Navigator.push<void>(
                          context,
                          MaterialPageRoute<void>(
                            builder: (BuildContext context) =>
                                const FlashcardCategoryList(),
                          ),
                        );
                      },
                    )
                  : Container(),

/* Video List */
              homePageState.isLogin && homePageState.loginIsAdministrator
                  ? createDrawerItem(
                      icon: Icons.play_arrow_rounded,
                      text: menuProfilerAdministratorVideoListTitle,
                      textColor: Colors.black,
                      onTap: () {
                        Navigator.push<void>(
                          context,
                          MaterialPageRoute<void>(
                            builder: (BuildContext context) =>
                                const VideoList(),
                          ),
                        );
                      },
                    )
                  : Container(),

/* Video Category List */
              homePageState.isLogin && homePageState.loginIsAdministrator
                  ? createDrawerItem(
                      icon: Icons.play_arrow_rounded,
                      text: menuProfilerAdministratorVideoCategoryListTitle,
                      textColor: Colors.black,
                      onTap: () {
                        Navigator.push<void>(
                          context,
                          MaterialPageRoute<void>(
                            builder: (BuildContext context) =>
                                const VideoCategoryList(),
                          ),
                        );
                      },
                    )
                  : Container(),

/* Parameter List */
              homePageState.isLogin && homePageState.loginIsAdministrator
                  ? createDrawerItem(
                      icon: Icons.panorama_horizontal_select_outlined,
                      text: menuParameterTitle,
                      textColor: Colors.black,
                      onTap: () {
                        Navigator.pushNamed(context, "/ParameterList");
                      },
                    )
                  : Container(),

/* Customer */
              _createDrawerTitle(
                  text: menuProfilerCustomerListTitle,
                  textColor: Colors.black54),

/* Customer About Us */
              createDrawerItem(
                icon: Icons.toc_outlined,
                text: menuProfilerCustomerAboutUsTitle,
                textColor: Colors.black,
                onTap: () {
                  ParameterModel parameterModel =
                      parameterStringFromKey2ToParameterModel(
                          homePageState.listParameters, "CustomerAboutUs");

                  Navigator.push<void>(
                    context,
                    MaterialPageRoute<void>(
                      builder: (BuildContext context) => ContentView(
                          title: parameterModel.title,
                          body: parameterModel.additional,
                          isFooterPayment: false),
                    ),
                  );
                },
              ),

/* Customer Frequent Questions */
              createDrawerItem(
                icon: Icons.toc_outlined,
                text: menuProfilerCustomerFrequentQuestionsTitle,
                textColor: Colors.black,
                onTap: () {
                  ParameterModel parameterModel =
                      parameterStringFromKey2ToParameterModel(
                          homePageState.listParameters,
                          "CustomerFrequentQuestions");

                  Navigator.push<void>(
                    context,
                    MaterialPageRoute<void>(
                      builder: (BuildContext context) => ContentView(
                          title: parameterModel.title,
                          body: parameterModel.additional,
                          isFooterPayment: false),
                    ),
                  );
                },
              ),

/* Customr Contact For Phone */
              createDrawerItem(
                icon: Icons.phone_android_rounded,
                text: menuProfilerCustomerAgentContactForPhoneTitle,
                textColor: Colors.black,
                onTap: () async {
                  String url;

                  url = "tel:" +
                      parameterStringFromKey2ToParameterModel(
                              homePageState.listParameters, "ContactForPhone")
                          .additional +
                      "";

                  if (await canLaunch(url)) {
                    await launch(url);
                  } else {
                    throw 'Could not launch $url';
                  }
                },
              ),

/* Customr Contact For Email */
              createDrawerItem(
                icon: Icons.phone_android_rounded,
                text: menuProfilerCustomerAgentContactForEmailTitle,
                textColor: Colors.black,
                onTap: () async {
                  String url;

                  url = "mailto:" +
                      parameterStringFromKey2ToParameterModel(
                              homePageState.listParameters, "ContactForEmail")
                          .additional +
                      "";
                  if (await canLaunch(url)) {
                    await launch(url);
                  } else {
                    throw 'Could not launch $url';
                  }
                },
              ),

/* Customer My Exams */
              homePageState.isLogin && homePageState.loginIsCustomer
                  ? createDrawerItem(
                      icon: Icons.history_edu_outlined,
                      text: menuProfilerCustomerMyExamsTitle,
                      textColor: Colors.black,
                      onTap: () {
                        Navigator.push<void>(
                          context,
                          MaterialPageRoute<void>(
                            builder: (BuildContext context) =>
                                CustomerMyExamList(
                                    loginUsername: homePageState.loginUsername),
                          ),
                        );
                      },
                    )
                  : Container(),

/* Customer Flashcard My Exams */
              homePageState.isLogin && homePageState.loginIsCustomer
                  ? createDrawerItem(
                      icon: Icons.flash_on_outlined,
                      text: menuProfilerCustomerFlashcardMyExamsTitle,
                      textColor: Colors.black,
                      onTap: () {
                        Navigator.push<void>(
                          context,
                          MaterialPageRoute<void>(
                            builder: (BuildContext context) =>
                                CustomerFlashcardMyExamList(
                                    loginUsername: homePageState.loginUsername),
                          ),
                        );
                      },
                    )
                  : Container(),

/* CPanel */
              const Divider(),
              _createDrawerTitle(
                  text: menuCPanelTitle, textColor: Colors.black54),
              homePageState.isLogin
                  ? createDrawerItem(
                      icon: Icons.login_rounded,
                      text: homePageState.loginUsername,
                      textColor: Colors.black,
                    )
                  : Container(),
/*                  
              !homePageState.isLogin
                  ? createDrawerItem(
                      icon: Icons.add_rounded,
                      text: menuCPanelUserAddTitle,
                      textColor: Colors.black,
                      onTap: () {
                        Navigator.push<void>(
                          context,
                          MaterialPageRoute<void>(
                            builder: (BuildContext context) => UserSimpleAdd(
                                homePageState: homePageState,
                                referencePageState:
                                    MenuReferencePageState(homePageState),
                                isNew: true,
                                isModify: false,
                                userModel: UserModel(
                                    "", "", true, false, false, true, "", ""),
                                isOriginSelectAdd: true,
                                memberships: homePageState.membershipLists),
                          ),
                        );
                      },
                    )
                  : Container(),
*/
              !homePageState.isLogin
                  ? createDrawerItem(
                      icon: Icons.login_rounded,
                      text: menuCPanelUserLoginTitle,
                      textColor: Colors.black,
                      onTap: () {
                        Navigator.push<void>(
                          context,
                          MaterialPageRoute<void>(
                            builder: (BuildContext context) => UserLogin(
                                homePageState: homePageState,
                                dobleClosed: true),
                          ),
                        );
                      },
                    )
                  : Container(),
              homePageState.isLogin &&
                      (homePageState.loginCanListUsers ||
                          homePageState.loginUsername
                                  .trim()
                                  .compareTo("joseluisocleppo@hotmail.com") ==
                              0)
                  ? createDrawerItem(
                      icon: Icons.people_rounded,
                      text: menuCPanelUserListTitle,
                      textColor: Colors.black,
                      onTap: () {
                        Navigator.pushNamed(context, "/UserList");
                      },
                    )
                  : Container(),
              !homePageState.isLogin
                  ? createDrawerItem(
                      icon: Icons.vpn_key_rounded,
                      text: menuCPanelUserLostPasswordTitle,
                      textColor: Colors.black,
                      onTap: () {
                        Navigator.pushNamed(context, "/UserLostPassword");
                      },
                    )
                  : Container(),
              homePageState.isLogin
                  ? createDrawerItem(
                      icon: Icons.logout_rounded,
                      text: menuCPanelUserLogoutTitle,
                      textColor: Colors.red.shade700,
                      onTap: () {
                        _userLogout(context, homePageState);
                      })
                  : Container(),
              const Divider(),
              homePageState.isLogin
                  ? createDrawerItem(
                      icon: Icons.no_accounts_rounded,
                      text: menuCPanelUserDeleteTitle,
                      textColor: Colors.red,
                      onTap: () {
                        ShowDialogYesNo showDialogYesNo = ShowDialogYesNo(
                            onClickYes: () {
                              ShowDialogOk showDialogOk = ShowDialogOk();
                              showDialogOk.show(
                                  context, userDeletedTitle, userDeletedBody);
                            },
                            onClickNo: () {});
                        showDialogYesNo.show(
                            context,
                            userDeleteTitle,
                            userDeleteQuestion,
                            userDeleteYesCaption,
                            userDeleteNoCaption);
                      })
                  : Container(),
              const Divider(),
              ListTile(
                title: const Text('4.1.3 2312_28'),
                onTap: () {},
              ),
            ],
          ),
        );
}

Widget _createHeader() {
  return const DrawerHeader(
      margin: EdgeInsets.zero,
      padding: EdgeInsets.zero,
      decoration: BoxDecoration(
          image: DecorationImage(
              fit: BoxFit.fill,
              image: AssetImage('assets/header_background.png'))),
      child: Stack(children: <Widget>[
        Positioned(
            bottom: 12.0,
            left: 16.0,
            child: Text(appName,
                style: TextStyle(
                    color: Colors.white,
                    fontSize: 20.0,
                    fontWeight: FontWeight.w500))),
      ]));
}

Widget _createDrawerTitle({required String text, required Color textColor}) {
  return ListTile(
      title: Row(
    children: <Widget>[
      Padding(
        padding: const EdgeInsets.only(left: 15.0),
        child: Text(text, style: TextStyle(fontSize: 20, color: textColor)),
      )
    ],
  ));
}

Widget createDrawerItem(
    {required IconData icon,
    required String text,
    required Color textColor,
    GestureTapCallback? onTap}) {
  return ListTile(
    title: Row(
      children: <Widget>[
        Icon(icon),
        Padding(
          padding: const EdgeInsets.only(left: 8.0),
          child: Text(text,
              style: TextStyle(
                color: textColor,
              )),
        )
      ],
    ),
    onTap: onTap,
  );
}

Future<void> _userLogout(
    BuildContext context, HomePageState homePageState) async {
  SharedPreferences prefs = await SharedPreferences.getInstance();
  prefs.setBool(preferenceIsLogin, false);
  prefs.setString(preferenceLoginUsername, "");

  homePageState.setIsLogin(false);
  homePageState.setLoginUsername("");
  homePageState.setLoginCanListUsers(false);
  homePageState.setLoginIsAdministrator(false);
  homePageState.setLoginIsCustomer(false);

//  homePageState.isNewImage1 = false;
//  homePageState.isNewImage2 = false;

  Navigator.pop(context);

  homePageState.refresh();
}

class MenuReferencePageState extends ReferencePageState {
  HomePageState homePageState;

  MenuReferencePageState(this.homePageState);

  @override
  void setStates() {
    // ignore: invalid_use_of_protected_member
    homePageState.setState(() {});
  }
}
