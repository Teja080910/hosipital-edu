// ignore: import_of_legacy_library_into_null_safe
// ignore_for_file: deprecated_member_use, avoid_print
// import 'package:appinio_video_player/appinio_video_player.dart';
import 'package:mdexam/models/category_model.dart';
import 'package:mdexam/models/membership_model.dart';
import 'package:mdexam/models/parameter_model.dart';
import 'package:mdexam/models/user_exam_model.dart';
import 'package:mdexam/models/user_flashcard_exam_model.dart';
import 'package:mdexam/models/user_model.dart';
import 'package:mdexam/pages/customer_flashcard_my_exam_list.dart';
import 'package:mdexam/pages/customer_my_exam_list.dart';
import 'package:mdexam/pages/flashcard_question_todo.dart';
import 'package:mdexam/pages/video_todo.dart';
// ignore: import_of_legacy_library_into_null_safe
import 'package:mdexam/pages/home.dart';
import 'package:mdexam/pages/membership_purchase.dart';
import 'package:mdexam/pages/question_todo.dart';
import 'package:mdexam/pages/user_login.dart';
import 'package:mdexam/pages/user_simple_add.dart';
import 'package:mdexam/utils/firebase/firebase_custom_membership.dart';
import 'package:mdexam/utils/general/sizes_helpers.dart';
import 'package:mdexam/utils/list_transforms/parameter_list_transforms.dart';
import 'package:mdexam/variables/globalvar.dart';
import 'package:flutter/material.dart';
import 'package:mdexam/widgets/membership_build.dart';
import 'package:mdexam/widgets/menu.dart';
import 'package:mdexam/widgets/option_build.dart';
import 'package:youtube_player_iframe/youtube_player_iframe.dart';

