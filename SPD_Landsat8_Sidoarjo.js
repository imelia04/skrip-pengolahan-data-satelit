//Memanggil Citra Landsat 8
var Landsat8 = ee.ImageCollection("LANDSAT/LC08/C02/T1_L2");

Map.addLayer(sidoarjo_adm)
Map.centerObject(sidoarjo_adm, 14)

// Memfilter Citra Landsat 8 Berdasarkan Wilayah
var L8Sidoarjo = Landsat8.filterBounds(sidoarjo_adm);

// Memfilter Citra Landsat 8 Berdasarkan Waktu
var L8SidoarjoDate = L8Sidoarjo.filterDate('2017-03-01','2017-05-31');

// Cloud Masking Citra Landsat 8
var masking = function (img) {
  var cloudshadowbitmask = (1 << 3)
  var cloudshadowmask = (1 << 4)
  var qa = img.select('QA_PIXEL')
  var maskshadow = qa.bitwiseAnd(cloudshadowbitmask).eq(0)
  var maskcloud = qa.bitwiseAnd(cloudshadowmask).eq(0)
  var mask = maskshadow.and(maskcloud)
  return img.updateMask(mask)
};
var L8Clear = L8SidoarjoDate.sort('CLOUD_COVER_LAND')
            .map(masking)
            .median();
            
// Clip Citra Landsat 8
var L8Clip = L8Clear.clip(sidoarjo_adm);

//Scaling Factors
var scale = function applyScaleFactors(image) {
var opticalBands = image.select('SR_B.').multiply(0.0000275).add(-0.2);
var thermalBands = image.select('ST_B.*').multiply(0.00341802).add(149.0);
return image.addBands(opticalBands, null, true)
		.addBands(thermalBands, null, true);
}
var L8scale = scale(L8Clip);

// Display
Map.addLayer(L8scale);

// Display Citra True Color
Map.addLayer(L8scale, imageVisParam, 'Landsat 8 True Color');

// Memposisikan wilayah penelitian tepat di tengah
Map.centerObject(sidoarjo_adm,14);

//Land Surface Temperature (LST)
//Define Thermal Band
var thermal = L8scale.select('ST_B10');

// Mendapatkan Suhu dalam Celsius (lebih presisi pakai 273.15)
var LSTcelcius = thermal.subtract(273.15);

// Parameter visualisasi LST berdasarkan klasifikasi tropis + warna umum skripsi
var LSTParams = {
  min: 24,
  max: 45,
  palette: ['blue', 'green', 'yellow', 'orange', 'red']
};

Map.addLayer(LSTcelcius, LSTParams, 'Landsat 8 LST');

//Menambahkan Legenda
var panel = ui.Panel({
  style: {
    position: 'bottom-left',
    padding: '5px;'
  }
})

//Mengatur Label
var title = ui.Label({
  value: 'LST',
  style: {
    fontSize: '14px',
    fontWeight: 'bold',
    margin: '0px;'
  }
})
panel.add(title)

// === Panel Legenda untuk LST ===
var legend = ui.Panel({
  style: {
    position: 'bottom-left',
    padding: '8px',
    backgroundColor: 'white'
  }
});

// Judul legenda
var legendTitle = ui.Label({
  value: 'Legenda Suhu (°C)',
  style: {
    fontWeight: 'bold',
    fontSize: '14px',
    margin: '0 0 4px 0'
  }
});
legend.add(legendTitle);

// Warna dan label kelas suhu
var palette = ['blue', 'limegreen', 'yellow', 'orange', 'red'];
var labels = ['Dingin (<10°C)', 'Sejuk (10–20°C)', 'Normal (20–30°C)', 'Hangat (30–40°C)', 'Panas (>40°C)'];

// Fungsi untuk membuat baris legenda
for (var i = 0; i < palette.length; i++) {
  var colorBox = ui.Label('', {
    backgroundColor: palette[i],
    padding: '8px',
    margin: '0 4px'
  });

  var description = ui.Label(labels[i], {margin: '0 4px'});

  var row = ui.Panel([colorBox, description], ui.Panel.Layout.Flow('horizontal'));
  legend.add(row);
}
// Tambahkan ke peta
Map.add(legend);


// Menampilkan titik titik penelitian
var fc = table.map(function(feature) {
  var point = ee.Geometry.Point([feature.get('lon'), feature.get('lat')]);
  return ee.Feature(point, {
    id: feature.get('id'),
    nama: feature.get('nama')
  });
});

// Tampilkan di peta
Map.centerObject(sidoarjo_adm, 14);
Map.setCenter(112.7866, -7.3690, 14); // zoom 14 cocok untuk skala kecamatan/kelurahan
Map.addLayer(table, {color: 'blue'}, 'Titik dari CSV');

// Definisikan ulang LST dalam Kelvin (langsung dari band thermal terkalibrasi)
var LST_Kelvin = thermal.rename('LST_K');

// Hitung LST dalam Celsius
var LST_Celsius = LST_Kelvin.subtract(273).rename('LST_C');

// Gabungkan kedua citra menjadi satu citra multi-band
var LST_stack = LST_Kelvin.addBands(LST_Celsius);

// Ambil nilai LST (K dan C) pada titik-titik CSV
var sampled = LST_stack.sampleRegions({
  collection: table,
  properties: ['id', 'nama'],
  scale: 30,
  geometries: true
});

// Tampilkan hasil ke console
print('Sampled LST (K & C):', sampled);

//Export ke tiff
Export.image.toDrive({
image: LSTcelcius.visualize(LSTParams), // Menggunakan visualisasi color ramp
  description: 'Export_LST_SDA_2017_JPG',
  folder: 'Data_Skripsi',
  fileNamePrefix: 'LST_SDA_2017_RGB',
  region: sidoarjo_adm,
  scale: 30,
  maxPixels: 1e13,
  crs: 'EPSG:4326',
  fileFormat: 'GeoTIFF',
  formatOptions: {
    cloudOptimized: true
  }
});
// Export hasil sampling ke file CSV
Export.table.toDrive({
  collection: sampled,
  description: 'Export_LST_SDA_2017_CSV',
  folder: 'Data_Skripsi',
  fileNamePrefix: 'LST_SBY_2017',
  fileFormat: 'CSV'
});
