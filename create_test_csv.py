#!/usr/bin/env python3
import csv
import random

def create_test_csv():
    # 元のdata.csvから読み込み
    original_file = "/Users/ashidaatsushi/annotation_interface/data.csv"
    test_file = "/Users/ashidaatsushi/annotation_interface/data_test.csv"
    
    # 感情別にデータを分類
    emotion_data = {
        'angry': [],
        'disgust': [],
        'fear': [],
        'happy': [],
        'neutral': [],
        'sad': [],
        'surprise': []
    }
    
    # 元のCSVファイルを読み込み
    with open(original_file, 'r', encoding='utf-8') as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            emotion = row['Label']
            if emotion in emotion_data:
                emotion_data[emotion].append(row)
    
    # 各感情から3動画ずつランダム選択（3×7=21動画）
    selected_videos = []
    videos_per_emotion = 3
    
    for emotion, videos in emotion_data.items():
        if len(videos) >= videos_per_emotion:
            selected = random.sample(videos, videos_per_emotion)
            selected_videos.extend(selected)
        else:
            # 利用可能な全動画を選択
            selected_videos.extend(videos)
    
    # IDを振り直し
    for i, video in enumerate(selected_videos, 1):
        video['ID'] = f"video_{i:03d}"
    
    # テスト用CSVファイルに書き込み
    with open(test_file, 'w', newline='', encoding='utf-8') as csvfile:
        fieldnames = ['ID', 'FilePath', 'Description', 'Label']
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        
        # ヘッダーを書き込み
        writer.writeheader()
        
        # データを書き込み
        for video in selected_videos:
            writer.writerow(video)
    
    print(f"テスト用data.csv作成完了!")
    print(f"ファイル名: data_test.csv")
    print(f"総動画数: {len(selected_videos)}")
    
    # 感情別の統計を表示
    emotion_counts = {}
    for video in selected_videos:
        emotion = video['Label']
        emotion_counts[emotion] = emotion_counts.get(emotion, 0) + 1
    
    print("\n感情別動画数:")
    for emotion, count in sorted(emotion_counts.items()):
        print(f"  {emotion}: {count}動画")

if __name__ == "__main__":
    create_test_csv()
