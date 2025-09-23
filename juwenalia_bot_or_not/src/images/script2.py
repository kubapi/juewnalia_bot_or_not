import pandas as pd
import os
import shutil
import random
from PIL import Image, ImageFilter, ImageDraw

# File paths
csv_path = 'train.csv'
sample_dir = 'sample2'
manifest_dir = 'src/images/sample2'
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

# Define effect types (removed cheese effects, reduced bw probability)
EFFECT_TYPES = ['tilt', 'blur', 'tilt_blur', 'bw', 'bw_tilt', 'bw_blur', 'bw_tilt_blur']

def apply_black_white(img):
    """Convert image to grayscale"""
    return img.convert('L')

def apply_tilt(img):
    """Apply random rotation between -15 and +15 degrees"""
    angle = random.uniform(-15, 15)
    return img.rotate(angle, expand=True, fillcolor=255)

def apply_blur(img):
    """Apply Gaussian blur"""
    return img.filter(ImageFilter.GaussianBlur(radius=random.uniform(1, 3)))

def apply_cheese_effect(img):
    """Apply cheese effect - random rectangular holes"""
    img_copy = img.copy()
    draw = ImageDraw.Draw(img_copy)
    width, height = img_copy.size
    
    # Create 2-5 random rectangular holes
    num_holes = random.randint(2, 5)
    for _ in range(num_holes):
        # Random hole size (10-30% of image dimensions)
        hole_width = random.randint(int(width * 0.1), int(width * 0.3))
        hole_height = random.randint(int(height * 0.1), int(height * 0.3))
        
        # Random position
        x = random.randint(0, width - hole_width)
        y = random.randint(0, height - hole_height)
        
        # Draw white rectangle (hole)
        draw.rectangle([x, y, x + hole_width, y + hole_height], fill=255)
    
    return img_copy

def apply_random_effects(img):
    """Apply a random combination of effects with weighted probabilities"""
    # Weighted random choice: 60% no bw, 40% with bw
    if random.random() < 0.6:
        # No black & white effects (60% probability)
        effect_type = random.choice(['tilt', 'blur', 'tilt_blur'])
    else:
        # Black & white effects (40% probability)
        effect_type = random.choice(['bw', 'bw_tilt', 'bw_blur', 'bw_tilt_blur'])
    
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
    elif effect_type == 'bw_tilt_blur':
        img = apply_black_white(img)
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
        processed_img.save(new_path)
    
    # Add to manifest
    manifest_lines.append(
        f'  {{ url: require("./{new_filename}"), label: "{label_map[label]}" }},')

# Finalize manifest file
manifest_lines.append("];\n")

# Save manifest to JS file
with open(manifest_path, "w") as f:
    f.write("\n".join(manifest_lines))

print(f"Images copied to '{sample_dir}/' and manifest generated at '{manifest_path}'.")
print(f"Total images processed: {len(manifest_lines) - 2}")  # Subtract 2 for the opening and closing lines
