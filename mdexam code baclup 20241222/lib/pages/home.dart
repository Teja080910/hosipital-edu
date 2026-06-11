// ignore_for_file: prefer_const_constructors, deprecated_member_use, library_prefixes, unnecessary_null_comparison
// ignore: import_of_legacy_library_into_null_safe, unused_import
import 'dart:convert';
// import 'package:appinio_video_player/appinio_video_player.dart';
import 'package:mdexam/models/answer_model.dart';
import 'package:mdexam/models/category_model.dart';
import 'package:mdexam/models/flashcard_answer_model.dart';
import 'package:mdexam/models/flashcard_category_model.dart';
import 'package:mdexam/models/flashcard_question_answer_model.dart';
import 'package:mdexam/models/flashcard_question_model.dart';
import 'package:mdexam/models/membership_model.dart';
import 'package:mdexam/models/question_answer_model.dart';
import 'package:mdexam/models/question_model.dart';
import 'package:mdexam/models/user_exam_model.dart';
import 'package:mdexam/models/user_flashcard_exam_model.dart';
import 'package:mdexam/widgets/application_bar_customer.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:mdexam/models/parameter_model.dart';
import 'package:mdexam/models/user_model.dart';
// ignore: unused_import
import 'package:mdexam/utils/general/reference_Page_State.dart';
import 'package:mdexam/utils/general/sizes_helpers.dart';
import 'package:mdexam/utils/list_transforms/parameter_list_transforms.dart'
    as parameterTransforms;
import 'package:mdexam/utils/list_transforms/membership_list_transforms.dart'
    as membershipTransforms;
import 'package:mdexam/utils/list_transforms/category_list_transforms.dart'
    as categoryTransforms;
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:mdexam/widgets/customer_build.dart';
import 'package:mdexam/widgets/menu.dart';
import 'package:flutter/material.dart';
import 'package:mdexam/variables/globalvar.dart';
import 'package:shared_preferences/shared_preferences.dart';

enum IdProfiler { undefined, general, customer }

String videoUrlLandscape =
    "https://flutter.github.io/assets-for-api-docs/assets/videos/bee.mp4";
String videoUrlPortrait =
    'https://assets.mixkit.co/videos/preview/mixkit-a-girl-blowing-a-bubble-gum-at-an-amusement-park-1226-large.mp4';
String longVideo =
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";

String video720 =
    "https://www.sample-videos.com/video123/mp4/720/big_buck_bunny_720p_10mb.mp4";

String video480 =
    "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4";

String video240 =
    "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4";

/*
String videoUrlLandscape =
    "https://drive.google.com/file/d/14geKB1bAWQZCFANoOUla64Zm2DdaW_zo/preview";
String videoUrlPortrait =
    'https://drive.google.com/file/d/14geKB1bAWQZCFANoOUla64Zm2DdaW_zo/preview';
String longVideo =
    "https://drive.google.com/file/d/14geKB1bAWQZCFANoOUla64Zm2DdaW_zo/preview";

String video720 =
    "https://drive.google.com/file/d/14geKB1bAWQZCFANoOUla64Zm2DdaW_zo/preview";

String video480 =
    "https://drive.google.com/file/d/14geKB1bAWQZCFANoOUla64Zm2DdaW_zo/preview";

String video240 =
    "https://drive.google.com/file/d/14geKB1bAWQZCFANoOUla64Zm2DdaW_zo/preview";

*/

// ignore: must_be_immutable
class HomePage extends StatefulWidget {
  IdProfiler idProfiler;

  HomePage({Key? key, required this.idProfiler}) : super(key: key);

  @override
  State<HomePage> createState() => HomePageState();
}

class HomePageState extends State<HomePage> {
  IdProfiler idProfiler = IdProfiler.undefined;

  bool isLogin = false;
  String loginUsername = "";
  bool loginCanListUsers = false;
  bool loginIsAdministrator = false;
  bool loginIsCustomer = false;
  String loginCustomerName = "";

  bool positionPermissionDeny = false;

  bool drawerIsOpen = false;

//  MessagingHelper messagingHelper = MessagingHelper();
//  final GeolocatorPlatform geolocatorPlatform = GeolocatorPlatform.instance;

  List<CategoryModel> customerCategoryLists = [];