Widget customerBuild(
    HomePageState homePageState,
    BuildContext context,
    List<CategoryModel> categorys,
    List<MembershipModel> memberships,
    List<MembershipModel> membershipOnlyVisibles,
    double factor,
    UserExamModel newUserExam,
    UserFlashcardExamModel newUserFlashcardExam) {
  String appSubTitle = "";
  bool youTubeShow = false;
  String youTubeID = "";
  bool showMembership = false;

  if (homePageState.listParameters.isNotEmpty) {
    ParameterModel appSubTitleParameter =
        parameterStringFromKey2ToParameterModel(
            homePageState.listParameters, "appSubTitle");

    appSubTitle = appSubTitleParameter.additional;

    ParameterModel youTubeParameter = parameterStringFromKey2ToParameterModel(
        homePageState.listParameters, "youTube");

    if (youTubeParameter.key2.compareTo("youTube") == 0 &&
        youTubeParameter.additional.compareTo("youTubeNot") != 0) {
      youTubeID = youTubeParameter.additional;
      youTubeShow = true;
    }

    if (!isIOS()) {
      showMembership = true;
      homePageState.iosPurchaseMembership = false;
    } else {
      ParameterModel iosShowMembershipParameter =
          parameterStringFromKey2ToParameterModel(
              homePageState.listParameters, "iosShowMembership");

      if (iosShowMembershipParameter.key2.compareTo("iosShowMembership") == 0 &&
          iosShowMembershipParameter.additional.compareTo("Si") == 0) {
        showMembership = true;
      }

      ParameterModel iosPurchaseMembershipParameter =
          parameterStringFromKey2ToParameterModel(
              homePageState.listParameters, "iosPurchaseMembership");

      if (iosPurchaseMembershipParameter.key2
                  .compareTo("iosPurchaseMembership") ==
              0 &&
          iosPurchaseMembershipParameter.additional.compareTo("Si") == 0) {
        homePageState.iosPurchaseMembership = true;
      }
    }
  }

  final _controller = YoutubePlayerController.fromVideoId(
    videoId: youTubeID,
    autoPlay: false,
    params: const YoutubePlayerParams(showFullscreenButton: true),
  );

  return Container(
      color: customBackcolor,
      child: ListView(children: [
        homePageState.isLogin
            ? Padding(
                padding: const EdgeInsets.only(left: 10),
                child: SizedBox(
                    width: displayWidth(context),
                    child: Text(
                      appHomeWelcome + " " + homePageState.loginCustomerName,
                      textAlign: TextAlign.left,
                      style: const TextStyle(
                          color: Colors.black87,
                          fontSize: 25,
                          fontWeight: FontWeight.w500),
                    )))
            : Container(),
/* Days */
        homePageState.isLogin
            ? Padding(
                padding: const EdgeInsets.only(left: 10),
                child: SizedBox(
                    width: displayWidth(context),
                    child: Text(
                      membershipDays(homePageState),
                      textAlign: TextAlign.left,
                      style: const TextStyle(
                          color: Colors.green,
                          fontSize: 15,
                          fontWeight: FontWeight.w500),
                    )))
            : Container(),
        const SizedBox(
          height: 20,
        ),

/*        
        CustomButton("paypal v2 Step 1", Icons.paypal_outlined, true,
            Colors.white, Colors.blue, () async {
          bool sandboxMode = true;
          String clientId =
              "AQlzSWxUvY3yZQehw8_ezoNOwNPSGpVIj6TYsNeIEwNfyc6tgIUelVX-7dseWGjs4wqFLsExWVxMgXcX";
          String secretKey =
              "EGMvVsfCRhKxuyq0onZ7_r0io_2IVd-TpSi4epynZXpEpyJXmXwxBpWGk2DJHWSvFDUsu782OBui605Y";

          PaypalV2Services services = PaypalV2Services(
            sandboxMode: sandboxMode,
            clientId: clientId,
            secretKey: secretKey,
          );

          var transactions = {
            "intent": "sale",
            "payer": {
              "payment_method": "paypal",
              "payer_info": {"email": "testing@hotmail.com"}
            },
            "transactions": [
              {
                "amount": {
                  "total": "10",
                  "currency": "USD",
                  "details": {
                    "subtotal": "10",
                    "shipping": "0",
                    "shipping_discount": 0
                  }
                },
                "description": "Testing",
                "item_list": {
                  "items": [
                    {
                      "name": "Testing",
                      "quantity": "1",
                      "price": "10",
                      "currency": "USD"
                    },
                  ],
                }
              }
            ],
            "note_to_payer": "note",
            "redirect_urls": {
              "return_url": "https://localhost.com",
              "cancel_url": "https://www.microsoft.com",
            },
          };
*/
/*
          var transactions = {
            "intent": "CAPTURE",
            "payment_source": {
              "paypal": {
                "experience_context": {
                  "return_url": "https://www.google.com",
                  "cancel_url": "https://www.microsoft.com",
                  "user_action": "PAY_NOW",
                },
              }
            },
            "purchase_units": [
              {
                "description": "Testing",
                "amount": {
                  "currency_code": "USD",
                  "value": "10",
                  "breakdown": {
                    "item_total": {
                      "currency_code": "USD",
                      "value": "10",
                    }
                  }
                },
                "items": [
                  {
                    "name": "Testing",
                    "quantity": 1,
                    "description": "Testing",
                    "unit_amount": {"currency_code": "USD", "value": "10"}
                  }
                ]
              }
            ]
          };
*/
/*
          Map getToken = await services.getAccessToken();
          String accessToken = getToken['token'];

          String data = jsonEncode(transactions);

          final response = await http.post(
            Uri.parse('https://api-m.sandbox.paypal.com/v1/payments/payment'),
            body: data,
            headers: {
              'Authorization': 'Bearer $accessToken',
              'Content-Type': 'application/json',
            },
          );

          final body = jsonDecode(response.body);
          if (response.statusCode == 201) {
            List links = body["links"];

            String executeUrl = "";
            String approvalUrl = "";
            final item = links.firstWhere((o) => o["rel"] == "approval_url",
                orElse: () => null);
            if (item != null) {
              approvalUrl = item["href"];
            }
            final item1 = links.firstWhere((o) => o["rel"] == "execute",
                orElse: () => null);
            if (item1 != null) {
              executeUrl = item1["href"];
            }

            universal_html.window.open(approvalUrl, "_self");

/*
          PaypalV2PaymentController paypalV2PaymentController =
              PaypalV2PaymentController();

          await paypalV2PaymentController
              .initParameter(homePageState.listParameters);

          await paypalV2PaymentController.startUrlPayment(
              context, "email", "titulo", 1, 100, "USD", "paymentNumber_123");
*/
          }
        }),
*/
/*
        CustomButton("paypal v2 Step 2", Icons.paypal_outlined, true,
            Colors.white, Colors.blue, () async {
          bool sandboxMode = true;
          String clientId =
              "AQlzSWxUvY3yZQehw8_ezoNOwNPSGpVIj6TYsNeIEwNfyc6tgIUelVX-7dseWGjs4wqFLsExWVxMgXcX";
          String secretKey =
              "EGMvVsfCRhKxuyq0onZ7_r0io_2IVd-TpSi4epynZXpEpyJXmXwxBpWGk2DJHWSvFDUsu782OBui605Y";

          PaypalV2Services services = PaypalV2Services(
            sandboxMode: sandboxMode,
            clientId: clientId,
            secretKey: secretKey,
          );
/*
          var transactions = {
            "payment_source": {"paypal": {}},
          };
*/
          Map getToken = await services.getAccessToken();
          String accessToken = getToken['token'];

          final res = await services.executePayment(
              "https://api.sandbox.paypal.com/v1/payments/payment/PAYID-M2R7CHY3WC2410291282494B/execute",
              "66J5PE5XAQR8A",
              accessToken);
        }),
