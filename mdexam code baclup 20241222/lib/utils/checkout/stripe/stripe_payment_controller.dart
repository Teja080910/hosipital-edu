import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:mdexam/models/parameter_model.dart';
import 'package:mdexam/utils/checkout/base_payment_controller.dart';
import 'package:mdexam/utils/general/sizes_helpers.dart';
import 'package:mdexam/utils/list_transforms/parameter_list_transforms.dart';

class StripePaymentController extends BasePaymentController {
  String secretKey = "";

  @override
  Future initParameter(List<ParameterModel> parameterList) async {
    // SecretKey
    ParameterModel parameterSecretKey = parameterStringFromKey2ToParameterModel(
        parameterList, "StripePaymentSecretKey");
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

    var productItems = [
      {
        "product_name": productDescription,
        "product_qty": productQuantity,
        "product_price": productPrice,
        'product_currency': productCurrency,
        'success_url':
            localBase + "payment_success?PaymentNumber=$paymentNumber",
        'cancel_url': localBase + "payment_cancel?PaymentNumber=$paymentNumber",
        'customer_email': customerEmail
      },
    ];

    final dynamic resultData =
        await _createCheckoutSession(productItems, secretKey);

    String url = resultData["url"];

    startUrlPageBase(context, url);
  }

  static Future<dynamic> _createCheckoutSession(
      List<dynamic> productItems, String secretKey) async {
    final url = Uri.parse("https://api.stripe.com/v1/checkout/sessions");
    String lineItems = "";
    int index = 0;

    for (var element in productItems) {
      var productPrice = (element["product_price"] * 100).round().toString();
      lineItems +=
          "&line_items[$index][price_data][product_data][name]=${element['product_name']}";
      lineItems += "&line_items[$index][price_data][unit_amount]=$productPrice";
      lineItems +=
          "&line_items[$index][price_data][currency]=${element['product_currency']}";
      lineItems +=
          "&line_items[$index][quantity]=${element['product_qty'].toString()}";
      lineItems += "&success_url=${element['success_url']}";
      lineItems += "&cancel_url=${element['cancel_url']}";
      lineItems += "&customer_email=${element['customer_email']}";

      index++;
    }

    final response = await http.post(
      url,
      body:
          'success_url=https://checkout.stripe.dev/success&mode=payment$lineItems',
      headers: {
        'Authorization': 'Bearer $secretKey',
        'Content-Type': 'application/x-www-form-urlencoded'
      },
    );

    return json.decode(response.body);
  }

/*
  static Future<dynamic> _createCheckoutSession(
      List<dynamic> productItems, totalAmount2, String secretKey) async {
    final url = Uri.parse("https://api.stripe.com/v1/checkout/sessions");
    String lineItems = "";
    int index = 0;

    for (var element in productItems) {
      var productPrice = (element["productPrice"] * 100).round().toString();
      lineItems +=
          "&line_items[$index][price_data][product_data][name]=${element['productName']}";
      lineItems += "&line_items[$index][price_data][unit_amount]=$productPrice";
      lineItems += "&line_items[$index][price_data][currency]=USD";
      lineItems += "&line_items[$index][quantity]=${element['qty'].toString()}";

      lineItems += "&success_url=https://checkout.stripe.dev/success?id=1234";
      lineItems += "&cancel_url=https://checkout.stripe.dev/cancel?id=1234";
      lineItems += "&customer_email=pedro@hotmail.com";

      index++;
    }

    final response = await http.post(
      url,
      body:
          'success_url=https://checkout.stripe.dev/success&mode=payment$lineItems',
      headers: {
        'Authorization': 'Bearer $secretKey',
        'Content-Type': 'application/x-www-form-urlencoded'
      },
    );

    return json.decode(response.body);
  }

  static Future<dynamic> stripePaymentCheckout(
    productItems,
    subTotal,
    context,
    mounted,
    publishableKey_2,
    secretKey, {
    onSuccess,
    onCancel,
    onError,
  }) async {
    final dynamic resultData =
        await _createCheckoutSession(productItems, subTotal, secretKey);

//    final String sessionId = resultData["id"];
    String macroUrl = resultData["url"];

    if (isWeb()) {
      universal_html.window.open(macroUrl, "_self");
    } else {
      Navigator.push<void>(
          context,
          MaterialPageRoute<void>(
              builder: (BuildContext context) =>
                  CustomWebView(title: "", url: macroUrl)));
    }

/*
    // ignore: deprecated_member_use_from_same_package
    final result = await redirectToCheckout(
      context: context,
      sessionId: sessionId,
      publishableKey: publishableKey,
      macroUrl: macroUrl,
      successUrl: "https://checkout.stripe.dev/success",
      canceledUrl: "https://checkout.stripe.dev/cancel",
    );

    if (mounted) {
      final text = result.when(
        redirected: () => 'Redirected Successfuly',
        success: () => onSuccess(),
        canceled: () => onCancel(),
        error: (e) => onError(e),
      );

      return text;
    }
*/
  }
  */
}
