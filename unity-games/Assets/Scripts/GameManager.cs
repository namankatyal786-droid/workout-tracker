using UnityEngine;

// GameManager: Main game loop, score, health/lives aur state management
public class GameManager : MonoBehaviour
{
    public static GameManager Instance { get; private set; }

    [Header("Game State")]
    public int currentScore = 0;
    public int currentLives = 3;
    public int highScore = 0;
    public bool IsPlaying { get; private set; } = false;
    public bool IsPaused { get; private set; } = false;

    [Header("References")]
    public ItemSpawner itemSpawner;
    public BagController bagController;

    private const string HighScoreKey = "GymBagCatcher_HighScore";
    private const string GameId = "bag-catcher"; // WebGL bridge ke liye unique slug

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

        // Saved high score load karna
        highScore = PlayerPrefs.GetInt(HighScoreKey, 0);
    }

    void Start()
    {
        // Shuru mein Main Menu show karo
        GoToMenu();
    }

    // 1. Naya game start karna
    public void StartGame()
    {
        Time.timeScale = 1f;
        IsPaused = false;
        IsPlaying = true;
        currentScore = 0;
        currentLives = 3;

        // UI update karo
        if (UIManager.Instance != null)
        {
            UIManager.Instance.ShowHUD();
            UIManager.Instance.UpdateHUD(currentScore, currentLives);
        }

        // Spawner shuru karo
        if (itemSpawner != null)
        {
            itemSpawner.ClearAllSpawnedItems();
            itemSpawner.StartSpawning();
        }
    }

    // 2. Item collect hone par score/lives update karna
    public void OnItemCollected(FallingItem item)
    {
        if (!IsPlaying) return;

        if (item.itemType == ItemType.Good)
        {
            // Good food: points badhao
            currentScore += item.pointValue;
        }
        else if (item.itemType == ItemType.Bad)
        {
            // Junk food: ek life cut karo
            currentLives--;

            if (currentLives <= 0)
            {
                TriggerGameOver();
                return;
            }
        }

        // UI text refresh karo
        if (UIManager.Instance != null)
        {
            UIManager.Instance.UpdateHUD(currentScore, currentLives);
        }
    }

    // 3. Game Over trigger karna jab saari lives khatam ho jayein
    private void TriggerGameOver()
    {
        IsPlaying = false;
        Time.timeScale = 1f;

        // Agar score high score se zyada hai toh save karo
        if (currentScore > highScore)
        {
            highScore = currentScore;
            PlayerPrefs.SetInt(HighScoreKey, highScore);
            PlayerPrefs.Save();
        }

        // Spawner stop karo aur screen saaf karo
        if (itemSpawner != null)
        {
            itemSpawner.StopSpawning();
            itemSpawner.ClearAllSpawnedItems();
        }

        // Game Over panel show karo
        if (UIManager.Instance != null)
        {
            UIManager.Instance.ShowGameOver(currentScore, highScore);
        }

        // WebGL Bridge ke zariye React parent frame ko message bhejo taaki DB mein score save ho sake
        GameBridge.SendGameOver(GameId, currentScore);
    }

    // 4. Game pause karna
    public void PauseGame()
    {
        if (!IsPlaying || IsPaused) return;

        IsPaused = true;
        Time.timeScale = 0f; // Unity physics aur time pause

        if (UIManager.Instance != null)
        {
            UIManager.Instance.ShowPauseMenu(true);
        }
    }

    // 5. Game resume karna
    public void ResumeGame()
    {
        if (!IsPlaying || !IsPaused) return;

        IsPaused = false;
        Time.timeScale = 1f; // Time wapas normal

        if (UIManager.Instance != null)
        {
            UIManager.Instance.ShowPauseMenu(false);
        }
    }

    // 6. Game restart karna (Retry)
    public void RestartGame()
    {
        StartGame();
    }

    // 7. Main Menu par wapas jana
    public void GoToMenu()
    {
        IsPlaying = false;
        IsPaused = false;
        Time.timeScale = 1f;

        if (itemSpawner != null)
        {
            itemSpawner.StopSpawning();
            itemSpawner.ClearAllSpawnedItems();
        }

        if (UIManager.Instance != null)
        {
            UIManager.Instance.ShowMainMenu(highScore);
        }
    }
}