  MembershipModel customerMembershipCurrent = MembershipModel(
      false, "", "", "", 0, 0, 0, 0, 0, 0, 0, false, false, 0, DateTime.now());

  List<ParameterModel> listParameters = [];
  List<MembershipModel> membershipLists = [];
  List<MembershipModel> membershipOnlyVisibleLists = [];

  void setIsLogin(bool isLogin) {
    this.isLogin = isLogin;
  }

  void setLoginUsername(String loginUsername) {
    this.loginUsername = loginUsername;
  }

  void setLoginCanListUsers(bool loginCanListUsers) {
    this.loginCanListUsers = loginCanListUsers;
  }

  void setLoginIsAdministrator(bool loginIsAdministrator) {
    this.loginIsAdministrator = loginIsAdministrator;
  }

  void setLoginIsCustomer(bool loginIsCustomer) {
    this.loginIsCustomer = loginIsCustomer;
  }

  UserExamModel testingUserExam = UserExamModel(
      false,
      "",
      "",
      "custom title",
      [CategoryModel(false, "", "Categoria testing", 0, DateTime.now())],
      true,
      true,
//      false,
//      true,
      3,
      25,
      [],
      DateTime.now().toUtc(),
      DateTime.now().toUtc().add(Duration(minutes: 25)));

  UserFlashcardExamModel testingUserFlashcardExam = UserFlashcardExamModel(
      false,
      "",
      "",
      "custom title",
      [
        FlashcardCategoryModel(
            false, "", "Categoria testing", 0, DateTime.now())
      ],
      true,
      false,
//      false,
//      true,
      3,
      25,
      [],
      DateTime.now().toUtc(),
      DateTime.now().toUtc().add(Duration(minutes: 25)));

  bool iosPurchaseMembership = false;
/*
  final InAppPurchaseStoreKitPlatform iapStoreKitPlatform =
      InAppPurchasePlatform.instance as InAppPurchaseStoreKitPlatform;
*/

/*
  late CachedVideoPlayerController videoPlayerController,
      videoPlayerController2,
      videoPlayerController3;
  late CustomVideoPlayerController customVideoPlayerController;
  late CustomVideoPlayerWebController customVideoPlayerWebController;

  final CustomVideoPlayerSettings customVideoPlayerSettings =
      const CustomVideoPlayerSettings(
    showSeekButtons: true,
  );

  final CustomVideoPlayerWebSettings customVideoPlayerWebSettings =
      CustomVideoPlayerWebSettings(
    hideDownloadButton: true,
    src: longVideo,
  );
*/

//  late VideoPlayerController videoPlayercontroller;

