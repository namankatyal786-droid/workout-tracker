using System.IO;
using System.Collections.Generic;
using UnityEditor;
using UnityEditor.SceneManagement;
using UnityEngine;
using UnityEngine.UI;
using UnityEngine.EventSystems;
using WhackAMole;

// SceneBuilder: 100% code se dono games ki scenes build karta hai
// 1. BagCatcher.unity (Game 1)
// 2. WhackAMole.unity (Game 2)
public static class SceneBuilder
{
    private const string ScenesDir = "Assets/Scenes";
    private const string BagCatcherScenePath = "Assets/Scenes/BagCatcher.unity";
    private const string WhackScenePath = "Assets/Scenes/WhackAMole.unity";

    // ----------------------------------------------------
    // GAME 1: GYM BAG CATCHER SCENE
    // ----------------------------------------------------

    [MenuItem("Tools/Gym Games/3. Build Bag Catcher Scene")]
    public static void BuildBagCatcherScene()
    {
        EnsureDirectory(ScenesDir);

        var scene = EditorSceneManager.NewScene(NewSceneSetup.EmptyScene, NewSceneMode.Single);

        // 1. Camera Setup
        GameObject camGo = new GameObject("Main Camera");
        camGo.tag = "MainCamera";
        Camera cam = camGo.AddComponent<Camera>();
        cam.orthographic = true;
        cam.orthographicSize = 6.0f;
        cam.clearFlags = CameraClearFlags.SolidColor;
        cam.backgroundColor = new Color(0.063f, 0.082f, 0.071f);
        cam.transform.position = new Vector3(0f, 0f, -10f);
        camGo.AddComponent<AudioListener>();

        // 2. Background Sprite Setup
        CreateBackgroundObject();

        // 3. EventSystem Setup
        CreateEventSystemObject();

        // 4. UI Canvas Setup (1080 x 1920)
        GameObject canvasGo = CreateCanvasObject();
        UIManager uiManager = canvasGo.AddComponent<UIManager>();
        Font defaultFont = GetDefaultFont();

        // Build UI Panels
        GameObject hudPanel = CreateUIPanel(canvasGo.transform, "HUDPanel", new Color(0f, 0f, 0f, 0f));
        Text hudScoreText = CreateUIText(hudPanel.transform, "ScoreText", "SCORE: 0", defaultFont, 48, FontStyle.Bold,
            new Color(0.72f, 0.93f, 0.78f), new Vector2(0f, 1f), new Vector2(0f, 1f), new Vector2(300f, 80f), new Vector2(180f, -60f));

        Text hudLivesText = CreateUIText(hudPanel.transform, "LivesText", "LIVES:", defaultFont, 44, FontStyle.Bold,
            new Color(1f, 0.35f, 0.4f), new Vector2(0.5f, 1f), new Vector2(0.5f, 1f), new Vector2(170f, 80f), new Vector2(-60f, -60f));

        Sprite heartSprite = AssetDatabase.LoadAssetAtPath<Sprite>("Assets/Sprites/heart.png");
        Image[] heartImages = new Image[3];
        for (int i = 0; i < 3; i++)
        {
            heartImages[i] = CreateUIImage(hudPanel.transform, $"Heart_{i}", heartSprite,
                new Vector2(0.5f, 1f), new Vector2(0.5f, 1f), new Vector2(46f, 46f), new Vector2(40f + i * 50f, -60f));
        }

        Button pauseBtn = CreateUIButton(hudPanel.transform, "PauseButton", "⏸", defaultFont, 44,
            new Color(0.14f, 0.29f, 0.20f), Color.white,
            new Vector2(1f, 1f), new Vector2(1f, 1f), new Vector2(90f, 90f), new Vector2(-70f, -60f));

        GameObject menuPanel = CreateUIPanel(canvasGo.transform, "MainMenuPanel", new Color(0.06f, 0.08f, 0.07f, 0.95f));
        CreateUIText(menuPanel.transform, "TitleText", "GYM BAG CATCHER", defaultFont, 68, FontStyle.Bold,
            new Color(0.65f, 0.90f, 0.73f), new Vector2(0.5f, 0.7f), new Vector2(0.5f, 0.7f), new Vector2(800f, 120f), Vector2.zero);

        CreateUIText(menuPanel.transform, "InstructionsText",
            "Catch healthy items & weights! 🏋️🥦🍗\nAvoid junk food! 🍔🍕\n\nDrag or use arrow keys to move the gym bag.",
            defaultFont, 36, FontStyle.Normal,
            new Color(0.85f, 0.90f, 0.88f), new Vector2(0.5f, 0.52f), new Vector2(0.5f, 0.52f), new Vector2(850f, 220f), Vector2.zero);

        Text menuHighScoreText = CreateUIText(menuPanel.transform, "MenuHighScoreText", "BEST: 0", defaultFont, 44, FontStyle.Bold,
            new Color(0.98f, 0.8f, 0.08f), new Vector2(0.5f, 0.40f), new Vector2(0.5f, 0.40f), new Vector2(500f, 80f), Vector2.zero);

        Button playBtn = CreateUIButton(menuPanel.transform, "PlayButton", "START GAME", defaultFont, 44,
            new Color(0.15f, 0.35f, 0.22f), Color.white,
            new Vector2(0.5f, 0.28f), new Vector2(0.5f, 0.28f), new Vector2(440f, 110f), Vector2.zero);

        GameObject pausePanel = CreateUIPanel(canvasGo.transform, "PausePanel", new Color(0.06f, 0.08f, 0.07f, 0.90f));
        CreateUIText(pausePanel.transform, "PauseTitle", "PAUSED", defaultFont, 64, FontStyle.Bold,
            Color.white, new Vector2(0.5f, 0.65f), new Vector2(0.5f, 0.65f), new Vector2(600f, 100f), Vector2.zero);

        Button resumeBtn = CreateUIButton(pausePanel.transform, "ResumeButton", "RESUME", defaultFont, 40,
            new Color(0.15f, 0.35f, 0.22f), Color.white,
            new Vector2(0.5f, 0.48f), new Vector2(0.5f, 0.48f), new Vector2(400f, 100f), Vector2.zero);

        GameObject gameOverPanel = CreateUIPanel(canvasGo.transform, "GameOverPanel", new Color(0.06f, 0.08f, 0.07f, 0.95f));
        CreateUIText(gameOverPanel.transform, "GameOverTitle", "GAME OVER", defaultFont, 74, FontStyle.Bold,
            new Color(0.94f, 0.27f, 0.27f), new Vector2(0.5f, 0.72f), new Vector2(0.5f, 0.72f), new Vector2(700f, 120f), Vector2.zero);

        Text gameOverFinalScore = CreateUIText(gameOverPanel.transform, "FinalScoreText", "SCORE: 0", defaultFont, 52, FontStyle.Bold,
            new Color(0.72f, 0.93f, 0.78f), new Vector2(0.5f, 0.58f), new Vector2(0.5f, 0.58f), new Vector2(600f, 90f), Vector2.zero);

        Text gameOverHighScore = CreateUIText(gameOverPanel.transform, "GameOverHighScoreText", "HIGH SCORE: 0", defaultFont, 40, FontStyle.Normal,
            new Color(0.98f, 0.8f, 0.08f), new Vector2(0.5f, 0.49f), new Vector2(0.5f, 0.49f), new Vector2(600f, 80f), Vector2.zero);

        Button retryBtn = CreateUIButton(gameOverPanel.transform, "RetryButton", "PLAY AGAIN", defaultFont, 42,
            new Color(0.15f, 0.35f, 0.22f), Color.white,
            new Vector2(0.5f, 0.36f), new Vector2(0.5f, 0.36f), new Vector2(420f, 100f), Vector2.zero);

        Button menuBtn = CreateUIButton(gameOverPanel.transform, "MenuButton", "MAIN MENU", defaultFont, 36,
            new Color(0.18f, 0.22f, 0.20f), Color.white,
            new Vector2(0.5f, 0.25f), new Vector2(0.5f, 0.25f), new Vector2(420f, 90f), Vector2.zero);

        // Wire references
        uiManager.mainMenuPanel = menuPanel;
        uiManager.hudPanel = hudPanel;
        uiManager.pausePanel = pausePanel;
        uiManager.gameOverPanel = gameOverPanel;
        uiManager.hudScoreText = hudScoreText;
        uiManager.hudLivesText = hudLivesText;
        uiManager.hudHeartImages = heartImages;
        uiManager.menuHighScoreText = menuHighScoreText;
        uiManager.gameOverFinalScoreText = gameOverFinalScore;
        uiManager.gameOverHighScoreText = gameOverHighScore;
        uiManager.playButton = playBtn;
        uiManager.pauseButton = pauseBtn;
        uiManager.resumeButton = resumeBtn;
        uiManager.retryButton = retryBtn;
        uiManager.menuButton = menuBtn;

        // 5. Instantiate Gym Bag
        GameObject bagPrefab = AssetDatabase.LoadAssetAtPath<GameObject>("Assets/Prefabs/GymBag.prefab");
        GameObject bagInstance = null;
        if (bagPrefab != null)
        {
            bagInstance = (GameObject)PrefabUtility.InstantiatePrefab(bagPrefab);
            bagInstance.transform.position = new Vector3(0f, -4.2f, 0f);
        }

        // 6. ItemSpawner Setup
        GameObject spawnerGo = new GameObject("ItemSpawner");
        ItemSpawner spawner = spawnerGo.AddComponent<ItemSpawner>();
        spawner.spawnY = 5.8f;
        spawner.minX = -2.2f;
        spawner.maxX = 2.2f;

        string[] goodNames = { "Dumbbell", "Banana", "Apple" };
        List<GameObject> goodList = new List<GameObject>();
        foreach (string g in goodNames)
        {
            GameObject p = AssetDatabase.LoadAssetAtPath<GameObject>($"Assets/Prefabs/Items/{g}.prefab");
            if (p != null) goodList.Add(p);
        }
        spawner.goodItemPrefabs = goodList.ToArray();

        string[] badNames = { "Burger", "Pizza", "Cake" };
        List<GameObject> badList = new List<GameObject>();
        foreach (string b in badNames)
        {
            GameObject p = AssetDatabase.LoadAssetAtPath<GameObject>($"Assets/Prefabs/Items/{b}.prefab");
            if (p != null) badList.Add(p);
        }
        spawner.badItemPrefabs = badList.ToArray();

        // 7. GameManager Setup
        GameObject gmGo = new GameObject("GameManager");
        GameManager gm = gmGo.AddComponent<GameManager>();
        gm.itemSpawner = spawner;
        if (bagInstance != null)
        {
            gm.bagController = bagInstance.GetComponent<BagController>();
        }

        // 8. Save & register scene
        EditorSceneManager.SaveScene(scene, BagCatcherScenePath);
        RegisterSceneInBuildSettings(BagCatcherScenePath);

        Debug.Log("[SceneBuilder] BagCatcher scene built successfully: " + BagCatcherScenePath);
    }

