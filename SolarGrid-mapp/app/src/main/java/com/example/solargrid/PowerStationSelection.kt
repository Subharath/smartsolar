package com.example.solargrid

import android.Manifest
import android.content.Intent
import android.content.pm.PackageManager
import android.location.Location
import android.location.LocationListener
import android.location.LocationManager
import android.os.Bundle
import android.os.Looper
import android.widget.ImageView
import android.widget.TextView
import android.widget.Toast
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import org.maplibre.android.MapLibre
import org.maplibre.android.annotations.MarkerOptions
import org.maplibre.android.camera.CameraPosition
import org.maplibre.android.camera.CameraUpdateFactory
import org.maplibre.android.geometry.LatLng
import org.maplibre.android.location.LocationComponentActivationOptions
import org.maplibre.android.location.modes.CameraMode
import org.maplibre.android.location.modes.RenderMode
import org.maplibre.android.maps.MapLibreMap
import org.maplibre.android.maps.MapView
import org.maplibre.android.maps.Style
import android.app.Dialog
import android.view.WindowManager
import android.widget.Button

class PowerStationSelection : AppCompatActivity() {

    private lateinit var mapView: MapView
    private lateinit var locationManager: LocationManager

    private var map: MapLibreMap? = null
    private var loadedStyle: Style? = null
    private var currentLocation: Location? = null

    private var locationEnabled = false     // component activated + updates running
    private var firstFixHandled = false     // stations + camera only on first fix

    // Temporary dummy station data. Replace with backend data.
    private data class PowerStation(
        val name: String,
        val latitudeOffset: Double,
        val longitudeOffset: Double
    )

    private val dummyStations = listOf(
        PowerStation("Power Station A", 0.003, 0.003),
        PowerStation("Power Station B", -0.004, 0.002),
        PowerStation("Power Station C", 0.002, -0.005),
        PowerStation("Power Station D", -0.006, -0.003),
        PowerStation("Power Station E", 0.007, 0.001)
    )

    private val locationListener = object : LocationListener {
        override fun onLocationChanged(location: Location) {
            onLocationUpdate(location)
        }

        // Required on API < 30, otherwise AbstractMethodError.
        override fun onProviderEnabled(provider: String) {}
        override fun onProviderDisabled(provider: String) {}

        @Deprecated("Deprecated in Java")
        override fun onStatusChanged(provider: String?, status: Int, extras: Bundle?) {}
    }

    private val locationPermissionLauncher =
        registerForActivityResult(ActivityResultContracts.RequestMultiplePermissions()) {
            if (hasLocationPermission()) {
                enableLocation()
            } else {
                Toast.makeText(
                    this,
                    "Location permission is needed to find nearby stations.",
                    Toast.LENGTH_LONG
                ).show()
            }
        }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        MapLibre.getInstance(this)
        setContentView(R.layout.activity_power_station_selection)

        mapView = findViewById(R.id.mapView)
        locationManager = getSystemService(LOCATION_SERVICE) as LocationManager

        mapView.onCreate(savedInstanceState)

        findViewById<ImageView>(R.id.powerBackButton).setOnClickListener {
            startActivity(Intent(this, ProcumerDashboard::class.java))
            finish()
        }

