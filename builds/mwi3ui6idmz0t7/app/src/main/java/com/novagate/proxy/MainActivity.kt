package com.novagate.proxy

import android.app.Activity
import android.content.Intent
import android.net.VpnService
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.compose.setContent
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

private val Bg = Color(0xFF26233D)
private val Card = Color(0xFF38344F)
private val Blue = Color(0xFF2F8CF4)
private val Gold = Color(0xFFF5A623)
private val Green = Color(0xFF2ECC71)

private enum class Screen { HOME, SERVERS, MENU }

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent { MaterialTheme(colorScheme = darkColorScheme()) { App() } }
    }
}

@Composable
private fun App() {
    val ctx = LocalContext.current
    var screen by remember { mutableStateOf(Screen.HOME) }
    var servers by remember { mutableStateOf(ServerRepository.load(ctx)) }
    var selected by remember { mutableStateOf<ProxyServer?>(null) } // null = Fastest
    var connected by remember { mutableStateOf(NovaVpnService.state == NovaVpnService.State.CONNECTED) }
    var pendingServer by remember { mutableStateOf<ProxyServer?>(null) }

    // Measure latency for every server once.
    LaunchedEffect(Unit) {
        servers = servers.map { it.copy(latencyMs = ServerRepository.measureLatency(it)) }
    }

    fun fastest(): ProxyServer? =
        servers.filter { it.latencyMs >= 0 }.minByOrNull { it.latencyMs } ?: servers.firstOrNull()

    val vpnPermission = rememberLauncherForActivityResult(ActivityResultContracts.StartActivityForResult()) { r ->
        if (r.resultCode == Activity.RESULT_OK) {
            pendingServer?.let { ctx.startService(NovaVpnService.connectIntent(ctx, it)); connected = true }
        }
    }

    fun toggle() {
        if (connected) {
            ctx.startService(NovaVpnService.disconnectIntent(ctx)); connected = false
        } else {
            val target = selected ?: fastest() ?: return
            pendingServer = target
            val prep: Intent? = VpnService.prepare(ctx)
            if (prep != null) vpnPermission.launch(prep)
            else { ctx.startService(NovaVpnService.connectIntent(ctx, target)); connected = true }
        }
    }

    Box(Modifier.fillMaxSize().background(Bg)) {
        when (screen) {
            Screen.HOME -> HomeScreen(
                connected = connected,
                location = selected ?: fastest(),
                isFastest = selected == null,
                onToggle = ::toggle,
                onLocation = { screen = Screen.SERVERS },
                onMenu = { screen = Screen.MENU },
            )
            Screen.SERVERS -> ServerScreen(
                servers = servers,
                selectedId = selected?.id,
                onSelect = { selected = it; screen = Screen.HOME },
                onFastest = { selected = null; screen = Screen.HOME },
                onBack = { screen = Screen.HOME },
            )
            Screen.MENU -> MenuScreen(onBack = { screen = Screen.HOME })
        }
    }
}

