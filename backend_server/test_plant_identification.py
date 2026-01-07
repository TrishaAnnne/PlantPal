"""
Plant Identification Testing Script
Run this from your backend_server directory to test plant identification
"""

import torch
import torch.nn as nn
from torchvision import models, transforms
from PIL import Image
import json
import os
from pathlib import Path

class PlantIdentifier:
    def __init__(self, model_dir):
        """
        Initialize the plant identifier with trained model
        
        Args:
            model_dir: Path to directory containing model files
        """
        self.model_dir = Path(model_dir)
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        
        # Load class names
        with open(self.model_dir / 'class_names.json', 'r') as f:
            self.class_names = json.load(f)
        
        # Load model info
        with open(self.model_dir / 'model_info.json', 'r') as f:
            self.model_info = json.load(f)
        
        print(f"📊 Model Info:")
        print(f"   Classes: {len(self.class_names)}")
        print(f"   Best Accuracy: {self.model_info.get('best_val_accuracy', 'N/A'):.2f}%")
        print(f"   Device: {self.device}")
        
        # Initialize model
        self.model = self._load_model()
        
        # Define image transforms (same as training)
        self.transform = transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize(
                mean=[0.485, 0.456, 0.406],
                std=[0.229, 0.224, 0.225]
            )
        ])
    
    def _load_model(self):
        """Load the trained model"""
        # Initialize ResNet18 (matching training script)
        model = models.resnet18(weights=None)
        num_classes = len(self.class_names)
        model.fc = nn.Linear(model.fc.in_features, num_classes)
        
        # Load weights
        model_path = self.model_dir / 'best_model.pth'
        checkpoint = torch.load(model_path, map_location=self.device)
        
        # Extract model state dict if checkpoint contains metadata
        if 'model_state_dict' in checkpoint:
            state_dict = checkpoint['model_state_dict']
            print(f"📦 Checkpoint info:")
            print(f"   Epoch: {checkpoint.get('epoch', 'N/A')}")
            print(f"   Val Accuracy: {checkpoint.get('val_acc', 0):.2f}%")
        else:
            state_dict = checkpoint
        
        model.load_state_dict(state_dict)
        
        model = model.to(self.device)
        model.eval()
        
        print(f"✅ Model loaded from: {model_path}\n")
        return model
    
    def predict(self, image_path, top_k=3):
        """
        Predict plant species from image
        
        Args:
            image_path: Path to image file
            top_k: Number of top predictions to return
            
        Returns:
            List of tuples (class_name, confidence)
        """
        try:
            # Load and preprocess image
            image = Image.open(image_path).convert('RGB')
            image_tensor = self.transform(image).unsqueeze(0).to(self.device)
            
            # Make prediction
            with torch.no_grad():
                outputs = self.model(image_tensor)
                probabilities = torch.nn.functional.softmax(outputs, dim=1)
                top_probs, top_indices = torch.topk(probabilities, top_k)
            
            # Format results
            results = []
            for prob, idx in zip(top_probs[0], top_indices[0]):
                class_name = self.class_names[idx.item()]
                confidence = prob.item() * 100
                results.append((class_name, confidence))
            
            return results
            
        except Exception as e:
            print(f"❌ Error processing image: {e}")
            return []
    
    def predict_and_display(self, image_path):
        """Predict and display results in a nice format"""
        print(f"\n{'='*60}")
        print(f"🌿 Analyzing: {os.path.basename(image_path)}")
        print(f"{'='*60}\n")
        
        results = self.predict(image_path, top_k=5)
        
        if not results:
            print("❌ No predictions available")
            return
        
        print("📊 Top Predictions:\n")
        for i, (plant_name, confidence) in enumerate(results, 1):
            bar_length = int(confidence / 2)  # Scale to 50 chars max
            bar = '█' * bar_length + '░' * (50 - bar_length)
            
            print(f"  {i}. {plant_name}")
            print(f"     {bar} {confidence:.2f}%")
            print()
        
        # Highlight top prediction
        top_plant, top_conf = results[0]
        print(f"{'='*60}")
        print(f"✅ Best Match: {top_plant} ({top_conf:.2f}% confidence)")
        print(f"{'='*60}\n")


def main():
    """Main testing function"""
    print("\n" + "="*60)
    print("🌱 PLANTPAL - PLANT IDENTIFICATION TESTER")
    print("="*60 + "\n")
    
    # Set up paths
    model_dir = r"C:\Users\Welzon Entera\OneDrive\Documents\Plantpal_model"
    
    # Check if model directory exists
    if not os.path.exists(model_dir):
        print(f"❌ Model directory not found: {model_dir}")
        print("Please check the path and try again.")
        return
    
    # Initialize identifier
    try:
        identifier = PlantIdentifier(model_dir)
    except Exception as e:
        print(f"❌ Failed to load model: {e}")
        return
    
    # Interactive testing loop
    while True:
        print("\n" + "-"*60)
        print("OPTIONS:")
        print("  1. Test a single image")
        print("  2. Test multiple images from a folder")
        print("  3. List available plant classes")
        print("  4. Exit")
        print("-"*60)
        
        choice = input("\nEnter your choice (1-4): ").strip()
        
        if choice == '1':
            # Single image test
            image_path = input("\nEnter full path to image: ").strip().strip('"')
            
            if not os.path.exists(image_path):
                print(f"❌ Image not found: {image_path}")
                continue
            
            identifier.predict_and_display(image_path)
            
        elif choice == '2':
            # Multiple images test
            folder_path = input("\nEnter path to folder with images: ").strip().strip('"')
            
            if not os.path.exists(folder_path):
                print(f"❌ Folder not found: {folder_path}")
                continue
            
            # Get all image files
            image_extensions = {'.jpg', '.jpeg', '.png', '.bmp', '.gif'}
            image_files = [
                os.path.join(folder_path, f) 
                for f in os.listdir(folder_path) 
                if os.path.splitext(f)[1].lower() in image_extensions
            ]
            
            if not image_files:
                print("❌ No image files found in folder")
                continue
            
            print(f"\nFound {len(image_files)} images. Processing...\n")
            
            for img_path in image_files:
                identifier.predict_and_display(img_path)
                input("Press Enter to continue...")
            
        elif choice == '3':
            # List classes
            print(f"\n{'='*60}")
            print(f"📋 AVAILABLE PLANT CLASSES ({len(identifier.class_names)})")
            print(f"{'='*60}\n")
            
            for i, class_name in enumerate(sorted(identifier.class_names), 1):
                print(f"  {i:3d}. {class_name}")
            
            print(f"\n{'='*60}\n")
            
        elif choice == '4':
            print("\n👋 Thanks for testing PlantPal!")
            print("="*60 + "\n")
            break
        else:
            print("❌ Invalid choice. Please enter 1-4.")


if __name__ == "__main__":
    main()

1