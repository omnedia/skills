"""Inspect an actual MOV alpha plane and save light/dark composites. Requires Pillow."""
import argparse
import json
import subprocess
from io import BytesIO
from pathlib import Path
from PIL import Image


def verify(movie, project, output, time_seconds=None):
    data = json.loads(Path(project).read_text(encoding="utf-8-sig"))
    settings = data["settings"]
    info = json.loads(subprocess.check_output(["ffprobe", "-v", "error", "-show_streams", "-show_format", "-of", "json", str(movie)]))
    streams = info["streams"]
    video = next(s for s in streams if s["codec_type"] == "video")
    assert not any(s["codec_type"] == "audio" for s in streams), "Overlay must be silent"
    assert video["codec_name"] == "prores" and str(video["profile"]) in ("4444", "4") and video["codec_tag_string"] == "ap4h", video
    assert video["pix_fmt"].startswith("yuva444p"), "Missing alpha pixel format"
    scale = settings.get("export", {}).get("scale", 1)
    assert (video["width"], video["height"]) == (settings["width"] * scale, settings["height"] * scale)
    num, den = map(int, video["r_frame_rate"].split("/"))
    assert abs(num / den - settings["fps"]) < 0.001
    assert abs(float(video["duration"]) - settings["durationInFrames"] / settings["fps"]) <= 1 / settings["fps"]
    first = data["sentences"][0]["words"][0]
    moment = time_seconds if time_seconds is not None else (first["startMs"] + first["endMs"]) / 2000 + settings["sourceOffsetMs"] / 1000
    png = subprocess.check_output(["ffmpeg", "-v", "error", "-ss", str(moment), "-i", str(movie), "-frames:v", "1", "-f", "image2pipe", "-vcodec", "png", "-pix_fmt", "rgba", "-"])
    image = Image.open(BytesIO(png)).convert("RGBA")
    extrema = image.getchannel("A").getextrema()
    assert extrema[0] == 0 and extrema[1] > 0, f"Actual decoded alpha is empty or opaque: {extrema}"
    assert any(0 < x < 255 for x in image.getchannel("A").getdata()), "No antialiased/faded edge samples"
    output = Path(output)
    output.mkdir(parents=True, exist_ok=True)
    image.save(output / "alpha-frame.png")
    for name, color in [("light", "#EEEEEE"), ("dark", "#14151B")]:
        bg = Image.new("RGBA", image.size, color)
        Image.alpha_composite(bg, image).convert("RGB").save(output / f"composite-{name}.png")
    report = {"codec": video["codec_name"], "profile": video["profile"], "pixelFormat": video["pix_fmt"],
              "duration": video["duration"], "fps": num / den, "alphaExtrema": extrema,
              "width": video["width"], "height": video["height"], "scale": scale,
              "timelinePlacementMs": settings["timelinePlacementMs"], "sampleSeconds": moment}
    (output / "verification.json").write_text(json.dumps(report, indent=2))
    print(json.dumps(report))
    return report


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("movie")
    parser.add_argument("project")
    parser.add_argument("output")
    parser.add_argument("--time", type=float)
    args = parser.parse_args()
    verify(args.movie, args.project, args.output, args.time)
