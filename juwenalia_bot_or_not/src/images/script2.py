import pandas as pd
import os
import shutil
import random
from PIL import Image, ImageFilter

# File paths
csv_path = 'train.csv'
sample_dir = 'sample2'
manifest_dir = 'sample2'
manifest_path = os.path.join(manifest_dir, 'imageManifest.js')

# Create necessary folders
os.makedirs(sample_dir, exist_ok=True)
os.makedirs(manifest_dir, exist_ok=True)

# Set random seed for reproducibility
random.seed(42)

# Load and sample CSV with balanced sampling
df = pd.read_csv(csv_path)

# Get 70% real (280) and 30% fake (120) distribution
real_images = df[df['label'] == 0].sample(n=280, random_state=42)
fake_images = df[df['label'] == 1].sample(n=120, random_state=42)

# Combine and shuffle
sampled_df = pd.concat([real_images, fake_images]).sample(frac=1, random_state=42).reset_index(drop=True)

# Mapping for labels
label_map = {0: "real", 1: "deepfake"}

# Define effect types with weights for 50% black & white
# Black & white effects: 4 out of 8 = 50%
# Color effects: 4 out of 8 = 50%
EFFECT_TYPES = [
    'bw', 'bw', 'bw', 'bw',  # 4/8 = 50% black & white effects
    'tilt', 'blur', 'tilt_blur', 'bw_blur'  # 4/8 = 50% other effects
]

def apply_black_white(img):
    """Convert image to grayscale"""
    return img.convert('L')

def apply_tilt(img):
    """Apply random rotation between -15 and +15 degrees"""
    angle = random.uniform(-15, 15)
    # Convert to RGBA to support transparency
    if img.mode != 'RGBA':
        img = img.convert('RGBA')
    return img.rotate(angle, expand=True, fillcolor=(0, 0, 0, 0))

def apply_blur(img):
    """Apply Gaussian blur"""
    return img.filter(ImageFilter.GaussianBlur(radius=random.uniform(1, 3)))


def apply_random_effects(img):
    """Apply a random combination of effects"""
    effect_type = random.choice(EFFECT_TYPES)
    
    if effect_type == 'bw':
        return apply_black_white(img)
    elif effect_type == 'tilt':
        return apply_tilt(img)
    elif effect_type == 'blur':
        return apply_blur(img)
    elif effect_type == 'bw_tilt':
        img = apply_black_white(img)
        return apply_tilt(img)
    elif effect_type == 'bw_blur':
        img = apply_black_white(img)
        return apply_blur(img)
    elif effect_type == 'tilt_blur':
        img = apply_tilt(img)
        return apply_blur(img)
    else:
        return img

# Prepare manifest lines
manifest_lines = ["export const images = ["]

print(f"Processing {len(sampled_df)} images from train.csv with random effects")

for _, row in sampled_df.iterrows():
    label = row['label']
    original_path = row['file_name']
    filename = os.path.basename(original_path)
    new_filename = f"{label}_{filename}"
    new_path = os.path.join(sample_dir, new_filename)
    
    # Open image and apply random effects
    with Image.open(original_path) as img:
        # Apply random combination of effects
        processed_img = apply_random_effects(img)
        
        # Convert RGBA back to RGB with white background for JPEG compatibility
        if processed_img.mode == 'RGBA':
            # Create a white background
            background = Image.new('RGB', processed_img.size, (255, 255, 255))
            background.paste(processed_img, mask=processed_img.split()[-1])  # Use alpha channel as mask
            processed_img = background
        
        processed_img.save(new_path)
    
    # Add to manifest
    manifest_lines.append(
        f'  {{ url: new URL("./{new_filename}", import.meta.url).href, label: "{label_map[label]}" }},')

# Finalize manifest file
manifest_lines.append("];\n")

# Save manifest to JS file
with open(manifest_path, "w") as f:
    f.write("\n".join(manifest_lines))

print(f"Images copied to '{sample_dir}/' and manifest generated at '{manifest_path}'.")
print(f"Total images processed: {len(manifest_lines) - 2}")  # Subtract 2 for the opening and closing lines
