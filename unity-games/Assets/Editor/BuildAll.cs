using System;
using System.IO;
using UnityEditor;
using UnityEditor.Build;
using UnityEditor.Build.Reporting;
using UnityEngine;

// BuildAll: Generates all game assets & builds both WebGL games
// Menu: Tools/Gym Games/Build All
// CLI: -executeMethod BuildAll.BuildFromCLI
public static class BuildAll
{
    private const string TemplateName = "PROJECT:GymTemplate";

    [MenuItem("Tools/Gym Games/Build All")]
    public static void BuildAllFromMenu()
    {
        ExecuteFullBuild(false);
    }

    public static void BuildFromCLI()
    {
        Debug.Log("[BuildAll] CLI Build started...");
        try
        {
            ExecuteFullBuild(true);
            Debug.Log("[BuildAll] CLI Build completed successfully!");
            EditorApplication.Exit(0);
        }
        catch (Exception ex)
        {
            Debug.LogError($"[BuildAll] CLI Build FAILED with exception: {ex.Message}\n{ex.StackTrace}");
            EditorApplication.Exit(1);
        }
    }

    private static void ExecuteFullBuild(bool isBatchMode)
    {
        // STEP 1: Generate all procedural assets
        Debug.Log("[BuildAll] --- Step 1: Generating Sprites ---");
        SpriteGenerator.GenerateAllSprites();

        Debug.Log("[BuildAll] --- Step 2: Building Prefabs & ScriptableObjects ---");
        PrefabBuilder.BuildAllPrefabs();

        Debug.Log("[BuildAll] --- Step 3: Building Scenes ---");
        SceneBuilder.BuildBagCatcherScene();
        SceneBuilder.BuildWhackScene();

        // STEP 2: Configure WebGL settings
        Debug.Log("[BuildAll] --- Step 4: Configuring WebGL Player Settings ---");
        ConfigureWebGLSettings();

        // STEP 3: Setup output directories
        string repoRoot = Path.GetFullPath(Path.Combine(Application.dataPath, "../.."));
        string clientBagDir = Path.Combine(repoRoot, "client/public/games/bag-catcher");
        string clientWhackDir = Path.Combine(repoRoot, "client/public/games/whack-a-mole");
        string publicBagDir = Path.Combine(repoRoot, "public/games/bag-catcher");
        string publicWhackDir = Path.Combine(repoRoot, "public/games/whack-a-mole");

        EnsureCleanDirectory(clientBagDir);
        EnsureCleanDirectory(clientWhackDir);

        // STEP 4: Build Game 1 - Bag Catcher
        Debug.Log("[BuildAll] --- Step 5: Building WebGL Game 1 (Bag Catcher) ---");
        BuildGame("Assets/Scenes/BagCatcher.unity", clientBagDir, "Bag Catcher");

        // STEP 5: Build Game 2 - Whack a Mole
        Debug.Log("[BuildAll] --- Step 6: Building WebGL Game 2 (Whack a Mole) ---");
        BuildGame("Assets/Scenes/WhackAMole.unity", clientWhackDir, "Whack-a-Mole");

        // Mirror to public/games as well for direct Vite server access
        Debug.Log("[BuildAll] --- Step 7: Mirroring builds to public/games/ ---");
        CopyDirectory(clientBagDir, publicBagDir);
        CopyDirectory(clientWhackDir, publicWhackDir);

        Debug.Log("[BuildAll] Both WebGL games built and mirrored successfully!");
    }

    private static void ConfigureWebGLSettings()
    {
        // Switch to WebGL target if not already active
        if (EditorUserBuildSettings.activeBuildTarget != BuildTarget.WebGL)
        {
            EditorUserBuildSettings.SwitchActiveBuildTarget(BuildTargetGroup.WebGL, BuildTarget.WebGL);
        }

        // WebGL specific settings
        PlayerSettings.WebGL.template = TemplateName;
        PlayerSettings.WebGL.compressionFormat = WebGLCompressionFormat.Gzip;
        PlayerSettings.WebGL.decompressionFallback = true;
        PlayerSettings.runInBackground = true;

        // Splash screen off
        PlayerSettings.SplashScreen.show = false;
        PlayerSettings.SplashScreen.showUnityLogo = false;

        // Code stripping for smaller download sizes
        PlayerSettings.stripEngineCode = true;
        try
        {
            PlayerSettings.SetManagedStrippingLevel(NamedBuildTarget.WebGL, ManagedStrippingLevel.High);
        }
        catch
        {
            // Fallback for different Unity stripping configurations
        }

        // Memory configuration: 32MB initial memory
        try
        {
            PlayerSettings.WebGL.initialMemorySize = 32;
        }
        catch
        {
            // Initial memory property fallback
        }
    }

    private static void BuildGame(string scenePath, string outputPath, string gameTitle)
    {
        Debug.Log($"[BuildAll] Building {gameTitle} to {outputPath}...");

        BuildPlayerOptions options = new BuildPlayerOptions
        {
            scenes = new string[] { scenePath },
            locationPathName = outputPath,
            target = BuildTarget.WebGL,
            options = BuildOptions.None
        };

        BuildReport report = BuildPipeline.BuildPlayer(options);
        BuildSummary summary = report.summary;

        if (summary.result == BuildResult.Succeeded)
        {
            Debug.Log($"[BuildAll] {gameTitle} build SUCCESS! Total size: {summary.totalSize / (1024f * 1024f):F2} MB, Time: {summary.totalTime.TotalSeconds:F1}s");
        }
        else
        {
            throw new Exception($"[BuildAll] {gameTitle} build FAILED with status: {summary.result}. Total errors: {summary.totalErrors}");
        }
    }

    private static void EnsureCleanDirectory(string path)
    {
        if (Directory.Exists(path))
        {
            Directory.Delete(path, true);
        }
        Directory.CreateDirectory(path);
    }

    private static void CopyDirectory(string sourceDir, string destinationDir)
    {
        Directory.CreateDirectory(destinationDir);

        foreach (string file in Directory.GetFiles(sourceDir))
        {
            string dest = Path.Combine(destinationDir, Path.GetFileName(file));
            File.Copy(file, dest, true);
        }

        foreach (string dir in Directory.GetDirectories(sourceDir))
        {
            string dest = Path.Combine(destinationDir, Path.GetFileName(dir));
            CopyDirectory(dir, dest);
        }
    }
}