*/

//testing_payment_confirm

/*
        CustomButton("Testing", Icons.abc, false, Colors.white, Colors.green,
            () {
          Navigator.push<void>(
            context,
            MaterialPageRoute<void>(
              builder: (BuildContext context) => QuestionRun(
                  homePageState: homePageState,
                  keyUserExam: "newUserExam.key",
                  userExam: newUserExam),
            ),
          );
        }),
*/

/*
        CustomButton("Flashcard", Icons.abc, false, Colors.white, Colors.green,
            () {
          Navigator.push<void>(
            context,
            MaterialPageRoute<void>(
              builder: (BuildContext context) => FlashcardQuestionRun(
                  homePageState: homePageState,
                  keyUserExam: "newUserExam.key",
                  userExam: newUserFlashcardExam),
            ),
          );
        }),
*/

/*
        CustomButton(
            "Testing stripe", Icons.abc, false, Colors.white, Colors.green,
            () async {
          var items = [
            {
              "productPrice": 4,
              "productName": "Apple",
              "qty": 1,
            },
          ];

          await StripeService.stripePaymentCheckout(
            items,
            500,
            context,
            true,
            "pk_test_51Oj4gdDcSu2jbMGyveJaa90q0l7mBL4g5RAbrqOxTXvc7y5jHH7cB6dvvEGe3H995ppoB7306vW1OAn5zTjgZDub00yCAVVvSI",
            "sk_test_51Oj4gdDcSu2jbMGyWujamlxZfEACGjA9Ed0SUrkfedbtHdhdJPHgGR5s8IqAgBIdEsSNPIq2v5QLXXhPlWoJJ6b800pFq7YHhL",
            onSuccess: () {
              print("SUCCESS");
            },
            onCancel: () {
              print("Cancel");
            },
            onError: (e) {
              print("Error: " + e.toString());
            },
          );
        }),
        CustomButton(
            "Testing paypal", Icons.abc, false, Colors.white, Colors.red,
            () async {
/*              
          var items = [
            {
              "productPrice": 4,
              "productName": "Apple",
              "qty": 1,
            },
          ];
*/

          await PaypalService.paypalPaymentCheckout(
            context,
            true,
            "AQlzSWxUvY3yZQehw8_ezoNOwNPSGpVIj6TYsNeIEwNfyc6tgIUelVX-7dseWGjs4wqFLsExWVxMgXcX",
            "EGMvVsfCRhKxuyq0onZ7_r0io_2IVd-TpSi4epynZXpEpyJXmXwxBpWGk2DJHWSvFDUsu782OBui605Y",
            const [
              {
                "amount": {
                  "total": '1',
                  "currency": "USD",
                  "details": {
                    "subtotal": '1',
                    "shipping": '0',
                    "shipping_discount": 0
                  }
                },
                "description": "The payment transaction description.",
                "item_list": {
                  "items": [
                    {
                      "name": "Apple",
                      "quantity": 1,
                      "price": '1',
                      "currency": "USD"
                    },
                  ],
                  // shipping address is Optional
                  "shipping_address": {
                    "recipient_name": "Alberdi",
                    "line1": "Argentina",
                    "line2": "",
                    "city": "Argentina",
                    "country_code": "AR",
                    "postal_code": "1406",
                    "phone": "+00000000",
                    "state": "CABA"
                  },
                }
              }
            ],
            "PAYMENT_NOTE",
            "https://www.google.com/",
            "https://www.bing.com/",
          );

