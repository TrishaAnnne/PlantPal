"""
Check what's actually in your saved model file
This will tell us the true architecture
"""

import torch
from pathlib import Path

model_path = Path(r"C:\Users\Welzon Entera\OneDrive\Documents\Plantpal_model\best_model.pth")

print("\n" + "="*60)
print("🔍 ANALYZING MODEL FILE")
print("="*60 + "\n")

checkpoint = torch.load(model_path, map_location='cpu', weights_only=False)

# Check if it's a dict or direct state_dict
if isinstance(checkpoint, dict):
    print("📦 Checkpoint structure:")
    for key in checkpoint.keys():
        print(f"   - {key}")
    
    if 'model_state_dict' in checkpoint:
        state_dict = checkpoint['model_state_dict']
        print("\n✅ Found 'model_state_dict' key")
    else:
        state_dict = checkpoint
        print("\n✅ Using checkpoint directly as state_dict")
else:
    state_dict = checkpoint
    print("✅ Checkpoint is direct state_dict")

print("\n" + "="*60)
print("🔑 MODEL LAYERS")
print("="*60 + "\n")

# Look for key indicators
fc_weight_key = None
for key in state_dict.keys():
    if 'fc.weight' in key:
        fc_weight_key = key
        break

if fc_weight_key:
    fc_shape = state_dict[fc_weight_key].shape
    print(f"Final layer (fc.weight) shape: {fc_shape}")
    print(f"   - Output classes: {fc_shape[0]}")
    print(f"   - Input features: {fc_shape[1]}")
    
    if fc_shape[1] == 512:
        print("\n✅ This is a ResNet18 model (512 features)")
    elif fc_shape[1] == 2048:
        print("\n✅ This is a ResNet50 model (2048 features)")
    else:
        print(f"\n❓ Unknown architecture ({fc_shape[1]} features)")
else:
    print("❌ Could not find fc.weight layer")

# Check for layer structure indicators
has_layer1_2 = any('layer1.2' in key for key in state_dict.keys())
has_layer2_3 = any('layer2.3' in key for key in state_dict.keys())
has_layer3_5 = any('layer3.5' in key for key in state_dict.keys())

print("\n" + "="*60)
print("🏗️  LAYER STRUCTURE ANALYSIS")
print("="*60 + "\n")

print(f"Has layer1.2 (ResNet50 has this): {has_layer1_2}")
print(f"Has layer2.3 (ResNet50 has this): {has_layer2_3}")
print(f"Has layer3.5 (ResNet50 has this): {has_layer3_5}")

if has_layer1_2 and has_layer2_3 and has_layer3_5:
    print("\n✅ Layer structure confirms: ResNet50")
elif not has_layer1_2:
    print("\n✅ Layer structure confirms: ResNet18")
else:
    print("\n❓ Mixed results - needs manual inspection")

print("\n" + "="*60)
print("📊 SUMMARY")
print("="*60 + "\n")

# Count total parameters
total_params = sum(p.numel() for p in state_dict.values())
print(f"Total parameters: {total_params:,}")

if total_params > 20_000_000:
    print("Parameter count suggests: ResNet50 (~25M params)")
elif total_params > 10_000_000:
    print("Parameter count suggests: ResNet18 (~11M params)")

print("\n" + "="*60 + "\n")