using System.IO;
using UnityEditor;
using UnityEngine;
using WhackAMole;

// PrefabBuilder: Generates prefabs for Dumbbell Catcher and Whack-a-Mole
// Updated: Only Banana, Dumbbell, Apple for Good; Pizza, Burger, Cake for Bad!
public static class PrefabBuilder
{
    private const string PrefabsDir = "Assets/Prefabs";
    private const string ItemsDir = "Assets/Prefabs/Items";
    private const string WhackPrefabsDir = "Assets/Prefabs/WhackAMole";
    private const string ScriptableObjectsDir = "Assets/ScriptableObjects/WhackItems";

    [MenuItem("Tools/Gym Games/2. Build Prefabs")]
    public static void BuildAllPrefabs()
    {
        EnsureDirectory(PrefabsDir);
        EnsureDirectory(ItemsDir);
        EnsureDirectory(WhackPrefabsDir);
        EnsureDirectory(ScriptableObjectsDir);

        // --- Game 1: Dumbbell Catcher Prefabs ---
        BuildGymBagPrefab();

        // ONLY Banana, Dumbbell, Apple for Good items!
        BuildItemPrefab("Dumbbell", "dumbbell.png", ItemType.Good, 10, 3.6f);
        BuildItemPrefab("Banana", "banana.png", ItemType.Good, 10, 3.3f);
        BuildItemPrefab("Apple", "apple.png", ItemType.Good, 15, 3.5f);

        // ONLY Pizza, Burger, Cake for Bad items!
        BuildItemPrefab("Burger", "burger.png", ItemType.Bad, 0, 3.5f);
        BuildItemPrefab("Pizza", "pizza.png", ItemType.Bad, 0, 3.7f);
        BuildItemPrefab("Cake", "cake.png", ItemType.Bad, 0, 3.6f);

        // --- Game 2: Whack-a-Mole Gym Edition Assets ---
        BuildWhackItemScriptableObjects();
        BuildWhackHolePrefab();

        AssetDatabase.SaveAssets();
        AssetDatabase.Refresh();
        Debug.Log("[PrefabBuilder] Prefabs & ScriptableObjects configured with Banana, Dumbbell, Apple & Pizza, Burger, Cake!");
    }

    private static void EnsureDirectory(string path)
    {
        if (!Directory.Exists(path))
        {
            Directory.CreateDirectory(path);
        }
    }

    private static void BuildGymBagPrefab()
    {
        string spritePath = "Assets/Sprites/gym_bag.png";
        Sprite sprite = AssetDatabase.LoadAssetAtPath<Sprite>(spritePath);

        GameObject go = new GameObject("GymBag");

        SpriteRenderer sr = go.AddComponent<SpriteRenderer>();
        sr.sprite = sprite;
        sr.sortingOrder = 5;

        BoxCollider2D col = go.AddComponent<BoxCollider2D>();
        col.isTrigger = true;
        col.size = new Vector2(1.4f, 0.6f);
        col.offset = new Vector2(0f, 0f);

        Rigidbody2D rb = go.AddComponent<Rigidbody2D>();
        rb.bodyType = RigidbodyType2D.Kinematic;
        rb.simulated = true;

        BagController controller = go.AddComponent<BagController>();
        controller.keyboardSpeed = 10f;
        controller.minX = -2.4f;
        controller.maxX = 2.4f;
        controller.fixedY = -4.2f;

        string prefabPath = $"{PrefabsDir}/GymBag.prefab";
        PrefabUtility.SaveAsPrefabAsset(go, prefabPath);
        Object.DestroyImmediate(go);
    }

    private static void BuildItemPrefab(string name, string spriteFilename, ItemType type, int points, float speed)
    {
        string spritePath = $"Assets/Sprites/{spriteFilename}";
        Sprite sprite = AssetDatabase.LoadAssetAtPath<Sprite>(spritePath);

        GameObject go = new GameObject(name);

        SpriteRenderer sr = go.AddComponent<SpriteRenderer>();
        sr.sprite = sprite;
        sr.sortingOrder = 3;

        // Compact collider radius matching smaller emoji size
        CircleCollider2D col = go.AddComponent<CircleCollider2D>();
        col.isTrigger = true;
        col.radius = 0.28f;

        Rigidbody2D rb = go.AddComponent<Rigidbody2D>();
        rb.bodyType = RigidbodyType2D.Kinematic;
        rb.simulated = true;

        FallingItem item = go.AddComponent<FallingItem>();
        item.itemName = name;
        item.itemType = type;
        item.pointValue = points;
        item.fallSpeed = speed;
        item.destroyY = -6.5f;

        string prefabPath = $"{ItemsDir}/{name}.prefab";
        PrefabUtility.SaveAsPrefabAsset(go, prefabPath);
        Object.DestroyImmediate(go);
    }

    private static void BuildWhackItemScriptableObjects()
    {
        // Good items
        CreateItemDataAsset("Whack_Dumbbell", "dumbbell.png", WhackItemType.Good, 10);
        CreateItemDataAsset("Whack_Banana", "banana.png", WhackItemType.Good, 10);
        CreateItemDataAsset("Whack_Apple", "apple.png", WhackItemType.Good, 15);

        // Bad items
        CreateItemDataAsset("Whack_Burger", "burger.png", WhackItemType.Bad, 20);
        CreateItemDataAsset("Whack_Pizza", "pizza.png", WhackItemType.Bad, 20);
        CreateItemDataAsset("Whack_Cake", "cake.png", WhackItemType.Bad, 20);
    }

    private static void CreateItemDataAsset(string assetName, string spriteFilename, WhackItemType type, int points)
    {
        string path = $"{ScriptableObjectsDir}/{assetName}.asset";
        ItemData data = AssetDatabase.LoadAssetAtPath<ItemData>(path);
        if (data == null)
        {
            data = ScriptableObject.CreateInstance<ItemData>();
            AssetDatabase.CreateAsset(data, path);
        }

        data.itemName = assetName;
        data.itemSprite = AssetDatabase.LoadAssetAtPath<Sprite>($"Assets/Sprites/{spriteFilename}");
        data.itemType = type;
        data.points = points;
        EditorUtility.SetDirty(data);
    }

    private static void BuildWhackHolePrefab()
    {
        GameObject root = new GameObject("Hole");
        HoleController controller = root.AddComponent<HoleController>();

        GameObject holeBase = new GameObject("HoleBase");
        holeBase.transform.SetParent(root.transform, false);
        SpriteRenderer baseSr = holeBase.AddComponent<SpriteRenderer>();
        baseSr.sprite = AssetDatabase.LoadAssetAtPath<Sprite>("Assets/Sprites/hole.png");
        baseSr.sortingOrder = 1;

        GameObject itemContainer = new GameObject("ItemContainer");
        itemContainer.transform.SetParent(root.transform, false);
        itemContainer.transform.localPosition = new Vector3(0f, -0.3f, 0f);
        itemContainer.transform.localScale = Vector3.zero;

        SpriteRenderer itemSr = itemContainer.AddComponent<SpriteRenderer>();
        itemSr.sortingOrder = 3;

        CircleCollider2D col = itemContainer.AddComponent<CircleCollider2D>();
        col.radius = 0.38f;
        col.isTrigger = false;

        controller.holeRenderer = baseSr;
        controller.itemContainer = itemContainer;
        controller.itemRenderer = itemSr;
        controller.itemCollider = col;

        string prefabPath = $"{WhackPrefabsDir}/Hole.prefab";
        PrefabUtility.SaveAsPrefabAsset(root, prefabPath);
        Object.DestroyImmediate(root);
    }
}
