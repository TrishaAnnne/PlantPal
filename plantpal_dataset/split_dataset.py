import os
import shutil
import random

# ====== CONFIGURATION ======
SOURCE = r"C:\Users\Trisha\Documents\Plantpal_dataset"  # Change to your folder path
TRAIN = os.path.join(SOURCE, "train")
VAL = os.path.join(SOURCE, "val")
TEST = os.path.join(SOURCE, "test")

# Split ratios
train_ratio = 0.7
val_ratio = 0.2
test_ratio = 0.1

# ====== CREATE FOLDERS ======
os.makedirs(TRAIN, exist_ok=True)
os.makedirs(VAL, exist_ok=True)
os.makedirs(TEST, exist_ok=True)

# ====== PROCESS EACH CLASS ======
for plant in os.listdir(SOURCE):
    plant_path = os.path.join(SOURCE, plant)

    # Skip non-folders and already created folders
    if not os.path.isdir(plant_path):
        continue
    if plant in ["train", "val", "test"]:
        continue

    images = os.listdir(plant_path)
    random.shuffle(images)

    total_images = len(images)
    train_split = int(total_images * train_ratio)
    val_split = int(total_images * (train_ratio + val_ratio))

    train_images = images[:train_split]
    val_images = images[train_split:val_split]
    test_images = images[val_split:]

    # Create class folders inside train/val/test
    os.makedirs(os.path.join(TRAIN, plant), exist_ok=True)
    os.makedirs(os.path.join(VAL, plant), exist_ok=True)
    os.makedirs(os.path.join(TEST, plant), exist_ok=True)

    # Copy images
    for img in train_images:
        shutil.copy(os.path.join(plant_path, img), os.path.join(TRAIN, plant, img))
    for img in val_images:
        shutil.copy(os.path.join(plant_path, img), os.path.join(VAL, plant, img))
    for img in test_images:
        shutil.copy(os.path.join(plant_path, img), os.path.join(TEST, plant, img))

print("✅ Dataset split completed: train / val / test created!")