  @override
  void initState() {
    super.initState();

    idProfiler = widget.idProfiler;

    refresh();

    testingUserExam.questionAnswers.add(QuestionAnswerModel(
        QuestionModel(
            false,
            "",
            testingUserExam.categorys[0],
            "<b>Pregunta</b> 1",
            "explicacion de la <b>pregunta</b> 1",
            "<b>referencia</b> de la pregunta 1",
            [
              AnswerModel("<b>respuesta</b> 1", true),
              AnswerModel("<b>respuesta</b> 2", false),
              AnswerModel("<b>respuesta</b> 3", false),
              AnswerModel("respuesta <b>4</b>", false),
              AnswerModel("<b>respuesta</b> 5", false),
            ],
            true,
            "",
            "https://www.sysadminok.es/wp-content/uploads/2022/07/cors.jpg",
            "",
            "https://www.sysadminok.es/wp-content/uploads/2022/07/cors.jpg",
            "",
            "https://www.sysadminok.es/wp-content/uploads/2022/07/cors.jpg",
            "",
            "https://www.sysadminok.es/wp-content/uploads/2022/07/cors.jpg",
            "",
            "https://www.sysadminok.es/wp-content/uploads/2022/07/cors.jpg",
            "",
            "https://www.sysadminok.es/wp-content/uploads/2022/07/cors.jpg",
            "",
            "https://www.sysadminok.es/wp-content/uploads/2022/07/cors.jpg",
            "",
            "https://www.sysadminok.es/wp-content/uploads/2022/07/cors.jpg",
            "",
            "https://www.sysadminok.es/wp-content/uploads/2022/07/cors.jpg",
            DateTime.now().toUtc()),
        AnswerModel("", false)));

    testingUserExam.questionAnswers.add(QuestionAnswerModel(
        QuestionModel(
            false,
            "",
            testingUserExam.categorys[0],
            "Pregunta 2 Pregunta 2 Pregunta 2 Pregunta 2 Pregunta 2 Pregunta 2 Pregunta 2 ",
            "explicacion de la pregunta 2",
            "referencia de la pregunta 2",
            [
              AnswerModel("respuesta 1", false),
              AnswerModel("respuesta 2 ", true),
              AnswerModel(
                  "respuesta 3 respuesta 3 respuesta 3 respuesta 3 respuesta 3 respuesta 3 ",
                  false),
              AnswerModel("respuesta 4", false),
              AnswerModel("respuesta 5", false),
            ],
            true,
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            DateTime.now().toUtc()),
        AnswerModel("", false)));

    testingUserExam.questionAnswers.add(QuestionAnswerModel(
        QuestionModel(
            false,
            "",
            testingUserExam.categorys[0],
            "Pregunta 3 Pregunta 3 Pregunta 3 Pregunta 3 Pregunta 3 Pregunta 3 Pregunta 3 Pregunta 3 ",
            "explicacion de la pregunta 3 explicacion de la pregunta 3 explicacion de la pregunta 3 explicacion de la pregunta 3 explicacion de la pregunta 3 explicacion de la pregunta 3 explicacion de la pregunta 3 ",
            "referencia de la pregunta 3",
            [
              AnswerModel("respuesta 1", false),
              AnswerModel("respuesta 2", false),
              AnswerModel(
                  "respuesta 3 respuesta 3 respuesta 3 respuesta 3 respuesta 3 respuesta 3 ",
                  true),
              AnswerModel("respuesta 4", false),
              AnswerModel("respuesta 5", true),
            ],
            true,
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            DateTime.now().toUtc()),
        AnswerModel("", false)));

    testingUserFlashcardExam.questionAnswers.add(FlashcardQuestionAnswerModel(
        FlashcardQuestionModel(
            false,
            "",
            testingUserFlashcardExam.categorys[0],
            "<b>Pregunta</b> 1",
            "",
            "",
            [
              FlashcardAnswerModel("<b>respuesta</b> 1", true),
            ],
            true,
            DateTime.now().toUtc()),
        FlashcardAnswerModel("", false)));

    testingUserFlashcardExam.questionAnswers.add(FlashcardQuestionAnswerModel(
        FlashcardQuestionModel(
            false,
            "",
            testingUserFlashcardExam.categorys[0],
            "Pregunta 2 Pregunta 2 Pregunta 2 Pregunta 2 Pregunta 2 Pregunta 2 Pregunta 2 ",
            "",
            "",
            [
              FlashcardAnswerModel("respuesta 2", false),
            ],
            true,
            DateTime.now().toUtc()),
        FlashcardAnswerModel("", false)));

    testingUserFlashcardExam.questionAnswers.add(FlashcardQuestionAnswerModel(
        FlashcardQuestionModel(
            false,
            "",
            testingUserFlashcardExam.categorys[0],
            "Pregunta 3 Pregunta 3 Pregunta 3 Pregunta 3 Pregunta 3 Pregunta 3 Pregunta 3 Pregunta 3 ",
            "",
            "",
            [
              FlashcardAnswerModel("respuesta 3", false),
            ],
            true,
            DateTime.now().toUtc()),
        FlashcardAnswerModel("", false)));

/*
    videoPlayerController = CachedVideoPlayerController.network(
      longVideo,
    )..initialize().then((value) => setState(() {}));
    videoPlayerController2 = CachedVideoPlayerController.network(video240);
    videoPlayerController3 = CachedVideoPlayerController.network(video480);
    customVideoPlayerController = CustomVideoPlayerController(
      context: context,
      videoPlayerController: videoPlayerController,
      customVideoPlayerSettings: customVideoPlayerSettings,
      additionalVideoSources: {
        "240p": videoPlayerController2,
        "480p": videoPlayerController3,
        "720p": videoPlayerController,
      },
    );

    customVideoPlayerWebController = CustomVideoPlayerWebController(
      webVideoPlayerSettings: customVideoPlayerWebSettings,
    );


    videoPlayercontroller = VideoPlayerController.networkUrl(Uri.parse(
        'https://www.googleapis.com/drive/v3/files/1dq5RFPcYEjV8W89MRwP2yClpjhjb4gEW?alt=media'))
      ..initialize().then((_) {
        // Ensure the first frame is shown after the video is initialized, even before the play button has been pressed.
        setState(() {});
      });
*/
  }

