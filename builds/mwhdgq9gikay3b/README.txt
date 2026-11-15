MODEL MEDICINE SHOP - Android package (সম্পূর্ণ ভাগ করা JS ফাইলসহ)
===================================================================
ফোল্ডার কাঠামো:
  www/index.html          মূল পেজ (শুধু HTML কাঠামো)
  www/css/style.css       সব CSS
  www/js/01..23-*.js      অ্যাপের সব লজিক, বিষয় অনুযায়ী আলাদা ফাইল (এই ক্রমেই লোড হয়, ক্রম বদলাবেন না)
  www/js/99-features.js   নতুন Smart Tools + Android bridge
  java/.../MainActivity.java   WebView (Android অংশ)

ব্যবহার:
1) www ফোল্ডারটি কপি করে রাখুন:  app/src/main/assets/www/
2) MainActivity.java রাখুন:  app/src/main/java/com/modelmedicine/shop/MainActivity.java
   (আপনার প্রজেক্টের package নাম আলাদা হলে প্রথম লাইনের package বদলান)
3) app/build.gradle এর dependencies এ যোগ করুন:
       implementation 'androidx.webkit:webkit:1.8.0'
4) AndroidManifest.xml এ যোগ করুন:
       <uses-permission android:name="android.permission.CAMERA"/>
       <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" android:maxSdkVersion="28"/>
   এবং MainActivity তে MAIN/LAUNCHER intent-filter রাখুন।

নতুন ফিচার (Drawer > 🧰 Smart Tools):
  Sales Return, Stock Adjustment, Reorder List, Daily Closing, Profit & Loss।
APK এর ভিতরে PDF/Image/CSV/Backup Downloads ফোল্ডারে সেভ হয় এবং Print কাজ করে।