    // ----------------------------------------------------
    // GAME 2: WHACK-A-MOLE GYM EDITION SCENE
    // ----------------------------------------------------

    [MenuItem("Tools/Gym Games/Build Whack Scene")]
    public static void BuildWhackScene()
    {
        EnsureDirectory(ScenesDir);

        var scene = EditorSceneManager.NewScene(NewSceneSetup.EmptyScene, NewSceneMode.Single);

        // 1. Camera Setup
        GameObject camGo = new GameObject("Main Camera");
        camGo.tag = "MainCamera";
        Camera cam = camGo.AddComponent<Camera>();
        cam.orthographic = true;
        cam.orthographicSize = 6.0f;
        cam.clearFlags = CameraClearFlags.SolidColor;
        cam.backgroundColor = new Color(0.063f, 0.082f, 0.071f);
        cam.transform.position = new Vector3(0f, 0f, -10f);
        camGo.AddComponent<AudioListener>();

        // 2. Background Sprite
        CreateBackgroundObject();

        // 3. EventSystem Setup
        CreateEventSystemObject();

        // 4. UI Canvas Setup (1080 x 1920)
        GameObject canvasGo = CreateCanvasObject();
        WAM_UIManager uiManager = canvasGo.AddComponent<WAM_UIManager>();
        Font defaultFont = GetDefaultFont();

        // Build UI Panels for Whack-a-Mole
        // A. HUD Panel
        GameObject hudPanel = CreateUIPanel(canvasGo.transform, "HUDPanel", new Color(0f, 0f, 0f, 0f));
        Text hudScoreText = CreateUIText(hudPanel.transform, "ScoreText", "SCORE: 0", defaultFont, 48, FontStyle.Bold,
            new Color(0.72f, 0.93f, 0.78f), new Vector2(0f, 1f), new Vector2(0f, 1f), new Vector2(320f, 80f), new Vector2(180f, -60f));

        Text hudTimerText = CreateUIText(hudPanel.transform, "TimerText", "⏱ 60s", defaultFont, 48, FontStyle.Bold,
            Color.white, new Vector2(1f, 1f), new Vector2(1f, 1f), new Vector2(250f, 80f), new Vector2(-150f, -60f));

        Text hudComboText = CreateUIText(hudPanel.transform, "ComboText", "COMBO x2! 🔥", defaultFont, 42, FontStyle.Bold,
            new Color(0.98f, 0.8f, 0.08f), new Vector2(0.5f, 1f), new Vector2(0.5f, 1f), new Vector2(400f, 80f), new Vector2(0f, -130f));
        hudComboText.gameObject.SetActive(false);

        // B. Main Menu Panel
        GameObject menuPanel = CreateUIPanel(canvasGo.transform, "MainMenuPanel", new Color(0.06f, 0.08f, 0.07f, 0.95f));
        CreateUIText(menuPanel.transform, "TitleText", "WHACK-A-MOLE", defaultFont, 68, FontStyle.Bold,
            new Color(0.65f, 0.90f, 0.73f), new Vector2(0.5f, 0.74f), new Vector2(0.5f, 0.74f), new Vector2(800f, 100f), Vector2.zero);

        CreateUIText(menuPanel.transform, "SubTitleText", "GYM EDITION", defaultFont, 44, FontStyle.Bold,
            new Color(0.72f, 0.93f, 0.78f), new Vector2(0.5f, 0.67f), new Vector2(0.5f, 0.67f), new Vector2(600f, 80f), Vector2.zero);

        CreateUIText(menuPanel.transform, "InstructionsText",
            "Tap healthy food & dumbbells! 🏋️🥤🍌\nAvoid junk food! 🍔🍕\n\nBuild your combo multiplier before the 60s timer runs out!",
            defaultFont, 34, FontStyle.Normal,
            new Color(0.85f, 0.90f, 0.88f), new Vector2(0.5f, 0.52f), new Vector2(0.5f, 0.52f), new Vector2(850f, 220f), Vector2.zero);

        Text menuBestScoreText = CreateUIText(menuPanel.transform, "MenuBestScoreText", "BEST: 0", defaultFont, 44, FontStyle.Bold,
            new Color(0.98f, 0.8f, 0.08f), new Vector2(0.5f, 0.38f), new Vector2(0.5f, 0.38f), new Vector2(500f, 80f), Vector2.zero);

        Button playBtn = CreateUIButton(menuPanel.transform, "PlayButton", "START WORKOUT", defaultFont, 44,
            new Color(0.15f, 0.35f, 0.22f), Color.white,
            new Vector2(0.5f, 0.26f), new Vector2(0.5f, 0.26f), new Vector2(460f, 110f), Vector2.zero);

        // C. Game Over Panel
        GameObject gameOverPanel = CreateUIPanel(canvasGo.transform, "GameOverPanel", new Color(0.06f, 0.08f, 0.07f, 0.95f));
        CreateUIText(gameOverPanel.transform, "GameOverTitle", "SESSION OVER", defaultFont, 72, FontStyle.Bold,
            new Color(0.94f, 0.27f, 0.27f), new Vector2(0.5f, 0.72f), new Vector2(0.5f, 0.72f), new Vector2(700f, 120f), Vector2.zero);

        Text gameOverFinalScore = CreateUIText(gameOverPanel.transform, "FinalScoreText", "FINAL SCORE: 0", defaultFont, 50, FontStyle.Bold,
            new Color(0.72f, 0.93f, 0.78f), new Vector2(0.5f, 0.58f), new Vector2(0.5f, 0.58f), new Vector2(600f, 90f), Vector2.zero);

        Text gameOverBestScore = CreateUIText(gameOverPanel.transform, "GameOverBestScoreText", "BEST SCORE: 0", defaultFont, 40, FontStyle.Normal,
            new Color(0.98f, 0.8f, 0.08f), new Vector2(0.5f, 0.49f), new Vector2(0.5f, 0.49f), new Vector2(600f, 80f), Vector2.zero);

        Button retryBtn = CreateUIButton(gameOverPanel.transform, "RetryButton", "PLAY AGAIN", defaultFont, 42,
            new Color(0.15f, 0.35f, 0.22f), Color.white,
            new Vector2(0.5f, 0.36f), new Vector2(0.5f, 0.36f), new Vector2(420f, 100f), Vector2.zero);

        Button menuBtn = CreateUIButton(gameOverPanel.transform, "MenuButton", "MAIN MENU", defaultFont, 36,
            new Color(0.18f, 0.22f, 0.20f), Color.white,
            new Vector2(0.5f, 0.25f), new Vector2(0.5f, 0.25f), new Vector2(420f, 90f), Vector2.zero);

        // Wire WAM_UIManager references
        uiManager.mainMenuPanel = menuPanel;
        uiManager.hudPanel = hudPanel;
        uiManager.gameOverPanel = gameOverPanel;
        uiManager.hudScoreText = hudScoreText;
        uiManager.hudTimerText = hudTimerText;
        uiManager.hudComboText = hudComboText;
        uiManager.menuBestScoreText = menuBestScoreText;
        uiManager.gameOverFinalScoreText = gameOverFinalScore;
        uiManager.gameOverBestScoreText = gameOverBestScore;
        uiManager.playButton = playBtn;
        uiManager.retryButton = retryBtn;
        uiManager.menuButton = menuBtn;

        // 5. 3x3 Grid of 9 Holes Setup
        GameObject holePrefab = AssetDatabase.LoadAssetAtPath<GameObject>("Assets/Prefabs/WhackAMole/Hole.prefab");
        GameObject gridParent = new GameObject("HoleGrid");
        gridParent.transform.position = new Vector3(0f, -0.4f, 0f);

        HoleController[] holeControllers = new HoleController[9];
        float xSpacing = 1.75f;
        float ySpacing = 1.60f;
        int holeIndex = 0;

        for (int row = 0; row < 3; row++)
        {
            for (int col = 0; col < 3; col++)
            {
                float x = (col - 1) * xSpacing;
                float y = (1 - row) * ySpacing;

                GameObject holeInstance = null;
                if (holePrefab != null)
                {
                    holeInstance = (GameObject)PrefabUtility.InstantiatePrefab(holePrefab);
                }
                else
                {
                    holeInstance = new GameObject($"Hole_{row}_{col}");
                    holeInstance.AddComponent<HoleController>();
                }

                holeInstance.name = $"Hole_{row}_{col}";
                holeInstance.transform.SetParent(gridParent.transform, false);
                holeInstance.transform.localPosition = new Vector3(x, y, 0f);

                holeControllers[holeIndex++] = holeInstance.GetComponent<HoleController>();
            }
        }

        // 6. WAM_GameManager Setup
        GameObject gmGo = new GameObject("WhackGameManager");
        WAM_GameManager gm = gmGo.AddComponent<WAM_GameManager>();
        gm.holes = holeControllers;

        // Load ScriptableObjects
        string[] goodAssetNames = { "Whack_Dumbbell", "Whack_Banana", "Whack_Apple" };
        List<ItemData> goodItemsList = new List<ItemData>();
        foreach (string name in goodAssetNames)
        {
            ItemData data = AssetDatabase.LoadAssetAtPath<ItemData>($"Assets/ScriptableObjects/WhackItems/{name}.asset");
            if (data != null) goodItemsList.Add(data);
        }
        gm.goodItems = goodItemsList.ToArray();

        string[] badAssetNames = { "Whack_Burger", "Whack_Pizza", "Whack_Cake" };
        List<ItemData> badItemsList = new List<ItemData>();
        foreach (string name in badAssetNames)
        {
            ItemData data = AssetDatabase.LoadAssetAtPath<ItemData>($"Assets/ScriptableObjects/WhackItems/{name}.asset");
            if (data != null) badItemsList.Add(data);
        }
        gm.badItems = badItemsList.ToArray();

        // 7. Save & register scene
        EditorSceneManager.SaveScene(scene, WhackScenePath);
        RegisterSceneInBuildSettings(WhackScenePath);

        Debug.Log("[SceneBuilder] WhackAMole scene built successfully: " + WhackScenePath);
    }

