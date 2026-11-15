package com.test.nativeapp

import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import android.widget.TextView

class MainActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val tv = TextView(this)
        tv.text = "NATIVENATIVE-OK-5150"
        tv.textSize = 20f
        setContentView(tv)
    }
}
