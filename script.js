class AnnotationInterface {
    constructor() {
        this.videoList = [];
        this.currentVideoIndex = 0;
        this.annotations = [];
        this.init();
    }

    init() {
        this.bindEvents();
        this.updateUI();
    }

    bindEvents() {
        // CSVファイル読み込み
        document.getElementById('csvFile').addEventListener('change', (e) => {
            this.loadCSVFile(e.target.files[0]);
        });

        // 操作ボタン
        document.getElementById('prevBtn').addEventListener('click', () => {
            this.previousVideo();
        });

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

        // ビデオ読み込み完了時（バウンディングボックス機能削除）

        // 表情選択時
        document.querySelectorAll('input[name="emotion"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.saveAnnotation(e.target.value);
            });
        });
    }

    async loadCSVFile(file) {
        if (!file) return;

        try {
            const text = await file.text();
            this.parseCSV(text);
            document.getElementById('csvFileName').textContent = file.name;
            this.loadVideo(0);
        } catch (error) {
            alert('CSVファイルの読み込みに失敗しました: ' + error.message);
        }
    }

    parseCSV(csvText) {
        const lines = csvText.trim().split('\n');
        this.videoList = [];
        
        // ヘッダー行をスキップして処理
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (line) {
                // CSVの形式に応じて調整（例：ID,filepath,description）
                const columns = line.split(',');
                this.videoList.push({
                    id: columns[0] || `video_${i}`,
                    filepath: columns[1] || columns[0], // ファイルパスまたは最初の列
                    description: columns[2] || ''
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

        // 保存されたアノテーションがあれば復元
        if (this.annotations[index]) {
            this.restoreAnnotation(this.annotations[index]);
        }

        // ビデオを読み込み
        videoSource.src = video.filepath;
        videoPlayer.load();

        this.updateUI();
    }

    saveAnnotation(emotion) {
        if (this.currentVideoIndex >= 0 && this.currentVideoIndex < this.videoList.length) {
            this.annotations[this.currentVideoIndex] = {
                videoId: this.videoList[this.currentVideoIndex].id,
                emotion: emotion,
                timestamp: new Date().toISOString(),
                status: 'annotated'
            };
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
        if (this.currentVideoIndex > 0) {
            this.loadVideo(this.currentVideoIndex - 1);
        }
    }

    nextVideo() {
        if (this.currentVideoIndex < this.videoList.length - 1) {
            this.loadVideo(this.currentVideoIndex + 1);
        }
    }

    passVideo() {
        // パス処理
        this.annotations[this.currentVideoIndex] = {
            videoId: this.videoList[this.currentVideoIndex].id,
            emotion: 'pass',
            timestamp: new Date().toISOString(),
            status: 'passed'
        };

        // 次のビデオに進む
        this.nextVideo();
    }

    updateUI() {
        // 進捗表示
        const videoCounter = document.getElementById('videoCounter');
        const progressFill = document.getElementById('progressFill');
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');

        if (this.videoList.length > 0) {
            videoCounter.textContent = `${this.currentVideoIndex + 1} / ${this.videoList.length}`;
            const progress = ((this.currentVideoIndex + 1) / this.videoList.length) * 100;
            progressFill.style.width = `${progress}%`;
        } else {
            videoCounter.textContent = '0 / 0';
            progressFill.style.width = '0%';
        }

        // ボタンの有効/無効
        prevBtn.disabled = this.currentVideoIndex <= 0;
        nextBtn.disabled = this.currentVideoIndex >= this.videoList.length - 1;
    }

    downloadResults() {
        if (this.annotations.length === 0) {
            alert('アノテーションデータがありません。');
            return;
        }

        // CSVフォーマットで結果を作成
        let csvContent = 'Video ID,File Path,Emotion,Status,Timestamp\n';
        
        this.annotations.forEach((annotation, index) => {
            const video = this.videoList[index];
            if (annotation) {
                csvContent += `"${annotation.videoId}","${video.filepath}","${annotation.emotion}","${annotation.status}","${annotation.timestamp}"\n`;
            } else {
                csvContent += `"${video.id}","${video.filepath}","","not_annotated",""\n`;
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

    // キーボードショートカット
    handleKeyPress(event) {
        switch(event.key) {
            case 'ArrowLeft':
                this.previousVideo();
                break;
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

// アプリケーション初期化
document.addEventListener('DOMContentLoaded', () => {
    const app = new AnnotationInterface();
    
    // キーボードショートカット
    document.addEventListener('keydown', (e) => {
        app.handleKeyPress(e);
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