    [MenuItem("Tools/Gym Games/Run All Steps (Generate All)")]
    public static void RunAllSteps()
    {
        Debug.Log("[GymGames] Step 1: Generating Sprites...");
        SpriteGenerator.GenerateAllSprites();

        Debug.Log("[GymGames] Step 2: Building All Prefabs & ScriptableObjects...");
        PrefabBuilder.BuildAllPrefabs();

        Debug.Log("[GymGames] Step 3: Building Bag Catcher Scene...");
        BuildBagCatcherScene();

        Debug.Log("[GymGames] Step 4: Building Whack-a-Mole Scene...");
        BuildWhackScene();

        Debug.Log("[GymGames] Dono games ke saare assets aur scenes successfully generate ho gaye!");
    }

    // --- Helper Methods ---

    private static void EnsureDirectory(string path)
    {
        if (!Directory.Exists(path))
        {
            Directory.CreateDirectory(path);
        }
    }

    private static void CreateBackgroundObject()
    {
        GameObject bgGo = new GameObject("Background");
        SpriteRenderer bgSr = bgGo.AddComponent<SpriteRenderer>();
        Sprite bgSprite = AssetDatabase.LoadAssetAtPath<Sprite>("Assets/Sprites/background.png");
        if (bgSprite != null)
        {
            bgSr.sprite = bgSprite;
            bgSr.sortingOrder = -10;
            bgGo.transform.localScale = new Vector3(8f, 15f, 1f);
        }
    }

