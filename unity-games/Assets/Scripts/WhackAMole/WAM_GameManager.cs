using System.Collections;
using System.Collections.Generic;
using UnityEngine;

namespace WhackAMole
{
    // WAM_GameManager: 60-second timer, 3x3 grid spawning, combo multipliers, scoring aur WebGL bridge call handle karta hai
    public class WAM_GameManager : MonoBehaviour
    {
        public static WAM_GameManager Instance { get; private set; }

        [Header("Grid References")]
        public HoleController[] holes; // 3x3 = 9 holes

        [Header("Item Datasets (ScriptableObjects)")]
        public ItemData[] goodItems; // Dumbbell, Protein Shake, Banana, Water Bottle
        public ItemData[] badItems;  // Burger, Pizza, Soda

        [Header("Game State")]
        public int currentScore = 0;
        public float totalDuration = 60f; // 60 seconds total game time
        public float timeLeft = 60f;
        public int currentCombo = 0;
        public int bestScore = 0;
        public bool isPlaying = false;

        private Camera mainCamera;
        private Coroutine spawnLoopRoutine;
        private const string BestScoreKey = "WhackAMole_BestScore";
        private const string GameId = "whack-a-mole";

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

            bestScore = PlayerPrefs.GetInt(BestScoreKey, 0);
        }

        void Start()
        {
            mainCamera = Camera.main;
            GoToMenu();
        }

        void Update()
        {
            if (!isPlaying) return;

            // 1. Timer countdown
            timeLeft -= Time.deltaTime;
            if (timeLeft <= 0f)
            {
                timeLeft = 0f;
                TriggerGameOver();
                return;
            }

            // UI Refresh
            if (WAM_UIManager.Instance != null)
            {
                WAM_UIManager.Instance.UpdateHUD(currentScore, timeLeft, currentCombo);
            }

            // 2. Tap Detection (Mobile Touch screen aur Mouse click dono ke liye compatible)
            HandleTapInput();
        }

        // Tap Detection: ScreenToWorldPoint + Physics2D.OverlapPoint
        private void HandleTapInput()
        {
            if (Input.GetMouseButtonDown(0) && mainCamera != null)
            {
                Vector3 worldPos = mainCamera.ScreenToWorldPoint(Input.mousePosition);
                Vector2 tapPoint = new Vector2(worldPos.x, worldPos.y);

                Collider2D hit = Physics2D.OverlapPoint(tapPoint);
                if (hit != null)
                {
                    HoleController hole = hit.GetComponentInParent<HoleController>();
                    if (hole != null)
                    {
                        hole.OnTapped();
                    }
                }
            }
        }

        // 3. Item Whacked (Hit) Callback
        public void OnItemWhacked(ItemData item)
        {
            if (!isPlaying || item == null) return;

            if (item.itemType == WhackItemType.Good)
            {
                // GOOD ITEM:
                // Combo increment karo aur score add karo (score = base * combo)
                currentCombo++;
                int pointsEarned = item.points * currentCombo;
                currentScore += pointsEarned;
            }
            else if (item.itemType == WhackItemType.Bad)
            {
                // BAD ITEM:
                // Combo reset karo (0), points deduct karo, aur timer se 3 seconds kaat do
                currentCombo = 0;
                currentScore = Mathf.Max(0, currentScore - item.points);
                timeLeft = Mathf.Max(0f, timeLeft - 3.0f); // -3s penalty
            }

            if (WAM_UIManager.Instance != null)
            {
                WAM_UIManager.Instance.UpdateHUD(currentScore, timeLeft, currentCombo);
            }
        }

        // 4. Spawning loop across the 3x3 holes
        private IEnumerator SpawnLoop()
        {
            yield return new WaitForSeconds(0.4f);

            while (isPlaying)
            {
                // Difficulty scaling over 60 seconds:
                // Game aage badhne ke saath popup duration aur spawn interval kam hote hain
                float progress = 1f - (timeLeft / totalDuration); // 0 (start) to 1 (end)

                float visibleDuration = Mathf.Lerp(1.1f, 0.65f, progress);
                float interval = Mathf.Lerp(0.9f, 0.45f, progress);

                // Bad item probability starts at 20% and goes up to 45%
                float badItemChance = Mathf.Lerp(0.20f, 0.45f, progress);

                // Khali holes dhoondo
                List<HoleController> availableHoles = new List<HoleController>();
                foreach (var h in holes)
                {
                    if (h != null && !h.isOccupied)
                    {
                        availableHoles.Add(h);
                    }
                }

                if (availableHoles.Count > 0)
                {
                    // Random available hole choose karo
                    HoleController selectedHole = availableHoles[Random.Range(0, availableHoles.Count)];

                    // Decide item (Good or Bad)
                    bool spawnBad = Random.value < badItemChance;
                    ItemData chosenItem = null;

                    if (spawnBad && badItems != null && badItems.Length > 0)
                    {
                        chosenItem = badItems[Random.Range(0, badItems.Length)];
                    }
                    else if (goodItems != null && goodItems.Length > 0)
                    {
                        chosenItem = goodItems[Random.Range(0, goodItems.Length)];
                    }

                    if (chosenItem != null)
                    {
                        selectedHole.PopUp(chosenItem, visibleDuration);
                    }
                }

                yield return new WaitForSeconds(interval);
            }
        }

        // 5. Game Start
        public void StartGame()
        {
            isPlaying = true;
            currentScore = 0;
            currentCombo = 0;
            timeLeft = totalDuration;

            ResetAllHoles();

            if (WAM_UIManager.Instance != null)
            {
                WAM_UIManager.Instance.ShowHUD();
                WAM_UIManager.Instance.UpdateHUD(currentScore, timeLeft, currentCombo);
            }

            if (spawnLoopRoutine != null) StopCoroutine(spawnLoopRoutine);
            spawnLoopRoutine = StartCoroutine(SpawnLoop());
        }

        // 6. Game Over Trigger
        private void TriggerGameOver()
        {
            isPlaying = false;

            if (spawnLoopRoutine != null)
            {
                StopCoroutine(spawnLoopRoutine);
                spawnLoopRoutine = null;
            }

            ResetAllHoles();

            // Best score save karo
            if (currentScore > bestScore)
            {
                bestScore = currentScore;
                PlayerPrefs.SetInt(BestScoreKey, bestScore);
                PlayerPrefs.Save();
            }

            if (WAM_UIManager.Instance != null)
            {
                WAM_UIManager.Instance.ShowGameOver(currentScore, bestScore);
            }

            // WebGL Bridge ko score bhejo taaki React app PostgreSQL DB mein save kare
            GameBridge.SendGameOver(GameId, currentScore);
        }

        public void RestartGame()
        {
            StartGame();
        }

        public void GoToMenu()
        {
            isPlaying = false;
            if (spawnLoopRoutine != null)
            {
                StopCoroutine(spawnLoopRoutine);
                spawnLoopRoutine = null;
            }
            ResetAllHoles();

            if (WAM_UIManager.Instance != null)
            {
                WAM_UIManager.Instance.ShowMainMenu(bestScore);
            }
        }

        private void ResetAllHoles()
        {
            if (holes == null) return;
            foreach (var h in holes)
            {
                if (h != null) h.ResetHole();
            }
        }
    }
}
