using UnityEngine;
using UnityEngine.UI;

namespace WhackAMole
{
    // WAM_UIManager: Whack-a-Mole ke HUD, Timer, Score, Combo aur Menu panels ko manage karta hai
    public class WAM_UIManager : MonoBehaviour
    {
        public static WAM_UIManager Instance { get; private set; }

        [Header("Panels")]
        public GameObject mainMenuPanel;
        public GameObject hudPanel;
        public GameObject gameOverPanel;

        [Header("HUD Text Elements (Legacy UI Text)")]
        public Text hudScoreText;
        public Text hudTimerText;
        public Text hudComboText;

        [Header("Menu & Game Over Elements")]
        public Text menuBestScoreText;
        public Text gameOverFinalScoreText;
        public Text gameOverBestScoreText;

        [Header("Buttons")]
        public Button playButton;
        public Button retryButton;
        public Button menuButton;

        void Awake()
        {
            if (Instance == null)
            {
                Instance = this;
            }
            else
            {
                Destroy(gameObject);
                return;
            }
        }

        void Start()
        {
            // Button click events wire up
            if (playButton != null)
                playButton.onClick.AddListener(() => WAM_GameManager.Instance.StartGame());

            if (retryButton != null)
                retryButton.onClick.AddListener(() => WAM_GameManager.Instance.RestartGame());

            if (menuButton != null)
                menuButton.onClick.AddListener(() => WAM_GameManager.Instance.GoToMenu());
        }

        // 1. Main Menu show karna
        public void ShowMainMenu(int bestScore)
        {
            if (mainMenuPanel != null) mainMenuPanel.SetActive(true);
            if (hudPanel != null) hudPanel.SetActive(false);
            if (gameOverPanel != null) gameOverPanel.SetActive(false);

            if (menuBestScoreText != null)
            {
                menuBestScoreText.text = $"BEST: {bestScore}";
            }
        }

        // 2. Active gameplay HUD show karna
        public void ShowHUD()
        {
            if (mainMenuPanel != null) mainMenuPanel.SetActive(false);
            if (hudPanel != null) hudPanel.SetActive(true);
            if (gameOverPanel != null) gameOverPanel.SetActive(false);
        }

        // 3. Game Over panel show karna
        public void ShowGameOver(int finalScore, int bestScore)
        {
            if (hudPanel != null) hudPanel.SetActive(false);
            if (gameOverPanel != null) gameOverPanel.SetActive(true);

            if (gameOverFinalScoreText != null)
            {
                gameOverFinalScoreText.text = $"FINAL SCORE: {finalScore}";
            }

            if (gameOverBestScoreText != null)
            {
                gameOverBestScoreText.text = $"BEST SCORE: {bestScore}";
            }
        }

        // 4. In-game HUD update: Score, Timer aur Combo
        public void UpdateHUD(int score, float timeLeft, int combo)
        {
            if (hudScoreText != null)
            {
                hudScoreText.text = $"SCORE: {score}";
            }

            if (hudTimerText != null)
            {
                int seconds = Mathf.CeilToInt(Mathf.Max(0f, timeLeft));
                hudTimerText.text = $"⏱ {seconds}s";
                // Warning color jab timer 10s se kam ho
                hudTimerText.color = seconds <= 10 ? new Color(1f, 0.3f, 0.3f) : Color.white;
            }

            if (hudComboText != null)
            {
                if (combo > 1)
                {
                    hudComboText.text = $"COMBO x{combo}! 🔥";
                    hudComboText.gameObject.SetActive(true);
                }
                else
                {
                    hudComboText.gameObject.SetActive(false);
                }
            }
        }
    }
}
