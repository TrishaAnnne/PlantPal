import torch
import torch.nn as nn
from torchvision import models, transforms
from PIL import Image
import json
import io
import base64
from pathlib import Path
from django.conf import settings
import logging
from datetime import datetime

logger = logging.getLogger(__name__)

class PlantIdentifier:
    _instance = None
    
    def __new__(cls):
        """Singleton pattern to load model only once"""
        if cls._instance is None:
            cls._instance = super(PlantIdentifier, cls).__new__(cls)
            cls._instance._initialized = False
        return cls._instance
    
    def __init__(self):
        """Initialize the model (only runs once due to singleton)"""
        if self._initialized:
            return
            
        # Set model directory path
        self.model_dir = Path(r"C:\Users\Welzon Entera\OneDrive\Documents\Plantpal_model")
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        
        # 🔐 Confidence thresholds for different quality levels
        self.confidence_thresholds = {
            'high': 85.0,      # High confidence 
            'medium': 70.0,    # Medium confidence 
            'low': 55.0,       # Low confidence 
            'reject': 65.0     # Too uncertain
        }
        
        # 🐛 DEBUG: Create debug directory for saving images
        self.debug_dir = self.model_dir / 'debug_scans'
        self.debug_dir.mkdir(exist_ok=True)
        
        # Load class names
        with open(self.model_dir / 'class_names.json', 'r') as f:
            self.class_names = json.load(f)
        
        # Load model
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
        
        self._initialized = True
        logger.info(f"Plant Identifier loaded: {len(self.class_names)} classes on {self.device}")
        logger.info(f"Model: ResNet18")
        logger.info(f"Confidence levels: High(>70%), Medium(50-70%), Low(30-50%), Reject(<20%)")
        logger.info(f"Debug images saved to: {self.debug_dir}")
    
    def _load_model(self):
        """Load the trained Enhanced ResNet18 model"""
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
        num_classes = len(self.class_names)
        model = ImprovedResNet18(num_classes)  # Create wrapper instance
        
        # Load weights
        model_path = self.model_dir / 'best_model.pth'
        checkpoint = torch.load(model_path, map_location=self.device, weights_only=False)
        
        # Extract model state dict
        if 'model_state_dict' in checkpoint:
            state_dict = checkpoint['model_state_dict']
            logger.info(f"Model loaded from epoch {checkpoint.get('epoch', 'N/A')}")
            logger.info(f"Validation accuracy: {checkpoint.get('val_acc', 0):.2f}%")
        else:
            state_dict = checkpoint
        
        # Load state dict into the wrapper model
        model.load_state_dict(state_dict)  # This should work now
        
        model = model.to(self.device)
        model.eval()
        
        logger.info(f"Enhanced ResNet18 model loaded from: {model_path}")
        return model

    def _get_confidence_level(self, confidence):
        """Determine confidence level based on score"""
        if confidence >= self.confidence_thresholds['high']:
            return 'high'
        elif confidence >= self.confidence_thresholds['medium']:
            return 'medium'
        elif confidence >= self.confidence_thresholds['low']:
            return 'low'
        else:
            return 'very_low'
    
    def predict_from_base64(self, base64_string, save_debug=True):
        """
        Predict plant species from base64 encoded image
        
        Args:
            base64_string: Base64 encoded image string
            save_debug: Whether to save debug images (default True)
            
        Returns:
            dict: {
                'status': 'recognized' | 'uncertain' | 'unknown' | 'error',
                'plant_name': str,
                'confidence': float,
                'confidence_level': 'high' | 'medium' | 'low' | 'very_low',
                'top_predictions': list of dicts,
                'warning': str (optional - for low confidence)
            }
        """
        try:
            # Strip data URL prefix if present (data:image/jpeg;base64,)
            if ',' in base64_string and base64_string.startswith('data:'):
                base64_string = base64_string.split(',', 1)[1]
            
            # Decode base64 to image
            image_data = base64.b64decode(base64_string)
            logger.info(f"Decoded image size: {len(image_data)} bytes")
            
            # Open image
            image = Image.open(io.BytesIO(image_data)).convert('RGB')
            original_size = image.size
            logger.info(f"Original image: size={original_size}, mode={image.mode}")
            
            # 🐛 DEBUG: Save original image
            if save_debug:
                timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
                debug_path = self.debug_dir / f"scan_{timestamp}_original.jpg"
                image.save(debug_path, quality=95)
                logger.info(f"🐛 Saved original image: {debug_path}")
            
            # 🔍 Resize large images for better processing
            max_size = 1024
            if max(original_size) > max_size:
                logger.warning(f"Large image detected ({original_size}), resizing to max {max_size}px")
                ratio = max_size / max(original_size)
                new_size = tuple(int(dim * ratio) for dim in original_size)
                image = image.resize(new_size, Image.Resampling.LANCZOS)
                logger.info(f"Resized to: {image.size}")
                
                if save_debug:
                    debug_path = self.debug_dir / f"scan_{timestamp}_resized.jpg"
                    image.save(debug_path, quality=95)
                    logger.info(f"🐛 Saved resized image: {debug_path}")
            
            # Preprocess image
            image_tensor = self.transform(image).unsqueeze(0).to(self.device)
            logger.info(f"Tensor shape: {image_tensor.shape}")
            logger.info(f"Tensor stats: min={image_tensor.min():.3f}, max={image_tensor.max():.3f}, mean={image_tensor.mean():.3f}")
            
            # Make prediction
            with torch.no_grad():
                outputs = self.model(image_tensor)
                probabilities = torch.nn.functional.softmax(outputs, dim=1)
                top_probs, top_indices = torch.topk(probabilities, 5)
            
            # Format results
            top_predictions = []
            for prob, idx in zip(top_probs[0], top_indices[0]):
                class_name = self.class_names[idx.item()]
                confidence = prob.item() * 100
                top_predictions.append({
                    'plant_name': class_name,
                    'confidence': round(confidence, 2)
                })
                logger.info(f"   {class_name}: {confidence:.2f}%")
            
            # Get top prediction
            top_plant = top_predictions[0]['plant_name']
            top_conf = top_predictions[0]['confidence']
            conf_level = self._get_confidence_level(top_conf)
            
            logger.info(f"Top prediction: {top_plant} ({top_conf:.2f}%) - Level: {conf_level}")
            
            # 🔍 Determine status based on confidence
            if top_conf < self.confidence_thresholds['reject']:
                logger.warning(f"Rejecting: {top_conf:.2f}% < {self.confidence_thresholds['reject']}%")
                return {
                    'status': 'unknown',
                    'plant_name': None,
                    'confidence': top_conf,
                    'confidence_level': 'very_low',
                    'top_predictions': top_predictions,
                    'message': 'Unable to identify this plant. Please ensure the image shows clear leaves with good lighting.'
                }
            
            # Build response
            response = {
                'status': 'recognized',
                'plant_name': top_plant,
                'confidence': top_conf,
                'confidence_level': conf_level,
                'top_predictions': top_predictions
            }
            
            # Add warnings for lower confidence
            if conf_level == 'low':
                response['warning'] = 'Low confidence. Try taking a close-up photo of the leaves for better accuracy.'
                response['status'] = 'uncertain'
            elif conf_level == 'medium':
                response['warning'] = 'Moderate confidence. For best results, capture clear leaf details with good lighting.'
            
            return response
            
        except Exception as e:
            logger.error(f"❌ Prediction error: {str(e)}", exc_info=True)
            return {
                'status': 'error',
                'plant_name': None,
                'confidence': 0,
                'confidence_level': 'very_low',
                'message': f'Failed to process image: {str(e)}'
            }
    
    def predict_from_file(self, image_file, save_debug=True):
        """
        Predict plant species from uploaded file
        
        Args:
            image_file: Django UploadedFile object
            save_debug: Whether to save debug images (default True)
            
        Returns:
            dict: Same as predict_from_base64
        """
        try:
            # Open image
            image = Image.open(image_file).convert('RGB')
            original_size = image.size
            logger.info(f"📐 Original image: size={original_size}, mode={image.mode}")
            
            # 🐛 DEBUG: Save original image
            if save_debug:
                timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
                debug_path = self.debug_dir / f"upload_{timestamp}_original.jpg"
                image.save(debug_path, quality=95)
                logger.info(f"Saved original image: {debug_path}")
            
            # 🔍 Resize large images
            max_size = 1024
            if max(original_size) > max_size:
                logger.warning(f"⚠️ Large image detected ({original_size}), resizing to max {max_size}px")
                ratio = max_size / max(original_size)
                new_size = tuple(int(dim * ratio) for dim in original_size)
                image = image.resize(new_size, Image.Resampling.LANCZOS)
                logger.info(f"📐 Resized to: {image.size}")
                
                if save_debug:
                    debug_path = self.debug_dir / f"upload_{timestamp}_resized.jpg"
                    image.save(debug_path, quality=95)
                    logger.info(f"🐛 Saved resized image: {debug_path}")
            
            # Preprocess image
            image_tensor = self.transform(image).unsqueeze(0).to(self.device)
            logger.info(f"Tensor shape: {image_tensor.shape}")
            logger.info(f"Tensor stats: min={image_tensor.min():.3f}, max={image_tensor.max():.3f}, mean={image_tensor.mean():.3f}")
            
            # Make prediction
            with torch.no_grad():
                outputs = self.model(image_tensor)
                probabilities = torch.nn.functional.softmax(outputs, dim=1)
                top_probs, top_indices = torch.topk(probabilities, 5)
            
            # Format results
            top_predictions = []
            for prob, idx in zip(top_probs[0], top_indices[0]):
                class_name = self.class_names[idx.item()]
                confidence = prob.item() * 100
                top_predictions.append({
                    'plant_name': class_name,
                    'confidence': round(confidence, 2)
                })
                logger.info(f"   {class_name}: {confidence:.2f}%")
            
            # Get top prediction
            top_plant = top_predictions[0]['plant_name']
            top_conf = top_predictions[0]['confidence']
            conf_level = self._get_confidence_level(top_conf)
            
            logger.info(f"🌿 Top prediction: {top_plant} ({top_conf:.2f}%) - Level: {conf_level}")
            
            # 🔍 Determine status based on confidence
            if top_conf < self.confidence_thresholds['reject']:
                logger.warning(f"Rejecting: {top_conf:.2f}% < {self.confidence_thresholds['reject']}%")
                return {
                    'status': 'unknown',
                    'plant_name': None,
                    'confidence': top_conf,
                    'confidence_level': 'very_low',
                    'top_predictions': top_predictions,
                    'message': 'Unable to identify this plant. Please ensure the image shows clear leaves with good lighting.'
                }
            
            # Build response
            response = {
                'status': 'recognized',
                'plant_name': top_plant,
                'confidence': top_conf,
                'confidence_level': conf_level,
                'top_predictions': top_predictions
            }
            
            # Add warnings for lower confidence
            if conf_level == 'low':
                response['warning'] = 'Low confidence. Try taking a close-up photo of the leaves for better accuracy.'
                response['status'] = 'uncertain'
            elif conf_level == 'medium':
                response['warning'] = 'Moderate confidence. For best results, capture clear leaf details with good lighting.'
            
            return response
            
        except Exception as e:
            logger.error(f"❌ Prediction error: {str(e)}", exc_info=True)
            return {
                'status': 'error',
                'plant_name': None,
                'confidence': 0,
                'confidence_level': 'very_low',
                'message': f'Failed to process image: {str(e)}'
            }


# Global instance
plant_identifier = PlantIdentifier()  # Auto-initializes on import