@Composable
private fun HomeScreen(
    connected: Boolean,
    location: ProxyServer?,
    isFastest: Boolean,
    onToggle: () -> Unit,
    onLocation: () -> Unit,
    onMenu: () -> Unit,
) {
    Column(Modifier.fillMaxSize().statusBarsPadding().padding(20.dp)) {
        Row(Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) {
            Icon(Icons.Default.Menu, null, tint = Color.White,
                modifier = Modifier.size(32.dp).clickable { onMenu() })
            Spacer(Modifier.weight(1f))
            Icon(Icons.Default.Public, null, tint = Color.White, modifier = Modifier.size(30.dp))
        }
        Spacer(Modifier.height(48.dp))

        Box(Modifier.fillMaxWidth(), contentAlignment = Alignment.Center) {
            Box(Modifier.size(240.dp).clip(CircleShape)
                .background(if (connected) Green.copy(alpha = .18f) else Color.White.copy(alpha = .08f)))
            Box(Modifier.size(180.dp).clip(CircleShape)
                .background(if (connected) Green.copy(alpha = .35f) else Color.White.copy(alpha = .15f)))
            Box(Modifier.size(140.dp).clip(CircleShape)
                .background(if (connected) Green else Color(0xFFE0DFE6))
                .clickable { onToggle() },
                contentAlignment = Alignment.Center) {
                Icon(Icons.Default.PowerSettingsNew, null,
                    tint = if (connected) Color.White else Color.Gray,
                    modifier = Modifier.size(64.dp))
            }
        }
        Spacer(Modifier.height(24.dp))
        Text(if (connected) "CONNECTED" else "CONNECT", Modifier.fillMaxWidth(),
            color = if (connected) Green else Color.LightGray, fontSize = 22.sp,
            fontWeight = FontWeight.SemiBold, textAlign = androidx.compose.ui.text.style.TextAlign.Center)

        Spacer(Modifier.height(48.dp))
        Surface(Modifier.fillMaxWidth().clickable { onLocation() }, color = Card,
            shape = RoundedCornerShape(16.dp)) {
            Row(Modifier.padding(20.dp), verticalAlignment = Alignment.CenterVertically) {
                Text("Location:", color = Color.White, fontSize = 18.sp)
                Spacer(Modifier.weight(1f))
                Text(location?.flag ?: "🌐", fontSize = 26.sp)
                Spacer(Modifier.width(8.dp))
                Text(if (isFastest) "Fastest" else location?.title ?: "-", color = Color.White, fontSize = 18.sp)
                Icon(Icons.Default.ChevronRight, null, tint = Color.White)
            }
        }
        Spacer(Modifier.height(16.dp))
        var proto by remember { mutableStateOf(0) }
        Surface(Modifier.fillMaxWidth(), color = Card, shape = RoundedCornerShape(16.dp)) {
            Row(Modifier.padding(vertical = 8.dp)) {
                listOf("Auto", "SOCKS5", "HTTP").forEachIndexed { i, label ->
                    Box(Modifier.weight(1f).clickable { proto = i }.padding(vertical = 18.dp),
                        contentAlignment = Alignment.Center) {
                        Text(label, color = if (proto == i) Color.White else Color.Gray, fontSize = 16.sp)
                    }
                }
            }
        }
        Spacer(Modifier.height(24.dp))
        PremiumBanner()
    }
}

@Composable
private fun PremiumBanner() {
    Surface(Modifier.fillMaxWidth(), color = Color(0xFF191527), shape = RoundedCornerShape(16.dp)) {
        Row(Modifier.padding(20.dp), verticalAlignment = Alignment.CenterVertically) {
            Column(Modifier.weight(1f)) {
                Text("Go Premium", color = Color.White, fontSize = 20.sp, fontWeight = FontWeight.Bold)
                Text("No ads. Unlock every server location.", color = Color.Gray, fontSize = 14.sp)
                Spacer(Modifier.height(8.dp))
                Text("Start free trial  →", color = Blue, fontSize = 16.sp, fontWeight = FontWeight.SemiBold)
            }
            Icon(Icons.Default.WorkspacePremium, null, tint = Gold, modifier = Modifier.size(56.dp))
        }
    }
}