/*
          await StripeService.stripePaymentCheckout(
            items,
            500,
            context,
            true,
            "pk_test_51Oj4gdDcSu2jbMGyveJaa90q0l7mBL4g5RAbrqOxTXvc7y5jHH7cB6dvvEGe3H995ppoB7306vW1OAn5zTjgZDub00yCAVVvSI",
            "sk_test_51Oj4gdDcSu2jbMGyWujamlxZfEACGjA9Ed0SUrkfedbtHdhdJPHgGR5s8IqAgBIdEsSNPIq2v5QLXXhPlWoJJ6b800pFq7YHhL",
            onSuccess: () {
              print("SUCCESS");
            },
            onCancel: () {
              print("Cancel");
            },
            onError: (e) {
              print("Error: " + e.toString());
            },
          );
*/
        }),
*/

/*
        SizedBox(
            height: 200,
            width: 400,
            child: CustomVideoPlayerWeb(
              customVideoPlayerWebController:
                  homePageState.customVideoPlayerWebController,
            )),
*/

/*              
//                  )
            : CustomVideoPlayer(
                customVideoPlayerController:
                    homePageState.customVideoPlayerController,
              ),
        CupertinoButton(
          child: const Text("Play Fullscreen"),
          onPressed: () {
            if (isWeb()) {
              homePageState.customVideoPlayerWebController.setFullscreen(true);
              homePageState.customVideoPlayerWebController.play();
            } else {
              homePageState.customVideoPlayerController.setFullscreen(true);
              homePageState.customVideoPlayerController.videoPlayerController
                  .play();
            }
          },
        ),
*/

/*
/* Testing de Imagen */
        ClipRRect(
            borderRadius: BorderRadius.circular(10),
            child: SizedBox(
              width: 130 * factor,
              height: 87 * factor,
              child: CachedNetworkImage(
                imageUrl:
                    "https://firebasestorage.googleapis.com/v0/b/md-exam-app.appspot.com/o/questions%2F2024_8_14_18_1_39_190_01_Explanation.png?alt=media&token=7242ed0b-3543-4910-9ba9-3b4322661922",
                placeholder: (context, url) =>
                    const CircularProgressIndicator(),
                errorWidget: (context, url, error) {

                  int f=0;
                  return const Icon(Icons.error);
                },
                fit: BoxFit.cover,
              ),
            )),
*/

/*
        Center(
          child: homePageState.videoPlayercontroller.value.isInitialized
              ? AspectRatio(
                  aspectRatio:
                      homePageState.videoPlayercontroller.value.aspectRatio,
                  child: VideoPlayer(homePageState.videoPlayercontroller),
                )
              : Container(),
        ),
*/

/*
        CustomButton(
            "Accion",
/*            homePageState.videoPlayercontroller.value.isPlaying
                ? Icons.pause
                : Icons.play_arrow,
*/
            Icons.abc,
            false,
            Colors.white,
            Colors.green, () {
          Navigator.push<void>(
              context,
              MaterialPageRoute<void>(
                  builder: (BuildContext context) => CustomWebView(
                        title: "testing",
                        url:
                            "https://drive.google.com/file/d/1dq5RFPcYEjV8W89MRwP2yClpjhjb4gEW/preview",
                      )));

/*              
          homePageState.videoPlayercontroller.value.isPlaying
              ? homePageState.videoPlayercontroller.pause()
              : homePageState.videoPlayercontroller.play();

          homePageState.setStates;
*/
        }),
