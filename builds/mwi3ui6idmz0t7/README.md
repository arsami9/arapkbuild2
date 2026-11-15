# NovaGate Proxy (Android)

Proxy VPN app: Connect screen, server picker (Free / Premium / Recents, latency, search, sort),
side menu, and a `VpnService` that creates the system VPN tunnel.

## Open & run
1. Open this folder in Android Studio (Koala or newer, JDK 17).
2. Let Gradle sync, then Run on a device (VPN does not work on most emulators).

## Add your proxies
Edit `app/src/main/assets/servers.json`: host, port, type (`SOCKS5` or `HTTP`), username, password,
`premium` true/false. Latency is measured live by TCP connect time.

## IMPORTANT: forwarding traffic through the proxy
Android's `VpnService` only gives raw IP packets. To send them through a SOCKS5/HTTP proxy you need a
**tun2socks engine**, which is a native library. This project creates the tunnel and calls an interface:

    NovaVpnService.engine = MyTun2Socks()   // implement NovaVpnService.TunnelEngine

Common open-source options: hev-socks5-tunnel, tun2socks (Go, via gomobile). Add one, implement
`TunnelEngine.start(tun, server, protect)` (call `protect` on the proxy socket so it bypasses the VPN),
and traffic will flow. Until then the app connects but does not route traffic.

## Not included yet
- Real premium billing (Google Play Billing) — the Premium banner is UI only.
- Login/accounts, Wi-Fi protection, widget, split tunneling.
- Store the proxy credentials server-side (API) rather than in the APK for a real product,
  since anything inside an APK can be extracted.
