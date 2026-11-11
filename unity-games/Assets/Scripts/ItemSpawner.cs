using System.Collections;
using System.Collections.Generic;
using UnityEngine;

// ItemSpawner: Screen ke upar se random intervals par Good aur Bad items spawn karta hai
public class ItemSpawner : MonoBehaviour
{
    [Header("Item Prefabs")]
    public GameObject[] goodItemPrefabs; // Dumbbell, Protein Shake, Banana, Chicken, Water Bottle
    public GameObject[] badItemPrefabs;  // Burger, Pizza, Soda, Donut

    [Header("Spawn Position Settings")]
    public float spawnY = 5.8f;          // Screen ke top ka Y coordinate
    public float minX = -2.2f;           // Spawn position ki minimum X limit
    public float maxX = 2.2f;            // Spawn position ki maximum X limit

    [Header("Difficulty Settings")]
    public float baseSpawnInterval = 1.3f; // Shuruat mein kitni der baad naya item aayega
    public float minSpawnInterval = 0.5f;  // Sabse tez spawn speed limit
    public float difficultyRampRate = 0.02f; // Har spawn ke baad interval kitna kam hoga

    private float currentInterval;
    private Coroutine spawnCoroutine;
    private bool isSpawning = false;

    // Spawning shuru karne ke liye
    public void StartSpawning()
    {
        StopSpawning();
        currentInterval = baseSpawnInterval;
        isSpawning = true;
        spawnCoroutine = StartCoroutine(SpawnLoop());
    }

    // Spawning rokne ke liye (Game over ya pause par)
    public void StopSpawning()
    {
        isSpawning = false;
        if (spawnCoroutine != null)
        {
            StopCoroutine(spawnCoroutine);
            spawnCoroutine = null;
        }
    }

    // Screen par maujood saare falling items ko delete karna
    public void ClearAllSpawnedItems()
    {
        FallingItem[] activeItems = FindObjectsByType<FallingItem>(FindObjectsSortMode.None);
        foreach (FallingItem item in activeItems)
        {
            if (item != null)
            {
                Destroy(item.gameObject);
            }
        }
    }

    // Continuous spawn loop with increasing difficulty
    private IEnumerator SpawnLoop()
    {
        // Thoda sa initial delay taaki player ready ho sake
        yield return new WaitForSeconds(0.6f);

        while (isSpawning)
        {
            SpawnRandomItem();

            // Har spawn ke saath difficulty badhao (interval chhota karo)
            currentInterval = Mathf.Max(minSpawnInterval, currentInterval - difficultyRampRate);

            yield return new WaitForSeconds(currentInterval);
        }
    }

    // Ek random item pick karke random position par instantiate karna
    private void SpawnRandomItem()
    {
        // 65% chance Good item ki, 35% chance Bad item ki
        bool spawnGood = Random.value < 0.65f;
        GameObject prefabToSpawn = null;

        if (spawnGood && goodItemPrefabs != null && goodItemPrefabs.Length > 0)
        {
            int index = Random.Range(0, goodItemPrefabs.Length);
            prefabToSpawn = goodItemPrefabs[index];
        }
        else if (!spawnGood && badItemPrefabs != null && badItemPrefabs.Length > 0)
        {
            int index = Random.Range(0, badItemPrefabs.Length);
            prefabToSpawn = badItemPrefabs[index];
        }
        else if (goodItemPrefabs != null && goodItemPrefabs.Length > 0)
        {
            prefabToSpawn = goodItemPrefabs[0];
        }

        if (prefabToSpawn != null)
        {
            float randomX = Random.Range(minX, maxX);
            Vector3 spawnPos = new Vector3(randomX, spawnY, 0f);
            Instantiate(prefabToSpawn, spawnPos, Quaternion.identity);
        }
    }
}
