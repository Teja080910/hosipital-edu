import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:firebase_storage/firebase_storage.dart';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:mdexam/models/video_category_model.dart';
import 'package:mdexam/models/video_model.dart';
import 'package:mdexam/utils/general/global.dart';
import 'package:mdexam/utils/general/show_dialog_wait.dart';
import 'package:mdexam/variables/globalvar.dart';
import 'package:uuid/uuid.dart';

class FirebaseCustomVideoHelper {
  Future add(
      {required BuildContext context,
      required VideoCategoryModel category,
      required String title,
      required String url,
      required XFile? pickedFile,
      required bool isNewImage,
      required VoidCallback onFinished,
      required StringCallback onError}) async {
    ShowDialogWait showDialogWait = ShowDialogWait();
    showDialogWait.show(context, videoNewSaving);

    try {
      String error = "";

      var uuid = const Uuid();
      String extensionPreview = ".png";
      String fileNamePreview = uuid.v1() + extensionPreview;

      if (error.isEmpty) {
        // Video
        VideoModel videoModel = VideoModel(false, "", category, title,
            fileNamePreview, "", url, true, DateTime.now().toUtc());

        FirebaseStorage storage = FirebaseStorage.instance;
        Reference ref =
            storage.ref().child(firebaseCustomVideoKey).child(fileNamePreview);

        UploadTask uploadTask = ref.putData(await pickedFile!.readAsBytes());
        await uploadTask.whenComplete(() async {
          String urlDownloadPreview = await ref.getDownloadURL();

          videoModel.urlPreview = urlDownloadPreview;

          final firestoreInstance = FirebaseFirestore.instance;

          CollectionReference video =
              firestoreInstance.collection(firebaseCustomVideoKey);
          video.doc().set(videoModel.toJsonWithExportKeyToId(true));

          showDialogWait.hide(context);

          onFinished();
        });
      } else {
        showDialogWait.hide(context);

        onError(error);
      }
    } on FirebaseAuthException catch (e) {
      showDialogWait.hide(context);
      onError(e.message.toString());
    }
  }

  Future modify(
      {required BuildContext context,
      required VideoModel videoModel,
      required XFile? pickedFile,
      required bool isNewImage,
      required VoidCallback onFinished,
      required StringCallback onError}) async {
    ShowDialogWait showDialogWait = ShowDialogWait();
    showDialogWait.show(context, videoModifySaving);

    try {
      videoModel.creationTime = DateTime.now().toUtc();

      if (isNewImage) {
        String fileName = videoModel.storagePreview;

        FirebaseStorage storage = FirebaseStorage.instance;
        Reference ref =
            storage.ref().child(firebaseCustomVideoKey).child(fileName);

        UploadTask uploadTask = ref.putData(await pickedFile!.readAsBytes());
        await uploadTask.whenComplete(() async {
          String urlDownload = await ref.getDownloadURL();

          videoModel.urlPreview = urlDownload;

          final firestoreInstance = FirebaseFirestore.instance;
          await firestoreInstance
              .collection(firebaseCustomVideoKey)
              .doc(videoModel.key)
              .update(videoModel.toJsonWithExportKeyToId(true));
        });
      } else {
        final firestoreInstance = FirebaseFirestore.instance;
        await firestoreInstance
            .collection(firebaseCustomVideoKey)
            .doc(videoModel.key)
            .update(videoModel.toJsonWithExportKeyToId(true));
      }

      showDialogWait.hide(context);
      onFinished();
    } on FirebaseAuthException catch (e) {
      showDialogWait.hide(context);

      onError(e.message.toString());
    }
  }

  Future delete(
      {required BuildContext context,
      required VideoModel videoModel,
      required VoidCallback onFinished,
      required StringCallback onError}) async {
    ShowDialogWait showDialogWait = ShowDialogWait();
    showDialogWait.show(context, videoDeleteSaving);

    try {
      final firestoreInstance = FirebaseFirestore.instance;
      await firestoreInstance
          .collection(firebaseCustomVideoKey)
          .doc(videoModel.key)
          .delete();

      showDialogWait.hide(context);
      onFinished();
    } on FirebaseAuthException catch (e) {
      showDialogWait.hide(context);

      onError(e.message.toString());
    }
  }
}
