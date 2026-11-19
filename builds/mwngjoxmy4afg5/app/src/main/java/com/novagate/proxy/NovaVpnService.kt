package com.novagate.proxy

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.Intent
import android.net.VpnService
import android.os.Build
import android.os.ParcelFileDescriptor
import androidx.core.app.NotificationCompat

/**
 * Establishes the system VPN interface (TUN) and hands its packets to a tunnel engine
 * that forwards them through the selected SOCKS5/HTTP proxy.
 *
 * IMPORTANT: Android's VpnService only gives you raw IP packets. To forward them through a
 * SOCKS5 proxy you need a tun2socks engine (native library). Plug one in by implementing
 * [TunnelEngine] — see the README. Without an engine, the interface is created but traffic
 * is not forwarded.
 */
class NovaVpnService : VpnService() {

    interface TunnelEngine {
        fun start(tun: ParcelFileDescriptor, server: ProxyServer, protect: (Int) -> Boolean)
        fun stop()
    }

    private var tun: ParcelFileDescriptor? = null

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        when (intent?.action) {
            ACTION_DISCONNECT -> {
                disconnect()
                return START_NOT_STICKY
            }
            ACTION_CONNECT -> {
                val server = ProxyServer(
                    id = intent.getStringExtra(EXTRA_ID).orEmpty(),
                    country = intent.getStringExtra(EXTRA_COUNTRY).orEmpty(),
                    code = intent.getStringExtra(EXTRA_CODE).orEmpty(),
                    city = intent.getStringExtra(EXTRA_CITY).orEmpty(),
                    host = intent.getStringExtra(EXTRA_HOST).orEmpty(),
                    port = intent.getIntExtra(EXTRA_PORT, 1080),
                    type = intent.getStringExtra(EXTRA_TYPE) ?: "SOCKS5",
                    username = intent.getStringExtra(EXTRA_USER).orEmpty(),
                    password = intent.getStringExtra(EXTRA_PASS).orEmpty(),
                    premium = true,
                )
                connect(server)
            }
        }
        return START_STICKY
    }

    private fun connect(server: ProxyServer) {
        startForeground(NOTIF_ID, buildNotification(server))
        tun?.close()
        tun = Builder()
            .setSession("NovaGate - ${server.title}")
            .addAddress("10.8.0.2", 32)
            .addRoute("0.0.0.0", 0)
            .addDnsServer("1.1.1.1")
            .addDnsServer("8.8.8.8")
            .setMtu(1500)
            .establish()

        val fd = tun ?: return
        engine?.start(fd, server) { socketFd -> protect(socketFd) }
        state = State.CONNECTED
        connectedServer = server
    }

    private fun disconnect() {
        engine?.stop()
        tun?.close()
        tun = null
        state = State.DISCONNECTED
        connectedServer = null
        stopForeground(STOP_FOREGROUND_REMOVE)
        stopSelf()
    }

    override fun onRevoke() {
        disconnect()
    }

    override fun onDestroy() {
        disconnect()
        super.onDestroy()
    }

    private fun buildNotification(server: ProxyServer): Notification {
        val nm = getSystemService(NotificationManager::class.java)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            nm.createNotificationChannel(
                NotificationChannel(CHANNEL_ID, "VPN status", NotificationManager.IMPORTANCE_LOW)
            )
        }
        return NotificationCompat.Builder(this, CHANNEL_ID)
            .setSmallIcon(android.R.drawable.ic_lock_lock)
            .setContentTitle("Connected")
            .setContentText(server.title)
            .setOngoing(true)
            .build()
    }

    enum class State { DISCONNECTED, CONNECTED }

    companion object {
        const val ACTION_CONNECT = "com.novagate.proxy.CONNECT"
        const val ACTION_DISCONNECT = "com.novagate.proxy.DISCONNECT"
        const val EXTRA_ID = "id"
        const val EXTRA_COUNTRY = "country"
        const val EXTRA_CODE = "code"
        const val EXTRA_CITY = "city"
        const val EXTRA_HOST = "host"
        const val EXTRA_PORT = "port"
        const val EXTRA_TYPE = "type"
        const val EXTRA_USER = "user"
        const val EXTRA_PASS = "pass"
        private const val CHANNEL_ID = "vpn_status"
        private const val NOTIF_ID = 1

        /** Set this once (e.g. in Application/MainActivity) to your tun2socks implementation. */
        @Volatile var engine: TunnelEngine? = null
        @Volatile var state: State = State.DISCONNECTED
        @Volatile var connectedServer: ProxyServer? = null

        fun connectIntent(context: android.content.Context, s: ProxyServer) =
            Intent(context, NovaVpnService::class.java).apply {
                action = ACTION_CONNECT
                putExtra(EXTRA_ID, s.id); putExtra(EXTRA_COUNTRY, s.country)
                putExtra(EXTRA_CODE, s.code); putExtra(EXTRA_CITY, s.city)
                putExtra(EXTRA_HOST, s.host); putExtra(EXTRA_PORT, s.port)
                putExtra(EXTRA_TYPE, s.type); putExtra(EXTRA_USER, s.username)
                putExtra(EXTRA_PASS, s.password)
            }

        fun disconnectIntent(context: android.content.Context) =
            Intent(context, NovaVpnService::class.java).apply { action = ACTION_DISCONNECT }
    }
}