    private static void CreateEventSystemObject()
    {
        GameObject eventSystemGo = new GameObject("EventSystem");
        eventSystemGo.AddComponent<EventSystem>();
        eventSystemGo.AddComponent<StandaloneInputModule>();
    }

    private static GameObject CreateCanvasObject()
    {
        GameObject canvasGo = new GameObject("Canvas");
        Canvas canvas = canvasGo.AddComponent<Canvas>();
        canvas.renderMode = RenderMode.ScreenSpaceOverlay;

        CanvasScaler scaler = canvasGo.AddComponent<CanvasScaler>();
        scaler.uiScaleMode = CanvasScaler.ScaleMode.ScaleWithScreenSize;
        scaler.referenceResolution = new Vector2(1080, 1920);
        scaler.matchWidthOrHeight = 0.5f;

        canvasGo.AddComponent<GraphicRaycaster>();
        return canvasGo;
    }

    private static Font GetDefaultFont()
    {
        Font font = Resources.GetBuiltinResource<Font>("LegacyRuntime.ttf");
        if (font == null) font = Resources.GetBuiltinResource<Font>("Arial.ttf");
        if (font == null)
        {
            Font[] fonts = Resources.FindObjectsOfTypeAll<Font>();
            if (fonts != null && fonts.Length > 0) font = fonts[0];
        }
        return font;
    }

