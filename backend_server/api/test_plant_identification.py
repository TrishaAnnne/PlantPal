"""
Plant Identification Testing Script
Run this from your backend_server directory to test plant identification
Handles UNKNOWN plants and NON-PLANT objects using confidence threshold
Works with Enhanced ResNet18 model
"""

import torch
import torch.nn as nn
from torchvision import models, transforms
from PIL import Image
import json
import os
import math
from pathlib import Path


class PlantIdentifier:
    def __init__(self, model_dir):
        """
        Initialize the plant identifier with trained model
        """
        self.model_dir = Path(model_dir)
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

        # Confidence threshold for unknown plant detection
        self.confidence_threshold = 60.0  # percent

        # Load class names
        with open(self.model_dir / "class_names.json", "r") as f:
            self.class_names = json.load(f)

        # Load model info
        with open(self.model_dir / "model_info.json", "r") as f:
            self.model_info = json.load(f)

        print("\n" + "="*70)
        print("MODEL INFO")
        print("="*70)
        print(f"Architecture: {self.model_info.get('model_architecture', 'N/A')}")
        print(f"Classes: {len(self.class_names)}")
        print(f"Best Accuracy: {self.model_info.get('best_val_accuracy', 0):.2f}%")
        print(f"Device: {self.device}")
        print(f"Confidence Threshold: {self.confidence_threshold}%")
        
        # Show enhancements if available
        if 'enhancements' in self.model_info:
            print("\nModel Enhancements:")
            for enhancement in self.model_info['enhancements']:
                print(f"  - {enhancement}")
        print("="*70 + "\n")

        # Load model
        self.model = self._load_model()

        # Image preprocessing (must match training)
        self.transform = transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize(
                mean=[0.485, 0.456, 0.406],
                std=[0.229, 0.224, 0.225]
            )
        ])

    def _load_model(self):
        """Load trained Enhanced ResNet18 model"""
        # Define the same model architecture as training
        class ImprovedResNet18(nn.Module):
            def __init__(self, num_classes):
                super(ImprovedResNet18, self).__init__()
                self.resnet = models.resnet18(weights=None)
                
                # Replace classifier with dropout (same as training)
                num_features = self.resnet.fc.in_features
                self.resnet.fc = nn.Sequential(
                    nn.Dropout(0.5),
                    nn.Linear(num_features, num_classes)
                )
            
            def forward(self, x):
                return self.resnet(x)
        
        # Create model
        model = ImprovedResNet18(len(self.class_names))
        
        # Load weights
        model_path = self.model_dir / "best_model.pth"
        checkpoint = torch.load(model_path, map_location=self.device)
        
        # Handle different checkpoint formats
        if 'model_state_dict' in checkpoint:
            model.load_state_dict(checkpoint['model_state_dict'])
            print(f"Model loaded from epoch {checkpoint.get('epoch', 'N/A')}")
            print(f"Validation accuracy: {checkpoint.get('val_acc', 0):.2f}%")
        else:
            model.load_state_dict(checkpoint)
        
        model.to(self.device)
        model.eval()
        
        print(f"Model file: {model_path}\n")
        return model

    def calculate_entropy(self, predictions):
        """Calculate prediction entropy (higher = more uncertain)"""
        probs = [p["confidence"] / 100 for p in predictions]
        entropy = -sum(p * math.log(p + 1e-10) for p in probs if p > 0)
        return entropy

    def predict(self, image_path, top_k=5):
        """
        Predict plant species from image
        Returns dict with recognition status
        Enhanced to detect non-plant objects
        """
        try:
            image = Image.open(image_path).convert("RGB")
            image_tensor = self.transform(image).unsqueeze(0).to(self.device)

            with torch.no_grad():
                outputs = self.model(image_tensor)
                probs = torch.nn.functional.softmax(outputs, dim=1)
                top_probs, top_indices = torch.topk(probs, min(top_k, len(self.class_names)))

            predictions = []
            for prob, idx in zip(top_probs[0], top_indices[0]):
                predictions.append({
                    "plant": self.class_names[idx.item()],
                    "confidence": prob.item() * 100
                })

            # Enhanced detection metrics
            top_conf = predictions[0]["confidence"]
            top_2_diff = predictions[0]["confidence"] - predictions[1]["confidence"]
            avg_conf = sum(p["confidence"] for p in predictions) / len(predictions)
            entropy = self.calculate_entropy(predictions)
            
            # NON-PLANT DETECTION
            # Very low confidence OR no clear winner OR high entropy
            is_likely_non_plant = (
                top_conf < 40 or
                (top_conf < 60 and top_2_diff < 5) or
                entropy > 2.5
            )
            
            # UNCERTAIN PLANT DETECTION
            is_uncertain = (
                40 <= top_conf < self.confidence_threshold and
                not is_likely_non_plant
            )

            if is_likely_non_plant:
                return {
                    "status": "non_plant",
                    "message": "This doesn't appear to be a plant. Please scan a plant leaf or image.",
                    "confidence": top_conf,
                    "avg_confidence": avg_conf,
                    "entropy": entropy,
                    "predictions": predictions
                }
            
            if is_uncertain:
                return {
                    "status": "unknown",
                    "message": "Plant not recognized. Try a clearer image or ensure it's a trained species.",
                    "confidence": top_conf,
                    "top_prediction": predictions[0]["plant"],
                    "predictions": predictions
                }

            return {
                "status": "recognized",
                "predictions": predictions,
                "confidence": top_conf
            }

        except Exception as e:
            return {
                "status": "error",
                "message": str(e)
            }

    def predict_and_display(self, image_path):
        """Display prediction results with better non-plant handling"""
        print("\n" + "="*70)
        print(f"Analyzing: {os.path.basename(image_path)}")
        print("="*70 + "\n")

        result = self.predict(image_path)

        # NON-PLANT OBJECT DETECTED
        if result["status"] == "non_plant":
            print("STATUS: NOT A PLANT")
            print(f"This image doesn't appear to be a plant.")
            print(f"Average confidence across all classes: {result['avg_confidence']:.2f}%")
            print(f"Entropy score: {result['entropy']:.2f}")
            print("(All predictions are very low and scattered)")
            print("\nSuggestions:")
            print("  - Make sure you're scanning a plant")
            print("  - Take a photo of plant leaves, flowers, or stems")
            print("  - Avoid backgrounds without plants")
            
            print("\nTop uncertain guesses:")
            for i, pred in enumerate(result["predictions"][:3], 1):
                plant_name = pred['plant'].replace('_', ' ').title()
                print(f"  {i}. {plant_name}: {pred['confidence']:.2f}%")
            print()
            return

        # UNKNOWN PLANT (low confidence but might be a plant)
        if result["status"] == "unknown":
            print("STATUS: PLANT NOT RECOGNIZED")
            top_name = result['top_prediction'].replace('_', ' ').title()
            print(f"Closest match: {top_name}")
            print(f"Confidence: {result['confidence']:.2f}% (below {self.confidence_threshold}% threshold)")
            print("\nPossible reasons:")
            print("  - This plant species is not in our database")
            print("  - Image quality is too low")
            print("  - Plant is not clearly visible")
            print("  - Try a clearer photo with better lighting")
            
            print("\nTop uncertain predictions:")
            for i, pred in enumerate(result["predictions"][:3], 1):
                plant_name = pred['plant'].replace('_', ' ').title()
                print(f"  {i}. {plant_name}: {pred['confidence']:.2f}%")
            print()
            return

        # ERROR
        if result["status"] == "error":
            print(f"ERROR: {result['message']}\n")
            return

        # RECOGNIZED PLANT (high confidence)
        print("STATUS: PLANT RECOGNIZED")
        print("\nTop Predictions:\n")
        
        for i, pred in enumerate(result["predictions"], 1):
            plant_name = pred['plant'].replace('_', ' ').title()
            confidence = pred['confidence']
            
            # Simple text-based confidence indicator
            conf_level = ""
            if confidence >= 90:
                conf_level = "[EXCELLENT]"
            elif confidence >= 75:
                conf_level = "[GOOD]"
            elif confidence >= 60:
                conf_level = "[FAIR]"
            else:
                conf_level = "[LOW]"
            
            marker = ">>>" if i == 1 else f" {i}."
            print(f"{marker} {plant_name}")
            print(f"    Confidence: {confidence:.2f}% {conf_level}\n")

        best = result["predictions"][0]
        best_name = best['plant'].replace('_', ' ').title()
        
        print("="*70)
        if best['confidence'] >= 90:
            print(f"RESULT: EXCELLENT MATCH - {best_name} ({best['confidence']:.2f}%)")
        elif best['confidence'] >= 75:
            print(f"RESULT: GOOD MATCH - {best_name} ({best['confidence']:.2f}%)")
        else:
            print(f"RESULT: POSSIBLE MATCH - {best_name} ({best['confidence']:.2f}%)")
        print("="*70 + "\n")


