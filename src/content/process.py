import os
import json
from datetime import datetime

from constants import *


def sort_events(source, dest):
    """
    Opens `source` file in `downloads/`, sorts all events in the result array by
    the `start` date field, then saves it to `dest` file in `downloads/`
    """
    with open(os.path.join(DOWNLOAD_DIR, source), "r", encoding="utf-8") as res_file:
        res_json = json.load(res_file)

    events = res_json.get("result", [])

    def parse_date(date_str):
        try:
            return datetime.strptime(date_str, "%Y-%m-%dT%H:%M:%S.%fZ")
        except Exception:
            return datetime.min

    sorted_events = sorted(
        events, key=lambda e: parse_date(e.get("start", "")), reverse=True
    )

    res_json["result"] = sorted_events
    with open(os.path.join(DOWNLOAD_DIR, dest), "w", encoding="utf-8") as out_file:
        json.dump(res_json, out_file, ensure_ascii=False, indent=2)


def filter_events(source, dest):
    """
    Opens `source` file in `downloads/`, filters out all unpublished events,
    then saves it to `dest` file in `downloads/`
    """
    with open(os.path.join(DOWNLOAD_DIR, source), "r", encoding="utf-8") as res_file:
        res_json = json.load(res_file)

    events = res_json.get("result", [])

    filtered_events = [event for event in events if not event.get("unlisted", False)]

    res_json["result"] = filtered_events
    with open(os.path.join(DOWNLOAD_DIR, dest), "w", encoding="utf-8") as out_file:
        json.dump(res_json, out_file, ensure_ascii=False, indent=2)


def classify_events(file_name):
    """
    Opens `file_name` file in `downloads/` and classifies events based on their
    name
    """

    classes = {
        "hack-night": [],
        "workshops": [],
        "callouts": [],
        "unknown": [],
    }
    with open(os.path.join(DOWNLOAD_DIR, file_name), "r", encoding="utf-8") as file:
        f_json = json.load(file)

    events = f_json.get("result", [])

    for event in events:
        event_name = event.get("name", "")

        # Unset class_name each loop
        class_name = "unknown"
        if "Hack Night" in event_name:
            class_name = "hack-night"
        elif "Workshop" in event_name:
            class_name = "workshops"
        elif "Callout" in event_name:
            class_name = "callouts"

        classes[class_name].append(event)

    return classes


def count_events(file_name):
    """
    Counts total number of events in the `results` field in the supplied file
    """
    with open(os.path.join(DOWNLOAD_DIR, file_name), "r", encoding="utf-8") as f:
        data = json.load(f)
        count = len(data.get("result", []))
        print(f"Total events: {count}")


def main():
    # sort_events(source="response.json", dest="response_sorted.json")
    # filter_events(source="response_sorted.json", dest="response_filtered.json")
    # count_events("response_filtered.json")

    events_by_project = classify_events("response_filtered.json")

    print(f"Hack Night count: {len(events_by_project["hack-night"])}")
    print(f"Workshops count: {len(events_by_project["workshops"])}")
    print(f"Callouts count: {len(events_by_project["callouts"])}")
    print(f"Unknown count: {len(events_by_project["unknown"])}")

    for event in events_by_project["unknown"]:
        print(f" - {event.get("name", "NAME FIELD NOT SET")}")


if __name__ == "__main__":
    main()
