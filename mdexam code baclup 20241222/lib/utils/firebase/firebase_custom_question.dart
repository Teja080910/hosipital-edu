import 'package:firebase_storage/firebase_storage.dart';
import 'package:image_picker/image_picker.dart';
import 'package:mdexam/models/category_model.dart';
import 'package:mdexam/models/question_model.dart';
import 'package:mdexam/utils/general/show_dialog_wait.dart';
import 'package:mdexam/variables/globalvar.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';

typedef VoidCallbackSavePhotoFinish = void Function(String storage, String url);
typedef VoidCallbackString = void Function(String string);

class FirebaseCustomQuestionHelper {
  Future add(
      {required BuildContext context,
      required QuestionModel questionModel,
      required bool isNewImage01Title,
      required XFile pickedFile01Title,
      required bool isNewImage02Title,
      required XFile pickedFile02Title,
      required bool isNewImage03Title,
      required XFile pickedFile03Title,
      required bool isNewImage01Explanation,
      required XFile pickedFile01Explanation,
      required bool isNewImage02Explanation,
      required XFile pickedFile02Explanation,
      required bool isNewImage03Explanation,
      required XFile pickedFile03Explanation,
      required bool isNewImage01Reference,
      required XFile pickedFile01Reference,
      required bool isNewImage02Reference,
      required XFile pickedFile02Reference,
      required bool isNewImage03Reference,
      required XFile pickedFile03Reference,
      required VoidCallback onFinish,
      required VoidCallbackString onError}) async {
    ShowDialogWait showDialogWait = ShowDialogWait();
    showDialogWait.show(context, questionSaving);

    try {
      bool isFinishNewImage01Title = false;
      bool isFinishNewImage02Title = false;
      bool isFinishNewImage03Title = false;

      bool isFinishNewImage01Explanation = false;
      bool isFinishNewImage02Explanation = false;
      bool isFinishNewImage03Explanation = false;

      bool isFinishNewImage01Reference = false;
      bool isFinishNewImage02Reference = false;
      bool isFinishNewImage03Reference = false;

// Title Photo 01
      if (isNewImage01Title) {
        savePhoto("01", "Title", pickedFile01Title,
            (String storage, String url) {
          questionModel
            ..storageTitle01 = storage
            ..urlTitle01 = url;

          isFinishNewImage01Title = true;

          addFinish(
              context,
              showDialogWait,
              questionModel,
              isFinishNewImage01Title,
              isFinishNewImage02Title,
              isFinishNewImage03Title,
              isFinishNewImage01Explanation,
              isFinishNewImage02Explanation,
              isFinishNewImage03Explanation,
              isFinishNewImage01Reference,
              isFinishNewImage02Reference,
              isFinishNewImage03Reference, () {
            onFinish();
          }, (String error) {
            onError(error);
          });
        });
      } else {
        isFinishNewImage01Title = true;

        addFinish(
            context,
            showDialogWait,
            questionModel,
            isFinishNewImage01Title,
            isFinishNewImage02Title,
            isFinishNewImage03Title,
            isFinishNewImage01Explanation,
            isFinishNewImage02Explanation,
            isFinishNewImage03Explanation,
            isFinishNewImage01Reference,
            isFinishNewImage02Reference,
            isFinishNewImage03Reference, () {
          onFinish();
        }, (String error) {
          onError(error);
        });
      }

// Title Photo 02
      if (isNewImage02Title) {
        savePhoto("02", "Title", pickedFile02Title,
            (String storage, String url) {
          questionModel
            ..storageTitle02 = storage
            ..urlTitle02 = url;

          isFinishNewImage02Title = true;

          addFinish(
              context,
              showDialogWait,
              questionModel,
              isFinishNewImage01Title,
              isFinishNewImage02Title,
              isFinishNewImage03Title,
              isFinishNewImage01Explanation,
              isFinishNewImage02Explanation,
              isFinishNewImage03Explanation,
              isFinishNewImage01Reference,
              isFinishNewImage02Reference,
              isFinishNewImage03Reference, () {
            onFinish();
          }, (String error) {
            onError(error);
          });
        });
      } else {
        isFinishNewImage02Title = true;

        addFinish(
            context,
            showDialogWait,
            questionModel,
            isFinishNewImage01Title,
            isFinishNewImage02Title,
            isFinishNewImage03Title,
            isFinishNewImage01Explanation,
            isFinishNewImage02Explanation,
            isFinishNewImage03Explanation,
            isFinishNewImage01Reference,
            isFinishNewImage02Reference,
            isFinishNewImage03Reference, () {
          onFinish();
        }, (String error) {
          onError(error);
        });
      }

// Title Photo 03
      if (isNewImage03Title) {
        savePhoto("03", "Title", pickedFile03Title,
            (String storage, String url) {
          questionModel
            ..storageTitle03 = storage
            ..urlTitle03 = url;

          isFinishNewImage03Title = true;

          addFinish(
              context,
              showDialogWait,
              questionModel,
              isFinishNewImage01Title,
              isFinishNewImage02Title,
              isFinishNewImage03Title,
              isFinishNewImage01Explanation,
              isFinishNewImage02Explanation,
              isFinishNewImage03Explanation,
              isFinishNewImage01Reference,
              isFinishNewImage02Reference,
              isFinishNewImage03Reference, () {
            onFinish();
          }, (String error) {
            onError(error);
          });
        });
      } else {
        isFinishNewImage03Title = true;

        addFinish(
            context,
            showDialogWait,
            questionModel,
            isFinishNewImage01Title,
            isFinishNewImage02Title,
            isFinishNewImage03Title,
            isFinishNewImage01Explanation,
            isFinishNewImage02Explanation,
            isFinishNewImage03Explanation,
            isFinishNewImage01Reference,
            isFinishNewImage02Reference,
            isFinishNewImage03Reference, () {
          onFinish();
        }, (String error) {
          onError(error);
        });
      }

// Explanation Photo 01
      if (isNewImage01Explanation) {
        savePhoto("01", "Explanation", pickedFile01Explanation,
            (String storage, String url) {
          questionModel
            ..storageExplanation01 = storage
            ..urlExplanation01 = url;

          isFinishNewImage01Explanation = true;

          addFinish(
              context,
              showDialogWait,
              questionModel,
              isFinishNewImage01Title,
              isFinishNewImage02Title,
              isFinishNewImage03Title,
              isFinishNewImage01Explanation,
              isFinishNewImage02Explanation,
              isFinishNewImage03Explanation,
              isFinishNewImage01Reference,
              isFinishNewImage02Reference,
              isFinishNewImage03Reference, () {
            onFinish();
          }, (String error) {
            onError(error);
          });
        });
      } else {
        isFinishNewImage01Explanation = true;

        addFinish(
            context,
            showDialogWait,
            questionModel,
            isFinishNewImage01Title,
            isFinishNewImage02Title,
            isFinishNewImage03Title,
            isFinishNewImage01Explanation,
            isFinishNewImage02Explanation,
            isFinishNewImage03Explanation,
            isFinishNewImage01Reference,
            isFinishNewImage02Reference,
            isFinishNewImage03Reference, () {
          onFinish();
        }, (String error) {
          onError(error);
        });
      }

// Explanation Photo 02
      if (isNewImage02Explanation) {
        savePhoto("02", "Explanation", pickedFile02Explanation,
            (String storage, String url) {
          questionModel
            ..storageExplanation02 = storage
            ..urlExplanation02 = url;

          isFinishNewImage02Explanation = true;

          addFinish(
              context,
              showDialogWait,
              questionModel,
              isFinishNewImage01Title,
              isFinishNewImage02Title,
              isFinishNewImage03Title,
              isFinishNewImage01Explanation,
              isFinishNewImage02Explanation,
              isFinishNewImage03Explanation,
              isFinishNewImage01Reference,
              isFinishNewImage02Reference,
              isFinishNewImage03Reference, () {
            onFinish();
          }, (String error) {
            onError(error);
          });
        });
      } else {
        isFinishNewImage02Explanation = true;

        addFinish(
            context,
            showDialogWait,
            questionModel,
            isFinishNewImage01Title,
            isFinishNewImage02Title,
            isFinishNewImage03Title,
            isFinishNewImage01Explanation,
            isFinishNewImage02Explanation,
            isFinishNewImage03Explanation,
            isFinishNewImage01Reference,
            isFinishNewImage02Reference,
            isFinishNewImage03Reference, () {
          onFinish();
        }, (String error) {
          onError(error);
        });
      }

// Explanation Photo 03
      if (isNewImage03Explanation) {
        savePhoto("03", "Explanation", pickedFile03Explanation,
            (String storage, String url) {
          questionModel
            ..storageExplanation03 = storage
            ..urlExplanation03 = url;

          isFinishNewImage03Explanation = true;

          addFinish(
              context,
              showDialogWait,
              questionModel,
              isFinishNewImage01Title,
              isFinishNewImage02Title,
              isFinishNewImage03Title,
              isFinishNewImage01Explanation,
              isFinishNewImage02Explanation,
              isFinishNewImage03Explanation,
              isFinishNewImage01Reference,
              isFinishNewImage02Reference,
              isFinishNewImage03Reference, () {
            onFinish();
          }, (String error) {
            onError(error);
          });
        });
      } else {
        isFinishNewImage03Explanation = true;

        addFinish(
            context,
            showDialogWait,
            questionModel,
            isFinishNewImage01Title,
            isFinishNewImage02Title,
            isFinishNewImage03Title,
            isFinishNewImage01Explanation,
            isFinishNewImage02Explanation,
            isFinishNewImage03Explanation,
            isFinishNewImage01Reference,
            isFinishNewImage02Reference,
            isFinishNewImage03Reference, () {
          onFinish();
        }, (String error) {
          onError(error);
        });
      }

// Reference Photo 01
      if (isNewImage01Reference) {
        savePhoto("01", "Reference", pickedFile01Reference,
            (String storage, String url) {
          questionModel
            ..storageReference01 = storage
            ..urlReference01 = url;

          isFinishNewImage01Reference = true;

          addFinish(
              context,
              showDialogWait,
              questionModel,
              isFinishNewImage01Title,
              isFinishNewImage02Title,
              isFinishNewImage03Title,
              isFinishNewImage01Explanation,
              isFinishNewImage02Explanation,
              isFinishNewImage03Explanation,
              isFinishNewImage01Reference,
              isFinishNewImage02Reference,
              isFinishNewImage03Reference, () {
            onFinish();
          }, (String error) {
            onError(error);
          });
        });
      } else {
        isFinishNewImage01Reference = true;

        addFinish(
            context,
            showDialogWait,
            questionModel,
            isFinishNewImage01Title,
            isFinishNewImage02Title,
            isFinishNewImage03Title,
            isFinishNewImage01Explanation,
            isFinishNewImage02Explanation,
            isFinishNewImage03Explanation,
            isFinishNewImage01Reference,
            isFinishNewImage02Reference,
            isFinishNewImage03Reference, () {
          onFinish();
        }, (String error) {
          onError(error);
        });
      }

// Reference Photo 02
      if (isNewImage02Reference) {
        savePhoto("02", "Reference", pickedFile02Reference,
            (String storage, String url) {
          questionModel
            ..storageReference02 = storage
            ..urlReference02 = url;

          isFinishNewImage02Reference = true;

          addFinish(
              context,
              showDialogWait,
              questionModel,
              isFinishNewImage01Title,
              isFinishNewImage02Title,
              isFinishNewImage03Title,
              isFinishNewImage01Explanation,
              isFinishNewImage02Explanation,
              isFinishNewImage03Explanation,
              isFinishNewImage01Reference,
              isFinishNewImage02Reference,
              isFinishNewImage03Reference, () {
            onFinish();
          }, (String error) {
            onError(error);
          });
        });
      } else {
        isFinishNewImage02Reference = true;

        addFinish(
            context,
            showDialogWait,
            questionModel,
            isFinishNewImage01Title,
            isFinishNewImage02Title,
            isFinishNewImage03Title,
            isFinishNewImage01Explanation,
            isFinishNewImage02Explanation,
            isFinishNewImage03Explanation,
            isFinishNewImage01Reference,
            isFinishNewImage02Reference,
            isFinishNewImage03Reference, () {
          onFinish();
        }, (String error) {
          onError(error);
        });
      }

// Reference Photo 03
      if (isNewImage03Reference) {
        savePhoto("03", "Reference", pickedFile03Reference,
            (String storage, String url) {
          questionModel
            ..storageReference03 = storage
            ..urlReference03 = url;

          isFinishNewImage03Reference = true;

          addFinish(
              context,
              showDialogWait,
              questionModel,
              isFinishNewImage01Title,
              isFinishNewImage02Title,
              isFinishNewImage03Title,
              isFinishNewImage01Explanation,
              isFinishNewImage02Explanation,
              isFinishNewImage03Explanation,
              isFinishNewImage01Reference,
              isFinishNewImage02Reference,
              isFinishNewImage03Reference, () {
            onFinish();
          }, (String error) {
            onError(error);
          });
        });
      } else {
        isFinishNewImage03Reference = true;

        addFinish(
            context,
            showDialogWait,
            questionModel,
            isFinishNewImage01Title,
            isFinishNewImage02Title,
            isFinishNewImage03Title,
            isFinishNewImage01Explanation,
            isFinishNewImage02Explanation,
            isFinishNewImage03Explanation,
            isFinishNewImage01Reference,
            isFinishNewImage02Reference,
            isFinishNewImage03Reference, () {
          onFinish();
        }, (String error) {
          onError(error);
        });
      }
    } on FirebaseAuthException catch (e) {
      showDialogWait.hide(context);
      onError(e.message.toString());
    }
  }