  void setStates() {
    setState(() {});
  }

  Future<void> loadPreferences() async {
    final SharedPreferences prefs = await SharedPreferences.getInstance();

    bool? resultIsLogin = prefs.getBool(preferenceIsLogin);
    String? resultLoginUsername = prefs.getString(preferenceLoginUsername);

    if (resultIsLogin != null) {
      isLogin = resultIsLogin;
    }

    if (resultLoginUsername != null) {
      loginUsername = resultLoginUsername;
    }

    loadCommons();

    if (isLogin) {
      final FirebaseFirestore firestoreInstance = FirebaseFirestore.instance;
      CollectionReference appUsers =
          firestoreInstance.collection(firebaseCustomUserKey);

      appUsers.doc(resultLoginUsername).get().then((result) async {
        UserModel userModel = UserModel.fromJSON(result.id, result.data());

        loginCanListUsers = userModel.canListUsers;
        loginIsAdministrator = userModel.isAdministrator;
        loginIsCustomer = userModel.isCustomer;
        loginCustomerName = userModel.name;

        if (loginIsAdministrator) {
          loadAdministrator();
        }

        if (loginIsCustomer) {
          loadCustomer();
        }

        setState(() {});
      });
    } else {
      setState(() {});
    }
  }

  Future<void> loadCommons() async {
    try {
      listParameters.clear();

      final firestoreInstance = FirebaseFirestore.instance;

      CollectionReference parameters =
          firestoreInstance.collection(firebaseCustomParameterKey);

      parameters.orderBy("title").get().then((querySnapshot) {
        for (var result in querySnapshot.docs) {
          setState(() {
            parameterTransforms.uniquedAdd(listParameters,
                ParameterModel.fromJSON(false, result.id, result.data()));
          });
        }
      });

      setState(() {});

      // Memberships
      membershipLists.clear();
      membershipOnlyVisibleLists.clear();

      CollectionReference memberships =
          firestoreInstance.collection(firebaseCustomMembershipKey);

      memberships
          .limit(100)
          .orderBy("order", descending: false)
          .get()
          .then((querySnapshot) {
        for (var result in querySnapshot.docs) {
          setState(() {
            MembershipModel newMembership =
                MembershipModel.fromJSON(false, result.id, result.data());

            membershipTransforms.uniquedAdd(membershipLists, newMembership);

            if (newMembership.isVisible) {
              membershipTransforms.uniquedAdd(
                  membershipOnlyVisibleLists, newMembership);
            }
          });
        }
      });

      setState(() {});
    } on FirebaseAuthException catch (e) {
      e.stackTrace;
    }
  }

  Future<void> loadAdministrator() async {
/*    
    try {
      final firestoreInstance = FirebaseFirestore.instance;

      administratorFormAddLists.clear();

      CollectionReference formAdds =
          firestoreInstance.collection(firebaseCustomFormAddKey);

      formAdds
          .limit(100)
          .orderBy("date", descending: true)
          .get()
          .then((querySnapshot) {
        for (var result in querySnapshot.docs) {
          setState(() {
            formAddTransforms.uniquedAdd(administratorFormAddLists,
                FormAddModel.fromJSON(false, result.id, result.data()));
          });
        }
      });

      setState(() {});
    } on FirebaseAuthException catch (e) {
      e.stackTrace;
    }
*/
  }