@Composable
private fun ServerScreen(
    servers: List<ProxyServer>,
    selectedId: String?,
    onSelect: (ProxyServer) -> Unit,
    onFastest: () -> Unit,
    onBack: () -> Unit,
) {
    var tab by remember { mutableStateOf(1) }
    var query by remember { mutableStateOf("") }
    val recents = remember { mutableStateListOf<String>() }
    val list = servers
        .filter { when (tab) { 0 -> !it.premium; 1 -> it.premium; else -> it.id in recents } }
        .filter { query.isBlank() || it.title.contains(query, true) || it.country.contains(query, true) }
        .sortedBy { if (it.latencyMs < 0) Int.MAX_VALUE else it.latencyMs }

    Column(Modifier.fillMaxSize().statusBarsPadding().padding(horizontal = 16.dp)) {
        Row(Modifier.fillMaxWidth().padding(vertical = 16.dp), verticalAlignment = Alignment.CenterVertically) {
            Icon(Icons.Default.ArrowBackIosNew, null, tint = Color.White,
                modifier = Modifier.clickable { onBack() })
            Text("Select server location", Modifier.weight(1f), color = Color.White, fontSize = 22.sp,
                textAlign = androidx.compose.ui.text.style.TextAlign.Center)
            Spacer(Modifier.width(24.dp))
        }
        Surface(color = Color(0xFF3D3563), shape = RoundedCornerShape(16.dp)) {
            Row(Modifier.fillMaxWidth().padding(6.dp)) {
                listOf("Free", "Premium", "Recents").forEachIndexed { i, label ->
                    Box(Modifier.weight(1f).clip(RoundedCornerShape(12.dp))
                        .background(if (tab == i && i == 1) Brush.horizontalGradient(listOf(Gold, Color(0xFFF2D045)))
                        else Brush.horizontalGradient(listOf(Color.Transparent, Color.Transparent)))
                        .clickable { tab = i }.padding(vertical = 14.dp),
                        contentAlignment = Alignment.Center) {
                        Text(label, color = if (tab == i && i == 1) Color.Black else Color.LightGray,
                            fontSize = 17.sp, fontWeight = FontWeight.Medium)
                    }
                }
            }
        }
        Spacer(Modifier.height(20.dp))
        Text("Fastest server", color = Color.White, fontSize = 18.sp, fontWeight = FontWeight.Bold)
        val top = servers.filter { it.latencyMs >= 0 }.minByOrNull { it.latencyMs }
        ServerRow(top, selectedId == null, onFastest)

        OutlinedTextField(query, { query = it }, Modifier.fillMaxWidth().padding(vertical = 14.dp),
            placeholder = { Text("Search") },
            leadingIcon = { Icon(Icons.Default.Search, null) },
            shape = RoundedCornerShape(14.dp), singleLine = true)

        Row(Modifier.fillMaxWidth().padding(bottom = 6.dp)) {
            Text(if (tab == 0) "Free servers" else "Premium servers", color = if (tab == 0) Color.White else Gold,
                fontSize = 18.sp, fontWeight = FontWeight.Bold)
            Spacer(Modifier.weight(1f))
            Text("Sort: Fastest", color = Blue, fontSize = 15.sp)
        }
        LazyColumn {
            items(list, key = { it.id }) { s ->
                ServerRow(s, selectedId == s.id) {
                    recents.remove(s.id); recents.add(0, s.id); onSelect(s)
                }
            }
        }
    }
}

@Composable
private fun ServerRow(s: ProxyServer?, selected: Boolean, onClick: () -> Unit) {
    if (s == null) return
    Row(Modifier.fillMaxWidth().clickable { onClick() }.padding(vertical = 12.dp),
        verticalAlignment = Alignment.CenterVertically) {
        Text(s.flag, fontSize = 34.sp)
        Spacer(Modifier.width(14.dp))
        Column(Modifier.weight(1f)) {
            Text(s.title, color = Color.White, fontSize = 18.sp)
            Text(if (s.latencyMs >= 0) "Latency: ${s.latencyMs}ms" else "Latency: --",
                color = Color.Gray, fontSize = 14.sp)
        }
        RadioButton(selected, onClick)
    }
    HorizontalDivider(color = Color.White.copy(alpha = .1f))
}

@Composable
private fun MenuScreen(onBack: () -> Unit) {
    Column(Modifier.fillMaxSize().statusBarsPadding().padding(16.dp)) {
        Icon(Icons.Default.ArrowBackIosNew, null, tint = Color.White,
            modifier = Modifier.padding(8.dp).clickable { onBack() })
        Spacer(Modifier.height(24.dp))
        MenuGroup(listOf(
            Icons.Default.Shield to "Secure more devices",
            Icons.Default.AccountCircle to "My account"))
        Spacer(Modifier.height(16.dp))
        MenuGroup(listOf(
            Icons.Default.Wifi to "Wi-Fi Protection",
            Icons.Default.Widgets to "Widget",
            Icons.Default.LocationOn to "What is my IP?",
            Icons.Default.Settings to "Settings"))
        Spacer(Modifier.height(16.dp))
        MenuGroup(listOf(
            Icons.Default.ThumbUp to "Rate us",
            Icons.Default.Share to "Share app",
            Icons.Default.Help to "Get help"))
    }
}

@Composable
private fun MenuGroup(items: List<Pair<ImageVector, String>>) {
    Surface(color = Color(0xFF34304A), shape = RoundedCornerShape(20.dp)) {
        Column {
            items.forEachIndexed { i, (icon, label) ->
                Row(Modifier.fillMaxWidth().clickable { }.padding(horizontal = 20.dp, vertical = 20.dp),
                    verticalAlignment = Alignment.CenterVertically) {
                    Icon(icon, null, tint = Blue)
                    Spacer(Modifier.width(18.dp))
                    Text(label, Modifier.weight(1f), color = Color.White, fontSize = 18.sp)
                    Icon(Icons.Default.ChevronRight, null, tint = Color.Gray)
                }
                if (i != items.lastIndex) HorizontalDivider(color = Color.Black.copy(alpha = .25f))
            }
        }
    }
}