  Future addFinish(
      BuildContext context,
      ShowDialogWait showDialogWait,
      QuestionModel questionModel,
      bool isFinishNewImage01Title,
      bool isFinishNewImage02Title,
      bool isFinishNewImage03Title,
      bool isFinishNewImage01Explanation,
      bool isFinishNewImage02Explanation,
      bool isFinishNewImage03Explanation,
      bool isFinishNewImage01Reference,
      bool isFinishNewImage02Reference,
      bool isFinishNewImage03Reference,
      VoidCallback onFinish,
      VoidCallbackString onError) async {
    try {
      if (isFinishNewImage01Title &&
          isFinishNewImage02Title &&
          isFinishNewImage03Title &&
          isFinishNewImage01Explanation &&
          isFinishNewImage02Explanation &&
          isFinishNewImage03Explanation &&
          isFinishNewImage01Reference &&
          isFinishNewImage02Reference &&
          isFinishNewImage03Reference) {
        final firestoreInstance = FirebaseFirestore.instance;

        CollectionReference category =
            firestoreInstance.collection(firebaseCustomCategoryKey);

        DocumentSnapshot categoryDocumentSnapshot =
            await category.doc(questionModel.category.key).get();

        CategoryModel categoryModel = CategoryModel.fromJSON(
            true, categoryDocumentSnapshot.id, categoryDocumentSnapshot.data());

        categoryModel.maxQuestions += 1;

        CollectionReference question =
            firestoreInstance.collection(firebaseCustomQuestionKey);
        await question
            .doc(
                QuestionModel.getKey(categoryModel, categoryModel.maxQuestions))
            .set(questionModel.toJsonWithExportKeyToId(true));

        await category.doc(categoryModel.key).update(categoryModel.toJson());

        showDialogWait.hide(context);

        onFinish();
      }
    } on FirebaseAuthException catch (e) {
      onError(e.message.toString());
    }
  }

