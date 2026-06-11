import 'package:mdexam/pages/home.dart';
import 'package:mdexam/pages/parameter_list.dart';
import 'package:mdexam/pages/payment_cancel.dart';
import 'package:mdexam/pages/payment_confirm.dart';
import 'package:mdexam/pages/payment_paypal_confirm.dart';
import 'package:mdexam/pages/tos.dart';
import 'package:mdexam/pages/user_list.dart';
import 'package:mdexam/pages/user_lostpassword.dart';
import 'package:mdexam/pages/wb_payment_cancel.dart';
import 'package:mdexam/pages/wb_payment_confirm.dart';
import 'package:mdexam/utils/general/sizes_helpers.dart';
import 'package:mdexam/variables/globalvar.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:flutter/material.dart';

DateTime defaultDateTime = DateTime.utc(1969, 7, 20, 20, 18, 04);

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  if (isWeb()) {
    await Firebase.initializeApp(
        options: const FirebaseOptions(
            apiKey: "AIzaSyCPl1-sBA7vZo4VDsY8lHG-SLhjYKAaMak",
            authDomain: "md-exam-app.firebaseapp.com",
            projectId: "md-exam-app",
            storageBucket: "md-exam-app.appspot.com",
            messagingSenderId: "112666543658",
            appId: "1:112666543658:web:05c619bf141528c9e26553"));
  } else {
    await Firebase.initializeApp();

//    if (isIOS()) {
//      InAppPurchaseStoreKitPlatform.registerPlatform();
//    }
  }

  runApp(const App());
}

// ignore: must_be_immutable
class App extends StatelessWidget {
  const App({Key? key}) : super(key: key);

  // This widget is the root of your application.
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: appName,
      theme: ThemeData(
        primarySwatch: Colors.blue,
      ),

//      initialRoute: "/",
/*      
      routes: <String, WidgetBuilder>{
        '/': (context) => HomePage(idProfiler: IdProfiler.general),
        '/UserLostPassword': (context) => const UserLostPassword(),
        '/UserList': (context) => const UserList(),
        '/CityList': (context) => const CityList(),
        '/PaymentMethodList': (context) => const PaymentMethodList(),
        '/PublicationCategorieList': (context) =>
            const PublicationCategorieList(),
        '/VehicleTypeList': (context) => const VehicleTypeList(),
        '/ParameterList': (context) => const ParameterList(),
        '/HomeCommerce': (context) => HomePage(idProfiler: IdProfiler.commerce),
        '/HomeDelivery': (context) => HomePage(idProfiler: IdProfiler.delivery),
        '/HomeCustomer': (context) => HomePage(idProfiler: IdProfiler.customer),
        '/PublicationStatuList': (context) => const PublicationStatuList(),
      },
*/
      onGenerateRoute: generateRoute,
    );
  }

  Route<dynamic> generateRoute(RouteSettings settings) {
    String path;
    QueryParameters queryParameters = QueryParameters();

    if (!settings.name!.contains("?")) {
      path = settings.name!;
    } else {
      path = settings.name!.split("?")[0];
      for (String value in settings.name!.split("?")[1].split("&")) {
        List<String> tPart = value.split("=");
        queryParameters.add(tPart[0], tPart[1]);
      }
    }

    switch (path) {
      case "/payment_paypal_success":
        return MaterialPageRoute(
          builder: (context) {
            return PaymentPayPalConfirm(queryParameters: queryParameters);
          },
          settings: settings,
        );

      case "/payment_success":
        return MaterialPageRoute(
          builder: (context) {
            return PaymentConfirm(queryParameters: queryParameters);
          },
          settings: settings,
        );

      case "/payment_cancel":
        return MaterialPageRoute(
          builder: (context) {
            return PaymentCancel(queryParameters: queryParameters);
          },
          settings: settings,
        );

      case "/wb_payment_success":
        return MaterialPageRoute(
          builder: (context) {
            return WBPaymentConfirm(queryParameters: queryParameters);
          },
          settings: settings,
        );

      case "/wb_payment_cancel":
        return MaterialPageRoute(
          builder: (context) {
            return WBPaymentCancel(queryParameters: queryParameters);
          },
          settings: settings,
        );

      case "/UserLostPassword":
        return MaterialPageRoute(
          builder: (context) {
            return const UserLostPassword();
          },
          settings: settings,
        );

      case "/UserList":
        return MaterialPageRoute(
          builder: (context) {
            return const UserList();
          },
          settings: settings,
        );

      case "/ParameterList":
        return MaterialPageRoute(
          builder: (context) {
            return const ParameterList();
          },
          settings: settings,
        );

      case "/Tos":
        return MaterialPageRoute(
          builder: (context) {
            return const Tos();
          },
          settings: settings,
        );

      default:
        return MaterialPageRoute(
          builder: (context) {
            return HomePage(idProfiler: IdProfiler.general);
          },
          settings: settings,
        );
    }
  }
}

class QueryParameter {
  String key;
  String value;

  QueryParameter(this.key, this.value);
}

class QueryParameters {
  List<QueryParameter> queryParameters = [];

  void add(String key, String value) {
    queryParameters.add(QueryParameter(key, value));
  }

  String getValue(String key) {
    for (QueryParameter queryParameter in queryParameters) {
      if (queryParameter.key.compareTo(key) == 0) {
        return queryParameter.value;
      }
    }

    return "";
  }
}