*/

/* Image */
        const SizedBox(
          height: 100,
          child: Image(image: AssetImage('assets/login_image2.png')),
        ),

/* Title */
        SizedBox(
          width: displayWidth(context),
          child: const Text(
            appHomeTitle,
            textAlign: TextAlign.center,
            style: TextStyle(
                color: primaryColor, fontSize: 20, fontWeight: FontWeight.w500),
          ),
        ),
        const SizedBox(
          height: 30,
        ),

/* SubTitle */
        !homePageState.isLogin
            ? SizedBox(
                width: displayWidth(context) - 30,
                child: Text(
                  appSubTitle,
                  textAlign: TextAlign.center,
                  style: const TextStyle(
                      color: Colors.black87,
                      fontSize: 25,
                      fontWeight: FontWeight.w500),
                ),
              )
            : Container(),
        !homePageState.isLogin && youTubeShow && !homePageState.drawerIsOpen
            ? Column(
                children: [
                  const SizedBox(
                    height: 20,
                  ),
                  ClipRRect(
                      borderRadius: BorderRadius.circular(15),
                      child: SizedBox(
                        height: 340 * factor,
                        width: 600 * factor,
                        //width: displayWidth(context) - 50,
                        //width: 200,
                        //  child: FittedBox(
                        //  fit: BoxFit.fill,
                        child: YoutubePlayer(
                          controller: _controller,
                          aspectRatio: 16 / 9,
                        ),
                      ))
                ],
              )
            : Container(),
        const SizedBox(
          height: 50,
        ),

/* Buttons */
        homePageState.isLogin
            ? Column(
                children: [
                  const Row(
                      crossAxisAlignment: CrossAxisAlignment.center,
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text(
                          questionTitle,
                          textAlign: TextAlign.center,
                          style: TextStyle(
                              color: Colors.black87,
                              fontSize: 25,
                              fontWeight: FontWeight.w500),
                        ),
                      ]),
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.center,
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      optionBuild(
                          questionNewOpenTitle,
                          Icons.question_answer_outlined,
                          Colors.deepPurple,
                          questionNewOpenButtonTitle,
                          factor, () {
                        !homePageState.isLogin
                            ? Navigator.push<void>(
                                context,
                                MaterialPageRoute<void>(
                                  builder: (BuildContext context) => UserLogin(
                                      homePageState: homePageState,
                                      dobleClosed: false),
                                ),
                              )
                            : validMembershipQuestion(
                                homePageState, context, true);
                      }),
                      optionBuild(
                          questionNewClosedTitle,
                          Icons.question_mark_outlined,
                          Colors.blue,
                          questionNewClosedButtonTitle,
                          factor, () {
                        !homePageState.isLogin
                            ? Navigator.push<void>(
                                context,
                                MaterialPageRoute<void>(
                                  builder: (BuildContext context) => UserLogin(
                                      homePageState: homePageState,
                                      dobleClosed: false),
                                ),
                              )
                            : validMembershipQuestion(
                                homePageState, context, false);
                      }),
                    ],
                  ),
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.center,
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      optionBuild(
                          questionHistoryTitle,
                          Icons.history_edu_outlined,
                          Colors.redAccent,
                          questionHistoryButtonTitle,
                          factor, () {
                        !homePageState.isLogin
                            ? Navigator.push<void>(
                                context,
                                MaterialPageRoute<void>(
                                  builder: (BuildContext context) => UserLogin(
                                    homePageState: homePageState,
                                    dobleClosed: false,
                                  ),
                                ),
                              )
                            : Navigator.push<void>(
                                context,
                                MaterialPageRoute<void>(
                                  builder: (BuildContext context) =>
                                      CustomerMyExamList(
                                          loginUsername:
                                              homePageState.loginUsername),
                                ),
                              );
                      }),
                    ],
                  )
                ],
              )
            : Container(),
        const SizedBox(
          height: 50,
        ),