  Future modify(
      {required BuildContext context,
      required QuestionModel questionModel,
      required bool isNewImage01Title,
      required XFile pickedFile01Title,
      required bool isNewImage02Title,
      required XFile pickedFile02Title,
      required bool isNewImage03Title,
      required XFile pickedFile03Title,
      required bool isNewImage01Explanation,
      required XFile pickedFile01Explanation,
      required bool isNewImage02Explanation,
      required XFile pickedFile02Explanation,
      required bool isNewImage03Explanation,
      required XFile pickedFile03Explanation,
      required bool isNewImage01Reference,
      required XFile pickedFile01Reference,
      required bool isNewImage02Reference,
      required XFile pickedFile02Reference,
      required bool isNewImage03Reference,
      required XFile pickedFile03Reference,
      required VoidCallback onFinish,
      required VoidCallbackString onError}) async {
    ShowDialogWait showDialogWait = ShowDialogWait();
    showDialogWait.show(context, questionSaving);

    try {
      bool isFinishNewImage01Title = false;
      bool isFinishNewImage02Title = false;
      bool isFinishNewImage03Title = false;

      bool isFinishNewImage01Explanation = false;
      bool isFinishNewImage02Explanation = false;
      bool isFinishNewImage03Explanation = false;

      bool isFinishNewImage01Reference = false;
      bool isFinishNewImage02Reference = false;
      bool isFinishNewImage03Reference = false;

// Title Photo 01
      if (isNewImage01Title) {
        savePhoto("01", "Title", pickedFile01Title,
            (String storage, String url) {
          questionModel
            ..storageTitle01 = storage
            ..urlTitle01 = url;

          isFinishNewImage01Title = true;

          modifyFinish(
              context,
              showDialogWait,
              questionModel,
              isFinishNewImage01Title,
              isFinishNewImage02Title,
              isFinishNewImage03Title,
              isFinishNewImage01Explanation,
              isFinishNewImage02Explanation,
              isFinishNewImage03Explanation,
              isFinishNewImage01Reference,
              isFinishNewImage02Reference,
              isFinishNewImage03Reference, () {
            onFinish();
          }, (String error) {
            onError(error);
          });
        });
      } else {
        isFinishNewImage01Title = true;

        modifyFinish(
            context,
            showDialogWait,
            questionModel,
            isFinishNewImage01Title,
            isFinishNewImage02Title,
            isFinishNewImage03Title,
            isFinishNewImage01Explanation,
            isFinishNewImage02Explanation,
            isFinishNewImage03Explanation,
            isFinishNewImage01Reference,
            isFinishNewImage02Reference,
            isFinishNewImage03Reference, () {
          onFinish();
        }, (String error) {
          onError(error);
        });
      }

// Title Photo 02
      if (isNewImage02Title) {
        savePhoto("02", "Title", pickedFile02Title,
            (String storage, String url) {
          questionModel
            ..storageTitle02 = storage
            ..urlTitle02 = url;

          isFinishNewImage02Title = true;

          modifyFinish(
              context,
              showDialogWait,
              questionModel,
              isFinishNewImage01Title,
              isFinishNewImage02Title,
              isFinishNewImage03Title,
              isFinishNewImage01Explanation,
              isFinishNewImage02Explanation,
              isFinishNewImage03Explanation,
              isFinishNewImage01Reference,
              isFinishNewImage02Reference,
              isFinishNewImage03Reference, () {
            onFinish();
          }, (String error) {
            onError(error);
          });
        });
      } else {
        isFinishNewImage02Title = true;

        modifyFinish(
            context,
            showDialogWait,
            questionModel,
            isFinishNewImage01Title,
            isFinishNewImage02Title,
            isFinishNewImage03Title,
            isFinishNewImage01Explanation,
            isFinishNewImage02Explanation,
            isFinishNewImage03Explanation,
            isFinishNewImage01Reference,
            isFinishNewImage02Reference,
            isFinishNewImage03Reference, () {
          onFinish();
        }, (String error) {
          onError(error);
        });
      }

// Title Photo 03
      if (isNewImage03Title) {
        savePhoto("03", "Title", pickedFile03Title,
            (String storage, String url) {
          questionModel
            ..storageTitle03 = storage
            ..urlTitle03 = url;

          isFinishNewImage03Title = true;

          modifyFinish(
              context,
              showDialogWait,
              questionModel,
              isFinishNewImage01Title,
              isFinishNewImage02Title,
              isFinishNewImage03Title,
              isFinishNewImage01Explanation,
              isFinishNewImage02Explanation,
              isFinishNewImage03Explanation,
              isFinishNewImage01Reference,
              isFinishNewImage02Reference,
              isFinishNewImage03Reference, () {
            onFinish();
          }, (String error) {
            onError(error);
          });
        });
      } else {
        isFinishNewImage03Title = true;

        modifyFinish(
            context,
            showDialogWait,
            questionModel,
            isFinishNewImage01Title,
            isFinishNewImage02Title,
            isFinishNewImage03Title,
            isFinishNewImage01Explanation,
            isFinishNewImage02Explanation,
            isFinishNewImage03Explanation,
            isFinishNewImage01Reference,
            isFinishNewImage02Reference,
            isFinishNewImage03Reference, () {
          onFinish();
        }, (String error) {
          onError(error);
        });
      }

// Explanation Photo 01
      if (isNewImage01Explanation) {
        savePhoto("01", "Explanation", pickedFile01Explanation,
            (String storage, String url) {
          questionModel
            ..storageExplanation01 = storage
            ..urlExplanation01 = url;

          isFinishNewImage01Explanation = true;

          modifyFinish(
              context,
              showDialogWait,
              questionModel,
              isFinishNewImage01Title,
              isFinishNewImage02Title,
              isFinishNewImage03Title,
              isFinishNewImage01Explanation,
              isFinishNewImage02Explanation,
              isFinishNewImage03Explanation,
              isFinishNewImage01Reference,
              isFinishNewImage02Reference,
              isFinishNewImage03Reference, () {
            onFinish();
          }, (String error) {
            onError(error);
          });
        });
      } else {
        isFinishNewImage01Explanation = true;

        modifyFinish(
            context,
            showDialogWait,
            questionModel,
            isFinishNewImage01Title,
            isFinishNewImage02Title,
            isFinishNewImage03Title,
            isFinishNewImage01Explanation,
            isFinishNewImage02Explanation,
            isFinishNewImage03Explanation,
            isFinishNewImage01Reference,
            isFinishNewImage02Reference,
            isFinishNewImage03Reference, () {
          onFinish();
        }, (String error) {
          onError(error);
        });
      }

// Explanation Photo 02
      if (isNewImage02Explanation) {
        savePhoto("02", "Explanation", pickedFile02Explanation,
            (String storage, String url) {
          questionModel
            ..storageExplanation02 = storage
            ..urlExplanation02 = url;

          isFinishNewImage02Explanation = true;

          modifyFinish(
              context,
              showDialogWait,
              questionModel,
              isFinishNewImage01Title,
              isFinishNewImage02Title,
              isFinishNewImage03Title,
              isFinishNewImage01Explanation,
              isFinishNewImage02Explanation,
              isFinishNewImage03Explanation,
              isFinishNewImage01Reference,
              isFinishNewImage02Reference,
              isFinishNewImage03Reference, () {
            onFinish();
          }, (String error) {
            onError(error);
          });
        });
      } else {
        isFinishNewImage02Explanation = true;

        modifyFinish(
            context,
            showDialogWait,
            questionModel,
            isFinishNewImage01Title,
            isFinishNewImage02Title,
            isFinishNewImage03Title,
            isFinishNewImage01Explanation,
            isFinishNewImage02Explanation,
            isFinishNewImage03Explanation,
            isFinishNewImage01Reference,
            isFinishNewImage02Reference,
            isFinishNewImage03Reference, () {
          onFinish();
        }, (String error) {
          onError(error);
        });
      }

// Explanation Photo 03
      if (isNewImage03Explanation) {
        savePhoto("03", "Explanation", pickedFile03Explanation,
            (String storage, String url) {
          questionModel
            ..storageExplanation03 = storage
            ..urlExplanation03 = url;

          isFinishNewImage03Explanation = true;

          modifyFinish(
              context,
              showDialogWait,
              questionModel,
              isFinishNewImage01Title,
              isFinishNewImage02Title,
              isFinishNewImage03Title,
              isFinishNewImage01Explanation,
              isFinishNewImage02Explanation,
              isFinishNewImage03Explanation,
              isFinishNewImage01Reference,
              isFinishNewImage02Reference,
              isFinishNewImage03Reference, () {
            onFinish();
          }, (String error) {
            onError(error);
          });
        });
      } else {
        isFinishNewImage03Explanation = true;

        modifyFinish(
            context,
            showDialogWait,
            questionModel,
            isFinishNewImage01Title,
            isFinishNewImage02Title,
            isFinishNewImage03Title,
            isFinishNewImage01Explanation,
            isFinishNewImage02Explanation,
            isFinishNewImage03Explanation,
            isFinishNewImage01Reference,
            isFinishNewImage02Reference,
            isFinishNewImage03Reference, () {
          onFinish();
        }, (String error) {
          onError(error);
        });
      }

// Reference Photo 01
      if (isNewImage01Reference) {
        savePhoto("01", "Reference", pickedFile01Reference,
            (String storage, String url) {
          questionModel
            ..storageReference01 = storage
            ..urlReference01 = url;

          isFinishNewImage01Reference = true;

          modifyFinish(
              context,
              showDialogWait,
              questionModel,
              isFinishNewImage01Title,
              isFinishNewImage02Title,
              isFinishNewImage03Title,
              isFinishNewImage01Explanation,
              isFinishNewImage02Explanation,
              isFinishNewImage03Explanation,
              isFinishNewImage01Reference,
              isFinishNewImage02Reference,
              isFinishNewImage03Reference, () {
            onFinish();
          }, (String error) {
            onError(error);
          });
        });
      } else {
        isFinishNewImage01Reference = true;

        modifyFinish(
            context,
            showDialogWait,
            questionModel,
            isFinishNewImage01Title,
            isFinishNewImage02Title,
            isFinishNewImage03Title,
            isFinishNewImage01Explanation,
            isFinishNewImage02Explanation,
            isFinishNewImage03Explanation,
            isFinishNewImage01Reference,
            isFinishNewImage02Reference,
            isFinishNewImage03Reference, () {
          onFinish();
        }, (String error) {
          onError(error);
        });
      }

// Reference Photo 02
      if (isNewImage02Reference) {
        savePhoto("02", "Reference", pickedFile02Reference,
            (String storage, String url) {
          questionModel
            ..storageReference02 = storage
            ..urlReference02 = url;

          isFinishNewImage02Reference = true;

          modifyFinish(
              context,
              showDialogWait,
              questionModel,
              isFinishNewImage01Title,
              isFinishNewImage02Title,
              isFinishNewImage03Title,
              isFinishNewImage01Explanation,
              isFinishNewImage02Explanation,
              isFinishNewImage03Explanation,
              isFinishNewImage01Reference,
              isFinishNewImage02Reference,
              isFinishNewImage03Reference, () {
            onFinish();
          }, (String error) {
            onError(error);
          });
        });
      } else {
        isFinishNewImage02Reference = true;

        modifyFinish(
            context,
            showDialogWait,
            questionModel,
            isFinishNewImage01Title,
            isFinishNewImage02Title,
            isFinishNewImage03Title,
            isFinishNewImage01Explanation,
            isFinishNewImage02Explanation,
            isFinishNewImage03Explanation,
            isFinishNewImage01Reference,
            isFinishNewImage02Reference,
            isFinishNewImage03Reference, () {
          onFinish();
        }, (String error) {
          onError(error);
        });
      }

// Reference Photo 03
      if (isNewImage03Reference) {
        savePhoto("03", "Reference", pickedFile03Reference,
            (String storage, String url) {
          questionModel
            ..storageReference03 = storage
            ..urlReference03 = url;

          isFinishNewImage03Reference = true;

          modifyFinish(
              context,
              showDialogWait,
              questionModel,
              isFinishNewImage01Title,
              isFinishNewImage02Title,
              isFinishNewImage03Title,
              isFinishNewImage01Explanation,
              isFinishNewImage02Explanation,
              isFinishNewImage03Explanation,
              isFinishNewImage01Reference,
              isFinishNewImage02Reference,
              isFinishNewImage03Reference, () {
            onFinish();
          }, (String error) {
            onError(error);
          });
        });
      } else {
        isFinishNewImage03Reference = true;

        modifyFinish(
            context,
            showDialogWait,
            questionModel,
            isFinishNewImage01Title,
            isFinishNewImage02Title,
            isFinishNewImage03Title,
            isFinishNewImage01Explanation,
            isFinishNewImage02Explanation,
            isFinishNewImage03Explanation,
            isFinishNewImage01Reference,
            isFinishNewImage02Reference,
            isFinishNewImage03Reference, () {
          onFinish();
        }, (String error) {
          onError(error);
        });
      }
    } on FirebaseAuthException catch (e) {
      showDialogWait.hide(context);
      onError(e.message.toString());
    }
  }

