/* Sake Main — UI制御、インタラクション、パネル展開トランジション */
(function () {
  'use strict';

  // オーディオ初期化トリガー
  var hasInteracted = false;
  function triggerInitAudio() {
    if (hasInteracted) return;
    hasInteracted = true;
    if (window.SakeAudio) {
      window.SakeAudio.init();
    }
  }
  window.addEventListener('pointerdown', triggerInitAudio);
  window.addEventListener('keydown', triggerInitAudio);

  // DOM要素の取得
  var buttons = document.querySelectorAll('.option-btn');
  var panelsContainer = document.getElementById('panels-container');
  var sakePanels = document.querySelectorAll('.sake-panel');
  var backBtn = document.getElementById('back-btn');
  var overlayTransition = document.getElementById('overlay-transition');

  // ボタンのホバー時に、その位置に波紋を発生させる
  buttons.forEach(function (btn) {
    btn.addEventListener('pointerenter', function (e) {
      if (!window.SakeWater) return;
      var rect = canvasBoundaries();
      if (!rect) return;
      
      // ボタンの中央座標を取得し、Canvas座標へ変換
      var btnRect = btn.getBoundingClientRect();
      var cx = btnRect.left + btnRect.width / 2 - rect.left;
      var cy = btnRect.top + btnRect.height / 2 - rect.top;

      // 軽い波紋を発生
      window.SakeWater.triggerRipple(cx, cy, 0.6);
    });

    btn.addEventListener('click', function () {
      var targetPanelId = btn.dataset.panel;
      openPanel(targetPanelId);
    });
  });

  // 戻るボタンの制御
  if (backBtn) {
    backBtn.addEventListener('click', closePanel);
  }

  function canvasBoundaries() {
    var c = document.getElementById('water-canvas');
    return c ? c.getBoundingClientRect() : null;
  }

  // パネルを開く（美しいトランジション付き）
  function openPanel(panelId) {
    if (!overlayTransition) return;

    // 水が押し寄せるようなトランジションアニメーション
    overlayTransition.classList.add('is-active');

    setTimeout(function () {
      // パネルエリアを表示
      if (panelsContainer) panelsContainer.classList.add('is-active');
      
      // 対象パネル以外を非表示にし、対象のみを表示
      sakePanels.forEach(function (panel) {
        if (panel.id === panelId) {
          panel.classList.add('is-active');
        } else {
          panel.classList.remove('is-active');
        }
      });
      
      // 戻るボタンを表示
      if (backBtn) backBtn.classList.add('is-active');
      
      // ヘッダーやメインタイトルにフェード用クラスを追加
      document.body.classList.add('panel-opened');

      // トランジションを解除
      setTimeout(function () {
        overlayTransition.classList.remove('is-active');
      }, 500);

    }, 600); // トランジションのピーク時に表示切り替え
  }

  // パネルを閉じる
  function closePanel() {
    if (!overlayTransition) return;

    overlayTransition.classList.add('is-active');

    setTimeout(function () {
      if (panelsContainer) panelsContainer.classList.remove('is-active');
      sakePanels.forEach(function (panel) {
        panel.classList.remove('is-active');
      });
      if (backBtn) backBtn.classList.remove('is-active');
      document.body.classList.remove('panel-opened');

      setTimeout(function () {
        overlayTransition.classList.remove('is-active');
      }, 500);
    }, 600);
  }

  // 「好み」パネルのタイプ選択時のインタラクション
  var tasteCards = document.querySelectorAll('.taste-card');
  tasteCards.forEach(function (card) {
    card.addEventListener('pointerenter', function () {
      if (window.SakeAudio) {
        window.SakeAudio.playDrip(0.7); // 高めのきらめく音
      }
    });
  });

  // 「診断」パネルの質問進行シミュレーション
  var diagOptions = document.querySelectorAll('.diag-option');
  var diagResult = document.getElementById('diag-result');
  var diagQuestion = document.getElementById('diag-question');
  
  diagOptions.forEach(function (opt) {
    opt.addEventListener('click', function () {
      if (window.SakeAudio) {
        window.SakeAudio.playDrip(0.4);
      }
      
      // 診断演出
      if (diagQuestion && diagResult) {
        diagQuestion.style.opacity = '0';
        setTimeout(function () {
          diagQuestion.style.display = 'none';
          diagResult.style.display = 'block';
          setTimeout(function () {
            diagResult.style.opacity = '1';
            diagResult.style.transform = 'translateY(0)';
          }, 50);
        }, 300);
      }
    });
  });

  // 診断のリセット
  var resetDiagBtn = document.getElementById('reset-diag');
  if (resetDiagBtn) {
    resetDiagBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      if (diagQuestion && diagResult) {
        diagResult.style.opacity = '0';
        diagResult.style.transform = 'translateY(15px)';
        setTimeout(function () {
          diagResult.style.display = 'none';
          diagQuestion.style.display = 'block';
          setTimeout(function () {
            diagQuestion.style.opacity = '1';
          }, 50);
        }, 300);
      }
    });
  }

})();
