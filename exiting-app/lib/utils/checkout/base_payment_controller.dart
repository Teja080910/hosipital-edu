import 'package:flutter/material.dart';
import 'package:mdexam/main.dart';
import 'package:mdexam/models/parameter_model.dart';
import 'package:mdexam/pages/custom_web_view.dart';
import 'package:mdexam/utils/firebase/firebase_custom_membership.dart';
import 'package:mdexam/utils/general/sizes_helpers.dart';
import 'package:mdexam/variables/globalvar.dart';
import "package:universal_html/html.dart" as universal_html;

class BasePaymentController {
  static String baseUrl = "https://md-exam-app.web.app/#/";

  void initParameter(List<ParameterModel> parameterList) {}

  Future startUrlPayment(
      BuildContext context,
      String customerEmail,
      String productDescription,
      int productQuantity,
      double productPrice,
      String productCurrency,
      String paymentNumber) async {}

  Future startUrlPageBase(BuildContext context, String urlPage) async {
    try {
      if (isWeb()) {
        universal_html.window.open(urlPage, "_self");
      } else {
        Navigator.push<void>(
            context,
            MaterialPageRoute<void>(
                builder: (BuildContext context) =>
                    CustomWebView(title: "", url: urlPage)));
      }
    } on Exception catch (e) {
      e.toString();
    }
  }

  void processApproved(BuildContext context, QueryParameters queryParameters,
      onFinishApproved) async {
    String paymentNumber = queryParameters.getValue('PaymentNumber');

// ignore: unnecessary_null_comparison
    if (paymentNumber != null) {
      FirebaseCustomMembershipHelper()
          .confirmPurchase(context: context, paymentNumber: paymentNumber)
          .then((result) {
        if (result == null) {
          onFinishApproved(paymentViewConfirmateSaved);
        } else {
          onFinishApproved(result);
        }
      });
    }
  }

  void processCancel(BuildContext context, QueryParameters queryParameters,
      onFinishCancel) async {
    String paymentNumber = queryParameters.getValue('PaymentNumber');

// ignore: unnecessary_null_comparison
    if (paymentNumber != null) {
      FirebaseCustomMembershipHelper()
          .cancelPurchase(context: context, paymentNumber: paymentNumber)
          .then((result) {
        if (result == null) {
          onFinishCancel();
        } else {
          onFinishCancel();
        }
      });
    }
  }

  void navigateReset() {
    String url = Uri.base.toString();
    String path = Uri.base.path;

    int pos = url.indexOf(path);

    universal_html.window.open(url.substring(0, pos), "_self");
  }
}
