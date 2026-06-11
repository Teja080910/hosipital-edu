import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter/material.dart';
import 'package:mdexam/models/parameter_model.dart';
import 'package:mdexam/utils/checkout/base_payment_controller.dart';
import 'package:mdexam/utils/checkout/paypal/v1/paypal_v1_services.dart';
import 'package:mdexam/utils/firebase/firebase_custom_flashcard_question.dart';
import 'package:mdexam/utils/general/sizes_helpers.dart';
import 'package:mdexam/variables/globalvar.dart';
import 'package:mdexam/utils/list_transforms/parameter_list_transforms.dart';

class PaypalV1PaymentController extends BasePaymentController {
  bool sandboxMode = true;
  String clientId = "";
  String secretKey = "";

  List<ParameterModel> listParameters = [];

  @override
  Future initParameter(List<ParameterModel> parameterList) async {
    // SandboxMode
    ParameterModel parameterSandboxMode =
        parameterStringFromKey2ToParameterModel(
            parameterList, "PaypalPaymentSandboxMode");
    sandboxMode =
        parameterSandboxMode.additional.compareTo("False") == 0 ? false : true;

    // ClientId
    ParameterModel parameterClientId = parameterStringFromKey2ToParameterModel(
        parameterList, "PaypalPaymentClientId");
    clientId = parameterClientId.additional;

    // SecretKey
    ParameterModel parameterSecretKey = parameterStringFromKey2ToParameterModel(
        parameterList, "PaypalPaymentSecretKey");
    secretKey = parameterSecretKey.additional;
  }

  @override
  Future startUrlPayment(
      BuildContext context,
      String customerEmail,
      String productDescription,
      int productQuantity,
      double productPrice,
      String productCurrency,
      String paymentNumber) async {
    String localBase = BasePaymentController.baseUrl;
    if (isMobile()) {
      localBase = localBase.replaceAll("/#/", "/#/wb_");
    }

    PaypalV1Services services = PaypalV1Services(
      sandboxMode: sandboxMode,
      clientId: clientId,
      secretKey: secretKey,
    );

    var transactions = [
      {
        "amount": {
          "total": (productQuantity * productPrice).toString(),
          "currency": productCurrency,
          "details": {
            "subtotal": (productQuantity * productPrice).toString(),
            "shipping": '0',
            "shipping_discount": 0
          }
        },
        "description": productDescription,
        "item_list": {
          "items": [
            {
              "name": productDescription,
              "quantity": productQuantity,
              "price": productPrice.toString(),
              "currency": productCurrency
            },
          ],

/*
          // shipping address is Optional
          "shipping_address": {
            "recipient_name": "",
            "line1": "",
            "line2": "",
            "city": "",
            "country_code": "US",
            "postal_code": "",
            "phone": "",
            "state": ""
          },
*/
        }
      }
    ];

    String note = customerEmail;
    String returnURL =
        localBase + "payment_paypal_success?PaymentNumber=$paymentNumber";
    String cancelURL =
        localBase + "payment_cancel?PaymentNumber=$paymentNumber";

    try {
      Map getToken = await services.getAccessToken();

      if (getToken['token'] != null) {
        String accessToken = getToken['token'];
        final transactions2 =
            _getOrderParams(transactions, note, returnURL, cancelURL);
        final res =
            await services.createPaypalPayment(transactions2, accessToken);

        if (res["approvalUrl"] != null) {
          String url = res["approvalUrl"];

          startUrlPageBase(context, url);
        }
      }
    } catch (e) {
      e.toString();
    }
  }

  Future executePayment(BuildContext context, String paymentId, String payerId,
      VoidCallback onSuccess, VoidCallbackString onError) async {
    loadParameters(
      () async {
        initParameter(listParameters);

        PaypalV1Services services = PaypalV1Services(
          sandboxMode: sandboxMode,
          clientId: clientId,
          secretKey: secretKey,
        );

        try {
          Map getToken = await services.getAccessToken();

          if (getToken['token'] != null) {
            String accessToken = getToken['token'];

            final res =
                await services.executePayment(paymentId, payerId, accessToken);

            if (!res["error"]) {
              onSuccess();
            } else {
              onError(res["data"]);
            }
          }
        } catch (e) {
          e.toString();
        }
      },
    );
  }

  static Map _getOrderParams(
    List transactions,
    String note,
    String returnURL,
    String cancelURL,
  ) {
    Map<String, dynamic> temp = {
      "intent": "sale",
      "payer": {"payment_method": "paypal"},
      "transactions": transactions,
      "note_to_payer": note,
      "redirect_urls": {"return_url": returnURL, "cancel_url": cancelURL}
    };
    return temp;
  }

  void loadParameters(VoidCallback onFinished) async {
    try {
      listParameters.clear();

      final firestoreInstance = FirebaseFirestore.instance;

      CollectionReference parameters =
          firestoreInstance.collection(firebaseCustomParameterKey);

      parameters.orderBy("title").get().then((querySnapshot) {
        for (var result in querySnapshot.docs) {
          uniquedAdd(listParameters,
              ParameterModel.fromJSON(false, result.id, result.data()));
        }

        onFinished();
      });
    } on FirebaseException catch (e) {
      e.stackTrace;
    }
  }
}
