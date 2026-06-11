import 'package:flutter/material.dart';
import 'package:universal_platform/universal_platform.dart';

const double constLimitMaxWidth = 600;

Size displaySize(BuildContext context) {
  return MediaQuery.of(context).size;
}

double displayHeight(BuildContext context) {
  double result =
      displaySize(context).height - MediaQuery.of(context).padding.top;

  if (!(UniversalPlatform.isAndroid || UniversalPlatform.isIOS)) {
    result = result - kToolbarHeight;
  }

  return result;
}

double displayWidth(BuildContext context) {
  return displaySize(context).width;
}

double limitMaxWidth(BuildContext context) {
  double width = displayWidth(context);

  if (width > constLimitMaxWidth) {
    return constLimitMaxWidth;
  } else {
    return width;
  }
}

bool isMobile() {
  return UniversalPlatform.isAndroid || UniversalPlatform.isIOS;
}

bool isWeb() {
  return !(UniversalPlatform.isAndroid || UniversalPlatform.isIOS);
}

double factor(BuildContext context) {
  if (displayWidth(context) < 700) {
    return 0.7;
  } else {
    return 1;
  }
}

bool isIOS() {
  return UniversalPlatform.isIOS;
//  return true;
}
