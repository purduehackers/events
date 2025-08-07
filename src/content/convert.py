# TODO: implement
import os
import json
from datetime import datetime, timezone
import re

from constants import *



def get_slug(event):
    event_name = event.get("name", "")

    # If we don't recognize the class of this event, treat it as a special event (for now)
    class_name = "special"
    if "Hack Night" in event_name:
        class_name = "hack-night"
    elif "Workshop" in event_name:
        class_name = "workshops"
    elif "Callout" in event_name:
        class_name = "callouts"

    # When the version cannot be determined, use the current timestamp
    current_time = datetime.now(timezone.utc).timestamp()
    version = f"unknown-version-{current_time}"
    match class_name:
        case "hack-night":
            match = re.search(r"\b(\d+\.\d+(?:\.\d+)?)\b", event_name)
            if match:
                version = match.group(1)
        case "workshops":
            # Remove "Workshop" or "Workshops" from event name, convert spaces to dashes and lowercase
            version = event_name.lower().replace("workshops", "").replace("workshop", "").strip()
            version = "-".join(version.split())
        case "callouts":
            # Use term (example: Spring 2025), convert space to dash and lowercase
            version = event_name.lower().replace("callout", "").strip()
            version = "-".join(version.split())

    return class_name, version


# TODO: implement
def get_extension_from_magic_number(path):
    pass


def is_invalid_image_extension(path, ext):
    return get_extension_from_magic_number(path) == ext


def process_and_copy_images(event, target_path):
    base_image_path = os.path.join(DOWNLOAD_DIR, "images")
    target_image_path = os.path.join(target_path, "images")
    os.makedirs(target_image_path, exist_ok=True)

    images = event.get("recapImages", [])

    for image in images:
        # Get image path
        image_key = image.get("_key", "")
        image_asset_metadata = image.get("asset", {})
        image_ref = image_asset_metadata.get("_ref", "")

        if not image_ref:
            print(f"WARNING: image ref is empty for image key {image_key}!")
            continue

        _, image_id, _, image_ext = image_ref.split('-')

        image_file_name = f"{image_id}.{image_ext}"
        base_image_full_path = os.path.join(base_image_path, image_file_name)

        if not os.path.exists(base_image_full_path):
            print(f"ERROR: file does not exist at {base_image_full_path} for image key {image_key}!")
            continue

        # Check if Sanity has modified the file extension w/o format conversion
        correct_extension = None
        if is_invalid_image_extension(base_image_full_path, image_ext):
            correct_extension = get_extension_from_magic_number(base_image_full_path)
            print(f"Warning: Sanity mangled the extension from {correct_extension} to {image_ext} for image key {image_key}.")
            print(f"\tCorrecting to {image_id}.{correct_extension}...")
        target_extension = correct_extension if correct_extension else image_ext
        
        # TODO: refer to image metadata file for original filename
        # TODO: copy image into slug->images path
        # TODO: return all images to be included into Markdown metadata
        return
    pass


def save_markdown_metadata(event, images, target_path):
    # TODO: Create Markdown file named event.md inside with event metadata
    pass


def process_event(event):
    event_class, event_version = get_slug(event)
    target_slug_path = f"/{event_class}/{event_version}/"
    images = process_and_copy_images(event, target_slug_path)
    save_markdown_metadata(event, images, target_slug_path)


def main():
    # Read in all events
    with open(os.path.join(DOWNLOAD_DIR, "response_filtered.json"), "r", encoding="utf-8") as file:
        data = json.load(file)

    events = data.get("result", [])

    for event in events:
        process_event(event)


if __name__=="__main__":
    main()