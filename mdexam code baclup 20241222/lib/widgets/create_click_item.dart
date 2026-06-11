import 'package:flutter/material.dart';

Widget createClickItem(
    {required IconData icon,
    required String title,
    required String subTitle,
    required Color textColor,
    GestureTapCallback? onTap}) {
  return GestureDetector(
    child: Padding(
        padding: const EdgeInsets.all(15),
        child: ClipRRect(
            borderRadius: BorderRadius.circular(10),
            child: Container(
                color: Colors.blue[700],
                child: Padding(
                    padding: const EdgeInsets.only(
                        left: 20, top: 30, bottom: 30, right: 20),
                    child: Row(
                      children: <Widget>[
                        Icon(icon, color: Colors.white),
                        Expanded(
                          child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              mainAxisAlignment: MainAxisAlignment.start,
                              children: [
                                Padding(
                                    padding: const EdgeInsets.only(left: 8.0),
                                    child: Text(title.toUpperCase(),
                                        style: const TextStyle(
                                            color: Colors.white,
                                            fontSize: 15))),
                                subTitle.isNotEmpty
                                    ? Padding(
                                        padding:
                                            const EdgeInsets.only(left: 8.0),
                                        child: Text(subTitle.toUpperCase(),
                                            style: const TextStyle(
                                                color: Colors.white,
                                                fontSize: 12)))
                                    : Container(),
                              ]),
                        ),
                        const Icon(
                          Icons.arrow_forward_ios,
                          color: Colors.white,
                        )
                      ],
                    ))))),
    onTap: onTap,
  );
}
