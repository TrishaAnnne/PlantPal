import os
import sys
import time
from PIL import Image
import torch
import torchvision.transforms as transforms
from torchvision import models

_PLANT_NAMES = [
    "Tarragon", "Peppermint", "Chocomint", "Spearmint",
    "Oregano (Plain)", "Oregano (Variegated)", "Sambong",
    "Acapulco", "Lagundi", "Tsaang Gubat",
    "Unknown Plant 11", "Unknown Plant 12", "Unknown Plant 13",
    "Unknown Plant 14", "Unknown Plant 15",
]

_model = None

def _load_model():
    """Load and initialize model once globally"""
    global _model
    if _model is not None:
        return _model

    # Model path
    BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    MODEL_PATH = os.path.join(BASE_DIR, "models", "plant_classifier.pth")

    print(f"🔍 Loading model from: {MODEL_PATH}")
    state_dict = torch.load(MODEL_PATH, map_location="cpu")

    # Build ResNet18 architecture
    model = models.resnet18(weights=None)
    num_classes = len(_PLANT_NAMES)
    model.fc = torch.nn.Linear(model.fc.in_features, num_classes)

    model.load_state_dict(state_dict)
    model.eval()  # IMPORTANT
    model.cpu()
    torch.set_grad_enabled(False)

    _model = model
    print("✅ Model loaded successfully!\n")
    return _model


transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225]
    )
])


@torch.no_grad()
def predict(image: Image.Image) -> int:
    model = _load_model()
    start = time.time()

    # Ensure RGB
    image = image.convert("RGB")

    # Apply correct preprocessing
    input_tensor = transform(image).unsqueeze(0)

    # Run inference
    outputs = model(input_tensor)
    result = outputs.argmax(dim=1).item()

    print(f"🌿 Predicted: {result} ({_PLANT_NAMES[result]}) | ⏱ {time.time() - start:.2f}s\n")
    return result


PLANT_NAMES = _PLANT_NAMES