        mapView.getMapAsync { mapLibreMap ->
            map = mapLibreMap

            findViewById<TextView>(R.id.zoomInButton).setOnClickListener {
                mapLibreMap.animateCamera(CameraUpdateFactory.zoomIn())
            }

            findViewById<TextView>(R.id.zoomOutButton).setOnClickListener {
                mapLibreMap.animateCamera(CameraUpdateFactory.zoomOut())
            }

            // Power station marker click
            mapLibreMap.setOnMarkerClickListener { marker ->

                val dialog = Dialog(this)

                dialog.setContentView(R.layout.dialog_power_station)

                val stationTitle =
                    dialog.findViewById<TextView>(R.id.stationTitle)

                val stationDistance =
                    dialog.findViewById<TextView>(R.id.stationDistance)

                val continueButton =
                    dialog.findViewById<Button>(R.id.continueButton)

                stationTitle.text = marker.title
                stationDistance.text = marker.snippet

                continueButton.setOnClickListener {

                    val intent = Intent(
                        this,
                        BookEnergySlot::class.java
                    )

                    intent.putExtra(
                        "station_name",
                        marker.title
                    )

                    startActivity(intent)

                    dialog.dismiss()
                }

                dialog.window?.setBackgroundDrawableResource(
                    android.R.color.transparent
                )

                dialog.show()

                dialog.window?.setLayout(
                    dpToPx(300),
                    WindowManager.LayoutParams.WRAP_CONTENT
                )

                true
            }

            // demotiles has no street-level data. Use a real style.


            // demotiles has no street-level data. Use a real style.
            mapLibreMap.setStyle("https://tiles.openfreemap.org/styles/liberty") { style ->
                loadedStyle = style

                // Fallback camera until the first fix arrives.
                mapLibreMap.cameraPosition = CameraPosition.Builder()
                    .target(LatLng(6.9271, 79.8612))
                    .zoom(12.0)
                    .build()

                checkLocationPermission()
            }
        }
    }

    // ---------- Permissions ----------

    private fun hasLocationPermission(): Boolean =
        isGranted(Manifest.permission.ACCESS_FINE_LOCATION) ||
                isGranted(Manifest.permission.ACCESS_COARSE_LOCATION)

    private fun isGranted(permission: String) =
        ContextCompat.checkSelfPermission(this, permission) == PackageManager.PERMISSION_GRANTED

    private fun checkLocationPermission() {
        if (hasLocationPermission()) {
            enableLocation()
        } else {
            locationPermissionLauncher.launch(
                arrayOf(
                    Manifest.permission.ACCESS_FINE_LOCATION,
                    Manifest.permission.ACCESS_COARSE_LOCATION
                )
            )
        }
    }

    // ---------- Location ----------

    /** Needs: style loaded + permission granted. Safe to call more than once. */
    private fun enableLocation() {
        val style = loadedStyle ?: return
        val mapLibreMap = map ?: return
        if (!hasLocationPermission()) return

        val component = mapLibreMap.locationComponent
        if (!component.isLocationComponentActivated) {
            component.activateLocationComponent(
                LocationComponentActivationOptions.builder(this, style)
                    .useDefaultLocationEngine(false) // we feed it from our own listener
                    .build()
            )
        }
        component.isLocationComponentEnabled = true
        component.cameraMode = CameraMode.NONE
        component.renderMode = RenderMode.NORMAL

        locationEnabled = true
        startLocationUpdates()
    }

    private fun startLocationUpdates() {
        if (!locationEnabled || !hasLocationPermission()) return

        try {
            val fine = isGranted(Manifest.permission.ACCESS_FINE_LOCATION)

            val providers = buildList {
                if (fine && locationManager.isProviderEnabled(LocationManager.GPS_PROVIDER)) {
                    add(LocationManager.GPS_PROVIDER)
                }
                if (locationManager.isProviderEnabled(LocationManager.NETWORK_PROVIDER)) {
                    add(LocationManager.NETWORK_PROVIDER)
                }
            }

            if (providers.isEmpty()) {
                Toast.makeText(this, "Please enable your device location.", Toast.LENGTH_LONG).show()
                return
            }

            // Show something immediately from the cache.
            providers
                .mapNotNull { locationManager.getLastKnownLocation(it) }
                .maxByOrNull { it.time }
                ?.let { onLocationUpdate(it) }

            // Then stream fresh fixes.
            providers.forEach { provider ->
                locationManager.requestLocationUpdates(
                    provider, 2000L, 0f, locationListener, Looper.getMainLooper()
                )
            }
        } catch (e: SecurityException) {
            Toast.makeText(this, "Location permission is required.", Toast.LENGTH_SHORT).show()
        }
    }

    private fun stopLocationUpdates() {
        locationManager.removeUpdates(locationListener)
    }

    private fun onLocationUpdate(location: Location) {
        currentLocation = location
        val mapLibreMap = map ?: return

        // Moves the blue dot.
        mapLibreMap.locationComponent.forceLocationUpdate(location)

        // Stations + camera only once, otherwise the map fights the user's panning.
        if (!firstFixHandled) {
            firstFixHandled = true
            showStations(location)
            mapLibreMap.animateCamera(
                CameraUpdateFactory.newLatLngZoom(
                    LatLng(location.latitude, location.longitude), 14.0
                )
            )
        }
    }

    private fun showStations(location: Location) {
        val mapLibreMap = map ?: return

        mapLibreMap.clear()

        dummyStations.forEach { station ->
            val stationLat = location.latitude + station.latitudeOffset
            val stationLng = location.longitude + station.longitudeOffset

            val result = FloatArray(1)
            Location.distanceBetween(
                location.latitude, location.longitude,
                stationLat, stationLng, result
            )
            val meters = result[0]
            val distanceText =
                if (meters < 1000) "${meters.toInt()} m"
                else "%.1f km".format(meters / 1000)

            mapLibreMap.addMarker(
                MarkerOptions()
                    .position(LatLng(stationLat, stationLng))
                    .title(station.name)
                    .snippet("$distanceText away (dummy data)")
            )
        }
    }

    // ---------- Lifecycle ----------

    override fun onStart() {
        super.onStart()
        mapView.onStart()
        startLocationUpdates() // no-op until enableLocation() has run once
    }

    override fun onResume() {
        super.onResume()
        mapView.onResume()
    }

    override fun onPause() {
        mapView.onPause()
        super.onPause()
    }

    override fun onStop() {
        stopLocationUpdates()
        mapView.onStop()
        super.onStop()
    }

    override fun onSaveInstanceState(outState: Bundle) {
        mapView.onSaveInstanceState(outState)
        super.onSaveInstanceState(outState)
    }

    override fun onLowMemory() {
        super.onLowMemory()
        mapView.onLowMemory()
    }

    override fun onDestroy() {
        mapView.onDestroy()
        super.onDestroy()
    }

    private fun dpToPx(dp: Int): Int {
        return (dp * resources.displayMetrics.density).toInt()
    }
}