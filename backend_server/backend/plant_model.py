import torch
from torchvision import transforms
from PIL import Image

# Load the model
model_path = "models/plant_classifier.pth"  # relative to backend_server/
model = torch.load(model_path, map_location=torch.device('cpu'))
model.eval()

# Preprocess function
preprocess = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor()
])

def predict(image: Image.Image):
    """Predict the plant class from a PIL image."""
    input_tensor = preprocess(image).unsqueeze(0)  # add batch dimension
    with torch.no_grad():
        output = model(input_tensor)
    predicted_class = output.argmax().item()
    return predicted_class
