# TODO: implement
import os
import json
from datetime import datetime, timezone

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
            # TODO: Get version in the form of x.x or x.x.x
            pass
        case "workshops":
            # TODO: Remove "Workshop" from event name, convert all spaces to dashes and lowercase
            pass
        case "callouts":
            # TODO: Use term, convert space to dash and lowercase
            pass

    return class_name, version


def process_and_copy_images(event, target_path):
    # TODO:
    # Create an images/ path inside target path
    # For each image associated with the event:
    #   Check if Sanity has modified the file extension w/o format conversion
    #     If so, restore original file extension
    #   Refer to image metadata file for original filename
    #   Copy image into slug->images path
    # Return all images to be included into Markdown metadata
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