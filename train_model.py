import torch
from torch import nn, optim
from torchvision import datasets, models, transforms
from torch.utils.data import DataLoader
from tqdm import tqdm
import os

# === 1️⃣ Dataset paths ===
base_dir = r"C:\Users\ada\Downloads\PlantDataset"  # your actual dataset location
train_dir = os.path.join(base_dir, "train")
val_dir = os.path.join(base_dir, "val")

# === 2️⃣ Data transformations ===
data_transforms = {
    "train": transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.RandomHorizontalFlip(),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406],
                             [0.229, 0.224, 0.225])
    ]),
    "val": transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406],
                             [0.229, 0.224, 0.225])
    ]),
}

# === 3️⃣ Load datasets ===
print("📂 Loading datasets...")
image_datasets = {
    "train": datasets.ImageFolder(train_dir, transform=data_transforms["train"]),
    "val": datasets.ImageFolder(val_dir, transform=data_transforms["val"])
}

# === 4️⃣ Create dataloaders ===
dataloaders = {
    "train": DataLoader(image_datasets["train"], batch_size=8, shuffle=True),
    "val": DataLoader(image_datasets["val"], batch_size=8, shuffle=False)
}

# === 5️⃣ Get class names ===
class_names = image_datasets["train"].classes
num_classes = len(class_names)
print(f"✅ Found {num_classes} plant classes:")
print(class_names)

# === 6️⃣ Load pretrained model (ResNet18) ===
print("\n⚙️ Loading pretrained ResNet18 model...")
model = models.resnet18(weights=models.ResNet18_Weights.DEFAULT)
model.fc = nn.Linear(model.fc.in_features, num_classes)

# === 7️⃣ Setup device ===
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print(f"🚀 Using device: {device}")
model = model.to(device)

# === 8️⃣ Define loss and optimizer ===
criterion = nn.CrossEntropyLoss()
optimizer = optim.Adam(model.parameters(), lr=0.001)

# === 9️⃣ Training + Validation ===
num_epochs = 5
for epoch in range(num_epochs):
    print(f"\n📘 Epoch {epoch + 1}/{num_epochs}")
    model.train()
    running_loss = 0.0

    progress_bar = tqdm(dataloaders["train"], desc=f"Training Epoch {epoch+1}", leave=False)

    for inputs, labels in progress_bar:
        inputs, labels = inputs.to(device), labels.to(device)
        optimizer.zero_grad()

        outputs = model(inputs)
        loss = criterion(outputs, labels)
        loss.backward()
        optimizer.step()

        running_loss += loss.item()
        progress_bar.set_postfix({"loss": f"{loss.item():.4f}"})

    epoch_loss = running_loss / len(dataloaders["train"])
    print(f"📊 Training Loss: {epoch_loss:.4f}")

    # === Validation step ===
    model.eval()
    correct = 0
    total = 0
    with torch.no_grad():
        for inputs, labels in dataloaders["val"]:
            inputs, labels = inputs.to(device), labels.to(device)
            outputs = model(inputs)
            _, preds = torch.max(outputs, 1)
            total += labels.size(0)
            correct += (preds == labels).sum().item()

    val_acc = 100 * correct / total
    print(f"✅ Validation Accuracy: {val_acc:.2f}%")

# === 🔟 Save model ===
print("\n✅ Training complete! Saving model...")
torch.save(model.state_dict(), "plant_classifier.pth")
print("🎉 Model saved successfully as 'plant_classifier.pth'")
