import os


def process_frontmatter(lines):
    in_frontmatter = False
    in_images = False
    new_lines = []
    for line in lines:
        if line.strip() == "---":
            in_frontmatter = not in_frontmatter
            new_lines.append(line)
            continue

        if in_frontmatter:
            if line.strip() == "images:":
                in_images = True
                new_lines.append(line)
                continue

            if in_images:
                if line.strip().startswith("- "):
                    img_path = line[2:]
                    new_img_path = f'./images/{img_path}'
                    new_lines.append(f"- {new_img_path}\n")
                    continue
                else:
                    in_images = False
        new_lines.append(line)
    return new_lines


def process_file(filepath):
    with open(filepath, "r", encoding="utf-8") as f:
        lines = f.readlines()
    new_lines = process_frontmatter(lines)
    if new_lines != lines:
        with open(filepath, "w", encoding="utf-8") as f:
            f.writelines(new_lines)
        print(f"Updated event at {filepath}")


def main():
    for root, _, files in os.walk("."):
        for file in files:
            if file.endswith(".md"):
                process_file(os.path.join(root, file))


if __name__ == "__main__":
    main()
