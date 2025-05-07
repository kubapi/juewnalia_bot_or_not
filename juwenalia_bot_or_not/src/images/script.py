import pandas as pd
import os
import shutil
import random

# File paths
csv_path = 'train.csv'
sample_dir = 'sample'
manifest_dir = 'src/images/sample'
manifest_path = os.path.join(manifest_dir, 'imageManifest.js')

# Create necessary folders
os.makedirs(sample_dir, exist_ok=True)
os.makedirs(manifest_dir, exist_ok=True)

# Load and sample CSV
df = pd.read_csv(csv_path)
sampled_df = df.sample(n=200, random_state=42).reset_index(drop=True)

# Mapping for labels
label_map = {0: "real", 1: "deepfake"}

# Prepare manifest lines
manifest_lines = ["export const images = ["]

for _, row in sampled_df.iterrows():
    label = row['label']
    original_path = row['file_name']
    filename = os.path.basename(original_path)
    new_filename = f"{label}_{filename}"
    new_path = os.path.join(sample_dir, new_filename)

    # Copy and rename image
    shutil.copyfile(original_path, new_path)

    # Add to manifest
    manifest_lines.append(
        f'  {{ url: require("./{new_filename}"), label: "{label_map[label]}" }},')

# Finalize manifest file
manifest_lines.append("];\n")

# Save manifest to JS file
with open(manifest_path, "w") as f:
    f.write("\n".join(manifest_lines))

print("Images copied to 'sample/' and manifest generated at 'src/images/sample/imageManifest.js'.")
