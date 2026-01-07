from icrawler.builtin import BingImageCrawler
from PIL import Image
import os
import random
import shutil

# ---------------------------
# CONFIGURATION
# ---------------------------
plants = [
    "aloe_barbadensis",
    "averrhoa_bilimbi",
    "blumea_balsamifera",
    "centella_asiatica",
    "coleus_scutellarioides",
    "corchorus_olitorius",
    "ehretia_microphylla",
    "euphorbia_hirta",
    "jatropha_curcas",
    "mangifera_indica",
    "manihot_esculenta",
    "mentha_cordifolia",
    "ocimum_basilicum",
    "origanum_vulgare",
    "pandanus_amaryllifolius",
    "peperomia_pellucida",
    "phyllanthus_niruri",
    "psidium_guajava",
    "senna_alata",
    "vitex_negundo"
]

keywords_suffix = ["leaves", "whole plant", "flowers"]
images_per_query = 30
split_ratio = 0.8  # 80% train, 20% val

# ABSOLUTE PATHS ON PC (OneDrive/Documents)
raw_dir = r"C:\Users\Welzon Entera\OneDrive\Documents\Plantpal_dataset\raw_downloads"
train_dir = r"C:\Users\Welzon Entera\OneDrive\Documents\Plantpal_dataset\train"
val_dir = r"C:\Users\Welzon Entera\OneDrive\Documents\Plantpal_dataset\val"

os.makedirs(raw_dir, exist_ok=True)
os.makedirs(train_dir, exist_ok=True)
os.makedirs(val_dir, exist_ok=True)

# ---------------------------
# DOWNLOAD IMAGES
# ---------------------------
print("\nDownloading images using Bing...")

for plant in plants:
    plant_raw_dir = os.path.join(raw_dir, plant)
    os.makedirs(plant_raw_dir, exist_ok=True)

    for suffix in keywords_suffix:
        query = f"{plant} {suffix}"
        print(f"\nDownloading images for: {query}")

        crawler = BingImageCrawler(storage={"root_dir": plant_raw_dir})
        try:
            crawler.crawl(keyword=query, max_num=images_per_query, min_size=(100, 100), file_idx_offset=0)
        except Exception as e:
            print(f"⚠️ Failed to download {query}: {e}")

# ---------------------------
# CLEAN BROKEN IMAGES
# ---------------------------
print("\nChecking for broken images...")
for plant in plants:
    plant_path = os.path.join(raw_dir, plant)
    if not os.path.exists(plant_path):
        continue
    for root, _, files in os.walk(plant_path):
        for f in files:
            file_path = os.path.join(root, f)
            try:
                Image.open(file_path).verify()
            except:
                os.remove(file_path)
                print(f"Removed broken image: {file_path}")

# ---------------------------
# SPLIT INTO TRAIN / VAL
# ---------------------------
print("\nSplitting images into train and val...")

for plant in plants:
    plant_raw_path = os.path.join(raw_dir, plant)
    if not os.path.exists(plant_raw_path):
        print(f"⚠️ {plant} folder missing, skipping split")
        continue

    # All images in one folder per plant
    images = [f for f in os.listdir(plant_raw_path)
              if f.lower().endswith(('.jpg', '.jpeg', '.png'))]

    if not images:
        print(f"⚠️ No images found for {plant}, skipping split")
        continue

    random.seed(42)
    random.shuffle(images)

    split_point = int(len(images) * split_ratio)
    train_images = images[:split_point]
    val_images = images[split_point:]

    # Create train/val folders
    plant_train_dir = os.path.join(train_dir, plant)
    plant_val_dir = os.path.join(val_dir, plant)
    os.makedirs(plant_train_dir, exist_ok=True)
    os.makedirs(plant_val_dir, exist_ok=True)

    # Copy images
    for img in train_images:
        shutil.copy2(os.path.join(plant_raw_path, img),
                     os.path.join(plant_train_dir, img))
    for img in val_images:
        shutil.copy2(os.path.join(plant_raw_path, img),
                     os.path.join(plant_val_dir, img))

    print(f"✓ {plant}: Total={len(images)} | Train={len(train_images)} | Val={len(val_images)}")

print("\n✅ Downloading and splitting complete!")
print(f"Train folder: {train_dir}")
print(f"Val folder: {val_dir}")
