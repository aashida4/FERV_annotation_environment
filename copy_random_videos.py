#!/usr/bin/env python3
import os
import shutil
import random
from pathlib import Path

def copy_random_videos():
    source_dir = Path("/Volumes/Research/FERV39k/0_7_LabelClips/")
    dest_dir = Path("/Users/ashidaatsushi/annotation_interface/data")
    
    # 感情ラベルのリスト
    emotions = ["Angry", "Disgust", "Fear", "Happy", "Neutral", "Sad", "Surprise"]
    
    # 各動画から取得する動画数
    videos_per_emotion = 10
    
    # 統計情報を格納
    stats = {}
    total_copied = 0
    
    print("ランダム動画コピーを開始します...")
    print(f"各感情から{videos_per_emotion}動画ずつコピーします\n")
    
    # 各フォルダを処理
    for category_folder in source_dir.iterdir():
        if category_folder.is_dir() and not category_folder.name.startswith('.'):
            category_name = category_folder.name
            print(f"処理中: {category_name}")
            
            stats[category_name] = {}
            
            # 各感情フォルダを処理
            for emotion in emotions:
                emotion_path = category_folder / emotion
                if emotion_path.exists() and emotion_path.is_dir():
                    # ビデオファイルを取得
                    video_files = [f for f in emotion_path.iterdir() 
                                 if f.is_file() and f.suffix.lower() in ['.mp4', '.avi', '.mov']]
                    
                    # ランダムに選択（利用可能な動画数が10未満の場合は全部選択）
                    num_to_copy = min(videos_per_emotion, len(video_files))
                    selected_videos = random.sample(video_files, num_to_copy)
                    
                    # 目的地ディレクトリを作成
                    dest_emotion_dir = dest_dir / category_name / emotion
                    dest_emotion_dir.mkdir(parents=True, exist_ok=True)
                    
                    # ファイルをコピー
                    copied_count = 0
                    for video_file in selected_videos:
                        dest_file = dest_emotion_dir / video_file.name
                        try:
                            shutil.copy2(video_file, dest_file)
                            copied_count += 1
                        except Exception as e:
                            print(f"  エラー: {video_file} をコピーできませんでした: {e}")
                    
                    stats[category_name][emotion] = {
                        'available': len(video_files),
                        'copied': copied_count
                    }
                    total_copied += copied_count
                    
                    print(f"  {emotion}: {copied_count}/{len(video_files)} 動画をコピー")
                else:
                    stats[category_name][emotion] = {
                        'available': 0,
                        'copied': 0
                    }
                    print(f"  {emotion}: フォルダが見つかりません")
            
            print()  # 空行
    
    # 統計情報を表示
    print("=" * 60)
    print("コピー完了統計:")
    print("=" * 60)
    
    for category, emotions_data in stats.items():
        print(f"\n{category}:")
        for emotion, data in emotions_data.items():
            print(f"  {emotion}: {data['copied']}/{data['available']} 動画")
    
    print(f"\n総コピー数: {total_copied} 動画")
    print(f"コピー先: {dest_dir}")

if __name__ == "__main__":
    copy_random_videos()
