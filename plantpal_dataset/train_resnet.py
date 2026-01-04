import os
import torch
import torch.nn as nn
import torch.optim as optim
from torchvision import datasets, transforms, models
from torch.utils.data import DataLoader
from tqdm import tqdm
if __name__ == "__main__":
    # ===== CONFIGURATION =====
    data_dir = r"C:\Users\Trisha\Documents\Plantpal_dataset"
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

    num_classes = 7
    batch_size = 2
    num_epochs = 5
    learning_rate = 0.001

    # ===== DATA TRANSFORMS =====
    data_transforms = {
        'train': transforms.Compose([
            transforms.Resize((128, 128)),
            transforms.ToTensor(),
            transforms.Normalize([0.485, 0.456, 0.406],
                                 [0.229, 0.224, 0.225])
        ]),
        'val': transforms.Compose([
            transforms.Resize((128, 128)),
            transforms.ToTensor(),
            transforms.Normalize([0.485, 0.456, 0.406],
                                 [0.229, 0.224, 0.225])
        ])
    }

    # ===== DATASET & DATALOADERS =====
    image_datasets = {x: datasets.ImageFolder(os.path.join(data_dir, x),
                                              data_transforms[x])
                      for x in ['train', 'val']}

    dataloaders = {
        x: DataLoader(
            image_datasets[x],
            batch_size=batch_size,
            shuffle=True,
            num_workers=0  # safe for Windows
        )
        for x in ['train', 'val']
    }

    print(f"✅ Loaded datasets. Training: {len(image_datasets['train'])}, Validation: {len(image_datasets['val'])}")

    # ===== LOAD RESNET18 =====
    model = models.resnet18(weights=models.ResNet18_Weights.DEFAULT)

    for param in model.parameters():
        param.requires_grad = False

    model.fc = nn.Linear(model.fc.in_features, num_classes)
    model = model.to(device)

    criterion = nn.CrossEntropyLoss()
    optimizer = optim.Adam(model.fc.parameters(), lr=learning_rate)

    # ===== TRAINING LOOP =====
    epoch_bar = tqdm(range(num_epochs), desc="Epochs", unit="epoch", ascii=True)

    for epoch in epoch_bar:
        model.train()
        running_loss = 0.0
        train_loader = tqdm(dataloaders['train'], desc="Training", unit="batch", leave=False, ascii=True)

        for i, (inputs, labels) in enumerate(train_loader):
            if i == 0:
                print("✅ First batch loaded successfully")
            inputs, labels = inputs.to(device), labels.to(device)
            optimizer.zero_grad()
            outputs = model(inputs)
            loss = criterion(outputs, labels)
            loss.backward()
            optimizer.step()
            running_loss += loss.item() * inputs.size(0)
            train_loader.set_postfix(loss=f"{loss.item():.4f}")

        epoch_loss = running_loss / len(image_datasets['train'])

        model.eval()
        correct = 0
        total = 0
        val_loader = tqdm(dataloaders['val'], desc="Validation", unit="batch", leave=False, ascii=True)
        with torch.no_grad():
            for inputs, labels in val_loader:
                inputs, labels = inputs.to(device), labels.to(device)
                outputs = model(inputs)
                _, preds = torch.max(outputs, 1)
                total += labels.size(0)
                correct += (preds == labels).sum().item()

        val_acc = correct / total
        epoch_bar.set_postfix(loss=f"{epoch_loss:.4f}", val_acc=f"{val_acc:.4f}")

    torch.save(model.state_dict(), "plantpal_resnet18.pth")
    print("✅ Model saved as plantpal_resnet18.pth")
    print("Classes:", image_datasets['train'].classes)
