var l8 = ee.ImageCollection("LANDSAT/LC08/C02/T1_L2")
//memfilter citra landsat 8 berdasarkan wilayah
var l8table = l8.filterBounds(table); 

//memfilter citra landsat 8 berdasarkan waktu
var l8tabledate = l8table.filterDate('2024-03-01','2024-05-31');
print(l8tabledate);
Map.addLayer(l8tabledate)

//cloud masking citra landsat 8
var masking = function (img) {
  var cloudshadowbitmask = (1 << 3)
  var cloudshadowmask = (1 << 5)
  var qa = img.select('QA_PIXEL')
  var maskshadow =
qa.bitwiseAnd(cloudshadowbitmask).eq(0)
  var maskcloud = qa.bitwiseAnd(cloudshadowmask).eq(0)
  var mask = maskshadow.and(maskcloud)
  return img.updateMask(mask)
};
var l8Clear = l8tabledate.sort('CLOUD_COVER_LAND')
            .map(masking)
            .median();
            
Map.addLayer (l8Clear)

//scalling factors
var scale = function applyScaleFactors(image) {
var opticalBands = image.select('SR_B.').multiply(0.0000275).add(-0.2);
var thermalBands = image.select('ST_B.*').multiply(0.00341802).add(149.0);
return image.addBands(opticalBands, null, true)
                .addBands(thermalBands, null, true);
}
//clip citra landsat 8
var l8Clip = l8Clear.clip(table);
var l8scale = scale(l8Clip);
var composite = l8scale;
var composite = composite.toFloat()

//display citra true color
var visualisasi = {band: ['SR_B4', 'SR_B3', 'SR_B2'], max: 0.1};
Map.addLayer(composite, visualisasi, 'komposit warna nyata');

//pendefinisian band
var swir = composite.select('SR_B6');
var nir = composite.select('SR_B5');
var red = composite.select('SR_B4');
var green = composite.select('SR_B3');

//NDVI
var ndvi = nir.subtract(red).divide(nir.add(red));
var ndvi = ndvi.clip(table);
var ndvi1 = ee.Image(1)
          .where(ndvi.gt(-0.92).and(ndvi.lte(0.26)),2)
          .where(ndvi.gt(0.26).and(ndvi.lte(0.53)),3)
          .where(ndvi.gt(0.53).and(ndvi.lte(0.69)),4)
          .where(ndvi.gt(0.69).and(ndvi.lte(0.8)),5)
          .where(ndvi.gt(0.8), 6)
var ndvi2 = ndvi1.clip(table);
Map.addLayer(ndvi2, {min: 2, max: 6, palette: ['red', 'orange', 'yellow', 'limegreen', 'green']}, 'Klasifikasi NDVI')

//NDBI
var ndbi = swir.subtract(nir).divide(swir.add(nir));
var ndbi = ndbi.clip(table);
var ndbi2 = ee.Image(1)
          .where(ndbi.gt(-1).and(ndbi.lte(-0.4)),2)
          .where(ndbi.gt(-0.4).and(ndbi.lte(-0.3)),3)
          .where(ndbi.gt(-0.3).and(ndbi.lte(-0.15)),4)
          .where(ndbi.gt(-0.15).and(ndbi.lte(0.37)),5)
var ndbi2 = ndbi2.clip(table);
Map.addLayer(ndbi2, {min: 2,max: 5, palette: ['green', 'limegreen', 'orange', 'red']}, 'Klasifikasi NDBI');

// Misal nama variabel CSV: table
var fc = table.map(function(feature) {
  var point = ee.Geometry.Point([feature.get('lon'), feature.get('lat')]);
  return ee.Feature(point, {
    id: feature.get('id'),
    nama: feature.get('nama')
  });
});

// Tampilkan di peta
Map.centerObject(table, 14);
Map.setCenter(112.7333, -7.2065, 14); // zoom 14 cocok untuk skala kecamatan/kelurahan
Map.addLayer(table2, {color: 'blue'}, 'Titik dari CSV');

//legend untuk NDVI
var panelNDVI = ui.Panel({
  style: {
    position: 'bottom-left',
    padding: '8px',
    backgroundColor: 'white'
  }
});

