import os
import shutil
import random

# Set paths
base_dir = r"C:\Users\ada\Downloads\PlantDataset"
train_dir = os.path.join(base_dir, "train")
val_dir = os.path.join(base_dir, "val")
test_dir = os.path.join(base_dir, "test")

# Create the directories if they don’t exist
for folder in [train_dir, val_dir, test_dir]:
    os.makedirs(folder, exist_ok=True)

# Split ratios
train_ratio = 0.7
val_ratio = 0.15
test_ratio = 0.15

# Go through each plant folder
for plant_folder in os.listdir(base_dir):
    full_path = os.path.join(base_dir, plant_folder)
    if not os.path.isdir(full_path) or plant_folder in ["train", "val", "test"]:
        continue

    # Make subfolders
    for split_dir in [train_dir, val_dir, test_dir]:
        os.makedirs(os.path.join(split_dir, plant_folder), exist_ok=True)

    images = os.listdir(full_path)
    random.shuffle(images)

    total = len(images)
    train_end = int(train_ratio * total)
    val_end = train_end + int(val_ratio * total)

    # Split and copy
    for i, img in enumerate(images):
        src = os.path.join(full_path, img)
        if i < train_end:
            dst = os.path.join(train_dir, plant_folder, img)
        elif i < val_end:
            dst = os.path.join(val_dir, plant_folder, img)
        else:
            dst = os.path.join(test_dir, plant_folder, img)
        shutil.copy(src, dst)

print("✅ Dataset successfully split into train, val, and test folders!")
