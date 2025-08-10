import matplotlib.pyplot as plt

# =========================
# Data dari tabel
# =========================
tahun = list(range(2014, 2036))

NDVI_SBY = [0.183, 0.199, 0.184, 0.225, 0.203, 0.211, 0.197, 0.192, 0.179, 0.193, 0.193, 0.191, 0.188, 0.189, 0.187, 0.182, 0.186, 0.185, 0.184, 0.184, 0.184, 0.184]
NDVI_SDA = [0.501, 0.498, 0.495, 0.537, 0.518, 0.518, 0.522, 0.522, 0.524, 0.538, 0.538, 0.541, 0.544, 0.548, 0.553, 0.555, 0.557, 0.562, 0.562, 0.562, 0.562, 0.562]

NDBI_SBY = [0.027, 0.031, 0.049, 0.022, 0.021, 0.021, 0.034, 0.034, 0.044, 0.036, 0.036, 0.039, 0.049, 0.052, 0.052, 0.054, 0.057, 0.059, 0.062, 0.062, 0.062, 0.062]
NDBI_SDA = [-0.215, -0.215, -0.207, -0.23, -0.207, -0.207, -0.202, -0.202, -0.203, -0.223, -0.223, -0.222, -0.225, -0.226, -0.226, -0.228, -0.229, -0.23, -0.224, -0.224, -0.224, -0.224]

LST_SBY = [45.821, 46.09, 46.215, 46.339, 44.985, 44.895, 43.804, 43.167, 43.147, 43.382, 43.382, 42.9, 42.59, 42.419, 42.197, 41.95, 41.463, 41.45, 41.052, 40.972, 40.972, 40.972]
LST_SDA = [40.871, 38.915, 40.853, 40.725, 42.963, 41.226, 39.148, 40.62, 41.954, 39.21, 39.21, 37.152, 39.91, 39.158, 38.963, 38.953, 38.867, 38.824, 38.781, 38.781, 38.781, 38.781]

# Parameter tahun historis
HIST_END_YEAR = 2024
tahun_hist = [t for t in tahun if t <= HIST_END_YEAR]

# Indeks data historis
idx_hist = len(tahun_hist)

# =========================
# Fungsi Plot
# =========================
def plot_param(tahun, tahun_hist, data_sby, data_sda, judul, y_label):
    plt.figure(figsize=(13,6))
    plt.plot(tahun, data_sby, label='Surabaya (Presiksi)', linestyle='--', color='blue')
    plt.plot(tahun, data_sda, label='Sidoarjo (Presiksi )', linestyle='--', color='orange')
    plt.plot(tahun_hist, data_sby[:idx_hist], label='Surabaya (Historis)', marker='o', color='blue')
    plt.plot(tahun_hist, data_sda[:idx_hist], label='Sidoarjo (Historis)', marker='o', color='orange')
    
    plt.title(judul, fontsize=14)
    plt.xlabel('Tahun')
    plt.ylabel(y_label)
    plt.grid(True)
    plt.xticks(tahun, rotation=45)
    plt.legend()
    plt.tight_layout()
    plt.show()

# =========================
# Plot NDVI
# =========================
plot_param(tahun, tahun_hist, NDVI_SBY, NDVI_SDA, 'Grafik Ekstrapolasi NDVI Surabaya & Sidoarjo (2014–2035)', 'NDVI')

# Plot NDBI
plot_param(tahun, tahun_hist, NDBI_SBY, NDBI_SDA, 'Grafik Ekstrapolasi NDBI Surabaya & Sidoarjo (2014–2035)', 'NDBI')

# Plot LST
plot_param(tahun, tahun_hist, LST_SBY, LST_SDA, 'Grafik Ekstrapolasi SPD Surabaya & Sidoarjo (2014–2035)', 'Suhu Permukaan (°C)')
