# Development Set-up
## Prerequisites
* Windows Machine
* Node
* MySQL
* Android Studio
* Android phone
* VS Code/Any other code editor
## Instructions

### Web and Mobile App Setup
* Node version: 18.13.0
* NPM version: 8.19.3
1. Install node from https://nodejs.org/download/release/v18.13.0/
2. Download and install node-v18.13.0-x64.msi
3. Add `C:\Program Files\nodejs\` in Path in Environment Variables
4. Download and install Android Studio from `https://developer.android.com/studio`
### Database setup
1. Install mysql from https://dev.mysql.com/downloads/mysql/
2. Download and install Windows (x86, 64-bit), MSI Installer
3. Launch MySQL command-line client using `mysql -u root -p` in the command prompt
4. Source `database.sql` from the `Web App - Database` directory using `source database.sql` command.

### Android Mobile App
1. Open two command prompts on `UplbCNS` directory
2. [1st command prompt] Run `npm install` to install node modules then `npx react-native start` afterwards
3. Plug an android device via USB or start an Android device emulator
4. [2nd command prompt] Run `npx react-native run-android` to run the mobile app in the device.
5. An APK file is also provided in the directory, this can be used for direct download and installation and for publishing in Google Play Store.

### Web App Server Execution
1. Open command prompt on `uplb-cns-server` directory
2. Run `npm install` to install node modules
3. Run `node index.js` afterwards.

### Web App Client Execution
1. Open command prompt on `uplb-cns-client` directory
2. Run `npm install` to install node modules
3. Run `npm start` afterwards.
