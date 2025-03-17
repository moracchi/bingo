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
            sound: 'explosion.mp3',
            soundDescription: '上空から落下し、着地時に爆発音（ドッカーン！）'
        },
        {
            name: '高速回転演出',
            className: 'slide-animation',
            duration: 3000, // 3秒
            sound: 'spinning.mp3',
            soundDescription: '高速回転音と共に徐々に減速するメカニカルな音（ウィーンガガガガ...カチン！）'
        },
        {
            name: 'ビッグスロット演出',
            className: 'slot-animation',
            duration: 5000, // 5秒
            sound: 'bigslot.mp3',
            soundDescription: '大型スロットマシンのリール回転音と興奮をあおるBGM（ジャラジャラ...ジャジャジャジャーン！）'
        },
        {
            name: '爆発フラッシュ演出',
            className: 'explosion-animation',
            duration: 4000, // 4秒
            sound: 'flash_explosion.mp3',
            soundDescription: 'フラッシュと共に強烈な爆発音、最後にキラキラ音（パァーン！ジュワーン！）'
        }
    ];
    
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
    
    // 爆発演出用のエフェクト生成関数
    function createExplosionEffect() {
        const lotteryStage = document.querySelector('.lottery-stage');
        
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
                lotteryStage.removeChild(particle);
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
        
        console.log(`演出: ${animation.name}, 効果音: ${animation.soundDescription}`);
        
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
            
            // 爆発演出の場合は追加エフェクト
            if (animation.name === '爆発フラッシュ演出') {
                setTimeout(createExplosionEffect, animation.duration * 0.2);
            }
            
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
    
    // 履歴に数字を追加する関数
    function addToHistory(number) {
        const historyItem = document.createElement('div');
        historyItem.className = 'history-number';
        historyItem.textContent = number;
        numberHistory.appendChild(historyItem);
        
        // スクロールを最下部に移動
        numberHistory.scrollTop = numberHistory.scrollHeight;
    }
});
