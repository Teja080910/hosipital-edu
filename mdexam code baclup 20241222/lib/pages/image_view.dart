import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:mdexam/widgets/application_bar.dart';

// ignore: must_be_immutable
class ImageFullView extends StatefulWidget {
  String url;

  ImageFullView({Key? key, required this.url}) : super(key: key);

  @override
  State<ImageFullView> createState() => _ImageFullViewState();
}

class _ImageFullViewState extends State<ImageFullView> {
  Future<bool> _onBackPressed() async {
    return true;
  }

  void init() {}

  @override
  Widget build(BuildContext context) {
    return WillPopScope(
      onWillPop: _onBackPressed,
      child: Scaffold(
        appBar: ApplicationBar(
          context: context,
          title: "",
          withShareButton: false,
        ),
        body: ListView(children: [
          CachedNetworkImage(
            imageUrl: widget.url,
            placeholder: (context, url) => const CircularProgressIndicator(),
            errorWidget: (context, url, error) => const Icon(Icons.error),
            fit: BoxFit.cover,
          ),
        ]),
      ),
    );
  }
}