def main():
    print("\n" + "="*70)
    print("PLANTPAL - PLANT IDENTIFICATION TESTER")
    print("="*70 + "\n")

    model_dir = r"C:\Users\Welzon Entera\OneDrive\Documents\Plantpal_model"

    if not os.path.exists(model_dir):
        print(f"ERROR: Model directory not found: {model_dir}")
        return

    # Check if required files exist
    required_files = ["best_model.pth", "class_names.json", "model_info.json"]
    missing_files = [f for f in required_files if not os.path.exists(os.path.join(model_dir, f))]
    
    if missing_files:
        print(f"ERROR: Missing required files: {', '.join(missing_files)}")
        print(f"Please make sure training completed successfully.")
        return

    try:
        identifier = PlantIdentifier(model_dir)
    except Exception as e:
        print(f"ERROR: Failed to initialize model: {e}")
        import traceback
        traceback.print_exc()
        return

    while True:
        print("\n" + "-"*70)
        print("OPTIONS")
        print("-"*70)
        print("1. Test single image")
        print("2. Test images from folder")
        print("3. List plant classes")
        print("4. Change confidence threshold")
        print("5. View model statistics")
        print("6. Exit")
        print("-"*70)

        choice = input("\nEnter choice (1-6): ").strip()

        if choice == "1":
            img = input("\nEnter image path: ").strip().strip('"')
            if os.path.exists(img):
                identifier.predict_and_display(img)
            else:
                print("ERROR: Image not found")

        elif choice == "2":
            folder = input("\nEnter folder path: ").strip().strip('"')
            if not os.path.exists(folder):
                print("ERROR: Folder not found")
                continue

            images = [
                os.path.join(folder, f)
                for f in os.listdir(folder)
                if f.lower().endswith((".jpg", ".jpeg", ".png", ".bmp"))
            ]

            if not images:
                print("ERROR: No images found in folder")
                continue

            print(f"\nFound {len(images)} images")
            
            for img in images:
                identifier.predict_and_display(img)
                if img != images[-1]:
                    cont = input("\nPress Enter to continue (or 'q' to stop)... ")
                    if cont.lower() == 'q':
                        break

        elif choice == "3":
            print("\n" + "="*70)
            print(f"AVAILABLE PLANT CLASSES ({len(identifier.class_names)} total)")
            print("="*70 + "\n")
            
            sorted_classes = sorted(identifier.class_names)
            for i, name in enumerate(sorted_classes, 1):
                formatted_name = name.replace('_', ' ').title()
                print(f"{i:2d}. {formatted_name}")
            print()

        elif choice == "4":
            print(f"\nCurrent threshold: {identifier.confidence_threshold}%")
            try:
                new_threshold = float(input("Enter new threshold (0-100): ").strip())
                if 0 <= new_threshold <= 100:
                    identifier.confidence_threshold = new_threshold
                    print(f"Threshold updated to {new_threshold}%")
                else:
                    print("ERROR: Invalid threshold (must be 0-100)")
            except ValueError:
                print("ERROR: Invalid input")

        elif choice == "5":
            print("\n" + "="*70)
            print("MODEL STATISTICS")
            print("="*70)
            print(f"Architecture: {identifier.model_info.get('model_architecture', 'N/A')}")
            print(f"Number of classes: {len(identifier.class_names)}")
            print(f"Training images: {identifier.model_info.get('total_train_images', 'N/A')}")
            print(f"Validation images: {identifier.model_info.get('total_val_images', 'N/A')}")
            print(f"Best validation accuracy: {identifier.model_info.get('best_val_accuracy', 0):.2f}%")
            print(f"Training epochs: {identifier.model_info.get('training_epochs', 'N/A')}")
            print(f"Batch size: {identifier.model_info.get('batch_size', 'N/A')}")
            print(f"Learning rate: {identifier.model_info.get('learning_rate', 'N/A')}")
            
            if 'total_training_time_minutes' in identifier.model_info:
                time_min = identifier.model_info['total_training_time_minutes']
                print(f"Total training time: {time_min:.1f} minutes ({time_min/60:.2f} hours)")
            
            if 'enhancements' in identifier.model_info:
                print("\nEnhancements applied:")
                for enh in identifier.model_info['enhancements']:
                    print(f"  - {enh}")
            print("="*70 + "\n")

        elif choice == "6":
            print("\n" + "="*70)
            print("Thank you for using PlantPal Tester!")
            print("="*70 + "\n")
            break

        else:
            print("ERROR: Invalid choice")


if __name__ == "__main__":
    main()