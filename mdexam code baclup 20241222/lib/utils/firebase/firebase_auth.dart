import 'package:firebase_auth/firebase_auth.dart';

class FirebaseAuthenticationHelper {
  final FirebaseAuth auth = FirebaseAuth.instance;
  get user => auth.currentUser;

  String? gg() {
    return auth.currentUser?.uid;
  }

/*  Future signUp({required String email, required String password}) async {
    try {
      await auth.createUserWithEmailAndPassword(
        email: email,
        password: password,
      );
      return null;
    } on FirebaseAuthException catch (e) {
      return e.message;
    }
  }
*/
  Future signIn({required String email, required String password}) async {
    try {
      await auth.signInWithEmailAndPassword(email: email, password: password);
      return null;
    } on FirebaseAuthException catch (e) {
      return e.message;
    }
  }

  Future lostPassword({required String email}) async {
    try {
      await auth.sendPasswordResetEmail(email: email);
      return null;
    } on FirebaseAuthException catch (e) {
      return e.message;
    }
  }

  Future signOut() async {
    await auth.signOut();

    // ignore: avoid_print
    print('signout');
  }
}
