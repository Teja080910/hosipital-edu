/*
import 'package:flutter/material.dart';
import 'package:mdexam/models/parameter_model.dart';
import 'package:mdexam/utils/checkout/base_payment_controller.dart';
import 'package:mdexam/utils/checkout/paypal/v2/paypal_v2_services.dart';
import 'package:mdexam/utils/general/sizes_helpers.dart';
// ignore: unused_import
import 'package:mdexam/utils/list_transforms/parameter_list_transforms.dart';

class PaypalV2PaymentController extends BasePaymentController {
  bool sandboxMode = true;
  String clientId = "";
  String secretKey = "";

  @override
  Future initParameter(List<ParameterModel> parameterList) async {
    clientId =
        "AQlzSWxUvY3yZQehw8_ezoNOwNPSGpVIj6TYsNeIEwNfyc6tgIUelVX-7dseWGjs4wqFLsExWVxMgXcX";
    secretKey =
        "EGMvVsfCRhKxuyq0onZ7_r0io_2IVd-TpSi4epynZXpEpyJXmXwxBpWGk2DJHWSvFDUsu782OBui605Y";

/*
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
*/
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

  localBase = "http://localhost:60730/";

    if (isMobile()) {
      localBase = localBase.replaceAll("/#/", "/#/wb_");
    }


    

    PaypalV2Services services = PaypalV2Services(
      sandboxMode: sandboxMode,
      clientId: clientId,
      secretKey: secretKey,
    );

    String returnURL =
        localBase + "payment_success?PaymentNumber=$paymentNumber";
    String cancelURL =
        localBase + "payment_cancel?PaymentNumber=$paymentNumber";

    var transactions = {
      "intent": "CAPTURE",
      "payment_source": {
        "paypal": {
          "experience_context": {
            "return_url": returnURL,
            "cancel_url": cancelURL,
            "payment_method_preference": "IMMEDIATE_PAYMENT_REQUIRED",
            "user_action": "PAY_NOW",
          },
        }
      },
      "purchase_units": [
        {
          "description": productDescription + " (" + customerEmail + ")",
          "amount": {
            "currency_code": productCurrency.toString(),
            "value": productPrice.toString(),
            "breakdown": {
              "item_total": {
                "currency_code": productCurrency.toString(),
                "value": productPrice.toString(),
              }
            }
          },
          "items": [
            {
              "name": productDescription,
              "quantity": productQuantity.toString(),
              "description": productDescription + " (" + customerEmail + ")",
              "unit_amount": {
                "currency_code": productCurrency.toString(),
                "value": productPrice.toString()
              }
            }
          ]
        }
      ]
    };

    try {
      Map getToken = await services.getAccessToken();

      if (getToken['token'] != null) {
        String accessToken = getToken['token'];

        final res =
            await services.createPaypalPayment(transactions, accessToken);

        if (res["approvalUrl"] != null) {
          String url = res["approvalUrl"];

          startUrlPageBase(context, url);
        }
      }
    } catch (e) {
      e.toString();
    }
  }
}
*/
