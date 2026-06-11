// ignore: avoid_web_libraries_in_flutter, library_prefixes
//import 'dart:html' as dartHtml;
import 'package:mdexam/utils/general/sizes_helpers.dart';
import "package:universal_html/html.dart" as universal_html;
import 'package:mdexam/variables/globalvar.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_layout_grid/flutter_layout_grid.dart';
import 'package:url_launcher/url_launcher.dart';

class GridManager {
  List<Widget> headers = [];
  List<GridRow> rows = [];
  String areas = "";

  GridManager addHeader(Widget header) {
    headers.add(header);

    return this;
  }

  GridManager addRow(GridRow row) {
    rows.add(row);

    return this;
  }

  Widget build(BuildContext context) {
    if (headers.isNotEmpty && rows.isNotEmpty) {
      List<TrackSize> rowSizes = [];
      List<TrackSize> columnSizes = [];
      List<Widget> widgets = [];

      // AREAS
//      areas = "'''"; //+ String.fromCharCode(13) + String.fromCharCode(10);
      areas = "";
      for (int i = 0; i < headers.length; i++) {
        areas = areas + "h" + i.toString();
        if (i < headers.length) {
          areas = areas + " ";
        }

        columnSizes.add(const IntrinsicContentTrackSize());

        Widget headerContent = headers[i];
//        String key = "h" + (i + 1).toString() + "";

        widgets.add(headerContent.inGridArea("h" + i.toString()));
      }

//      widgets.add(_section(primaryColor, const Text('H1')).inGridArea('h1'));

      areas = areas + String.fromCharCode(13) + String.fromCharCode(10);

      for (int i = 0; i < rows.length; i++) {
        for (int j = 0; j < headers.length; j++) {
          areas = areas + getContentID(i, j);
          if (j < headers.length) {
            areas = areas + " ";
          }

          Widget content = rows[i].columns[j];
          widgets.add(content.inGridArea(getContentID(i, j)));
        }
        areas = areas + String.fromCharCode(13) + String.fromCharCode(10);

        rowSizes.add(const IntrinsicContentTrackSize());
      }
      rowSizes.add(const IntrinsicContentTrackSize());

//      areas = areas //+ String.fromCharCode(13) + String.fromCharCode(10)
//          +
//          "'";

      return Padding(
          padding: const EdgeInsets.all(10),
          child: LayoutGrid(
            areas: areas,
            columnSizes: columnSizes,
            rowSizes: rowSizes,
            columnGap: 1,
            rowGap: 2,
            children: widgets,
          ));
    } else {
      return Container();
    }
  }

  String getContentID(int row, int column) {
    return "c" + row.toString() + "_" + column.toString();
  }
}

class GridRow {
  List<Widget> columns = [];

  GridRow addColumn(Widget column) {
    columns.add(column);

    return this;
  }
}

Widget simpleTitleText(String text) {
  return simpleTextBase(
      text, 15, FontWeight.bold, 10, gridTitleColor, primaryColor);
}

Widget simpleContentText(String text) {
  return simpleTextBase(
      text, 14, FontWeight.normal, 2, Colors.black, Colors.transparent);
}

Widget simpleTextBase(String text, double fontSize, FontWeight fontWeight,
    double padding, Color foreColor, Color backColor) {
  return Container(
      width: double.infinity,
      height: double.infinity,
      color: backColor,
      padding: EdgeInsets.all(padding),
      child: Center(
        child: Text(text,
            style: TextStyle(
                color: foreColor, fontSize: fontSize, fontWeight: fontWeight)),
        //Text(text),
      ));
}

Widget simpleRoundImage(String url, double radius) {
  return Center(
      child: ClipRRect(
          borderRadius: BorderRadius.circular(radius),
          child: SizedBox(
            width: radius,
            height: radius,
            child: CachedNetworkImage(
              imageUrl: url,
              placeholder: (context, url) => const CircularProgressIndicator(),
              errorWidget: (context, url, error) => const Icon(Icons.error),
              fit: BoxFit.cover,
            ),
          )));
}

Widget simpleUrlDownload(String heroTag, String tooltip, String url) {
  return Center(
      child: FloatingActionButton(
          mini: true,
          onPressed: () {
            downloadFile(url);
          },
          heroTag: heroTag,
          tooltip: tooltip,
          child: const Icon(Icons.file_download)));
}

downloadFile(String url) async {
  if (!isMobile()) {
    universal_html.AnchorElement anchorElement =
        universal_html.AnchorElement(href: url);
    anchorElement.download = "";
    anchorElement.click();
  } else {
    // ignore: deprecated_member_use
    if (await canLaunch(url)) {
      // ignore: deprecated_member_use
      await launch(url);
    } else {
      throw 'Could not launch $url';
    }
  }
}


Widget simpleCheckbox(String title, bool value) {
  return Center(
      child: Column(children: [
    Checkbox(
      value: value,
      onChanged: (bool? value) {},
    ),
    title.isNotEmpty ? Text(title) : Container()
  ]));
}
