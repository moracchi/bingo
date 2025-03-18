document.addEventListener('DOMContentLoaded', function() {
    // DOM要素の取得
    const numberDisplay = document.getElementById('numberDisplay');
    const numberHistory = document.getElementById('numberHistory');
    
    // 変数の初期化
    let availableNumbers = Array.from({length: 99}, (_, i) => i + 1); // 1から99までの数字
    let drawnNumbers = []; // 既に選ばれた数字
    let isAnimating = false; // アニメーション実行中フラグ
    
    // アニメーションの種類と対応する効果音
    const animationTypes = [
        {
            name: '落下爆発演出',
            className: 'fall-animation',
            duration: 3000, // 3秒
        },
        {
            name: '高速回転演出',
            className: 'slide-animation',
            duration: 3000, // 3秒
        },
        {
            name: 'ビッグスロット演出',
            className: 'slot-animation',
            duration: 5000, // 5秒
        },
        {
            name: '爆発フラッシュ演出',
            className: 'explosion-animation',
            duration: 4000, // 4秒
        },
        {
            name: '金色キラキラ演出',
            className: 'golden-animation',
            duration: 3500, // 3.5秒
        },
        {
            name: '虹色トランジション演出',
            className: 'rainbow-animation',
            duration: 4500, // 4.5秒
        },
        {
            name: 'バウンス演出',
            className: 'bounce-animation',
            duration: 3200, // 3.2秒
        },
        {
            name: '稲妻エフェクト演出',
            className: 'lightning-animation',
            duration: 3800, // 3.8秒
        }
    ];
    
    // 効果音を再生する関数
    function playSound() {
        // 既存のオーディオ要素があれば停止
        const existingAudio = document.getElementById('effectSound');
        if (existingAudio) {
            existingAudio.pause();
            document.body.removeChild(existingAudio);
        }
        
        // 新しいオーディオ要素を作成
        const audio = document.createElement('audio');
        audio.id = 'effectSound';
        audio.src = 'sounds/sound.mp3';
        
        // 再生設定
        audio.volume = 1.0;
        document.body.appendChild(audio);
        
        // 再生を試みる
        const playPromise = audio.play();
        
        // エラーハンドリング
        if (playPromise !== undefined) {
            playPromise.catch(error => {
                console.error('音声再生エラー:', error);
                // 自動再生に失敗した場合、ユーザージェスチャーを待つオプションを表示
                const playButton = document.createElement('button');
                playButton.textContent = '効果音を再生';
                playButton.style.position = 'fixed';
                playButton.style.top = '10px';
                playButton.style.right = '10px';
                playButton.style.zIndex = '9999';
                playButton.onclick = function() {
                    audio.play();
                    document.body.removeChild(playButton);
                };
                document.body.appendChild(playButton);
            });
        }
    }
    
    // よりスロットらしい演出にするためのランダム数表示関数
    function showSlotNumbers(duration, finalNumber, callback) {
        const startTime = Date.now();
        const endTime = startTime + duration;
        let phase = 0; // 0: 高速ランダム, 1: 近い数字を表示, 2: 最終確定
        let phaseChangeTime1 = startTime + (duration * 0.5); // フェーズ1への切り替え時間
        let phaseChangeTime2 = startTime + (duration * 0.8); // フェーズ2への切り替え時間
        
        function updateNumber() {
            const now = Date.now();
            if (now < endTime) {
                let displayNumber;
                
                if (now < phaseChangeTime1) {
                    // フェーズ0: 完全ランダム (1-99)
                    displayNumber = Math.floor(Math.random() * 99) + 1;
                } else if (now < phaseChangeTime2) {
                    // フェーズ1: 最終数字に近い数字を表示 (finalNumber ± 10以内)
                    const range = Math.max(10 - Math.floor((now - phaseChangeTime1) / (phaseChangeTime2 - phaseChangeTime1) * 8), 2);
                    const min = Math.max(1, finalNumber - range);
                    const max = Math.min(99, finalNumber + range);
                    displayNumber = min + Math.floor(Math.random() * (max - min + 1));
                } else {
                    // フェーズ2: さらに近い数字 (finalNumber ± 2以内)
                    const min = Math.max(1, finalNumber - 2);
                    const max = Math.min(99, finalNumber + 2);
                    displayNumber = min + Math.floor(Math.random() * (max - min + 1));
                }
                
                numberDisplay.textContent = displayNumber;
                
                // 更新頻度を徐々に遅くする
                const progress = (now - startTime) / duration;
                let delay;
                
                if (now < phaseChangeTime1) {
                    delay = 50; // 高速フェーズは一定速度
                } else if (now < phaseChangeTime2) {
                    delay = 50 + Math.floor((now - phaseChangeTime1) / (phaseChangeTime2 - phaseChangeTime1) * 150);
                } else {
                    delay = 200 + Math.floor((now - phaseChangeTime2) / (endTime - phaseChangeTime2) * 300);
                }
                
                setTimeout(updateNumber, delay);
            } else {
                // 最終的に選ばれた数字を表示
                numberDisplay.textContent = finalNumber;
                callback(); // アニメーション終了時のコールバック
            }
        }
        
        updateNumber();
    }
    
    // エフェクト生成関数
    function createEffects(type) {
        const lotteryStage = document.querySelector('.lottery-stage');
        
        if (type === '爆発フラッシュ演出') {
            // 爆発エフェクト要素を作成
            for (let i = 0; i < 50; i++) {
                const particle = document.createElement('div');
                particle.className = 'explosion-particle';
                
                // ランダムなスタイルを設定
                particle.style.position = 'absolute';
                particle.style.width = Math.random() * 15 + 5 + 'px';
                particle.style.height = particle.style.width;
                particle.style.backgroundColor = `hsl(${Math.random() * 60 + 10}, 100%, 50%)`;
                particle.style.borderRadius = '50%';
                particle.style.left = '50%';
                particle.style.top = '50%';
                particle.style.transform = 'translate(-50%, -50%)';
                particle.style.opacity = Math.random() * 0.5 + 0.5;
                
                // アニメーション設定
                const angle = Math.random() * Math.PI * 2;
                const speed = Math.random() * 300 + 100;
                const x = Math.cos(angle) * speed;
                const y = Math.sin(angle) * speed;
                
                particle.animate([
                    { transform: 'translate(-50%, -50%)', opacity: 1 },
                    { transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`, opacity: 0 }
                ], {
                    duration: Math.random() * 1000 + 1000,
                    easing: 'cubic-bezier(0,.9,.57,1)',
                    fill: 'forwards'
                });
                
                lotteryStage.appendChild(particle);
                
                // アニメーション終了後に要素を削除
                setTimeout(() => {
                    if (lotteryStage.contains(particle)) {
                        lotteryStage.removeChild(particle);
                    }
                }, 2000);
            }
        } else if (type === '金色キラキラ演出') {
            // 金色キラキラエフェクト
            for (let i = 0; i < 30; i++) {
                const star = document.createElement('div');
                star.className = 'star-particle';
                
                // 星型の設定
                star.style.position = 'absolute';
                star.style.width = Math.random() * 20 + 10 + 'px';
                star.style.height = star.style.width;
                star.style.backgroundColor = '#FFD700';
                star.style.clip = 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)';
                star.style.left = Math.random() * 100 + '%';
                star.style.top = Math.random() * 100 + '%';
                star.style.opacity = Math.random() * 0.5 + 0.5;
                
                // アニメーション設定
                star.animate([
                    { transform: 'scale(0) rotate(0deg)', opacity: 0 },
                    { transform: 'scale(1) rotate(180deg)', opacity: 1, offset: 0.5 },
                    { transform: 'scale(0) rotate(360deg)', opacity: 0 }
                ], {
                    duration: Math.random() * 1500 + 1500,
                    easing: 'ease-in-out',
                    fill: 'forwards'
                });
                
                lotteryStage.appendChild(star);
                
                // アニメーション終了後に要素を削除
                setTimeout(() => {
                    if (lotteryStage.contains(star)) {
                        lotteryStage.removeChild(star);
                    }
                }, 3000);
            }
        } else if (type === '稲妻エフェクト演出') {
            // 稲妻エフェクト
            const flash = document.createElement('div');
            flash.className = 'lightning-flash';
            flash.style.position = 'absolute';
            flash.style.width = '100%';
            flash.style.height = '100%';
            flash.style.backgroundColor = 'white';
            flash.style.opacity = '0';
            flash.style.zIndex = '5';
            
            lotteryStage.appendChild(flash);
            
            // フラッシュアニメーション
            flash.animate([
                { opacity: 0 },
                { opacity: 0.9, offset: 0.1 },
                { opacity: 0.1, offset: 0.2 },
                { opacity: 0.8, offset: 0.3 },
                { opacity: 0, offset: 0.4 },
                { opacity: 0.6, offset: 0.5 },
                { opacity: 0, offset: 0.6 }
            ], {
                duration: 1000,
                fill: 'forwards'
            });
            
            // 稲妻の線を描画
            for (let i = 0; i < 3; i++) {
                setTimeout(() => {
                    const lightning = document.createElement('div');
                    lightning.className = 'lightning-line';
                    lightning.style.position = 'absolute';
                    lightning.style.width = '4px';
                    lightning.style.height = '0';
                    lightning.style.backgroundColor = '#00FFFF';
                    lightning.style.left = `${30 + i * 20}%`;
                    lightning.style.top = '0';
                    lightning.style.zIndex = '6';
                    lightning.style.boxShadow = '0 0 10px 2px #00FFFF';
                    
                    lotteryStage.appendChild(lightning);
                    
                    lightning.animate([
                        { height: '0%' },
                        { height: '100%' }
                    ], {
                        duration: 300,
                        fill: 'forwards',
                        easing: 'ease-in'
                    });
                    
                    // 稲妻の線を削除
                    setTimeout(() => {
                        if (lotteryStage.contains(lightning)) {
                            lotteryStage.removeChild(lightning);
                        }
                    }, 1000);
                }, i * 200);
            }
            
            // フラッシュ要素を削除
            setTimeout(() => {
                if (lotteryStage.contains(flash)) {
                    lotteryStage.removeChild(flash);
                }
            }, 2000);
        }
    }
    
    // 抽選実行関数
    function startDraw() {
        // 全ての数字が出た場合
        if (availableNumbers.length === 0) {
            alert('すべての数字が出揃いました！');
            return;
        }
        
        // アニメーション中は操作不可
        if (isAnimating) return;
        
        isAnimating = true;
        
        // ランダムなアニメーションを選択
        const animationIndex = Math.floor(Math.random() * animationTypes.length);
        const animation = animationTypes[animationIndex];
        
        // 数字の抽選前の演出
        numberDisplay.textContent = '?';
        numberDisplay.className = 'number-display blink-animation';
        
        console.log(`演出: ${animation.name}`);
        
        // ランダムな数字を選ぶ
        const randomIndex = Math.floor(Math.random() * availableNumbers.length);
        const drawnNumber = availableNumbers[randomIndex];
        
        // 選ばれた数字を利用可能リストから削除
        availableNumbers.splice(randomIndex, 1);
        
        // 選ばれた数字を履歴に追加
        drawnNumbers.push(drawnNumber);
        
        setTimeout(() => {
            // アニメーション開始
            numberDisplay.className = `number-display ${animation.className}`;
            
            // 効果音を再生
            playSound();
            
            // エフェクトを作成
            createEffects(animation.name);
            
            // すべての演出タイプで強化したスロット演出を使用
            showSlotNumbers(animation.duration * 0.8, drawnNumber, function() {
                // 履歴に追加
                addToHistory(drawnNumber);
                
                // アニメーション終了
                setTimeout(() => {
                    isAnimating = false;
                }, 500);
            });
            
        }, 1000); // 1秒間の準備演出後に本演出開始
    }
    
    // Enterキーイベントリスナー
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Enter') {
            startDraw();
        }
    });
    
    // 初期化時に音声の自動再生許可を得るための一時的な消音オーディオを再生
    function initAudio() {
        const silentAudio = document.createElement('audio');
        silentAudio.src = 'data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4LjI5LjEwMAAAAAAAAAAAAAAA//OEAAAAAAAAAAAAAAAAAAAAAAAASW5mbwAAAA8AAAABAAABIADw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw//////////////////////////////////////////////////////////////////8AAAAATGF2YzU4LjU0AAAAAAAAAAAAAAAAJAAAAAAAAAAAASDs90hvAAAAAAAAAAAAAAAAAAAA//MUZAAAAAGkAAAAAAAAA0gAAAAATEFN//MUZAMAAAGkAAAAAAAAA0gAAAAARTMu//MUZAYAAAGkAAAAAAAAA0gAAAAAOTku//MUZAkAAAGkAAAAAAAAA0gAAAAANVVV';
        silentAudio.volume = 0.01;
        silentAudio.play().catch(e => {
            console.log('自動再生に失敗しました。ユーザーインタラクション後に音声を再生します。', e);
        });
    }
    
    // 履歴に数字を追加する関数
    function addToHistory(number) {
        const historyItem = document.createElement('div');
        historyItem.className = 'history-number';
        historyItem.textContent = number;
        numberHistory.appendChild(historyItem);
        
        // スクロールを最下部に移動
        numberHistory.scrollTop = numberHistory.scrollHeight;
    }
    
    // ページ読み込み時に音声初期化
    initAudio();
    
    // モバイル用タッチイベント（タップでも抽選開始できるようにする）
    document.addEventListener('touchstart', function() {
        // タッチイベントを無視し、ダブルタップでズームしないようにする
    }, { passive: false });
    
    document.addEventListener('touchend', function(event) {
        if (!isAnimating) {
            startDraw();
            event.preventDefault();
        }
    }, { passive: false });
});
