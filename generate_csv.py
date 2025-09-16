#!/usr/bin/env python3
import csv
from pathlib import Path

BASE_DIR = Path("/Users/ashidaatsushi/annotation_interface")
DATA_DIR = BASE_DIR / "data"
MODE1_CSV = BASE_DIR / "data_mode1.csv"  # ラベル無し
MODE2_CSV = BASE_DIR / "data_mode2.csv"  # ラベル有り


def collect_video_entries():
    video_entries = []
    video_id = 1
    for category_folder in sorted(DATA_DIR.iterdir()):
        if category_folder.is_dir() and not category_folder.name.startswith('.'):
            category_name = category_folder.name
            for emotion_folder in sorted(category_folder.iterdir()):
                if emotion_folder.is_dir():
                    emotion_name = emotion_folder.name.lower()
                    for video_file in sorted(emotion_folder.iterdir()):
                        if video_file.is_file() and video_file.suffix.lower() in ['.mp4', '.avi', '.mov']:
                            relative_path = f"data/{category_name}/{emotion_name}/{video_file.name}"
                            description = f"{category_name} - {emotion_name} emotion video"
                            video_entries.append({
                                'ID': f"video_{video_id:04d}",
                                'FilePath': relative_path,
                                'Description': description,
                                'Label': emotion_name
                            })
                            video_id += 1
    return video_entries


def write_mode1_csv(entries):
    with open(MODE1_CSV, 'w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        writer.writerow(['ID', 'FilePath', 'Description'])
        for e in entries:
            writer.writerow([e['ID'], e['FilePath'], e['Description']])


def write_mode2_csv(entries):
    with open(MODE2_CSV, 'w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        writer.writerow(['ID', 'FilePath', 'Description', 'Label'])
        for e in entries:
            writer.writerow([e['ID'], e['FilePath'], e['Description'], e['Label']])


def print_stats(entries):
    print(f"総動画数: {len(entries)}")
    emotion_counts = {}
    for e in entries:
        emotion = e['Label']
        emotion_counts[emotion] = emotion_counts.get(emotion, 0) + 1
    print("感情別動画数:")
    for emotion, count in sorted(emotion_counts.items()):
        print(f"  {emotion}: {count}動画")


def create_dual_csv():
    print("動画リスト収集中...")
    entries = collect_video_entries()
    if not entries:
        print("動画が見つかりません。dataディレクトリを確認してください。")
        return
    print("CSV出力中...")
    write_mode1_csv(entries)
    write_mode2_csv(entries)
    print("\n生成完了:")
    print(f"  Mode1: {MODE1_CSV}")
    print(f"  Mode2: {MODE2_CSV}")
    print()
    print_stats(entries)


if __name__ == "__main__":
    create_dual_csv()