  Future<void> loadCustomer() async {
    try {
      final firestoreInstance = FirebaseFirestore.instance;

      // Customer Membership Current
      if (loginUsername.isNotEmpty) {
        CollectionReference appUserMemberships =
            firestoreInstance.collection(firebaseCustomUserMembershipKey);
        DocumentSnapshot documentSnapshot =
            await appUserMemberships.doc(loginUsername).get();
        customerMembershipCurrent = MembershipModel.fromJSON(
            false, documentSnapshot.id, documentSnapshot.data());
      }

      // Customer Category
      customerCategoryLists.clear();

      CollectionReference categorys =
          firestoreInstance.collection(firebaseCustomCategoryKey);

      categorys
          .limit(100)
          .orderBy("title", descending: false)
          .get()
          .then((querySnapshot) {
        for (var result in querySnapshot.docs) {
          setState(() {
            categoryTransforms.uniquedAdd(customerCategoryLists,
                CategoryModel.fromJSON(false, result.id, result.data()));
          });
        }
      });

      setState(() {});
    } on FirebaseAuthException catch (e) {
      e.stackTrace;
    }
  }

/*
  void customerOnActionGpsTip() async {
    try {
      if (!positionPermissionDeny) {
        final SharedPreferences prefs = await SharedPreferences.getInstance();

        bool resultPositionPermissionAccept =
            prefs.getBool(preferencePositionPermissionAccept);

        if (resultPositionPermissionAccept != null) {
        } else {
          resultPositionPermissionAccept = false;
        }

        if (resultPositionPermissionAccept) {
          customerGpsGetCurrentPosition();
        } else {
          ShowDialogYesNo showDialogYesNo =
              ShowDialogYesNo(onClickYes: () async {
            SharedPreferences prefs = await SharedPreferences.getInstance();

            prefs.setBool(preferencePositionPermissionAccept, true);

            customerGpsGetCurrentPosition();
          }, onClickNo: () {
            positionPermissionDeny = true;
          });
          showDialogYesNo.show(
              context,
              positionPermissionTitleCaption,
              positionPermissionQuestionCaption,
              positionPermissionYesCaption,
              positionPermissionNoCaption);
        }
      }
    } catch (e) {
      e.toString();
    }
  }

  Future<void> customerGpsGetCurrentPosition() async {
    try {
      final hasPermission = await handlePermission(this);

      if (!hasPermission) {
        return;
      }

      final position = await geolocatorPlatform.getCurrentPosition();

      if (position.latitude != customerActualPosition.latitude ||
          position.longitude != customerActualPosition.longitude) {
        customerActualPosition.latitude = position.latitude;
        customerActualPosition.longitude = position.longitude;

        final firestoreInstance = FirebaseFirestore.instance;

        await firestoreInstance
            .collection(firebaseCustomLoginPositionKey)
            .doc(customerProfilerModel.key)
            .set(PositionModel(customerActualPosition.latitude,
                    customerActualPosition.longitude, DateTime.now())
                .toJson());

        setStates();
      }
    } on Exception catch (e) {
      e.toString();
    }
  }

  Future<bool> handlePermission(HomePageState homePageState) async {
    bool serviceEnabled;
    LocationPermission permission;

    // Test if location services are enabled.
    serviceEnabled = await geolocatorPlatform.isLocationServiceEnabled();
    if (!serviceEnabled) {
      // Location services are not enabled don't continue
      // accessing the position and request users of the
      // App to enable the location services.
      snackBarMessage(
        context,
        gpsLocationServicesDisabledMessage,
      );

      return false;
    }

    permission = await geolocatorPlatform.checkPermission();
    if (permission == LocationPermission.denied) {
      permission = await geolocatorPlatform.requestPermission();
      if (permission == LocationPermission.denied) {
        // Permissions are denied, next time you could try
        // requesting permissions again (this is also where
        // Android's shouldShowRequestPermissionRationale
        // returned true. According to Android guidelines
        // your App should show an explanatory UI now.
        snackBarMessage(
          context,
          gpsPermissionDeniedMessage,
        );

        return false;
      }
    }

    if (permission == LocationPermission.deniedForever) {
      // Permissions are denied forever, handle appropriately.
      snackBarMessage(
        context,
        gpsPermissionDeniedForeverMessage,
      );

      return false;
    }

    return true;
  }
*/
  refresh() {
    loadPreferences();

    if (loginIsAdministrator) {
      loadAdministrator();
    }

    if (loginIsCustomer) {
      loadCustomer();
    }
  }

  globalRefresh() {
    if (loginIsAdministrator) {
      loadAdministrator();
    }

    if (loginIsCustomer) {
      loadCustomer();
    }
  }

  // ignore: unused_field
  int _currentIndex = 0;
  final List _children = [];

  void setCurrentIndex(int currentIndex) {
    _currentIndex = currentIndex;
  }

//  final _loginUsernameController = TextEditingController();
//  final _loginPasswordController = TextEditingController();