    private static GameObject CreateUIPanel(Transform parent, string name, Color bgColor)
    {
        GameObject panelGo = new GameObject(name);
        panelGo.transform.SetParent(parent, false);

        RectTransform rt = panelGo.AddComponent<RectTransform>();
        rt.anchorMin = Vector2.zero;
        rt.anchorMax = Vector2.one;
        rt.offsetMin = Vector2.zero;
        rt.offsetMax = Vector2.zero;

        Image img = panelGo.AddComponent<Image>();
        img.color = bgColor;

        return panelGo;
    }

    private static Text CreateUIText(Transform parent, string name, string content, Font font, int fontSize,
        FontStyle style, Color color, Vector2 anchorMin, Vector2 anchorMax, Vector2 size, Vector2 anchoredPos)
    {
        GameObject textGo = new GameObject(name);
        textGo.transform.SetParent(parent, false);

        RectTransform rt = textGo.AddComponent<RectTransform>();
        rt.anchorMin = anchorMin;
        rt.anchorMax = anchorMax;
        rt.sizeDelta = size;
        rt.anchoredPosition = anchoredPos;

        Text text = textGo.AddComponent<Text>();
        text.text = content;
        text.font = font;
        text.fontSize = fontSize;
        text.fontStyle = style;
        text.color = color;
        text.alignment = TextAnchor.MiddleCenter;
        text.horizontalOverflow = HorizontalWrapMode.Wrap;
        text.verticalOverflow = VerticalWrapMode.Overflow;

        return text;
    }

