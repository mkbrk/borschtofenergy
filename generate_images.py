import argparse
import base64
import json
import os
from pathlib import Path

from openai import OpenAI


ASPECT_TO_SIZE = {
    "square": "1024x1024",
    "landscape": "1536x1024",
    "portrait": "1024x1536",
}

DATA_FILE = Path(__file__).with_name("images.json")
OUTPUT_DIR = Path(__file__).parent / "assets" / "images"


def load_image_plan():
    if not DATA_FILE.exists():
        raise FileNotFoundError(f"Image plan JSON not found at {DATA_FILE}")
    with DATA_FILE.open("r", encoding="utf-8") as f:
        return json.load(f)


def determine_size(aspect):
    try:
        return ASPECT_TO_SIZE[aspect]
    except KeyError as exc:
        raise ValueError(f"Unsupported aspect '{aspect}'. Expected one of {list(ASPECT_TO_SIZE)}") from exc


def generate_image(client, image_spec):
    image_name = image_spec["image_name"]
    aspect = image_spec["aspect"]
    description = image_spec["description"]
    size = determine_size(aspect)

    print(f"Generating {image_name} ({aspect}, size {size})...")
    response = client.images.generate(
        model="gpt-image-1",
        prompt=description,
        size=size,
    )

    image_base64 = response.data[0].b64_json
    image_bytes = base64.b64decode(image_base64)

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    output_path = OUTPUT_DIR / image_name
    with output_path.open("wb") as f:
        f.write(image_bytes)
    print(f"Saved {output_path}")


def main():
    parser = argparse.ArgumentParser(description="Generate images via OpenAI image API")
    parser.add_argument("image_name", nargs="?", help="Optional specific image filename to generate")
    args = parser.parse_args()

    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise EnvironmentError("OPENAI_API_KEY environment variable is not set")

    client = OpenAI(api_key=api_key)

    image_plan = load_image_plan()

    if args.image_name:
        image_specs = [spec for spec in image_plan if spec["image_name"] == args.image_name]
        if not image_specs:
            raise ValueError(f"Image '{args.image_name}' not found in {DATA_FILE}")
    else:
        image_specs = image_plan

    for spec in image_specs:
        generate_image(client, spec)


if __name__ == "__main__":
    main()