  @override
  Widget build(BuildContext context) {
    _children.clear();

/* Not Login */
    if (!isLogin) {
      return Scaffold(
          appBar: ApplicationBarCustomer(
            title: appName,
            backgroundColor: customBackcolor,
            context: context,
          ),
          drawer: Menu(
            context: context,
            homePageState: this,
          ),
          onDrawerChanged: (isOpen) {
            setState(() {
              drawerIsOpen = isOpen;
            });
          },
          body: customerBuild(
              this,
              context,
              customerCategoryLists,
              membershipLists,
              membershipOnlyVisibleLists,
              factor(context),
              testingUserExam,
              testingUserFlashcardExam));
    }

/* Is Administrator */
    if (isLogin && loginIsAdministrator) {
      return Scaffold(
          appBar: AppBar(
            title: const Text(appName),
            backgroundColor: primaryColor,
          ),
          drawer: Menu(
            context: context,
            homePageState: this,
          ),
          body: Container());
    }

/* Is Customer */
    if (isLogin && loginIsCustomer) {
      return Scaffold(
          appBar: ApplicationBarCustomer(
            context: context,
            title: "",
            backgroundColor: primaryColor,
            withRefreshWeb: false,
            homePageState: this,
          ),
          drawer: Menu(
            context: context,
            homePageState: this,
          ),
          body: customerBuild(
              this,
              context,
              customerCategoryLists,
              membershipLists,
              membershipOnlyVisibleLists,
              factor(context),
              testingUserExam,
              testingUserFlashcardExam));
    }

/*  Default Screen */
    return Scaffold(
        appBar: AppBar(
          title: const Text(""),
          backgroundColor: customBackcolor,
        ),
        drawer: Menu(
          context: context,
          homePageState: this,
        ),
        body: Container());
  }

  double getDisplayWidth() {
    return displayWidth(context);
  }

  double getDisplayHeight() {
    return displayHeight(context);
  }

  void onTabTapped(int index) {
    setState(() {
      _currentIndex = index;
    });
  }

/*
  void setDeliveryNotification() async {
    if (isMobile()) {
      await NotificationService().init();

      FirebaseMessaging.onMessage.listen((RemoteMessage remoteMessage) {
        setStates();

        if (remoteMessage.data['messageType'] == "10") {
          showMessage();
        }
      });

      FirebaseMessaging.onBackgroundMessage(showMessageRemoteMessenger);

      FirebaseMessaging.instance.subscribeToTopic("deliverySaleNew");
    }
  }

  Future<void> showMessageRemoteMessenger(RemoteMessage remoteMessage) async {
    if (remoteMessage.data['messageType'] == "10") {
      showMessage();
    }
  }

  Future<void> showMessage() async {
    try {
      if (isMobile()) {
        String title = deliveryShowMessageTitle;
        String message = deliveryShowMessageDetail;

        FlutterLocalNotificationsPlugin flutterLocalNotificationsPlugin =
            FlutterLocalNotificationsPlugin();

        var initializationSettingsAndroid =
            AndroidInitializationSettings('ic_notification');
        var initializationSettingsIOS = const IOSInitializationSettings(
            onDidReceiveLocalNotification: null);
        var initializationSettings = InitializationSettings(
            android: initializationSettingsAndroid,
            iOS: initializationSettingsIOS);
        flutterLocalNotificationsPlugin.initialize(initializationSettings,
            onSelectNotification: null);

        AndroidNotificationDetails androidPlatformChannelSpecifics =
            AndroidNotificationDetails("1234", "channel",
                channelDescription: "channelDescription",
                importance: Importance.defaultImportance,
                priority: Priority.high);

        NotificationDetails platformChannelSpecifics =
            NotificationDetails(android: androidPlatformChannelSpecifics);

        var rng = Random();

        await flutterLocalNotificationsPlugin.show(
            rng.nextInt(10000), title, message, platformChannelSpecifics,
            payload: message);

//        if (await Vibrate.canVibrate) {
//          Vibrate.vibrate();
//        }
      }
    } on Exception catch (e) {
      e.toString();
    }
  }
*/
}

class HomeReferencePageState extends ReferencePageState {
  HomePageState homePageState;

  HomeReferencePageState(this.homePageState);

  @override
  void setStates() {
    // ignore: invalid_use_of_protected_member
    homePageState.setState(() {});
  }
}

class TimeSeriesSales {
  String key;
  DateTime time;
  double sales;
  int count;

  TimeSeriesSales(this.key, this.time, this.sales, this.count);
}
