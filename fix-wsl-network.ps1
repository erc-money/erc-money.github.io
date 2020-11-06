$remoteport = bash.exe -c "ifconfig eth0 | grep 'inet '"
$found = $remoteport -match '\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}';

if( $found ){
  $remoteport = $matches[0];
} else{
  echo "The Script Exited, the ip address of WSL 2 cannot be found";
  exit;
}

#[Ports]

#All the ports you want to forward separated by coma
$ports=@(7545);

#[Static ip]
#You can change the addr to your ip config to listen to a specific address
$addr='0.0.0.0';
$ports_a = $ports -join ",";

#Remove Firewall Exception Rules
echo "Removing comflicting WSL Firewall rules"
iex "Remove-NetFireWallRule -DisplayName 'WSL 2 Firewall Unlock' ";
iex "Remove-NetFireWallRule -DisplayName 'Ganache' ";

#adding Exception Rules for inbound and outbound Rules
echo "Adding WSL Firewall rule"
iex "New-NetFireWallRule -DisplayName 'WSL 2 Firewall Unlock' -Direction Outbound -LocalPort $ports_a -Action Allow -Protocol TCP";
iex "New-NetFireWallRule -DisplayName 'WSL 2 Firewall Unlock' -Direction Inbound -LocalPort $ports_a -Action Allow -Protocol TCP";

echo "Reset all port forwarding"
iex "netsh interface portproxy reset"

for( $i = 0; $i -lt $ports.length; $i++ ){
  $port = $ports[$i];
  echo "Proxy port=$port to WSL ($remoteport)"
  iex "netsh interface portproxy add v4tov4 listenport=$port listenaddress=$addr connectport=$port connectaddress=$remoteport";
}

netsh interface portproxy show all
