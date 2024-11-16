const { db, admin } = require("../config/firebase");
const { initializeApp } = require("firebase/app");
const {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
} = require("firebase/auth");

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: "",
  measurementId: "",
};

initializeApp(firebaseConfig);

const auth = getAuth();

const authService = {
  async signup({ displayName, email, password, phoneNumber }) {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;
    await sendEmailVerification(user);

    await db
      .collection("users")
      .doc(user.uid)
      .set({
        displayName: displayName || "",
        email: user.email,
        phoneNumber: phoneNumber || "",
        createdAt: new Date().toISOString(),
      });

    return {
      user: {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || "",
        phoneNumber: user.phoneNumber || "",
        createdAt: user.createdAt,
      },
      message:
        "Please verify your email address before logging in. Check your inbox for the verification link.",
    };
  },

  async login({ email, password, fcmToken }) {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    if (!user.emailVerified) {
      throw new Error("Email not verified.");
    }

    const idToken = await user.getIdToken();

    const userDoc = await db.collection("users").doc(user.uid).get();
    if (!userDoc.exists) {
      throw new Error("User not found in database");
    }
    const userData = userDoc.data();
    return {
      user: {
        uid: user.uid,
        email: user.email,
        displayName: userData.displayName || "",
        phoneNumber: userData.phoneNumber || "",
        fcmToken: userData.fcmToken || "",
        createdAt: userData.createdAt,
      },
      token: idToken,
    };
  },

  async forgotPassword({ email }) {
    await sendPasswordResetEmail(auth, email);
    return {
      message:
        "Password reset email sent successfully. Please check your inbox.",
      user: { email },
    };
  },
};

module.exports = authService;