panelNDVI.add(ui.Label({
  value: 'Legenda NDVI',
  style: {fontWeight: 'bold', fontSize: '14px', margin: '4px 0'}
}));

var ndviColors = ['red', 'orange', 'yellow', 'limegreen', 'green'];
var ndviLabels = ['-0.92 s.d 0.26', '0.26 s.d 0.53', '0.53 s.d 0.69', '0.69 s.d 0.8', '> 0.8'];

for (var i = 0; i < ndviColors.length; i++) {
  var colorBox = ui.Label('', {
    backgroundColor: ndviColors[i],
    padding: '8px',
    margin: '0 4px'
  });

  var description = ui.Label(ndviLabels[i], {margin: '0 4px'});

  var row = ui.Panel([colorBox, description], ui.Panel.Layout.Flow('horizontal'));
  panelNDVI.add(row);
}

Map.add(panelNDVI);


//legend untuk NDBI 
var panelNDBI = ui.Panel({
  style: {
    position: 'bottom-right',
    padding: '8px',
    backgroundColor: 'white'
  }
});

panelNDBI.add(ui.Label({
  value: 'Legenda NDBI',
  style: {fontWeight: 'bold', fontSize: '14px', margin: '4px 0'}
}));

var ndbiColors = ['green', 'limegreen', 'orange', 'red'];
var ndbiLabels = ['< -0.4', '-0.4 s.d -0.3', '-0.3 s.d -0.15', '> -0.15'];

for (var j = 0; j < ndbiColors.length; j++) {
  var box = ui.Label('', {
    backgroundColor: ndbiColors[j],
    padding: '8px',
    margin: '0 4px'
  });

  var desc = ui.Label(ndbiLabels[j], {margin: '0 4px'});

  var rowNDBI = ui.Panel([box, desc], ui.Panel.Layout.Flow('horizontal'));
  panelNDBI.add(rowNDBI);
}

Map.add(panelNDBI);

// Rename untuk NDVI dan NDBI agar bisa diekstrak
var ndviRaw = nir.subtract(red).divide(nir.add(red)).rename('NDVI');
var ndvi = ndviRaw.clip(table);

var ndbiRaw = swir.subtract(nir).divide(swir.add(nir)).rename('NDBI');
var ndbi = ndbiRaw.clip(table);

// Sampling ke titik
var ndviSample = ndvi.sampleRegions({
  collection: table2,
  scale: 30,
  geometries: true
});

var ndbiSample = ndbi.sampleRegions({
  collection: table2,
  scale: 30,
  geometries: true
});

// Export Citra NDVI
Export.image.toDrive({
  image: ndvi2.visualize({
    min: 2,
    max: 6,
    palette: ['red', 'orange', 'yellow', 'limegreen', 'green']
  }),
  description: 'NDVI_Map_SBY_2024',
  folder: 'Data_Skripsi',
  fileNamePrefix: 'NDVI_Surabaya_2024',
  region: table.geometry(), // area studi
  scale: 30,
  crs: 'EPSG:4326',
  maxPixels: 1e13,
  fileFormat: 'GeoTIFF' // format yang didukung
});

// Export Citra NDBI
Export.image.toDrive({
  image: ndbi2.visualize({
    min: 2,
    max: 5,
    palette: ['green', 'limegreen', 'orange', 'red']
  }),
  description: 'NDBI_Map_SBY_2024',
  folder: 'Data_Skripsi',
  fileNamePrefix: 'NDBI_Surabaya_2024',
  region: table.geometry(),
  scale: 30,
  crs: 'EPSG:4326',
  maxPixels: 1e13,
  fileFormat: 'GeoTIFF'
});

// Export CSV NDVI
Export.table.toDrive({
  collection: ndviSample,
  description: 'NDVI_export_SBY_2024',
  folder: 'Data_Skripsi',
  fileFormat: 'CSV'
});

// Export CSV NDBI
Export.table.toDrive({
  collection: ndbiSample,
  description: 'NDBI_export_SBY_2024',
  folder: 'Data_Skripsi',
  fileFormat: 'CSV'
});
