package com.example.solargrid

import android.Manifest
import android.app.Dialog
import android.content.Intent
import android.content.pm.PackageManager
import android.location.Location
import android.location.LocationListener
import android.location.LocationManager
import android.os.Bundle
import android.os.Looper
import android.view.Gravity
import android.view.View
import android.view.WindowManager
import android.widget.ImageView
import android.widget.TextView
import android.widget.Toast
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import androidx.lifecycle.lifecycleScope
import kotlinx.coroutines.launch
import org.maplibre.android.MapLibre
import org.maplibre.android.annotations.Marker
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

class GridOperatorPowerStationSelection : AppCompatActivity() {

    private lateinit var mapView: MapView
    private lateinit var locationManager: LocationManager

    private var map: MapLibreMap? = null
    private var loadedStyle: Style? = null
    private var currentLocation: Location? = null

    private var locationEnabled = false
    private var firstFixHandled = false

    private var liveStations: List<ApiClient.StationModel> = emptyList()
    private val markerStationMap = mutableMapOf<Marker, ApiClient.StationModel>()

    private val locationListener = object : LocationListener {
        override fun onLocationChanged(location: Location) {
            onLocationUpdate(location)
        }
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
                    "Location permission needed for proximity calculations.",
                    Toast.LENGTH_LONG
                ).show()
                fetchStationsAndPlot(null)
            }
        }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        MapLibre.getInstance(this)
        setContentView(R.layout.activity_grid_operator_power_station_selection)

        mapView = findViewById(R.id.mapView)
        locationManager = getSystemService(LOCATION_SERVICE) as LocationManager

        mapView.onCreate(savedInstanceState)

        findViewById<ImageView>(R.id.powerBackButton).setOnClickListener {
            val intent = Intent(this, GridOperatorDashboard::class.java)
            startActivity(intent)
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

            // Station Marker Click -> Grid Operator Station Details Dialog
            mapLibreMap.setOnMarkerClickListener { marker ->
                val station = markerStationMap[marker]

                val dialog = Dialog(this)
                dialog.setContentView(R.layout.dialog_grid_operator_power_station)

                val stationTitle = dialog.findViewById<TextView>(R.id.stationTitle)
                val stationDistance = dialog.findViewById<TextView>(R.id.stationDistance)
                val closeButton = dialog.findViewById<View>(R.id.closeButton)

                stationTitle.text = station?.hubName ?: marker.title
                stationDistance.text = marker.snippet

                closeButton.setOnClickListener {
                    dialog.dismiss()
                }

                dialog.show()
                dialog.window?.setBackgroundDrawableResource(android.R.color.transparent)
                dialog.window?.setGravity(Gravity.CENTER)
                dialog.window?.setLayout(dpToPx(300), WindowManager.LayoutParams.WRAP_CONTENT)
                true
            }

            mapLibreMap.setStyle("https://tiles.openfreemap.org/styles/liberty") { style ->
                loadedStyle = style

                mapLibreMap.cameraPosition = CameraPosition.Builder()
                    .target(LatLng(6.9147, 79.9729)) // SLIIT Malabe Campus default
                    .zoom(13.5)
                    .build()

                checkLocationPermission()
                fetchStationsAndPlot(null)
            }
        }
    }

    private fun fetchStationsAndPlot(loc: Location?) {
        lifecycleScope.launch {
            liveStations = ApiClient.getStations(this@GridOperatorPowerStationSelection)
            showStations(loc ?: currentLocation)
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

    private fun enableLocation() {
        val style = loadedStyle ?: return
        val mapLibreMap = map ?: return
        if (!hasLocationPermission()) return

        val component = mapLibreMap.locationComponent
        if (!component.isLocationComponentActivated) {
            component.activateLocationComponent(
                LocationComponentActivationOptions.builder(this, style)
                    .useDefaultLocationEngine(false)
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
                fetchStationsAndPlot(null)
                return
            }

            providers
                .mapNotNull { locationManager.getLastKnownLocation(it) }
                .maxByOrNull { it.time }
                ?.let { onLocationUpdate(it) }

            providers.forEach { provider ->
                locationManager.requestLocationUpdates(
                    provider, 2000L, 0f, locationListener, Looper.getMainLooper()
                )
            }
        } catch (_: SecurityException) {
            fetchStationsAndPlot(null)
        }
    }

    private fun stopLocationUpdates() {
        locationManager.removeUpdates(locationListener)
    }

    private fun onLocationUpdate(location: Location) {
        currentLocation = location
        val mapLibreMap = map ?: return

        mapLibreMap.locationComponent.forceLocationUpdate(location)

        if (!firstFixHandled) {
            firstFixHandled = true
            fetchStationsAndPlot(location)
            mapLibreMap.animateCamera(
                CameraUpdateFactory.newLatLngZoom(
                    LatLng(location.latitude, location.longitude), 13.0
                )
            )
        }
    }

    private fun showStations(userLoc: Location?) {
        val mapLibreMap = map ?: return
        mapLibreMap.clear()
        markerStationMap.clear()

        liveStations.forEach { station ->
            val distSnippet = if (userLoc != null) {
                val result = FloatArray(1)
                Location.distanceBetween(
                    userLoc.latitude, userLoc.longitude,
                    station.latitude, station.longitude, result
                )
                val meters = result[0]
                if (meters < 1000) "${meters.toInt()}m away"
                else "%.1f km away".format(meters / 1000)
            } else {
                "${station.capacityKwH} kW"
            }

            val snippet = "$distSnippet | ${station.availableBatterySlots} slots open"

            val marker = mapLibreMap.addMarker(
                MarkerOptions()
                    .position(LatLng(station.latitude, station.longitude))
                    .title(station.hubName)
                    .snippet(snippet)
            )
            markerStationMap[marker] = station
        }
    }

    // ---------- Lifecycle ----------

    override fun onStart() {
        super.onStart()
        mapView.onStart()
        startLocationUpdates()
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