    private static Button CreateUIButton(Transform parent, string name, string label, Font font, int fontSize,
        Color btnColor, Color textColor, Vector2 anchorMin, Vector2 anchorMax, Vector2 size, Vector2 anchoredPos)
    {
        GameObject btnGo = new GameObject(name);
        btnGo.transform.SetParent(parent, false);

        RectTransform rt = btnGo.AddComponent<RectTransform>();
        rt.anchorMin = anchorMin;
        rt.anchorMax = anchorMax;
        rt.sizeDelta = size;
        rt.anchoredPosition = anchoredPos;

        Image img = btnGo.AddComponent<Image>();
        img.color = btnColor;

        Button btn = btnGo.AddComponent<Button>();
        ColorBlock colors = btn.colors;
        colors.normalColor = btnColor;
        colors.highlightedColor = btnColor * 1.2f;
        colors.pressedColor = btnColor * 0.8f;
        btn.colors = colors;

        CreateUIText(btnGo.transform, "Label", label, font, fontSize, FontStyle.Bold, textColor,
            Vector2.zero, Vector2.one, Vector2.zero, Vector2.zero);

        return btn;
    }

    private static Image CreateUIImage(Transform parent, string name, Sprite sprite,
        Vector2 anchorMin, Vector2 anchorMax, Vector2 size, Vector2 anchoredPos)
    {
        GameObject imgGo = new GameObject(name);
        imgGo.transform.SetParent(parent, false);

        RectTransform rt = imgGo.AddComponent<RectTransform>();
        rt.anchorMin = anchorMin;
        rt.anchorMax = anchorMax;
        rt.pivot = new Vector2(0.5f, 0.5f);
        rt.sizeDelta = size;
        rt.anchoredPosition = anchoredPos;

        Image img = imgGo.AddComponent<Image>();
        img.sprite = sprite;
        img.color = Color.white;
        img.preserveAspect = true;

        return img;
    }

    private static void RegisterSceneInBuildSettings(string scenePath)
    {
        EditorBuildSettingsScene[] originalScenes = EditorBuildSettings.scenes;
        foreach (var s in originalScenes)
        {
            if (s.path == scenePath) return;
        }

        EditorBuildSettingsScene[] newScenes = new EditorBuildSettingsScene[originalScenes.Length + 1];
        for (int i = 0; i < originalScenes.Length; i++) newScenes[i] = originalScenes[i];
        newScenes[newScenes.Length - 1] = new EditorBuildSettingsScene(scenePath, true);
        EditorBuildSettings.scenes = newScenes;
    }
}
