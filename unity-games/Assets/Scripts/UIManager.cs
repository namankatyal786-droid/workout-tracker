using UnityEngine;
using UnityEngine.UI;

// UIManager: Saare UI Panels aur HUD text displays ko control karta hai
public class UIManager : MonoBehaviour
{
    public static UIManager Instance { get; private set; }

    [Header("Panels")]
    public GameObject mainMenuPanel;
    public GameObject hudPanel;
    public GameObject pausePanel;
    public GameObject gameOverPanel;

    [Header("HUD Elements (Legacy UI Text)")]
    public Text hudScoreText;
    public Text hudLivesText;
    public Image[] hudHeartImages;

    [Header("Menu & Game Over Elements")]
    public Text menuHighScoreText;
    public Text gameOverFinalScoreText;
    public Text gameOverHighScoreText;

    [Header("Buttons")]
    public Button playButton;
    public Button pauseButton;
    public Button resumeButton;
    public Button retryButton;
    public Button menuButton;

    void Awake()
    {
        // Singleton pattern taaki globally easily accessible ho
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
        // Button click listeners wire up kar rahe hain
        if (playButton != null)
            playButton.onClick.AddListener(() => GameManager.Instance.StartGame());

        if (pauseButton != null)
            pauseButton.onClick.AddListener(() => GameManager.Instance.PauseGame());

        if (resumeButton != null)
            resumeButton.onClick.AddListener(() => GameManager.Instance.ResumeGame());

        if (retryButton != null)
            retryButton.onClick.AddListener(() => GameManager.Instance.RestartGame());

        if (menuButton != null)
            menuButton.onClick.AddListener(() => GameManager.Instance.GoToMenu());
    }

    // Main Menu screen display karna
    public void ShowMainMenu(int highScore)
    {
        if (mainMenuPanel != null) mainMenuPanel.SetActive(true);
        if (hudPanel != null) hudPanel.SetActive(false);
        if (pausePanel != null) pausePanel.SetActive(false);
        if (gameOverPanel != null) gameOverPanel.SetActive(false);

        if (menuHighScoreText != null)
        {
            menuHighScoreText.text = $"BEST: {highScore}";
        }
    }

    // Active gameplay HUD screen display karna
    public void ShowHUD()
    {
        if (mainMenuPanel != null) mainMenuPanel.SetActive(false);
        if (hudPanel != null) hudPanel.SetActive(true);
        if (pausePanel != null) pausePanel.SetActive(false);
        if (gameOverPanel != null) gameOverPanel.SetActive(false);
    }

    // Pause menu popup open karna
    public void ShowPauseMenu(bool isPaused)
    {
        if (pausePanel != null)
        {
            pausePanel.SetActive(isPaused);
        }
    }

    // Game over screen display karna aur final scores update karna
    public void ShowGameOver(int finalScore, int highScore)
    {
        if (hudPanel != null) hudPanel.SetActive(false);
        if (pausePanel != null) pausePanel.SetActive(false);
        if (gameOverPanel != null) gameOverPanel.SetActive(true);

        if (gameOverFinalScoreText != null)
        {
            gameOverFinalScoreText.text = $"SCORE: {finalScore}";
        }

        if (gameOverHighScoreText != null)
        {
            gameOverHighScoreText.text = $"HIGH SCORE: {highScore}";
        }
    }

    // Score aur Lives ko update karna jab player items catch kare
    public void UpdateHUD(int score, int lives)
    {
        if (hudScoreText != null)
        {
            hudScoreText.text = $"SCORE: {score}";
        }

        if (hudLivesText != null)
        {
            hudLivesText.text = "LIVES:";
        }

        if (hudHeartImages != null && hudHeartImages.Length > 0)
        {
            for (int i = 0; i < hudHeartImages.Length; i++)
            {
                if (hudHeartImages[i] != null)
                {
                    // Active life: bright red heart (alpha 1). Lost life: dimmed red heart (alpha 0.22)
                    hudHeartImages[i].color = (i < lives) 
                        ? new Color(1f, 1f, 1f, 1f) 
                        : new Color(1f, 1f, 1f, 0.22f);
                }
            }
        }
    }
}