/* Flashcard */
        homePageState.isLogin
            ? Column(
                children: [
                  const Row(
                      crossAxisAlignment: CrossAxisAlignment.center,
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text(
                          flashcardQuestionTitle,
                          textAlign: TextAlign.center,
                          style: TextStyle(
                              color: Colors.black87,
                              fontSize: 25,
                              fontWeight: FontWeight.w500),
                        ),
                      ]),
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.center,
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      optionBuild(
                          flashcardQuestionNewTitle,
                          Icons.flash_on_outlined,
                          Colors.yellow,
                          flashcardQuestionNewButtonTitle,
                          factor, () {
                        !homePageState.isLogin
                            ? Navigator.push<void>(
                                context,
                                MaterialPageRoute<void>(
                                  builder: (BuildContext context) => UserLogin(
                                      homePageState: homePageState,
                                      dobleClosed: false),
                                ),
                              )
                            : validMembershipFlashcards(homePageState, context);
                      }),
                      optionBuild(
                          flashcardQuestionHistoryTitle,
                          Icons.flash_on_outlined,
                          Colors.redAccent,
                          flashcardQuestionHistoryButtonTitle,
                          factor, () {
                        !homePageState.isLogin
                            ? Navigator.push<void>(
                                context,
                                MaterialPageRoute<void>(
                                  builder: (BuildContext context) => UserLogin(
                                    homePageState: homePageState,
                                    dobleClosed: false,
                                  ),
                                ),
                              )
                            : Navigator.push<void>(
                                context,
                                MaterialPageRoute<void>(
                                  builder: (BuildContext context) =>
                                      CustomerFlashcardMyExamList(
                                          loginUsername:
                                              homePageState.loginUsername),
                                ),
                              );
                      }),
                    ],
                  ),
                ],
              )
            : Container(),
        const SizedBox(
          height: 50,
        ),

/* Videos */
        homePageState.isLogin
            ? Column(
                children: [
                  const Row(
                      crossAxisAlignment: CrossAxisAlignment.center,
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text(
                          videoTitleCustom,
                          textAlign: TextAlign.center,
                          style: TextStyle(
                              color: Colors.black87,
                              fontSize: 25,
                              fontWeight: FontWeight.w500),
                        ),
                      ]),
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.center,
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      optionBuild(videoNewTitle, Icons.play_arrow_outlined,
                          Colors.red, videoNewButtonTitle, factor, () {
                        !homePageState.isLogin
                            ? Navigator.push<void>(
                                context,
                                MaterialPageRoute<void>(
                                  builder: (BuildContext context) => UserLogin(
                                      homePageState: homePageState,
                                      dobleClosed: false),
                                ),
                              )
                            : validMembershipVideo(homePageState, context);
                      }),
                    ],
                  ),
                ],
              )
            : Container(),

/* Memberships */
        showMembership
            ? Column(children: [
                const SizedBox(
                  height: 50,
                ),
                SizedBox(
                  width: displayWidth(context),
                  child: const Text(
                    appMembershipTitle,
                    textAlign: TextAlign.center,
                    style: TextStyle(
                        color: Colors.black87,
                        fontSize: 25,
                        fontWeight: FontWeight.w500),
                  ),
                ),
                const SizedBox(
                  height: 50,
                ),
                displayWidth(context) < 800
                    ? membershipBuildListViewX2(
                        homePageState, context, membershipOnlyVisibles, factor)
                    : displayWidth(context) < 1300
                        ? membershipBuildListViewX3(homePageState, context,
                            membershipOnlyVisibles, factor)
                        : membershipBuildListViewX4(homePageState, context,
                            membershipOnlyVisibles, factor)
              ])
            : Container()
      ]));
}

membershipBuildListViewX2(HomePageState homePageState, BuildContext context,
    List<MembershipModel> list, double factor) {
  return ListView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      scrollDirection: Axis.vertical,
      itemCount: (list.length / 2).round() + 1,
      itemBuilder: (BuildContext context, int widgetIndex) {
        int base = widgetIndex * 2;
        int index1 = base;
        int index2 = base + 1;

        return Row(
            crossAxisAlignment: CrossAxisAlignment.center,
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              index1 < list.length
                  ? membershipOneItem(
                      homePageState, context, list, index1, factor)
                  : Container(),
              index2 < list.length
                  ? membershipOneItem(
                      homePageState, context, list, index2, factor)
                  : Container(),
            ]);
      });
}

