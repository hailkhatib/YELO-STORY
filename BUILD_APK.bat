@echo off
echo ========================================================
echo        CONSTRUCTION DE L'APPLICATION YELO STORY
echo ========================================================
echo.
echo Cette commande va générer un fichier .APK que vous
echo pourrez installer directement sur votre téléphone Android.
echo.
echo Pre-requis : Avoir un compte Expo (gratuit)
echo.

call npm install -g eas-cli
call eas login
call eas build -p android --profile preview

echo.
echo Termine! Telechargez le fichier APK depuis le lien fourni.
pause
