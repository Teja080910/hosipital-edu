import 'package:flutter/material.dart';
import 'package:mdexam/main.dart';
import 'package:mdexam/utils/checkout/base_payment_controller.dart';
import 'package:mdexam/widgets/application_bar_without_back_button.dart';

// ignore: must_be_immutable
class WBPaymentCancel extends StatefulWidget {
  // ignore: prefer_const_constructors_in_immutables
  WBPaymentCancel({Key? key, required this.queryParameters}) : super(key: key);

  QueryParameters queryParameters;

  @override
  State<WBPaymentCancel> createState() => WBPaymentCancelState();
}

class WBPaymentCancelState extends State<WBPaymentCancel> {
  @override
  void initState() {
    super.initState();

    BasePaymentController()
        .processCancel(context, widget.queryParameters, onFinishCancel);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
        appBar: ApplicationBarWithoutBackButton(
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
