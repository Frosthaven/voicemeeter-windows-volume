scriptdir = CreateObject("Scripting.FileSystemObject").GetParentFolderName(WScript.ScriptFullName)

Set Shell = CreateObject("Shell.Application")
Shell.ShellExecute scriptDir & "\required\app-engine.exe", , , "runas", 0
