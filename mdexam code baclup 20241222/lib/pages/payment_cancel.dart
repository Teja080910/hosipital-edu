import 'package:flutter/material.dart';
import 'package:mdexam/main.dart';
import 'package:mdexam/utils/checkout/base_payment_controller.dart';
import 'package:mdexam/widgets/application_bar.dart';

// ignore: must_be_immutable
class PaymentCancel extends StatefulWidget {
  // ignore: prefer_const_constructors_in_immutables
  PaymentCancel({Key? key, required this.queryParameters}) : super(key: key);

  QueryParameters queryParameters;

  @override
  State<PaymentCancel> createState() => PaymentCancelState();
}

class PaymentCancelState extends State<PaymentCancel> {
  @override
  void initState() {
    super.initState();

    BasePaymentController()
        .processCancel(context, widget.queryParameters, onFinishCancel);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
        appBar: ApplicationBar(
          context: context,
          title: "",
          withShareButton: false,
        ),
        body: Container());
  }

  onFinishCancel() {
    BasePaymentController().navigateReset();
  }
}
