class AnnotationInterface {
    constructor() {
        this.videoList = [];
        this.currentVideoIndex = 0;
        this.annotations = [];
        this.currentMode = 1; // 1: 新規アノテーション, 2: ラベル付きアノテーション
        this.videoStartTime = null; // 動画開始時刻を記録
        this.videoLoadTime = null; // 動画読み込み完了時刻を記録
        this.selectionCount = 0; // 現在の動画での選択変更回数
        this.isFinished = false; // アノテーション完了フラグ
        this.init();
    }

    init() {
        this.bindEvents();
        this.updateUI();
        // data.csvを自動読み込み
        this.loadDataCSV();
        
        // 初期状態でダウンロードボタンを無効化・非表示
        const downloadBtn = document.getElementById('downloadBtn');
        downloadBtn.disabled = true;
        downloadBtn.textContent = '結果をダウンロード (0/0)';
        downloadBtn.style.display = 'none';
    }

    bindEvents() {
        // 操作ボタン
        document.getElementById('passBtn').addEventListener('click', () => {
            this.passVideo();
        });

        document.getElementById('nextBtn').addEventListener('click', () => {
            this.nextVideo();
        });

        // ダウンロードボタン
        document.getElementById('downloadBtn').addEventListener('click', () => {
            this.downloadResults();
        });

        // ビデオ読み込み完了時の自動再生
        const videoPlayer = document.getElementById('videoPlayer');
        videoPlayer.addEventListener('loadeddata', () => {
            // 動画データが読み込まれたら自動再生
            videoPlayer.play().catch(e => {
                console.log('自動再生に失敗しました（ブラウザの制限）:', e);
            });
            // アノテーション開始時刻と読み込み完了時刻を記録
            this.videoStartTime = new Date();
            this.videoLoadTime = new Date();
        });

        // 表情選択時
        document.querySelectorAll('input[name="emotion"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                // アノテーション完了後は変更を防ぐ
                if (this.isFinished) {
                    e.preventDefault();
                    e.target.checked = false;
                    return;
                }
                this.selectionCount++; // 選択変更回数をカウント
                this.saveAnnotation(e.target.value);
                this.updateUI(); // UI更新を追加
            });
        });
    }

    async loadDataCSV() {
        const dataStatus = document.getElementById('dataStatus');
        
        try {
            dataStatus.textContent = 'data.csvを読み込み中...';
            dataStatus.parentElement.className = 'data-status';
            
            const response = await fetch('data.csv');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const csvText = await response.text();
            this.parseCSV(csvText);
            
            dataStatus.textContent = `データ読み込み完了: ${this.videoList.length}件の動画`;
            dataStatus.parentElement.className = 'data-status loaded';
            
            if (this.videoList.length > 0) {
                this.loadVideo(0);
            }
            
        } catch (error) {
            console.error('data.csv読み込みエラー:', error);
            dataStatus.textContent = 'data.csvの読み込みに失敗しました。ファイルが存在するか確認してください。';
            dataStatus.parentElement.className = 'data-status error';
        }
    }

    parseCSV(csvText) {
        const lines = csvText.trim().split('\n');
        this.videoList = [];
        
        // ヘッダー行をスキップして処理
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (line) {
                // CSVの形式に応じて調整（例：ID,filepath,description,label）
                const columns = line.split(',');
                this.videoList.push({
                    id: columns[0] || `video_${i}`,
                    filepath: columns[1] || columns[0], // ファイルパスまたは最初の列
                    description: columns[2] || '',
                    existingLabel: columns[3] || null // 既存ラベル（モード2用）
                });
            }
        }

        // 空のCSVの場合は例示データを追加
        if (this.videoList.length === 0) {
            this.videoList = [
                { id: 'sample_1', filepath: 'path/to/video1.mp4', description: 'Sample video 1' },
                { id: 'sample_2', filepath: 'path/to/video2.mp4', description: 'Sample video 2' }
            ];
        }

        this.annotations = new Array(this.videoList.length).fill(null);
        this.currentVideoIndex = 0;
        this.updateUI();
    }

    loadVideo(index) {
        if (index < 0 || index >= this.videoList.length) return;

        this.currentVideoIndex = index;
        const video = this.videoList[index];
        const videoPlayer = document.getElementById('videoPlayer');
        const videoSource = document.getElementById('videoSource');

        // 前の選択をクリア
        this.clearEmotionSelection();

        // アノテーション開始時刻と選択回数をリセット
        this.videoStartTime = null;
        this.videoLoadTime = null;
        this.selectionCount = 0;

        // 保存されたアノテーションがあれば復元
        if (this.annotations[index]) {
            this.restoreAnnotation(this.annotations[index]);
        }

        // ビデオを読み込み
        videoSource.src = video.filepath;
        videoPlayer.load();

        // モード2の場合、既存ラベルを表示
        this.updateExistingLabelDisplay(video);

        this.updateUI();
    }

    saveAnnotation(emotion) {
        if (this.currentVideoIndex >= 0 && this.currentVideoIndex < this.videoList.length) {
            const endTime = new Date();
            const annotationTime = this.videoStartTime ? 
                ((endTime - this.videoStartTime) / 1000).toFixed(2) : null; // 秒単位
            
            this.annotations[this.currentVideoIndex] = {
                videoId: this.videoList[this.currentVideoIndex].id,
                emotion: emotion,
                timestamp: endTime.toISOString(),
                annotationTime: annotationTime, // アノテーション時間
                videoLoadTime: this.videoLoadTime ? this.videoLoadTime.toISOString() : null, // 動画読み込み完了時刻
                selectionCount: this.selectionCount, // 選択変更回数
                status: 'annotated'
            };
            
            // アノテーション後にUIを更新
            this.updateUI();
        }
    }

    restoreAnnotation(annotation) {
        if (annotation && annotation.emotion) {
            const radioButton = document.querySelector(`input[name="emotion"][value="${annotation.emotion}"]`);
            if (radioButton) {
                radioButton.checked = true;
            }
        }
    }

    clearEmotionSelection() {
        document.querySelectorAll('input[name="emotion"]').forEach(radio => {
            radio.checked = false;
        });
    }

    previousVideo() {
        // Previous機能は削除されました
        console.log('Previous機能は利用できません');
    }

    nextVideo() {
        // Nextボタンが押された時刻と時間を記録
        const nextTime = new Date();
        const nextButtonTime = this.videoStartTime ? 
            ((nextTime - this.videoStartTime) / 1000).toFixed(2) : null;
        
        // 現在のアノテーションにNextボタン情報を追加
        if (this.annotations[this.currentVideoIndex]) {
            this.annotations[this.currentVideoIndex].nextButtonTime = nextTime.toISOString();
            this.annotations[this.currentVideoIndex].timeToNext = nextButtonTime;
        }
        
        // 最後の動画の場合はダウンロードボタンを表示
        const isLastVideo = this.currentVideoIndex >= this.videoList.length - 1;
        if (isLastVideo) {
            // アノテーション完了フラグを設定
            this.isFinished = true;
            
            // Nextボタンを非表示にしてダウンロードボタンを表示
            const nextBtn = document.getElementById('nextBtn');
            nextBtn.style.display = 'none';
            
            // PASSボタンを無効化
            const passBtn = document.getElementById('passBtn');
            passBtn.disabled = true;
            
            // 感情選択ボタンを全て無効化
            document.querySelectorAll('input[name="emotion"]').forEach(radio => {
                radio.disabled = true;
            });
            
            const downloadBtn = document.getElementById('downloadBtn');
            downloadBtn.style.display = 'inline-block';
            downloadBtn.disabled = false;
            downloadBtn.textContent = '結果をダウンロード';
        } else {
            // 通常の次の動画への移動
            if (this.currentVideoIndex < this.videoList.length - 1) {
                this.loadVideo(this.currentVideoIndex + 1);
            }
        }
        
        this.updateUI(); // UI更新を追加
    }

    passVideo() {
        // アノテーション完了後はパス操作を防ぐ
        if (this.isFinished) {
            return;
        }
        
        // パス処理
        const endTime = new Date();
        const annotationTime = this.videoStartTime ? 
            ((endTime - this.videoStartTime) / 1000).toFixed(2) : null; // 秒単位
        
        this.annotations[this.currentVideoIndex] = {
            videoId: this.videoList[this.currentVideoIndex].id,
            emotion: 'pass',
            timestamp: endTime.toISOString(),
            annotationTime: annotationTime, // アノテーション時間
            videoLoadTime: this.videoLoadTime ? this.videoLoadTime.toISOString() : null, // 動画読み込み完了時刻
            selectionCount: this.selectionCount, // 選択変更回数（Passの場合は通常0）
            status: 'passed'
        };

        // 次のビデオに進む（passVideoでは自動的に次に進むのでnextVideoを呼ぶ）
        this.nextVideo();
    }

    updateUI() {
        // 進捗表示
        const videoCounter = document.getElementById('videoCounter');
        const progressFill = document.getElementById('progressFill');
        const nextBtn = document.getElementById('nextBtn');
        const downloadBtn = document.getElementById('downloadBtn');

        if (this.videoList.length > 0) {
            videoCounter.textContent = `${this.currentVideoIndex + 1} / ${this.videoList.length}`;
            const progress = ((this.currentVideoIndex + 1) / this.videoList.length) * 100;
            progressFill.style.width = `${progress}%`;
        } else {
            videoCounter.textContent = '0 / 0';
            progressFill.style.width = '0%';
        }

        // NEXTボタンの制御：選択肢が選択されているかチェック
        const currentAnnotation = this.annotations[this.currentVideoIndex];
        const hasSelection = currentAnnotation && (currentAnnotation.emotion !== undefined);
        const isLastVideo = this.currentVideoIndex >= this.videoList.length - 1;
        
        // 最後の動画の場合はFinishボタンに変更
        if (isLastVideo) {
            nextBtn.textContent = 'Finish';
            nextBtn.disabled = !hasSelection;
        } else {
            nextBtn.textContent = 'Next';
            nextBtn.disabled = !hasSelection;
        }

        // ダウンロードボタンの制御：全てのアノテーションが完了しているかチェック
        const allAnnotated = this.videoList.length > 0 && this.annotations.every((annotation, index) => 
            annotation && (annotation.status === 'annotated' || annotation.status === 'passed')
        );
        
        // アノテーション完了数の計算
        const completedCount = this.annotations.filter(annotation => 
            annotation && (annotation.status === 'annotated' || annotation.status === 'passed')
        ).length;
        
        // 最後の動画でFinishボタンが押されるまでダウンロードボタンを非表示
        const isLastVideoFinished = isLastVideo && allAnnotated;
        if (!isLastVideoFinished) {
            downloadBtn.style.display = 'none';
        }
        
        // ダウンロードボタンのテキストを動的に変更（表示される場合のみ）
        if (downloadBtn.style.display !== 'none') {
            if (this.videoList.length === 0) {
                downloadBtn.textContent = '結果をダウンロード';
            } else if (allAnnotated) {
                downloadBtn.textContent = '結果をダウンロード';
            } else {
                downloadBtn.textContent = `結果をダウンロード (${completedCount}/${this.videoList.length})`;
            }
        }
    }

    downloadResults() {
        // 全てのアノテーションが完了しているかチェック
        const allAnnotated = this.videoList.length > 0 && this.annotations.every((annotation, index) => 
            annotation && (annotation.status === 'annotated' || annotation.status === 'passed')
        );
        
        if (!allAnnotated) {
            alert('全ての動画のアノテーションを完了してください。');
            return;
        }

        if (this.annotations.length === 0) {
            alert('アノテーションデータがありません。');
            return;
        }

        // CSVフォーマットで結果を作成（新しいフィールドを追加）
        let csvContent = 'Video ID,File Path,Emotion,Status,Timestamp,Annotation Time (seconds),Video Load Time,Selection Count,Next Button Time,Time to Next (seconds)\n';
        
        this.annotations.forEach((annotation, index) => {
            const video = this.videoList[index];
            if (annotation) {
                const annotationTime = annotation.annotationTime || '';
                const videoLoadTime = annotation.videoLoadTime || '';
                const selectionCount = annotation.selectionCount || 0;
                const nextButtonTime = annotation.nextButtonTime || '';
                const timeToNext = annotation.timeToNext || '';
                csvContent += `"${annotation.videoId}","${video.filepath}","${annotation.emotion}","${annotation.status}","${annotation.timestamp}","${annotationTime}","${videoLoadTime}","${selectionCount}","${nextButtonTime}","${timeToNext}"\n`;
            } else {
                csvContent += `"${video.id}","${video.filepath}","","not_annotated","","","","","",""\n`;
            }
        });

        // ダウンロード
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `emotion_annotations_${new Date().getTime()}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    updateExistingLabelDisplay(video) {
        const existingLabelSection = document.getElementById('existingLabelSection');
        const existingLabelElement = document.getElementById('existingLabel');
        const labelSourceElement = document.getElementById('labelSource');

        if (this.currentMode === 2) {
            existingLabelSection.style.display = 'block';
            
            if (video.existingLabel && video.existingLabel.trim() !== '') {
                const emotionMap = {
                    'angry': '😠 怒り (Angry)',
                    'disgust': '🤢 嫌悪 (Disgust)',
                    'fear': '😨 恐怖 (Fear)',
                    'happy': '😊 幸福 (Happy)',
                    'sad': '😢 悲しみ (Sad)',
                    'surprise': '😲 驚き (Surprise)',
                    'neutral': '😐 中立 (Neutral)'
                };
                
                existingLabelElement.textContent = emotionMap[video.existingLabel] || video.existingLabel;
                existingLabelElement.className = `label-emotion ${video.existingLabel}`;
                labelSourceElement.textContent = `(CSVファイルより)`;
            } else {
                existingLabelElement.textContent = 'ラベルなし';
                existingLabelElement.className = 'label-emotion';
                labelSourceElement.textContent = '';
            }
        } else {
            existingLabelSection.style.display = 'none';
        }
    }

    setMode(mode) {
        this.currentMode = mode;
        const modeText = document.getElementById('currentModeText');
        
        if (mode === 1) {
            modeText.textContent = 'モード1: 新規アノテーション';
        } else {
            modeText.textContent = 'モード2: ラベル付きアノテーション';
        }
        
        // 現在のビデオがあれば既存ラベル表示を更新
        if (this.videoList.length > 0 && this.currentVideoIndex >= 0) {
            this.updateExistingLabelDisplay(this.videoList[this.currentVideoIndex]);
        }
    }

    // キーボードショートカット
    handleKeyPress(event) {
        switch(event.key) {
            case 'ArrowRight':
                this.nextVideo();
                break;
            case ' ':
                event.preventDefault();
                this.passVideo();
                break;
            case '1':
                document.querySelector('input[value="angry"]').click();
                break;
            case '2':
                document.querySelector('input[value="disgust"]').click();
                break;
            case '3':
                document.querySelector('input[value="fear"]').click();
                break;
            case '4':
                document.querySelector('input[value="happy"]').click();
                break;
            case '5':
                document.querySelector('input[value="sad"]').click();
                break;
            case '6':
                document.querySelector('input[value="surprise"]').click();
                break;
            case '7':
                document.querySelector('input[value="neutral"]').click();
                break;
        }
    }
}

// グローバル関数（モード選択用）
function selectMode(mode) {
    const app = window.annotationApp;
    app.setMode(mode);
    
    // メインインターフェースを表示
    document.getElementById('modeSelection').style.display = 'none';
    document.getElementById('mainInterface').style.display = 'block';
}

// アプリケーション初期化
document.addEventListener('DOMContentLoaded', () => {
    window.annotationApp = new AnnotationInterface();
    
    // キーボードショートカット
    document.addEventListener('keydown', (e) => {
        window.annotationApp.handleKeyPress(e);
    });
});

// サンプルCSVデータを生成する関数（デモ用）
function generateSampleCSV() {
    const sampleData = `ID,FilePath,Description
video_001,videos/sample1.mp4,Sample emotion video 1
video_002,videos/sample2.mp4,Sample emotion video 2
video_003,videos/sample3.mp4,Sample emotion video 3
video_004,videos/sample4.mp4,Sample emotion video 4
video_005,videos/sample5.mp4,Sample emotion video 5`;
    
    const blob = new Blob([sampleData], { type: 'text/csv' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'sample_video_list.csv';
    link.click();
}
