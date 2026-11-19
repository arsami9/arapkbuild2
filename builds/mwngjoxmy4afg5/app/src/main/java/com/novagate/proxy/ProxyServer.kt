package com.novagate.proxy

import android.content.Context
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.json.JSONObject
import java.net.InetSocketAddress
import java.net.Socket

data class ProxyServer(
    val id: String,
    val country: String,
    val code: String,
    val city: String,
    val host: String,
    val port: Int,
    val type: String,
    val username: String,
    val password: String,
    val premium: Boolean,
    val latencyMs: Int = -1,
) {
    val title: String get() = if (city.isBlank()) country else "$code - $city"

    /** Emoji flag built from the 2-letter country code. */
    val flag: String
        get() = code.uppercase().map { String(Character.toChars(0x1F1E6 + (it - 'A'))) }.joinToString("")
}

object ServerRepository {

    fun load(context: Context): List<ProxyServer> {
        val text = context.assets.open("servers.json").bufferedReader().use { it.readText() }
        val arr = JSONObject(text).getJSONArray("servers")
        return (0 until arr.length()).map { i ->
            val o = arr.getJSONObject(i)
            ProxyServer(
                id = o.getString("id"),
                country = o.getString("country"),
                code = o.getString("code"),
                city = o.optString("city"),
                host = o.getString("host"),
                port = o.getInt("port"),
                type = o.optString("type", "SOCKS5"),
                username = o.optString("username"),
                password = o.optString("password"),
                premium = o.optBoolean("premium", true),
            )
        }
    }

    /** TCP connect time to the proxy in ms, or -1 if unreachable. */
    suspend fun measureLatency(server: ProxyServer): Int = withContext(Dispatchers.IO) {
        try {
            val start = System.nanoTime()
            Socket().use { it.connect(InetSocketAddress(server.host, server.port), 3000) }
            ((System.nanoTime() - start) / 1_000_000).toInt()
        } catch (e: Exception) {
            -1
        }
    }
}