membershipBuildListViewX3(HomePageState homePageState, BuildContext context,
    List<MembershipModel> list, double factor) {
  return ListView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      scrollDirection: Axis.vertical,
      itemCount: (list.length / 3).round() + 1,
      itemBuilder: (BuildContext context, int widgetIndex) {
        int base = widgetIndex * 3;
        int index1 = base;
        int index2 = base + 1;
        int index3 = base + 2;

        return Row(
            crossAxisAlignment: CrossAxisAlignment.center,
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              index1 < list.length
                  ? membershipOneItem(
                      homePageState, context, list, index1, factor)
                  : Container(),
              index2 < list.length
                  ? membershipOneItem(
                      homePageState, context, list, index2, factor)
                  : Container(),
              index3 < list.length
                  ? membershipOneItem(
                      homePageState, context, list, index3, factor)
                  : Container(),
            ]);
      });
}

membershipBuildListViewX4(HomePageState homePageState, BuildContext context,
    List<MembershipModel> list, double factor) {
  return ListView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      scrollDirection: Axis.vertical,
      itemCount: (list.length / 4).round() + 1,
      itemBuilder: (BuildContext context, int widgetIndex) {
        int base = widgetIndex * 4;
        int index1 = base;
        int index2 = base + 1;
        int index3 = base + 2;
        int index4 = base + 3;

        return Row(
            crossAxisAlignment: CrossAxisAlignment.center,
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              index1 < list.length
                  ? membershipOneItem(
                      homePageState, context, list, index1, factor)
                  : Container(),
              index2 < list.length
                  ? membershipOneItem(
                      homePageState, context, list, index2, factor)
                  : Container(),
              index3 < list.length
                  ? membershipOneItem(
                      homePageState, context, list, index3, factor)
                  : Container(),
              index4 < list.length
                  ? membershipOneItem(
                      homePageState, context, list, index4, factor)
                  : Container(),
            ]);
      });
}

Widget membershipOneItem(HomePageState homePageState, BuildContext context,
    List<MembershipModel> list, int index, double factor) {
  final MembershipModel membershipModel = list[index];
  return membershipBuild(
      homePageState,
      membershipModel.title,
      membershipModel.price,
      membershipModel.detail,
      !membershipModel.isDefault
          ? membershipSelectTitle
          : membershipSelectNewTitle,
      !membershipModel.isDefault,
      factor,
      () {
        !homePageState.isLogin
            ? Navigator.push<void>(
                context,
                MaterialPageRoute<void>(
                  builder: (BuildContext context) => UserLogin(
                    homePageState: homePageState,
                    dobleClosed: false,
                  ),
                ),
              )
            : Navigator.push<void>(
                context,
                MaterialPageRoute<void>(
                  builder: (BuildContext context) => MembershipPurchase(
                      homePageState: homePageState,
                      toMembership: membershipModel),
                ),
              );
      },
      membershipModel.isDefault && !homePageState.isLogin,
      () {
        Navigator.push<void>(
          context,
          MaterialPageRoute<void>(
            builder: (BuildContext context) => UserSimpleAdd(
                homePageState: homePageState,
                referencePageState: MenuReferencePageState(homePageState),
                isNew: true,
                isModify: false,
                userModel: UserModel("", "", true, false, false, true, "", ""),
                isOriginSelectAdd: true,
                memberships: homePageState.membershipLists),
          ),
        );
      });
}

