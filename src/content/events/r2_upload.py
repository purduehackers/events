import os
import boto3
from rich.console import Console
from dotenv import load_dotenv

load_dotenv()

s3 = boto3.client(
    service_name="s3",
    endpoint_url=os.getenv("S3_ENDPOINT"),
    aws_access_key_id=os.getenv("ACCESS_KEY_ID"),
    aws_secret_access_key=os.getenv("ACCESS_KEY_ID"),
    region_name="auto",
)

console = Console()

IMAGES_SUBDIR_NAME = "images"
BUCKET_NAME = "events"
BUCKET_IMAGES_SUBDIR_NAME = IMAGES_SUBDIR_NAME


# Glob for all folders in current directory
classifications = [(f.path, f.name) for f in os.scandir(".") if f.is_dir()]

for classification_path, classification_name in classifications:
    with console.status(
        f"[bold green]Uploading events in {classification_name}..."
    ) as class_status:
        # Glob for all folders in classification directory
        for version_path, version_name in [
            (f.path, f.name) for f in os.scandir(classification_path) if f.is_dir()
        ]:
            with console.status(
                f"[bold green]Uploading images in {classification_name}/{version_name}..."
            ) as version_status:
                # Check if current directory has an images subdirectory
                if IMAGES_SUBDIR_NAME not in [
                    f.name for f in os.scandir(version_path) if f.is_dir()
                ]:
                    continue

                image_dir = os.path.join(version_path, IMAGES_SUBDIR_NAME)

                # Find all images in current directory
                for image_path, image_name in [
                    (f.path, f.name) for f in os.scandir(image_dir) if f.is_file()
                ]:
                    with console.status(
                        f"[bold green]Uploading {classification_name}/{version_name}/{image_name}..."
                    ) as status:
                        # Upload to R2-bucket/images/<classifcation>/<version>/<image original file name>
                        s3_target_path = os.path.join(
                            BUCKET_IMAGES_SUBDIR_NAME,
                            classification_name,
                            version_name,
                            image_name,
                        ).replace("\\", "/")
                        s3.upload_file(image_path, BUCKET_NAME, s3_target_path)

                        console.log(
                            f"Uploaded {classification_name}/{version_name}/{image_name}"
                        )
