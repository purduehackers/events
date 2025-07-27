import os
import json
import requests

from constants import *

RAW_DOWNLOAD_FILE_NAME = "response.json"


def construct_api_url(query):
    return f"https://{SANITY_PROJECT_ID}.api.sanity.io/v2025-07-27/data/query/{SANITY_DATASET}?query={query}"


def download_raw_json():
    """
    Downloads all events from Sanity and saves the raw JSON to `downloads/`
    """
    # Query all events
    api_url = construct_api_url('*[_type == "event"]{...}')
    response = requests.get(api_url)
    response.raise_for_status()
    res_json = response.json()

    # Save response JSON as file
    with open(
        os.path.join(DOWNLOAD_DIR, RAW_DOWNLOAD_FILE_NAME), "w", encoding="utf-8"
    ) as res_file:
        json.dump(res_json, res_file, ensure_ascii=False, indent=2)


def download_images():
    """
    Downloads all images from Sanity and saves each image to `downloads/images/`
    """
    # Query all images
    api_url = construct_api_url('*[_type == "sanity.imageAsset"]{...}')
    response = requests.get(api_url)
    response.raise_for_status()
    res_json = response.json()

    # Save response JSON as file
    with open(
        os.path.join(DOWNLOAD_DIR, "images_metadata.json"), "w", encoding="utf-8"
    ) as res_file:
        json.dump(res_json, res_file, ensure_ascii=False, indent=2)

    images = res_json.get("result", [])
    image_count = len(images)

    print(f"Downloading {image_count} images...")

    for index, image in enumerate(images):
        target_file_name = f"{image.get("assetId")}.{image.get("extension")}"
        photo_url = image.get("url")
        photo_path = os.path.join(DOWNLOAD_DIR, "images", target_file_name)

        print(f"({index + 1}/{image_count}) Downloading image {target_file_name}...")
        download_image(photo_url, photo_path)
        print(f"({index + 1}/{image_count}) Download finished.")


def download_image(url, dest_path):
    response = requests.get(url, stream=True)
    if response.status_code == 200:
        os.makedirs(os.path.dirname(dest_path), exist_ok=True)
        with open(dest_path, "wb") as f:
            for chunk in response.iter_content(1024):
                f.write(chunk)


def main():
    # Create download directory if it doesn't exist
    os.makedirs(DOWNLOAD_DIR, exist_ok=True)

    # Comment and un-comment stages
    # download_raw_json()
    download_images()


if __name__ == "__main__":
    main()
