# pip install python-frontmatter
import frontmatter
from pathlib import Path

for event_file_path in Path(".").glob("**/*.md"):
    with event_file_path.open("r", encoding="utf-8") as event_file:
        event_frontmatter = frontmatter.load(event_file_path)

    if "images" in event_frontmatter.metadata:
        del event_frontmatter.metadata["images"]

        with event_file_path.open("wb") as event_file:
            frontmatter.dump(event_frontmatter, event_file)

        print(f"Removed images field from {event_file_path}")

print("Done!")
