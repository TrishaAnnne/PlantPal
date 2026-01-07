import torch

model_path = r"C:\Users\Welzon Entera\OneDrive\Documents\Plantpal_model\best_model.pth"
checkpoint = torch.load(model_path, map_location='cpu')

if 'model_state_dict' in checkpoint:
    state_dict = checkpoint['model_state_dict']
else:
    state_dict = checkpoint

# Print first few keys
print("First 5 keys in state dict:")
for i, key in enumerate(list(state_dict.keys())[:5]):
    print(f"  {key}")

# Check for wrapper
has_wrapper = any(key.startswith('resnet.') for key in state_dict.keys())
print(f"\nHas wrapper: {has_wrapper}")