; @ TODO : there are some values we can generate from package.json here

;-------------------------------------------------------------------------------
; Includes
!include "MUI2.nsh"
!include "LogicLib.nsh"
!include "WinVer.nsh"
!include "x64.nsh"

;-------------------------------------------------------------------------------
; Injected

;{{INJECT_START:PKG}}
OutFile "../_dist/Install_voicemeeter-windows-volume_v1.6.2.0_x64.exe"
!define PRODUCT_NAME "Voicemeeter Windows Volume"
!define PACKAGE_NAME "voicemeeter-windows-volume"
!define EXE_NAME "VMWV.exe"
!define PRODUCT_DESCRIPTION "Tray app that allows you to sync windows volume and mute state to Voicemeeter volume controls"
!define PRODUCT_VERSION "1.6.2.0"
!define SETUP_VERSION 1.6.2.0
!define MUI_TEXT_WELCOME_INFO_TEXT "This will guide you through the installation of Voicemeeter Windows Volume v1.6.2.0.$\r$\n$\r$\nClick Next to continue."
Name "Voicemeeter Windows Volume"
BrandingText "Voicemeeter Windows Volume v1.6.2.0"
InstallDir "$PROGRAMFILES\Voicemeeter Windows Volume"
InstallDirRegKey HKCU "Software\Voicemeeter Windows Volume" ""
;{{INJECT_END:PKG}}

;-------------------------------------------------------------------------------
; Constants
!define COPYRIGHT "Opensource"

;-------------------------------------------------------------------------------
; Attributes
RequestExecutionLevel admin ; user|highest|admin

;-------------------------------------------------------------------------------
; Version Info
VIProductVersion "${PRODUCT_VERSION}"
VIAddVersionKey "ProductName" "${PRODUCT_NAME}"
VIAddVersionKey "ProductVersion" "${PRODUCT_VERSION}"
VIAddVersionKey "FileDescription" "${PRODUCT_DESCRIPTION}"
VIAddVersionKey "LegalCopyright" "${COPYRIGHT}"
VIAddVersionKey "FileVersion" "${SETUP_VERSION}"

;-------------------------------------------------------------------------------
; Modern UI Appearance
!define MUI_ICON "${NSISDIR}\Contrib\Graphics\Icons\orange-install.ico"
!define MUI_HEADERIMAGE
!define MUI_HEADERIMAGE_BITMAP "${NSISDIR}\Contrib\Graphics\Header\orange.bmp"
!define MUI_WELCOMEFINISHPAGE_BITMAP "${NSISDIR}\Contrib\Graphics\Wizard\orange.bmp"
!define MUI_FINISHPAGE_NOAUTOCLOSE

;-------------------------------------------------------------------------------
; Installer Pages
!insertmacro MUI_PAGE_WELCOME
; !insertmacro MUI_PAGE_LICENSE "${NSISDIR}\Docs\Modern UI\License.txt"
!insertmacro MUI_PAGE_COMPONENTS
!insertmacro MUI_PAGE_DIRECTORY
!insertmacro MUI_PAGE_INSTFILES
; the below two lines need some investigation - doesn't work. will add to end of
; installation section for now
; !define MUI_FINISHPAGE_RUN "$\"wscript.exe$\" $\"$INSTDIR\app-launcher.vbs$\""
; !define MUI_FINISHPAGE_RUN_TEXT "Run Now"
!insertmacro MUI_PAGE_FINISH

;-------------------------------------------------------------------------------
; Uninstaller Pages
!insertmacro MUI_UNPAGE_WELCOME
!insertmacro MUI_UNPAGE_CONFIRM
!insertmacro MUI_UNPAGE_INSTFILES
!insertmacro MUI_UNPAGE_FINISH

;-------------------------------------------------------------------------------
; Languages
!insertmacro MUI_LANGUAGE "English"

;-------------------------------------------------------------------------------
; Installer Sections
Section "Tray Application" MyApp1
    ; Stop the running process
    ExecWait `"$SYSDIR\taskkill.exe" /im ${EXE_NAME}`

    ; Copy Files & Folders
    SetOutPath "$INSTDIR"

    File /nonfatal /a /r "..\_dist\${PACKAGE_NAME}\required"
    File "..\_dist\${PACKAGE_NAME}\app-launcher.vbs"

    ; Uninstaller
    WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${PRODUCT_NAME}" "DisplayName" "${PRODUCT_NAME} (remove only)"
    WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${PRODUCT_NAME}" "UninstallString" "$INSTDIR\Uninstall.exe"
    WriteUninstaller "$INSTDIR\Uninstall.exe"

;{{INJECT_START:UNINSTALLER}}
    WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${PRODUCT_NAME}" "Publisher" "Frosthaven"
    WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${PRODUCT_NAME}" "DisplayName" "Voicemeeter Windows Volume"
    WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${PRODUCT_NAME}" "DisplayVersion" 1.6.2.0
    WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${PRODUCT_NAME}" "DisplayIcon" "$INSTDIR\required\${EXE_NAME},0"
;{{INJECT_END:UNINSTALLER}}

    ; Start the application
    Exec `$\"$SYSDIR\wscript.exe$\" $\"$INSTDIR\app-launcher.vbs$\"`

SectionEnd

Section "Start Menu Entry" MyApp2
    CreateDirectory "$SMPROGRAMS\${PRODUCT_NAME}"
    CreateShortCut "$SMPROGRAMS\${PRODUCT_NAME}\Uninstall.lnk" "$INSTDIR\Uninstall.exe" "" "$INSTDIR\Uninstall.exe" 0
    CreateShortCut "$SMPROGRAMS\${PRODUCT_NAME}\${PRODUCT_NAME}.lnk" "$INSTDIR\app-launcher.vbs" "" "$INSTDIR\required\assets\app.ico" 0
SectionEnd

Section "Desktop Link" MyApp3
    CreateShortCut "$DESKTOP\${PRODUCT_NAME}.lnk" "$INSTDIR\app-launcher.vbs" "" "$INSTDIR\required\assets\app.ico" 0
SectionEnd

;-------------------------------------------------------------------------------
; Uninstaller Sections
Section "Uninstall"
    ; Stop the running process
    ExecWait `"$SYSDIR\taskkill.exe" /im ${EXE_NAME}`

    ; Remove the directory
    RMDir /r "$INSTDIR\*.*"

    ; Delete Start Menu Shortcuts
    Delete "$DESKTOP\${PRODUCT_NAME}.lnk"
    Delete "$SMPROGRAMS\${PRODUCT_NAME}\*.*"
    RmDir  "$SMPROGRAMS\${PRODUCT_NAME}"

    ; Delete Uninstaller And Unistall Registry Entries
    DeleteRegKey HKEY_LOCAL_MACHINE "SOFTWARE\${PRODUCT_NAME}"
    DeleteRegKey HKEY_LOCAL_MACHINE "SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\${PRODUCT_NAME}"

    ; Remove scheduled task if it exists
    ExecWait `"$SYSDIR\schtasks.exe" /Delete /F /TN "voicemeeter-windows-volume"`
SectionEnd
