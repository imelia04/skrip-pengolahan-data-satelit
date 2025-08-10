
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt

# Data historis tahun 2014–2024
tahun_hist = np.arange(2014, 2025)
lst_sby = [45.82108, 46.0897, 46.2154, 46.3393, 41.9225, 44.8949, 45.6837, 43.8035, 45.8136, 43.1472, 43.3758]
ndvi_sby = [0.18314, 0.1994, 0.18437, 0.22502, 0.20802, 0.21059, 0.21384, 0.19688, 0.22296, 0.17924, 0.16506]
ndbi_sby = [0.026951, 0.03077, -0.01365, 0.02207, 0.00056, 0.0206, -0.01632, 0.03393, 0.0244, 0.04433, 0.04934]

lst_sda = [40.87127, 38.9153, 34.9385, 40.7246, 42.2081, 42.9632, 35.7663, 39.1457, 40.6781, 41.9541, 35.9732]
ndvi_sda = [0.501085, 0.49825, 0.55133, 0.53729, 0.51799, 0.51773, 0.47214, 0.52196, 0.5624, 0.5236, 0.54429]
ndbi_sda = [-0.21531, -0.21542, -0.26698, -0.23023, -0.20286, -0.20095, -0.20677, -0.20499, -0.23061, -0.23465, -0.23332]

# Fungsi proyeksi linear
def proyeksi_linier(data_hist, tahun_hist, tahun_pred):
    koef = np.polyfit(tahun_hist, data_hist, 1)
    return np.polyval(koef, tahun_pred)

# Tahun prediksi
tahun_pred = np.arange(2025, 2036)

# Proyeksikan
lst_sby_pred = proyeksi_linier(lst_sby, tahun_hist, tahun_pred)
ndvi_sby_pred = proyeksi_linier(ndvi_sby, tahun_hist, tahun_pred)
ndbi_sby_pred = proyeksi_linier(ndbi_sby, tahun_hist, tahun_pred)

lst_sda_pred = proyeksi_linier(lst_sda, tahun_hist, tahun_pred)
ndvi_sda_pred = proyeksi_linier(ndvi_sda, tahun_hist, tahun_pred)
ndbi_sda_pred = proyeksi_linier(ndbi_sda, tahun_hist, tahun_pred)

# Model regresi
def suhu_sby(lst, ndvi, ndbi):
    return 36.6883 - 0.2110 * lst + 8.3441 * ndvi + 0.8678 * ndbi

def suhu_sda(lst, ndvi, ndbi):
    return 29.3578 - 0.0867 * lst + 4.8204 * ndvi - 0.3599 * ndbi

# Hitung suhu prediksi
suhu_sby_pred = [suhu_sby(lst, ndvi, ndbi) for lst, ndvi, ndbi in zip(lst_sby_pred, ndvi_sby_pred, ndbi_sby_pred)]
suhu_sda_pred = [suhu_sda(lst, ndvi, ndbi) for lst, ndvi, ndbi in zip(lst_sda_pred, ndvi_sda_pred, ndbi_sda_pred)]

# Suhu real
suhu_sby_real = [27.68995, 28.72288, 29.74535, 29.012, 29.2913, 29.1315, 29.2152, 29.0978, 29.0185, 29.0326, 29.8011]
suhu_sda_real = [28.43886, 27.96374, 29.06196, 28.27391, 28.44475, 28.3705, 28.4754, 28.15735, 28.05326, 28.15435, 28.975]

# Gabung semua
tahun_total = list(tahun_hist) + list(tahun_pred)
sby_total = suhu_sby_real + suhu_sby_pred
sda_total = suhu_sda_real + suhu_sda_pred

# Output berupa CSV
# Buat DataFrame
df = pd.DataFrame({
    'Tahun': tahun_total,
    'Suhu_SBY': sby_total,
    'Suhu_SDA': sda_total,
    'LST_SBY': lst_sby + lst_sby_pred.tolist(),
    'NDVI_SBY': ndvi_sby + ndvi_sby_pred.tolist(),
    'NDBI_SBY': ndbi_sby + ndbi_sby_pred.tolist(),
    'LST_SDA': lst_sda + lst_sda_pred.tolist(),
    'NDVI_SDA': ndvi_sda + ndvi_sda_pred.tolist(),
    'NDBI_SDA': ndbi_sda + ndbi_sda_pred.tolist()
})

# Simpan sebagai CSV
df.to_csv('/content/proyeksi_suhu_udara_2014_2035.csv', index=False)

# Tampilkan link download
from google.colab import files
files.download('/content/proyeksi_suhu_udara_2014_2035.csv')

# Output berupa Grafik Proyeksi
# Plot
plt.figure(figsize=(13,6))
plt.plot(tahun_total, sby_total, label='Suhu Udara SBY (Prediksi)', linestyle='--', color='blue')
plt.plot(tahun_total, sda_total, label='Suhu Udara SDA (Prediksi)', linestyle='--', color='orange')
plt.plot(tahun_hist, suhu_sby_real, label='Suhu Udara SBY (Historis)', marker='o', color='blue')
plt.plot(tahun_hist, suhu_sda_real, label='Suhu Udara SDA (Historis)', marker='o', color='orange')

plt.title('Grafik Ekstrapolasi Suhu Udara Surabaya & Sidoarjo (2014–2035)', fontsize=14)
plt.xlabel('Tahun')
plt.ylabel('Suhu Udara (°C)')
plt.grid(True)
plt.xticks(tahun_total, rotation=45)
plt.legend()
plt.tight_layout()
plt.show()
