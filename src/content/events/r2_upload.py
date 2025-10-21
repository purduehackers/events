import os

IMAGES_SUBDIR_NAME = "images"

# Glob for all folders in current directory
for (classification_path, classification_name) in [ (f.path, f.name) for f in os.scandir(".") if f.is_dir() ]:
    # Glob for all folders in classification directory
    for (version_path, version_name) in [ (f.path, f.name) for f in os.scandir(classification_path) if f.is_dir() ]:
        # Check if current directory has an images subdirectory
        if IMAGES_SUBDIR_NAME not in [ f.name for f in os.scandir(version_path) if f.is_dir() ]:
            continue
        
        image_dir = os.path.join(version_path, IMAGES_SUBDIR_NAME)
            
        # Find all images in current directory
        for (image_path, image_name) in [ (f.path, f.name) for f in os.scandir(image_dir) if f.is_file() ]:
            # Upload to R2-bucket/images/<classifcation>/<version>/<image original file name>
            print(f"Would've uploaded {image_path} to {classification_name}/{version_name}/{image_name}")
        