  Future modifyFinish(
      BuildContext context,
      ShowDialogWait showDialogWait,
      QuestionModel questionModel,
      bool isFinishNewImage01Title,
      bool isFinishNewImage02Title,
      bool isFinishNewImage03Title,
      bool isFinishNewImage01Explanation,
      bool isFinishNewImage02Explanation,
      bool isFinishNewImage03Explanation,
      bool isFinishNewImage01Reference,
      bool isFinishNewImage02Reference,
      bool isFinishNewImage03Reference,
      VoidCallback onFinish,
      VoidCallbackString onError) async {
    try {
      if (isFinishNewImage01Title &&
          isFinishNewImage02Title &&
          isFinishNewImage03Title &&
          isFinishNewImage01Explanation &&
          isFinishNewImage02Explanation &&
          isFinishNewImage03Explanation &&
          isFinishNewImage01Reference &&
          isFinishNewImage02Reference &&
          isFinishNewImage03Reference) {
        final firestoreInstance = FirebaseFirestore.instance;

        firestoreInstance
            .collection(firebaseCustomQuestionKey)
            .doc(questionModel.key)
            .update(questionModel.toJsonWithExportKeyToId(true));

        showDialogWait.hide(context);

        onFinish();
      }
    } on FirebaseAuthException catch (e) {
      onError(e.message.toString());
    }
  }