void validMembershipQuestion(
    HomePageState homePageState, BuildContext context, bool isOpen) {
  try {
    String error = "";

    if (homePageState.customerMembershipCurrent.creationTime
        .isBefore(DateTime.now().toUtc())) {
      error = questionTodoError1;
    }

    if (homePageState.customerMembershipCurrent.maxUses < 1) {
      error = questionTodoError2;
    }

    if (error.isEmpty) {
      homePageState.customerMembershipCurrent.maxUses -= 1;

      FirebaseCustomMembershipHelper()
          .use(
        context: context,
        loginUsername: homePageState.loginUsername,
        membershipCurrent: homePageState.customerMembershipCurrent,
      )
          .then((result) {
        if (result == null) {
          Navigator.push<void>(
            context,
            MaterialPageRoute<void>(
              builder: (BuildContext context) =>
                  QuestionTodo(homePageState: homePageState, isOpen: isOpen),
            ),
          );
        } else {
          ScaffoldMessenger.of(context).showSnackBar(SnackBar(
            content: Text(
              result,
              style: const TextStyle(fontSize: 16),
            ),
          ));
        }
      });
    } else {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(
        content: Text(
          error,
          style: const TextStyle(fontSize: 16),
        ),
      ));
    }
  } catch (errorValue) {
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(
      content: Text(
        errorValue.toString(),
        style: const TextStyle(fontSize: 16),
      ),
    ));
  }
}

void validMembershipFlashcards(
    HomePageState homePageState, BuildContext context) {
  try {
    String error = "";

    if (homePageState.customerMembershipCurrent.creationTime
        .isBefore(DateTime.now().toUtc())) {
      error = flashcardQuestionTodoError1;
    }

    if (homePageState.customerMembershipCurrent.maxUsesFlashcards < 1) {
      error = flashcardQuestionTodoError2;
    }

    if (error.isEmpty) {
      homePageState.customerMembershipCurrent.maxUsesFlashcards -= 1;

      FirebaseCustomMembershipHelper()
          .use(
        context: context,
        loginUsername: homePageState.loginUsername,
        membershipCurrent: homePageState.customerMembershipCurrent,
      )
          .then((result) {
        if (result == null) {
          Navigator.push<void>(
            context,
            MaterialPageRoute<void>(
              builder: (BuildContext context) => FlashcardQuestionTodo(
                  homePageState: homePageState, isOpen: true),
            ),
          );
        } else {
          ScaffoldMessenger.of(context).showSnackBar(SnackBar(
            content: Text(
              result,
              style: const TextStyle(fontSize: 16),
            ),
          ));
        }
      });
    } else {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(
        content: Text(
          error,
          style: const TextStyle(fontSize: 16),
        ),
      ));
    }
  } catch (errorValue) {
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(
      content: Text(
        errorValue.toString(),
        style: const TextStyle(fontSize: 16),
      ),
    ));
  }
}

void validMembershipVideo(HomePageState homePageState, BuildContext context) {
  try {
    String error = "";

    if (homePageState.customerMembershipCurrent.creationTime
        .isBefore(DateTime.now().toUtc())) {
      error = videoTodoError1;
    }

    if (homePageState.customerMembershipCurrent.maxVideos < 1) {
      error = videoTodoError2;
    }

    if (error.isEmpty) {
      homePageState.customerMembershipCurrent.maxVideos -= 1;

      FirebaseCustomMembershipHelper()
          .use(
        context: context,
        loginUsername: homePageState.loginUsername,
        membershipCurrent: homePageState.customerMembershipCurrent,
      )
          .then((result) {
        if (result == null) {
          Navigator.push<void>(
            context,
            MaterialPageRoute<void>(
              builder: (BuildContext context) => VideoTodo(
                  homePageState: homePageState, isOpen: true), //Video Run
            ),
          );
        } else {
          ScaffoldMessenger.of(context).showSnackBar(SnackBar(
            content: Text(
              result,
              style: const TextStyle(fontSize: 16),
            ),
          ));
        }
      });
    } else {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(
        content: Text(
          error,
          style: const TextStyle(fontSize: 16),
        ),
      ));
    }
  } catch (errorValue) {
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(
      content: Text(
        errorValue.toString(),
        style: const TextStyle(fontSize: 16),
      ),
    ));
  }
}

String membershipDays(HomePageState homePageState) {
  Duration diference = homePageState.customerMembershipCurrent.creationTime
      .difference(DateTime.now().toUtc());

  if (diference.inDays <= 0) {
    return appMembershipDays0Title;
  } else {
    return appMembershipDaysPreTitle +
        " " +
        diference.inDays.toString() +
        " " +
        appMembershipDaysSubTitle;
  }
}

void iosPurchaseMembershipController(MembershipModel membershipModel) {
  try {} catch (e) {
    e.toString();
  }
}
