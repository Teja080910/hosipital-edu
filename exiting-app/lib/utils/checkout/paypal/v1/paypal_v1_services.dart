import 'dart:convert';
import 'dart:async';
import 'package:http/http.dart' as http;

class PaypalV1Services {
  final String clientId, secretKey;
  final bool sandboxMode;
  PaypalV1Services({
    required this.clientId,
    required this.secretKey,
    required this.sandboxMode,
  });

  getAccessToken() async {
    String domain = sandboxMode
        ? "https://api-m.sandbox.paypal.com"
        : "https://api-m.paypal.com";

    try {
      var authToken = base64.encode(
        utf8.encode("$clientId:$secretKey"),
      );

      final response = await http.post(
        Uri.parse('$domain/v1/oauth2/token?grant_type=client_credentials'),
        headers: {
          'Authorization': 'Basic $authToken',
          'Content-Type': 'application/x-www-form-urlencoded'
        },
      );

      if (response.statusCode == 200) {
        final body = jsonDecode(response.body);
        return {
          'error': false,
          'message': "Success",
          'token': body["access_token"]
        };
      } else {
        return {
          'error': true,
          'message': "Your PayPal credentials seems incorrect"
        };
      }
    } catch (e) {
      return {
        'error': true,
        'message': "Unable to proceed, check your internet connection."
      };
    }
  }

  Future<Map> createPaypalPayment(
    transactions,
    accessToken,
  ) async {
    String domain = sandboxMode
        ? "https://api-m.sandbox.paypal.com"
        : "https://api-m.paypal.com";

    try {
      final response = await http.post(
        Uri.parse('$domain/v1/payments/payment'),
        body: jsonEncode(transactions),
        headers: {
          'Authorization': 'Bearer $accessToken',
          'Content-Type': 'application/json'
        },
      );

      final body = jsonDecode(response.body);
      if (response.statusCode == 201) {
        if (body["links"] != null && body["links"].length > 0) {
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
          return {"executeUrl": executeUrl, "approvalUrl": approvalUrl};
        }
        return {};
      } else {
        return body;
      }
    } catch (e) {
      rethrow;
    }
  }

  Future<Map> executePayment(
    paymentId,
    payerId,
    accessToken,
  ) async {
    try {
      String domain = sandboxMode
          ? "https://api-m.sandbox.paypal.com"
          : "https://api-m.paypal.com";

      final response = await http.post(
        Uri.parse('$domain/v1/payments/payment/$paymentId/execute'),
        body: jsonEncode({"payer_id": payerId}),
        headers: {
          'Authorization': 'Bearer $accessToken',
          'Content-Type': 'application/json'
        },
      );

      final body = jsonDecode(response.body);
      if (response.statusCode == 200) {
        return {'error': false, 'message': "Success", 'data': body};
      } else {
        return {'error': true, 'message': "Payment Failed.", 'data': body};
      }
    } catch (e) {
      return {'error': true, 'message': e, 'exception': true, 'data': null};
    }
  }
}
