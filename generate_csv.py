#!/usr/bin/env python3
import os
import csv
from pathlib import Path

def create_data_csv():
    data_dir = Path("/Users/ashidaatsushi/annotation_interface/data")
    csv_file = Path("/Users/ashidaatsushi/annotation_interface/data.csv")
    
    # CSVデータを格納するリスト
    video_data = []
    video_id = 1
    
    print("data.csvを生成中...")
    
    # 各カテゴリフォルダを処理
    for category_folder in sorted(data_dir.iterdir()):
        if category_folder.is_dir() and not category_folder.name.startswith('.'):
            category_name = category_folder.name
            print(f"処理中: {category_name}")
            
            # 各感情フォルダを処理
            for emotion_folder in sorted(category_folder.iterdir()):
                if emotion_folder.is_dir():
                    emotion_name = emotion_folder.name.lower()  # 小文字に統一
                    
                    # 各動画ファイルを処理
                    for video_file in sorted(emotion_folder.iterdir()):
                        if video_file.is_file() and video_file.suffix.lower() in ['.mp4', '.avi', '.mov']:
                            # 相対パスを作成
                            relative_path = f"data/{category_name}/{emotion_name}/{video_file.name}"
                            
                            # 説明文を作成
                            description = f"{category_name} - {emotion_name} emotion video"
                            
                            # データを追加
                            video_data.append({
                                'ID': f"video_{video_id:04d}",
                                'FilePath': relative_path,
                                'Description': description,
                                'Label': emotion_name
                            })
                            
                            video_id += 1
    
    # CSVファイルに書き込み
    with open(csv_file, 'w', newline='', encoding='utf-8') as csvfile:
        fieldnames = ['ID', 'FilePath', 'Description', 'Label']
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        
        # ヘッダーを書き込み
        writer.writeheader()
        
        # データを書き込み
        for row in video_data:
            writer.writerow(row)
    
    print(f"\ndata.csv作成完了!")
    print(f"総動画数: {len(video_data)}")
    print(f"保存先: {csv_file}")
    
    # 感情別の統計を表示
    emotion_counts = {}
    for data in video_data:
        emotion = data['Label']
        emotion_counts[emotion] = emotion_counts.get(emotion, 0) + 1
    
    print("\n感情別動画数:")
    for emotion, count in sorted(emotion_counts.items()):
        print(f"  {emotion}: {count}動画")

if __name__ == "__main__":
    create_data_csv()