  Future setDelete(
      {required BuildContext context,
      required QuestionModel questionModel}) async {
    try {
      ShowDialogWait showDialogWait = ShowDialogWait();
      showDialogWait.show(context, questionDeleting);

      final firestoreInstance = FirebaseFirestore.instance;
      firestoreInstance
          .collection(firebaseCustomQuestionKey)
          .doc(questionModel.key)
          .delete();

      showDialogWait.hide(context);

      return null;
    } on FirebaseAuthException catch (e) {
      return e.message;
    }
  }

  Future savePhoto(String id, String posName, XFile pickedFile,
      VoidCallbackSavePhotoFinish onFinish) async {
    FirebaseStorage storage = FirebaseStorage.instance;

    String fileName = _getName(id, posName);

    Reference ref =
        storage.ref().child(firebaseCustomQuestionKey).child(fileName);

    UploadTask uploadTask = ref.putData(await pickedFile.readAsBytes());
    await uploadTask.whenComplete(() async {
      String urlDownload = await ref.getDownloadURL();

      onFinish(fileName, urlDownload);
    });
  }

  String _getName(String id, String posName) {
    String extension = ".png";

    return DateTime.now().year.toString() +
        "_" +
        DateTime.now().month.toString() +
        "_" +
        DateTime.now().day.toString() +
        "_" +
        DateTime.now().hour.toString() +
        "_" +
        DateTime.now().minute.toString() +
        "_" +
        DateTime.now().second.toString() +
        "_" +
        DateTime.now().millisecond.toString() +
        "_" +
        id +
        "_" +
        posName +
        extension;
  }
}
