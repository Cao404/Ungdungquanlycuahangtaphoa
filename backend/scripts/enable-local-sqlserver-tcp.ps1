#Requires -RunAsAdministrator
$ErrorActionPreference = 'Stop'

$instanceId = (Get-ItemProperty 'HKLM:\SOFTWARE\Microsoft\Microsoft SQL Server\Instance Names\SQL').SQLEXPRESS
if (-not $instanceId) { throw 'SQL Server instance SQLEXPRESS was not found.' }

$tcpPath = "HKLM:\SOFTWARE\Microsoft\Microsoft SQL Server\$instanceId\MSSQLServer\SuperSocketNetLib\Tcp"
$loopbackKey = Get-ChildItem $tcpPath | Where-Object {
  (Get-ItemProperty $_.PSPath).IpAddress -eq '127.0.0.1'
} | Select-Object -First 1
if (-not $loopbackKey) { throw 'SQL Server configuration for 127.0.0.1 was not found.' }

$otherEnabled = Get-ChildItem $tcpPath | Where-Object {
  $_.PSChildName -ne $loopbackKey.PSChildName -and
  $_.PSChildName -ne 'IPAll' -and
  (Get-ItemProperty $_.PSPath).Enabled -eq 1
}
if ($otherEnabled) { throw 'Another network address is enabled; stopping to avoid LAN exposure.' }

$ipAllPath = Join-Path $tcpPath 'IPAll'
Set-ItemProperty -LiteralPath $tcpPath -Name Enabled -Value 1
Set-ItemProperty -LiteralPath $tcpPath -Name ListenOnAllIPs -Value 0
Set-ItemProperty -LiteralPath $ipAllPath -Name TcpPort -Value ''
Set-ItemProperty -LiteralPath $ipAllPath -Name TcpDynamicPorts -Value ''
Set-ItemProperty -LiteralPath $loopbackKey.PSPath -Name Enabled -Value 1
Set-ItemProperty -LiteralPath $loopbackKey.PSPath -Name TcpPort -Value '1433'
Set-ItemProperty -LiteralPath $loopbackKey.PSPath -Name TcpDynamicPorts -Value ''

Restart-Service -Name 'MSSQL$SQLEXPRESS' -Force
Write-Output 'SQL Server TCP is limited to 127.0.0.1:1433.'
